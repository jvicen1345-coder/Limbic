/** Shown while app/(app)/wellness/page.tsx's data (vitals profile, metrics logs, article
 *  pool) is still fetching. Reuses the real page's own .wellness-hub-page/-snapshot-card/
 *  -explore-grid classes for layout fidelity. */
export default function WellnessLoading() {
  return (
    <div className="screen-pad wellness-hub-page" style={{ maxWidth: 980 }}>
      <div className="wellness-hub-header">
        <div className="skeleton-line" style={{ width: 240, height: 26, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: 160, height: 13 }} />
      </div>

      <div className="wellness-snapshot-card">
        <div className="skeleton-line" style={{ width: "30%", height: 11, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1 }}>
              <div className="skeleton-line" style={{ width: "60%", height: 11, marginBottom: 8 }} />
              <div className="skeleton-line" style={{ width: "40%", height: 20 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="wellness-explore-grid" style={{ marginTop: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="wellness-explore-card">
            <div className="skeleton-line" style={{ width: 22, height: 22, marginBottom: 12 }} />
            <div className="skeleton-line" style={{ width: "60%", height: 14, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: "90%", height: 11 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
