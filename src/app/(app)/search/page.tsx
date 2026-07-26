import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SearchScreen } from "@/components/SearchScreen";

export default async function SearchPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, savedRows] = await Promise.all([
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);
  const decorated = articles.map((a) => decorateArticle(a, savedIds));

  return <SearchScreen articles={decorated} />;
}
