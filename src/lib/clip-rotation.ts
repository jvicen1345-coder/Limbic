import "server-only";
import { shuffle } from "@/lib/shuffle";
import type { Clip } from "@/lib/types";

/** Bounds how much "seen" history is kept per user — see lib/seen-tracking.ts withSeenId. */
export const MAX_CLIPS_SEEN_HISTORY = 200;

/**
 * Orders the curated CLIPS pool for one visit: everything the user hasn't scrolled past
 * yet, shuffled, ahead of everything they have (also shuffled) — so a returning visitor
 * lands on something new-to-them instead of always restarting at c1, and only sees a
 * repeat once they've worked through the whole pool. The pool is small and finite (see
 * lib/clips-static.ts), so once everything's been seen this is just a fresh shuffle of the
 * same clips rather than a stale fixed order.
 */
export function orderClipsForUser(clips: Clip[], seenIds: string[]): Clip[] {
  const seenIdSet = new Set(seenIds);
  const unseen = shuffle(clips.filter((c) => !seenIdSet.has(c.id)));
  const seen = shuffle(clips.filter((c) => seenIdSet.has(c.id)));
  return [...unseen, ...seen];
}
