/** Appends a newly-seen/opened id to a per-user history (no-op if already present),
 *  pruning down to the most recent `max` entries so the JSON column doesn't grow
 *  unbounded. Shared by Health & Wellness (lib/wellness-rotation.ts) and Clips
 *  (app/actions/clips.ts) — same "remember what's been shown, prefer fresh next time"
 *  bookkeeping in both places. */
export function withSeenId(seenIds: string[], id: string, max: number): string[] {
  if (seenIds.includes(id)) return seenIds;
  const next = [...seenIds, id];
  return next.length > max ? next.slice(next.length - max) : next;
}
