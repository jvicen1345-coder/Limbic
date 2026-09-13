/** Shown while app/(app)/profile/page.tsx's data (license, founding-funder status, topic
 *  lists) is still fetching. Mirrors Role/Theme (kicker, value, action) — Subscription's
 *  extra status line is the only extra after load. Three equal meta lines used to jump
 *  when the real two-line+action cards landed. */
export default function ProfileLoading() {
  return (
    <div className="screen-pad">
      <div className="skeleton-line" style={{ width: 100, height: 24, marginBottom: 16 }} />

      <div className="profile-header-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card elev-sm skeleton-card profile-status-card">
            <div className="skeleton-line" style={{ width: "40%", height: 12 }} />
            <div className="skeleton-line" style={{ width: "55%", height: 22 }} />
            <div className="skeleton-line profile-status-action" style={{ width: "28%", height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
