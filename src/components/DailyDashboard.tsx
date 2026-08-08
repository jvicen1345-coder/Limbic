import Link from "next/link";
import { CheckCircleIcon, ZapIcon } from "@/components/icons";
import { CountUp } from "@/components/CountUp";

export interface DailyDashboardData {
  greeting: string;
  dateLabel: string;
  newStudiesToday: number;
  newGuidelinesToday: number;
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
  zeroMessage,
  zeroIcon,
  animateValue = false,
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
  /** A different empty-state treatment for tiles where "0" is a normal, non-alarming
   *  state worth a short encouraging note rather than a bare number — e.g. Day streak's
   *  "Start your streak today" or Unfinished's "All caught up". Ignored when
   *  upToDateWhenZero already handles zero for this tile (Studies/Guidelines). */
  zeroMessage?: string;
  zeroIcon?: React.ReactNode;
  /** Counts up from 0 to `value` on mount instead of rendering it immediately — see
   *  components/CountUp.tsx. Used just for Day streak below. */
  animateValue?: boolean;
}) {
  const isUpToDate = upToDateWhenZero && value === 0;
  const isEncouragingZero = !upToDateWhenZero && !!zeroMessage && value === 0;
  return (
    <Link href={href} className="card elev-sm dashboard-metric-tile" title={title}>
      <div className="card-kicker">{label}</div>
      {isUpToDate ? (
        <div className="dashboard-metric-uptodate">
          <span aria-hidden="true">✓</span>
          Up to date
        </div>
      ) : isEncouragingZero ? (
        <div className="dashboard-metric-zero">
          {zeroIcon}
          {zeroMessage}
        </div>
      ) : (
        <div className="dashboard-metric-value">{animateValue ? <CountUp value={value} /> : value}</div>
      )}
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
      <MetricTile
        label="Day streak"
        title="Current reading streak"
        value={data.streakDays}
        href="/profile"
        animateValue
        zeroMessage="Start your streak today"
        zeroIcon={<ZapIcon size={12} />}
      />
      <MetricTile label="CE hours" title="CE hours completed" value={data.ceHoursCompleted} href="/profile" />
      <MetricTile
        label="Unfinished"
        title="Saved articles still unread"
        value={data.savedUnfinishedCount}
        href="/saved/articles"
        zeroMessage="All caught up"
        zeroIcon={<CheckCircleIcon size={12} />}
      />
    </div>
  );
}
