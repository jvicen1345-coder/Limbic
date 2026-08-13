/** Purely presentational — the actual pattern-matching lives in lib/vitals.ts's
 *  generateInsights, computed server-side in the page from fresh data on every load/
 *  refresh, so this never needs its own client state. */
export function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="card elev-sm">
      <div className="card-kicker">General wellness insights</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Simple patterns from your own logs, not medical advice.
      </p>
      <div style={{ marginTop: 8 }}>
        {insights.map((text, i) => (
          <div key={i} className="vitals-insight-item">
            <span className="vitals-insight-dot" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
