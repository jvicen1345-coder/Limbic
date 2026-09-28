import "server-only";
import { unstable_cache } from "next/cache";
import { searchPubmed } from "@/lib/pubmed";
import { ORTHOPT_CPG_SEED } from "@/lib/orthopt-cpg-static";
import { getCachedBreakdowns } from "@/lib/article-breakdown-store";
import { getUsefulCounts } from "@/lib/study-feedback";
import { findRetraction } from "@/lib/retraction-check";
import { assessEffects, type MeaningVerdict } from "@/lib/clinical-meaning";
import type { ArticleBreakdown } from "@/lib/article-breakdown-shared";
import type { EvidenceTopic } from "@/lib/evidence-topics";
import type { Article } from "@/lib/types";

/**
 * The evidence stack for one condition page (app/evidence/topics/[slug]): the guideline,
 * then systematic reviews and meta-analyses, then the newest randomized trials — the order a
 * reader should weigh them in.
 *
 * PubMed is queried per tier with the topic's condition clause, a rehab clause and a
 * publication-type filter. Results are cached for a day (evidence on a condition doesn't
 * move hour to hour) under the same "live-research" tag the rest of the PubMed reads use.
 * A failed fetch yields an empty tier, never an error page, and is not cached — the
 * guideline tier is static and always renders.
 */

const REHAB_CLAUSE =
  '("Physical Therapy Modalities"[MeSH] OR "Exercise Therapy"[MeSH] OR "Rehabilitation"[MeSH] OR "Physical Therapy Specialty"[MeSH] OR physiotherapy[tiab] OR "physical therapy"[tiab] OR exercise[tiab])';

const REVIEW_FILTER = '("systematic review"[Publication Type] OR "meta analysis"[Publication Type])';
const TRIAL_FILTER = "randomized controlled trial[Publication Type]";
/** Protocols report no results, and bibliometric "reviews" count papers rather than weigh
 *  their findings — neither belongs on a page about what works. */
const EXCLUDE = 'NOT ("clinical trial protocol"[Publication Type] OR protocol[ti] OR bibliometric[ti] OR "scoping review"[ti])';
const TIER_SIZE = 6;

export interface TopicStudy {
  article: Article;
  breakdown: ArticleBreakdown | null;
  useful: number;
  retracted: boolean;
  /** The strongest "does it matter" verdict from the breakdown's effects, if any. */
  meaning: MeaningVerdict | null;
}

export interface TopicEvidence {
  guidelines: Article[];
  reviews: TopicStudy[];
  trials: TopicStudy[];
  /** Most recent publication date across the tiers, for the "last updated" line. */
  latestDate: string | null;
}

const fetchTierCached = unstable_cache(
  async (clause: string, filter: string): Promise<Article[]> => {
    const query = `((${clause}) AND ${REHAB_CLAUSE} AND ${filter} AND hasabstract) ${EXCLUDE}`;
    let results = await searchPubmed(query, TIER_SIZE);
    if (results.length === 0) {
      // searchPubmed swallows failures into an empty list, and NCBI rate-limits bursts
      // (3 requests/second without an API key). One spaced retry covers the common case.
      await new Promise((r) => setTimeout(r, 1200));
      results = await searchPubmed(query, TIER_SIZE);
    }
    // Throwing keeps an empty result out of the day-long cache: a rate-limited fetch must
    // not blank a condition page until tomorrow. The caller turns it back into [].
    if (results.length === 0) throw new Error("PubMed returned no results");
    return results;
  },
  ["evidence-topic-tier-v3"],
  { revalidate: 86400, tags: ["live-research"] }
);

async function fetchTier(clause: string, filter: string): Promise<Article[]> {
  try {
    return await fetchTierCached(clause, filter);
  } catch {
    return [];
  }
}

/** Reviews, then trials — sequential rather than parallel so one page load stays inside
 *  NCBI's request-rate limit (each tier is three E-utilities calls). */
async function fetchTiers(clause: string): Promise<[Article[], Article[]]> {
  const reviews = await fetchTier(clause, REVIEW_FILTER);
  const trials = await fetchTier(clause, TRIAL_FILTER);
  return [reviews, trials];
}

const MEANING_RANK: Record<MeaningVerdict, number> = { likely: 3, uncertain: 2, unlikely: 1 };

function strongestMeaning(b: ArticleBreakdown | null): MeaningVerdict | null {
  const verdicts = assessEffects(b?.effects).map((m) => m.verdict);
  if (verdicts.length === 0) return null;
  return verdicts.sort((a, c) => MEANING_RANK[c] - MEANING_RANK[a])[0];
}

export async function getTopicEvidence(topic: EvidenceTopic): Promise<TopicEvidence> {
  const guidelines = ORTHOPT_CPG_SEED.filter((c) => topic.cpgIds.includes(c.id));
  const [reviews, trials] = await fetchTiers(topic.pubmed);

  // A review can also carry the RCT publication type in PubMed; keep each study in one tier.
  const reviewIds = new Set(reviews.map((a) => a.id));
  const trialsOnly = trials.filter((a) => !reviewIds.has(a.id));
  const ids = [...reviews, ...trialsOnly].map((a) => a.id);
  const [breakdowns, useful] = await Promise.all([getCachedBreakdowns(ids), getUsefulCounts(ids)]);

  const toStudy = (a: Article): TopicStudy => {
    const breakdown = breakdowns.get(a.id) ?? null;
    return {
      article: a,
      breakdown,
      useful: useful[a.id] ?? 0,
      retracted: !!findRetraction(a),
      meaning: strongestMeaning(breakdown),
    };
  };
  // Within a tier: retracted last, then what readers found useful, then newest first.
  const order = (x: TopicStudy, y: TopicStudy) =>
    Number(x.retracted) - Number(y.retracted) || y.useful - x.useful || y.article.date.localeCompare(x.article.date);

  const dates = [...guidelines, ...reviews, ...trialsOnly].map((a) => a.date).sort();
  return {
    guidelines,
    reviews: reviews.map(toStudy).sort(order),
    trials: trialsOnly.map(toStudy).sort(order),
    latestDate: dates.length > 0 ? dates[dates.length - 1] : null,
  };
}

/** Every study id currently on any condition page — what the daily warmer breaks down so
 *  the public pages have summaries to show (see app/api/cron/warm-evidence-breakdowns). */
export async function getAllTopicStudyIds(topics: readonly EvidenceTopic[]): Promise<string[]> {
  const ids: string[] = [];
  for (const topic of topics) {
    const [reviews, trials] = await fetchTiers(topic.pubmed);
    for (const a of [...reviews, ...trials]) if (!ids.includes(a.id)) ids.push(a.id);
  }
  return ids;
}
