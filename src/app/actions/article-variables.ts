"use server";

import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { extractArticleVariables, type ArticleVariablesResult, type ArticleVariablesError } from "@/lib/article-variables";

const NOT_ALLOWED_ERROR: ArticleVariablesError = { ok: false, message: "The Article Histogram Explorer is available to LimbicPRO members and Limbic Student accounts." };

/** Gated the same way as the rest of the Research & Statistics Literacy guide (see
 *  app/actions/generalizability.ts for the identical pattern/reasoning) — re-checked here,
 *  not just on the page's UI, since a Server Action is its own callable endpoint. */
export async function extractArticleVariablesAction(studyInput: string): Promise<ArticleVariablesResult | ArticleVariablesError> {
  const user = await getCurrentUser();
  if (!user || !hasClinicalReferenceAccess(user)) return NOT_ALLOWED_ERROR;

  const study = studyInput.trim();
  if (!study) {
    return { ok: false, message: "Paste a link, PMID, DOI, or citation for the article you want to explore." };
  }

  return extractArticleVariables(study);
}
