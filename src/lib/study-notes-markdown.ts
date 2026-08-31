/** Minimal renderer for the Visual Aids tab's free-text notes (see Syllabus.studyNotes in
 *  prisma/schema.prisma, components/student/StudyGuideManager.tsx). Supports exactly one bit
 *  of structure — a pipe-delimited table, one row per line, e.g.:
 *    | Term | Definition |
 *    | --- | --- |
 *    | ROM | Range of Motion |
 *  Everything else is a plain paragraph. Deliberately not full Markdown — "charts, tables,
 *  visuals" only asked for a way to lay out a quick reference table, not a whole markup
 *  language, and returning plain data (never raw HTML) means the caller can render it as JSX
 *  directly with no injection risk. */

export interface StudyNoteParagraph {
  type: "paragraph";
  lines: string[];
}

export interface StudyNoteTable {
  type: "table";
  header: string[];
  rows: string[][];
}

export type StudyNoteBlock = StudyNoteParagraph | StudyNoteTable;

function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.length > 1;
}

function isSeparatorLine(line: string): boolean {
  return /^\|?[\s:-]+\|[\s:|-]*$/.test(line.trim());
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

export function parseStudyNotes(content: string): StudyNoteBlock[] {
  const blocks: StudyNoteBlock[] = [];
  for (const chunk of content.split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;

    if (lines.length > 1 && lines.every(isTableLine)) {
      const header = parseTableRow(lines[0]);
      const bodyLines = isSeparatorLine(lines[1]) ? lines.slice(2) : lines.slice(1);
      const rows = bodyLines.map(parseTableRow);
      blocks.push({ type: "table", header, rows });
    } else {
      blocks.push({ type: "paragraph", lines });
    }
  }
  return blocks;
}
