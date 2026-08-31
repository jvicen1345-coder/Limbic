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

/** Every page for one course's Study Guide content shares this revalidation set — the index
 *  list (card/notes counts shown there) plus that course's own three content pages. */
function revalidateCourse(syllabusId: string) {
  revalidatePath("/student/study-guide");
  revalidatePath(`/student/study-guide/${syllabusId}/flashcards`);
  revalidatePath(`/student/study-guide/${syllabusId}/quiz`);
  revalidatePath(`/student/study-guide/${syllabusId}/notes`);
}

type ActionError = { error: string };

export interface StudyCardData {
  id: string;
  front: string;
  back: string;
  reviewCount: number;
  lastResult: string | null;
}

/** One row on the Study Guide index (see app/(app)/student/study-guide/page.tsx) — just
 *  enough to render a course card and its three content links, without pulling every card's
 *  front/back or the full notes text for a page that doesn't display them. */
export interface StudyGuideCourseSummary {
  id: string;
  courseCode: string;
  courseName: string;
  cardCount: number;
  hasNotes: boolean;
}

export interface StudyGuideCourse {
  id: string;
  courseCode: string;
  courseName: string;
  studyNotes: string | null;
  cards: StudyCardData[];
}

/** Powers the Study Guide index (see app/(app)/student/study-guide/page.tsx) — one card per
 *  uploaded/added course (see Syllabus in prisma/schema.prisma), each linking to its own
 *  Flashcards/Self-Quiz/Visual Aids page. A course with zero study cards and no note still
 *  gets a card — the study guide is organized around "your classes" (from
 *  /student/assignments), not around which classes happen to already have study content. */
export async function getStudyGuideCourses(): Promise<StudyGuideCourseSummary[]> {
  const user = await requireStudentUser();
  if (!user) return [];

  const syllabi = await prisma.syllabus.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { studyCards: true } } },
  });

  return syllabi.map((s) => ({
    id: s.id,
    courseCode: s.courseCode,
    courseName: s.courseName,
    cardCount: s._count.studyCards,
    hasNotes: Boolean(s.studyNotes),
  }));
}

/** Powers each of a course's three content pages (see
 *  app/(app)/student/study-guide/[syllabusId]/flashcards|quiz|notes/page.tsx) — ownership-
 *  checked the same way every other per-resource fetch in this app is, so a stray/guessed id
 *  from another account's course never leaks its cards or notes. Returns null for a syllabus
 *  that doesn't exist or isn't this reader's, which each page turns into a 404. */
export async function getStudyGuideCourse(syllabusId: string): Promise<StudyGuideCourse | null> {
  const user = await requireStudentUser();
  if (!user) return null;

  const syllabus = await prisma.syllabus.findUnique({
    where: { id: syllabusId },
    include: { studyCards: { orderBy: { createdAt: "asc" } } },
  });
  if (!syllabus || syllabus.userId !== user.id) return null;

  return {
    id: syllabus.id,
    courseCode: syllabus.courseCode,
    courseName: syllabus.courseName,
    studyNotes: syllabus.studyNotes,
    cards: syllabus.studyCards.map((c) => ({ id: c.id, front: c.front, back: c.back, reviewCount: c.reviewCount, lastResult: c.lastResult })),
  };
}

/** Edit on the Flashcards page — see that page's own doc comment for why there's no matching
 *  "create" action here anymore: new cards only come from Study Guide Creator
 *  (app/actions/slide-breakdown.ts) now. */
export async function updateStudyCard(cardId: string, front: string, back: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!front.trim() || !back.trim()) return { error: "Both sides of the card are required." };

  const card = await requireOwnedStudyCard(user.id, cardId);
  if (!card) return { error: "Card not found." };

  await prisma.studyCard.update({ where: { id: cardId }, data: { front: front.trim(), back: back.trim() } });
  revalidateCourse(card.syllabusId);
  return { success: true };
}

export async function deleteStudyCard(cardId: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const card = await requireOwnedStudyCard(user.id, cardId);
  if (!card) return { error: "Card not found." };

  await prisma.studyCard.delete({ where: { id: cardId } });
  revalidateCourse(card.syllabusId);
  return { success: true };
}

/** Self-Quiz's grading action — "Got it" / "Missed it" on a revealed card (see
 *  components/student/StudyGuideQuiz.tsx's quiz session). Not revalidated: the quiz
 *  session's ordering and running score live entirely in client state for that round, so
 *  there's nothing server-rendered that needs to reflect this immediately — the next full
 *  page load (or a Flashcards page visit) is what actually benefits from the updated
 *  lastResult/reviewCount, same as any other "record progress, don't re-render around it"
 *  mutation in this app. */
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

/** Save on the Notes page — see that page's own doc comment: only available once a note
 *  already exists (from Study Guide Creator or a previous save here), not for typing one
 *  from scratch. */
export async function updateStudyNotes(syllabusId: string, content: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Course not found." };

  await prisma.syllabus.update({ where: { id: syllabusId }, data: { studyNotes: content.trim() || null } });
  revalidateCourse(syllabusId);
  return { success: true };
}
