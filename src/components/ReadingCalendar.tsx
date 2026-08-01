import type { ReadingCalendarDay } from "@/lib/reading-calendar";

export function ReadingCalendar({ weeks }: { weeks: ReadingCalendarDay[][] }) {
  return (
    <div style={{ overflowX: "auto", paddingBottom: 2 }}>
      <div className="reading-calendar">
        {weeks.map((week, wi) => (
          <div key={wi} className="reading-calendar-week">
            {week.map((day) => (
              <div
                key={day.key}
                className={`reading-calendar-day${day.read ? " reading-calendar-day-read" : ""}${day.isToday ? " reading-calendar-day-today" : ""}`}
                title={day.key}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
