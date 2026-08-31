import Link from "next/link";

export interface WeekScheduleEvent {
  id: string;
  title: string;
  type: string;
}

export interface WeekScheduleDay {
  dateKey: string;
  /** "Mon", "Tue", etc. */
  label: string;
  dayNumber: number;
  isToday: boolean;
  events: WeekScheduleEvent[];
}

/** "Add a weekly schedule at the top of the page... tie it to my class schedule too... I
 *  want the weekly schedule to be the class schedule since we have events in the calendar
 *  already" — this is that: a Monday-Sunday strip built from the reader's own
 *  UserCalendarEvent rows (see app/(app)/calendar/page.tsx, where a class, rotation, or CE
 *  event actually gets added — there's no separate class-schedule concept, this reads the
 *  same events that page manages) rather than a new model. Sits right after the greeting, at
 *  the top of app/(app)/student/page.tsx, above the friends strip and the streak/roundup
 *  grid — the most time-sensitive "what does my week look like" question, first. Dates only,
 *  no times: /calendar's own week/month/list views already treat UserCalendarEvent.date as a
 *  day-level field (see lib/calendar-data.ts buildCalendarEvents, which strips the time
 *  component before ever reaching a view), so showing one here would invent a granularity
 *  the rest of the app doesn't have. */
export function AtriumWeekSchedule({ days, weekLabel }: { days: WeekScheduleDay[]; weekLabel: string }) {
  const isEmpty = days.every((d) => d.events.length === 0);

  return (
    <div className="atrium-friends-strip atrium-week-schedule">
      <div className="atrium-week-schedule-header">
        <span className="atrium-friends-label">Weekly Schedule</span>
        <span className="atrium-week-schedule-range">{weekLabel}</span>
        <Link href="/calendar" className="atrium-week-schedule-manage">
          Manage →
        </Link>
      </div>

      {isEmpty ? (
        <p className="atrium-week-schedule-empty-all">
          Nothing on the books this week — add your classes, rotations, and CE events in{" "}
          <Link href="/calendar">Calendar</Link> to see them here.
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
                    {e.title}
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
