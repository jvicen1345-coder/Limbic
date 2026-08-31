"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { parseSlideText } from "@/lib/slide-parser";

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

/** Powers the real "Slide Breakdown" flow (see app/(app)/student/slides/page.tsx,
 *  components/student/SlideBreakdownManager.tsx) — was a "Coming soon" placeholder before.
 *  Pasted lecture slide text runs through Limbic AI (see lib/slide-parser.ts) and both
 *  populates the picked course's Study Guide section at once: every extracted flashcard
 *  becomes a StudyCard (shared by the Flashcards and Self-Quiz tabs — see
 *  app/actions/study-guide.ts), and the extracted summary is appended to that course's
 *  existing Syllabus.studyNotes (Visual Aids tab), separated by a blank line rather than
 *  overwriting it — a student uploading a second lecture's slides for the same course
 *  shouldn't lose the first lecture's notes. */
export async function generateSlideBreakdown(
  syllabusId: string,
  rawText: string
): Promise<ActionError | { success: true; cardsCreated: number; notesUpdated: boolean }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!rawText.trim()) return { error: "Paste your slide text first." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  const parsed = await parseSlideText(rawText, syllabus.courseCode, syllabus.courseName);
  if (parsed === null) {
    return { error: "Could not read those slides. Please try again, or paste a smaller section." };
  }

  const notesUpdated = parsed.notesSummary.length > 0;
  await prisma.$transaction([
    ...(parsed.flashcards.length > 0
      ? [
          prisma.studyCard.createMany({
            data: parsed.flashcards.map((f) => ({ userId: user.id, syllabusId, front: f.front, back: f.back })),
          }),
        ]
      : []),
    ...(notesUpdated
      ? [
          prisma.syllabus.update({
            where: { id: syllabusId },
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
