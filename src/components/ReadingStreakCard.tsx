import { ReadingCalendar } from "@/components/ReadingCalendar";
import type { ReadingCalendarDay } from "@/lib/reading-calendar";

/** How many trailing weeks fit the ~200px aside column without horizontal scrolling. */
const COMPACT_WEEKS = 12;

export function ReadingStreakCard({
  streakDays,
  weeks,
  compact = false,
}: {
  streakDays: number;
  weeks: ReadingCalendarDay[][];
  /** Aside-column placement: fewer weeks shown, tighter copy, no marginBottom (the
   *  aside stacks cards with its own gap). */
  compact?: boolean;
}) {
  const displayWeeks = compact ? weeks.slice(-COMPACT_WEEKS) : weeks;
  return (
    <div className="card elev-sm" style={compact ? undefined : { marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: compact ? 13 : 15 }}>
          {streakDays > 0 ? `${streakDays}-day streak` : "Reading activity"}
        </div>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
          {compact ? "12 wks" : "Last 365 days"}
        </span>
      </div>
      {!compact && (
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "2px 0 12px" }}>
          {streakDays > 0 ? "Read an article today to keep it going." : "Read an article to start a streak."}
        </p>
      )}
      <ReadingCalendar weeks={displayWeeks} />
    </div>
  );
}
