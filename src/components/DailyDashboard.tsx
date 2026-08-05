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

function MetricTile({
  label,
  title,
  value,
  href,
  upToDateWhenZero = false,
}: {
  label: string;
  title: string;
  value: number;
  href: string;
  /** A bare "0" reads as a broken counter rather than "nothing new today" — so for
   *  counts of new items (Studies/Guidelines), a zero swaps to a quiet "Up to date"
   *  checkmark instead. Opt-in per tile since it wouldn't make sense for a streak, an
   *  hours total, or an unfinished count (see DailyDashboard's own tile list below). */
  upToDateWhenZero?: boolean;
}) {
  const isUpToDate = upToDateWhenZero && value === 0;
  return (
    <Link href={href} className="card elev-sm dashboard-metric-tile" title={title}>
      <div className="card-kicker">{label}</div>
      {isUpToDate ? (
        <div className="dashboard-metric-uptodate">
          <span aria-hidden="true">✓</span>
          Up to date
        </div>
      ) : (
        <div className="dashboard-metric-value">{value}</div>
      )}
    </Link>
  );
}

function QuestionOfDayTile() {
  return (
    <Link href="/boards" className="card elev-sm dashboard-metric-tile" title="Answer today's question">
      <div className="card-kicker">Question</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="tag tag-accent">Ready</span>
        <ChevronRightIcon size={16} style={{ color: "var(--color-accent-700)", flexShrink: 0 }} />
      </div>
    </Link>
  );
}

/** The Home page's "morning briefing" row — greeting/date live in HomeFeed's own header
 *  (see app/(app)/page.tsx for how both are put together), this is just the scannable
 *  strip of metric tiles underneath it. Labels are kept short deliberately (a fuller
 *  "New studies today" wraps unevenly next to "Day streak" in a tile this narrow) — each
 *  tile's `title` carries the fuller wording as a hover tooltip instead. Every tile links
 *  through to where that number actually lives, so the row doubles as quick navigation. */
export function DailyDashboard({ data }: { data: DailyDashboardData }) {
  return (
    <div className="dashboard-metrics-row">
      <MetricTile
        label="Studies"
        title="New studies published today"
        value={data.newStudiesToday}
        href="/search?type=research&new=1"
        upToDateWhenZero
      />
      <MetricTile
        label="Guidelines"
        title="New guideline updates today"
        value={data.newGuidelinesToday}
        href="/search?type=guideline&new=1"
        upToDateWhenZero
      />
      {data.showQuestionOfDay && <QuestionOfDayTile />}
      <MetricTile label="Day streak" title="Current reading streak" value={data.streakDays} href="/profile" />
      <MetricTile label="CE hours" title="CE hours completed" value={data.ceHoursCompleted} href="/profile" />
      <MetricTile label="Unfinished" title="Saved articles still unread" value={data.savedUnfinishedCount} href="/saved/articles" />
    </div>
  );
}
