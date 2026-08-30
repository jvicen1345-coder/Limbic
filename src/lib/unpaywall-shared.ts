/**
 * The client-safe half of lib/unpaywall.ts — the result type and pure display-label
 * helpers, with no "server-only" fetch and no contact email involved, so
 * components/ArticleReadingPane.tsx (a Client Component) can import getOaStatusLabel/
 * UnpaywallResult without pulling the server-only checkUnpaywall() network call (and its
 * "server-only" guard) into the client bundle. lib/unpaywall.ts re-exports everything here
 * too, so server-side callers (lib/article-view.ts) can import from either module.
 */

export interface UnpaywallResult {
  doi: string;
  isOpenAccess: boolean;
  oaStatus: "gold" | "hybrid" | "bronze" | "green" | "closed";
  bestOaLocation: {
    url: string;
    urlForPdf?: string;
    hostType: "publisher" | "repository";
    license?: string;
    version?: string;
  } | null;
  title: string;
  journal: string;
}

/** Fallback DOI extraction from a publisher URL (e.g. a Google News/APTA sourceUrl that
 *  happens to embed a DOI) — used only when an article has no doi field of its own set
 *  directly (see lib/article-view.ts). */
export function extractDoiFromUrl(url: string): string | null {
  const doiPatterns = [/10\.\d{4,}\/[^\s"<>]+/, /doi\.org\/(10\.\d{4,}\/[^\s"<>]+)/];

  for (const pattern of doiPatterns) {
    const match = url.match(pattern);
    if (match) return match[1] ?? match[0];
  }

  return null;
}

export function getOaStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    gold: "Open Access",
    hybrid: "Open Access",
    bronze: "Free to Read",
    green: "Free Version Available",
    closed: "Subscription Required",
  };
  return labels[status] ?? "Check Publisher";
}

export function getOaStatusColor(status: string): string {
  const colors: Record<string, string> = {
    gold: "#16a34a",
    hybrid: "#16a34a",
    bronze: "#c9853a",
    green: "#16a34a",
    closed: "var(--color-neutral-700)",
  };
  return colors[status] ?? "var(--color-neutral-700)";
}
