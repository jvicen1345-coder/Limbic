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
 * Every playbook is written against the same brief — docs/playbook-authoring.md holds it
 * verbatim, along with which parts of it the template already answers (the numbered
 * sections, the sticky nav, the saved check-off state) and which are the author's to get
 * right (the finding column, the named mechanism, the "what fakes a result" column).
 *
 * Clinical content is hand-curated from standard PT curriculum material — the same
 * well-established examination sequence, normative values and test statistics a
 * musculoskeletal textbook covers, not invented claims. Each playbook carries a `footer`
 * saying what its numbers are sourced from and what a reader should verify.
 */

import { HIP_PLAYBOOK } from "@/lib/playbooks/hip";
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

/** One line of the checklist table — an item, or one of the further rows sharing its tick
 *  box. Prose fields take the inline markup in lib/playbook-inline.ts. */
export interface PlaybookChecklistRow {
  name: string;
  /** How the item is performed. */
  how: string;
  /** The number or observation that turns the test into information. */
  finding: string;
}

export interface PlaybookChecklistItem extends PlaybookChecklistRow {
  /** Stable across edits — it keys the reader's saved check-off state, so renumbering the
   *  list must not silently re-map what they've already ticked. */
  id: string;
  /** Further rows under the same tick box and number: two ways of testing one thing that you
   *  either do together or not at all, so one box covers both. */
  also?: PlaybookChecklistRow[];
}

/** The checklist flattened to the rows a reader actually sees — an item with two `also` rows
 *  is three lines under one tick box. Recall keys its cells on this index, and the narrow
 *  layout stacks these, so both need the same numbering the table renders. */
export function playbookChecklistRows(
  items: PlaybookChecklistItem[],
): { row: PlaybookChecklistRow; item: PlaybookChecklistItem; index: number; first: boolean }[] {
  const rows: { row: PlaybookChecklistRow; item: PlaybookChecklistItem; index: number; first: boolean }[] = [];
  items.forEach((item, index) => {
    rows.push({ row: item, item, index, first: true });
    (item.also ?? []).forEach((row) => rows.push({ row, item, index, first: false }));
  });
  return rows;
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

/** One row of a stats key — the abbreviation, what it stands for, and what it means in
 *  practice. */
export interface PlaybookStatKeyEntry {
  abbr: string;
  term: string;
  body: string;
}

/** A worked case: a scenario, then the answer broken into the headings a reasoned answer
 *  has to hit — the arithmetic, the diagnosis, the irritability, what you do first. Kept
 *  separate from `drill` because a drill answer is one paragraph and this is a structure. */
export interface PlaybookCase {
  scenario: string;
  lines: { label: string; body: string }[];
}

export type PlaybookBlock =
  | { kind: "heading"; text: string }
  | { kind: "lede"; text: string }
  /** Small muted print — a sourcing note under a table, not body copy. */
  | { kind: "footnote"; text: string }
  | { kind: "checklist"; items: PlaybookChecklistItem[] }
  | { kind: "numbers"; cells: { value: string; label: string }[] }
  /** `widths` fixes the column layout — CSS lengths or percentages, one per column. Without
   *  it the browser sizes columns from their content, which is right for most tables and
   *  wrong for the ones where a short column would otherwise be squeezed to nothing. */
  | { kind: "table"; columns: string[]; rows: PlaybookTableRow[]; widths?: string[] }
  | { kind: "callout"; tone: "note" | "warn"; lead?: string; body: string }
  | { kind: "figure"; figureId: string; title: string; caption: string }
  | { kind: "cards"; cards: PlaybookCard[] }
  | { kind: "drill"; items: { question: string; answer: string }[] }
  /** A glossary of the statistics a section's tables quote — Sn, Sp, +LR, −LR — so a
   *  reader can weigh a number instead of just reading it. */
  | { kind: "statkey"; entries: PlaybookStatKeyEntry[]; note?: string }
  | { kind: "cases"; items: PlaybookCase[] };

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

export const PLAYBOOKS: Playbook[] = [SHOULDER_PLAYBOOK, HIP_PLAYBOOK];

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
