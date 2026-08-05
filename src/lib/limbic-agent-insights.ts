import type { Article } from "@/lib/types";
import { SPECIALTIES, SPECIALTY_META } from "@/lib/meta";
import { filterClinicalGapTopics, normalizeTag } from "@/lib/clinical-relevance";

const RECENT_WINDOW_DAYS = 7;
const RECENT_TOPICS_COUNT = 3;
const MAX_NEGLECTED_TOPICS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NeglectedTopic {
  topic: string;
  /** Days since this topic was last read, or since account creation if it's never been
   *  read at all. */
  gapDays: number;
  recommendedArticle: { id: string; title: string } | null;
}

export interface LimbicAgentInsights {
  /** Up to the last 3 distinct specialties read in the past 7 days, most recent first. */
  recentTopics: string[];
  /** Up to the 3 followed topics (or, with none followed yet, canonical specialties) with
   *  the longest gap since they were last read, longest gap first — empty when there's no
   *  reading history at all. */
  neglectedTopics: NeglectedTopic[];
}

const specialtyLabel = (s: Article["specialty"]) => SPECIALTY_META[s];

/** A followed topic can be a specialty label ("Orthopedic", from Profile's Suggested
 *  chips) or a free-form tag ("Dry Needling") — matched the same case-insensitive way
 *  rankFeed matches followedTopics against article tags (see lib/feed.ts). */
function topicMatchesArticle(topic: string, article: Article): boolean {
  const t = topic.toLowerCase();
  return specialtyLabel(article.specialty).toLowerCase() === t || article.tags.some((tag) => tag.toLowerCase() === t);
}

/** Pure function — takes the caller's already-fetched ReadArticle rows and live article
 *  pool rather than querying either itself, so it stays testable and reusable regardless
 *  of where those come from (see app/(app)/page.tsx for the Prisma + getArticles() calls). */
export function buildLimbicAgentInsights(
  /** All of the reader's ReadArticle rows, sorted most-recently-touched first. */
  readRows: { articleId: string; updatedAt: Date }[],
  articles: Article[],
  followedTopics: string[],
  accountCreatedAt: Date
): LimbicAgentInsights {
  if (readRows.length === 0) {
    return { recentTopics: [], neglectedTopics: [] };
  }

  const articleById = new Map(articles.map((a) => [a.id, a]));
  const now = Date.now();

  const recentTopics: string[] = [];
  const windowStart = now - RECENT_WINDOW_DAYS * DAY_MS;
  for (const row of readRows) {
    if (row.updatedAt.getTime() < windowStart) continue;
    const article = articleById.get(row.articleId);
    if (!article) continue;
    const label = specialtyLabel(article.specialty);
    if (!recentTopics.includes(label)) recentTopics.push(label);
    if (recentTopics.length >= RECENT_TOPICS_COUNT) break;
  }

  // Followed topics can include non-clinical keywords Profile's "Add more" list surfaces
  // alongside genuine clinical ones (see lib/news-live.ts allKnownKeywordTopics) — e.g.
  // "Legislation" or "Athlete" — which have no business showing up as a clinical gap to
  // close (see lib/clinical-relevance.ts). filterClinicalGapTopics also normalizes
  // near-duplicates ("Athletic" -> "athlete") so they can't both appear; the lookup below
  // maps each surviving normalized key back to whichever originally-cased followed topic
  // produced it, so the card still displays "ACL" rather than the normalized "acl".
  const clinicalKeys = new Set(filterClinicalGapTopics(followedTopics));
  const seenKeys = new Set<string>();
  const clinicalFollowedTopics = followedTopics.filter((topic) => {
    const key = normalizeTag(topic);
    if (!clinicalKeys.has(key) || seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // No followed topics yet (a common state for skipped onboarding or legacy accounts) — or
  // none of them clinically relevant — falls back to the 5 canonical specialties, so the
  // card still has something to say rather than going blank.
  const gapCandidates = clinicalFollowedTopics.length > 0 ? clinicalFollowedTopics : SPECIALTIES.map((s) => s.label);
  const withGaps = gapCandidates.map((topic) => {
    const lastMatch = readRows.find((row) => {
      const article = articleById.get(row.articleId);
      return article != null && topicMatchesArticle(topic, article);
    });
    const since = lastMatch ? lastMatch.updatedAt : accountCreatedAt;
    const days = Math.floor((now - since.getTime()) / DAY_MS);
    return { topic, days };
  });
  withGaps.sort((a, b) => b.days - a.days);

  const readIds = new Set(readRows.map((r) => r.articleId));
  // Tracked across topics so two neglected topics that share a tag don't both recommend
  // the exact same article — each row should point somewhere different when possible.
  const usedArticleIds = new Set<string>();
  const neglectedTopics: NeglectedTopic[] = withGaps.slice(0, MAX_NEGLECTED_TOPICS).map(({ topic, days }) => {
    const matches = articles.filter((a) => topicMatchesArticle(topic, a));
    const unread = matches.filter((a) => !readIds.has(a.id));
    const pool = (unread.length > 0 ? unread : matches)
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const best = pool.find((a) => !usedArticleIds.has(a.id)) ?? pool[0] ?? null;
    if (best) usedArticleIds.add(best.id);
    return { topic, gapDays: days, recommendedArticle: best ? { id: best.id, title: best.title } : null };
  });

  return { recentTopics, neglectedTopics };
}
