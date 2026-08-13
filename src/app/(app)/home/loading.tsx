import { SkeletonCard } from "@/components/SkeletonCard";

/** Shown automatically by Next.js while app/(app)/home/page.tsx's Server Component data
 *  (articles, images, dashboard stats, …) is still fetching — reuses the real page's own
 *  layout classes (.home-pad/.home-row/.home-main-col/.home-cards-grid/.home-aside-col) so
 *  the swap into real content lands in the exact same grid instead of visibly reflowing. */
export default function HomeLoading() {
  return (
    <div className="home-pad">
      <div className="home-row">
        <div className="home-main-col">
          <div style={{ marginBottom: 18 }}>
            <div className="skeleton-line" style={{ width: 220, height: 26, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: 150, height: 13 }} />
          </div>

          <div className="card skeleton-card" style={{ marginBottom: 16, height: 320, justifyContent: "flex-end" }}>
            <div className="skeleton-line" style={{ width: "70%", height: 20 }} />
            <div className="skeleton-line" style={{ width: "40%", height: 13 }} />
          </div>

          <div className="cards-grid home-cards-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

        <aside className="home-aside-col">
          <div className="home-aside-scroll">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton-line" style={{ width: "45%", height: 11 }} />
                <div className="skeleton-line" style={{ width: "100%", height: 13 }} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
