import "server-only";
import type { Article, ArticleType, WellnessArticle } from "@/lib/types";
import { SEED_ARTICLES, SEED_WELLNESS_ARTICLES, WELLNESS_VIDEOS } from "@/lib/articles-static";
import { fetchLiveArticles, fetchLiveWellness } from "@/lib/news-live";
import { fetchPubmedResearch, fetchPubmedById } from "@/lib/pubmed";
import { RETRACTION_WATCH_ARTICLES } from "@/lib/retraction-watch-data";
import { fetchAptaNews } from "@/lib/apta-news";
import { APTA_NEWS_SEED } from "@/lib/apta-news-static";

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

  return result;
}

/**
 * Real retracted papers, corrections, and expressions of concern from PT/rehab
 * journals, sourced from the Crossref/Retraction Watch database (see
 * lib/retraction-watch-data.ts and scripts/fetch-retraction-watch.mjs). Kept separate
 * from getArticles() rather than folded in — at 80+ records it would otherwise flood
 * the home feed's research section, and "flagged for integrity reasons" is a distinct
 * concept from the main feed's editorial categories.
 */
export async function getUnderReviewArticles(): Promise<Article[]> {
  return RETRACTION_WATCH_ARTICLES;
}

/**
 * Live news from apta.org/news (see lib/apta-news.ts for why this is scraped rather than
 * an API/RSS feed, and the real risk that it may not work in production either). Falls
 * back to APTA_NEWS_SEED when the live scrape comes back thin, same pattern as the rest
 * of the app's live sources. Kept separate from getArticles() — this is its own feed,
 * not a category within the main one.
 */
export async function getAptaNewsArticles(): Promise<Article[]> {
  const live = await fetchAptaNews();
  if (live.length >= 3) return live;
  return [...live, ...APTA_NEWS_SEED];
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (id.startsWith("rw-")) {
    return RETRACTION_WATCH_ARTICLES.find((a) => a.id === id) ?? null;
  }
  if (id.startsWith("apta-")) {
    const aptaArticles = await getAptaNewsArticles();
    return aptaArticles.find((a) => a.id === id) ?? null;
  }
  if (id.startsWith("pubmed-")) {
    // Don't rely on the article still being in fetchPubmedResearch()'s current top
    // results — a one-off AI-search query returns PMIDs that generic query never
    // touches, so look this one PMID up directly instead of 404ing on a valid article.
    return fetchPubmedById(id.slice("pubmed-".length));
  }
  const articles = await getArticles();
  return articles.find((a) => a.id === id) ?? null;
}

export async function getWellnessArticles(): Promise<WellnessArticle[]> {
  const live = await fetchLiveWellness();
  if (live.length >= 2) return live;
  return SEED_WELLNESS_ARTICLES;
}
