/**
 * The taught lane's inventory of cells — what a reader can write a line under.
 *
 * A playbook prints what the literature measured and marks where that parts company with what
 * gets taught (the provenance tokens in lib/playbook-inline.ts). What *your* program teaches
 * is a third thing, and it is yours to state rather than ours to guess: the curriculum you
 * are examined on differs between schools, so the lane starts empty on every cell.
 *
 * The lane hangs off exactly the cells recall can blank, keyed by the same ids — a line
 * belongs to a cell, not to a position on the page, so re-ordering a table moves the line
 * with it. This list exists so the reader can copy their lines out with the guide's own text
 * beside them; the page itself doesn't need it, since each cell already knows its own id.
 * Walking the block list here mirrors playbookRecallGroups in lib/playbook-recall.ts, and the
 * two have to agree — a table's group rows take up a row index without being maskable, so
 * they are skipped rather than filtered out.
 */

import { playbookChecklistRows, type Playbook, type PlaybookCell } from "@/lib/playbook-content";
import { RECALL_CHECKLIST_COLUMNS, RECALL_NUMBERS_COLUMNS, recallCellId } from "@/lib/playbook-recall";

export interface PlaybookTaughtCell {
  /** Matches recallCellId — what a saved line is stored under. */
  id: string;
  /** Section title, for grouping an export. */
  section: string;
  /** What names the row this cell sits in. */
  row: string;
  /** Which column of that row — "Finding / norm", etc. */
  column: string;
  /** The guide's own text for the cell, so a copied line has its context beside it. */
  text: string;
}

function cellText(cell: PlaybookCell): string {
  return typeof cell === "string" ? cell : cell.text;
}

export function playbookTaughtCells(playbook: Playbook): PlaybookTaughtCell[] {
  const cells: PlaybookTaughtCell[] = [];
  for (const section of playbook.sections) {
    const push = (id: string, row: string, column: string, text: string) =>
      cells.push({ id, section: section.title, row, column, text });

    section.blocks.forEach((block, i) => {
      if (block.kind === "checklist") {
        const groupId = `${section.id}:check`;
        playbookChecklistRows(block.items).forEach(({ row }, r) => {
          [row.name, row.how, row.finding].forEach((text, c) => {
            push(recallCellId(groupId, c, r), row.name, RECALL_CHECKLIST_COLUMNS[c], text);
          });
        });
      } else if (block.kind === "table") {
        const groupId = `${section.id}:t${i}`;
        block.rows.forEach((row, r) => {
          if (!Array.isArray(row)) return;
          row.forEach((cell, c) => {
            push(recallCellId(groupId, c, r), cellText(row[0]), block.columns[c] ?? "", cellText(cell));
          });
        });
      } else if (block.kind === "numbers") {
        const groupId = `${section.id}:g${i}`;
        block.cells.forEach((cell, r) => {
          push(recallCellId(groupId, 0, r), cell.value, RECALL_NUMBERS_COLUMNS[0], cell.value);
          push(recallCellId(groupId, 1, r), cell.value, RECALL_NUMBERS_COLUMNS[1], cell.label);
        });
      }
    });
  }
  return cells;
}
