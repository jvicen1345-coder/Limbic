"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { parseSlideText, type ParsedSlideBreakdown } from "@/lib/slide-parser";
import { extractPdfText, PdfTextError, MAX_PDF_BYTES } from "@/lib/pdf-text";
import type { Syllabus } from "@/generated/prisma/client";

// Same "each action file owns its own auth/ownership helpers" convention as
// app/actions/syllabus.ts and app/actions/study-guide.ts.
async function requireStudentUser() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return null;
  return user;
}

async function requireOwnedSyllabus(userId: string, syllabusId: string) {
  const syllabus = await prisma.syllabus.findUnique({ where: { id: syllabusId } });
  if (!syllabus || syllabus.userId !== userId) return null;
  return syllabus;
}

type ActionError = { error: string };
type SlideBreakdownResult = ActionError | { success: true; cardsCreated: number; notesUpdated: boolean };

/** Shared by both entry points below — writes an already-parsed breakdown into the picked
 *  course's Study Guide section: every extracted flashcard becomes a StudyCard (shared by
 *  the Flashcards and Self-Quiz tabs — see app/actions/study-guide.ts), and the extracted
 *  summary is appended to that course's existing Syllabus.studyNotes (Visual Aids tab),
 *  separated by a blank line rather than overwriting it — uploading a second lecture's
 *  slides for the same course shouldn't lose the first lecture's notes. */
async function writeSlideBreakdown(userId: string, syllabus: Syllabus, parsed: ParsedSlideBreakdown): Promise<SlideBreakdownResult> {
  const notesUpdated = parsed.notesSummary.length > 0;
  await prisma.$transaction([
    ...(parsed.flashcards.length > 0
      ? [
          prisma.studyCard.createMany({
            data: parsed.flashcards.map((f) => ({ userId, syllabusId: syllabus.id, front: f.front, back: f.back })),
          }),
        ]
      : []),
    ...(notesUpdated
      ? [
          prisma.syllabus.update({
            where: { id: syllabus.id },
            data: {
              studyNotes: syllabus.studyNotes ? `${syllabus.studyNotes}\n\n${parsed.notesSummary}` : parsed.notesSummary,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath("/student/study-guide");
  return { success: true, cardsCreated: parsed.flashcards.length, notesUpdated };
}

/** Powers the "paste slide text" path on /student/slides (see
 *  components/student/SlideBreakdownManager.tsx) — the fallback for a PDF with no
 *  selectable text (scanned slides, no OCR in this app) or when a reader has the text
 *  copied some other way. See generateSlideBreakdownFromPdf below for the primary,
 *  PDF-upload path. */
export async function generateSlideBreakdown(syllabusId: string, rawText: string): Promise<SlideBreakdownResult> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!rawText.trim()) return { error: "Paste your slide text first." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  const parsed = await parseSlideText(rawText, syllabus.courseCode, syllabus.courseName);
  if (parsed === null) {
    return { error: "Could not read those slides. Please try again, or paste a smaller section." };
  }

  return writeSlideBreakdown(user.id, syllabus, parsed);
}

/** Primary entry point for /student/slides — a real PDF upload (see
 *  components/student/SlideBreakdownManager.tsx), same FormData/File shape as
 *  importAppleHealthExportAction in app/actions/fitness-import.ts. Extracts the PDF's text
 *  (see lib/pdf-text.ts, which has no Node-native/canvas dependency so it runs in a Vercel
 *  serverless function) and runs it through the same Limbic AI extraction and Study Guide
 *  write as the paste-text path above. */
export async function generateSlideBreakdownFromPdf(formData: FormData): Promise<SlideBreakdownResult> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabusId = formData.get("syllabusId");
  if (typeof syllabusId !== "string" || !syllabusId) return { error: "Pick a course first." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file received." };
  if (file.size === 0) return { error: "That file is empty." };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Please upload a PDF file." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { error: `That PDF is larger than ${Math.round(MAX_PDF_BYTES / (1024 * 1024))} MB.` };
  }

  let rawText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    rawText = await extractPdfText(buffer);
  } catch (err) {
    if (err instanceof PdfTextError) return { error: err.message };
    console.error("[slide-breakdown] PDF read failed", err);
    return { error: "Couldn't read that PDF." };
  }

  const parsed = await parseSlideText(rawText, syllabus.courseCode, syllabus.courseName);
  if (parsed === null) {
    return { error: "Could not extract flashcards or notes from that PDF's text. Try a different lecture, or paste the text instead." };
  }

  return writeSlideBreakdown(user.id, syllabus, parsed);
}
