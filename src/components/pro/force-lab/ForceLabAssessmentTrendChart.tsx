import { getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";

export interface AssessmentTrendPoint {
  date: Date;
  leftPeak: number | null;
  rightPeak: number | null;
  lsi: number | null;
}

/** One muscle group's cross-assessment trend, on the patient session page (see
 *  app/(app)/pro/force-lab/patient/[patientCode]/page.tsx, which only renders this for a
 *  muscle group with 2+ assessments) — same CSS-only SVG-polyline pattern as
 *  ForceLabTrendChart.tsx (right/left dual line, shared peak-force scale so a real
 *  side-to-side gap reads as a real gap), plus a third dashed line for LSI. LSI needs no
 *  separate scale computation — it's already a 0-100 value, so `100 - lsi` plots directly
 *  against the same 0-100 viewBox the peak lines use, just interpreted as "% of the axis"
 *  instead of "% of max force". No "use client": purely presentational, safe to render
 *  straight from the server page. */
export function ForceLabAssessmentTrendChart({ muscleGroup, points, unitLabel }: { muscleGroup: string; points: AssessmentTrendPoint[]; unitLabel: string }) {
  if (points.length < 2) {
    return (
      <div className="card elev-sm forcelab-assessment-trend-card">
        <div className="forcelab-assessment-trend-title">{muscleGroup}</div>
        <div className="forcelab-trend-chart">
          <p className="forcelab-trend-need-more">Add a second assessment to see trends across time.</p>
        </div>
      </div>
    );
  }

  const maxForce = Math.max(1, ...points.flatMap((p) => [p.leftPeak ?? 0, p.rightPeak ?? 0]));
  const n = points.length;

  const toPolyline = (values: (number | null)[], scaleMax: number) =>
    values
      .map((v, i) => {
        if (v == null) return null;
        const x = n > 1 ? (i / (n - 1)) * 100 : 50;
        const y = 100 - (v / scaleMax) * 100;
        return `${x},${y}`;
      })
      .filter((p): p is string => p !== null)
      .join(" ");

  const rightLine = toPolyline(points.map((p) => p.rightPeak), maxForce);
  const leftLine = toPolyline(points.map((p) => p.leftPeak), maxForce);
  const lsiLine = toPolyline(points.map((p) => p.lsi), 100);

  const latestLsi = points.filter((p) => p.lsi != null).slice(-1)[0]?.lsi ?? null;
  const lsiColor = latestLsi == null ? "var(--color-neutral-700)" : getLSIStatus(latestLsi) === "normal" ? FORCE_LAB_GREEN : getLSIStatus(latestLsi) === "caution" ? FORCE_LAB_AMBER : FORCE_LAB_RED;

  return (
    <div className="card elev-sm forcelab-assessment-trend-card">
      <div className="forcelab-assessment-trend-title">{muscleGroup}</div>
      <div className="forcelab-trend-chart">
        <svg className="forcelab-trend-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          {rightLine && <polyline points={rightLine} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
          {leftLine && <polyline points={leftLine} fill="none" stroke="#c9853a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
          {lsiLine && (
            <polyline points={lsiLine} fill="none" stroke={lsiColor} strokeWidth="1.25" strokeDasharray="3,2" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>
      <div className="forcelab-trend-axis">
        <span>{points[0] ? new Date(points[0].date).toLocaleDateString() : ""}</span>
        <span>{points[n - 1] ? new Date(points[n - 1].date).toLocaleDateString() : ""}</span>
      </div>
      <div className="forcelab-trend-legend">
        <span className="forcelab-trend-legend-item">
          <span className="forcelab-trend-swatch forcelab-trend-swatch--right" /> Right ({unitLabel})
        </span>
        <span className="forcelab-trend-legend-item">
          <span className="forcelab-trend-swatch forcelab-trend-swatch--left" /> Left ({unitLabel})
        </span>
        <span className="forcelab-trend-legend-item">
          <span className="forcelab-trend-swatch forcelab-trend-swatch--lsi" style={{ background: lsiColor }} /> LSI %
        </span>
      </div>
    </div>
  );
}
