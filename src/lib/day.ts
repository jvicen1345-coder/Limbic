/**
 * Calendar-day helpers that answer "what day is it *for this reader*".
 *
 * Every daily-rotating thing in the app — the Boards question and term, Daily Term
 * (Wordle), the crossword, Health Trivia, Body Connections, Case of the Day — is keyed on
 * a "dateKey", a YYYY-MM-DD calendar label. Those keys used to be produced with
 * `new Date().toISOString().slice(0, 10)`, which reads the *UTC* date. On a server running
 * in UTC (which is what the app runs on in production) that means the day rolls over at
 * 17:00 for a reader in UTC-07:00 and 19:00 in UTC-05:00: an evening study session gets
 * served tomorrow's question, and writes its completion row under tomorrow's key. The
 * streak counters had the same boundary from the other direction — nextStreak compared
 * server-local midnights — so a reader alternating morning and evening sessions could
 * silently lose a streak they had actually kept.
 *
 * These helpers take an IANA time zone explicitly. Nothing here reads an ambient clock
 * zone, because the zone that matters is the reader's and the code runs on a server that
 * is somewhere else entirely; see lib/user-time-zone.ts for how a request resolves one.
 *
 * A dateKey is a *label*, not an instant, so once you have one, arithmetic on it
 * (addDaysToDateKey, dayDiffBetweenDateKeys) is plain calendar math with no zone involved
 * — which is why lib/games.ts's last7DateKeys/computeBestStreak, which only ever walk
 * between keys, needed no changes.
 */

/** What a request falls back to before the reader's real zone is known — the same UTC the
 *  whole app used before this existed, so an unknown zone behaves exactly as it did. */
export const DEFAULT_TIME_ZONE = "UTC";

/** Whether `timeZone` is an IANA zone this runtime actually knows. Time zones reach us
 *  from a cookie and a request header, i.e. from outside — an unrecognized one makes
 *  Intl throw a RangeError, and a thrown date helper would take down a page render. */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The YYYY-MM-DD calendar date `date` falls on in `timeZone`.
 *
 *  "en-CA" is the locale trick that makes this a one-liner: it formats dates as
 *  YYYY-MM-DD natively, so there is no part-assembling or zero-padding to get wrong. An
 *  unknown zone falls back to UTC rather than throwing — see isValidTimeZone. */
export function dateKeyInZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }
}

/** Today's calendar date for a reader in `timeZone`. */
export function todayKeyInZone(timeZone: string, now: Date = new Date()): string {
  return dateKeyInZone(now, timeZone);
}

/** `dateKey` shifted by whole calendar days. Computed against UTC midnight deliberately:
 *  a dateKey is a calendar label, and UTC is the one "zone" with no DST, so stepping a
 *  label by a day can never land on a doubled or skipped hour and slip a date. */
export function addDaysToDateKey(dateKey: string, delta: number): string {
  const ms = Date.parse(`${dateKey}T00:00:00Z`) + delta * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Whole calendar days from `fromKey` to `toKey` — positive when `toKey` is later. Same
 *  UTC-midnight reasoning as addDaysToDateKey. */
export function dayDiffBetweenDateKeys(fromKey: string, toKey: string): number {
  return Math.round((Date.parse(`${toKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`)) / 86400000);
}
