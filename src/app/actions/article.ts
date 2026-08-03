"use server";

import { getCurrentUser } from "@/lib/session";
import { buildArticleView, type ArticleViewData } from "@/lib/article-view";

export interface SwapArticleResult {
  ok: true;
  data: ArticleViewData;
}
export interface SwapArticleError {
  ok: false;
  message: string;
}

const NOT_SIGNED_IN_ERROR: SwapArticleError = { ok: false, message: "You've been signed out — sign back in to continue." };
const NOT_FOUND_ERROR: SwapArticleError = { ok: false, message: "Couldn't find that article." };

/** Powers Limbic Threads' in-place article swap (see components/ArticleThreadsSplitView.tsx)
 *  — clicking a connected-article node calls this instead of navigating, so the reading
 *  pane can update without a full page reload while the Threads panel stays mounted. */
export async function swapArticleAction(articleId: string): Promise<SwapArticleResult | SwapArticleError> {
  const user = await getCurrentUser();
  if (!user) return NOT_SIGNED_IN_ERROR;

  const data = await buildArticleView(articleId, user.id);
  if (!data) return NOT_FOUND_ERROR;

  return { ok: true, data };
}
