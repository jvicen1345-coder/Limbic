import { SkeletonCard } from "@/components/SkeletonCard";

/**
 * Shared authenticated loading fallback so in-app navigations can paint AppShell chrome
 * before the destination page's data finishes. Route-specific loaders (e.g. home/loading.tsx)
 * still win when present; this covers Games, Profile, and other (app) routes that lack one.
 */
export default function AppLoading() {
  return (
    <div className="home-pad">
      <div style={{ marginBottom: 18 }}>
        <div className="skeleton-line" style={{ width: 220, height: 26, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: 150, height: 13 }} />
      </div>
      <div className="cards-grid" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
