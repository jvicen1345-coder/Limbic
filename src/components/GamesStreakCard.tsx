import { ZapIcon } from "@/components/icons";

/** Same shape as ReadingStreakCard/BoardsStreakCard, Games-specific copy — its own
 *  component rather than a shared prop since all three streaks are unrelated concepts
 *  (reading an article, a Boards daily habit, finishing a Limbic Games game) that just
 *  happen to share a rendering pattern (see lib/game-activity.ts). */
export function GamesStreakCard({ streakDays }: { streakDays: number }) {
  return (
    <div className="card elev-sm streak-card" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Limbic Games activity</div>
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
            <div className="streak-card-caption">Finish a Limbic Games game today to keep it going.</div>
          </div>
        ) : (
          <div>
            <div className="streak-card-value streak-card-value--zero">No streak yet</div>
            <div className="streak-card-caption">Finish Daily Term, Mini Crossword, or Case of the Day to start one.</div>
          </div>
        )}
      </div>
    </div>
  );
}
