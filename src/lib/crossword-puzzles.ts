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
      ["REST", "Recover — part of R.I.C.E. treatment"],
      ["ALPHA", "First Greek letter, and a relaxed brain-wave frequency"],
      ["IVIES", "Climbing plants — one kind is itchy to the touch"],
      ["DENTS", "Small dings in a car door"],
      ["SEAT", "Chair, or where you sit"],
    ],
    [
      ["RAID", "Sudden surprise attack"],
      ["ELVES", "Santa's little helpers"],
      ["SPINE", "Your backbone, in PT terms"],
      ["THETA", "Greek letter after eta, also a slower brain-wave rhythm"],
      ["ASST", "Helper, for short"],
    ]
  ),
  buildPuzzle(
    "scan-nerve",
    [
      ["SCAN", "MRI or CT, for example"],
      ["AIDED", "Helped out"],
      ["STORE", "Retail shop"],
      ["SERVE", "Tennis shot that starts the point"],
      ["SEEP", "Ooze out slowly"],
    ],
    [
      ["SASS", "Cheeky backtalk"],
      ["CITES", "References as a source"],
      ["ADORE", "Love deeply"],
      ["NERVE", "Body structure that carries signals to the brain"],
      ["DEEP", "Not shallow"],
    ]
  ),
  buildPuzzle(
    "disc-aches",
    [
      ["DISC", "Spinal ___, a cushion between vertebrae"],
      ["ACHES", "Dull, persistent pains"],
      ["DIODE", "One-way electronic component"],
      ["SEVEN", "Lucky number, or days in a week"],
      ["REST", "Recover — part of R.I.C.E. treatment"],
    ],
    [
      ["DADS", "Fathers"],
      ["ICIER", "Colder, like a slippery sidewalk"],
      ["SHOVE", "Push roughly"],
      ["CEDES", "Gives up territory or rights"],
      ["SENT", "Mailed off"],
    ]
  ),
  buildPuzzle(
    "lank-axons",
    [
      ["LANK", "Limp and thin, like unwashed hair"],
      ["AXONS", "Nerve fibers that send signals away from a cell body"],
      ["TIBIA", "Shin bone"],
      ["SALTS", "Electrolytes like sodium and potassium"],
      ["LESS", "Not as much"],
    ],
    [
      ["LATS", "Back muscles, for short — as in a pull-up"],
      ["AXIAL", "Along the body's central axis, as in the ___ skeleton"],
      ["NOBLE", "Aristocratic"],
      ["KNITS", "Joins together, as a fracture heals"],
      ["SASS", "Cheeky backtalk"],
    ]
  ),
  buildPuzzle(
    "cast-altar",
    [
      ["CAST", "Rigid support for a broken bone"],
      ["ALTAR", "Where a wedding ceremony takes place"],
      ["SLOPE", "Incline, like a ramp"],
      ["HONES", "Sharpens a skill"],
      ["WEST", "Sunset direction"],
    ],
    [
      ["CASH", "Paper money"],
      ["ALLOW", "Permit"],
      ["STONE", "Rock"],
      ["TAPES", "Kinesiology ___, used to support joints"],
      ["REST", "Recover — part of R.I.C.E. treatment"],
    ]
  ),
  buildPuzzle(
    "copy-aural",
    [
      ["COPY", "Duplicate"],
      ["AURAL", "Related to hearing"],
      ["STORE", "Retail shop"],
      ["TENDS", "Cares for, as a patient"],
      ["REST", "Recover — part of R.I.C.E. treatment"],
    ],
    [
      ["CAST", "Rigid support for a broken bone"],
      ["OUTER", "External"],
      ["PRONE", "Lying face-down"],
      ["YARDS", "Units on a football field"],
      ["LEST", "For fear that"],
    ]
  ),
  buildPuzzle(
    "wart-iliac",
    [
      ["WART", "Small, rough skin growth"],
      ["ILIAC", "Like the crest near your hip bone"],
      ["NINNY", "A silly, foolish person"],
      ["DESKS", "Office furniture for working"],
      ["NEST", "Bird's home"],
    ],
    [
      ["WIND", "Moving air"],
      ["ALIEN", "Extraterrestrial being"],
      ["RINSE", "Wash off with water"],
      ["TANKS", "Storage containers"],
      ["CYST", "Fluid-filled sac under the skin"],
    ]
  ),
  buildPuzzle(
    "tone-stump",
    [
      ["TONE", "Muscle firmness"],
      ["STUMP", "Tree remnant, or a puzzling question"],
      ["ATRIA", "Upper chambers of the heart"],
      ["RESTS", "Recovers, plural"],
      ["REST", "Recover — part of R.I.C.E. treatment"],
    ],
    [
      ["TSAR", "Russian emperor, alternate spelling"],
      ["OTTER", "Playful aquatic mammal"],
      ["NURSE", "Clinician who cares for patients bedside"],
      ["EMITS", "Gives off, as light or sound"],
      ["PAST", "Bygone times"],
    ]
  ),
  buildPuzzle(
    "apex-valet",
    [
      ["APEX", "The very top"],
      ["VALET", "Parking attendant"],
      ["INANE", "Silly, pointless"],
      ["DETOX", "Cleanse the body of toxins"],
      ["LENT", "Loaned"],
    ],
    [
      ["AVID", "Enthusiastic"],
      ["PANEL", "Group of experts, or a section of a door"],
      ["ELATE", "Fill with joy"],
      ["XENON", "Noble gas used in some headlights"],
      ["TEXT", "Written message"],
    ]
  ),
  buildPuzzle(
    "aunt-snark",
    [
      ["AUNT", "Parent's sister"],
      ["SNARK", "Sarcastic wit"],
      ["PITON", "Metal spike driven into rock for climbing"],
      ["STATE", "Condition, or a U.S. region"],
      ["ELSE", "Otherwise"],
    ],
    [
      ["ASPS", "Venomous snakes"],
      ["UNITE", "Join together"],
      ["NATAL", "Related to birth"],
      ["TROTS", "Brisk, steady-paced runs"],
      ["KNEE", "Joint between thigh and shin"],
    ]
  ),
  buildPuzzle(
    "fees-elves",
    [
      ["FEES", "Charges for a service"],
      ["ELVES", "Santa's helpers"],
      ["ABOVE", "Higher than"],
      ["TOKEN", "Small symbolic item"],
      ["WENT", "Traveled, past tense"],
    ],
    [
      ["FEAT", "Impressive achievement"],
      ["ELBOW", "Joint between upper arm and forearm"],
      ["EVOKE", "Bring to mind"],
      ["SEVEN", "Lucky number"],
      ["SENT", "Mailed off"],
    ]
  ),
  buildPuzzle(
    "burn-osier",
    [
      ["BURN", "Skin injury from heat"],
      ["OSIER", "Flexible willow twig used in basket-weaving"],
      ["OUNCE", "Small unit of weight"],
      ["MASKS", "Face coverings, like PPE"],
      ["LEST", "For fear that"],
    ],
    [
      ["BOOM", "Loud explosive sound"],
      ["USUAL", "Normal, expected"],
      ["RINSE", "Wash off with water"],
      ["NECKS", "Body parts between head and shoulders"],
      ["REST", "Recover — part of R.I.C.E. treatment"],
    ]
  ),
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
