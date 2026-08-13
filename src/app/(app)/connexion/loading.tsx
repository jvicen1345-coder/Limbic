/** Shown while app/(app)/connexion/page.tsx's data is still fetching. Reuses the real
 *  page's own .connexion-hero/.connexion-feature-grid/.connexion-feature-card classes so
 *  the three feature cards land in the exact same layout once real content replaces this. */
export default function ConnexionLoading() {
  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="connexion-hero">
        <div className="skeleton-line" style={{ width: "60%", height: 30, margin: "0 auto 10px" }} />
        <div className="skeleton-line" style={{ width: "80%", height: 14, margin: "0 auto" }} />
      </div>

      <div className="connexion-feature-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="connexion-feature-card">
            <div className="skeleton-line" style={{ width: 22, height: 22, borderRadius: "50%", marginBottom: 12 }} />
            <div className="skeleton-line" style={{ width: "70%", height: 16, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: "100%", height: 12, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: "90%", height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
