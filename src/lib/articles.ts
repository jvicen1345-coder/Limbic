import "server-only";
import type { Article, ArticleType, WellnessArticle } from "@/lib/types";
import { SEED_ARTICLES, SEED_WELLNESS_ARTICLES, WELLNESS_VIDEOS } from "@/lib/articles-static";
import { fetchLiveArticles, fetchLiveWellness } from "@/lib/news-live";
import { fetchPubmedResearch } from "@/lib/pubmed";

export { WELLNESS_VIDEOS };

const LIVE_TYPES: ArticleType[] = ["research", "guideline", "industry", "product"];
/** Below this many live results for a type, top it up with seed articles so the section
 *  never looks sparse (and so the app still works fully offline, falling all the way back
 *  to the bundled seed feed if every live source is unreachable). */
const MIN_LIVE_PER_TYPE = 3;

/**
 * The merged article feed: PubMed for research, Google-News-sourced guidelines/industry/
 * equipment, always-static CE & Events (see lib/news-live.ts for why), and always-static
 * "under review" items (an editorial workflow status, not a live-news concept).
 */
export async function getArticles(): Promise<Article[]> {
  const [live, pubmedResearch] = await Promise.all([fetchLiveArticles(), fetchPubmedResearch()]);
  const liveByType: Record<ArticleType, Article[]> = {
    research: pubmedResearch,
    guideline: [],
    industry: [],
    ce: [],
    product: [],
  };
  for (const a of live) liveByType[a.type].push(a);

  const seen = new Set<string>();
  const result: Article[] = [];
  const add = (a: Article) => {
    if (seen.has(a.id)) return;
    seen.add(a.id);
    result.push(a);
  };

  for (const type of LIVE_TYPES) {
    liveByType[type].forEach(add);
    if (liveByType[type].length < MIN_LIVE_PER_TYPE) {
      SEED_ARTICLES.filter((a) => a.type === type).forEach(add);
    }
  }
  // CE & Events (and the home-feed calendar) always reads from curated seed dates.
  SEED_ARTICLES.filter((a) => a.type === "ce").forEach(add);
  // "Under review" is an editorial flag that only exists on curated seed articles — make
  // sure those stay in the feed even if their type already met the live threshold above.
  SEED_ARTICLES.filter((a) => a.underReview).forEach(add);

  return result;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((a) => a.id === id) ?? null;
}

export async function getWellnessArticles(): Promise<WellnessArticle[]> {
  const live = await fetchLiveWellness();
  if (live.length >= 2) return live;
  return SEED_WELLNESS_ARTICLES;
}
