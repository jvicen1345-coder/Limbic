"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getTimeZone } from "@/lib/user-time-zone";
import { todayDateKey } from "@/lib/board-content";

/** YYYY-MM-DD for "today" — re-exported here so callers of this file don't need to also
 *  import lib/board-content.ts just for the date the rest of these actions key off of, nor
 *  resolve the reader's own time zone themselves (see lib/user-time-zone.ts). */
export async function getTodayDateKey(): Promise<string> {
  return todayDateKey(await getTimeZone(await getCurrentUser()));
}

export interface SpecialtyAnswerView {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

/** Every answer the signed-in reader has already submitted today on `specialty`'s Board
 *  Connections tab (see components/specialty/SpecialtyBoardConnections.tsx) — scoped to
 *  today's dateKey, so yesterday's rows never come back. That scoping is the entire daily
 *  reset: once the date rolls over, a (userId, specialty, questionIndex, dateKey) row for
 *  the new day simply doesn't exist yet, so the question renders unanswered again with no
 *  cron or cleanup needed. Old rows are left in place for future analytics (see
 *  SpecialtyQuestionAnswer in schema.prisma). Deliberately takes no userId parameter — the
 *  reader comes from the session, not a client-supplied id (same reasoning as every other
 *  action in this app, e.g. requireCalcAccess in app/actions/calculator-profiles.ts). */
export async function getSpecialtyAnswers(specialty: string): Promise<SpecialtyAnswerView[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.specialtyQuestionAnswer.findMany({
    where: { userId: user.id, specialty, dateKey: await getTodayDateKey() },
    select: { questionIndex: true, selectedAnswer: true, isCorrect: true },
  });
}

export interface SaveSpecialtyAnswerResult {
  ok: boolean;
  error?: string;
}

/** Called the instant a reader picks an answer on the Board Connections tab — there's no
 *  save button, selection itself is the save (see SpecialtyBoardConnections.tsx). Upserts
 *  on the (userId, specialty, questionIndex, dateKey) unique key, though in practice the
 *  client disables a question as soon as it's answered, so this only ever runs once per
 *  question per day per reader. */
export async function saveSpecialtyAnswer(
  specialty: string,
  questionIndex: number,
  selectedAnswer: string,
  isCorrect: boolean
): Promise<SaveSpecialtyAnswerResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const dateKey = await getTodayDateKey();
  await prisma.specialtyQuestionAnswer.upsert({
    where: { userId_specialty_questionIndex_dateKey: { userId: user.id, specialty, questionIndex, dateKey } },
    create: { userId: user.id, specialty, questionIndex, selectedAnswer, isCorrect, dateKey },
    update: { selectedAnswer, isCorrect },
  });
  return { ok: true };
}
