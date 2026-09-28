import "server-only";
import type { Article } from "@/lib/types";
import { getCachedBreakdowns } from "@/lib/article-breakdown-store";
import { findRetraction } from "@/lib/retraction-check";

/**
 * Puts sample size, follow-up and any retraction flag on research articles before they
 * become feed cards. The evidence badge alone says what kind of study something is; these
 * say how much weight it can bear — a 12-person pilot and a 900-person trial are both
 * "RCT".
 *
 * Sample size and follow-up come from cached version-2 breakdowns only: nothing is
 * generated here, so a card for a study nobody has opened yet simply shows no numbers.
 */
export async function withTrustSignals<T extends Article>(articles: T[]): Promise<T[]> {
  const researchIds = articles.filter((a) => a.type === "research").map((a) => a.id);
  const breakdowns = await getCachedBreakdowns(researchIds);
  return articles.map((a) => {
    if (a.type !== "research") return a;
    const b = breakdowns.get(a.id);
    const retraction = a.id.startsWith("rw-") ? null : findRetraction(a)?.status ?? null;
    const sampleSize = b?.sampleSize ?? null;
    const followUp = b?.followUp ?? null;
    if (!sampleSize && !followUp && !retraction) return a;
    return { ...a, trust: { sampleSize, followUp, retraction } };
  });
}
