function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const DAY_MS = 86400000;

/** Streak value after a read "today": +1 if the last read was yesterday, unchanged if
 *  already read today, reset to 1 after any longer gap (including never having read
 *  before) — so re-reading the same day doesn't double-count and missing a day breaks it. */
export function nextStreak(lastReadAt: Date | null, currentStreak: number, now = new Date()): number {
  if (!lastReadAt) return 1;
  const dayDiff = Math.round((startOfDay(now) - startOfDay(lastReadAt)) / DAY_MS);
  if (dayDiff === 0) return currentStreak;
  if (dayDiff === 1) return currentStreak + 1;
  return 1;
}
