import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SearchScreen } from "@/components/SearchScreen";
import { todayLocalDateStr } from "@/lib/today";
import type { ArticleType } from "@/lib/types";

const VALID_TYPES: ArticleType[] = ["research", "guideline", "industry", "ce", "product"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; new?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, savedRows, { type, q, new: newParam }] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    searchParams,
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const decorated = articles.map((a) => decorateArticle(a, savedIds));
  const initialType = VALID_TYPES.includes(type as ArticleType) ? (type as ArticleType) : "all";

  return (
    <SearchScreen
      articles={decorated}
      initialType={initialType}
      initialQuery={q ?? ""}
      initialNewOnly={newParam === "1"}
      todayStr={todayLocalDateStr()}
    />
  );
}
