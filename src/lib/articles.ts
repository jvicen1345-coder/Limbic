import "server-only";
import type { Article, ArticleType, WellnessArticle } from "@/lib/types";
import { SEED_ARTICLES, SEED_WELLNESS_ARTICLES, WELLNESS_VIDEOS } from "@/lib/articles-static";
import { fetchLiveArticles, fetchLiveWellness } from "@/lib/news-live";
import { fetchPubmedResearch, fetchPubmedById } from "@/lib/pubmed";
import { RETRACTION_WATCH_ARTICLES } from "@/lib/retraction-watch-data";
import { fetchAptaNews } from "@/lib/apta-news";
import { APTA_NEWS_SEED } from "@/lib/apta-news-static";
import { ORTHOPT_CPG_SEED } from "@/lib/orthopt-cpg-static";
import { defaultEvidenceLevelForType } from "@/lib/evidence";

export { WELLNESS_VIDEOS };

/** Fills in evidenceLevel generically from an article's type, for every source except
 *  PubMed (which already set its own specific RCT/SR/MA/Review — see lib/pubmed.ts —
 *  and is left untouched here). Applied once at each getArticles-family function's
 *  return point rather than hand-editing every static seed file. */
function withEvidenceLevel(articles: Article[]): Article[] {
  return articles.map((a) => (a.evidenceLevel ? a : { ...a, evidenceLevel: defaultEvidenceLevelForType(a.type) }));
}

const LIVE_TYPES: ArticleType[] = ["research", "industry", "product"];
/** Below this many live results for a type, top it up with seed articles so the section
 *  never looks sparse (and so the app still works fully offline, falling all the way back
 *  to the bundled seed feed if every live source is unreachable). */
const MIN_LIVE_PER_TYPE = 3;

/**
 * The merged article feed: PubMed for research, Google-News-sourced industry/equipment,
 * always-static CE & Events (see lib/news-live.ts for why), always-static "under review"
 * items (an editorial workflow status, not a live-news concept), and the always-static,
 * real AOPT clinical practice guidelines (see lib/orthopt-cpg-static.ts — "Guidelines"
 * means those specific documents, not a keyword guess off general news search).
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
  // Guidelines always reads from the real, curated AOPT CPG list — never news search.
  ORTHOPT_CPG_SEED.forEach(add);

  return withEvidenceLevel(result);
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
  return withEvidenceLevel(RETRACTION_WATCH_ARTICLES);
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
  const combined = live.length >= 3 ? live : [...live, ...APTA_NEWS_SEED];
  // Tier 1 (direct scrape), tier 2 (Google News), and the static-seed fallback each come
  // in their own order — concatenating them isn't sorted, so this is the one place that
  // guarantees "most recently posted first" regardless of which tiers contributed.
  return withEvidenceLevel(combined.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (id.startsWith("rw-")) {
    return (await getUnderReviewArticles()).find((a) => a.id === id) ?? null;
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
  // A seed-origin research/industry/product article only ends up inside getArticles()'s
  // composed result when that type's live fetch happened to come back thin that moment
  // (see MIN_LIVE_PER_TYPE above) — so whether a given seed id is "in the pool" can differ
  // between two getArticles() calls made seconds apart, if the live fetch's count happens
  // to cross that threshold either way (a real risk on serverless, where each request can
  // be a cold instance with no shared cache). Checked directly here, before ever touching
  // the live-composed pool, so a seed article's id resolves the same way regardless of
  // what the live pool looked like at this particular moment — Limbic Threads' article
  // swap (see lib/article-view.ts) depends on exactly this: it calls getArticleById again
  // moments after the id was first surfaced from a getArticles() call that isn't
  // guaranteed to recur identically.
  const seedMatch = [...SEED_ARTICLES, ...ORTHOPT_CPG_SEED].find((a) => a.id === id);
  if (seedMatch) return withEvidenceLevel([seedMatch])[0];

  const articles = await getArticles();
  return articles.find((a) => a.id === id) ?? null;
}

export async function getWellnessArticles(): Promise<WellnessArticle[]> {
  const live = await fetchLiveWellness();
  if (live.length >= 2) return live;
  return SEED_WELLNESS_ARTICLES;
}

/** Only seed wellness articles (id "w1".."w4") ever link to /wellness/[id] — live-sourced
 *  ones always carry a sourceUrl and link straight out to the real story instead. */
export async function getWellnessArticleById(id: string): Promise<WellnessArticle | null> {
  return SEED_WELLNESS_ARTICLES.find((w) => w.id === id) ?? null;
}
