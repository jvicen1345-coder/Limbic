"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getTimeZone } from "@/lib/user-time-zone";
import { getTodaysCase, getDateKey, type DifferentialCaseEntry } from "@/lib/differential-cases";

/** Lowercases and strips apostrophes/hyphens/periods so "Guillain-Barre", "Guillain
 *  Barre", and "guillain barre's" all compare equal — punctuation a reader easily varies
 *  shouldn't be the difference between a correct and incorrect guess. */
function normalizeGuess(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['''\-.—–]/g, "")
    .replace(/\s+/g, " ");
}

/** A guess is correct if it matches the condition itself or any of its listed common
 *  abbreviations/alternate names (see DifferentialCaseEntry.aliases) — a clinically
 *  correct shorthand like "PFPS" shouldn't be marked wrong just for not spelling out
 *  "Patellofemoral Pain Syndrome". */
function matchesCase(guess: string, caseEntry: DifferentialCaseEntry): boolean {
  const normalizedGuess = normalizeGuess(guess);
  const acceptedAnswers = [caseEntry.condition, ...(caseEntry.aliases ?? [])];
  return acceptedAnswers.some((answer) => normalizeGuess(answer) === normalizedGuess);
}

// Every action below derives the reader from the session (getCurrentUser), never from a
// client-supplied id — same convention as app/actions/specialty-questions.ts and every
// other action in this app, so a signed-in reader can never read or overwrite another
// user's result by passing a different id.

export interface DifferentialResultView {
  cluesUsed: number;
  correct: boolean;
  guesses: string[];
  /** Only ever populated here — never sent to the client any other way — since a result
   *  row existing at all means today's case is already finished, so revealing the answer
   *  alongside it can't spoil anything. The unsolved page (page.tsx) never receives
   *  today's condition — only its clues/category/difficulty — precisely so this stays the
   *  one and only path an unfinished answer could leak through, and it's gated on the row
   *  existing at all. */
  condition: string;
}

/** Today's saved result for the signed-in reader, if the day's case is already finished —
 *  drives the game page's "already completed" state on load. Null both when signed out and
 *  when today isn't finished yet. */
export async function getTodaysDifferentialResult(): Promise<DifferentialResultView | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const timeZone = await getTimeZone(user);
  const row = await prisma.differentialResult.findUnique({
    where: { userId_dateKey: { userId: user.id, dateKey: getDateKey(timeZone) } },
  });
  if (!row) return null;
  return {
    cluesUsed: row.cluesUsed,
    correct: row.correct,
    guesses: row.guesses as string[],
    condition: getTodaysCase(timeZone).condition,
  };
}

export interface SubmitDifferentialGuessResult {
  ok: boolean;
  correct: boolean;
  condition: string;
  error?: string;
}

/** The page calls this on every guess, not just the last one — the client never holds
 *  today's condition (see page.tsx, which withholds it from an unfinished day), so a
 *  server round trip is the only way it can find out a guess was wrong and let the reader
 *  reveal another clue. Only persists a DifferentialResult row once the day is actually
 *  decided — correct, or wrong with no clues left — so an in-between wrong guess with
 *  clues still to reveal never gets mistaken for a finished day on a page refresh (see
 *  getTodaysDifferentialResult above, which treats "a row exists" as "today is done").
 *  `priorGuesses` carries every earlier wrong guess so the saved `guesses` row is the
 *  reader's full attempt history, not just the final one. `condition` in the response is
 *  left blank until the day is actually decided, for the same anti-spoiler reason. */
export async function submitDifferentialGuess(
  guess: string,
  cluesUsed: number,
  priorGuesses: string[] = []
): Promise<SubmitDifferentialGuessResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, correct: false, condition: "", error: "Not signed in." };

  const timeZone = await getTimeZone(user);
  const dateKey = getDateKey(timeZone);
  const todaysCase = getTodaysCase(timeZone);
  const correct = matchesCase(guess, todaysCase);
  const clampedCluesUsed = Math.min(Math.max(cluesUsed, 1), 5);
  const isFinal = correct || clampedCluesUsed >= 5;

  if (isFinal) {
    await prisma.differentialResult.upsert({
      where: { userId_dateKey: { userId: user.id, dateKey } },
      create: { userId: user.id, dateKey, cluesUsed: clampedCluesUsed, correct, guesses: [...priorGuesses, guess] },
      update: { cluesUsed: clampedCluesUsed, correct, guesses: [...priorGuesses, guess] },
    });
  }

  return { ok: true, correct, condition: isFinal ? todaysCase.condition : "" };
}

export interface DifferentialStats {
  totalPlayed: number;
  totalCorrect: number;
  averageCluesUsed: number;
  currentStreak: number;
}

const DAY_MS = 86400000;

function dateKeyToUtcMs(dateKey: string): number {
  return new Date(dateKey + "T00:00:00Z").getTime();
}

/** Consecutive-day streak of correct finishes, ending at today or yesterday — same
 *  "missing a day breaks it, but today not having been played yet doesn't" rule as every
 *  other daily-game streak in this app (see lib/games.ts computeBestStreak for the sibling
 *  best-streak version of this same math). */
function computeCurrentStreak(correctDateKeys: string[], todayKey: string): number {
  const sorted = Array.from(new Set(correctDateKeys)).sort();
  if (sorted.length === 0) return 0;

  const todayMs = dateKeyToUtcMs(todayKey);
  const mostRecentMs = dateKeyToUtcMs(sorted[sorted.length - 1]);
  if (todayMs - mostRecentMs > DAY_MS) return 0;

  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const gap = dateKeyToUtcMs(sorted[i]) - dateKeyToUtcMs(sorted[i - 1]);
    if (gap === DAY_MS) streak++;
    else break;
  }
  return streak;
}

export async function getDifferentialStats(): Promise<DifferentialStats> {
  const user = await getCurrentUser();
  if (!user) return { totalPlayed: 0, totalCorrect: 0, averageCluesUsed: 0, currentStreak: 0 };

  const rows = await prisma.differentialResult.findMany({
    where: { userId: user.id },
    select: { correct: true, cluesUsed: true, dateKey: true },
  });

  const totalPlayed = rows.length;
  const totalCorrect = rows.filter((r) => r.correct).length;
  const averageCluesUsed = totalPlayed > 0 ? rows.reduce((sum, r) => sum + r.cluesUsed, 0) / totalPlayed : 0;
  const currentStreak = computeCurrentStreak(
    rows.filter((r) => r.correct).map((r) => r.dateKey),
    getDateKey(await getTimeZone(user))
  );

  return { totalPlayed, totalCorrect, averageCluesUsed, currentStreak };
}
