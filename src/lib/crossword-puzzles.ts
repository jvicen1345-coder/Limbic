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
      ["REST", "The \"R\" in R.I.C.E. treatment"],
      ["ALPHA", "First Greek letter — also a calm brain-wave frequency"],
      ["IVIES", "Climbing vines — the poison kind causes an itchy rash"],
      ["DENTS", "What a fender bender leaves behind"],
      ["SEAT", "Chair — or a spot on the city council"],
    ],
    [
      ["RAID", "Surprise attack, or a bug-spray brand"],
      ["ELVES", "Santa's workshop crew"],
      ["SPINE", "The body's central support — or a book's bound edge"],
      ["THETA", "Letter after Eta — a brain-wave rhythm slower than Alpha"],
      ["ASST", "Right-hand person, for short"],
    ]
  ),
  buildPuzzle(
    "scan-nerve",
    [
      ["SCAN", "MRI or CT, e.g."],
      ["AIDED", "Lent a hand to"],
      ["STORE", "Where to shop — or what a squirrel does with acorns"],
      ["SERVE", "Tennis shot that starts a point — or what a waiter does"],
      ["SEEP", "Ooze out slowly, as water through a crack"],
    ],
    [
      ["SASS", "Cheeky backtalk"],
      ["CITES", "Gives credit to, as a source"],
      ["ADORE", "Love to pieces"],
      ["NERVE", "Signal-carrying body structure — or plain audacity"],
      ["DEEP", "Not shallow — knee-___ in work"],
    ]
  ),
  buildPuzzle(
    "disc-aches",
    [
      ["DISC", "Spinal ___, a cushion between vertebrae"],
      ["ACHES", "Dull, persistent pains"],
      ["DIODE", "One-way gate for electric current"],
      ["SEVEN", "Lucky number — or days in a week"],
      ["REST", "The \"R\" in R.I.C.E. treatment"],
    ],
    [
      ["DADS", "Fathers, casually"],
      ["ICIER", "More treacherous, like an untreated sidewalk"],
      ["SHOVE", "Push roughly"],
      ["CEDES", "Gives up, as territory or a point"],
      ["SENT", "Mailed off"],
    ]
  ),
  buildPuzzle(
    "lank-axons",
    [
      ["LANK", "Limp and thin, like unwashed hair"],
      ["AXONS", "Nerve fibers that carry signals away from a cell body"],
      ["TIBIA", "The larger of the two shin bones"],
      ["SALTS", "Electrolytes like sodium and potassium"],
      ["LESS", "Not as much"],
    ],
    [
      ["LATS", "Back muscles worked by a pull-up, for short"],
      ["AXIAL", "Along the body's central line, as in the ___ skeleton"],
      ["NOBLE", "Aristocratic, like royalty"],
      ["KNITS", "Joins back together, as a healing fracture"],
      ["SASS", "Smart-alecky retort"],
    ]
  ),
  buildPuzzle(
    "cast-altar",
    [
      ["CAST", "Rigid support for a broken bone — or a movie's ensemble"],
      ["ALTAR", "Where \"I do\" is said"],
      ["SLOPE", "Incline, like a wheelchair ramp"],
      ["HONES", "Sharpens a skill"],
      ["WEST", "Direction of sunset"],
    ],
    [
      ["CASH", "Paper money"],
      ["ALLOW", "Give the green light to"],
      ["STONE", "Rock, as in a kidney ___"],
      ["TAPES", "Kinesiology ___, used to support a joint"],
      ["REST", "The \"R\" in R.I.C.E. treatment"],
    ]
  ),
  buildPuzzle(
    "copy-aural",
    [
      ["COPY", "Duplicate, as a document"],
      ["AURAL", "Related to the sense of hearing"],
      ["STORE", "Where to shop"],
      ["TENDS", "Looks after, as a patient"],
      ["REST", "The \"R\" in R.I.C.E. treatment"],
    ],
    [
      ["CAST", "Rigid support for a broken bone"],
      ["OUTER", "___ space"],
      ["PRONE", "Lying face-down, on the exam table"],
      ["YARDS", "Gridiron gains, in football"],
      ["LEST", "For fear that"],
    ]
  ),
  buildPuzzle(
    "wart-iliac",
    [
      ["WART", "Small, rough skin growth"],
      ["ILIAC", "Like the crest near the hip bone"],
      ["NINNY", "A silly fool"],
      ["DESKS", "Where office work gets done"],
      ["NEST", "A bird's cozy home"],
    ],
    [
      ["WIND", "Moving air — or to twist, like a clock"],
      ["ALIEN", "E.T., for one"],
      ["RINSE", "Wash off with water"],
      ["TANKS", "Storage containers — or armored vehicles"],
      ["CYST", "Fluid-filled sac beneath the skin"],
    ]
  ),
  buildPuzzle(
    "tone-stump",
    [
      ["TONE", "Muscle firmness"],
      ["STUMP", "Tree remnant — or to baffle with a tricky question"],
      ["ATRIA", "The heart's upper chambers"],
      ["RESTS", "Recovers — or takes a breather"],
      ["REST", "The \"R\" in R.I.C.E. treatment"],
    ],
    [
      ["TSAR", "Russian emperor — also spelled \"czar\""],
      ["OTTER", "Playful, web-footed swimmer"],
      ["NURSE", "Bedside clinician — or to feed an infant"],
      ["EMITS", "Gives off, as light or sound"],
      ["PAST", "Bygone days"],
    ]
  ),
  buildPuzzle(
    "apex-valet",
    [
      ["APEX", "The very top"],
      ["VALET", "One who parks your car"],
      ["INANE", "Silly and pointless"],
      ["DETOX", "Cleanse the body of harmful substances"],
      ["LENT", "Loaned — or the weeks before Easter"],
    ],
    [
      ["AVID", "Enthusiastic"],
      ["PANEL", "Group of experts — or a section of a door"],
      ["ELATE", "Fill with joy"],
      ["XENON", "Noble gas used in some car headlights"],
      ["TEXT", "Written message"],
    ]
  ),
  buildPuzzle(
    "aunt-snark",
    [
      ["AUNT", "Your parent's sister"],
      ["SNARK", "Sarcastic wit"],
      ["PITON", "Metal spike hammered into rock for climbing"],
      ["STATE", "Condition — or a U.S. region"],
      ["ELSE", "Otherwise"],
    ],
    [
      ["ASPS", "Venomous snakes, in old Egypt"],
      ["UNITE", "Join forces"],
      ["NATAL", "Related to birth, as in pre-___ vitamins"],
      ["TROTS", "Brisk, steady-paced runs — a horse's gait"],
      ["KNEE", "Joint between thigh and shin"],
    ]
  ),
  buildPuzzle(
    "fees-elves",
    [
      ["FEES", "Charges for a service"],
      ["ELVES", "Santa's little helpers"],
      ["ABOVE", "Higher than"],
      ["TOKEN", "Small symbolic item — or a subway fare of old"],
      ["WENT", "Traveled, in the past tense"],
    ],
    [
      ["FEAT", "Impressive achievement"],
      ["ELBOW", "Joint between upper arm and forearm"],
      ["EVOKE", "Bring to mind"],
      ["SEVEN", "Lucky number, superstitiously"],
      ["SENT", "Mailed off"],
    ]
  ),
  buildPuzzle(
    "burn-osier",
    [
      ["BURN", "Skin injury from heat — first, second, or third degree"],
      ["OSIER", "Flexible willow twig used in basket-weaving"],
      ["OUNCE", "Small unit of weight — 16 to a pound"],
      ["MASKS", "Face coverings, like PPE"],
      ["LEST", "For fear that"],
    ],
    [
      ["BOOM", "Loud, explosive sound"],
      ["USUAL", "Normal — \"the ___ suspects\""],
      ["RINSE", "Wash off with water"],
      ["NECKS", "Body parts between head and shoulders"],
      ["REST", "The \"R\" in R.I.C.E. treatment"],
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
