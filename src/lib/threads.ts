import "server-only";
import { prisma } from "@/lib/db";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { CLIPS } from "@/lib/clips-static";
import { SPECIALTY_META, TYPE_META } from "@/lib/meta";
import { THREADS_INSIGHT_META, type ThreadsNodeData } from "@/lib/threads-graph";
import type { Article, ArticleType } from "@/lib/types";

const MAX_MATCHES_CONSIDERED = 4;
const NEXUS_POSTS_SCANNED = 60;

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/** Same specialty-or-tag-overlap relevance test used for the "Related" section on the
 *  article page itself (see app/(app)/article/[id]/page.tsx) — kept independent rather
 *  than shared, since that one also allows a same-type match with no tag overlap at all,
 *  which would be too loose for Threads' "connected knowledge" framing. */
function isRelated(article: Article, candidate: Article): boolean {
  if (candidate.id === article.id) return false;
  if (candidate.specialty === article.specialty) return true;
  const tags = new Set(article.tags.map((t) => t.toLowerCase()));
  return candidate.tags.some((t) => tags.has(t.toLowerCase()));
}

function matchesOfType(article: Article, pool: Article[], type: ArticleType): Article[] {
  return pool
    .filter((a) => a.type === type && isRelated(article, a))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_MATCHES_CONSIDERED);
}

/** The article's own tags, minus the ones that just restate its specialty/type label
 *  (already shown elsewhere on the page) — same spirit as news-live.ts's
 *  SUPPRESSED_KEYWORDS, applied generically here to any article's tag list. */
function techniqueTags(article: Article): string[] {
  const specialtyLabel = SPECIALTY_META[article.specialty];
  const typeLabel = TYPE_META[article.type].label;
  return article.tags.filter((t) => t !== specialtyLabel && t !== typeLabel);
}

async function findNexusMatch(article: Article): Promise<{ authorName: string; snippet: string } | null> {
  await ensureNexusSeedData();
  const candidateTerms = [SPECIALTY_META[article.specialty], ...techniqueTags(article)].map((t) => t.toLowerCase());
  if (candidateTerms.length === 0) return null;

  const posts = await prisma.nexusPost.findMany({
    orderBy: { createdAt: "desc" },
    take: NEXUS_POSTS_SCANNED,
    select: { body: true, articleTitle: true, author: { select: { name: true } } },
  });

  for (const post of posts) {
    const haystack = `${post.body} ${post.articleTitle ?? ""}`.toLowerCase();
    if (candidateTerms.some((term) => haystack.includes(term))) {
      return { authorName: post.author.name, snippet: truncate(post.body, 140) };
    }
  }
  return null;
}

function findClipMatch(article: Article) {
  return CLIPS.find((c) => c.specialty === article.specialty) ?? null;
}

/** Assembles Limbic Threads' full 11-node, 3-ring web for one article — see
 *  lib/threads-graph.ts for the node/action shapes. Every node here is either backed by
 *  real data (connected articles, the article's own tags, a best-effort Nexus post match,
 *  a specialty-matched Clip) or is one of the 5 "insight" nodes whose actual text is
 *  synthesized by Limbic Agent lazily, client-side, only for PRO viewers who click it
 *  (see app/actions/threads.ts) — nothing here fabricates clinical content ahead of time.
 *  `articlePool` is the caller's already-fetched getArticles() result, passed in rather
 *  than fetched again here. */
export async function buildThreadsWeb(article: Article, articlePool: Article[]): Promise<ThreadsNodeData[]> {
  const research = matchesOfType(article, articlePool, "research");
  const guidelines = matchesOfType(article, articlePool, "guideline");
  const techniques = techniqueTags(article);
  const primaryTag = techniques[0] ?? SPECIALTY_META[article.specialty];

  const [nexusMatch] = await Promise.all([findNexusMatch(article)]);
  const clipMatch = findClipMatch(article);

  const nodes: ThreadsNodeData[] = [
    {
      id: "center",
      parentId: null,
      ring: 0,
      label: truncate(article.title, 42),
      detail: article.summary,
      action: { kind: "navigate", label: "Read the article", href: `/article/${article.id}` },
    },
    {
      id: "research",
      parentId: "center",
      ring: 1,
      label: "Connected Research",
      detail:
        research.length > 0
          ? `${research.length} related ${research.length === 1 ? "study" : "studies"} found — most recently "${truncate(research[0].title, 60)}".`
          : "No connected research found yet.",
      // Links straight to the specific article the detail text names, rather than a
      // Search query — a query built from just one tag is a narrower filter than the
      // specialty-or-any-tag match that produced the count above, so it was routinely
      // surfacing fewer results than "N found" promised (sometimes just 1).
      action:
        research.length > 0
          ? { kind: "navigate", label: "Read the article", href: `/article/${research[0].id}` }
          : { kind: "navigate", label: "Browse Research", href: "/search?type=research" },
    },
    {
      id: "implications",
      parentId: "center",
      ring: 1,
      label: THREADS_INSIGHT_META.implications.label,
      detail: "",
      action: { kind: "insight", insightKind: "implications" },
    },
    {
      id: "guidelines",
      parentId: "center",
      ring: 1,
      label: "Related Guidelines",
      detail:
        guidelines.length > 0
          ? `${guidelines.length} related ${guidelines.length === 1 ? "guideline" : "guidelines"} found — most recently "${truncate(guidelines[0].title, 60)}".`
          : "No related guidelines found yet.",
      // Same reasoning as "research" above — links to the specific named guideline.
      action:
        guidelines.length > 0
          ? { kind: "navigate", label: "Read the guideline", href: `/article/${guidelines[0].id}` }
          : { kind: "navigate", label: "Browse Guidelines", href: "/search?type=guideline" },
    },
    {
      id: "techniques",
      parentId: "center",
      ring: 1,
      label: "Relevant Techniques",
      detail: techniques.length > 0 ? `Mentioned in this article: ${techniques.join(", ")}.` : "No specific techniques tagged for this article.",
      action:
        techniques.length > 0
          ? { kind: "navigate", label: "Explore in Search", href: `/search?q=${encodeURIComponent(primaryTag)}` }
          : { kind: "navigate", label: "Browse Search", href: "/search" },
    },
    {
      id: "patient-education",
      parentId: "implications",
      ring: 2,
      label: THREADS_INSIGHT_META["patient-education"].label,
      detail: "",
      action: { kind: "insight", insightKind: "patient-education" },
    },
    {
      id: "contraindications",
      parentId: "techniques",
      ring: 2,
      label: THREADS_INSIGHT_META.contraindications.label,
      detail: "",
      action: { kind: "insight", insightKind: "contraindications" },
    },
    {
      id: "outcome-measures",
      parentId: "implications",
      ring: 2,
      label: THREADS_INSIGHT_META["outcome-measures"].label,
      detail: "",
      action: { kind: "insight", insightKind: "outcome-measures" },
    },
    {
      id: "case-studies",
      parentId: "research",
      ring: 2,
      label: THREADS_INSIGHT_META["case-studies"].label,
      detail: "",
      action: { kind: "insight", insightKind: "case-studies" },
    },
    {
      id: "nexus",
      parentId: "patient-education",
      ring: 3,
      label: "Nexus Discussions",
      detail: nexusMatch
        ? `${nexusMatch.authorName} in Nexus: "${nexusMatch.snippet}"`
        : "No Nexus discussions on this topic yet — be the first to start one.",
      action: { kind: "navigate", label: nexusMatch ? "View in Nexus" : "Start a discussion", href: "/nexus" },
    },
    {
      id: "clips",
      parentId: "case-studies",
      ring: 3,
      label: "Related Clips",
      detail: clipMatch ? `Technique video: "${clipMatch.title}" (${clipMatch.source}).` : "No technique videos for this specialty yet.",
      action: clipMatch
        ? { kind: "external", label: "Watch", url: clipMatch.url }
        : { kind: "navigate", label: "Browse Clips", href: "/clips" },
    },
    {
      id: "agent",
      parentId: "outcome-measures",
      ring: 3,
      label: "Ask Limbic Agent",
      detail: "Go deeper with open-ended clinical reasoning tailored to this article.",
      action: { kind: "agent-handoff", topic: article.title },
    },
  ];

  return nodes;
}
