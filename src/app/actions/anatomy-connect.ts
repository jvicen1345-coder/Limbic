"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getTimeZone } from "@/lib/user-time-zone";
import { recordBoardActivity } from "@/lib/board-activity";
import {
  getTodaysPuzzle,
  getDateKey,
  validateSolution,
  correctAnswerFor,
  type AnatomyConnectField,
  type AnatomyConnectionInput,
  type AnatomyConnectValidation,
} from "@/lib/anatomy-connect-logic";

// Every action below derives the reader from the session, never a client-supplied id —
// same convention as app/actions/differential.ts and every other action in this app.

export interface AnatomyConnectResultView {
  attempts: number;
  timeSeconds: number;
}

/** Non-null only once the signed-in reader has actually solved today's puzzle — a row is
 *  only ever written on a solve (see submitAnatomyConnectAttempt below), so unlike a "wrong
 *  final guess" game there's no separate finished-but-failed state to distinguish here. */
export async function getTodaysAnatomyConnectResult(): Promise<AnatomyConnectResultView | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const row = await prisma.anatomyConnectResult.findUnique({
    where: { userId_dateKey: { userId: user.id, dateKey: getDateKey(await getTimeZone(user)) } },
  });
  if (!row || !row.solved) return null;
  return { attempts: row.attempts, timeSeconds: row.timeSeconds };
}

export interface SubmitAnatomyConnectAttemptResult extends AnatomyConnectValidation {
  ok: boolean;
}

/** Called on every Submit click, not just the winning one — the client only ever holds
 *  the four shuffled label columns (see app/games/anatomy-connect/page.tsx), never the
 *  real muscle-to-nerve/action/region answer key, so a server round trip is the only way
 *  to grade a guess. Only persists a row once the puzzle is actually solved; a wrong
 *  attempt is graded and returned but never written to the database, so a reader who
 *  refreshes mid-attempt just gets a fresh shuffle rather than a stale "already tried"
 *  state (see getTodaysAnatomyConnectResult above). */
export async function submitAnatomyConnectAttempt(
  userConnections: AnatomyConnectionInput[],
  attempts: number,
  timeSeconds: number
): Promise<SubmitAnatomyConnectAttemptResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, results: [], solved: false };

  const timeZone = await getTimeZone(user);
  const todaysPuzzle = getTodaysPuzzle(timeZone);
  const validation = validateSolution(todaysPuzzle.id, userConnections);

  if (validation.solved) {
    const dateKey = getDateKey(timeZone);
    await Promise.all([
      prisma.anatomyConnectResult.upsert({
        where: { userId_dateKey: { userId: user.id, dateKey } },
        create: { userId: user.id, dateKey, solved: true, attempts, timeSeconds },
        update: { solved: true, attempts, timeSeconds },
      }),
      // See app/actions/differential.ts's identical call for why Daily Games count toward
      // the Boards streak now.
      recordBoardActivity(user.id, dateKey, timeZone),
    ]);
    revalidatePath("/boards");
    revalidatePath("/student");
  }

  return { ok: true, ...validation };
}

/** Grades a single mobile multiple-choice answer and hands back the right answer alongside
 *  the verdict, since the mobile flow shows both the moment the reader picks.
 *
 *  This exists because the client never holds the answer key (see the page's comment): the
 *  four label columns it does hold say nothing about which nerve belongs to which muscle. So
 *  every per-question verdict is a server round trip, the same way Submit already is. Note
 *  the reader has, by calling this, already committed to an answer for that question — the
 *  correctAnswer it returns is not a leak of anything still in play. */
export async function gradeAnatomyConnectAnswer(
  muscle: string,
  field: AnatomyConnectField,
  answer: string
): Promise<{ ok: boolean; correct: boolean; correctAnswer: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, correct: false, correctAnswer: "" };

  const puzzle = getTodaysPuzzle(await getTimeZone(user));
  const correctAnswer = correctAnswerFor(puzzle, muscle, field);
  if (correctAnswer === null) return { ok: false, correct: false, correctAnswer: "" };

  return { ok: true, correct: correctAnswer === answer, correctAnswer };
}

/** Reveals one correct answer as a hint. The reader pays 30 seconds of clock for it (applied
 *  client-side, then submitted as part of timeSeconds), and the two-hint cap is enforced in
 *  component state per the spec — deliberately not a server-side limit, so this is a
 *  self-imposed cost rather than a security boundary. That's the right shape for a
 *  single-player daily puzzle: someone determined to call this repeatedly is only cheating
 *  their own stats, and no other reader's score depends on it. */
export async function revealAnatomyConnectHint(
  muscle: string,
  field: AnatomyConnectField
): Promise<{ ok: boolean; answer: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, answer: "" };

  const puzzle = getTodaysPuzzle(await getTimeZone(user));
  const answer = correctAnswerFor(puzzle, muscle, field);
  if (answer === null) return { ok: false, answer: "" };

  return { ok: true, answer };
}

export interface AnatomyConnectStats {
  totalSolved: number;
  solveRate: number;
  averageTimeSeconds: number;
}

const DAY_MS = 86400000;

function dateKeyToUtcMs(dateKey: string): number {
  return new Date(dateKey + "T00:00:00Z").getTime();
}

export async function getAnatomyConnectStats(): Promise<AnatomyConnectStats> {
  const user = await getCurrentUser();
  if (!user) return { totalSolved: 0, solveRate: 0, averageTimeSeconds: 0 };

  const rows = await prisma.anatomyConnectResult.findMany({
    where: { userId: user.id, solved: true },
    select: { dateKey: true, timeSeconds: true },
  });

  const totalSolved = rows.length;
  const averageTimeSeconds = totalSolved > 0 ? rows.reduce((sum, r) => sum + r.timeSeconds, 0) / totalSolved : 0;

  // "Solve rate" needs a denominator, but there's nothing recorded for a day the reader
  // opened the puzzle and never finished (see the no-partial-persistence note above) — so
  // this reads it as "of every calendar day since your first solve, how many did you
  // solve," the same day-based engagement idea as lib/games.ts's weekly activity bar,
  // just over the reader's whole history instead of the last 7 days.
  let solveRate = 0;
  if (totalSolved > 0) {
    const firstMs = Math.min(...rows.map((r) => dateKeyToUtcMs(r.dateKey)));
    const todayMs = dateKeyToUtcMs(getDateKey(await getTimeZone(user)));
    const daysSinceFirst = Math.round((todayMs - firstMs) / DAY_MS) + 1;
    solveRate = Math.round((totalSolved / daysSinceFirst) * 100);
  }

  return { totalSolved, solveRate, averageTimeSeconds };
}
