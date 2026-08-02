import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { savedWellnessToArticle } from "@/lib/wellness-rotation";
import { WellnessListItem } from "@/components/RowCards";
import { WellnessVideoCard } from "@/components/WellnessVideoCard";

export default async function SavedWellnessPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rows = await prisma.savedWellness.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];
  const articles = rows.filter((r) => r.kind === "article").map(savedWellnessToArticle);
  // A saved video's sourceUrl is always set (see WellnessVideoCard's snapshot), unlike a
  // saved article's — the filter is just to satisfy the type, not an expected real case.
  const videos = rows
    .filter((r): r is typeof r & { sourceUrl: string } => r.kind === "video" && r.sourceUrl != null)
    .map((r) => ({ id: r.itemId, title: r.title, source: r.source, url: r.sourceUrl, duration: r.duration ?? undefined }));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Health & Wellness</h1>

      {articles.length === 0 && videos.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved wellness reading or videos yet — bookmark something from Health & Wellness to see it here.
        </p>
      ) : (
        <>
          {articles.length > 0 && (
            <>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
                Articles
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
                {articles.map((w) => (
                  <WellnessListItem key={w.id} w={w} saved opened={openedIds.includes(w.id)} />
                ))}
              </div>
            </>
          )}

          {videos.length > 0 && (
            <>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
                Videos
              </div>
              <div className="video-grid">
                {videos.map((v) => (
                  <WellnessVideoCard key={v.id} video={v} saved />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
