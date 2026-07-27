import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { Article } from "@/lib/types";
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
const DEFAULT_QUERY =
  '("physical therapy"[Title/Abstract] OR "physiotherapy"[Title/Abstract] OR rehabilitation[Title/Abstract]) ' +
  "AND (randomized[Title/Abstract] OR trial[Title/Abstract] OR \"systematic review\"[Title/Abstract] OR cohort[Title/Abstract])";

const xmlParser = new XMLParser({ ignoreAttributes: false });

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } });
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
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
}

function extractAbstracts(efetchXml: string): Map<string, string> {
  const abstracts = new Map<string, string>();
  try {
    const parsed = xmlParser.parse(efetchXml);
    const articlesRaw = parsed?.PubmedArticleSet?.PubmedArticle;
    const articles = Array.isArray(articlesRaw) ? articlesRaw : articlesRaw ? [articlesRaw] : [];
    for (const art of articles) {
      const pmid = art?.MedlineCitation?.PMID?.["#text"] ?? art?.MedlineCitation?.PMID;
      const abstractTextRaw = art?.MedlineCitation?.Article?.Abstract?.AbstractText;
      if (!pmid || !abstractTextRaw) continue;
      const parts = Array.isArray(abstractTextRaw) ? abstractTextRaw : [abstractTextRaw];
      const text = parts
        .map((p: unknown) => (typeof p === "string" ? p : (p as { "#text"?: string })?.["#text"] ?? ""))
        .join(" ");
      abstracts.set(String(pmid), stripHtml(text));
    }
  } catch {
    // Malformed/unexpected XML shape — callers fall back to the title as the summary.
  }
  return abstracts;
}

function stableId(pmid: string): string {
  return "pubmed-" + pmid;
}

/** Runs a PubMed search and returns normalized, classified articles. Never throws — any
 *  failed step just yields fewer (or zero) results. */
export async function searchPubmed(query: string, limit = 12): Promise<Article[]> {
  const searchUrl =
    `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=${limit}&sort=date&term=` +
    encodeURIComponent(query);
  const searchJson = (await fetchJson(searchUrl)) as { esearchresult?: { idlist?: string[] } } | null;
  const ids: string[] = searchJson?.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const idParam = ids.join(",");
  const [summaryJson, efetchXml] = await Promise.all([
    fetchJson(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${idParam}`) as Promise<{
      result?: Record<string, EsummaryEntry>;
    } | null>,
    fetchText(`${EUTILS}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml&id=${idParam}`),
  ]);
  if (!summaryJson) return [];
  const abstracts = efetchXml ? extractAbstracts(efetchXml) : new Map<string, string>();

  const articles: Article[] = [];
  for (const pmid of ids) {
    const entry: EsummaryEntry | undefined = summaryJson.result?.[pmid];
    if (!entry?.title) continue;
    const abstract = abstracts.get(pmid) ?? "";
    const summary = abstract || entry.title;
    const { specialty, matchedKeywords } = classify(`${entry.title} ${abstract}`, "research");
    const journal = entry.fulljournalname || entry.source || "PubMed";
    const tags = Array.from(new Set([SPECIALTY_META[specialty], TYPE_META.research.label, ...matchedKeywords]));

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
    });
  }
  return articles;
}

export async function fetchPubmedResearch(limit = 12): Promise<Article[]> {
  return searchPubmed(DEFAULT_QUERY, limit);
}
