"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { recordBoardActivity } from "@/lib/board-activity";

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
  await prisma.dailyCompletion.upsert({
    where: { userId_kind_dateKey: { userId: user.id, kind: "wordle", dateKey } },
    create: { userId: user.id, kind: "wordle", dateKey, guesses, status, elapsedSeconds },
    update: { guesses, status, elapsedSeconds },
  });
  revalidatePath("/wordle");
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
  revalidatePath("/boards");
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
  revalidatePath("/boards");
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
  await prisma.dailyCompletion.upsert({
    where: { userId_kind_dateKey: { userId: user.id, kind: "crossword", dateKey } },
    create: { userId: user.id, kind: "crossword", dateKey, crosswordCells: cells, status, elapsedSeconds },
    update: { crosswordCells: cells, status, elapsedSeconds },
  });
  revalidatePath("/crossword");
}
