"use server";

import { getCurrentUser, isAdminEmail } from "@/lib/session";
import { buildArticleView, type ArticleViewData } from "@/lib/article-view";
import { checkUnpaywall } from "@/lib/unpaywall";

export interface SwapArticleResult {
  ok: true;
  data: ArticleViewData;
}
export interface SwapArticleError {
  ok: false;
  message: string;
}

const NOT_SIGNED_IN_ERROR: SwapArticleError = { ok: false, message: "You've been signed out, sign back in to continue." };
const NOT_FOUND_ERROR: SwapArticleError = { ok: false, message: "Couldn't find that article." };

/** Powers Limbic Threads' in-place article swap (see components/ArticleThreadsSplitView.tsx)
 *  — clicking a connected-article node calls this instead of navigating, so the reading
 *  pane can update without a full page reload while the Threads panel stays mounted. */
export async function swapArticleAction(articleId: string): Promise<SwapArticleResult | SwapArticleError> {
  const user = await getCurrentUser();
  if (!user) return NOT_SIGNED_IN_ERROR;

  const isAdmin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const data = await buildArticleView(articleId, user.id, isAdmin);
  if (!data) return NOT_FOUND_ERROR;

  return { ok: true, data };
}

/** Powers the Open Access pill on feed cards (see components/OpenAccessPill.tsx) — cards
 *  render first, then each card with a `doi` (PubMed articles only) independently asks for
 *  its own open-access status, so a feed full of cards never waits on Unpaywall before
 *  painting. checkUnpaywall's own 24h fetch cache means a DOI already looked up (by this
 *  card, another card, or the article detail page) resolves instantly on repeat views. */
export async function checkArticleOpenAccessAction(doi: string): Promise<boolean> {
  const result = await checkUnpaywall(doi);
  return result?.isOpenAccess ?? false;
}
