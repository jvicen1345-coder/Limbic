/** Shown while app/(app)/boards/page.tsx's data (today's question/term/case, streak,
 *  per-domain progress) is still fetching. Mirrors the real page's header, daily games
 *  strip, tab bar and daily card closely enough that nothing visibly jumps once the real
 *  content lands — which means it has to carry all four tab labels and the games section
 *  the real page renders above the tabs, not the three-tab, no-games shape it kept after
 *  Research & Stats and Daily Games moved onto the page. */
export default function BoardsLoading() {
  return (
    <div className="screen-pad boards-question-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="boards-page-header">
        <div className="skeleton-line" style={{ width: 160, height: 24 }} />
        <div className="skeleton-line" style={{ width: 150, height: 20, borderRadius: 999 }} />
      </div>

      <div className="skeleton-line" style={{ width: 120, height: 19, margin: "16px 0 12px" }} />
      <div className="card skeleton-card" style={{ height: 120, marginBottom: 24 }}>
        <div className="skeleton-line" style={{ width: "45%", height: 14 }} />
        <div className="skeleton-line" style={{ width: "80%", height: 14 }} />
      </div>

      <div className="boards-tabs" role="presentation" aria-hidden="true">
        {["Daily Sharpening", "NPTE Breakdown", "Research & Stats", "Resources"].map((label) => (
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
