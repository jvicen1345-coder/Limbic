import { ReadingCalendar } from "@/components/ReadingCalendar";
import type { ReadingCalendarDay } from "@/lib/reading-calendar";

/** Same shape as ReadingStreakCard/BoardsStreakCard, Games-specific copy — its own
 *  component rather than a shared prop since all three streaks are unrelated concepts
 *  (reading an article, a Boards daily habit, finishing a Limbic Games game) that just
 *  happen to share a rendering pattern (see lib/game-activity.ts). */
export function GamesStreakCard({ streakDays, weeks }: { streakDays: number; weeks: ReadingCalendarDay[][] }) {
  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>
          {streakDays > 0 ? `${streakDays}-day streak` : "Limbic Games activity"}
        </div>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Last 365 days</span>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "2px 0 12px" }}>
        {streakDays > 0
          ? "Finish a Limbic Games game today to keep it going."
          : "Finish Daily Term, Mini Crossword, or Case of the Day to start a streak."}
      </p>
      <ReadingCalendar weeks={weeks} />
    </div>
  );
}
