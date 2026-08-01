import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { snapshotToArticle } from "@/lib/saved-snapshot";
import type { Article } from "@/lib/types";
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

  const [savedRows, { page: requestedPage }] = await Promise.all([
    prisma.savedArticle.findMany({ where: { userId: user.id } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  // Rows saved after the snapshot fix render directly from what was captured at save
  // time — reliable regardless of whether the article is still in a fresh live fetch.
  // Older rows (saved before that fix existed) fall back to the previous best-effort
  // behavior: matching against the current live batch, which may or may not still have it.
  const snapshotted = new Map(savedRows.map((r) => [r.articleId, snapshotToArticle(r)]));
  const legacyIds = savedRows.filter((r) => snapshotted.get(r.articleId) == null).map((r) => r.articleId);
  const legacyArticles = legacyIds.length
    ? (await getArticles()).filter((a) => legacyIds.includes(a.id))
    : [];

  const savedGuidelinesAll: Article[] = [
    ...[...snapshotted.values()].filter((a): a is Article => a != null),
    ...legacyArticles,
  ].filter((a) => a.type === "guideline");

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
