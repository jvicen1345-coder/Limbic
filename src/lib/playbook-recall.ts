/**
 * Recall mode's group list, derived from a playbook's own data (see lib/playbook-content.ts).
 *
 * Recall lets a reader blank the answer columns and quiz themselves. Every maskable thing on
 * the page belongs to exactly one *group* — a table, the checklist, a numbers grid, or a
 * figure's labels — and each group offers one chip per column so the reader picks what
 * disappears. The groups are computed here rather than discovered from the DOM: the page is
 * rendered from this data in the first place, so the block list already knows what is on it,
 * and an id derived from the section and block index is stable across renders, which is what
 * lets the reader's choices survive a reload.
 *
 * A cell's id is `<group>|c<column>|r<row>`; it keys both what is currently hidden and what
 * the reader marked as missed.
 */

import type { Playbook } from "@/lib/playbook-content";

export type RecallGroupKind = "checklist" | "table" | "numbers" | "figure";

export interface RecallGroup {
  id: string;
  sectionId: string;
  kind: RecallGroupKind;
  /** One per maskable column, in render order — the chip labels. */
  labels: string[];
}

/** The checklist's own header, minus the two columns there is nothing to recall from: the
 *  tick box and the row number. `Item` stays maskable — naming the test from its method and
 *  finding is a harder and more useful direction than the reverse. */
export const RECALL_CHECKLIST_COLUMNS = ["Item", "How it's performed", "Finding / norm"];

/** A numbers grid is quizzable in both directions: hide the figure and recall it from the
 *  label, or hide the label and say what the figure is. */
export const RECALL_NUMBERS_COLUMNS = ["Value", "What it is"];

export function playbookRecallGroups(playbook: Playbook): RecallGroup[] {
  const groups: RecallGroup[] = [];
  for (const section of playbook.sections) {
    section.blocks.forEach((block, i) => {
      if (block.kind === "checklist") {
        groups.push({ id: `${section.id}:check`, sectionId: section.id, kind: "checklist", labels: RECALL_CHECKLIST_COLUMNS });
      } else if (block.kind === "table") {
        groups.push({ id: `${section.id}:t${i}`, sectionId: section.id, kind: "table", labels: block.columns });
      } else if (block.kind === "numbers") {
        groups.push({ id: `${section.id}:g${i}`, sectionId: section.id, kind: "numbers", labels: RECALL_NUMBERS_COLUMNS });
      } else if (block.kind === "figure") {
        groups.push({ id: `${section.id}:f${i}`, sectionId: section.id, kind: "figure", labels: ["Labels"] });
      }
    });
  }
  return groups;
}

export function recallColumnId(groupId: string, column: number): string {
  return `${groupId}|c${column}`;
}

export function recallCellId(groupId: string, column: number, row: number): string {
  return `${groupId}|c${column}|r${row}`;
}

/** A blur hides a paragraph but not a short answer — "60°" and "Firm" keep their shape
 *  through it. Anything this short is blanked out with a solid panel instead. */
export const RECALL_SOLID_MAX_CHARS = 16;
