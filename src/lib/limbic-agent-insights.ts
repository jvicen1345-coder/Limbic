import type { Article } from "@/lib/types";
import { SPECIALTIES, SPECIALTY_META } from "@/lib/meta";

const RECENT_WINDOW_DAYS = 7;
const RECENT_TOPICS_COUNT = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface LimbicAgentInsights {
  /** Up to the last 3 distinct specialties read in the past 7 days, most recent first. */
  recentTopics: string[];
  /** The followed topic (or, with no followed topics yet, canonical specialty) with the
   *  longest gap since it was last read — null when there's no reading history at all. */
  gapTopic: string | null;
  /** Days since gapTopic was last read, or since account creation if it's never been read. */
  gapDays: number | null;
  recommendedArticle: { id: string; title: string } | null;
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
    return { recentTopics: [], gapTopic: null, gapDays: null, recommendedArticle: null };
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

  // No followed topics yet (a common state for new accounts) falls back to the 5
  // canonical specialties, so the gap insight still has something to say rather than
  // going blank the moment reading history exists but topic-following hasn't started.
  const gapCandidates = followedTopics.length > 0 ? followedTopics : SPECIALTIES.map((s) => s.label);
  let gapTopic: string | null = null;
  let gapDays = -1;
  for (const topic of gapCandidates) {
    const lastMatch = readRows.find((row) => {
      const article = articleById.get(row.articleId);
      return article != null && topicMatchesArticle(topic, article);
    });
    const since = lastMatch ? lastMatch.updatedAt : accountCreatedAt;
    const days = Math.floor((now - since.getTime()) / DAY_MS);
    if (days > gapDays) {
      gapDays = days;
      gapTopic = topic;
    }
  }

  let recommendedArticle: LimbicAgentInsights["recommendedArticle"] = null;
  if (gapTopic) {
    const readIds = new Set(readRows.map((r) => r.articleId));
    const matches = articles.filter((a) => topicMatchesArticle(gapTopic!, a));
    const unread = matches.filter((a) => !readIds.has(a.id));
    const pool = unread.length > 0 ? unread : matches;
    const best = pool.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (best) recommendedArticle = { id: best.id, title: best.title };
  }

  return { recentTopics, gapTopic, gapDays: gapDays >= 0 ? gapDays : null, recommendedArticle };
}
