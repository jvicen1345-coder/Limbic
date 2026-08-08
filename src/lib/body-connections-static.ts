/**
 * Body Connections' static match bank (see app/(app)/games/body/page.tsx,
 * components/BodyConnectionsGame.tsx) — ten canonical body-part/function pairs, matching
 * the ten clickable regions on the body silhouette (see components/BodySilhouette.tsx).
 * Each day's round only uses 5 of the 10 (matching the game's "5 matched" completion),
 * built as a rotating cyclic window over the canonical list rather than hand-written per
 * set, same "arithmetic rotation" approach as lib/cases-static.ts's specialty buckets.
 */

export interface BodyMatchPair {
  bodyPart: string;
  /** The clickable SVG region id this pair matches to — see components/BodySilhouette.tsx. */
  region: string;
  function: string;
}

export interface BodyMatchSet {
  id: string;
  pairs: BodyMatchPair[];
}

const CANONICAL_PAIRS: BodyMatchPair[] = [
  { bodyPart: "Heart", region: "heart", function: "Pumps blood throughout the body" },
  { bodyPart: "Lungs", region: "lungs", function: "Exchange oxygen and carbon dioxide" },
  { bodyPart: "Quadriceps", region: "quadriceps", function: "Extend the knee and straighten the leg" },
  { bodyPart: "Biceps", region: "biceps", function: "Flex the elbow and lift the forearm" },
  { bodyPart: "Diaphragm", region: "diaphragm", function: "Controls breathing by contracting and relaxing" },
  { bodyPart: "Core / Abdomen", region: "core", function: "Stabilizes the spine and supports posture" },
  { bodyPart: "Calves", region: "calves", function: "Push off the ground when walking or running" },
  { bodyPart: "Shoulders", region: "shoulders", function: "Raise and rotate the arm" },
  { bodyPart: "Glutes", region: "glutes", function: "Extend the hip and support standing and walking" },
  { bodyPart: "Head / Brain", region: "head", function: "Controls all body functions and processes information" },
];

/** 10 rotated 5-of-10 windows over CANONICAL_PAIRS — set i starts at canonical index i, so
 *  across a 10-day cycle every region appears in exactly 5 of the 10 sets. */
export const BODY_MATCH_SETS: BodyMatchSet[] = Array.from({ length: CANONICAL_PAIRS.length }, (_, i) => ({
  id: `set-${i + 1}`,
  pairs: Array.from({ length: 5 }, (_, j) => CANONICAL_PAIRS[(i + j) % CANONICAL_PAIRS.length]),
}));

const DAY_MS = 86400000;
// A fixed, arbitrary epoch — just needs to be stable across deploys (same reasoning as
// lib/cases-static.ts's EPOCH_MS and lib/trivia-static.ts's own copy).
const EPOCH_MS = new Date(2024, 0, 1).getTime();

function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

/** Today's 5-pair match set — the same set for every reader on a given date, cycling
 *  through BODY_MATCH_SETS once every 10 days. */
export function bodyMatchSetForDate(dateKey: string): BodyMatchSet {
  const total = BODY_MATCH_SETS.length;
  const index = ((dayIndexForDateKey(dateKey) % total) + total) % total;
  return BODY_MATCH_SETS[index];
}

/** YYYY-MM-DD for "today" — the unit the daily match set rotates on. */
export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
