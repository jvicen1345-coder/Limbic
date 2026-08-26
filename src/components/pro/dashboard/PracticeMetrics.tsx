import type { EpisodeLengthStats, PatientListEntry, PeerComparisonBenchmark } from "@/app/actions/clinician-dashboard";

const REASSESSMENT_AMBER = "#c9853a";
// Above this share of the active caseload being due for reassessment at once, the tile
// flags amber rather than the calm success green — same threshold family as the Daily
// Brief bar's own amber, just expressed as a rate instead of a raw count.
const HIGH_REASSESSMENT_RATE = 0.25;

function benchmarkVerdict(benchmark: PeerComparisonBenchmark): { label: string; className: string } {
  if (benchmark.averageImprovement <= 0) {
    return { label: "Review your approach — average scores are not showing meaningful improvement", className: "clindash-benchmark-card-verdict--bad" };
  }
  if (benchmark.averageImprovement >= benchmark.benchmark.mcid) {
    return { label: "Your patients are achieving meaningful clinical improvement on average", className: "clindash-benchmark-card-verdict--good" };
  }
  return {
    label: "Your patients are improving — average improvement has not yet reached MCID threshold",
    className: "clindash-benchmark-card-verdict--warn",
  };
}

/** Zone 3 of /pro/dashboard. The first three cards are computed straight off the
 *  already-loaded active caseload (`patients`); the discharged-episode-length and
 *  peer-comparison sections need their own server-fetched props since none of that is
 *  derivable from the active-only `patients` list. */
export function PracticeMetrics({
  patients,
  episodeLengthStats,
  peerBenchmarks,
}: {
  patients: PatientListEntry[];
  episodeLengthStats: EpisodeLengthStats;
  peerBenchmarks: PeerComparisonBenchmark[];
}) {
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

  const qualifyingRegions = episodeLengthStats.byRegion.filter((r) => r.patientCount >= 2).sort((a, b) => b.patientCount - a.patientCount);

  return (
    <>
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

      <div className="card elev-sm">
        <div className="card-kicker">Episode Length — Discharged</div>
        {episodeLengthStats.totalDischarged === 0 ? (
          <p className="clindash-metric-card-sub" style={{ marginTop: 8 }}>
            Discharge your first patient to start tracking episode length.
          </p>
        ) : (
          <>
            <div className="clindash-metric-card-value">{episodeLengthStats.overallAverageVisits!.toFixed(1)}</div>
            <div className="clindash-metric-card-sub">avg visits to discharge</div>
            {qualifyingRegions.length === 0 ? (
              <p className="clindash-metric-card-sub" style={{ marginTop: 8 }}>
                Not enough data yet.
              </p>
            ) : (
              <table className="clindash-region-stat-table">
                <tbody>
                  {qualifyingRegions.map((r) => (
                    <tr key={r.bodyRegion}>
                      <td>{r.bodyRegion}</td>
                      <td style={{ textAlign: "right" }}>{r.averageVisits.toFixed(1)} avg</td>
                      <td style={{ textAlign: "right" }}>{r.patientCount} patients</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>

    <div className="clindash-benchmarks-section card elev-sm">
      <div className="clindash-benchmarks-header">How Your Patients Compare</div>
      <div className="clindash-benchmarks-subtitle">Based on published MCID values from the literature</div>
      {peerBenchmarks.length === 0 ? (
        <p className="clindash-metric-card-sub" style={{ marginTop: 8 }}>
          Add outcome measures to 2 or more patients to see benchmarks.
        </p>
      ) : (
        <div className="clindash-benchmark-cards">
          {peerBenchmarks.map((b) => {
            const verdict = benchmarkVerdict(b);
            return (
              <div className="card elev-sm" key={b.measureName}>
                <div className="clindash-benchmark-card-measure">{b.measureName}</div>
                <div className="clindash-benchmark-card-stat">
                  {b.averageImprovement > 0 ? "+" : ""}
                  {b.averageImprovement.toFixed(1)} avg improvement
                </div>
                <div className="clindash-benchmark-card-stat">MCID: {b.benchmark.mcid}</div>
                <div className={`clindash-benchmark-card-verdict ${verdict.className}`}>{verdict.label}</div>
                <div className="clindash-benchmark-card-source">MCID source: {b.benchmark.source}</div>
              </div>
            );
          })}
        </div>
      )}
      <p className="clindash-benchmarks-disclaimer">
        Benchmarks are based on published MCID values. Individual patient variation is expected. Use as a reflection
        tool — not a performance judgment.
      </p>
    </div>
    </>
  );
}
