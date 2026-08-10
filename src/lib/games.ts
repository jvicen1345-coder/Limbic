/** Shared metadata + stats math for the Limbic Games hub (see app/(app)/games/page.tsx).
 *  Kept free of JSX/server-only imports, same convention as lib/vitals.ts, so both the
 *  server hub page and any client pieces can import from here. The current-day Games
 *  streak itself is a persisted counter
 *  on User (gamesStreakDays/lastGamesActivityAt, advanced by lib/game-activity.ts) — same
 *  pattern as the reading streak (streakDays) and Boards streak (boardsStreakDays), so all
 *  three "streaks" in this app are independently tracked rather than sharing one counter.
 *  Best streak and the weekly bar are still computed on the fly here, off the compact
 *  GameActivity table (one row per active day) rather than scanning DailyCompletion. */

// "bodyConnections" stays in the type/kinds list even though GAMES below no longer lists
// it as a playable card (see app/(app)/games/body/page.tsx, now a redirect to /games) —
// historical DailyCompletion/GameActivity rows still use this kind, and totalCompleted/
// streak math below reads across all of GAME_KINDS so a reader's past Body Connections
// days still count toward their stats even though the game itself is retired.
export type GameKind = "wordle" | "crossword" | "healthTrivia" | "bodyConnections";

export const GAME_KINDS: GameKind[] = ["wordle", "crossword", "healthTrivia", "bodyConnections"];

export type Difficulty = "Easy" | "Medium" | "Hard";

export const DIFFICULTY_DOTS: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };

export interface GameMeta {
  kind: GameKind;
  href: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeEstimate: string;
}

export const GAMES: GameMeta[] = [
  {
    kind: "wordle",
    href: "/wordle",
    title: "Daily Term",
    description: "Guess today's 5-letter health and wellness word in 6 tries",
    difficulty: "Medium",
    timeEstimate: "2 min",
  },
  {
    kind: "crossword",
    href: "/crossword",
    title: "Mini Crossword",
    description: "A small 5x5 crossword, a new one each day",
    difficulty: "Medium",
    timeEstimate: "3 min",
  },
  {
    kind: "healthTrivia",
    href: "/games/trivia",
    title: "Health Trivia",
    description: "5 questions about health and wellness — no clinical knowledge needed",
    difficulty: "Easy",
    timeEstimate: "3 min",
  },
];

/** The hub card's visual/behavioral state. */
export type CardCompletionState = "not-started" | "in-progress" | "completed";

/** A row's `status` column means something different per kind (see
 *  app/actions/daily-completion.ts), but "unset/playing" vs. "anything else" maps
 *  consistently to in-progress vs. completed across all four games. */
export function completionStateForStatus(status: string | null | undefined): CardCompletionState {
  if (!status) return "not-started";
  if (status === "playing") return "in-progress";
  return "completed";
}

/** A completion "counts" toward totals/streaks once its game for the day is actually
 *  finished — an in-progress row (status "playing") shouldn't inflate the streak just for
 *  having been opened. */
export function isFinishedStatus(status: string | null | undefined): boolean {
  return !!status && status !== "playing";
}

const DAY_MS = 86400000;

function dateKeyToUtcMs(dateKey: string): number {
  return new Date(dateKey + "T00:00:00Z").getTime();
}

function utcMsToDateKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Best streak = longest run of consecutive calendar days across all-time history. */
export function computeBestStreak(dateKeys: Iterable<string>): number {
  const sorted = Array.from(new Set(dateKeys)).sort();
  let best = 0;
  let run = 0;
  let prevMs: number | null = null;
  for (const key of sorted) {
    const ms = dateKeyToUtcMs(key);
    run = prevMs !== null && ms - prevMs === DAY_MS ? run + 1 : 1;
    best = Math.max(best, run);
    prevMs = ms;
  }
  return best;
}

/** The 7 calendar days ending today (today first), for the "X out of 7 days" weekly bar. */
export function last7DateKeys(todayKey: string): string[] {
  const todayMs = dateKeyToUtcMs(todayKey);
  return Array.from({ length: 7 }, (_, i) => utcMsToDateKey(todayMs - i * DAY_MS));
}
