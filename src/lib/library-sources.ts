import { GUIDES, guideHref, guideIsReadable } from "@/lib/guides";
import { EXAM_PREP_GUIDES, examPrepHref } from "@/lib/exam-prep";
import { EXAM_PREP_PROFILE, PLAYBOOK_PROFILE, type ExtractionProfile } from "@/lib/library-passages";

/**
 * Every document library search covers, from both pools, in one list.
 *
 * The two pools are deliberately kept separate everywhere else — a playbook (lib/guides.ts)
 * walks a real evaluation in the order it is performed, an Exam Prep guide (lib/exam-prep.ts)
 * is built for revising before a practical — and a reader looking for a fact does not care
 * which one holds it. So search spans both, and every result says which pool it came from
 * rather than blurring them together.
 *
 * Entitlement needs no special handling here: both pools gate on `hasPlaybookAccess`, and
 * their slugs share the single free pick (see chooseFreePlaybookAction in
 * app/actions/playbooks.ts), which lib/exam-prep.ts states as the reason slugs may never
 * collide across the two. That shared slug space is what lets the entitlement filter in
 * lib/library-search.ts stay a single function keyed on a slug.
 *
 * Free of `server-only` so the search page and node:test can both read the list; the
 * filesystem read that uses `dir` lives in lib/library-index.ts.
 */

/** Which pool a document belongs to. Shown on every result, because "Knee Examination" and
 *  "Cervical Spine" are different kinds of thing and a student choosing between them should
 *  not have to know the names to tell. */
export type LibraryPool = "playbook" | "study-guide";

export const POOL_LABEL: Record<LibraryPool, string> = {
  playbook: "Playbook",
  "study-guide": "Study guide",
};

export interface LibrarySource {
  slug: string;
  name: string;
  pool: LibraryPool;
  /** Directory under content/ holding `<slug>.html`. */
  dir: string;
  /** Where a result links, before the section anchor is appended. */
  href: string;
  profile: ExtractionProfile;
}

/**
 * The documents to index, for a reader with or without admin.
 *
 * An unpublished playbook is excluded for an ordinary reader exactly as its route excludes
 * it, so search cannot become the thing that reveals one. No guide carries that flag today;
 * this keeps search honest when the next one is being written. Exam Prep has no equivalent
 * flag — every guide in that registry is published.
 *
 * The `-arcade` and `-atlas` companion pages each Exam Prep guide ships are **not** indexed.
 * They carry no `<section>`, no prose and no headings — one is five study games and the other
 * a diagram atlas, and both are interactive rather than readable. Extracting them yields zero
 * passages, so indexing them would add filesystem reads for nothing; a reader who wants them
 * reaches them from the guide they belong to.
 */
export function librarySources({ admin }: { admin: boolean }): LibrarySource[] {
  const playbooks: LibrarySource[] = GUIDES.filter((guide) => guideIsReadable(guide, admin)).map((guide) => ({
    slug: guide.slug,
    name: guide.name,
    pool: "playbook",
    dir: "playbooks",
    href: guideHref(guide),
    profile: PLAYBOOK_PROFILE,
  }));

  const studyGuides: LibrarySource[] = EXAM_PREP_GUIDES.map((guide) => ({
    slug: guide.slug,
    name: guide.name,
    pool: "study-guide",
    dir: "exam-prep",
    href: examPrepHref(guide),
    profile: EXAM_PREP_PROFILE,
  }));

  return [...playbooks, ...studyGuides];
}

/** What the search surface tells the reader it is searching, so the scope is stated rather
 *  than inferred from whatever happens to come back. */
export function libraryScope({ admin }: { admin: boolean }): { playbooks: number; studyGuides: number } {
  const sources = librarySources({ admin });
  return {
    playbooks: sources.filter((source) => source.pool === "playbook").length,
    studyGuides: sources.filter((source) => source.pool === "study-guide").length,
  };
}
