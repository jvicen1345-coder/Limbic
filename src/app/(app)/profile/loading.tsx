/** Shown while app/(app)/profile/page.tsx's data (license, founding-funder status, topic
 *  lists) is still fetching. Role/Theme are kicker + value + action; Subscription also
 *  has a status/meta line before the action. */
export default function ProfileLoading() {
  return (
    <div className="screen-pad">
      <div className="skeleton-line" style={{ width: 100, height: 24, marginBottom: 16 }} />

      <div className="profile-header-grid">
        <div className="card elev-sm skeleton-card profile-status-card">
          <div className="skeleton-line" style={{ width: "40%", height: 12 }} />
          <div className="skeleton-line" style={{ width: "55%", height: 22 }} />
          <div className="skeleton-line profile-status-action" style={{ width: "28%", height: 12 }} />
        </div>
        <div className="card elev-sm skeleton-card profile-status-card">
          <div className="skeleton-line" style={{ width: "40%", height: 12 }} />
          <div className="skeleton-line" style={{ width: "35%", height: 22 }} />
          <div className="skeleton-line profile-status-action" style={{ width: "28%", height: 12 }} />
        </div>
        <div className="card elev-sm skeleton-card profile-status-card">
          <div className="skeleton-line" style={{ width: "50%", height: 12 }} />
          <div className="skeleton-line" style={{ width: "45%", height: 22 }} />
          <div className="skeleton-line profile-status-meta" style={{ width: "70%", height: 12 }} />
          <div className="skeleton-line profile-status-action" style={{ width: "28%", height: 12 }} />
        </div>
      </div>
    </div>
  );
}
