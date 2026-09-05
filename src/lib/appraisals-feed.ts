import "server-only";
import { prisma } from "@/lib/db";
import type { Article, Specialty } from "@/lib/types";
import {
  runAppraisalChecks,
  readMinsFor,
  SOURCE_ACCESS_LABELS,
  type AppraisalInput,
  type SourceAccess,
} from "@/lib/appraisal";

/**
 * Published appraisals, rendered as ordinary feed articles (see lib/appraisal.ts for what an
 * appraisal is and why it is entered rather than extracted).
 *
 * These are the one source in the feed that Limbic wrote itself, so two things are
 * deliberate. They carry `source: "Limbic Appraisal"` rather than the journal's name — the
 * byline has to say who is talking, and it is not the publisher. And they keep `live: false`
 * so lib/article-view.ts's Unpaywall lookup skips them: an appraisal is not a publication
 * with a free copy to find, even though the study it appraises might be, and that lookup is
 * for the study.
 *
 * The prose the appraiser wrote is followed by the deterministic findings and a provenance
 * note, both appended here as body paragraphs rather than rendered by a bespoke component.
 * That is a deliberately boring choice: `Article.body` already renders everywhere an article
 * can be read — the reading pane, a Threads swap, a saved snapshot — so the numbers and the
 * "how this was made" line travel with the piece instead of existing only on one screen.
 */

const APPRAISAL_ID_PREFIX = "appraisal-";

export function isAppraisalArticleId(id: string): boolean {
  return id.startsWith(APPRAISAL_ID_PREFIX);
}

/** The best link to the paper itself from whatever identifiers were entered. A DOI is
 *  preferred over a PMID and both over a raw URL, since a resolver survives a publisher
 *  reorganising its site and a pasted link often does not. */
export function studyLinkFor(input: AppraisalInput): string | undefined {
  if (input.doi.trim()) return `https://doi.org/${input.doi.trim().replace(/^https?:\/\/doi\.org\//i, "")}`;
  if (input.pmid.trim()) return `https://pubmed.ncbi.nlm.nih.gov/${input.pmid.trim()}/`;
  if (input.sourceUrl.trim()) return input.sourceUrl.trim();
  return undefined;
}

/** The findings paragraph. Every sentence in it came out of runAppraisalChecks(), so what a
 *  reader sees here cannot drift from the arithmetic — and cannot have been written by the
 *  drafting model, which is only ever shown these as settled results. */
function checksParagraph(input: AppraisalInput): string {
  const checks = runAppraisalChecks(input);
  const stated = checks.filter((c) => c.verdict !== "unknown");
  if (stated.length === 0) return "";
  return `What the numbers show — ${stated.map((c) => `${c.label}: ${c.detail}`).join(" ")}`;
}

/** How this appraisal was made, in one paragraph, on every published piece. A reader is
 *  entitled to know that nobody fed the paper to a model, and the appraiser is better off
 *  for having said so in public before anyone asks. */
function provenanceParagraph(input: AppraisalInput, authorName: string): string {
  const access = SOURCE_ACCESS_LABELS[input.sourceAccess].toLowerCase();
  const mcid = input.mcidSource.trim() ? ` The MCID used above is from ${input.mcidSource.trim()}.` : "";
  return (
    `How this was written — ${authorName} read the study (${access}) and entered its design, sample sizes, ` +
    `effect estimate and interval by hand. Those entered figures, and the notes above, are the only things a ` +
    `language model was given; it drafted the wording and none of the findings, and the paper itself was never ` +
    `uploaded anywhere. Every number here is checkable against the source, which is linked from this page.${mcid}`
  );
}

function toArticle(row: {
  id: string;
  publishedAt: Date | null;
  createdAt: Date;
  input: unknown;
  summary: string;
  body: unknown;
  specialty: string;
  tags: unknown;
  author: { name: string };
}): Article {
  const input = row.input as AppraisalInput;
  const prose = (row.body as string[]) ?? [];
  const tags = (row.tags as string[]) ?? [];

  const body = [...prose, checksParagraph(input), provenanceParagraph(input, row.author.name)].filter(Boolean);
  const published = row.publishedAt ?? row.createdAt;

  return {
    id: `${APPRAISAL_ID_PREFIX}${row.id}`,
    type: "research",
    specialty: row.specialty as Specialty,
    title: input.title,
    source: "Limbic Appraisal",
    sourceUrl: studyLinkFor(input),
    date: published.toISOString().slice(0, 10),
    readMins: readMinsFor(body),
    summary: row.summary,
    tags,
    body,
    // Not `live`: this is Limbic's own writing, not a fetched publication — see the note at
    // the top of this file for why that flag matters to the Unpaywall lookup.
    live: false,
    doi: input.doi.trim() || undefined,
  };
}

const SELECT = {
  id: true,
  publishedAt: true,
  createdAt: true,
  input: true,
  summary: true,
  body: true,
  specialty: true,
  tags: true,
  author: { select: { name: true } },
} as const;

/** Every published appraisal, newest first. Returns empty rather than throwing if the table
 *  is unreachable — an appraisal feed that fails should cost the home page its own section,
 *  not the PubMed and news articles beside it. */
export async function getPublishedAppraisals(): Promise<Article[]> {
  try {
    const rows = await prisma.studyAppraisal.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: SELECT,
    });
    return rows.map(toArticle);
  } catch (err) {
    console.error("Failed to load published appraisals:", err);
    return [];
  }
}

/** One appraisal by its `appraisal-<id>` article id. Drafts resolve to null — an unpublished
 *  appraisal is not readable by its author through the reader surface either, since the
 *  editor is where a draft is read. */
export async function getAppraisalArticleById(articleId: string): Promise<Article | null> {
  if (!isAppraisalArticleId(articleId)) return null;
  const id = articleId.slice(APPRAISAL_ID_PREFIX.length);
  try {
    const row = await prisma.studyAppraisal.findFirst({ where: { id, status: "published" }, select: SELECT });
    return row ? toArticle(row) : null;
  } catch (err) {
    console.error("Failed to load appraisal:", err);
    return null;
  }
}

/** Provenance roll-up for the admin index — how many published appraisals came from each
 *  kind of access. The answer to "which of these did you write from a subscription copy",
 *  available without opening a single row. */
export async function appraisalProvenanceCounts(): Promise<Record<SourceAccess, number>> {
  const counts: Record<SourceAccess, number> = { open_access: 0, full_text_licensed: 0, abstract_only: 0 };
  try {
    const rows = await prisma.studyAppraisal.groupBy({
      by: ["sourceAccess"],
      where: { status: "published" },
      _count: { _all: true },
    });
    for (const row of rows) {
      const key = row.sourceAccess as SourceAccess;
      if (key in counts) counts[key] = row._count._all;
    }
  } catch (err) {
    console.error("Failed to count appraisal provenance:", err);
  }
  return counts;
}
