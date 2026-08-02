import "server-only";
import Parser from "rss-parser";
import { createHash } from "node:crypto";
import type { Article, ArticleType, Specialty, WellnessArticle } from "@/lib/types";
import { SPECIALTY_META, TYPE_META } from "@/lib/meta";

/**
 * Live news sourcing.
 *
 * "Research" is sourced from PubMed, not this file — see lib/pubmed.ts — since it's the
 * actual authoritative medical-literature database rather than general news search.
 *
 * The remaining home-feed categories (industry/product) don't have a single "PT industry
 * news" API, so each is backed by a Google News RSS search (no API key required) with a
 * query tuned to that category. To keep general lifestyle/health journalism from slipping
 * onto the home page under a professional-sounding label, a result only survives if it
 * actually matches professional/medical-sector language (see the `matchedTypeKeywords`
 * confidence check in `classify` below) — anything that merely came back from the search
 * without a real keyword match is dropped rather than kept under its query's category by
 * default. General health/wellness content lives only on the Health & Wellness page
 * (`fetchLiveWellness` below), never here.
 *
 * Results are keyword-classified into a specialty (ortho/neuro/sports/pediatric/geriatric)
 * the same way a real aggregator would bucket free-text into fixed categories — it's a
 * heuristic, not a guarantee, and is documented as such here rather than presented as more
 * rigorous than it is.
 *
 * "Guideline" is deliberately not a reachable outcome of that classifier (see the empty
 * TYPE_KEYWORDS.guideline below) — "Guidelines" means the real, curated AOPT clinical
 * practice guidelines in lib/orthopt-cpg-static.ts, not a news story that happens to use
 * the word "guideline". classify() can still be handed a "guideline" defaultType in
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
const USER_AGENT =
  "Mozilla/5.0 (compatible; LimbicPTNews/1.0; +https://example.com/bot)";

async function fetchXml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
      // Live news should never be served stale-forever; a short revalidate window still
      // lets Next.js de-duplicate bursts of concurrent requests.
      next: { revalidate: 600 },
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
 *  topic that doesn't have its own dedicated feed, using the same no-API-key mechanism
 *  as this file's own category queries below. */
export async function fetchGoogleNewsRss(query: string): Promise<GoogleNewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchXml(url);
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

const SPECIALTY_KEYWORDS: Record<Specialty, string[]> = {
  ortho: ["orthopedic", "orthopaedic", "knee", "hip", "spine", "joint", "acl", "fracture", "shoulder", "back pain"],
  neuro: ["stroke", "neurologic", "neurological", "vestibular", "parkinson", "brain injury", "multiple sclerosis", "spinal cord"],
  sports: ["sports", "athlete", "athletic", "concussion", "return to play", "return-to-sport", "ncaa", "combine"],
  pediatric: ["pediatric", "paediatric", "children", "child", "infant", "cerebral palsy", "toddler"],
  geriatric: ["geriatric", "older adult", "elderly", "senior", "fall risk", "falls prevention", "aging"],
};

const TYPE_KEYWORDS: Record<ArticleType, string[]> = {
  research: ["study", "trial", "researchers", "journal", "randomized", "cohort", "findings"],
  // Empty on purpose: "Guidelines" now means the real, curated AOPT clinical practice
  // guidelines in lib/orthopt-cpg-static.ts, not a keyword guess off general news search —
  // see lib/articles.ts. An empty keyword list means classify() can never award a Google
  // News result "guideline" as its best-match type.
  guideline: [],
  industry: ["cms", "medicare", "medicaid", "reimbursement", "policy", "legislation", "law", "insurer", "payer", "regulation"],
  ce: ["webinar", "conference", "continuing education", "ce credit", "course", "csm", "symposium"],
  product: ["device", "wearable", "equipment", "fda clearance", "fda-cleared", "launch", "software", "app"],
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A handful of keyword literals are acronyms that title-casing mangles ("Cms" instead of
 *  "CMS"), or are spelling variants of the same thing ("fda clearance" / "fda-cleared") —
 *  normalized here so they don't show up as separate near-duplicate topic chips. */
const KEYWORD_LABEL_OVERRIDES: Record<string, string> = {
  cms: "CMS",
  ncaa: "NCAA",
  csm: "CSM",
  acl: "ACL",
  "fda clearance": "FDA Clearance",
  "fda-cleared": "FDA Clearance",
};

/** Keywords that just restate the specialty/type label already guaranteed to be on the
 *  article (SPECIALTY_META / TYPE_META add that label separately, unconditionally) —
 *  not useful as a distinct followable topic, so dropped rather than kept as a duplicate. */
const SUPPRESSED_KEYWORDS = new Set([
  "pediatric",
  "paediatric",
  "geriatric",
  "sports",
  "neurologic",
  "neurological",
  "orthopedic",
  "orthopaedic",
  "guideline",
  "equipment",
]);

/** Returns the display label for a matched keyword, or null if it should be dropped —
 *  see SUPPRESSED_KEYWORDS and KEYWORD_LABEL_OVERRIDES above. */
function keywordLabel(kw: string): string | null {
  const lower = kw.toLowerCase();
  if (SUPPRESSED_KEYWORDS.has(lower)) return null;
  return KEYWORD_LABEL_OVERRIDES[lower] ?? titleCase(kw);
}

export function classify(
  text: string,
  defaultType: ArticleType
): { type: ArticleType; specialty: Specialty; matchedKeywords: string[]; typeConfident: boolean } {
  const lower = text.toLowerCase();
  let bestSpecialty: Specialty = "ortho";
  let bestSpecialtyHits = 0;
  let bestSpecialtyKeywords: string[] = [];
  (Object.keys(SPECIALTY_KEYWORDS) as Specialty[]).forEach((sp) => {
    const matched = SPECIALTY_KEYWORDS[sp].filter((kw) => lower.includes(kw));
    if (matched.length > bestSpecialtyHits) {
      bestSpecialtyHits = matched.length;
      bestSpecialty = sp;
      // Every keyword that matched the winning specialty, not just the first — a followed
      // topic like "ACL" or "fall risk" only ever affects ranking (see rankFeed) if it
      // actually ends up in the article's tags, so a single kept keyword per article made
      // most of the long-tail topic list effectively inert.
      bestSpecialtyKeywords = matched;
    }
  });

  let type = defaultType;
  let bestTypeHits = 0;
  let bestTypeKeywords: string[] = [];
  (Object.keys(TYPE_KEYWORDS) as ArticleType[]).forEach((t) => {
    const matched = TYPE_KEYWORDS[t].filter((kw) => lower.includes(kw));
    if (matched.length > bestTypeHits) {
      bestTypeHits = matched.length;
      type = t;
      bestTypeKeywords = matched;
    }
  });

  const matchedKeywords = [...bestSpecialtyKeywords, ...bestTypeKeywords]
    .map(keywordLabel)
    .filter((k): k is string => k !== null);
  return { type, specialty: bestSpecialty, matchedKeywords, typeConfident: bestTypeHits > 0 };
}

/** Every keyword-derived topic label classify() can ever produce, normalized the same way
 *  and deduplicated — independent of which articles happen to be loaded right now. Used to
 *  populate Profile's "Add more" topic list so it doesn't shrink or grow as live sources
 *  refresh (classify() only keeps the first-matched keyword per article, so plenty of these
 *  never win that slot for any currently-loaded article, and would otherwise never appear
 *  as a followable topic at all). */
export function allKnownKeywordTopics(): string[] {
  const allKeywords = [...Object.values(SPECIALTY_KEYWORDS).flat(), ...Object.values(TYPE_KEYWORDS).flat()];
  const labels = allKeywords.map(keywordLabel).filter((k): k is string => k !== null);
  return Array.from(new Set(labels)).sort();
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

let cache: { at: number; articles: Article[] } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

/** Fetches and normalizes live articles across every non-calendar category. Never throws —
 *  a source that fails to load simply contributes zero articles for that category. */
export async function fetchLiveArticles(): Promise<Article[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.articles;

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

  cache = { at: Date.now(), articles };
  return articles;
}

export async function fetchLiveWellness(): Promise<WellnessArticle[]> {
  const items = await fetchGoogleNewsRss("wellness fitness stretching recovery tips");
  return items
    .map((item): WellnessArticle | null => {
      const link = item.link;
      const title = (item.title || "").trim();
      if (!link || !title) return null;
      const snippet = stripHtml(item.contentSnippet || item.content || "");
      const source = sourceName(item, title);
      const cleanTitle = title.replace(new RegExp(` - ${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "").trim();
      return {
        id: stableId(link),
        source,
        sourceUrl: link,
        date: toIsoDate(item),
        readMins: estimateReadMins(snippet || title),
        title: cleanTitle || title,
        summary: (snippet.length > 20 ? snippet : title).slice(0, 200),
        tags: [],
      };
    })
    .filter((w): w is WellnessArticle => w !== null)
    .slice(0, 8);
}
