"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import {
  scoreStudyGeneralizability,
  SCORING_FAILED_MESSAGE,
  type GeneralizabilityScore,
} from "@/lib/generalizability-score";

const NOT_ALLOWED_MESSAGE =
  "The generalizability score is available to LimbicPRO members and Limbic Student accounts.";

/** Scores one article's generalizability for the article detail page's "Analyze This Study"
 *  panel (see components/ArticleResearchPanel.tsx), which calls this the moment the panel is
 *  expanded — there's no form and no button, so this has to be safe to call on a plain open.
 *
 *  Every article is scored at most once, ever. The first reader to expand the panel pays for
 *  one Anthropic call; the result is written to GeneralizabilityCache keyed by articleId and
 *  returned to everyone afterwards with `cached: true` (the panel shows a "Cached" pill).
 *  The cache never expires — a published study's population, setting, sample size and
 *  follow-up don't change, so there's nothing for a TTL to catch.
 *
 *  Gated the same way as the rest of the research-appraisal tools (see
 *  app/actions/generalizability.ts for the identical pattern and its reasoning) — re-checked
 *  here, not just on the panel's UI, since a Server Action is its own callable endpoint. The
 *  cache read is behind the same gate as the write: a cached score is still PRO content. */
export async function scoreArticleGeneralizability(
  articleId: string,
  doi: string | null,
  sourceUrl: string | null,
  title: string,
  summary: string
): Promise<{ result?: GeneralizabilityScore; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !hasClinicalReferenceAccess(user)) return { error: NOT_ALLOWED_MESSAGE };

  if (!articleId.trim() || !title.trim() || !summary.trim()) {
    return { error: SCORING_FAILED_MESSAGE };
  }

  const cached = await prisma.generalizabilityCache.findUnique({ where: { articleId } });
  if (cached) {
    return { result: { ...(cached.scoreData as unknown as GeneralizabilityScore), cached: true } };
  }

  const result = await scoreStudyGeneralizability({ title, summary, doi, sourceUrl });
  if (!result) return { error: SCORING_FAILED_MESSAGE };

  // Two readers can open the same never-scored article at the same moment and both get past
  // the findUnique above — the second write would violate the articleId unique index. That's
  // a wasted call, not a failure: the score is already computed and correct, so hand it back
  // rather than turning a duplicate-key error into the panel's error state.
  try {
    await prisma.generalizabilityCache.create({
      data: { articleId, scoreData: result as unknown as object, scoredAt: new Date() },
    });
  } catch (err) {
    console.error("Caching generalizability score failed:", err);
  }

  return { result };
}
