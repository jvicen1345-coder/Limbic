import "server-only";
import type { WellnessArticle } from "@/lib/types";

/** How many articles/videos the Health & Wellness page shows at once. Videos are capped by
 *  the size of the curated WELLNESS_VIDEOS pool (see lib/articles-static.ts) — with only a
 *  handful of real, verified videos to draw from, "swap out the opened ones" degrades
 *  gracefully to re-showing them once the pool is exhausted rather than going empty. */
export const WELLNESS_ARTICLE_TARGET = 8;
export const WELLNESS_VIDEO_TARGET = 3;

/** Caps how much "opened" history is kept per user — old enough entries stop mattering for
 *  picking fresh replacements, so this is pruned rather than left to grow forever. */
const MAX_OPENED_HISTORY = 300;

/**
 * Shared selection logic for both articles and videos: keep whatever's still in the
 * current set (dropping only ids no longer present in a fresh pool fetch, and — when
 * `dropOpened` is true — ids the user has since opened), then top up to `target` from the
 * pool, preferring never-opened candidates and falling back to already-opened ones only
 * once the pool has nothing fresh left to offer.
 *
 * `dropOpened` is false for a plain page load (self-heals a stale/missing id but otherwise
 * leaves what's on screen alone) and true for an explicit Refresh click (also swaps out
 * anything the user has opened since it last appeared).
 */
export function computeWellnessSet(
  poolIds: string[],
  currentIds: string[],
  openedIds: string[],
  target: number,
  dropOpened: boolean
): string[] {
  const poolIdSet = new Set(poolIds);
  const openedIdSet = new Set(openedIds);

  const kept = currentIds.filter((id) => poolIdSet.has(id) && (!dropOpened || !openedIdSet.has(id)));
  const keptSet = new Set(kept);

  const need = target - kept.length;
  if (need <= 0) return kept.slice(0, target);

  const fresh = poolIds.filter((id) => !keptSet.has(id) && !openedIdSet.has(id));
  const fallback = poolIds.filter((id) => !keptSet.has(id) && openedIdSet.has(id));
  const picked = [...fresh, ...fallback].slice(0, need);

  return [...kept, ...picked];
}

/** Appends a newly-opened id to the history (no-op if already present), pruning down to
 *  the most recent MAX_OPENED_HISTORY entries so the JSON column doesn't grow unbounded. */
export function withOpenedId(openedIds: string[], id: string): string[] {
  if (openedIds.includes(id)) return openedIds;
  const next = [...openedIds, id];
  return next.length > MAX_OPENED_HISTORY ? next.slice(next.length - MAX_OPENED_HISTORY) : next;
}

/** Rebuilds a WellnessArticle from a saved "article"-kind SavedWellness row, for rendering
 *  on /saved/wellness via the same WellnessListItem used on the main Health & Wellness
 *  page (see app/actions/wellness.ts toggleSaveWellnessAction for how rows are created). */
export function savedWellnessToArticle(row: {
  itemId: string;
  title: string;
  source: string;
  sourceUrl: string | null;
  date: string | null;
  readMins: number | null;
  summary: string | null;
}): WellnessArticle {
  return {
    id: row.itemId,
    title: row.title,
    source: row.source,
    sourceUrl: row.sourceUrl ?? undefined,
    date: row.date ?? "",
    readMins: row.readMins ?? 1,
    summary: row.summary ?? "",
    tags: [],
  };
}
