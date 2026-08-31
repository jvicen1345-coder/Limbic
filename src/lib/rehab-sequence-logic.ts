import { rehabSequenceCases, type RehabSequenceCaseEntry } from "@/lib/rehab-sequence-cases";
import { todayKeyInZone } from "@/lib/day";

const DAY_MS = 86400000;
// Same fixed, arbitrary epoch as lib/differential-cases.ts/lib/anatomy-connect-logic.ts —
// keeps the daily rotation stable across deploys instead of resetting at a calendar year
// boundary.
const EPOCH_MS = new Date(2024, 0, 1).getTime();

function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

/** YYYY-MM-DD for "today" in the reader's own time zone — the unit the daily case rotates on.
 *  Takes the zone explicitly (see lib/user-time-zone.ts for where a request gets one)
 *  rather than reading the server's clock: this ran off UTC on a UTC server, so the day
 *  rolled over mid-evening for every reader in the Americas — see lib/day.ts. */
export function getDateKey(timeZone: string): string {
  return todayKeyInZone(timeZone);
}

/** The case for any given calendar day — a fixed cyclic index over rehabSequenceCases.
 *  Exported (not just the "today" wrapper below) so stats can recompute which case a past
 *  day's saved result belongs to — see app/actions/rehab-sequence.ts's getRehabStats,
 *  which needs each historical row's real intervention order to re-derive its score since
 *  RehabSequenceResult only stores the reader's submitted `sequenceGiven`, not a score
 *  column. */
export function getRehabCaseForDate(dateKey: string): RehabSequenceCaseEntry {
  const dayIndex = dayIndexForDateKey(dateKey);
  const total = rehabSequenceCases.length;
  const index = ((dayIndex % total) + total) % total;
  return rehabSequenceCases[index];
}

/** Today's case, stable for every reader on a given calendar day and stable as the bank
 *  grows. */
export function getTodaysRehabCase(timeZone: string): RehabSequenceCaseEntry {
  return getRehabCaseForDate(getDateKey(timeZone));
}

export interface RehabSequenceValidation {
  score: number;
  correct: boolean;
  correctPositions: boolean[];
}

/** Scores a reader's ordering against the case's real intervention order — one point per
 *  position that matches exactly, same "how many did you get right" scoring as the page's
 *  "6 of 8 correct" readout. `correctPositions` mirrors userSequence index-for-index so the
 *  page can flip each submitted card to green or red without re-deriving the comparison. */
export function validateSequence(caseId: number, userSequence: string[]): RehabSequenceValidation {
  const rehabCase = rehabSequenceCases.find((c) => c.id === caseId);
  if (!rehabCase) return { score: 0, correct: false, correctPositions: [] };

  const correctPositions = userSequence.map((step, i) => step === rehabCase.interventions[i]);
  const score = correctPositions.filter(Boolean).length;
  return { score, correct: score === rehabCase.interventions.length, correctPositions };
}
