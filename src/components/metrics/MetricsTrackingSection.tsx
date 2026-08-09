import Link from "next/link";
import { buildSparklinePath, trendDirection, type MetricsLogMetric } from "@/lib/metrics";
import { ChevronRightIcon } from "@/components/icons";

export interface MetricsLogEntry {
  id: string;
  metric: MetricsLogMetric;
  value: number;
  loggedAt: Date;
}

const TRACKED_METRICS: { key: MetricsLogMetric; label: string; unit: string; decimals: number }[] = [
  { key: "bmi", label: "BMI", unit: "", decimals: 1 },
  { key: "hrv", label: "HRV", unit: "ms", decimals: 0 },
  { key: "vo2max", label: "VO2 Max", unit: "mL/kg/min", decimals: 1 },
];

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

/** The "Your Metrics Over Time" tracking dashboard — purely presentational, given already-
 *  fetched log rows (see app/(app)/wellness/metrics/page.tsx) grouped and chronologically
 *  sorted per metric. Pure-SVG sparklines, same approach as components/StockCard.tsx. */
export function MetricsTrackingSection({ logs }: { logs: MetricsLogEntry[] }) {
  const byMetric = new Map<MetricsLogMetric, MetricsLogEntry[]>();
  for (const log of logs) {
    const list = byMetric.get(log.metric) ?? [];
    list.push(log);
    byMetric.set(log.metric, list);
  }

  const recentFive = [...logs].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()).slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
          BMI, HRV, and VO2 Max results you&rsquo;ve saved from the calculators above, over time.
        </p>
        <a href="#calculators" className="wellness-snapshot-link" style={{ marginTop: 0, whiteSpace: "nowrap" }}>
          Log today&rsquo;s metrics →
        </a>
      </div>

      <div className="wellness-tracking-grid">
        {TRACKED_METRICS.map((m) => {
          const entries = (byMetric.get(m.key) ?? []).sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
          if (entries.length === 0) {
            return (
              <div key={m.key} className="wellness-tracking-card">
                <div className="wellness-tracking-label">{m.label}</div>
                <p className="wellness-tracking-empty">Not logged yet — use the {m.label} calculator above to start tracking.</p>
              </div>
            );
          }
          const values = entries.map((e) => e.value);
          const latest = entries[entries.length - 1];
          const trend = trendDirection(values);
          const path = buildSparklinePath(values);
          return (
            <div key={m.key} className="wellness-tracking-card">
              <div className="wellness-tracking-label">{m.label}</div>
              <div className="wellness-tracking-value-row">
                <span className="wellness-tracking-value">
                  {latest.value.toFixed(m.decimals)}
                  {m.unit ? ` ${m.unit}` : ""}
                </span>
                <span className={`wellness-tracking-trend wellness-tracking-trend--${trend}`}>{TREND_ARROW[trend]}</span>
              </div>
              <svg width="100%" height="40" viewBox="0 0 220 60" preserveAspectRatio="none" style={{ display: "block", margin: "8px 0" }}>
                <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="wellness-tracking-date">
                Last logged {latest.loggedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>

      {recentFive.length > 0 && (
        <div className="wellness-log-history">
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
            View self-assessment scores <ChevronRightIcon size={12} style={{ display: "inline", verticalAlign: "middle" }} />
          </Link>
        </div>
      )}
    </div>
  );
}
