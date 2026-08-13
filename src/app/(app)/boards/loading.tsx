/** Shown while app/(app)/boards/page.tsx's data (today's question/term/case, streak,
 *  activity history) is still fetching. Mirrors the real page's header + tab bar + daily
 *  card shape closely enough that nothing visibly jumps once the real content lands. */
export default function BoardsLoading() {
  return (
    <div className="screen-pad boards-question-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <div className="skeleton-line" style={{ width: 160, height: 24 }} />
        <div className="skeleton-line" style={{ width: 90, height: 20, borderRadius: 999 }} />
      </div>
      <div className="skeleton-line" style={{ width: "70%", height: 13, margin: "8px 0 16px" }} />

      <div className="boards-tabs" role="tablist" aria-hidden="true">
        {["Daily Sharpening", "NPTE Breakdown", "Resources"].map((label) => (
          <div key={label} className="boards-tab">
            {label}
          </div>
        ))}
      </div>

      <div className="card skeleton-card" style={{ marginTop: 16, height: 280 }}>
        <div className="skeleton-line" style={{ width: "35%", height: 12 }} />
        <div className="skeleton-line" style={{ width: "100%", height: 18 }} />
        <div className="skeleton-line" style={{ width: "90%", height: 18 }} />
        <div className="skeleton-line" style={{ width: "60%", height: 18 }} />
      </div>
    </div>
  );
}
