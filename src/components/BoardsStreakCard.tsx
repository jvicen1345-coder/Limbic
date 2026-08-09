import { ZapIcon } from "@/components/icons";

/** Same shape as ReadingStreakCard/GamesStreakCard, Boards-specific copy — kept as its own
 *  component rather than a prop on ReadingStreakCard since the two streaks are unrelated
 *  concepts that happen to share a rendering pattern (see lib/board-activity.ts). Just the
 *  streak count, no 365-day calendar. */
export function BoardsStreakCard({ streakDays }: { streakDays: number }) {
  return (
    <div className="card elev-sm streak-card">
      <div className="card-kicker">Boards activity</div>
      <div className="streak-card-row">
        <span className="streak-card-badge" aria-hidden="true">
          <ZapIcon size={18} />
        </span>
        {streakDays > 0 ? (
          <div>
            <div className="streak-card-value">
              {streakDays}
              <span className="streak-card-unit">day{streakDays === 1 ? "" : "s"} streak</span>
            </div>
            <div className="streak-card-caption">Answer today&rsquo;s question or reveal today&rsquo;s term to keep it going.</div>
          </div>
        ) : (
          <div>
            <div className="streak-card-value streak-card-value--zero">No streak yet</div>
            <div className="streak-card-caption">Answer today&rsquo;s question or reveal today&rsquo;s term to start one.</div>
          </div>
        )}
      </div>
    </div>
  );
}
