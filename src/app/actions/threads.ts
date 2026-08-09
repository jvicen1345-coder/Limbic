"use server";

import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { getArticleById } from "@/lib/articles";
import { generateThreadsInsight, type ThreadsInsightResult, type ThreadsInsightError } from "@/lib/threads-agent";
import type { ThreadsInsightKind } from "@/lib/threads-graph";

const NOT_PRO_ERROR: ThreadsInsightError = { ok: false, message: "This is a LimbicPro feature." };
const NOT_FOUND_ERROR: ThreadsInsightError = { ok: false, message: "Couldn't find this article." };

/** Re-checked here, not just gated on whichever node the client shows as locked — a
 *  Server Action is its own callable endpoint regardless of UI state (same reasoning as
 *  every other isPro-gated write in this app, see app/actions/agent.ts requireProUser). */
export async function generateThreadsInsightAction(
  articleId: string,
  insightKind: ThreadsInsightKind
): Promise<ThreadsInsightResult | ThreadsInsightError> {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return NOT_PRO_ERROR;

  const article = await getArticleById(articleId);
  if (!article) return NOT_FOUND_ERROR;

  return generateThreadsInsight(article, insightKind, hasLicenseAccess(user));
}
