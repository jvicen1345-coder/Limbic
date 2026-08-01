import { ReadingCalendar } from "@/components/ReadingCalendar";
import type { ReadingCalendarDay } from "@/lib/reading-calendar";

export function ReadingStreakCard({ streakDays, weeks }: { streakDays: number; weeks: ReadingCalendarDay[][] }) {
  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>
          {streakDays > 0 ? `${streakDays}-day reading streak` : "Reading activity"}
        </div>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Last 365 days</span>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "2px 0 12px" }}>
        {streakDays > 0 ? "Read an article today to keep it going." : "Read an article to start a streak."}
      </p>
      <ReadingCalendar weeks={weeks} />
    </div>
  );
}
