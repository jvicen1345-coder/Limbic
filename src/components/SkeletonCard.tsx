/** Generic shimmering placeholder shaped like a .card — used by the loading.tsx files
 *  under app/(app)/* while a page's real Server Component data is still fetching. Takes no
 *  props: every caller just needs "a card-shaped thing," not real content, so there's
 *  nothing to parameterize. */
export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-line" style={{ width: "40%", height: 10 }} />
      <div className="skeleton-line" style={{ width: "100%", height: 18 }} />
      <div className="skeleton-line" style={{ width: "85%", height: 14 }} />
      <div className="skeleton-line" style={{ width: "55%", height: 10 }} />
    </div>
  );
}
