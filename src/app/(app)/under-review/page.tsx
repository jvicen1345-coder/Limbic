import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { ReviewCard } from "@/components/RowCards";

export default async function UnderReviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.licenseNumber) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Under Review</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          Available to signed-in clinicians only — add your license from your profile to unlock this.
        </p>
      </div>
    );
  }

  const [articles, savedRows] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const reviewArticles = articles.filter((a) => a.underReview).map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Under Review</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Articles pinged for editorial review, with the reason flagged.
      </p>
      {reviewArticles.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviewArticles.map((a) => (
            <ReviewCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No articles currently flagged for review.</p>
      )}
    </div>
  );
}
