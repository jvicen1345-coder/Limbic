/** A single meeting day's time, both fields optional 24-hour "HH:MM" strings straight from an
 *  `<input type="time">` — see components/student/SyllabiManager.tsx's MeetingTimeFields, the
 *  only place these get entered. Never validated as a real time range (end before start is
 *  allowed) since this is display-only data, same as every other free-text schedule field in
 *  this app — no DateTime/timezone math is ever done on it. */
export interface MeetingDayTime {
  start: string;
  end: string;
}

/** Syllabus.meetingTimes is a JSON-encoded object column (see prisma/schema.prisma) mapping a
 *  meeting day to its own MeetingDayTime, since the same class can meet at a different time
 *  on different days. This is the one place that raw string gets turned back into the Record
 *  every reader actually wants — shared between app/actions/syllabus.ts (a "use server" file,
 *  which can't export a plain sync helper like this one alongside its Server Actions) and
 *  app/(app)/student/page.tsx, which reads the column directly via its own prisma.syllabus
 *  query rather than going through an action. Falls back to null on anything unexpected
 *  rather than throwing; the column's only ever written by parseSyllabusFromText/
 *  updateSyllabusMeetingPattern in app/actions/syllabus.ts, both of which only ever write
 *  valid JSON, but a raw DB string is still worth treating as untrusted input. */
export function parseMeetingTimesColumn(value: string | null): Record<string, MeetingDayTime> | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, MeetingDayTime>;
  } catch {
    return null;
  }
}

/** "09:00" -> "9:00 AM" — the display format everywhere a MeetingDayTime is shown; the stored
 *  value stays 24-hour since that's the native `<input type="time">` format, so this is the
 *  one place that gets converted for reading. Falls back to the raw string on anything that
 *  doesn't parse as HH:MM rather than throwing. */
function formatTime24(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return value;
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${match[2]} ${period}`;
}

/** "9:00 AM-9:50 AM" from a MeetingDayTime, degrading gracefully to just one side if only
 *  start or only end was entered (both are optional — see MeetingTimeFields) and to "" if
 *  neither was. */
export function formatMeetingDayTime(time: MeetingDayTime | undefined): string {
  if (!time) return "";
  const start = time.start ? formatTime24(time.start) : "";
  const end = time.end ? formatTime24(time.end) : "";
  if (start && end) return `${start}-${end}`;
  return start || end;
}
