/** Curated bank of 5x5 mini crosswords, same "curated content, not generated" spirit as
 *  lib/wordle-words.ts's WORDLE_ANSWERS. Every answer word was checked against a real
 *  system dictionary before being included here (see the puzzle-authoring notes in this
 *  session — no invented spellings, same policy as the Wordle bank).
 *
 *  All puzzles share one grid shape (black cells at the top-right and bottom-left corner,
 *  the classic 5x5 mini pattern), so the clue numbering is identical across every puzzle:
 *  1 (0,0) starts both 1-Across and 1-Down; 2/3/4 are Down-only (0,1)/(0,2)/(0,3); 5 (1,0)
 *  starts 5-Across; 6 (1,4) starts 6-Down; 7/8 start 7-Across (2,0)/8-Across (3,0); 9 (4,1)
 *  starts 9-Across. */

export type CrosswordCellSolution = string | null; // null = black cell

export interface CrosswordClue {
  number: number;
  row: number;
  col: number;
  length: number;
  answer: string;
  clue: string;
}

export interface CrosswordPuzzle {
  id: string;
  /** 5 rows x 5 cols, null for a black cell. */
  grid: CrosswordCellSolution[][];
  across: CrosswordClue[];
  down: CrosswordClue[];
}

const PUZZLES: CrosswordPuzzle[] = [
  {
    id: "rest-alpha",
    grid: [
      ["R", "E", "S", "T", null],
      ["A", "L", "P", "H", "A"],
      ["I", "V", "I", "E", "S"],
      ["D", "E", "N", "T", "S"],
      [null, "S", "E", "A", "T"],
    ],
    across: [
      { number: 1, row: 0, col: 0, length: 4, answer: "REST", clue: "Recover — part of R.I.C.E. treatment" },
      { number: 5, row: 1, col: 0, length: 5, answer: "ALPHA", clue: "First Greek letter, and a relaxed brain-wave frequency" },
      { number: 7, row: 2, col: 0, length: 5, answer: "IVIES", clue: "Climbing plants — one kind is itchy to the touch" },
      { number: 8, row: 3, col: 0, length: 5, answer: "DENTS", clue: "Small dings in a car door" },
      { number: 9, row: 4, col: 1, length: 4, answer: "SEAT", clue: "Chair, or where you sit" },
    ],
    down: [
      { number: 1, row: 0, col: 0, length: 4, answer: "RAID", clue: "Sudden surprise attack" },
      { number: 2, row: 0, col: 1, length: 5, answer: "ELVES", clue: "Santa's little helpers" },
      { number: 3, row: 0, col: 2, length: 5, answer: "SPINE", clue: "Your backbone, in PT terms" },
      { number: 4, row: 0, col: 3, length: 5, answer: "THETA", clue: "Greek letter after eta, also a slower brain-wave rhythm" },
      { number: 6, row: 1, col: 4, length: 4, answer: "ASST", clue: "Helper, for short" },
    ],
  },
  {
    id: "scan-nerve",
    grid: [
      ["S", "C", "A", "N", null],
      ["A", "I", "D", "E", "D"],
      ["S", "T", "O", "R", "E"],
      ["S", "E", "R", "V", "E"],
      [null, "S", "E", "E", "P"],
    ],
    across: [
      { number: 1, row: 0, col: 0, length: 4, answer: "SCAN", clue: "MRI or CT, for example" },
      { number: 5, row: 1, col: 0, length: 5, answer: "AIDED", clue: "Helped out" },
      { number: 7, row: 2, col: 0, length: 5, answer: "STORE", clue: "Retail shop" },
      { number: 8, row: 3, col: 0, length: 5, answer: "SERVE", clue: "Tennis shot that starts the point" },
      { number: 9, row: 4, col: 1, length: 4, answer: "SEEP", clue: "Ooze out slowly" },
    ],
    down: [
      { number: 1, row: 0, col: 0, length: 4, answer: "SASS", clue: "Cheeky backtalk" },
      { number: 2, row: 0, col: 1, length: 5, answer: "CITES", clue: "References as a source" },
      { number: 3, row: 0, col: 2, length: 5, answer: "ADORE", clue: "Love deeply" },
      { number: 4, row: 0, col: 3, length: 5, answer: "NERVE", clue: "Body structure that carries signals to the brain" },
      { number: 6, row: 1, col: 4, length: 4, answer: "DEEP", clue: "Not shallow" },
    ],
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic puzzle of the day — same word-of-the-day scheme as
 *  lib/wordle-words.ts's wordForDate, one hash so the two never pick correlated indices. */
export function puzzleForDate(dateKey: string): CrosswordPuzzle {
  const index = hashString(`crossword:${dateKey}`) % PUZZLES.length;
  return PUZZLES[index];
}
