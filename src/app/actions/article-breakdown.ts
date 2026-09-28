"use server";

import { getCurrentUser } from "@/lib/session";
import { ensureBreakdown } from "@/lib/article-breakdown-store";
import { BREAKDOWN_FAILED_MESSAGE, isCurrentBreakdown, type ArticleBreakdown } from "@/lib/article-breakdown-shared";

/** Generates (or returns the cached) study breakdown for one article — the summary the
 *  article detail page shows in place of the publisher's abstract (see
 *  components/ArticleBreakdown.tsx). Called on mount by the client component, but only for
 *  an article whose breakdown wasn't already cached when the page was built: the common
 *  path is server-rendered straight from ArticleBreakdownCache by lib/article-view.ts,
 *  with no action call and no loading state at all.
 *
 *  Every article is broken down at most once per breakdown version. The first reader to
 *  open a given article pays for one Anthropic call; every reader after that gets the cached
 *  row (see lib/article-breakdown-store.ts, which also explains why only the id crosses from
 *  the client).
 *
 *  Deliberately *not* behind hasClinicalReferenceAccess, unlike the research-appraisal
 *  tools: this isn't an extra analysis layered on top of the article, it's the article's
 *  body copy now. Gating it would leave a free reader looking at a title and nothing else.
 *  Signed-in is still required: anonymous visitors to the public evidence pages see cached
 *  breakdowns only, so a crawler can never trigger generation. */
export async function generateArticleBreakdownAction(
  articleId: string
): Promise<{ result?: ArticleBreakdown; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: BREAKDOWN_FAILED_MESSAGE };
  if (!articleId.trim()) return { error: BREAKDOWN_FAILED_MESSAGE };

  const result = await ensureBreakdown(articleId);
  return result ? { result } : { error: BREAKDOWN_FAILED_MESSAGE };
}

/** Regenerates a breakdown cached before the current BREAKDOWN_VERSION, so it gains the
 *  student/patient lines, sample size, follow-up and effect numbers. Fired in the background
 *  by components/ArticleBreakdown.tsx when a signed-in reader opens an old row; the reader
 *  keeps seeing the old breakdown until this returns. */
export async function upgradeArticleBreakdownAction(
  articleId: string
): Promise<{ result?: ArticleBreakdown; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: BREAKDOWN_FAILED_MESSAGE };
  if (!articleId.trim()) return { error: BREAKDOWN_FAILED_MESSAGE };

  const result = await ensureBreakdown(articleId, { upgrade: true });
  return result && isCurrentBreakdown(result) ? { result } : { error: BREAKDOWN_FAILED_MESSAGE };
}
