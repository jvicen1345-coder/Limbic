import { HeartIcon } from "@/components/icons";

/** Same shape as ReadingStreakCard/GamesStreakCard, wellness-specific copy — its own
 *  component for the same reason those two are separate: the three streaks are unrelated
 *  concepts that happen to share a rendering pattern (see lib/wellness-activity.ts).
 *  Rendered on Profile beside the other two; the hub itself uses the compact
 *  .wellness-hub-streak badge instead, since it already carries a lot above the fold. */
export function WellnessStreakCard({ streakDays }: { streakDays: number }) {
  return (
    <div className="card elev-sm streak-card" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Health and Wellness activity</div>
      <div className="streak-card-row">
        <span className="streak-card-badge" aria-hidden="true">
          <HeartIcon size={18} />
        </span>
        {streakDays > 0 ? (
          <div>
            <div className="streak-card-value">
              {streakDays}
              <span className="streak-card-unit">day{streakDays === 1 ? "" : "s"} streak</span>
            </div>
            <div className="streak-card-caption">Log an activity, check in your mood, or save a metric today to keep it going.</div>
          </div>
        ) : (
          <div>
            <div className="streak-card-value streak-card-value--zero">No streak yet</div>
            <div className="streak-card-caption">Log an activity, check in your mood, or save a metric to start one.</div>
          </div>
        )}
      </div>
    </div>
  );
}
