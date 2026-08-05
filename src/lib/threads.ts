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

/** One of Limbic Threads' 4 per-article-type nodes (see NODE_SPECS_BY_TYPE below) — every
 *  node is a plain "go look at a filtered view" link, not a synthesized/AI answer, so this
 *  only needs to describe how to filter and what to say about it, not any real content. */
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

/** Contextually relevant node set per article type (see lib/types.ts ArticleType) — each
 *  array is exactly the 4 nodes that type's "Explore Connections" web should show, in
 *  order. A "Nexus Discussion" entry (spec.id === NEXUS_DISCUSSION_ID) is handled
 *  specially in buildThreadsWeb below rather than through the generic Search-link path. */
const NODE_SPECS_BY_TYPE: Record<ArticleType, FeedNodeSpec[]> = {
  research: [
    {
      id: "connected-research",
      label: "Connected Research",
      filterType: "research",
      blurb: "Other research studies related to this article's specialty.",
    },
    {
      id: "clinical-implications",
      label: "Clinical Implications",
      topicQuery: "clinical implications",
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
 *  the article itself, plus exactly the 4 nodes contextually relevant to its ArticleType
 *  (see NODE_SPECS_BY_TYPE). Every node — Nexus Discussion included — is a plain link to a
 *  filtered view (Search, or the Nexus feed) rather than an AI-generated answer, so this
 *  never fabricates clinical content. `articlePool` is the caller's already-fetched
 *  getArticles() result, passed in rather than fetched again here. */
export async function buildThreadsWeb(article: Article, articlePool: Article[]): Promise<ThreadsNodeData[]> {
  const specs = NODE_SPECS_BY_TYPE[article.type].map((spec) =>
    spec.id === "relevant-techniques" ? { ...spec, topicQuery: techniqueTags(article)[0] } : spec
  );
  const hasNexusNode = specs.some((spec) => spec.id === NEXUS_DISCUSSION_ID);
  const nexusMatch = hasNexusNode ? await findNexusMatch(article) : null;

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
      return {
        id: spec.id,
        parentId: "center",
        ring: 1,
        label: spec.label,
        detail: spec.filterType ? countDetail(article, articlePool, spec.filterType) : spec.blurb,
        action: { kind: "navigate", label: "View in Search", href: searchHref(article, spec) },
      };
    }),
  ];

  return nodes;
}
