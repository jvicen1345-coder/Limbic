import Link from "next/link";

export interface WeekScheduleEvent {
  id: string;
  title: string;
  type: string;
  /** Meeting time for this specific day (e.g. "10:00 AM-10:50 AM"), when known — shown
   *  inline in the cell rather than only in the hover tooltip (see the `time` field build in
   *  app/(app)/student/page.tsx's scheduleDays). Undefined for manually-added Class-type
   *  calendar events, which have no time field to show (see UserCalendarEvent in
   *  prisma/schema.prisma). */
  time?: string;
  /** Room/building for this class (see Syllabus.location in prisma/schema.prisma), when
   *  known — rendered as a third line under the time. Undefined for manual Class-type
   *  calendar events, same "no such field on UserCalendarEvent" reasoning as `time` above. */
  location?: string;
}

export interface WeekScheduleDay {
  dateKey: string;
  /** "Mon", "Tue", etc. */
  label: string;
  dayNumber: number;
  isToday: boolean;
  events: WeekScheduleEvent[];
}

/** "I want the weekly schedule to be the class schedule since we have events in the
 *  calendar already", then "not what I wanted, I want it to show your class schedule and
 *  only your classes", then "use the information from the syllabi to create a class
 *  schedule" — this is that: a Monday-Friday strip (see MEETING_DAY_CODES in
 *  lib/calendar-events.ts — classes don't meet weekends) built from two additive sources
 *  (see app/(app)/student/page.tsx's query):
 *  1. Recurring weekly meetings parsed off the reader's own syllabi (or set by hand on the
 *     syllabus card when the AI parse can't find one — see Syllabus.meetingDays/meetingTimes
 *     in prisma/schema.prisma, lib/syllabus-parser.ts, and updateSyllabusMeetingPattern in
 *     app/actions/syllabus.ts) — the primary source now, since that's what was asked for.
 *  2. One-off UserCalendarEvent rows with type "Class" (see lib/calendar-events.ts's
 *     USER_EVENT_TYPES), for a class that doesn't fit a weekly pattern or isn't on a
 *     syllabus. Rotations, CE events, conferences, and other personal calendar entries stay
 *     out of this strip on purpose.
 *  Sits right after the greeting, at the top of app/(app)/student/page.tsx, above the
 *  streak/roundup grid — the most time-sensitive "what does my week look like" question,
 *  first. "I want the schedule to be more effective" -> "show more detail per class, right
 *  in the cell" — a syllabus meeting's time (WeekScheduleEvent.time) and, now, room
 *  (WeekScheduleEvent.location) render inline under the course code instead of being buried
 *  in the hover tooltip; the tooltip (WeekScheduleEvent.type) still carries the full course
 *  name. Manual Class-type calendar events have neither field (UserCalendarEvent has no
 *  time or location column — see lib/calendar-data.ts buildCalendarEvents, which strips
 *  time before it ever reaches /calendar's own views either), so those cells show just the
 *  title, same as before. */
export function AtriumWeekSchedule({ days, weekLabel }: { days: WeekScheduleDay[]; weekLabel: string }) {
  const isEmpty = days.every((d) => d.events.length === 0);

  return (
    <div className="atrium-friends-strip atrium-week-schedule">
      <div className="atrium-week-schedule-header">
        <span className="atrium-friends-label">Class Schedule</span>
        <span className="atrium-week-schedule-range">{weekLabel}</span>
        <Link href="/student/assignments" className="atrium-week-schedule-manage">
          Manage →
        </Link>
      </div>

      {isEmpty ? (
        <p className="atrium-week-schedule-empty-all">
          Nothing here yet — upload a syllabus in <Link href="/student/assignments">Assignments</Link> and Limbic AI
          will pull out your class times, or add a one-off class in <Link href="/calendar">Calendar</Link> (type:
          Class).
        </p>
      ) : (
        <div className="atrium-week-schedule-grid">
          {days.map((d) => (
            <div key={d.dateKey} className={d.isToday ? "atrium-week-schedule-col atrium-week-schedule-col--today" : "atrium-week-schedule-col"}>
              <div className="atrium-week-schedule-col-header">
                <span className="atrium-week-schedule-weekday">{d.label}</span>
                <span className="atrium-week-schedule-daynum">{d.dayNumber}</span>
              </div>
              {d.events.length === 0 ? (
                <span className="atrium-week-schedule-empty-day">—</span>
              ) : (
                d.events.map((e) => (
                  <div key={e.id} className="atrium-week-schedule-event" title={e.type}>
                    <span className="atrium-week-schedule-event-title">{e.title}</span>
                    {e.time && <span className="atrium-week-schedule-event-time">{e.time}</span>}
                    {e.location && <span className="atrium-week-schedule-event-location">{e.location}</span>}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
