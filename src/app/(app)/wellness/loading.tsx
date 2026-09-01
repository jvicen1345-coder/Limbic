/** Shown while app/(app)/wellness/page.tsx's data (vitals logs, metrics logs, article pool)
 *  is still fetching. Mirrors the real page's own layout — Quick Actions bar, Ask Limbic
 *  Agent banner, Today's Tip, then the two-row Explore grid — using those same classes for
 *  layout fidelity, so nothing shifts when the real content lands. */
export default function WellnessLoading() {
  return (
    <div className="screen-pad wellness-hub-page" style={{ maxWidth: 980 }}>
      <div className="wellness-hub-header">
        <div className="skeleton-line" style={{ width: 240, height: 26, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: 160, height: 13 }} />
      </div>

      <div className="wellness-quick-actions">
        {[1, 2, 3].map((i) => (
          <div key={i} className="wellness-quick-action">
            <div className="skeleton-line" style={{ width: "60%", height: 13 }} />
          </div>
        ))}
      </div>

      <div className="wellness-agent-banner">
        <div className="wellness-agent-banner-main" style={{ flex: 1 }}>
          <div className="skeleton-line" style={{ width: 70, height: 14, marginBottom: 10 }} />
          <div className="skeleton-line" style={{ width: 180, height: 18, marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: "70%", height: 13 }} />
        </div>
        <div className="skeleton-line" style={{ width: 150, height: 44, borderRadius: 8 }} />
      </div>

      <div className="wellness-tip-card">
        <div className="skeleton-line" style={{ width: 90, height: 11, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: "95%", height: 13, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: "60%", height: 13 }} />
      </div>

      <div className="wellness-explore-rows">
        <div className="wellness-explore-grid wellness-explore-grid--primary">
          {[1, 2].map((i) => (
            <div key={i} className="wellness-explore-card wellness-explore-card--primary">
              <div className="skeleton-line" style={{ width: 22, height: 22, marginBottom: 12 }} />
              <div className="skeleton-line" style={{ width: "50%", height: 15, marginBottom: 6 }} />
              <div className="skeleton-line" style={{ width: "90%", height: 12 }} />
            </div>
          ))}
        </div>
        <div className="wellness-explore-grid wellness-explore-grid--secondary">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="wellness-explore-card wellness-explore-card--secondary">
              <div className="skeleton-line" style={{ width: 18, height: 18, marginBottom: 10 }} />
              <div className="skeleton-line" style={{ width: "60%", height: 14, marginBottom: 6 }} />
              <div className="skeleton-line" style={{ width: "90%", height: 11 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
