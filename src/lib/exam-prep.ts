/**
 * Exam Prep guides — study guides built for exams and practicals, as opposed to the
 * playbooks (lib/guides.ts), which walk through a real evaluation in the order it is
 * performed. The two are paired: each exam prep guide names the playbook that covers the
 * same ground, and links to it from its masthead.
 *
 * Like the served playbooks, each guide is a complete HTML document served whole from
 * content/exam-prep by a route handler (app/(app)/student/exam-prep/[guide]/route.ts), with
 * its own stylesheet, scripts and storage keys. Each one also ships two companion pages —
 * a games page and a diagram atlas — served from the same folder as
 * `<slug>-arcade.html` and `<slug>-atlas.html` and reached at `<href>/arcade` and
 * `<href>/atlas`. The documents link to those absolute paths, so nothing here rewrites them.
 *
 * Access follows the playbooks exactly: the paid LimbicStudent tier, or this slug being the
 * reader's one free pick (hasPlaybookAccess in lib/session.ts). The free-pick action accepts
 * these slugs too (app/actions/playbooks.ts), so slugs here must never collide with a
 * playbook or guide slug.
 */

export type ExamPrepGuide = {
  /** URL segment under /student/exam-prep, and the basename of the files in content/exam-prep. */
  slug: string;
  name: string;
  description: string;
  topics: number;
  keyPoints: number;
  questions: number;
  /** Slug of the served playbook guide that covers the same ground (lib/guides.ts). */
  playbook?: string;
};

export const EXAM_PREP_GUIDES: ExamPrepGuide[] = [
  {
    slug: "neuro-exam-prep",
    name: "Neurologic Examination & Functional Training",
    description:
      "Clinical reasoning, the subjective exam, movement analysis, cognition and cranial nerves, tone and motor control, speech and swallowing, therapeutic exercise and PNF, bed mobility and transfers, the hemiplegic upper extremity, and documentation. Key points with spaced review, practice quiz, flashcards, cases, a timed mock quiz, five study games and a diagram atlas.",
    topics: 9,
    keyPoints: 77,
    questions: 127,
    playbook: "neuro-examination",
  },
];

/** The companion pages each guide ships with, beside the main document. */
export const EXAM_PREP_PARTS = ["arcade", "atlas"] as const;
export type ExamPrepPart = (typeof EXAM_PREP_PARTS)[number];

export function examPrepHref(guide: Pick<ExamPrepGuide, "slug">): string {
  return `/student/exam-prep/${guide.slug}`;
}

/** Whether this slug is in the registry. The route reaches the filesystem with it, so this is
 *  the allowlist that keeps an arbitrary segment away from readFile. */
export function isKnownExamPrep(slug: string): boolean {
  return EXAM_PREP_GUIDES.some((guide) => guide.slug === slug);
}

export function isExamPrepPart(part: string): part is ExamPrepPart {
  return (EXAM_PREP_PARTS as readonly string[]).includes(part);
}

/** The file that holds a guide, or one of its companion pages, under content/exam-prep. */
export function examPrepFile(slug: string, part?: ExamPrepPart): string {
  return part ? `${slug}-${part}.html` : `${slug}.html`;
}
