/** Curated bank of 5x5 mini crosswords, same "curated content, not generated" spirit as
 *  lib/wordle-words.ts's WORDLE_ANSWERS. Every answer word was checked against a real
 *  system dictionary before being included here (see the puzzle-authoring notes in this
 *  session — no invented spellings, same policy as the Wordle bank), and every grid was
 *  built by a constraint solver rather than placed by hand, so across/down intersections
 *  are guaranteed self-consistent rather than eyeballed.
 *
 *  All puzzles share one grid shape (black cells at the top-right and bottom-left corner,
 *  the classic 5x5 mini pattern), so the clue numbering is identical across every puzzle:
 *  1 (0,0) starts both 1-Across and 1-Down; 2/3/4 are Down-only (0,1)/(0,2)/(0,3); 5 (1,0)
 *  starts 5-Across; 6 (1,4) starts 6-Down; 7/8 start 7-Across (2,0)/8-Across (3,0); 9 (4,1)
 *  starts 9-Across. buildPuzzle() below turns a compact (answer, clue) list per puzzle
 *  into the full grid + clue objects using that one fixed geometry, and cross-checks that
 *  every across/down intersection agrees — a transcription typo throws at module load
 *  instead of silently shipping a broken puzzle. */

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

interface ClueGeometry {
  number: number;
  row: number;
  col: number;
  length: number;
}

const ACROSS_GEOMETRY: ClueGeometry[] = [
  { number: 1, row: 0, col: 0, length: 4 },
  { number: 5, row: 1, col: 0, length: 5 },
  { number: 7, row: 2, col: 0, length: 5 },
  { number: 8, row: 3, col: 0, length: 5 },
  { number: 9, row: 4, col: 1, length: 4 },
];

const DOWN_GEOMETRY: ClueGeometry[] = [
  { number: 1, row: 0, col: 0, length: 4 },
  { number: 2, row: 0, col: 1, length: 5 },
  { number: 3, row: 0, col: 2, length: 5 },
  { number: 4, row: 0, col: 3, length: 5 },
  { number: 6, row: 1, col: 4, length: 4 },
];

type ClueEntry = [answer: string, clue: string];

function buildPuzzle(id: string, acrossEntries: ClueEntry[], downEntries: ClueEntry[]): CrosswordPuzzle {
  const grid: CrosswordCellSolution[][] = Array.from({ length: 5 }, () => Array<CrosswordCellSolution>(5).fill(null));

  const across = ACROSS_GEOMETRY.map((g, i) => {
    const [answer, clue] = acrossEntries[i];
    if (answer.length !== g.length) throw new Error(`${id}: ${g.number}-Across "${answer}" should be ${g.length} letters`);
    for (let k = 0; k < g.length; k++) grid[g.row][g.col + k] = answer[k];
    return { ...g, answer, clue };
  });

  const down = DOWN_GEOMETRY.map((g, i) => {
    const [answer, clue] = downEntries[i];
    if (answer.length !== g.length) throw new Error(`${id}: ${g.number}-Down "${answer}" should be ${g.length} letters`);
    for (let k = 0; k < g.length; k++) {
      const row = g.row + k;
      const existing = grid[row][g.col];
      if (existing !== null && existing !== answer[k]) {
        throw new Error(`${id}: ${g.number}-Down "${answer}" conflicts with an Across entry at (${row},${g.col})`);
      }
      grid[row][g.col] = answer[k];
    }
    return { ...g, answer, clue };
  });

  return { id, grid, across, down };
}

const PUZZLES: CrosswordPuzzle[] = [
  buildPuzzle(
    "rest-alpha",
    [
      ["REST", "Silence, on a musical staff"],
      ["ALPHA", "Leader of the pack, supposedly"],
      ["IVIES", "Harvard, Yale and Brown, collectively"],
      ["DENTS", "Makes an impression?"],
      ["SEAT", "It's up for grabs in an election"],
    ],
    [
      ["RAID", "Midnight fridge ___"],
      ["ELVES", "Rivendell residents"],
      ["SPINE", "Where a hardcover's title is printed"],
      ["THETA", "Sorority letter after eta"],
      ["ASST", "Deputy: Abbr."],
    ]
  ),
  buildPuzzle(
    "scan-nerve",
    [
      ["SCAN", "Skim, or scrutinize"],
      ["AIDED", "Abetted"],
      ["STORE", "Squirrel away"],
      ["SERVE", "Do time"],
      ["SEEP", "Ooze"],
    ],
    [
      ["SASS", "Lip"],
      ["CITES", "Names in a footnote"],
      ["ADORE", "Be crazy about"],
      ["NERVE", "Gall"],
      ["DEEP", "Like a bass voice"],
    ]
  ),
  buildPuzzle(
    "disc-aches",
    [
      ["DISC", "Frisbee, formally"],
      ["ACHES", "Longs, with \"for\""],
      ["DIODE", "The \"D\" in LED"],
      ["SEVEN", "Number of deadly sins"],
      ["REST", "Remainder"],
    ],
    [
      ["DADS", "Ones telling corny jokes, stereotypically"],
      ["ICIER", "More frosty, as a reception"],
      ["SHOVE", "When push comes to ___"],
      ["CEDES", "Yields"],
      ["SENT", "Dispatched"],
    ]
  ),
  buildPuzzle(
    "lank-axons",
    [
      ["LANK", "Lean and droopy"],
      ["AXONS", "Signal senders in the brain"],
      ["TIBIA", "What a shin guard guards"],
      ["SALTS", "Smelling ___"],
      ["LESS", "Minus, in a way"],
    ],
    [
      ["LATS", "Pull-up muscles, briefly"],
      ["AXIAL", "Along the main axis"],
      ["NOBLE", "Like helium or neon"],
      ["KNITS", "Purl's partner"],
      ["SASS", "Attitude, informally"],
    ]
  ),
  buildPuzzle(
    "cast-altar",
    [
      ["CAST", "Throw, as a fishing line"],
      ["ALTAR", "End of an aisle walk"],
      ["SLOPE", "Ski run"],
      ["HONES", "Sharpens"],
      ["WEST", "Mae or Kanye"],
    ],
    [
      ["CASH", "Johnny of \"Folsom Prison Blues\""],
      ["ALLOW", "Permit"],
      ["STONE", "Fourteen pounds, in Britain"],
      ["TAPES", "Records, in an old way"],
      ["REST", "Take five"],
    ]
  ),
  buildPuzzle(
    "copy-aural",
    [
      ["COPY", "Ad agency output"],
      ["AURAL", "Like a podcast's appeal"],
      ["STORE", "Stock up on"],
      ["TENDS", "Is inclined"],
      ["REST", "The others"],
    ],
    [
      ["CAST", "It gets signed by classmates"],
      ["OUTER", "___ Banks"],
      ["PRONE", "Liable"],
      ["YARDS", "Three-foot units"],
      ["LEST", "\"___ we forget\""],
    ]
  ),
  buildPuzzle(
    "wart-iliac",
    [
      ["WART", "Hag's facial feature, in cartoons"],
      ["ILIAC", "Like a pelvic artery"],
      ["NINNY", "Simpleton"],
      ["DESKS", "Cubicle furniture"],
      ["NEST", "Twiggy nursery"],
    ],
    [
      ["WIND", "Coil up"],
      ["ALIEN", "Roswell subject"],
      ["RINSE", "Cycle after wash"],
      ["TANKS", "Flops badly"],
      ["CYST", "Ovarian ___"],
    ]
  ),
  buildPuzzle(
    "tone-stump",
    [
      ["TONE", "Dial ___"],
      ["STUMP", "Where a candidate speaks"],
      ["ATRIA", "Skylit hotel spaces"],
      ["RESTS", "\"The defense ___\""],
      ["REST", "Repose"],
    ],
    [
      ["TSAR", "Nicholas II, for one"],
      ["OTTER", "Kelp-forest floater"],
      ["NURSE", "Sip slowly"],
      ["EMITS", "Gives off"],
      ["PAST", "Water under the bridge"],
    ]
  ),
  buildPuzzle(
    "apex-valet",
    [
      ["APEX", "Zenith"],
      ["VALET", "One who takes your keys"],
      ["INANE", "Vapid"],
      ["DETOX", "Rehab's first phase"],
      ["LENT", "Season of giving up"],
    ],
    [
      ["AVID", "Keen"],
      ["PANEL", "Jury or door part"],
      ["ELATE", "Send over the moon"],
      ["XENON", "Element 54"],
      ["TEXT", "Shoot a quick message"],
    ]
  ),
  buildPuzzle(
    "aunt-snark",
    [
      ["AUNT", "Cousin's mom"],
      ["SNARK", "Biting humor"],
      ["PITON", "Climber's anchor"],
      ["STATE", "Say, or Ohio"],
      ["ELSE", "\"Or ___!\""],
    ],
    [
      ["ASPS", "Cleopatra's snakes"],
      ["UNITE", "\"Workers of the world, ___!\""],
      ["NATAL", "Like an astrologer's chart"],
      ["TROTS", "Jogs along"],
      ["KNEE", "___-jerk reaction"],
    ]
  ),
  buildPuzzle(
    "fees-elves",
    [
      ["FEES", "Hidden airline charges"],
      ["ELVES", "Keebler workers"],
      ["ABOVE", "Overhead"],
      ["TOKEN", "Arcade coin"],
      ["WENT", "Departed"],
    ],
    [
      ["FEAT", "Tour de force"],
      ["ELBOW", "Nudge, or macaroni shape"],
      ["EVOKE", "Call to mind"],
      ["SEVEN", "Wonders of the world count"],
      ["SENT", "Off in the mail"],
    ]
  ),
  buildPuzzle(
    "burn-osier",
    [
      ["BURN", "Scathing insult, in slang"],
      ["OSIER", "Basket-weaver's willow"],
      ["OUNCE", "\"An ___ of prevention...\""],
      ["MASKS", "Conceals"],
      ["LEST", "For fear that"],
    ],
    [
      ["BOOM", "Sonic ___"],
      ["USUAL", "\"The ___ suspects\""],
      ["RINSE", "Lather, ___, repeat"],
      ["NECKS", "Bottle parts"],
      ["REST", "Break"],
    ]
  ),
];

/** No clue text may appear twice anywhere in the bank. Nine answers legitimately recur
 *  across puzzles (REST alone is in six of the twelve — the 5x5 geometry is fixed and the
 *  grids were machine-solved against it, so the same short fill turns up repeatedly), and
 *  before this every one of them carried the *same* clue: a daily solver who had seen
 *  "The \"R\" in R.I.C.E. treatment" once got that entry free in half the puzzles they
 *  would ever play. Recurring answers are fine; recurring clues are a gimme. Throws at
 *  module load, same fail-fast policy as buildPuzzle's intersection check above. */
function assertCluesAreUnique(puzzles: CrosswordPuzzle[]): void {
  const seen = new Map<string, string>();
  for (const p of puzzles) {
    for (const c of [...p.across, ...p.down]) {
      const previous = seen.get(c.clue);
      if (previous !== undefined) {
        throw new Error(`Duplicate crossword clue "${c.clue}" in ${previous} and ${p.id}`);
      }
      seen.set(c.clue, p.id);
    }
  }
}

assertCluesAreUnique(PUZZLES);

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
