import { dateKeyInZone, dayDiffBetweenDateKeys, todayKeyInZone } from "@/lib/day";

/** Streak value after activity "today": +1 if the last one was yesterday, unchanged if
 *  there was already one today, reset to 1 after any longer gap (including never having
 *  been active before) — so repeating the same day doesn't double-count and missing a day
 *  breaks it.
 *
 *  "Day" is the reader's calendar day, in `timeZone`. This used to compare server-local
 *  midnights, which on a server running in UTC put the boundary mid-evening for anyone in
 *  the Americas: a reader who studied at 21:00 and then again at 09:00 the next morning
 *  had, by this function's reckoning, done it twice on the same day and lost the increment.
 *  See lib/day.ts.
 *
 *  `todayKey` is passed by callers that already have the reader's date in hand (the
 *  activity row they're writing is keyed on it), so the streak and that row can never
 *  disagree about which day this was even if the request straddles midnight. */
export function nextStreak(
  lastActivityAt: Date | null,
  currentStreak: number,
  timeZone: string,
  todayKey: string = todayKeyInZone(timeZone)
): number {
  if (!lastActivityAt) return 1;
  const dayDiff = dayDiffBetweenDateKeys(dateKeyInZone(lastActivityAt, timeZone), todayKey);
  if (dayDiff === 0) return currentStreak;
  if (dayDiff === 1) return currentStreak + 1;
  return 1;
}
