import { ZapIcon } from "@/components/icons";

export function ReadingStreakCard({ streakDays }: { streakDays: number }) {
  return (
    <div className="card elev-sm streak-card" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Reading activity</div>
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
            <div className="streak-card-caption">Read an article today to keep it going.</div>
          </div>
        ) : (
          <div>
            <div className="streak-card-value streak-card-value--zero">No streak yet</div>
            <div className="streak-card-caption">Read an article to start one.</div>
          </div>
        )}
      </div>
    </div>
  );
}
