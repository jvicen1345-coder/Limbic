import type { CrosswordClue, CrosswordPuzzle } from "@/lib/crossword-puzzles";

export type Direction = "across" | "down";

export const SIZE = 5;

export function emptyCells(): string[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ""));
}

export function cellsForClue(clue: CrosswordClue, direction: Direction): [number, number][] {
  return Array.from({ length: clue.length }, (_, i) =>
    direction === "across" ? [clue.row, clue.col + i] : [clue.row + i, clue.col],
  );
}

export function findClue(puzzle: CrosswordPuzzle, direction: Direction, row: number, col: number): CrosswordClue | null {
  const list = direction === "across" ? puzzle.across : puzzle.down;
  return (
    list.find((c) =>
      direction === "across"
        ? c.row === row && col >= c.col && col < c.col + c.length
        : c.col === col && row >= c.row && row < c.row + c.length,
    ) ?? null
  );
}

export type ClueState = "empty" | "correct" | "wrong";

/** "empty" until every square of the clue has a letter, then "correct" or "wrong" against
 *  the solution grid. Drives the clue list: only a correct entry gets struck through. */
export function clueState(
  clue: CrosswordClue,
  direction: Direction,
  cells: string[][],
  solution: CrosswordPuzzle["grid"],
): ClueState {
  const squares = cellsForClue(clue, direction);
  if (squares.some(([r, c]) => cells[r][c] === "")) return "empty";
  return squares.every(([r, c]) => cells[r][c].toUpperCase() === solution[r][c]) ? "correct" : "wrong";
}
