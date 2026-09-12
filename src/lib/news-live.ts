import "server-only";
import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { Article, ArticleType, WellnessArticle } from "@/lib/types";
import { SPECIALTY_META, TYPE_META } from "@/lib/meta";
import { classify } from "@/lib/classify";

/**
 * Live news sourcing.
 *
 * "Research" is sourced from PubMed, not this file — see lib/pubmed.ts — since it's the
 * actual authoritative medical-literature database rather than general news search.
 *
 * The remaining home-feed categories (industry/product) don't have a single "PT industry
 * news" API, so each is backed by a Google News RSS search with a query tuned to that
 * category. Worth being straight about what that is: Google publishes no supported news
 * API behind this endpoint, and consuming it programmatically sits outside its terms of
 * service. Everything surfaced links out to the original outlet and nothing is republished,
 * which keeps this on the right side of copyright, but the dependency itself is a
 * commercial-terms risk and the real fix is a licensed news API (NewsAPI, Bing News) or
 * publisher feeds offered for syndication — both of which need a key and a budget decision
 * rather than a code change. Documented here rather than left implicit in the phrase "no
 * API key required", which reads as a convenience when it is actually the problem. To keep general lifestyle/health journalism from slipping
 * onto the home page under a professional-sounding label, a result only survives if it
 * actually matches professional/medical-sector language (see the `matchedTypeKeywords`
 * confidence check in `classify` below) — anything that merely came back from the search
 * without a real keyword match is dropped rather than kept under its query's category by
 * default. General health/wellness content lives only on the Health & Wellness page
 * (`fetchLiveWellness` below), never here.
 *
 * Results are keyword-classified into a specialty (ortho/neuro/cardiopulm/sports/pediatric/
 * geriatric) the same way a real aggregator would bucket free-text into fixed categories —
 * it's a heuristic, not a guarantee, and is documented as such here rather than presented as
 * more rigorous than it is. classify() itself, along with the keyword tables it reads from
 * (specialty, type, and exercise/technique), now lives in lib/classify.ts — a plain module
 * with no "server-only" import, since it's pure text matching and this way it can be unit
 * tested directly (see e2e/classify.spec.ts) without a running server.
 *
 * "Guideline" is deliberately not a reachable outcome of that classifier (see the empty
 * TYPE_KEYWORDS.guideline in lib/classify.ts) — "Guidelines" means the real, curated AOPT
 * clinical practice guidelines in lib/orthopt-cpg-static.ts, not a news story that happens to
 * use the word "guideline". classify() can still be handed a "guideline" defaultType in
 * principle, but nothing calls it with one anymore.
 *
 * "CE & Events" is intentionally NOT sourced live: the home-feed calendar needs a precise
 * future event *date*, which generic news search doesn't carry (a story announcing a
 * webinar is dated to when it was written, not when the webinar happens) — see
 * lib/articles-static.ts and lib/articles.ts for how that category is handled instead.
 */

const parser = new Parser({
  customFields: { item: ["source"] },
  timeout: 8000,
});

const FETCH_TIMEOUT_MS = 8000;
/** Identifies the crawler honestly, with a real contact URL. The previous value pointed at
 *  `https://example.com/bot` — a placeholder, which means a site operator who wanted to ask
 *  us to stop, or to rate-limit us rather than ban us, had nowhere to go. A bot that can't
 *  be contacted looks evasive whether or not it means to be. */
const USER_AGENT = "Mozilla/5.0 (compatible; LimbicPTNews/1.0; +https://limbic.center)";

async function fetchXml(url: string, tags: string[] = ["live-news"]): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
      // Live news should never be served stale-forever, but 10min was actually shorter
      // than the aggregation cache below (15min) — since that outer layer returns early
      // and skips this fetch entirely while it's still warm, this fetch-level cache
      // never got a chance to serve a hit at all; by the time the outer cache expired,
      // this one always had too. Widened to 30min and aligned with the aggregation
      // `revalidate` so the two layers actually agree. Tagged so Home (`live-news`) and
      // Wellness (`live-wellness`) refresh buttons can force a fresh pull on demand via
      // updateTag, without waiting out either window. Wellness queries pass their own
      // tag so a Wellness Refresh does not bust Home's industry/product RSS, and Home
      // Refresh does not bust the Wellness aggregation (Wellness is deliberately not
      // on the Home feed — see the file header).
      next: { revalidate: 1800, tags },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface GoogleNewsItem {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  source?: { $?: { url?: string } } | string;
}
type RawItem = GoogleNewsItem;

/** Exported so other live sources (e.g. lib/apta-news.ts) can search Google News for a
 *  topic that doesn't have its own dedicated feed, using the same mechanism as this file's
 *  own category queries below — including its terms-of-service caveat, see the file header.
 *  `tags` defaults to `live-news`; Wellness passes `live-wellness` so its fetch-level
 *  cache invalidates independently of Home. */
export async function fetchGoogleNewsRss(query: string, tags: string[] = ["live-news"]): Promise<GoogleNewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchXml(url, tags);
  if (!xml) return [];
  try {
    const feed = await parser.parseString(xml);
    return (feed.items || []) as RawItem[];
  } catch {
    return [];
  }
}

export function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function sourceName(item: GoogleNewsItem, fallbackTitle: string): string {
  if (item.source && typeof item.source !== "string") {
    // rss-parser custom field for an un-namespaced <source> tag comes back as text content
    // under a nested shape depending on the feed; fall through to title-splitting below.
  }
  if (typeof item.source === "string" && item.source.trim()) return item.source.trim();
  // Google News titles are "Headline - Publisher"; the publisher is reliably after the
  // last " - " separator.
  const idx = fallbackTitle.lastIndexOf(" - ");
  if (idx > -1) return fallbackTitle.slice(idx + 3).trim();
  return "Google News";
}

function stableId(link: string): string {
  return "live-" + createHash("sha1").update(link).digest("hex").slice(0, 12);
}

export function toIsoDate(item: GoogleNewsItem): string {
  const raw = item.isoDate || item.pubDate;
  const d = raw ? new Date(raw) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function estimateReadMins(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200) || 2);
}

const CATEGORY_QUERIES: { type: ArticleType; query: string }[] = [
  { type: "industry", query: "physical therapy Medicare reimbursement policy" },
  { type: "product", query: "physical therapy equipment device FDA clearance" },
];

function itemToArticle(item: RawItem, defaultType: ArticleType): Article | null {
  const link = item.link;
  const title = (item.title || "").trim();
  if (!link || !title) return null;
  const snippetRaw = stripHtml(item.contentSnippet || item.content || "");
  // Google News snippets repeat the title followed by the source name; drop that prefix
  // when present so the summary doesn't just echo the headline.
  const summary = snippetRaw.length > 20 ? snippetRaw : title;
  const { type, specialty, matchedKeywords, typeConfident } = classify(`${title} ${summary}`, defaultType);
  // A result that doesn't actually match any professional/medical-sector keyword isn't
  // reliably "medical sector news" — it just came back from a loosely-matching search.
  // Drop it rather than keep it under its query's category by default, so general
  // lifestyle/health journalism doesn't slip onto the home feed under a clinical label.
  if (!typeConfident) return null;
  const source = sourceName(item, title);
  const cleanTitle = title.replace(new RegExp(` - ${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim();
  const tags = Array.from(new Set([SPECIALTY_META[specialty], TYPE_META[type].label, ...matchedKeywords]));

  return {
    id: stableId(link),
    type,
    specialty,
    title: cleanTitle || title,
    source,
    sourceUrl: link,
    date: toIsoDate(item),
    readMins: estimateReadMins(summary),
    summary: summary.length > 240 ? summary.slice(0, 237) + "…" : summary,
    tags,
    live: true,
  };
}

/** Fetches and normalizes live articles across every non-calendar category. Never throws —
 *  a source that fails to load simply contributes zero articles for that category.
 *
 *  Cached across requests (not just this process) so badge/article/search callers share
 *  one snapshot. Tagged `live-news` so the Home refresh button's updateTag still forces a
 *  fresh pull — the previous in-memory Map sat in front of that tag and hid refreshes. */
export const fetchLiveArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const results = await Promise.all(
      CATEGORY_QUERIES.map(async ({ type, query }) => {
        const items = await fetchGoogleNewsRss(query);
        return items
          .map((item) => itemToArticle(item, type))
          .filter((a): a is Article => a !== null);
      })
    );

    const seen = new Set<string>();
    const articles: Article[] = [];
    for (const list of results) {
      for (const a of list) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        articles.push(a);
      }
    }
    return articles;
  },
  ["live-articles-aggregation"],
  { revalidate: 1800, tags: ["live-news"] }
);

// Several distinct topical queries, merged and deduped, rather than one fixed search — a
// single query's top results barely change run to run, which would defeat the Health &
// Wellness page's per-user rotation (see lib/wellness-rotation.ts): swapping an opened
// article for an unopened one needs an actual pool of candidates to draw from, not just
// whatever a single search's current top 8 happen to be.
const WELLNESS_QUERIES = [
  "wellness fitness stretching recovery tips",
  "sleep nutrition self-care health",
  "mental health mindfulness stress relief",
  "healthy aging mobility strength exercise",
];

/** Fetches and normalizes live wellness articles across WELLNESS_QUERIES. Never throws —
 *  a query that fails to load simply contributes zero articles.
 *
 *  Cached across requests the same way as fetchLiveArticles, so Overview / Articles /
 *  Nutrition callers share one snapshot instead of firing four Google News RSS queries
 *  on every load. Tagged `live-wellness` (not `live-news`) so Wellness Refresh can bust
 *  it without invalidating Home's industry/product aggregation. */
export const fetchLiveWellness = unstable_cache(
  async (): Promise<WellnessArticle[]> => {
    const results = await Promise.all(WELLNESS_QUERIES.map((q) => fetchGoogleNewsRss(q, ["live-wellness"])));

    const seen = new Set<string>();
    const articles: WellnessArticle[] = [];
    for (const items of results) {
      for (const item of items) {
        const link = item.link;
        const title = (item.title || "").trim();
        if (!link || !title) continue;
        const id = stableId(link);
        if (seen.has(id)) continue;
        seen.add(id);
        const snippet = stripHtml(item.contentSnippet || item.content || "");
        const source = sourceName(item, title);
        const cleanTitle = title.replace(new RegExp(` - ${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim();
        articles.push({
          id,
          source,
          sourceUrl: link,
          date: toIsoDate(item),
          readMins: estimateReadMins(snippet || title),
          title: cleanTitle || title,
          summary: (snippet.length > 20 ? snippet : title).slice(0, 200),
          tags: [],
        });
      }
    }
    return articles.slice(0, 24);
  },
  ["live-wellness-aggregation"],
  { revalidate: 1800, tags: ["live-wellness"] }
);
