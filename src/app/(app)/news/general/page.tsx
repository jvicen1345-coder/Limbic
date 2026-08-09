import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { NewsRow } from "@/components/RowCards";
import { Pagination } from "@/components/Pagination";
import { parsePageParam, paginate } from "@/lib/pagination";
import { NEWS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import type { ArticleType } from "@/lib/types";

// Same "not research, not a CE/community event, not an APTA-specific story" slice this
// content used to occupy as the Home sidebar's old auto-rotating "Latest news" card (see
// components/RevolvingNews.tsx, removed) — guideline/industry/product coverage, now a full
// paginated list here instead of a 6-item rotating ticker.
const GENERAL_NEWS_TYPES: ArticleType[] = ["guideline", "industry", "product"];

export default async function GeneralNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [allArticles, savedRows, { page: requestedPage }] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  const generalArticlesAll = allArticles
    .filter((a) => GENERAL_NEWS_TYPES.includes(a.type))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { pageItems, page, totalPages } = paginate(generalArticlesAll, parsePageParam(requestedPage));
  const generalArticles = pageItems.map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>News</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Clinical guidelines, industry & policy coverage, and new equipment — everything
        outside of APTA&rsquo;s own newsroom.
      </p>
      <SubTabs tabs={NEWS_TABS} />
      {generalArticles.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {generalArticles.map((a) => (
              <NewsRow key={a.id} article={a} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/news/general" />
        </>
      ) : (
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>No general news available right now.</p>
      )}
    </div>
  );
}
