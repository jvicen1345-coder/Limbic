/** Shown while app/(app)/profile/page.tsx's data (license, founding-funder status, topic
 *  lists) is still fetching. Mirrors the real page's header + .profile-header-grid stat
 *  cards closely enough to avoid a jump once real content lands. */
export default function ProfileLoading() {
  return (
    <div className="screen-pad">
      <div className="skeleton-line" style={{ width: 100, height: 24, marginBottom: 16 }} />

      <div className="profile-header-grid">
        {[1, 2].map((i) => (
          <div key={i} className="card skeleton-card">
            <div className="skeleton-line" style={{ width: "50%", height: 12 }} />
            <div className="skeleton-line" style={{ width: "35%", height: 22 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
