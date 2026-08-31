"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";

// Same "each action file owns its own auth/ownership helpers" convention as
// app/actions/syllabus.ts, rather than importing its private helpers.
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

async function requireOwnedStudyCard(userId: string, cardId: string) {
  const card = await prisma.studyCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== userId) return null;
  return card;
}

type ActionError = { error: string };

export interface StudyCardData {
  id: string;
  front: string;
  back: string;
  reviewCount: number;
  lastResult: string | null;
}

export interface StudyGuideCourse {
  id: string;
  courseCode: string;
  courseName: string;
  studyNotes: string | null;
  cards: StudyCardData[];
}

/** Powers /student/study-guide (see app/(app)/student/study-guide/page.tsx and
 *  components/student/StudyGuideManager.tsx) — one section per uploaded/added course (see
 *  Syllabus in prisma/schema.prisma), each carrying its own flashcards and Visual Aids note.
 *  A course with zero study cards and no note still gets a section — the study guide is
 *  organized around "your classes" (from /student/assignments), not around which classes
 *  happen to already have study content. */
export async function getStudyGuideData(): Promise<StudyGuideCourse[]> {
  const user = await requireStudentUser();
  if (!user) return [];

  const syllabi = await prisma.syllabus.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
    include: { studyCards: { orderBy: { createdAt: "asc" } } },
  });

  return syllabi.map((s) => ({
    id: s.id,
    courseCode: s.courseCode,
    courseName: s.courseName,
    studyNotes: s.studyNotes,
    cards: s.studyCards.map((c) => ({ id: c.id, front: c.front, back: c.back, reviewCount: c.reviewCount, lastResult: c.lastResult })),
  }));
}

export async function createStudyCard(
  syllabusId: string,
  front: string,
  back: string
): Promise<ActionError | { success: true; card: StudyCardData }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!front.trim() || !back.trim()) return { error: "Both sides of the card are required." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  const card = await prisma.studyCard.create({
    data: { userId: user.id, syllabusId, front: front.trim(), back: back.trim() },
  });

  revalidatePath("/student/study-guide");
  return { success: true, card: { id: card.id, front: card.front, back: card.back, reviewCount: card.reviewCount, lastResult: card.lastResult } };
}

export async function updateStudyCard(cardId: string, front: string, back: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!front.trim() || !back.trim()) return { error: "Both sides of the card are required." };

  const card = await requireOwnedStudyCard(user.id, cardId);
  if (!card) return { error: "Card not found." };

  await prisma.studyCard.update({ where: { id: cardId }, data: { front: front.trim(), back: back.trim() } });
  revalidatePath("/student/study-guide");
  return { success: true };
}

export async function deleteStudyCard(cardId: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const card = await requireOwnedStudyCard(user.id, cardId);
  if (!card) return { error: "Card not found." };

  await prisma.studyCard.delete({ where: { id: cardId } });
  revalidatePath("/student/study-guide");
  return { success: true };
}

/** Self-Quiz's grading action — "Got it" / "Missed it" on a revealed card (see
 *  StudyGuideManager.tsx's quiz session). Not revalidated: the quiz session's ordering and
 *  running score live entirely in client state for that round, so there's nothing server-
 *  rendered that needs to reflect this immediately — the next full page load (or a Flashcards
 *  tab visit) is what actually benefits from the updated lastResult/reviewCount, same as any
 *  other "record progress, don't re-render around it" mutation in this app. */
export async function recordStudyCardResult(cardId: string, correct: boolean): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const card = await requireOwnedStudyCard(user.id, cardId);
  if (!card) return { error: "Card not found." };

  await prisma.studyCard.update({
    where: { id: cardId },
    data: { lastResult: correct ? "correct" : "incorrect", reviewCount: { increment: 1 } },
  });
  return { success: true };
}

export async function updateStudyNotes(syllabusId: string, content: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  await prisma.syllabus.update({ where: { id: syllabusId }, data: { studyNotes: content.trim() || null } });
  revalidatePath("/student/study-guide");
  return { success: true };
}
