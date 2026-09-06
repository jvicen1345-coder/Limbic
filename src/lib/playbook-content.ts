/**
 * Limbic Playbooks — long-form regional examination references (see
 * app/(app)/student/playbooks, components/playbook/PlaybookPage.tsx). One playbook is a
 * whole examination in the order it's performed: the sequence as a check-off list, the
 * normative numbers it's measured against, the tables that route a finding to a tissue,
 * and the treatment that tissue points to.
 *
 * A playbook is data, not a page — every section is a list of typed blocks and the
 * template renders them, so a second region (knee, lumbar, cervical) is a new file under
 * lib/playbooks/ plus its figures, with no new components. Diagrams are the one thing
 * that can't be data: each `figure` block names a figure id that resolves to a drawing in
 * components/playbook/PlaybookFigures.tsx.
 *
 * Prose fields take the inline markup described in lib/playbook-inline.ts (**bold**,
 * *emphasis*, [[pill:h|label]]) rather than HTML, so nothing here is ever rendered with
 * dangerouslySetInnerHTML.
 *
 * Clinical content is hand-curated from standard PT curriculum material — the same
 * well-established examination sequence, normative values and test statistics a
 * musculoskeletal textbook covers, not invented claims. Each playbook carries a `footer`
 * saying what its numbers are sourced from and what a reader should verify.
 */

import { SHOULDER_PLAYBOOK } from "@/lib/playbooks/shoulder";

/** A cell's presentation: `name` is the row's subject (bolded first column), `num` renders
 *  in tabular-figure monospace so measurements line up down the column, `tissue` is the
 *  wider "what this actually tests" column in the special-tests table. */
export type PlaybookCellVariant = "name" | "num" | "tissue";

export type PlaybookCell = string | { text: string; variant: PlaybookCellVariant };

/** A full-width subheading inside a table body — "Biceps and labrum", etc. */
export interface PlaybookTableGroup {
  group: string;
}

export type PlaybookTableRow = PlaybookCell[] | PlaybookTableGroup;

export interface PlaybookChecklistItem {
  /** Stable across edits — it keys the reader's saved check-off state, so renumbering the
   *  list must not silently re-map what they've already ticked. */
  id: string;
  name: string;
  /** How the item is performed. */
  how: string;
  /** The number or observation that turns the test into information. */
  finding: string;
}

export interface PlaybookCard {
  tone: "h" | "m" | "l";
  title: string;
  /** The pill beside the title — the mobilization grade this level implies. */
  badge: string;
  /** The end feel that puts a patient in this column. */
  subtitle: string;
  points: string[];
}

export type PlaybookBlock =
  | { kind: "heading"; text: string }
  | { kind: "lede"; text: string }
  /** Small muted print — a sourcing note under a table, not body copy. */
  | { kind: "footnote"; text: string }
  | { kind: "checklist"; items: PlaybookChecklistItem[] }
  | { kind: "numbers"; cells: { value: string; label: string }[] }
  | { kind: "table"; columns: string[]; rows: PlaybookTableRow[] }
  | { kind: "callout"; tone: "note" | "warn"; lead?: string; body: string }
  | { kind: "figure"; figureId: string; title: string; caption: string }
  | { kind: "cards"; cards: PlaybookCard[] }
  | { kind: "drill"; items: { question: string; answer: string }[] };

export interface PlaybookSection {
  /** Anchor id and nav target. */
  id: string;
  /** Short label for the sticky section nav — the h2 is usually too long for it. */
  navLabel: string;
  title: string;
  /** Right-aligned aside on the section rule ("answer before you open"). */
  note?: string;
  blocks: PlaybookBlock[];
}

export interface Playbook {
  slug: string;
  /** Card title on the index, and the browser tab. */
  name: string;
  /** Masthead headline — allows a line break the card title shouldn't have. */
  title: string;
  eyebrow: string;
  /** One paragraph under the headline, and the index card's description. */
  summary: string;
  /** Masthead tallies — "28 exam items", "5 movement syndromes". */
  stamp: { value: string; label: string }[];
  sections: PlaybookSection[];
  /** Sourcing note at the foot of the page. */
  footer: string;
}

export const PLAYBOOKS: Playbook[] = [SHOULDER_PLAYBOOK];

export function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((playbook) => playbook.slug === slug);
}

/** The checklist block of a playbook, if it has one — the index card shows its length and
 *  the page needs it to size the progress bar. */
export function playbookChecklist(playbook: Playbook): PlaybookChecklistItem[] {
  for (const section of playbook.sections) {
    for (const block of section.blocks) {
      if (block.kind === "checklist") return block.items;
    }
  }
  return [];
}
