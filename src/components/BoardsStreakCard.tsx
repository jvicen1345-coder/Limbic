import { ReadingCalendar } from "@/components/ReadingCalendar";
import type { ReadingCalendarDay } from "@/lib/reading-calendar";

/** Same shape as ReadingStreakCard, Boards-specific copy — kept as its own component
 *  rather than a prop on ReadingStreakCard since the two streaks are unrelated concepts
 *  that happen to share a rendering pattern (see lib/board-activity.ts). */
export function BoardsStreakCard({ streakDays, weeks }: { streakDays: number; weeks: ReadingCalendarDay[][] }) {
  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>
          {streakDays > 0 ? `${streakDays}-day streak` : "Boards activity"}
        </div>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Last 365 days</span>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "2px 0 12px" }}>
        {streakDays > 0
          ? "Answer today's question or reveal today's term to keep it going."
          : "Answer today's question or reveal today's term to start a streak."}
      </p>
      <ReadingCalendar weeks={weeks} />
    </div>
  );
}
