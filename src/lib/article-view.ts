import "server-only";
import { prisma } from "@/lib/db";
import { getArticles, getArticleById } from "@/lib/articles";
import { decorateArticle, type DecoratedArticle } from "@/lib/feed";
import { recordArticleRead } from "@/lib/reading";
import { buildThreadsWeb } from "@/lib/threads";
import type { ThreadsNodeData } from "@/lib/threads-graph";

export interface ArticleViewData {
  article: DecoratedArticle;
  related: DecoratedArticle[];
  threadsNodes: ThreadsNodeData[];
}

/** Everything the article detail page needs for one article, in one place — used both by
 *  the server-rendered page (the first article a reader lands on) and by
 *  app/actions/article.ts's swapArticleAction (every article reached afterward via a
 *  Limbic Threads node click, see components/ArticleThreadsSplitView.tsx) — so the two
 *  paths can never quietly drift apart from each other. Returns null for an unknown
 *  article id; the caller decides what that means (404 vs. a swap error message). */
export async function buildArticleView(articleId: string, userId: string): Promise<ArticleViewData | null> {
  const [raw, allArticles, savedRows] = await Promise.all([
    getArticleById(articleId),
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId }, select: { articleId: true } }),
  ]);
  if (!raw) return null;

  // Recorded here (not left to the caller) so it fires the same way regardless of which
  // path reached this article — a swap-in-place needs this exactly as much as a fresh
  // navigation does, since it's the only thing that drives reading history/streaks.
  await recordArticleRead(userId, raw.id);

  const savedIds = savedRows.map((r) => r.articleId);
  const article = decorateArticle(raw, savedIds);
  const related = allArticles
    .filter((a) => a.id !== raw.id && (a.type === raw.type || a.specialty === raw.specialty))
    .slice(0, 3)
    .map((a) => decorateArticle(a, savedIds));
  const threadsNodes = await buildThreadsWeb(raw, allArticles);

  return { article, related, threadsNodes };
}
