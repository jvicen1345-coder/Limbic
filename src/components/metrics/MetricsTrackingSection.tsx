import Link from "next/link";
import { trendDirection, type MetricsLogMetric } from "@/lib/metrics";

export interface MetricsLogEntry {
  id: string;
  metric: MetricsLogMetric;
  value: number;
  loggedAt: Date;
}

const TRACKED_METRICS: { key: MetricsLogMetric; label: string; unit: string; decimals: number; color: string }[] = [
  { key: "bmi", label: "BMI", unit: "", decimals: 1, color: "var(--color-accent)" },
  { key: "hrv", label: "HRV", unit: "ms", decimals: 0, color: "var(--color-vitals-mobility)" },
  { key: "vo2max", label: "VO2 Max", unit: "mL/kg/min", decimals: 1, color: "var(--color-vitals-strength)" },
];

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
const CHART_WIDTH = 640;
const CHART_HEIGHT = 160;

/** One path per metric on a SHARED time axis (x = when it was logged, scaled across the
 *  full date range of everything being tracked) but a PER-METRIC value axis (y = that
 *  metric's own min/max normalized 0-1) — BMI, HRV, and VO2 Max are unrelated units, so
 *  sharing x but not y is what makes one combined chart meaningful instead of misleading. */
function buildLinePath(entries: { loggedAt: Date; value: number }[], minDate: number, maxDate: number): string {
  if (entries.length === 0) return "";
  const values = entries.map((e) => e.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const xFor = (t: number) => (maxDate === minDate ? CHART_WIDTH / 2 : ((t - minDate) / (maxDate - minDate)) * CHART_WIDTH);
  const yFor = (v: number) => (range === 0 ? CHART_HEIGHT / 2 : CHART_HEIGHT - ((v - min) / range) * CHART_HEIGHT);
  if (entries.length === 1) {
    const y = yFor(entries[0].value).toFixed(1);
    return `M0,${y} L${CHART_WIDTH},${y}`;
  }
  const points = entries.map((e) => `${xFor(e.loggedAt.getTime()).toFixed(1)},${yFor(e.value).toFixed(1)}`);
  return "M" + points.join(" L");
}

/** The "Your Metrics Over Time" trends dashboard — one shared line chart with BMI, HRV, and
 *  VO2 Max plotted as differently colored lines, rather than three separate sparkline
 *  cards, so trends across metrics are visible at a glance (see app/(app)/wellness/page.tsx
 *  Trends tab for where this renders). */
export function MetricsTrackingSection({ logs }: { logs: MetricsLogEntry[] }) {
  const byMetric = new Map<MetricsLogMetric, MetricsLogEntry[]>();
  for (const log of logs) {
    const list = byMetric.get(log.metric) ?? [];
    list.push(log);
    byMetric.set(log.metric, list);
  }

  const recentFive = [...logs].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()).slice(0, 5);

  const allTimes = logs.map((l) => l.loggedAt.getTime());
  const minDate = allTimes.length ? Math.min(...allTimes) : 0;
  const maxDate = allTimes.length ? Math.max(...allTimes) : 0;

  const series = TRACKED_METRICS.map((m) => {
    const entries = (byMetric.get(m.key) ?? []).sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
    return { ...m, entries, latest: entries[entries.length - 1] ?? null, trend: trendDirection(entries.map((e) => e.value)) };
  });
  const hasAny = series.some((s) => s.entries.length > 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
          BMI, HRV, and VO2 Max results you&rsquo;ve saved from the calculators above, over time.
        </p>
        <Link href="/wellness/metrics#calculators" className="wellness-snapshot-link" style={{ marginTop: 0, whiteSpace: "nowrap" }}>
          Log today&rsquo;s metrics →
        </Link>
      </div>

      <div className="wellness-trend-chart-card">
        {!hasAny ? (
          <p className="wellness-tracking-empty">Not logged yet, use the calculators above to start tracking your trends.</p>
        ) : (
          <>
            <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" style={{ display: "block" }}>
              {series.map((s) =>
                s.entries.length > 0 ? (
                  <path
                    key={s.key}
                    d={buildLinePath(s.entries, minDate, maxDate)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}
            </svg>
            <div className="wellness-trend-legend">
              {series.map((s) =>
                s.entries.length > 0 ? (
                  <div key={s.key} className="wellness-trend-legend-item">
                    <span className="wellness-trend-legend-dot" style={{ background: s.color }} />
                    <span className="wellness-trend-legend-label">{s.label}</span>
                    <span className="wellness-trend-legend-value">
                      {s.latest!.value.toFixed(s.decimals)}
                      {s.unit ? ` ${s.unit}` : ""}
                    </span>
                    <span className={`wellness-tracking-trend wellness-tracking-trend--${s.trend}`}>{TREND_ARROW[s.trend]}</span>
                  </div>
                ) : (
                  <div key={s.key} className="wellness-trend-legend-item wellness-trend-legend-item--empty">
                    <span className="wellness-trend-legend-dot" style={{ background: s.color, opacity: 0.3 }} />
                    <span className="wellness-trend-legend-label">{s.label}</span>
                    <span className="wellness-tracking-empty" style={{ margin: 0 }}>
                      Not logged yet
                    </span>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {recentFive.length > 0 && (
        <div className="wellness-log-history" style={{ marginTop: 16 }}>
          <div className="wellness-tracking-label" style={{ marginBottom: 8 }}>
            Log history
          </div>
          {recentFive.map((entry) => (
            <div key={entry.id} className="wellness-log-history-row">
              <span className="wellness-log-history-date">
                {entry.loggedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="wellness-log-history-metric">{TRACKED_METRICS.find((m) => m.key === entry.metric)?.label ?? entry.metric}</span>
              <span className="wellness-log-history-value">{entry.value.toFixed(1)}</span>
            </div>
          ))}
          <Link href="/wellness/assess" className="wellness-snapshot-link" style={{ marginTop: 10 }}>
            View self-assessment scores
          </Link>
        </div>
      )}
    </div>
  );
}
