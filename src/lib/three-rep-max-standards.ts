/** Reference data + math for the Clinician Dashboard's 3-Rep-Max card (ThreeRepMaxCard.tsx,
 *  app/actions/three-rep-max.ts). Two things live here on purpose:
 *
 *  1. estimateOneRepMax — the Brzycki formula, a standard way to project a 1RM from a
 *     lower-rep max. Published bodyweight-relative strength standards (below) are expressed
 *     in 1RM terms, and a clinician logs a 3RM (safer to test than a true 1RM), so every
 *     comparison goes through this conversion first.
 *  2. RATIO_STANDARDS — approximate bodyweight-relative 1RM thresholds per lift/sex/level,
 *     adapted from the kind of bodyweight-ratio strength-standard tables widely published by
 *     strength-training resources (e.g. Lon Kilgore's strength standards model, as used by
 *     numerous online strength calculators). These are general-population reference points
 *     for context in conversation with a patient, not a peer-reviewed clinical norm the way
 *     ForceLabNorm's dynamometer means/SDs are (see that model's own comment in
 *     schema.prisma) — there is no single controlled-population study for "barbell 3-rep-max
 *     vs. bodyweight" the way there is for handheld dynamometer MMT.
 */

export type Lift = "squat" | "bench" | "deadlift";

export const LIFTS: { value: Lift; label: string }[] = [
  { value: "squat", label: "Squat" },
  { value: "bench", label: "Bench Press" },
  { value: "deadlift", label: "Deadlift" },
];

export type Sex = "male" | "female";

export const SEXES: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export type StrengthLevel = "untrained" | "novice" | "intermediate" | "advanced" | "elite";

export const STRENGTH_LEVELS: StrengthLevel[] = ["untrained", "novice", "intermediate", "advanced", "elite"];

export const STRENGTH_LEVEL_LABELS: Record<StrengthLevel, string> = {
  untrained: "Untrained",
  novice: "Novice",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
};

// Estimated-1RM ÷ bodyweight thresholds a lifter must reach to be classified at that level —
// see this file's own top-of-file comment on where these come from.
const RATIO_STANDARDS: Record<Lift, Record<Sex, Record<StrengthLevel, number>>> = {
  squat: {
    male: { untrained: 0.5, novice: 0.75, intermediate: 1.25, advanced: 1.75, elite: 2.5 },
    female: { untrained: 0.5, novice: 0.65, intermediate: 0.9, advanced: 1.25, elite: 1.75 },
  },
  bench: {
    male: { untrained: 0.25, novice: 0.5, intermediate: 0.75, advanced: 1.25, elite: 1.75 },
    female: { untrained: 0.2, novice: 0.35, intermediate: 0.5, advanced: 0.75, elite: 1.0 },
  },
  deadlift: {
    male: { untrained: 0.75, novice: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.75 },
    female: { untrained: 0.6, novice: 0.85, intermediate: 1.15, advanced: 1.6, elite: 2.0 },
  },
};

/** Brzycki formula (weight × 36 ÷ (37 − reps)) — the standard way to project a 1-rep max from
 *  a submaximal-rep set, accurate up to roughly 10 reps and most reliable at the low rep
 *  counts (like 3) this card is built around. */
export function estimateOneRepMax(weightLbs: number, reps: number): number {
  return weightLbs * (36 / (37 - reps));
}

export interface StrengthClassification {
  level: StrengthLevel;
  ratio: number;
  nextLevel: StrengthLevel | null;
  lbsToNextLevel: number | null;
}

/** Classifies an estimated 1RM against the bodyweight-relative standards above. Ratio is
 *  compared against each level's threshold from the top down implicitly by scanning
 *  ascending and keeping the last (highest) one met — a ratio below every threshold still
 *  returns "untrained" as the floor rather than null, since every lifter is somewhere on the
 *  scale. */
export function classifyStrengthLevel(lift: Lift, sex: Sex, oneRepMaxLbs: number, bodyweightLbs: number): StrengthClassification {
  const ratio = bodyweightLbs > 0 ? oneRepMaxLbs / bodyweightLbs : 0;
  const thresholds = RATIO_STANDARDS[lift][sex];

  let level: StrengthLevel = "untrained";
  for (const candidate of STRENGTH_LEVELS) {
    if (ratio >= thresholds[candidate]) level = candidate;
  }

  const levelIndex = STRENGTH_LEVELS.indexOf(level);
  const nextLevel = levelIndex < STRENGTH_LEVELS.length - 1 ? STRENGTH_LEVELS[levelIndex + 1] : null;
  const lbsToNextLevel = nextLevel ? Math.max(0, Math.round(thresholds[nextLevel] * bodyweightLbs - oneRepMaxLbs)) : null;

  return { level, ratio, nextLevel, lbsToNextLevel };
}
