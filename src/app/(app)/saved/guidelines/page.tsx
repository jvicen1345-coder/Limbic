import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SavedListRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";

export default async function SavedGuidelinesPage({
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
  const savedGuidelinesAll = articles.filter((a) => savedIds.includes(a.id) && a.type === "guideline");
  const { pageItems, page, totalPages } = paginate(savedGuidelinesAll, parsePageParam(requestedPage));
  const savedGuidelinesOnly = pageItems.map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 16px" }}>Saved Clinical Guidelines</h1>
      {savedGuidelinesOnly.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {savedGuidelinesOnly.map((a) => (
              <SavedListRow key={a.id} article={a} badge="specialty" />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/saved/guidelines" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          No saved clinical guidelines yet — bookmark a guideline update to see it here.
        </p>
      )}
    </div>
  );
}
