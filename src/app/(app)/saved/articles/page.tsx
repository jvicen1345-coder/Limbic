import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SavedListRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";

export default async function SavedArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, savedRows, { page: requestedPage }] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const savedArticlesAll = articles.filter((a) => savedIds.includes(a.id) && a.type !== "guideline");
  const { pageItems, page, totalPages } = paginate(savedArticlesAll, parsePageParam(requestedPage));
  const savedArticlesOnly = pageItems.map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Articles</h1>
      {savedArticlesOnly.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {savedArticlesOnly.map((a) => (
              <SavedListRow key={a.id} article={a} badge="type" />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/saved/articles" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved articles yet — bookmark research, industry or CE items to see them here.
        </p>
      )}
    </div>
  );
}
