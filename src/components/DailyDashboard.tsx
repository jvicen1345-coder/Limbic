import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export interface DailyDashboardData {
  greeting: string;
  dateLabel: string;
  newStudiesToday: number;
  newGuidelinesToday: number;
  /** Limbic Boards' daily question — a student-only product, plus licensed PT/clinician
   *  accounts get access to just this one question (see app/(app)/boards/page.tsx). False
   *  for the general population, who see no card at all rather than a locked one. */
  showQuestionOfDay: boolean;
  streakDays: number;
  ceHoursCompleted: number;
  savedUnfinishedCount: number;
}

function MetricTile({ label, title, value }: { label: string; title: string; value: number }) {
  return (
    <div className="card elev-sm dashboard-metric-tile" title={title}>
      <div className="card-kicker">{label}</div>
      <div className="dashboard-metric-value">{value}</div>
    </div>
  );
}

function QuestionOfDayTile() {
  return (
    <div className="card elev-sm dashboard-metric-tile">
      <div className="card-kicker">Question</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="tag tag-accent">Ready</span>
        <Link href="/boards" className="btn btn-ghost btn-icon" aria-label="Answer today's question">
          <ChevronRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
}

/** The Home page's "morning briefing" row — greeting/date live in HomeFeed's own header
 *  (see app/(app)/page.tsx for how both are put together), this is just the scannable
 *  strip of metric tiles underneath it. Labels are kept short deliberately (a fuller
 *  "New studies today" wraps unevenly next to "Day streak" in a tile this narrow) — each
 *  tile's `title` carries the fuller wording as a hover tooltip instead. */
export function DailyDashboard({ data }: { data: DailyDashboardData }) {
  return (
    <div className="dashboard-metrics-row">
      <MetricTile label="Studies" title="New studies published today" value={data.newStudiesToday} />
      <MetricTile label="Guidelines" title="New guideline updates today" value={data.newGuidelinesToday} />
      {data.showQuestionOfDay && <QuestionOfDayTile />}
      <MetricTile label="Day streak" title="Current reading streak" value={data.streakDays} />
      <MetricTile label="CE hours" title="CE hours completed" value={data.ceHoursCompleted} />
      <MetricTile label="Unfinished" title="Saved articles still unread" value={data.savedUnfinishedCount} />
    </div>
  );
}
