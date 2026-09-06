/** Dates for things that happened on a day, not at an instant — currently the date a
 *  Session Exercise log belongs to (see SessionExerciseSection.tsx and
 *  addSessionExerciseLog/updateSessionExerciseLog in app/actions/clinician-dashboard.ts).
 *
 *  Client-safe, and shared on purpose: the form that formats a stored date into a
 *  `<input type="date">` and the action that parses it back have to agree, and a mismatch
 *  between them shows up as a session quietly landing on the wrong day.
 *
 *  Stored at **noon UTC**, not local midnight, and read back in UTC. `loggedAt` is a
 *  DateTime column but the value is really a calendar date, and no single stored instant
 *  renders as the same day in every zone — the inhabited offsets span 26 hours, from UTC-12
 *  to UTC+14, so any anchor is a day out somewhere. Noon is simply the anchor furthest from
 *  a boundary; reading it back in UTC is what actually makes the date stable.
 *
 *  Rows written before the date was settable hold a real timestamp — the moment of the
 *  write — and those still read in local time, because 8pm on the 5th in California is the
 *  5th to the person who logged it and the 6th in UTC. `isDateAnchor` below is what tells
 *  the two apart. */

/** Whether an instant is one of this module's stored calendar dates rather than a genuine
 *  timestamp. Exact noon UTC to the millisecond: a real write lands there roughly once every
 *  86,400,000 tries, and a session logged at that instant is at worst shown in UTC, on the
 *  same day it happened for everyone but the two zones at the extremes. */
export function isDateAnchor(d: Date): boolean {
  return d.getUTCHours() === 12 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;
}

/** A stored instant, as the `YYYY-MM-DD` an `<input type="date">` wants — UTC parts for a
 *  stored calendar date, local parts for a legacy timestamp, per the note above. */
export function toSessionDateInput(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return isDateAnchor(d) ? toSessionDateInputUTC(d) : toSessionDateInputLocal(d);
}

function toSessionDateInputLocal(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** The same value as the reader's own locale would write it — for displaying a session's
 *  date in a list. Kept here beside the input formatter on purpose: showing one date in the
 *  history and pre-filling a different one into the edit form is the exact bug the anchor
 *  above exists to prevent. */
export function formatSessionDate(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, isDateAnchor(d) ? { timeZone: "UTC" } : undefined);
}

/** Today, in the same shape — the default for a newly opened session form. Local, because
 *  "today" means the clinician's today, not UTC's. */
export function todaySessionDate(): string {
  return toSessionDateInputLocal(new Date());
}

/** How far ahead of the server's clock a submitted date may still be accepted. A clinician
 *  in Auckland saving "today" is already tomorrow by UTC, so a strict "not in the future"
 *  check would reject a perfectly ordinary entry; a day of slack covers every zone while
 *  still catching a mistyped year. */
const FUTURE_GRACE_MS = 36 * 60 * 60 * 1000;

/** Parses what the form sends. Returns null for anything that isn't a real `YYYY-MM-DD`, or
 *  for a date far enough ahead that it can't be a session that has already happened. */
export function parseSessionDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  // Rejects both a nonsense month/day (which Date rolls over rather than refusing —
  // "2026-02-31" becomes March 3rd) and anything meaningfully in the future.
  if (toSessionDateInputUTC(parsed) !== value) return null;
  if (parsed.getTime() > Date.now() + FUTURE_GRACE_MS) return null;
  return parsed;
}

/** The UTC calendar date of an instant. */
function toSessionDateInputUTC(d: Date): string {
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${day}`;
}
