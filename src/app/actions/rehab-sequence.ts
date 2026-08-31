"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getTimeZone } from "@/lib/user-time-zone";
import { getTodaysRehabCase, getRehabCaseForDate, getDateKey, validateSequence } from "@/lib/rehab-sequence-logic";

// Every action below derives the reader from the session, never a client-supplied id —
// same convention as the rest of this app's actions.

export interface RehabSequenceResultView {
  score: number;
  correct: boolean;
  sequenceGiven: string[];
}

/** Today's saved result for the signed-in reader, if today's case is already finished.
 *  Score isn't its own column on RehabSequenceResult — it's re-derived from the stored
 *  `sequenceGiven` against today's real order, same recomputation getRehabStats below does
 *  for every past day. */
export async function getTodaysRehabResult(): Promise<RehabSequenceResultView | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const timeZone = await getTimeZone(user);
  const row = await prisma.rehabSequenceResult.findUnique({
    where: { userId_dateKey: { userId: user.id, dateKey: getDateKey(timeZone) } },
  });
  if (!row) return null;

  const sequenceGiven = row.sequenceGiven as string[];
  const { score } = validateSequence(getTodaysRehabCase(timeZone).id, sequenceGiven);
  return { score, correct: row.correct, sequenceGiven };
}

export interface SubmitRehabSequenceResult {
  ok: boolean;
  score: number;
  correct: boolean;
  correctPositions: boolean[];
  correctSequence: string[];
  rationale: string[];
}

/** The page's Submit button is "always active" and can be pressed once — this both grades
 *  and persists in the same call, since unlike Differential/Anatomy Connect there's no
 *  retry loop here (see app/games/rehab-sequence/page.tsx: once submitted, the correct
 *  sequence and rationale are revealed, so a resubmit would have nothing left to test). */
export async function submitRehabSequence(sequenceGiven: string[]): Promise<SubmitRehabSequenceResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, score: 0, correct: false, correctPositions: [], correctSequence: [], rationale: [] };

  const timeZone = await getTimeZone(user);
  const todaysCase = getTodaysRehabCase(timeZone);
  const validation = validateSequence(todaysCase.id, sequenceGiven);

  await prisma.rehabSequenceResult.upsert({
    where: { userId_dateKey: { userId: user.id, dateKey: getDateKey(timeZone) } },
    create: { userId: user.id, dateKey: getDateKey(timeZone), correct: validation.correct, attempts: 1, sequenceGiven },
    update: { correct: validation.correct, attempts: 1, sequenceGiven },
  });

  return {
    ok: true,
    score: validation.score,
    correct: validation.correct,
    correctPositions: validation.correctPositions,
    correctSequence: todaysCase.interventions,
    rationale: todaysCase.rationale,
  };
}

export interface RehabStats {
  totalPlayed: number;
  perfectSolves: number;
  averageScore: number;
}

export async function getRehabStats(): Promise<RehabStats> {
  const user = await getCurrentUser();
  if (!user) return { totalPlayed: 0, perfectSolves: 0, averageScore: 0 };

  const rows = await prisma.rehabSequenceResult.findMany({
    where: { userId: user.id },
    select: { correct: true, sequenceGiven: true, dateKey: true },
  });

  const totalPlayed = rows.length;
  const perfectSolves = rows.filter((r) => r.correct).length;
  const scores = rows.map((r) => validateSequence(getRehabCaseForDate(r.dateKey).id, r.sequenceGiven as string[]).score);
  const averageScore = totalPlayed > 0 ? scores.reduce((sum, s) => sum + s, 0) / totalPlayed : 0;

  return { totalPlayed, perfectSolves, averageScore };
}
