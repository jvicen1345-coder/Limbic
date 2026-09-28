import { RETRACTION_WATCH_ARTICLES } from "@/lib/retraction-watch-data";

/**
 * Whether a study the reader is looking at appears in the bundled Retraction Watch snapshot
 * (lib/retraction-watch-data.ts). Until now that data only powered the separate Under Review
 * list, so a reader who reached a retracted paper through the feed or search had no warning
 * on the paper itself — which is exactly where one is needed.
 *
 * Matched by DOI first (exact, case-insensitive), then by normalized title. A title match is
 * deliberately strict — the whole title, punctuation and case aside — so two different
 * papers with a similar name never trade flags.
 */

export interface RetractionFlag {
  status: string;
  reason: string;
  noticeUrl: string | null;
  date: string;
}

function normalizeDoi(doi: string): string {
  return doi
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "");
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const byDoi = new Map<string, RetractionFlag>();
const byTitle = new Map<string, RetractionFlag>();

for (const a of RETRACTION_WATCH_ARTICLES) {
  const flag: RetractionFlag = {
    status: a.reviewStatus ?? "Under review",
    reason: a.underReview ?? "",
    noticeUrl: a.sourceUrl ?? null,
    date: a.date,
  };
  if (a.sourceUrl && /doi\.org\//i.test(a.sourceUrl)) byDoi.set(normalizeDoi(a.sourceUrl), flag);
  const t = normalizeTitle(a.title);
  if (t.length >= 20) byTitle.set(t, flag);
}

export function findRetraction(article: { doi?: string | null; title: string; sourceUrl?: string | null }): RetractionFlag | null {
  if (article.doi) {
    const hit = byDoi.get(normalizeDoi(article.doi));
    if (hit) return hit;
  }
  if (article.sourceUrl && /doi\.org\//i.test(article.sourceUrl)) {
    const hit = byDoi.get(normalizeDoi(article.sourceUrl));
    if (hit) return hit;
  }
  return byTitle.get(normalizeTitle(article.title)) ?? null;
}
