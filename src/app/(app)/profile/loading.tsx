/** Shown while app/(app)/profile/page.tsx's data (license, founding-funder status, topic
 *  lists) is still fetching. Mirrors the real page's header + .profile-header-grid Role /
 *  Theme / Subscription cards closely enough to avoid a jump once real content lands. */
export default function ProfileLoading() {
  return (
    <div className="screen-pad">
      <div className="skeleton-line" style={{ width: 100, height: 24, marginBottom: 16 }} />

      <div className="profile-header-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card skeleton-card">
            <div className="skeleton-line" style={{ width: "40%", height: 12 }} />
            <div className="skeleton-line" style={{ width: "55%", height: 22 }} />
            <div className="skeleton-line" style={{ width: "30%", height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
