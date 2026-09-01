/** Reference data + math for the Clinician Dashboard's 3-Rep-Max card (ThreeRepMaxCard.tsx,
 *  app/actions/three-rep-max.ts). Three things live here on purpose:
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
 *  3. AGE_ADJUSTMENT — a rough multiplier on the standards above so "compare to similar age
 *     ranges" means something: strength commonly peaks in the 18-29 bracket and gradually
 *     declines afterward. This is a general population trend, not a separate age-stratified
 *     study of the "18-29" table above — every bracket still classifies on the same
 *     Untrained..Elite ladder, just against thresholds scaled down for what's typical at
 *     that age, loosely consistent with commonly cited aggregate strength declines of
 *     roughly 8-15% per decade starting in the 40s.
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

export interface AgeBracket {
  min: number;
  max: number;
  label: string;
}

// Validation bounds for the log-test form/action (see ThreeRepMaxCard.tsx,
// createThreeRepMaxTest in app/actions/three-rep-max.ts) — MIN_AGE matches the youngest age
// AGE_BRACKETS actually covers; MAX_AGE is a generous sanity ceiling, not a real bracket
// boundary (AGE_BRACKETS' own "60+" already has no real upper bound).
export const MIN_AGE = 18;
export const MAX_AGE = 100;

// Every age 18 and up is covered by exactly one bracket — the standards below are adult
// bodyweight-ratio figures, not calibrated for a pediatric/adolescent patient, so the log-test
// form floors age at 18. 60+ has no upper bound in practice, capped here at 130 just so `max`
// is always a real number to compare against.
export const AGE_BRACKETS: AgeBracket[] = [
  { min: 18, max: 29, label: "18–29" },
  { min: 30, max: 39, label: "30–39" },
  { min: 40, max: 49, label: "40–49" },
  { min: 50, max: 59, label: "50–59" },
  { min: 60, max: 130, label: "60+" },
];

export function ageBracketFor(age: number): AgeBracket {
  return AGE_BRACKETS.find((b) => age >= b.min && age <= b.max) ?? AGE_BRACKETS[AGE_BRACKETS.length - 1];
}

// See this file's own top-of-file comment (#3) on where these come from — applied to
// RATIO_STANDARDS' thresholds before classifying, so "Intermediate" means "intermediate for
// that age bracket," not "intermediate for a 25-year-old regardless of who's being tested."
const AGE_ADJUSTMENT: Record<string, number> = {
  "18–29": 1.0,
  "30–39": 0.97,
  "40–49": 0.9,
  "50–59": 0.82,
  "60+": 0.72,
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
  ageBracket: string;
}

/** Classifies an estimated 1RM against the bodyweight-relative standards above, scaled for
 *  the lifter's age bracket (see AGE_ADJUSTMENT) — "compare to similar age ranges" means the
 *  same Untrained..Elite ladder is used for everyone, but the bar for each rung shifts with
 *  age the way the underlying population trend does. Ratio is compared against each level's
 *  (adjusted) threshold from the top down implicitly by scanning ascending and keeping the
 *  last (highest) one met — a ratio below every threshold still returns "untrained" as the
 *  floor rather than null, since every lifter is somewhere on the scale. */
export function classifyStrengthLevel(
  lift: Lift,
  sex: Sex,
  age: number,
  oneRepMaxLbs: number,
  bodyweightLbs: number
): StrengthClassification {
  const ratio = bodyweightLbs > 0 ? oneRepMaxLbs / bodyweightLbs : 0;
  const baseThresholds = RATIO_STANDARDS[lift][sex];
  const bracket = ageBracketFor(age);
  const adjustment = AGE_ADJUSTMENT[bracket.label];

  let level: StrengthLevel = "untrained";
  for (const candidate of STRENGTH_LEVELS) {
    if (ratio >= baseThresholds[candidate] * adjustment) level = candidate;
  }

  const levelIndex = STRENGTH_LEVELS.indexOf(level);
  const nextLevel = levelIndex < STRENGTH_LEVELS.length - 1 ? STRENGTH_LEVELS[levelIndex + 1] : null;
  const lbsToNextLevel = nextLevel
    ? Math.max(0, Math.round(baseThresholds[nextLevel] * adjustment * bodyweightLbs - oneRepMaxLbs))
    : null;

  return { level, ratio, nextLevel, lbsToNextLevel, ageBracket: bracket.label };
}
