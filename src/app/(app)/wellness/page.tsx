import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles, WELLNESS_VIDEOS } from "@/lib/articles";
import { youtubeThumbnailUrl } from "@/lib/meta";
import { WellnessListItem } from "@/components/RowCards";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { RefreshWellnessButton } from "@/components/RefreshWellnessButton";

export default async function WellnessPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [wellnessArticles, savedRows] = await Promise.all([
    getWellnessArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Health & Wellness</h1>
        <RefreshWellnessButton />
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Everyday wellness reading and movement videos for patients and clinicians alike.
      </p>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
        Articles
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
        {wellnessArticles.map((w) => (
          <WellnessListItem key={w.id} w={w} saved={savedIds.includes(w.id)} />
        ))}
      </div>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
        Video recommendations
      </div>
      <div className="video-grid">
        {WELLNESS_VIDEOS.map((v) => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card elev-sm"
            style={{ padding: 0, overflow: "hidden", color: "inherit", textDecoration: "none", display: "block" }}
          >
            <VideoThumbnail src={youtubeThumbnailUrl(v.url)} />
            <div style={{ padding: "12px 14px" }}>
              <div className="card-title" style={{ fontSize: 14.5, margin: "0 0 4px" }}>
                {v.title}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>
                {v.source}
                {v.duration ? ` · ${v.duration}` : ""}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
