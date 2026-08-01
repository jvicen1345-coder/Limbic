import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles, getWellnessArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { SavedArticlesTabs } from "@/components/SavedArticlesTabs";

export default async function SavedArticlesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articles, wellnessArticles, savedRows] = await Promise.all([
    getArticles(),
    getWellnessArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  const savedIds = savedRows.map((r) => r.articleId);

  const savedArticles = articles
    .filter((a) => savedIds.includes(a.id) && a.type !== "guideline")
    .map((a) => decorateArticle(a, savedIds));
  const savedWellness = wellnessArticles.filter((w) => savedIds.includes(w.id));

  return <SavedArticlesTabs articles={savedArticles} wellness={savedWellness} />;
}
