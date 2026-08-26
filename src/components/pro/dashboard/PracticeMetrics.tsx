import { UsersIcon } from "@/components/icons";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";

const REASSESSMENT_AMBER = "#c9853a";
// Above this share of the active caseload being due for reassessment at once, the tile
// flags amber rather than the calm success green — same threshold family as the Daily
// Brief bar's own amber, just expressed as a rate instead of a raw count.
const HIGH_REASSESSMENT_RATE = 0.25;

/** Zone 3 of /pro/dashboard — three read-only practice metrics computed straight off the
 *  already-loaded active caseload (see ClinicianDashboard.tsx's `patients` prop), so this
 *  needs no server action or extra data fetch of its own. */
export function PracticeMetrics({ patients }: { patients: PatientListEntry[] }) {
  const activeCount = patients.length;

  // "Episode length" here means the planned length of care (totalVisits) averaged across
  // the active caseload, not visitCount — visitCount is where each patient currently is in
  // that plan, which would understate a fresh caseload rather than describe how long a
  // typical episode is designed to run.
  const avgEpisodeLength = activeCount > 0 ? patients.reduce((sum, p) => sum + p.totalVisits, 0) / activeCount : 0;

  const regionCounts = new Map<string, number>();
  for (const p of patients) regionCounts.set(p.bodyRegion, (regionCounts.get(p.bodyRegion) ?? 0) + 1);
  const regions = Array.from(regionCounts.entries()).sort((a, b) => b[1] - a[1]);
  const maxRegionCount = Math.max(1, ...regions.map(([, c]) => c));

  const dueCount = patients.filter((p) => p.dueForReassessment).length;
  const reassessRate = activeCount > 0 ? dueCount / activeCount : 0;
  const rateIsHigh = reassessRate > HIGH_REASSESSMENT_RATE;

  return (
    <div className="clindash-metrics-row">
      <div className="card elev-sm">
        <div className="card-kicker">Episode Length</div>
        <div className="clindash-metric-card-value">{activeCount > 0 ? avgEpisodeLength.toFixed(1) : "—"}</div>
        <div className="clindash-metric-card-sub">Average planned visits per active episode</div>
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Caseload by Region</div>
        {regions.length === 0 ? (
          <p className="clindash-metric-card-sub" style={{ marginTop: 8 }}>
            No active patients yet.
          </p>
        ) : (
          <div className="clindash-region-bars">
            {regions.map(([region, count]) => (
              <div className="clindash-region-bar-row" key={region}>
                <span className="clindash-region-bar-label">{region}</span>
                <span className="clindash-region-bar-track">
                  <span className="clindash-region-bar-fill" style={{ width: `${(count / maxRegionCount) * 100}%` }} />
                </span>
                <span className="clindash-region-bar-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card elev-sm">
        <div className="card-kicker">Reassessment Rate</div>
        <div
          className="clindash-metric-card-value"
          style={{ color: activeCount > 0 && rateIsHigh ? REASSESSMENT_AMBER : "var(--color-success)" }}
        >
          {activeCount > 0 ? `${Math.round(reassessRate * 100)}%` : "—"}
        </div>
        <div className="clindash-metric-card-sub">
          {dueCount} of {activeCount} active patients due
        </div>
      </div>
    </div>
  );
}

/** Zone 4 — a static, non-interactive card describing the multi-clinician expansion this
 *  schema is already shaped for (every clinical model here is scoped by a single userId
 *  today — see schema.prisma's ClinicalPatient and friends). Nothing on this page links
 *  anywhere from it; it's a preview of what's coming, not a feature toggle. */
export function ClinicProPlaceholder() {
  return (
    <div className="clindash-expansion-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--color-text)" }}>
        <UsersIcon size={16} />
        <strong style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>Clinic PRO</strong>
      </div>
      Share a caseload across a full clinic — multiple clinicians, shared scheduling, and practice-wide reporting on
      top of the same clinician dashboard you&rsquo;re using today. Coming soon.
    </div>
  );
}
