import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getAptaNewsArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { NewsRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";
import { NEWS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

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
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>News</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        News and coverage of the American Physical Therapy Association, from{" "}
        <a href="https://www.apta.org/news" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
          apta.org
        </a>{" "}
        and other outlets — each story links back to its original source below.
      </p>
      <SubTabs tabs={NEWS_TABS} />
      {aptaArticles.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {aptaArticles.map((a) => (
              <NewsRow key={a.id} article={a} badgeLabel="APTA News" badgeClassName="tag tag-accent" />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/news" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No APTA news available right now.</p>
      )}
    </div>
  );
}
