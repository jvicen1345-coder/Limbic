import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { Article, EvidenceLevel } from "@/lib/types";
import { classify } from "@/lib/news-live";
import { SPECIALTY_META, TYPE_META } from "@/lib/meta";

/**
 * PubMed (NCBI E-utilities) — the live source for the "Research" category, and for the
 * AI-assisted search on the Search screen. No API key required for this call volume.
 *
 * Three round trips: esearch (find matching PMIDs) → esummary (title/journal/date) →
 * efetch in XML (abstract text). Specialty is still keyword-classified the same way as
 * lib/news-live.ts, since PubMed doesn't tag articles by PT specialty.
 */

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const FETCH_TIMEOUT_MS = 8000;
// MeSH concept terms + PubMed's own structured Publication Type/MeSH tags, not Title/
// Abstract free-text keyword matching — a real evidence-tier upgrade, not just a volume
// one: "randomized"/"trial"/"cohort" as free-text has both false positives (a paper that
// discusses and excludes RCTs) and false negatives (a real RCT whose title/abstract never
// uses that literal word), where Publication Type is what MEDLINE's own indexers formally
// classified the study as — the exact same tag evidenceLevelFromPublicationTypes below
// already reads per-article. Verified live against the real E-utilities API before this
// change shipped: nearly doubles the matching pool (67k -> 126k) while recent-2-year
// supply stays just as healthy (~15.7k), so this is genuinely more current research, not
// older backfill. Meta-analysis is newly included here too — evidenceLevelFromPublicationTypes
// already has its own "MA" tier for it, but the old free-text query wasn't reliably
// catching those articles at all.
const DEFAULT_QUERY =
  '("Physical Therapy Modalities"[MeSH] OR "Rehabilitation"[MeSH] OR "Physical Therapy Specialty"[MeSH]) ' +
  'AND (randomized controlled trial[Publication Type] OR "systematic review"[Publication Type] OR ' +
  '"meta analysis"[Publication Type] OR "clinical trial"[Publication Type] OR "cohort studies"[MeSH])';
// Was 12 — the query above comfortably supports far more without reaching for older or
// less-relevant results (see its own comment), and Home's Research tab / hero pool were
// visibly thin on a query this narrow.
const DEFAULT_LIMIT = 30;

const xmlParser = new XMLParser({ ignoreAttributes: false });

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Tagged so the Home refresh button (see app/actions/home.ts) can force a fresh
    // PubMed pull on demand via updateTag, without waiting out the window. The window
    // itself is widened from 15min to 1hr — new PubMed results don't arrive minute to
    // minute, and every cache miss here is a real 3-round-trip network cost (esearch +
    // esummary + efetch) on whoever's request lands right after expiry.
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600, tags: ["live-research"] } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600, tags: ["live-research"] } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** PubMed abstract XML legitimately contains numeric character references (e.g. "&#x2265;"
 *  for "≥") for symbols that don't survive plain ASCII — fast-xml-parser's default entity
 *  handling doesn't reliably unescape these, so they were passing straight through into
 *  displayed/AI-read abstract text as literal "&#x2265;" instead of "≥". Decoded here as a
 *  final pass, plus the 5 predefined XML entities, so every caller of stripHtml (feed
 *  summaries, and lib/generalizability.ts's full-abstract reads) gets clean text either way. */
function decodeXmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripHtml(s: string): string {
  return decodeXmlEntities(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function estimateReadMins(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200) || 2);
}

/** PubMed's esummary "pubdate" is free text ("2026 Jul 12", "2026 Jul", "2026"). Parse
 *  what we can; fall back to today so the article isn't dropped for an odd date format. */
function parsePubDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const yearMatch = raw.match(/\d{4}/);
  if (yearMatch) return `${yearMatch[0]}-01-01`;
  return new Date().toISOString().slice(0, 10);
}

interface EsummaryEntry {
  title?: string;
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  elocationid?: string;
  articleids?: { idtype: string; value: string }[];
}

/** A <PublicationType> entry parses as a plain string when it has no attributes, or as
 *  `{ "#text": "...", "@_UI": "D..." }` when it does (this parser is configured with
 *  ignoreAttributes: false) — same shape PMID already has to be unwrapped from below. */
function xmlNodeText(node: unknown): string {
  if (typeof node === "string") return node;
  if (node && typeof node === "object" && "#text" in node) return String((node as { "#text"?: unknown })["#text"] ?? "");
  return "";
}

/** PubMed's own controlled-vocabulary PublicationTypeList — checked in priority order
 *  against the exact term strings, not substring matching, since "Systematic Review" and
 *  "Review" are two distinct entries a record can carry independently (a systematic
 *  review that also happens to match "Review" shouldn't shadow the more specific SR). */
function evidenceLevelFromPublicationTypes(types: string[]): EvidenceLevel {
  if (types.includes("Randomized Controlled Trial")) return "RCT";
  if (types.includes("Systematic Review")) return "SR";
  if (types.includes("Meta-Analysis")) return "MA";
  if (types.includes("Review")) return "Review";
  return "Research";
}

interface PubmedMeta {
  abstract: string;
  evidenceLevel: EvidenceLevel;
}

/** Both the abstract text and the evidence level come off the same efetch XML response —
 *  no extra API call needed for evidence levels, just reading more of what's already
 *  being fetched. */
function extractPubmedMeta(efetchXml: string): Map<string, PubmedMeta> {
  const meta = new Map<string, PubmedMeta>();
  try {
    const parsed = xmlParser.parse(efetchXml);
    const articlesRaw = parsed?.PubmedArticleSet?.PubmedArticle;
    const articles = Array.isArray(articlesRaw) ? articlesRaw : articlesRaw ? [articlesRaw] : [];
    for (const art of articles) {
      const pmid = art?.MedlineCitation?.PMID?.["#text"] ?? art?.MedlineCitation?.PMID;
      if (!pmid) continue;

      const abstractTextRaw = art?.MedlineCitation?.Article?.Abstract?.AbstractText;
      const abstractParts = Array.isArray(abstractTextRaw) ? abstractTextRaw : abstractTextRaw ? [abstractTextRaw] : [];
      const abstract = stripHtml(abstractParts.map(xmlNodeText).join(" "));

      const pubTypeRaw = art?.MedlineCitation?.Article?.PublicationTypeList?.PublicationType;
      const pubTypes = (Array.isArray(pubTypeRaw) ? pubTypeRaw : pubTypeRaw ? [pubTypeRaw] : [])
        .map(xmlNodeText)
        .filter(Boolean);

      meta.set(String(pmid), { abstract, evidenceLevel: evidenceLevelFromPublicationTypes(pubTypes) });
    }
  } catch {
    // Malformed/unexpected XML shape — callers fall back to the title as the summary,
    // and to "Research" as the evidence level.
  }
  return meta;
}

function stableId(pmid: string): string {
  return "pubmed-" + pmid;
}

/** Shared by searchPubmed and fetchPubmedById — turns a list of PMIDs into normalized,
 *  classified articles via esummary (metadata) + efetch (abstract text). Never throws. */
async function buildArticlesFromIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  const idParam = ids.join(",");
  const [summaryJson, efetchXml] = await Promise.all([
    fetchJson(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${idParam}`) as Promise<{
      result?: Record<string, EsummaryEntry>;
    } | null>,
    fetchText(`${EUTILS}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${idParam}`),
  ]);
  if (!summaryJson) return [];
  const pubmedMeta = efetchXml ? extractPubmedMeta(efetchXml) : new Map<string, PubmedMeta>();

  const articles: Article[] = [];
  for (const pmid of ids) {
    const entry: EsummaryEntry | undefined = summaryJson.result?.[pmid];
    if (!entry?.title) continue;
    const meta = pubmedMeta.get(pmid);
    const abstract = meta?.abstract ?? "";
    const summary = abstract || entry.title;
    const { specialty, matchedKeywords } = classify(`${entry.title} ${abstract}`, "research");
    const journal = entry.fulljournalname || entry.source || "PubMed";
    const tags = Array.from(new Set([SPECIALTY_META[specialty], TYPE_META.research.label, ...matchedKeywords]));
    const doi = entry.articleids?.find((id) => id.idtype === "doi")?.value ?? undefined;

    articles.push({
      id: stableId(pmid),
      type: "research",
      specialty,
      title: entry.title.replace(/\.$/, ""),
      source: journal,
      sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      date: parsePubDate(entry.pubdate),
      readMins: estimateReadMins(summary),
      summary: summary.length > 320 ? summary.slice(0, 317) + "…" : summary,
      tags,
      live: true,
      evidenceLevel: meta?.evidenceLevel ?? "Research",
      doi,
      fullAbstract: abstract || undefined,
    });
  }
  return articles;
}

/** Runs a PubMed search and returns normalized, classified articles. Never throws — any
 *  failed step just yields fewer (or zero) results. */
export async function searchPubmed(query: string, limit = 12): Promise<Article[]> {
  const searchUrl =
    `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=${limit}&sort=date&term=` +
    encodeURIComponent(query);
  const searchJson = (await fetchJson(searchUrl)) as { esearchresult?: { idlist?: string[] } } | null;
  const ids: string[] = searchJson?.esearchresult?.idlist ?? [];
  return buildArticlesFromIds(ids);
}

export async function fetchPubmedResearch(limit = DEFAULT_LIMIT): Promise<Article[]> {
  return searchPubmed(DEFAULT_QUERY, limit);
}

/** Looks up a single PMID directly — used by getArticleById so an article surfaced by
 *  any search (the default research feed, or a one-off AI-generated query that isn't
 *  otherwise cached anywhere) can always be opened, not just ones that happen to still
 *  be in fetchPubmedResearch()'s current top results. */
export async function fetchPubmedById(pmid: string): Promise<Article | null> {
  const articles = await buildArticlesFromIds([pmid]);
  return articles[0] ?? null;
}

const PUBMED_URL_RE = /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{1,9})/i;
const BARE_PMID_RE = /^\d{4,9}$/;
const DOI_RE = /10\.\d{4,9}\/\S+/;

export interface PubmedAbstractLookup {
  pmid: string;
  title: string;
  journal: string;
  url: string;
  /** The full, untruncated abstract — unlike Article.summary above, which is clipped to
   *  320 chars for feed-card display. Can be empty string for an older record with no
   *  abstract on file; callers should handle that rather than treating it as a failure. */
  abstract: string;
}

/** Resolves free-form input — a PubMed URL, a bare PMID, a DOI, or a plain-text citation/
 *  title — down to one real PubMed record with its full abstract, for lib/generalizability.ts's
 *  Generalizability Checker (see that file's comment on why the full-text esearch-then-efetch
 *  path lives here rather than reusing searchPubmed/fetchPubmedById above, both of which
 *  return the feed-truncated Article shape). Returns null if nothing resolves — including a
 *  too-short/ambiguous free-text input, which isn't attempted as a search term at all, to
 *  avoid esearch's "no match" fallback silently returning an unrelated top-of-database
 *  result for something like a stray word or a mistyped fragment. Never throws. */
export async function resolvePubmedAbstract(input: string): Promise<PubmedAbstractLookup | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let pmid: string | null = null;
  const urlMatch = trimmed.match(PUBMED_URL_RE);
  if (urlMatch) {
    pmid = urlMatch[1];
  } else if (BARE_PMID_RE.test(trimmed)) {
    pmid = trimmed;
  } else {
    const doiMatch = trimmed.match(DOI_RE);
    if (doiMatch || trimmed.length >= 8) {
      const term = doiMatch ? `${doiMatch[0]}[DOI]` : trimmed;
      const searchUrl = `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=1&term=${encodeURIComponent(term)}`;
      const searchJson = (await fetchJson(searchUrl)) as { esearchresult?: { idlist?: string[] } } | null;
      pmid = searchJson?.esearchresult?.idlist?.[0] ?? null;
    }
  }
  if (!pmid) return null;

  const [summaryJson, efetchXml] = await Promise.all([
    fetchJson(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}`) as Promise<{
      result?: Record<string, EsummaryEntry>;
    } | null>,
    fetchText(`${EUTILS}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${pmid}`),
  ]);
  const entry = summaryJson?.result?.[pmid];
  if (!entry?.title) return null;

  const meta = efetchXml ? extractPubmedMeta(efetchXml) : new Map<string, PubmedMeta>();
  return {
    pmid,
    title: entry.title.replace(/\.$/, ""),
    journal: entry.fulljournalname || entry.source || "PubMed",
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    abstract: meta.get(pmid)?.abstract ?? "",
  };
}
