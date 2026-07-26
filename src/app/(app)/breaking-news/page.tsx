import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { BreakingListRow } from "@/components/RowCards";

export default async function BreakingNewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.licenseNumber) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Breaking News</h1>
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
  const breakingArticles = articles
    .filter((a) => a.breaking)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Breaking News</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Recently flagged as breaking, shown first in your feed.
      </p>
      {breakingArticles.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {breakingArticles.map((a) => (
            <BreakingListRow key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Nothing flagged as breaking right now.</p>
      )}
    </div>
  );
}
