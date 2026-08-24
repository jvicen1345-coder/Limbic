"use server";

import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { checkGeneralizability, type GeneralizabilityResult, type GeneralizabilityError } from "@/lib/generalizability";

const NOT_ALLOWED_ERROR: GeneralizabilityError = { ok: false, message: "The Generalizability Checker is available to LimbicPRO members and Limbic Student accounts." };

/** Gated the same way as the rest of the Research & Statistics Literacy guide it lives on
 *  (hasClinicalReferenceAccess — isPro or a .edu student account), not the stricter isPro-
 *  only gate Limbic Agent's clinical-reasoning web uses (see app/actions/agent.ts) — this is
 *  a reading/appraisal aid, the same category as Outcome Measures/Guidelines/etc., not a
 *  full clinical decision-support tool. Re-checked here, not just gated on the page's UI —
 *  a Server Action is its own callable endpoint regardless of which page's UI calls it. */
export async function checkGeneralizabilityAction(
  studyInput: string,
  targetPopulation: string
): Promise<GeneralizabilityResult | GeneralizabilityError> {
  const user = await getCurrentUser();
  if (!user || !hasClinicalReferenceAccess(user)) return NOT_ALLOWED_ERROR;

  const study = studyInput.trim();
  const target = targetPopulation.trim();
  if (!study || !target) {
    return { ok: false, message: "Add a study (a link, PMID, DOI, citation, or description of its population) and the population you're comparing it to." };
  }

  return checkGeneralizability(study, target);
}
