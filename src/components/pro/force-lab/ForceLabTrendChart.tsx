import { FORCE_LAB_LEFT } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

/** Right side (blue) / left side (amber) peak-force trend — same CSS-only SVG polyline
 *  shape as OutcomeMeasuresSection.tsx's own TrendChart (see that component's comment on
 *  the absolutely-positioned-SVG sizing bug this pattern already had fixed once — the
 *  explicit width/height on .forcelab-trend-line below is what avoids it recurring here).
 *  Both lines share one Y scale (0 to the larger of the two sides' peak across the whole
 *  series) so a real side-to-side gap reads as a real gap between the lines, not two
 *  independently-normalized ones that would visually hide it. */
export function ForceLabTrendChart({ sessions, unitLabel }: { sessions: ForceLabSession[]; unitLabel: string }) {
  if (sessions.length < 2) {
    return (
      <div className="forcelab-trend-wrap">
        <div className="forcelab-trend-chart">
          <p className="forcelab-trend-need-more">Add a second assessment to see trends across time.</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(1, ...sessions.flatMap((s) => [s.rightPeak ?? 0, s.leftPeak ?? 0]));

  const toPoints = (key: "rightPeak" | "leftPeak") =>
    sessions
      .map((s, i) => ({ x: (i / (sessions.length - 1)) * 100, y: ((s[key] ?? 0) / maxValue) * 100, session: s, value: s[key] }))
      .filter((p) => p.value != null);

  const rightPoints = toPoints("rightPeak");
  const leftPoints = toPoints("leftPeak");
  const toPolyline = (points: { x: number; y: number }[]) => points.map((p) => `${p.x},${100 - p.y}`).join(" ");

  return (
    <div className="forcelab-trend-wrap">
      <div className="forcelab-trend-chart">
        <svg className="forcelab-trend-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          {rightPoints.length > 1 && (
            <polyline points={toPolyline(rightPoints)} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          )}
          {leftPoints.length > 1 && (
            <polyline points={toPolyline(leftPoints)} fill="none" stroke={FORCE_LAB_LEFT} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {rightPoints.map((p, i) => (
          <span
            key={`r${i}`}
            className="forcelab-trend-point forcelab-trend-point--right"
            style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
            title={`Right: ${p.value} ${unitLabel} on ${new Date(p.session.sessionDate).toLocaleDateString()}`}
          />
        ))}
        {leftPoints.map((p, i) => (
          <span
            key={`l${i}`}
            className="forcelab-trend-point forcelab-trend-point--left"
            style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
            title={`Left: ${p.value} ${unitLabel} on ${new Date(p.session.sessionDate).toLocaleDateString()}`}
          />
        ))}
      </div>
      <div className="forcelab-trend-axis">
        <span>{new Date(sessions[0].sessionDate).toLocaleDateString()}</span>
        <span>{new Date(sessions[sessions.length - 1].sessionDate).toLocaleDateString()}</span>
      </div>
      <div className="forcelab-trend-legend">
        <span className="forcelab-trend-legend-item">
          <span className="forcelab-trend-swatch forcelab-trend-swatch--right" /> Right
        </span>
        <span className="forcelab-trend-legend-item">
          <span className="forcelab-trend-swatch forcelab-trend-swatch--left" /> Left
        </span>
      </div>
    </div>
  );
}
