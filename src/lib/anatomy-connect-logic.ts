import { anatomyConnectPuzzles, type AnatomyConnectPuzzleEntry } from "@/lib/anatomy-connect-puzzles";
import { todayKeyInZone } from "@/lib/day";

const DAY_MS = 86400000;
// Same fixed, arbitrary epoch as lib/differential-cases.ts/lib/trivia-static.ts — keeps
// the daily rotation stable across deploys instead of resetting at a calendar year
// boundary the way a literal day-of-year count would.
const EPOCH_MS = new Date(2024, 0, 1).getTime();

function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

/** YYYY-MM-DD for "today" in the reader's own time zone — the unit the daily puzzle rotates on.
 *  Takes the zone explicitly (see lib/user-time-zone.ts for where a request gets one)
 *  rather than reading the server's clock: this ran off UTC on a UTC server, so the day
 *  rolled over mid-evening for every reader in the Americas — see lib/day.ts. */
export function getDateKey(timeZone: string): string {
  return todayKeyInZone(timeZone);
}

/** Today's puzzle — a fixed cyclic index over anatomyConnectPuzzles, stable for every
 *  reader on a given calendar day and stable as the bank grows. */
export function getTodaysPuzzle(timeZone: string): AnatomyConnectPuzzleEntry {
  const dayIndex = dayIndexForDateKey(getDateKey(timeZone));
  const total = anatomyConnectPuzzles.length;
  const index = ((dayIndex % total) + total) % total;
  return anatomyConnectPuzzles[index];
}

/** The three fields a muscle is matched against. Region is conditional — see
 *  `regionsAreUniform` below. */
export type AnatomyConnectField = "nerve" | "action" | "region";

/** True when every item in the puzzle shares one region, which makes the Region column a
 *  free gimme: four identical cards, any assignment correct. Five of the thirty puzzles are
 *  built this way (Medial Thigh, Posterior Thigh, Deep Hip External Rotators, Anterior Leg
 *  and Foot, Posterior Shoulder) — they're grouped *by* region, so a uniform region is
 *  inherent to the puzzle rather than a data error to fix. The game drops the Region step
 *  on those days instead (see components/AnatomyConnectGame.tsx): three columns on desktop,
 *  two questions per muscle on mobile. */
export function regionsAreUniform(puzzle: AnatomyConnectPuzzleEntry): boolean {
  return puzzle.items.every((item) => item.region === puzzle.items[0].region);
}

export interface AnatomyConnectionInput {
  muscle: string;
  nerve: string;
  action: string;
  region: string;
}

export interface AnatomyConnectionCheck {
  muscle: string;
  /** The row's real answers, returned alongside the verdicts so the board can label each
   *  wrong card with what it should have been. Only ever sent back from a Submit, which is
   *  now terminal (the board goes read-only), so this reveals nothing still in play. */
  correct: { nerve: string; action: string; region: string };
  nerveCorrect: boolean;
  actionCorrect: boolean;
  regionCorrect: boolean;
}

export interface AnatomyConnectValidation {
  results: AnatomyConnectionCheck[];
  solved: boolean;
}

/** Checks the reader's muscle-to-nerve/action/region pairings against the puzzle's real
 *  answer key, one row at a time — each of a row's three fields is graded independently so
 *  a reader who got the nerve right but the action wrong sees exactly that, rather than the
 *  whole row marked simply "wrong." `solved` requires every field of every row correct. */
export function validateSolution(puzzleId: number, userConnections: AnatomyConnectionInput[]): AnatomyConnectValidation {
  const puzzle = anatomyConnectPuzzles.find((p) => p.id === puzzleId);
  if (!puzzle) return { results: [], solved: false };

  const answerByMuscle = new Map(puzzle.items.map((item) => [item.muscle, item]));

  const results: AnatomyConnectionCheck[] = userConnections.map((conn) => {
    const answer = answerByMuscle.get(conn.muscle);
    return {
      muscle: conn.muscle,
      correct: {
        nerve: answer?.nerve ?? "",
        action: answer?.action ?? "",
        region: answer?.region ?? "",
      },
      nerveCorrect: !!answer && answer.nerve === conn.nerve,
      actionCorrect: !!answer && answer.action === conn.action,
      regionCorrect: !!answer && answer.region === conn.region,
    };
  });

  const solved =
    results.length === puzzle.items.length && results.every((r) => r.nerveCorrect && r.actionCorrect && r.regionCorrect);

  return { results, solved };
}

/** The correct value of one field for one muscle — the answer key, so every caller of this
 *  is a Server Action and the result is only ever handed to the client for a field the
 *  reader has already answered or deliberately spent a hint on. */
export function correctAnswerFor(
  puzzle: AnatomyConnectPuzzleEntry,
  muscle: string,
  field: AnatomyConnectField
): string | null {
  const item = puzzle.items.find((i) => i.muscle === muscle);
  return item ? item[field] : null;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** One generic distractor per field, the first thing tried when the puzzle itself can't
 *  supply three distinct wrong answers. */
const GENERIC_DISTRACTOR: Record<AnatomyConnectField, string> = {
  nerve: "Femoral L2-L4",
  action: "Hip flexion and adduction",
  region: "Posterior thigh",
};

/** Every value the whole bank uses for a field — the last-resort distractor pool. Real
 *  values from real puzzles, so a topped-up question still reads as plausible anatomy rather
 *  than obvious filler. Computed once; the bank is a static import. */
const BANK_VALUES: Record<AnatomyConnectField, string[]> = {
  nerve: [...new Set(anatomyConnectPuzzles.flatMap((p) => p.items.map((i) => i.nerve)))],
  action: [...new Set(anatomyConnectPuzzles.flatMap((p) => p.items.map((i) => i.action)))],
  region: [...new Set(anatomyConnectPuzzles.flatMap((p) => p.items.map((i) => i.region)))],
};

export interface AnatomyConnectQuestion {
  field: AnatomyConnectField;
  /** Shuffled, and deliberately carries no marker for which one is right — the mobile flow
   *  grades through a Server Action so the answer key never reaches the browser. */
  options: string[];
}

export interface AnatomyConnectMuscleQuestions {
  muscle: string;
  questions: AnatomyConnectQuestion[];
}

/** Builds the mobile flow's multiple-choice questions: for each muscle, one question per
 *  field, each offering the correct answer plus up to three distractors drawn from the other
 *  muscles in today's puzzle.
 *
 *  Distractors are de-duplicated, which matters far more than the puzzle count does. Puzzles
 *  routinely repeat a value across rows — Rotator Cuff innervates both Supraspinatus and
 *  Infraspinatus from "Suprascapular"; all four Hip Stabilizers share one nerve — so a
 *  four-muscle puzzle often yields only two or three distinct values for a field, and
 *  offering the same string as two separate options would read as a bug. Twelve of the
 *  thirty puzzles are short on at least one field, so this is the common case, not an edge
 *  one, and a single fallback isn't enough to hold every question at four options.
 *
 *  So the top-up runs in three tiers, most plausible first: other rows of this puzzle, then
 *  GENERIC_DISTRACTOR (the named fallback, which alone covers the spec's three-muscle case
 *  exactly — two real distractors plus one generic), then the wider bank of real values used
 *  by other puzzles. Every tier skips anything already offered or equal to the correct
 *  answer, which is what keeps puzzle 10 ("Posterior thigh" — the generic region distractor
 *  verbatim) from listing its own answer twice. */
export function buildMuscleQuestions(
  puzzle: AnatomyConnectPuzzleEntry,
  fields: AnatomyConnectField[]
): AnatomyConnectMuscleQuestions[] {
  return puzzle.items.map((item) => ({
    muscle: item.muscle,
    questions: fields.map((field) => {
      const correct = item[field];

      const distractors = shuffleInPlace([
        ...new Set(puzzle.items.filter((other) => other.muscle !== item.muscle).map((other) => other[field])),
      ]).filter((value) => value !== correct);

      const options = distractors.slice(0, 3);

      const topUp = (candidate: string) => {
        if (options.length < 3 && candidate !== correct && !options.includes(candidate)) options.push(candidate);
      };

      topUp(GENERIC_DISTRACTOR[field]);
      for (const value of shuffleInPlace([...BANK_VALUES[field]])) topUp(value);

      return { field, options: shuffleInPlace([correct, ...options]) };
    }),
  }));
}
