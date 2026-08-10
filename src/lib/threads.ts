import "server-only";
import { prisma } from "@/lib/db";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { SPECIALTY_META, TYPE_META } from "@/lib/meta";
import type { ThreadsNodeData } from "@/lib/threads-graph";
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

/** One of Limbic Threads' per-article-type nodes (see NODE_SPECS_BY_TYPE below) — most are
 *  a plain "go look at a filtered view" link, so this mainly needs to describe how to
 *  filter and what to say about it, not any real content. The one exception is the
 *  Clinical Implications node (see CLINICAL_IMPLICATIONS_ID) — its filterType/topicQuery
 *  are unused since it's rendered as an "insight" action instead (see buildThreadsWeb). */
interface FeedNodeSpec {
  id: string;
  label: string;
  /** Narrows the linked Search results to this ArticleType, alongside the article's own
   *  specialty — omitted when this node's topic isn't itself a distinct article type. */
  filterType?: ArticleType;
  /** Free-text term added to the Search query as this node's "topic," alongside specialty
   *  and (if set) filterType — omitted when specialty/type alone is the clearest filter.
   *  "relevant-techniques" leaves this unset here and fills it in per-article instead (see
   *  buildThreadsWeb), since its topic is the article's own tag, not a fixed term. */
  topicQuery?: string;
  /** Static one-line description shown as the node's detail text when there's no
   *  real per-article data to summarize instead (see countDetail below). */
  blurb: string;
}

const NEXUS_DISCUSSION_ID = "nexus-discussion";
/** Every article type's web carries exactly one of these — Limbic Agent's AI-generated
 *  take on what the article means for day-to-day practice. Visible to every viewer (PRO
 *  or not); clicking it is PRO-gated once real generation is live, same as any other
 *  "insight" node (see components/ThreadsWeb.tsx). Currently shows "Coming Soon" for
 *  everyone regardless of PRO status, since generation itself is still unfunded
 *  (THREADS_INSIGHTS_ENABLED = false in ThreadsWeb.tsx) — nothing here needs to change
 *  when that flips on, the gating logic already handles it. */
const CLINICAL_IMPLICATIONS_ID = "clinical-implications";
/** The universal action node appended after every type's contextual nodes (see
 *  buildThreadsWeb) — not part of NODE_SPECS_BY_TYPE since it never varies by type. */
const PROMPT_AGENT_ID = "prompt-agent";

/** Contextually relevant node set per article type (see lib/types.ts ArticleType) — the
 *  "Explore Connections" web research gets 4 nodes, every other type gets 5: its own 4
 *  contextual nodes plus the universal Clinical Implications insight node. A "Nexus
 *  Discussion" entry (spec.id === NEXUS_DISCUSSION_ID) and the Clinical Implications entry
 *  (spec.id === CLINICAL_IMPLICATIONS_ID) are both handled specially in buildThreadsWeb
 *  below rather than through the generic Search-link path. */
const NODE_SPECS_BY_TYPE: Record<ArticleType, FeedNodeSpec[]> = {
  research: [
    {
      id: "connected-research",
      label: "Connected Research",
      filterType: "research",
      blurb: "Other research studies related to this article's specialty.",
    },
    {
      id: CLINICAL_IMPLICATIONS_ID,
      label: "Clinical Implications",
      blurb: "What this kind of finding tends to mean for day-to-day clinical practice.",
    },
    {
      id: "related-guidelines",
      label: "Related Guidelines",
      filterType: "guideline",
      blurb: "Clinical practice guidelines related to this article's specialty.",
    },
    {
      id: "relevant-techniques",
      label: "Relevant Techniques",
      blurb: "Techniques and interventions mentioned in this article.",
    },
  ],
  guideline: [
    {
      id: "related-research",
      label: "Related Research",
      filterType: "research",
      blurb: "Research studies related to this guideline's specialty.",
    },
    {
      id: "clinical-application",
      label: "Clinical Application",
      topicQuery: "clinical application",
      blurb: "How this guideline tends to translate into day-to-day practice.",
    },
    {
      id: "patient-education",
      label: "Patient Education",
      topicQuery: "patient education",
      blurb: "Material for explaining this guideline's recommendations to patients.",
    },
    { id: NEXUS_DISCUSSION_ID, label: "Nexus Discussion", blurb: "" },
    {
      id: CLINICAL_IMPLICATIONS_ID,
      label: "Clinical Implications",
      blurb: "What this guideline tends to mean for day-to-day clinical practice.",
    },
  ],
  industry: [
    {
      id: "related-policy",
      label: "Related Policy",
      filterType: "industry",
      topicQuery: "policy",
      blurb: "Other industry and policy news related to this article's specialty.",
    },
    {
      id: "clinical-impact",
      label: "Clinical Impact",
      topicQuery: "clinical impact",
      blurb: "How this kind of industry or policy change tends to affect clinical practice.",
    },
    { id: NEXUS_DISCUSSION_ID, label: "Nexus Discussion", blurb: "" },
    {
      id: "further-reading",
      label: "Further Reading",
      blurb: "More coverage related to this article's specialty.",
    },
    {
      id: CLINICAL_IMPLICATIONS_ID,
      label: "Clinical Implications",
      blurb: "What this news tends to mean for day-to-day clinical practice.",
    },
  ],
  product: [
    {
      id: "clinical-evidence",
      label: "Clinical Evidence",
      filterType: "research",
      blurb: "Research studies related to this product's specialty.",
    },
    {
      id: "similar-devices",
      label: "Similar Devices",
      filterType: "product",
      blurb: "Other equipment and product news related to this article's specialty.",
    },
    {
      id: "fda-information",
      label: "FDA Information",
      topicQuery: "FDA",
      blurb: "Regulatory coverage related to this product.",
    },
    { id: NEXUS_DISCUSSION_ID, label: "Nexus Discussion", blurb: "" },
    {
      id: CLINICAL_IMPLICATIONS_ID,
      label: "Clinical Implications",
      blurb: "What this product tends to mean for day-to-day clinical practice.",
    },
  ],
  ce: [
    {
      id: "related-topics",
      label: "Related Topics",
      blurb: "Other content related to this course's specialty.",
    },
    {
      id: "prerequisites",
      label: "Prerequisites",
      topicQuery: "prerequisites",
      blurb: "Background reading worth covering before this course.",
    },
    {
      id: "related-guidelines-ce",
      label: "Related Guidelines",
      filterType: "guideline",
      blurb: "Clinical practice guidelines related to this course's specialty.",
    },
    { id: NEXUS_DISCUSSION_ID, label: "Nexus Discussion", blurb: "" },
    {
      id: CLINICAL_IMPLICATIONS_ID,
      label: "Clinical Implications",
      blurb: "What this course tends to mean for day-to-day clinical practice.",
    },
  ],
};

/** Nouns read naturally in "N related ___ found" for the two types with a real single-word
 *  count phrase (see countDetail) — every other filterType falls back to "articles". */
const COUNT_NOUNS: Partial<Record<ArticleType, { singular: string; plural: string }>> = {
  research: { singular: "study", plural: "studies" },
  guideline: { singular: "guideline", plural: "guidelines" },
};

/** Real-data detail text for a node backed by an actual ArticleType filter — same
 *  specialty-or-tag relevance pool as the rest of Threads, just no longer linking straight
 *  to the top match (see searchHref) now that every node consistently opens a filtered
 *  Search view instead of jumping to one specific article. */
function countDetail(article: Article, pool: Article[], type: ArticleType): string {
  const matches = matchesOfType(article, pool, type);
  const noun = COUNT_NOUNS[type] ?? { singular: "article", plural: "articles" };
  if (matches.length === 0) {
    return `No related ${noun.plural} found yet — tap to browse ${SPECIALTY_META[article.specialty]}.`;
  }
  return `${matches.length} related ${matches.length === 1 ? noun.singular : noun.plural} found, most recently "${truncate(matches[0].title, 60)}".`;
}

/** Every non-Nexus node links to Search filtered by the article's specialty and, where
 *  the node has one, an ArticleType and/or a free-text topic term — never to one specific
 *  article, so every node in this new per-type web behaves the same way. */
function searchHref(article: Article, spec: FeedNodeSpec): string {
  const params = new URLSearchParams();
  if (spec.filterType) params.set("type", spec.filterType);
  params.set("specialty", article.specialty);
  if (spec.topicQuery) params.set("q", spec.topicQuery);
  return `/search?${params.toString()}`;
}

/** Nexus Discussion nodes link straight to the Nexus feed filtered by this article's own
 *  tags, rather than through Search — a different destination entirely, not just a
 *  different filter combination. */
function nexusHref(article: Article): string {
  const tags = article.tags.length > 0 ? article.tags : [SPECIALTY_META[article.specialty]];
  return `/nexus?tags=${encodeURIComponent(tags.join(","))}`;
}

/** Assembles Limbic Threads' "Explore Connections" web for one article: a center node for
 *  the article itself, plus the nodes contextually relevant to its ArticleType (see
 *  NODE_SPECS_BY_TYPE). Every node is a plain link to a filtered view (Search, or the
 *  Nexus feed) except Clinical Implications, which is an "insight" node — Limbic Agent
 *  generates its answer on click, PRO-gated, currently showing "Coming Soon" for everyone
 *  since generation is unfunded (see components/ThreadsWeb.tsx). Nothing here fabricates
 *  clinical content ahead of time either way. `articlePool` is the caller's already-fetched
 *  getArticles() result, passed in rather than fetched again here. `isAdmin` gates the
 *  Nexus Discussion node's real post preview — Nexus itself is coming-soon for everyone
 *  else (see app/(app)/nexus/layout.tsx), so a non-admin must never see a real author name
 *  or post snippet here, only the generic "be the first to start one" fallback. */
export async function buildThreadsWeb(article: Article, articlePool: Article[], isAdmin: boolean): Promise<ThreadsNodeData[]> {
  const specs = NODE_SPECS_BY_TYPE[article.type].map((spec) =>
    spec.id === "relevant-techniques" ? { ...spec, topicQuery: techniqueTags(article)[0] } : spec
  );
  const hasNexusNode = specs.some((spec) => spec.id === NEXUS_DISCUSSION_ID);
  const nexusMatch = hasNexusNode && isAdmin ? await findNexusMatch(article) : null;

  const nodes: ThreadsNodeData[] = [
    {
      id: "center",
      parentId: null,
      ring: 0,
      label: truncate(article.title, 42),
      detail: article.summary,
      action: { kind: "navigate", label: "Read the article", href: `/article/${article.id}` },
    },
    ...specs.map((spec): ThreadsNodeData => {
      if (spec.id === NEXUS_DISCUSSION_ID) {
        return {
          id: spec.id,
          parentId: "center",
          ring: 1,
          label: spec.label,
          detail: nexusMatch
            ? `${nexusMatch.authorName} in Nexus: "${nexusMatch.snippet}"`
            : "No Nexus discussions on this topic yet — be the first to start one.",
          action: {
            kind: "navigate",
            label: nexusMatch ? "View in Nexus" : "Start a discussion",
            href: nexusHref(article),
          },
        };
      }
      if (spec.id === CLINICAL_IMPLICATIONS_ID) {
        return {
          id: spec.id,
          parentId: "center",
          ring: 1,
          label: spec.label,
          // Filled in lazily on click for a PRO viewer once generation is enabled (see
          // generateThreadsInsightAction) — empty here, same as every other insight node.
          detail: "",
          action: { kind: "insight", insightKind: "implications" },
        };
      }
      return {
        id: spec.id,
        parentId: "center",
        ring: 1,
        label: spec.label,
        detail: spec.filterType ? countDetail(article, articlePool, spec.filterType) : spec.blurb,
        action: { kind: "navigate", label: "View in Search", href: searchHref(article, spec) },
      };
    }),
    // Every article gets exactly one of these, regardless of type — a visually distinct
    // "take this to Limbic Agent" action rather than another piece of connected content
    // (see components/ThreadsWeb.tsx's variant="action" styling and
    // components/AgentGraph.tsx's bottom-center/amber/pulse rendering for it). PRO-gated
    // on click, same mechanism as the Clinical Implications insight node above.
    {
      id: PROMPT_AGENT_ID,
      parentId: "center",
      ring: 1,
      label: "Prompt Agent",
      detail: "Go deeper with open-ended clinical reasoning tailored to this article.",
      action: { kind: "agent-handoff", topic: article.title },
    },
  ];

  return nodes;
}
