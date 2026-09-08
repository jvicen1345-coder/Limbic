import "server-only";
import type { Article, ArticleType, WellnessArticle } from "@/lib/types";
import { SEED_WELLNESS_ARTICLES, WELLNESS_VIDEOS } from "@/lib/articles-static";
import { fetchLiveArticles, fetchLiveWellness } from "@/lib/news-live";
import { fetchPubmedResearch, fetchPubmedById } from "@/lib/pubmed";
import { RETRACTION_WATCH_ARTICLES } from "@/lib/retraction-watch-data";
import { fetchAptaNews } from "@/lib/apta-news";
import { ORTHOPT_CPG_SEED } from "@/lib/orthopt-cpg-static";
import { defaultEvidenceLevelForType } from "@/lib/evidence";
import { getPublishedAppraisals, getAppraisalArticleById, isAppraisalArticleId } from "@/lib/appraisals-feed";

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
 * There is no fabricated fallback at any tier. This used to top up thin live results
 * from SEED_ARTICLES — hand-authored filler with fabricated study details, fake
 * legislative changes and invented FDA clearances, carrying the bylines of real journals
 * and federal documents. Interleaving that with genuine PubMed/news results, with no way
 * for a reader to tell them apart, is both a clinical-trust problem for the licensed
 * clinicians reading this feed and a false attribution to the real sources named on it.
 * That array is now deleted outright rather than merely unsurfaced. In practice PubMed
 * and the Google News queries return well above what a MIN_LIVE_PER_TYPE-style threshold
 * ever needed, so real supply was never the constraint the fallback existed for; a
 * category that genuinely has nothing returns empty.
 *
 * CE & Events has no live source at all right now (Google News doesn't carry precise
 * future event dates — see lib/news-live.ts) and, for the same reason, no longer falls
 * back to fabricated event listings either: it returns empty until a genuinely real,
 * curated source (same bar as ORTHOPT_CPG_SEED below — real, with real links) exists.
 */
export async function getArticles(): Promise<Article[]> {
  const [live, pubmedResearch, appraisals] = await Promise.all([
    fetchLiveArticles(),
    fetchPubmedResearch(),
    getPublishedAppraisals(),
  ]);
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

  // Limbic's own appraisals lead the research section. They are the only articles in this
  // feed the platform wrote itself (see lib/appraisals-feed.ts), and a piece written for
  // this audience about a study someone chose deliberately outranks the top of a generic
  // PubMed query — which is what the rest of `research` is.
  appraisals.forEach(add);

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
 * Third-party reporting about APTA via Google News (see lib/apta-news.ts). No fabricated
 * fallback, so this can come back sparse or empty rather than ever showing invented news.
 * Kept separate from getArticles() — this is its own feed, not a category within the
 * main one.
 */
export async function getAptaNewsArticles(): Promise<Article[]> {
  const live = await fetchAptaNews();
  return withEvidenceLevel(live.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
}

function mergeArticleLists(...lists: Article[][]): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];
  for (const list of lists) {
    for (const a of list) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      result.push(a);
    }
  }
  return withEvidenceLevel(result);
}

/** Related/threads pool for one article id, chosen from the id prefix so a research
 *  article does not wait on Google News, and an APTA/live story does not wait on PubMed
 *  unless the opened article is equipment news (product threads count related studies). */
export async function getArticleContextPoolForId(articleId: string): Promise<Article[]> {
  if (articleId.startsWith("apta-")) {
    return getAptaNewsArticles();
  }
  if (articleId.startsWith("rw-")) {
    return getUnderReviewArticles();
  }
  if (articleId.startsWith("cpg-")) {
    return withEvidenceLevel([...ORTHOPT_CPG_SEED]);
  }
  if (articleId.startsWith("pubmed-") || isAppraisalArticleId(articleId)) {
    const [pubmedResearch, appraisals] = await Promise.all([fetchPubmedResearch(), getPublishedAppraisals()]);
    return mergeArticleLists(appraisals, pubmedResearch, ORTHOPT_CPG_SEED);
  }
  if (articleId.startsWith("live-")) {
    return fetchLiveArticles().then((live) => withEvidenceLevel(live));
  }
  return [];
}

export async function getArticleById(id: string): Promise<Article | null> {
  // Resolved directly rather than through getArticles() below so a published appraisal
  // stays reachable by a saved link even once it has aged out of the merged feed.
  if (isAppraisalArticleId(id)) {
    const appraisal = await getAppraisalArticleById(id);
    return appraisal ? withEvidenceLevel([appraisal])[0] : null;
  }
  if (id.startsWith("rw-")) {
    return (await getUnderReviewArticles()).find((a) => a.id === id) ?? null;
  }
  if (id.startsWith("apta-")) {
    const aptaArticles = await getAptaNewsArticles();
    // No fallback beyond the live tiers. A previously-saved id that no live tier
    // still carries resolves to null and 404s, which is the intended outcome: the
    // APTA_NEWS_SEED it used to fall back to was fabricated APTA news, and a stale
    // bookmark 404ing is a far better failure than serving invented advocacy reporting
    // under a real association's byline (see lib/apta-news-static.ts's removal).
    return aptaArticles.find((a) => a.id === id) ?? null;
  }
  if (id.startsWith("pubmed-")) {
    // Don't rely on the article still being in fetchPubmedResearch()'s current top
    // results — a one-off AI-search query returns PMIDs that generic query never
    // touches, so look this one PMID up directly instead of 404ing on a valid article.
    return fetchPubmedById(id.slice("pubmed-".length));
  }
  if (id.startsWith("live-")) {
    const live = await fetchLiveArticles();
    return live.find((a) => a.id === id) ?? null;
  }
  // ORTHOPT_CPG_SEED only — these are real, curated AOPT guidelines that getArticles()
  // also surfaces, resolved here directly so the lookup doesn't depend on a live fetch.
  // The fabricated SEED_ARTICLES that used to be checked alongside them are deleted.
  const seedMatch = ORTHOPT_CPG_SEED.find((a) => a.id === id);
  if (seedMatch) return withEvidenceLevel([seedMatch])[0];

  // Classified ids are handled above. Do not scan the full Home pool for unknown ids —
  // that used to couple every missed bookmark to a live news + PubMed refresh, and
  // fabricated seed rows are gone, so there is nothing left to find there.
  return null;
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
