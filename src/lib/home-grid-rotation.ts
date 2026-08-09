import type { Article } from "@/lib/types";

/** Bounds how much "seen" history is kept per user — see lib/seen-tracking.ts withSeenId.
 *  Smaller than Clips' MAX_CLIPS_SEEN_HISTORY (200) since the Home grid only ever shows 6
 *  at a time and the live-sourced pool it draws from is itself much smaller than Clips'. */
export const MAX_HOME_GRID_SEEN_HISTORY = 60;

/**
 * Normalizes a title into a stable "same story" signal. Needed because live-sourced
 * articles' own ids aren't reliable for this: lib/news-live.ts's stableId() hashes the RSS
 * item's <link>, and Google News RSS's <link> for the same editorial story isn't stable
 * across separate fetches, so two fetches of literally the same headline produce different
 * article ids. The headline text itself is stable, so that's what seen-tracking keys off.
 */
export function titleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Reorders the ranked article pool so articles the reader hasn't seen in the grid yet
 * (since their last Refresh click — see app/actions/home.ts refreshHomeFeedAction) sort
 * ahead of ones they have, each group keeping its existing relative rank order. Called
 * client-side from components/HomeFeed.tsx, only for the grid's own selection — the hero
 * and the rest of the ranked feed read straight off the original `articles` prop, so
 * Refresh rotates which articles fill the grid without disturbing "best-ranked content
 * first" anywhere else. No server-only APIs here (no prisma, no secrets) — safe to bundle
 * into the client.
 */
export function orderArticlesForGrid<T extends Article>(articles: T[], gridSeenFingerprints: string[]): T[] {
  const seenSet = new Set(gridSeenFingerprints);
  const unseen = articles.filter((a) => !seenSet.has(titleFingerprint(a.title)));
  const seen = articles.filter((a) => seenSet.has(titleFingerprint(a.title)));
  return [...unseen, ...seen];
}
