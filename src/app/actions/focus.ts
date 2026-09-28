"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { checkRecall, type RecallFeedback } from "@/lib/focus-recall";
import { initialReviewStage, nextReviewDate, nextReviewStage, STRONG_RECALL } from "@/lib/focus-review";

/**
 * Server side of the Focus timer (app/(app)/student/focus/page.tsx,
 * components/student/FocusTimer.tsx). Timer settings (durations, sounds, daily goal) stay
 * in the browser; what lives here is the part worth keeping across devices: finished focus
 * blocks, the recall notes written after them, Claude's feedback on those notes, and the
 * spaced-review schedule that brings each topic back.
 */

// Same "each action file owns its own auth helper" convention as app/actions/study-guide.ts.
async function requireStudentUser() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return null;
  return user;
}

type ActionError = { error: string };

const GENERAL_LABEL = "General";
const MAX_TOPIC = 80;
const MAX_NOTE = 1500;
const MAX_TASK = 80;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface FocusCourse {
  id: string;
  /** Short chip label, usually the course code. */
  short: string;
  /** Full label stored on sessions, e.g. "PT 612 — Neuro II". */
  label: string;
}

export interface FocusSessionSummary {
  id: string;
  endedAt: string;
  dateKey: string;
  minutes: number;
  subjectLabel: string;
}

export interface RecallItem {
  id: string;
  topic: string;
  note: string;
  subjectLabel: string;
  syllabusId: string | null;
  feedback: RecallFeedback | null;
  score: number | null;
  reviewCount: number;
  createdAt: string;
  nextReviewAt: string | null;
}

export interface FocusData {
  courses: FocusCourse[];
  /** Finished blocks from the last 8 days, enough for "today" and the 7-day chart in any time zone. */
  sessions: FocusSessionSummary[];
  /** Most recent recall topics, newest first. */
  recalls: RecallItem[];
  /** Topics whose review date has arrived, oldest due first. */
  due: RecallItem[];
}

function courseLabels(s: { courseCode: string; courseName: string }): { short: string; label: string } {
  const code = s.courseCode.trim();
  const name = s.courseName.trim();
  return {
    short: code || name || "Course",
    label: code && name ? `${code} — ${name}` : code || name || "Course",
  };
}

function asFeedback(value: unknown): RecallFeedback | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<RecallFeedback>;
  if (typeof v.score !== "number" || typeof v.verdict !== "string") return null;
  return {
    score: v.score,
    verdict: v.verdict,
    correct: Array.isArray(v.correct) ? v.correct : [],
    missed: Array.isArray(v.missed) ? v.missed : [],
    incorrect: Array.isArray(v.incorrect) ? v.incorrect : [],
    keyPoints: Array.isArray(v.keyPoints) ? v.keyPoints : [],
  };
}

type RecallRow = {
  id: string;
  topic: string;
  note: string;
  subjectLabel: string;
  syllabusId: string | null;
  feedback: unknown;
  score: number | null;
  reviewCount: number;
  createdAt: Date;
  nextReviewAt: Date | null;
};

function toRecallItem(r: RecallRow): RecallItem {
  return {
    id: r.id,
    topic: r.topic,
    note: r.note,
    subjectLabel: r.subjectLabel,
    syllabusId: r.syllabusId,
    feedback: asFeedback(r.feedback),
    score: r.score,
    reviewCount: r.reviewCount,
    createdAt: r.createdAt.toISOString(),
    nextReviewAt: r.nextReviewAt ? r.nextReviewAt.toISOString() : null,
  };
}

/** Everything the Focus page needs on load. Returns null for a reader without student access. */
export async function getFocusData(): Promise<FocusData | null> {
  const user = await requireStudentUser();
  if (!user) return null;
  const now = new Date();

  const [syllabi, sessions, recalls, due] = await Promise.all([
    prisma.syllabus.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: "desc" },
      select: { id: true, courseCode: true, courseName: true },
    }),
    prisma.focusSession.findMany({
      where: { userId: user.id, endedAt: { gte: new Date(now.getTime() - 8 * DAY_MS) } },
      orderBy: { endedAt: "asc" },
      select: { id: true, endedAt: true, dateKey: true, minutes: true, subjectLabel: true },
    }),
    prisma.recallEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.recallEntry.findMany({
      where: { userId: user.id, nextReviewAt: { lte: now } },
      orderBy: { nextReviewAt: "asc" },
      take: 20,
    }),
  ]);

  return {
    courses: syllabi.map((s) => ({ id: s.id, ...courseLabels(s) })),
    sessions: sessions.map((s) => ({ ...s, endedAt: s.endedAt.toISOString() })),
    recalls: recalls.map(toRecallItem),
    due: due.map(toRecallItem),
  };
}

/**
 * Records one finished focus block. The browser calls this when the countdown reaches zero,
 * so endedAt is the server's clock at that moment. A block can't finish sooner after the
 * previous one than its own length, which keeps a scripted client from logging hundreds of
 * blocks (and, through submitRecalls, hundreds of recall checks) in a minute.
 */
export async function saveFocusBlock(input: {
  syllabusId: string | null;
  task: string;
  minutes: number;
  dateKey: string;
}): Promise<ActionError | { success: true; session: FocusSessionSummary }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const minutes = Math.round(Number(input.minutes));
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) return { error: "Focus blocks must be between 1 and 240 minutes." };
  if (!DATE_KEY.test(input.dateKey)) return { error: "Invalid date." };

  let subjectLabel = GENERAL_LABEL;
  let syllabusId: string | null = null;
  if (input.syllabusId) {
    const syllabus = await prisma.syllabus.findUnique({ where: { id: input.syllabusId } });
    if (!syllabus || syllabus.userId !== user.id) return { error: "Course not found." };
    syllabusId = syllabus.id;
    subjectLabel = courseLabels(syllabus).label;
  }

  const now = new Date();
  const previous = await prisma.focusSession.findFirst({
    where: { userId: user.id },
    orderBy: { endedAt: "desc" },
    select: { endedAt: true },
  });
  // One minute of slack for timer drift between the browser and the server.
  if (previous && now.getTime() - previous.endedAt.getTime() < (minutes - 1) * 60 * 1000) {
    return { error: "That block finished sooner than its length allows, so it wasn't saved." };
  }

  const task = input.task.trim().slice(0, MAX_TASK) || null;
  const session = await prisma.focusSession.create({
    data: { userId: user.id, syllabusId, subjectLabel, task, minutes, dateKey: input.dateKey, endedAt: now },
    select: { id: true, endedAt: true, dateKey: true, minutes: true, subjectLabel: true },
  });
  return { success: true, session: { ...session, endedAt: session.endedAt.toISOString() } };
}

async function courseCardsFor(userId: string, syllabusId: string | null) {
  if (!syllabusId) return [];
  return prisma.studyCard.findMany({
    where: { userId, syllabusId },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: { front: true, back: true },
  });
}

function cardFront(topic: string) {
  return `Recall: ${topic}`;
}

function cardBack(feedback: RecallFeedback) {
  return feedback.keyPoints.join(" · ");
}

/**
 * Saves the 1 to 3 topics a student recalled after a focus block, asks Claude to check each
 * written recall, schedules each topic's first review, and, for a block tied to a course,
 * adds each checked topic to that course's Self-Quiz deck (front: the topic, back: Claude's
 * key points). One submission per block: a second call for the same block is rejected.
 */
export async function submitRecalls(input: {
  sessionId: string;
  items: { topic: string; note: string }[];
}): Promise<ActionError | { success: true; recalls: RecallItem[] }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const session = await prisma.focusSession.findUnique({
    where: { id: input.sessionId },
    include: { _count: { select: { recalls: true } } },
  });
  if (!session || session.userId !== user.id) return { error: "Focus block not found." };
  if (session._count.recalls > 0) return { error: "Recall for this block was already saved." };

  const items = input.items
    .map((i) => ({ topic: i.topic.trim().slice(0, MAX_TOPIC), note: i.note.trim().slice(0, MAX_NOTE) }))
    .filter((i) => i.topic)
    .slice(0, 3);
  if (items.length === 0) return { error: "Name at least one topic." };

  const cards = await courseCardsFor(user.id, session.syllabusId);
  const checks = await Promise.all(
    items.map((i) =>
      i.note ? checkRecall({ topic: i.topic, note: i.note, subjectLabel: session.subjectLabel, courseCards: cards }) : Promise.resolve(null)
    )
  );

  const now = new Date();
  const saved: RecallItem[] = [];
  for (let n = 0; n < items.length; n++) {
    const { topic, note } = items[n];
    const feedback = checks[n];
    const score = feedback ? feedback.score : null;
    const stage = initialReviewStage(score);

    let studyCardId: string | null = null;
    if (session.syllabusId && feedback && feedback.keyPoints.length > 0) {
      const card = await prisma.studyCard.create({
        data: {
          userId: user.id,
          syllabusId: session.syllabusId,
          front: cardFront(topic),
          back: cardBack(feedback),
          reviewCount: 1,
          lastResult: feedback.score >= STRONG_RECALL ? "correct" : "incorrect",
        },
      });
      studyCardId = card.id;
    }

    const row = await prisma.recallEntry.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        syllabusId: session.syllabusId,
        subjectLabel: session.subjectLabel,
        topic,
        note,
        feedback: feedback ?? undefined,
        score,
        reviewStage: stage,
        nextReviewAt: nextReviewDate(now, stage),
        studyCardId,
      },
    });
    saved.push(toRecallItem(row));
  }

  if (session.syllabusId) revalidateCourse(session.syllabusId);
  return { success: true, recalls: saved };
}

/**
 * One spaced review of a topic whose review date has arrived: the student writes the topic
 * from memory again, Claude checks it, and the topic moves along the schedule in
 * lib/focus-review.ts. Only due topics can be reviewed, which also keeps this from being a
 * free-form way to run unlimited checks.
 */
export async function reviewRecall(input: { recallId: string; note: string }): Promise<ActionError | { success: true; recall: RecallItem }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const entry = await prisma.recallEntry.findUnique({ where: { id: input.recallId } });
  if (!entry || entry.userId !== user.id) return { error: "Topic not found." };
  const now = new Date();
  if (!entry.nextReviewAt || entry.nextReviewAt.getTime() > now.getTime()) return { error: "This topic isn't due for review yet." };

  const note = input.note.trim().slice(0, MAX_NOTE);
  if (!note) return { error: "Write what you remember before checking." };

  const cards = await courseCardsFor(user.id, entry.syllabusId);
  const feedback = await checkRecall({ topic: entry.topic, note, subjectLabel: entry.subjectLabel, courseCards: cards });
  const score = feedback ? feedback.score : null;
  // A failed check keeps the topic where it was and brings it back tomorrow, rather than
  // punishing the student for an outage.
  const stage = feedback ? nextReviewStage(entry.reviewStage, score) : entry.reviewStage;
  const nextAt = feedback ? nextReviewDate(now, stage) : nextReviewDate(now, 0);

  const row = await prisma.recallEntry.update({
    where: { id: entry.id },
    data: {
      note,
      feedback: feedback ?? undefined,
      score: feedback ? score : entry.score,
      reviewStage: stage,
      reviewCount: { increment: 1 },
      nextReviewAt: nextAt,
      lastReviewedAt: now,
    },
  });

  if (feedback && entry.studyCardId) {
    // The linked Self-Quiz card may have been deleted from the Study Guide; updateMany is a
    // no-op in that case instead of throwing.
    await prisma.studyCard.updateMany({
      where: { id: entry.studyCardId, userId: user.id },
      data: {
        back: cardBack(feedback) || undefined,
        lastResult: feedback.score >= STRONG_RECALL ? "correct" : "incorrect",
        reviewCount: { increment: 1 },
      },
    });
    if (entry.syllabusId) revalidateCourse(entry.syllabusId);
  }

  return { success: true, recall: toRecallItem(row) };
}

/** Removes a topic from the review queue and recall history. Leaves any Self-Quiz card in place. */
export async function deleteRecall(recallId: string): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  const entry = await prisma.recallEntry.findUnique({ where: { id: recallId }, select: { userId: true } });
  if (!entry || entry.userId !== user.id) return { error: "Topic not found." };
  await prisma.recallEntry.delete({ where: { id: recallId } });
  return { success: true };
}

function revalidateCourse(syllabusId: string) {
  revalidatePath("/student/study-guide");
  revalidatePath(`/student/study-guide/${syllabusId}/flashcards`);
  revalidatePath(`/student/study-guide/${syllabusId}/quiz`);
}
