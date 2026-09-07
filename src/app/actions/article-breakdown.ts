"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getArticleById } from "@/lib/articles";
import {
  generateArticleBreakdown,
  breakdownSourceText,
  BREAKDOWN_FAILED_MESSAGE,
  type ArticleBreakdown,
} from "@/lib/article-breakdown";

/** Generates (or returns the cached) study breakdown for one article — the five-field
 *  summary the article detail page shows in place of the publisher's abstract (see
 *  components/ArticleBreakdown.tsx). Called on mount by the client component, but only for
 *  an article whose breakdown wasn't already cached when the page was built: the common
 *  path is server-rendered straight from ArticleBreakdownCache by lib/article-view.ts,
 *  with no action call and no loading state at all.
 *
 *  Every article is broken down at most once, ever. The first reader to open a given
 *  article pays for one Anthropic call; every reader after that gets the cached row. The
 *  cache never expires — a published abstract doesn't change, so there's nothing for a TTL
 *  to catch. Same shape and reasoning as scoreArticleGeneralizability in
 *  app/actions/research-literacy.ts.
 *
 *  Deliberately *not* behind hasClinicalReferenceAccess, unlike the research-appraisal
 *  tools: this isn't an extra analysis layered on top of the article, it's the article's
 *  body copy now. Gating it would leave a free reader looking at a title and nothing else.
 *  Signed-in is still required, matching every other read surface in the app.
 *
 *  Only the article id crosses from the client — the title and abstract are resolved here
 *  through getArticleById. That matters more than the extra lookup costs (PubMed reads go
 *  through the same one-hour-revalidated fetch the rest of the app uses): ArticleBreakdownCache
 *  is shared, permanent, and keyed by article id, so a client-supplied abstract would let
 *  any signed-in reader write arbitrary text into what every future reader sees as that
 *  article's body. */
export async function generateArticleBreakdownAction(
  articleId: string
): Promise<{ result?: ArticleBreakdown; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: BREAKDOWN_FAILED_MESSAGE };
  if (!articleId.trim()) return { error: BREAKDOWN_FAILED_MESSAGE };

  const cached = await prisma.articleBreakdownCache.findUnique({ where: { articleId } });
  if (cached) return { result: cached.breakdownData as unknown as ArticleBreakdown };

  const article = await getArticleById(articleId);
  if (!article) return { error: BREAKDOWN_FAILED_MESSAGE };

  const abstract = breakdownSourceText(article);
  if (!abstract) return { error: BREAKDOWN_FAILED_MESSAGE };

  const result = await generateArticleBreakdown({ title: article.title, abstract });
  if (!result) return { error: BREAKDOWN_FAILED_MESSAGE };

  // Two readers can open the same never-broken-down article at the same moment and both get
  // past the findUnique above — the second write violates the articleId unique index. That's
  // a wasted call, not a failure: hand the breakdown back rather than turning a duplicate-key
  // error into the reader's error state. Swallowing it also means the first writer's row
  // wins, so a racing pair can't clobber each other.
  try {
    await prisma.articleBreakdownCache.create({
      data: { articleId, breakdownData: result as unknown as object, generatedAt: new Date() },
    });
  } catch (err) {
    console.error("Caching article breakdown failed:", err);
  }

  return { result };
}
