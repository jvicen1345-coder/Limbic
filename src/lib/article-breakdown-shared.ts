/** The client-safe half of the article study breakdown — the result type, the field list
 *  the page renders from, and the "does this article get a breakdown at all?" rule.
 *
 *  Split out of lib/article-breakdown.ts for the same reason lib/unpaywall-shared.ts is
 *  split out of lib/unpaywall.ts: that module constructs an Anthropic client and is marked
 *  "server-only", so a client component importing anything from it fails the build. These
 *  three exports are needed on both sides — components/ArticleBreakdown.tsx and
 *  components/ArticleReadingPane.tsx are client components — so they live here, with no
 *  server-only imports of their own. */

export interface ArticleBreakdown {
  question: string;
  population: string;
  design: string;
  findings: string[];
  takeaway: string;
}

/** The five fields in render order, with the label each gets on the page. Exported so
 *  components/ArticleBreakdown.tsx renders from one list rather than hardcoding the same
 *  order a second time — `findings` is the one that renders as bullets, handled separately
 *  there. */
export const BREAKDOWN_FIELDS = [
  { key: "question", label: "What they asked" },
  { key: "population", label: "Who was studied" },
  { key: "design", label: "What they did" },
  { key: "findings", label: "What they found" },
  { key: "takeaway", label: "What it means" },
] as const;

/** The abstract text a breakdown is generated from, or null when this article has none to
 *  work with. Centralized here because two callers have to agree exactly on which articles
 *  get a breakdown — lib/article-view.ts (does this article need one, and should its
 *  abstract be stripped before it reaches the client?) and app/actions/article-breakdown.ts
 *  (generate it). If those two drifted apart, an article could render a breakdown slot the
 *  action then refuses to fill. The reading pane deliberately does *not* call this: it gets
 *  a server-computed `hasBreakdown` flag instead, since by the time the article reaches it
 *  the `fullAbstract` this reads has already been stripped.
 *
 *  `fullAbstract` is the untruncated PubMed abstract; `summary` is the same text clipped to
 *  320 chars (see lib/pubmed.ts) and is the fallback for a live article that arrived
 *  without one. Seed articles with authored `body` paragraphs are excluded on purpose:
 *  that's Limbic's own writing, not a publisher's abstract, and there's nothing to
 *  summarize away. */
export function breakdownSourceText(article: {
  live?: boolean;
  body?: string[];
  fullAbstract?: string;
  summary?: string;
}): string | null {
  if (article.body && article.body.length > 0) return null;
  if (!article.live) return null;
  const text = article.fullAbstract?.trim() || article.summary?.trim() || "";
  // Too short to break down into five fields — a bare title, or a record PubMed has no
  // abstract for. The reader gets the link out to the source instead.
  return text.length >= 200 ? text : null;
}

export const BREAKDOWN_FAILED_MESSAGE =
  "Could not break this study down. The abstract may not contain enough information.";
