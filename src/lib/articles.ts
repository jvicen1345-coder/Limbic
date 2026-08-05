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

/**
 * The merged article feed: PubMed for research, Google-News-sourced industry/equipment,
 * always-static "under review" items (an editorial workflow status, not a live-news
 * concept), and the always-static, real AOPT clinical practice guidelines (see
 * lib/orthopt-cpg-static.ts — "Guidelines" means those specific documents, not a keyword
 * guess off general news search).
 *
 * Deliberately never tops up a thin live result with SEED_ARTICLES (lib/articles-static.ts)
 * — that file is hand-authored, illustrative content (fabricated study details, fake
 * legislative changes, invented FDA clearances) with no real sourceUrl a reader could
 * verify it against, and showing it interleaved with genuine PubMed/news results with no
 * way to tell them apart is a real clinical-trust problem for licensed clinicians reading
 * this feed. In practice PubMed and the Google News queries return well above what a
 * MIN_LIVE_PER_TYPE-style threshold ever needed, so real supply isn't actually the
 * constraint that fallback existed for. SEED_ARTICLES itself isn't deleted — see
 * getArticleById below, which still resolves already-saved seed-origin ids directly —
 * just never surfaced as a new recommendation.
 *
 * CE & Events has no live source at all right now (Google News doesn't carry precise
 * future event dates — see lib/news-live.ts) and, for the same reason, no longer falls
 * back to fabricated event listings either: it returns empty until a genuinely real,
 * curated source (same bar as ORTHOPT_CPG_SEED below — real, with real links) exists.
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
  }
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
 * an API/RSS feed, and the real risk that it may not work in production either). Two real
 * tiers (see lib/apta-news.ts) — never tops up with APTA_NEWS_SEED's fabricated content
 * (same reasoning as getArticles() above), so this can come back sparse or empty if both
 * tiers genuinely have nothing, rather than ever showing invented news. Kept separate from
 * getArticles() — this is its own feed, not a category within the main one.
 */
export async function getAptaNewsArticles(): Promise<Article[]> {
  const live = await fetchAptaNews();
  // Tier 1 (direct scrape) and tier 2 (Google News) each come back in their own order —
  // concatenating them isn't sorted, so this guarantees "most recently posted first"
  // regardless of which tier contributed.
  return withEvidenceLevel(live.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (id.startsWith("rw-")) {
    return (await getUnderReviewArticles()).find((a) => a.id === id) ?? null;
  }
  if (id.startsWith("apta-")) {
    const aptaArticles = await getAptaNewsArticles();
    const live = aptaArticles.find((a) => a.id === id);
    if (live) return live;
    // Not a live result right now — still resolve it directly if it's a
    // previously-saved APTA_NEWS_SEED id, same backward-compatibility reasoning as the
    // SEED_ARTICLES fallback below: getArticles()/getAptaNewsArticles() no longer
    // surface this fabricated content as a *new* recommendation, but an existing
    // SavedArticle row pointing at one shouldn't 404 just because of that.
    const aptaSeedMatch = APTA_NEWS_SEED.find((a) => a.id === id);
    return aptaSeedMatch ? withEvidenceLevel([aptaSeedMatch])[0] : null;
  }
  if (id.startsWith("pubmed-")) {
    // Don't rely on the article still being in fetchPubmedResearch()'s current top
    // results — a one-off AI-search query returns PMIDs that generic query never
    // touches, so look this one PMID up directly instead of 404ing on a valid article.
    return fetchPubmedById(id.slice("pubmed-".length));
  }
  // SEED_ARTICLES is no longer surfaced as a new recommendation (see getArticles()
  // above) — checked directly here only so a previously-saved seed-origin id still
  // resolves instead of 404ing, same reasoning as the APTA_NEWS_SEED check above.
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
