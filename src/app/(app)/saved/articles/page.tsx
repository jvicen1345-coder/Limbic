import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { snapshotToArticle } from "@/lib/saved-snapshot";
import type { Article } from "@/lib/types";
import { SavedArticlesTabs } from "@/components/SavedArticlesTabs";

export default async function SavedArticlesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const savedRows = await prisma.savedArticle.findMany({ where: { userId: user.id } });
  const savedIds = savedRows.map((r) => r.articleId);

  // See saved/guidelines/page.tsx — snapshot-backed rows render without needing the
  // article to still be in a fresh live fetch; only legacy (pre-snapshot) rows fall back
  // to matching against the current batch.
  const snapshotted = new Map(savedRows.map((r) => [r.articleId, snapshotToArticle(r)]));
  const legacyIds = savedRows.filter((r) => snapshotted.get(r.articleId) == null).map((r) => r.articleId);
  const legacyArticles = legacyIds.length ? (await getArticles()).filter((a) => legacyIds.includes(a.id)) : [];

  const allSaved: Article[] = [...[...snapshotted.values()].filter((a): a is Article => a != null), ...legacyArticles];
  const savedArticles = allSaved.filter((a) => a.type !== "guideline").map((a) => decorateArticle(a, savedIds));

  return <SavedArticlesTabs articles={savedArticles} />;
}
