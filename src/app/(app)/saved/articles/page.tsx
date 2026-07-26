import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SavedListRow } from "@/components/RowCards";

export default async function SavedArticlesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, savedRows] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const savedArticlesOnly = articles
    .filter((a) => savedIds.includes(a.id) && a.type !== "guideline")
    .map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Articles</h1>
      {savedArticlesOnly.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {savedArticlesOnly.map((a) => (
            <SavedListRow key={a.id} article={a} badge="type" />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved articles yet — bookmark research, industry or CE items to see them here.
        </p>
      )}
    </div>
  );
}
