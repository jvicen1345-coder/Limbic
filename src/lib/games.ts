/** Shared metadata + streak/stats math for the Limbic Games hub (see
 *  app/(app)/games/page.tsx) and Case of the Day (app/(app)/games/case/page.tsx). Kept free
 *  of JSX/server-only imports, same convention as lib/vitals.ts, so both the server hub page
 *  and any client pieces can import from here. Streaks/stats are computed on the fly from
 *  the existing DailyCompletion rows rather than a stored counter, since no schema
 *  migration is planned for this feature — same reasoning documented in
 *  lib/cases-static.ts for reusing existing columns instead of adding new ones. */

export type GameKind = "wordle" | "crossword" | "caseOfDay";

export const GAME_KINDS: GameKind[] = ["wordle", "crossword", "caseOfDay"];

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
    kind: "caseOfDay",
    href: "/games/case",
    title: "Case of the Day",
    description: "A real patient scenario — what would you do?",
    difficulty: "Hard",
    timeEstimate: "5 min",
  },
];

/** The hub card's visual/behavioral state. "locked" is defined for completeness (see the
 *  spec's 4-row completion states table) but nothing in this app currently produces it —
 *  every game is available fresh each day, with no multi-day-ahead content to gate. */
export type CardCompletionState = "not-started" | "in-progress" | "completed" | "locked";

/** A row's `status` column means something different per kind (see
 *  app/actions/daily-completion.ts), but "unset/playing" vs. "anything else" maps
 *  consistently to in-progress vs. completed across all three games. */
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

/** Current streak = consecutive days (counting back from today, or from yesterday if
 *  today hasn't been played yet) with at least one finished game. */
export function computeCurrentStreak(dateKeys: Iterable<string>, todayKey: string): number {
  const set = new Set(dateKeys);
  let cursor = dateKeyToUtcMs(todayKey);
  if (!set.has(todayKey)) {
    cursor -= DAY_MS;
    if (!set.has(utcMsToDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(utcMsToDateKey(cursor))) {
    streak++;
    cursor -= DAY_MS;
  }
  return streak;
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

/** Case of the Day's "Learn More" link resolves to a real article when one exists — same
 *  "classify/match by keyword" heuristic lib/nutrition-content.ts's isNutritionArticle
 *  already uses for untagged live content, just picking the best-scoring match instead of
 *  a yes/no. Falls back to null (caller sends the reader to /search?q=... instead) when
 *  nothing in the current article pool mentions the topic at all. */
export function findRelatedArticle<T extends { title: string; summary: string }>(
  articles: T[],
  relatedTopic: string
): T | null {
  const words = relatedTopic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  let best: T | null = null;
  let bestScore = 0;
  for (const article of articles) {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    const score = words.reduce((sum, w) => sum + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = article;
    }
  }
  return best;
}
