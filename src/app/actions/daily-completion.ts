"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { recordBoardActivity } from "@/lib/board-activity";
import { recordGameActivity } from "@/lib/game-activity";

/** Persists a day's Daily Term (Wordle) progress/result for the signed-in user — replaces
 *  what used to be a "limbic:wordle:<dateKey>" localStorage key with no userId in it at
 *  all, so every account on a shared browser saw (and overwrote) the same game. Called on
 *  every guess, not just completion, so an in-progress game survives a refresh. */
export async function recordWordleCompletionAction(
  dateKey: string,
  guesses: string[],
  status: "playing" | "won" | "lost",
  elapsedSeconds?: number
) {
  const user = await getCurrentUser();
  if (!user) return;
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "wordle", dateKey } },
      create: { userId: user.id, kind: "wordle", dateKey, guesses, status, elapsedSeconds },
      update: { guesses, status, elapsedSeconds },
    }),
    status !== "playing" ? recordGameActivity(user.id, dateKey) : Promise.resolve(),
  ]);
  revalidatePath("/wordle");
  revalidatePath("/games");
}

/** Persists an answer to Home's own general-audience "Question of the Day" (see
 *  components/HomeQuestionCard.tsx, lib/home-questions-static.ts) — distinct from Limbic
 *  Boards' student-facing daily question below, kind "homeQuestion" instead of
 *  "boardQuestion" so the two never collide in DailyCompletion and neither's streak/
 *  activity tracking is touched by the other. No streak of its own — this is a quick daily
 *  aside for every reader, not a habit-building product like Boards/Games. */
export async function recordHomeQuestionAction(dateKey: string, selectedIndex: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.dailyCompletion.upsert({
    where: { userId_kind_dateKey: { userId: user.id, kind: "homeQuestion", dateKey } },
    create: { userId: user.id, kind: "homeQuestion", dateKey, selectedIndex },
    update: { selectedIndex },
  });
  revalidatePath("/home");
}

/** Persists a Limbic Boards question answer — same per-user fix as the Wordle action
 *  above, plus still advances the Boards streak the same way it always did. */
export async function recordBoardQuestionAction(dateKey: string, selectedIndex: number, elapsedSeconds?: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "boardQuestion", dateKey } },
      create: { userId: user.id, kind: "boardQuestion", dateKey, selectedIndex, elapsedSeconds },
      update: { selectedIndex, elapsedSeconds },
    }),
    recordBoardActivity(user.id, dateKey),
  ]);
  revalidatePath("/boards/sharpening");
  revalidatePath("/student");
}

/** Persists a Limbic Boards term-of-the-day reveal — same pattern as the question action. */
export async function recordBoardTermRevealAction(dateKey: string, elapsedSeconds?: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "boardTerm", dateKey } },
      create: { userId: user.id, kind: "boardTerm", dateKey, elapsedSeconds },
      update: { elapsedSeconds },
    }),
    recordBoardActivity(user.id, dateKey),
  ]);
  revalidatePath("/boards/sharpening");
  revalidatePath("/student");
}

/** Persists a day's Mini Crossword progress/result — same per-user, survives-a-refresh
 *  reasoning as recordWordleCompletionAction above. Called on every cell edit, not just
 *  completion. `cells` is the full 5x5 grid of what the reader has typed so far. */
export async function recordCrosswordCompletionAction(
  dateKey: string,
  cells: string[][],
  status: "playing" | "won",
  elapsedSeconds?: number
) {
  const user = await getCurrentUser();
  if (!user) return;
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "crossword", dateKey } },
      create: { userId: user.id, kind: "crossword", dateKey, crosswordCells: cells, status, elapsedSeconds },
      update: { crosswordCells: cells, status, elapsedSeconds },
    }),
    status === "won" ? recordGameActivity(user.id, dateKey) : Promise.resolve(),
  ]);
  revalidatePath("/crossword");
  revalidatePath("/games");
}

/** Persists progress through Health Trivia's 5 daily questions (see
 *  components/HealthTriviaGame.tsx) — `answers` holds each answered question's selected
 *  option index, in question order, growing by one every time a question is revealed, same
 *  "persist on every step, not just completion" reasoning as Wordle/Crossword above.
 *  `status` is "playing" until all 5 are answered, then "won" — there's no losing state,
 *  score is just reviewed on the results screen. */
export async function recordHealthTriviaAction(dateKey: string, answers: number[], status: "playing" | "won") {
  const user = await getCurrentUser();
  if (!user) return;
  const guesses = answers.map(String);
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "healthTrivia", dateKey } },
      create: { userId: user.id, kind: "healthTrivia", dateKey, guesses, status },
      update: { guesses, status },
    }),
    status === "won" ? recordGameActivity(user.id, dateKey) : Promise.resolve(),
  ]);
  revalidatePath("/games/trivia");
  revalidatePath("/games");
}

/** Persists progress through Body Connections' 5 daily body-part matches (see
 *  components/BodyConnectionsGame.tsx) — `matchedRegions` holds each correctly-matched
 *  region id, in the order matched, growing by one per correct match (an incorrect
 *  attempt is never recorded — the reader just tries again client-side). `status` is
 *  "playing" until all 5 regions are matched, then "won". */
export async function recordBodyConnectionsAction(dateKey: string, matchedRegions: string[], status: "playing" | "won") {
  const user = await getCurrentUser();
  if (!user) return;
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "bodyConnections", dateKey } },
      create: { userId: user.id, kind: "bodyConnections", dateKey, guesses: matchedRegions, status },
      update: { guesses: matchedRegions, status },
    }),
    status === "won" ? recordGameActivity(user.id, dateKey) : Promise.resolve(),
  ]);
  revalidatePath("/games/body");
  revalidatePath("/games");
}

/** Persists a day's Case of the Day attempt — reuses the same DailyCompletion columns from
 *  when Case of the Day lived in Limbic Games as a two-attempt scored game, now that it's
 *  Daily Sharpening's third step (see components/DailySharpeningSession.tsx): a single
 *  select-then-reveal pass, so `attemptedIndexes` is always one element and `status` is
 *  always "correct-first" or "wrong" for anything recorded going forward — "playing"/
 *  "correct-second" only remain valid on the type for rows persisted before this move.
 *  Counts toward the Boards streak (not the Games streak) now that it's a Boards activity. */
export async function recordCaseOfDayAction(
  dateKey: string,
  attemptedIndexes: number[],
  selectedIndex: number,
  status: "playing" | "correct-first" | "correct-second" | "wrong",
  elapsedSeconds?: number
) {
  const user = await getCurrentUser();
  if (!user) return;
  const guesses = attemptedIndexes.map(String);
  await Promise.all([
    prisma.dailyCompletion.upsert({
      where: { userId_kind_dateKey: { userId: user.id, kind: "caseOfDay", dateKey } },
      create: { userId: user.id, kind: "caseOfDay", dateKey, guesses, selectedIndex, status, elapsedSeconds },
      update: { guesses, selectedIndex, status, elapsedSeconds },
    }),
    status !== "playing" ? recordBoardActivity(user.id, dateKey) : Promise.resolve(),
  ]);
  revalidatePath("/boards/sharpening");
  revalidatePath("/student");
}
