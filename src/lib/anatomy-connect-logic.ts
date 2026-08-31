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

export interface AnatomyConnectionInput {
  muscle: string;
  nerve: string;
  action: string;
  region: string;
}

export interface AnatomyConnectionCheck {
  muscle: string;
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
      nerveCorrect: !!answer && answer.nerve === conn.nerve,
      actionCorrect: !!answer && answer.action === conn.action,
      regionCorrect: !!answer && answer.region === conn.region,
    };
  });

  const solved =
    results.length === puzzle.items.length && results.every((r) => r.nerveCorrect && r.actionCorrect && r.regionCorrect);

  return { results, solved };
}
