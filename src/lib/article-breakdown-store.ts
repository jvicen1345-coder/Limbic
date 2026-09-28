import "server-only";
import { prisma } from "@/lib/db";
import { getArticleById } from "@/lib/articles";
import { generateArticleBreakdown } from "@/lib/article-breakdown";
import { breakdownSourceText, isCurrentBreakdown, type ArticleBreakdown } from "@/lib/article-breakdown-shared";

/**
 * The one place a study breakdown is generated and written to ArticleBreakdownCache —
 * shared by the reader-triggered action (app/actions/article-breakdown.ts), the background
 * upgrade of pre-version-2 rows, and the daily evidence warmer
 * (app/api/cron/warm-evidence-breakdowns), so all three agree on which articles get one and
 * how a race between two writers resolves.
 *
 * Only an article id is ever accepted. Title and abstract are resolved here from the
 * article's real source, because the cache is shared and permanent: text supplied by a
 * caller would become every future reader's view of that study.
 */

export async function getCachedBreakdown(articleId: string): Promise<ArticleBreakdown | null> {
  const row = await prisma.articleBreakdownCache.findUnique({ where: { articleId } });
  return row ? (row.breakdownData as unknown as ArticleBreakdown) : null;
}

/** Returns the cached breakdown, generating one if none exists. With `upgrade`, a cached
 *  row from before BREAKDOWN_VERSION is regenerated and replaced. Null when the article
 *  has no abstract to work from or generation fails. */
export async function ensureBreakdown(articleId: string, opts: { upgrade?: boolean } = {}): Promise<ArticleBreakdown | null> {
  const cached = await getCachedBreakdown(articleId);
  if (cached && (!opts.upgrade || isCurrentBreakdown(cached))) return cached;

  const article = await getArticleById(articleId);
  if (!article) return cached;
  const abstract = breakdownSourceText(article);
  if (!abstract) return cached;

  const result = await generateArticleBreakdown({ title: article.title, abstract });
  if (!result) return cached;

  try {
    if (cached) {
      // Two readers upgrading the same row at once both write a current-version breakdown
      // of the same abstract, so whichever lands last is as good as the first.
      await prisma.articleBreakdownCache.update({
        where: { articleId },
        data: { breakdownData: result as unknown as object, generatedAt: new Date() },
      });
    } else {
      await prisma.articleBreakdownCache.create({
        data: { articleId, breakdownData: result as unknown as object, generatedAt: new Date() },
      });
    }
  } catch (err) {
    // A duplicate-key race on create: the other writer's row wins, and this reader still
    // gets a correct breakdown back.
    console.error("Caching article breakdown failed:", err);
  }
  return result;
}

/** Cached breakdowns for many articles at once — used to put sample size and follow-up on
 *  feed cards and to order topic pages, without a query per card. */
export async function getCachedBreakdowns(articleIds: string[]): Promise<Map<string, ArticleBreakdown>> {
  if (articleIds.length === 0) return new Map();
  const rows = await prisma.articleBreakdownCache.findMany({
    where: { articleId: { in: articleIds } },
    select: { articleId: true, breakdownData: true },
  });
  return new Map(rows.map((r) => [r.articleId, r.breakdownData as unknown as ArticleBreakdown]));
}
