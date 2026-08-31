/** Syllabus.meetingTimes is a JSON-encoded object column (see prisma/schema.prisma) mapping a
 *  meeting day to its own free-text time, since the same class can meet at a different time
 *  on different days. This is the one place that raw string gets turned back into the Record
 *  every reader actually wants — shared between app/actions/syllabus.ts (a "use server" file,
 *  which can't export a plain sync helper like this one alongside its Server Actions) and
 *  app/(app)/student/page.tsx, which reads the column directly via its own prisma.syllabus
 *  query rather than going through an action. Falls back to null on anything unexpected
 *  rather than throwing; the column's only ever written by parseSyllabusFromText/
 *  updateSyllabusMeetingPattern in app/actions/syllabus.ts, both of which only ever write
 *  valid JSON, but a raw DB string is still worth treating as untrusted input. */
export function parseMeetingTimesColumn(value: string | null): Record<string, string> | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, string>;
  } catch {
    return null;
  }
}
