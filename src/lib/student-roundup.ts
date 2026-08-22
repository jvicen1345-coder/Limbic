import type { Article } from "@/lib/types";

const ROUNDUP_SIZE = 5;

/** Same djb2-ish string hash used for every other deterministic-by-date-key pick in this
 *  app (see lib/wordle-words.ts, lib/board-content.ts, lib/nutrition-content.ts) — a plain
 *  Math.random() pick would give every paid student a different roundup on the same page
 *  load, and a different one again on refresh, which defeats "this week's roundup" as a
 *  shared, stable thing a cohort could discuss together. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h;
}

/** ISO 8601 week number (Monday-start, week 1 contains the year's first Thursday) — plain
 *  date-math, no library, since this is the only place in the app that needs a week
 *  boundary rather than a day one (see todayDateKey in lib/wordle-words.ts for the daily
 *  equivalent). Returns e.g. "2026-W34", stable for every reader for the whole week
 *  regardless of timezone drift within a day (unlike todayDateKey, a week boundary a few
 *  hours off UTC doesn't meaningfully change which week it is). */
export function currentWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** This week's fixed 5-article study roundup — the same picks for every paid LimbicStudent
 *  reader all week, reshuffled once the week rolls over (see currentWeekKey above). Pool
 *  should already be filtered to coursework-relevant types (see
 *  app/(app)/student/roundup/page.tsx, which drops "industry"/"product" equipment-marketing
 *  articles before calling this) — this function just orders and slices it. Sorted by a
 *  per-article hash seeded with the week key, so the order changes week to week without
 *  needing to persist anything. */
export function pickWeeklyRoundup(pool: Article[], weekKey: string, count: number = ROUNDUP_SIZE): Article[] {
  return pool
    .map((article) => ({ article, sortKey: hashString(`${weekKey}:${article.id}`) }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, count)
    .map((entry) => entry.article);
}
