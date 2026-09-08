/**
 * The examination guides served whole from content/playbooks/.
 *
 * These are complete HTML documents — their own stylesheet, scripts and dark-mode palette —
 * rather than content in lib/playbooks/ rendered by a React page. Every clinical value in
 * them is individually sourced, and each page carries the provenance machinery that says
 * which values are measured, which are only convention, which the studies argue about, and
 * which could not be traced to anything at all. Re-expressing that in another content model
 * would mean re-typing several hundred sourced figures, and a paraphrase that drifts by one
 * decimal is indistinguishable from the real thing until a student quotes it in an exam. So
 * the bytes are the deliverable.
 *
 * This registry is the single source of truth for which guides exist: the route handler
 * allowlists from it, and the hub and the resources tab build their cards from it. Adding a
 * guide is one entry here plus the file.
 *
 * The counts below are asserted against the rendered document in e2e/playbooks.spec.ts, so a
 * card cannot quietly claim a reference count the page does not have.
 */
export type Guide = {
  /** URL segment under /student/guides, and the basename of the file in content/playbooks. */
  slug: string;
  name: string;
  /** The hub card's blurb — room for what makes this guide worth opening. */
  description: string;
  /** The Boards study-guide card's blurb, which has less room. */
  short: string;
  /** Sections in the document, checklist items that can be ticked, reference entries. */
  sections: number;
  items: number;
  references: number;
};

export const GUIDES: Guide[] = [
  {
    slug: "shoulder-examination",
    name: "Shoulder Examination",
    description:
      "A full shoulder screen in the order you’d perform it. Every value says where it came from — what the literature measured, what is only convention, and what the studies still argue about — with 82 sources linked, a taught lane for what your own program says, and a practice plan built from what you miss.",
    short:
      "A full shoulder screen in the order you’d perform it, with every value marked as measured, convention or contested, and 82 sources linked.",
    sections: 13,
    items: 32,
    references: 82,
  },
  {
    slug: "hip-examination",
    name: "Hip Examination",
    description:
      "The hip screen in sequence, from the lumbar and SI clearing tests to the syndromes. Includes what the FADIR test’s sensitivity does and does not buy you, and why the capsular pattern fails as a diagnostic — 22 values are flagged as having no traceable source rather than filled in.",
    short:
      "The hip screen in sequence, with what FADIR’s sensitivity buys you, why the capsular pattern fails, and 22 values flagged as untraceable rather than filled in.",
    sections: 12,
    items: 12,
    references: 13,
  },
  {
    slug: "knee-examination",
    name: "Knee Examination",
    description:
      "The knee screen, built on the openly published guideline rather than around it. Covers why a test’s headline accuracy depends on who performed it and on whom, and why the Ottawa knee rule’s “high diagnostic performance” sits beside an AUC of 0.54.",
    short:
      "The knee screen built on the openly published guideline — including why a test’s headline accuracy depends on who performed it and on whom.",
    sections: 12,
    items: 12,
    references: 10,
  },
  {
    slug: "ankle-examination",
    name: "Ankle Examination",
    description:
      "The best-evidenced joint in the series — two graded guidelines carry 34 current recommendations between them — and the one with the worst honest prognosis: two in five people who seek care for a first sprain develop chronic instability. The special tests are recommended without any published accuracy, which the guide says rather than filling in.",
    short:
      "The best-evidenced joint here, and the worst honest prognosis: two in five first sprains that seek care become chronic instability.",
    sections: 12,
    items: 13,
    references: 6,
  },
  {
    slug: "joint-mobilization",
    name: "Joint Mobilization",
    description:
      "Not a region but a decision: whether to mobilise, where, how hard, and how you’d know it worked. Three of the conventions that decide how a mobilization is performed — the grading systems, packed positions, and the concave-convex rule — could not be traced to any reachable source. The one dose vocabulary that is defined has different outcomes at each level.",
    short:
      "Not a region but a decision. Three of the conventions behind how a mobilization is performed could not be traced to any reachable source.",
    sections: 12,
    items: 10,
    references: 18,
  },
];

export function guideHref(guide: Guide): string {
  return `/student/guides/${guide.slug}`;
}

export function isGuideSlug(slug: string): boolean {
  return GUIDES.some((guide) => guide.slug === slug);
}
