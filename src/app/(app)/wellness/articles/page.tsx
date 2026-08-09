import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles, WELLNESS_VIDEOS } from "@/lib/articles";
import { computeWellnessSet, WELLNESS_ARTICLE_TARGET, WELLNESS_VIDEO_TARGET } from "@/lib/wellness-rotation";
import { WellnessListItem } from "@/components/RowCards";
import { WellnessVideoCard } from "@/components/WellnessVideoCard";
import { RefreshWellnessButton } from "@/components/RefreshWellnessButton";
import { ArrowLeftIcon } from "@/components/icons";

/** The full Health & Wellness reading/watching feed — this used to be the whole
 *  /wellness page before the Overview became a hub with just a 3-article preview (see
 *  app/(app)/wellness/page.tsx's "Latest Wellness Articles" section and its "View all"
 *  link here). Rotation/refresh logic is unchanged from before that split. */
export default async function WellnessArticlesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articlePool, savedArticleRows, savedWellnessRows] = await Promise.all([
    getWellnessArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    prisma.savedWellness.findMany({ where: { userId: user.id }, select: { itemId: true } }),
  ]);
  const savedIds = new Set([...savedArticleRows.map((r) => r.articleId), ...savedWellnessRows.map((r) => r.itemId)]);

  const storedArticleIds = (user.wellnessArticleIds as string[]) ?? [];
  const storedVideoIds = (user.wellnessVideoIds as string[]) ?? [];
  const openedIds = (user.wellnessOpenedIds as string[]) ?? [];

  const articleIds = computeWellnessSet(
    articlePool.map((a) => a.id),
    storedArticleIds,
    openedIds,
    WELLNESS_ARTICLE_TARGET,
    false
  );
  const videoIds = computeWellnessSet(WELLNESS_VIDEOS.map((v) => v.id), storedVideoIds, openedIds, WELLNESS_VIDEO_TARGET, false);

  const articleIdsChanged = JSON.stringify(articleIds) !== JSON.stringify(storedArticleIds);
  const videoIdsChanged = JSON.stringify(videoIds) !== JSON.stringify(storedVideoIds);
  if (articleIdsChanged || videoIdsChanged) {
    await prisma.user.update({
      where: { id: user.id },
      data: { wellnessArticleIds: articleIds, wellnessVideoIds: videoIds },
    });
  }

  const articlePoolById = new Map(articlePool.map((a) => [a.id, a]));
  const wellnessArticles = articleIds.map((id) => articlePoolById.get(id)).filter((a) => a != null);
  const videoPoolById = new Map(WELLNESS_VIDEOS.map((v) => [v.id, v]));
  const videos = videoIds.map((id) => videoPoolById.get(id)).filter((v) => v != null);

  return (
    <div className="screen-pad">
      <Link href="/wellness" className="wellness-back-link">
        <ArrowLeftIcon size={14} />
        Back to Health &amp; Wellness
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, margin: "10px 0 4px" }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Wellness Articles &amp; Videos</h1>
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
          <WellnessListItem key={w.id} w={w} saved={savedIds.has(w.id)} opened={openedIds.includes(w.id)} />
        ))}
      </div>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
        Video recommendations
      </div>
      <div className="video-grid">
        {videos.map((v) => (
          <WellnessVideoCard key={v.id} video={v} saved={savedIds.has(v.id)} />
        ))}
      </div>
    </div>
  );
}
