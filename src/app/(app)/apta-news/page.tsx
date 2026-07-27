import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAptaNewsArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { AptaNewsRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";

export default async function AptaNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.licenseNumber) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>APTA News</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          Available to signed-in clinicians only — add your license from your profile to unlock this.
        </p>
      </div>
    );
  }

  const [aptaArticlesAll, savedRows, { page: requestedPage }] = await Promise.all([
    getAptaNewsArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const { pageItems, page, totalPages } = paginate(aptaArticlesAll, parsePageParam(requestedPage));
  const aptaArticles = pageItems.map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>APTA News</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        The latest from{" "}
        <a href="https://www.apta.org/news" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
          apta.org/news
        </a>
        .
      </p>
      {aptaArticles.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {aptaArticles.map((a) => (
              <AptaNewsRow key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/apta-news" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No APTA news available right now.</p>
      )}
    </div>
  );
}
