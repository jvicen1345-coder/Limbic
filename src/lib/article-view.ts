import "server-only";
import { prisma } from "@/lib/db";
import { getArticles, getArticleById } from "@/lib/articles";
import { decorateArticle, type DecoratedArticle } from "@/lib/feed";
import { recordArticleRead } from "@/lib/reading";
import { buildThreadsWeb } from "@/lib/threads";
import type { ThreadsNodeData } from "@/lib/threads-graph";
import { extractDoiFromUrl, type UnpaywallResult } from "@/lib/unpaywall";
import { getCachedUnpaywall } from "@/lib/unpaywall-cache";
import { getTimeZone } from "@/lib/user-time-zone";
import { breakdownSourceText, type ArticleBreakdown } from "@/lib/article-breakdown-shared";

export interface ArticleViewData {
  article: DecoratedArticle;
  related: DecoratedArticle[];
  threadsNodes: ThreadsNodeData[];
  unpaywallResult: UnpaywallResult | null;
  /** This article's cached study breakdown, when one has already been generated — the
   *  five-field summary shown in place of the abstract (see lib/article-breakdown.ts).
   *  Read here so the overwhelmingly common case (an article some earlier reader already
   *  triggered) is server-rendered with no loading state and no action round-trip. Null
   *  means either "no breakdown cached yet", in which case components/ArticleBreakdown.tsx
   *  generates one on mount, or "this article doesn't get one at all" — the two are told
   *  apart by breakdownSourceText, not by this field. */
  breakdown: ArticleBreakdown | null;
  /** Whether this article renders a breakdown instead of body copy. Decided here, on the
   *  raw article, and passed down as a plain flag rather than re-derived in the reading
   *  pane — `article.fullAbstract` is stripped below for exactly these articles, so a
   *  client-side breakdownSourceText() call would be answering the question from evidence
   *  this view deliberately removed. */
  hasBreakdown: boolean;
}

/** Everything the article detail page needs for one article, in one place — used both by
 *  the server-rendered page (the first article a reader lands on) and by
 *  app/actions/article.ts's swapArticleAction (every article reached afterward via a
 *  Limbic Threads node click, see components/ArticleThreadsSplitView.tsx) — so the two
 *  paths can never quietly drift apart from each other. Returns null for an unknown
 *  article id; the caller decides what that means (404 vs. a swap error message). */
export async function buildArticleView(articleId: string, userId: string, isAdmin: boolean): Promise<ArticleViewData | null> {
  const [raw, allArticles, savedRows] = await Promise.all([
    getArticleById(articleId),
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId }, select: { articleId: true } }),
  ]);
  if (!raw) return null;

  // Only attempt Unpaywall for live articles — seed articles are not real publications
  // and do not have real DOIs or publisher URLs to look up.
  let unpaywallResult: UnpaywallResult | null = null;
  if (raw.live) {
    if (raw.doi) {
      unpaywallResult = await getCachedUnpaywall(raw.doi);
    } else if (raw.sourceUrl) {
      const extractedDoi = extractDoiFromUrl(raw.sourceUrl);
      if (extractedDoi) {
        unpaywallResult = await getCachedUnpaywall(extractedDoi);
      }
    }
  }

  // Recorded here (not left to the caller) so it fires the same way regardless of which
  // path reached this article — a swap-in-place needs this exactly as much as a fresh
  // navigation does, since it's the only thing that drives reading history/streaks.
  await recordArticleRead(userId, raw.id, await getTimeZone());

  const savedIds = savedRows.map((r) => r.articleId);
  const article = decorateArticle(raw, savedIds);
  const related = allArticles
    .filter((a) => a.id !== raw.id && (a.type === raw.type || a.specialty === raw.specialty))
    .slice(0, 3)
    .map((a) => decorateArticle(a, savedIds));
  const threadsNodes = await buildThreadsWeb(raw, allArticles, isAdmin);

  // Only look for a cached breakdown for an article that actually gets one — a seed
  // article with authored body paragraphs never has a row here, so skip the query.
  const hasBreakdown = breakdownSourceText(raw) !== null;
  let breakdown: ArticleBreakdown | null = null;
  if (hasBreakdown) {
    const cached = await prisma.articleBreakdownCache.findUnique({ where: { articleId: raw.id } });
    if (cached) breakdown = cached.breakdownData as unknown as ArticleBreakdown;
  }

  // Drop the untruncated abstract before this crosses to the client. Nothing renders it any
  // more (the breakdown replaced it), but ArticleViewData is a prop on a client component,
  // so anything left on the object is serialized into the page's flight payload and ships
  // to every reader in the HTML — which would put the publisher's full text back on the
  // page, just invisibly, and undo the point of the breakdown. The 320-char `summary`
  // excerpt stays: it's the feed-card blurb the whole app already uses, and the research
  // panel below still reads it.
  const clientArticle = hasBreakdown ? { ...article, fullAbstract: undefined } : article;

  return { article: clientArticle, related, threadsNodes, unpaywallResult, breakdown, hasBreakdown };
}
