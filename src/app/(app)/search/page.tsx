import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SearchScreen } from "@/components/SearchScreen";
import { todayLocalDateStr } from "@/lib/today";
import { paginate } from "@/lib/pagination";
import { filterSearchArticles, parseSearchQuery, toSearchArticle } from "@/lib/search-articles";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; specialty?: string; q?: string; new?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, savedRows, rawParams] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const query = parseSearchQuery(rawParams);
  const todayStr = todayLocalDateStr();
  const matches = filterSearchArticles(articles, query, todayStr);
  const { pageItems, page, totalPages } = paginate(matches, query.page);
  // Decorate and trim only the current page — the rest of the live + PubMed + CPG pool
  // stays on the server so the Search document does not serialize it for client filtering.
  const cards = pageItems.map((a) => toSearchArticle(decorateArticle(a, savedIds)));

  return (
    <SearchScreen
      articles={cards}
      resultCount={matches.length}
      page={page}
      totalPages={totalPages}
      initialType={query.type}
      initialSpecialty={query.specialty}
      initialQuery={query.q}
      initialNewOnly={query.newOnly}
    />
  );
}
