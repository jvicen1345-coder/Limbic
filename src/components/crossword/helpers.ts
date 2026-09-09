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
