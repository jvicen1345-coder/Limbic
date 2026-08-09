/** Numeric scoring thresholds for /wellness/assess's composite "Functional Fitness Score"
 *  — mirrors the same Poor/Fair/Good/Excellent bands already shown in the norms tables in
 *  lib/assessments-static.ts (Journal of Geriatric Physical Therapy for Single Leg Stance,
 *  European Journal of Preventive Cardiology 2012 for Sit and Rise, the ACSM Health Related
 *  Physical Fitness Assessment Manual for Wall Sit), just expressed as numbers instead of
 *  display strings so a combined score can be computed. Kept free of server-only imports,
 *  same convention as lib/metrics.ts, so the client score card can compute directly. */

export type ScoreBand = 1 | 2 | 3 | 4;
export const BAND_LABEL: Record<ScoreBand, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Excellent" };

export type BiologicalSexInput = "male" | "female";

function bandFromThresholds(value: number, fairMin: number, goodMin: number, excellentMin: number): ScoreBand {
  if (value >= excellentMin) return 4;
  if (value >= goodMin) return 3;
  if (value >= fairMin) return 2;
  return 1;
}

/** Single Leg Stance, eyes closed (seconds) — Journal of Geriatric Physical Therapy. */
export function singleLegStanceBand(age: number, seconds: number): ScoreBand {
  if (age < 40) return bandFromThresholds(seconds, 15, 25, 35);
  if (age < 50) return bandFromThresholds(seconds, 12, 20, 30);
  if (age < 60) return bandFromThresholds(seconds, 8, 15, 25);
  return bandFromThresholds(seconds, 4, 10, 20);
}

/** Sit and Rise Test (score out of 10) — European Journal of Preventive Cardiology, 2012. */
export function sitAndRiseBand(score: number): ScoreBand {
  if (score >= 8) return 4;
  if (score >= 6) return 3;
  if (score >= 3.5) return 2;
  return 1;
}

/** Wall Sit Test (seconds) — ACSM Health Related Physical Fitness Assessment Manual. */
export function wallSitBand(age: number, sex: BiologicalSexInput, seconds: number): ScoreBand {
  const male = sex === "male";
  if (age < 40) return male ? bandFromThresholds(seconds, 25, 40, 60) : bandFromThresholds(seconds, 20, 35, 50);
  if (age < 60) return male ? bandFromThresholds(seconds, 20, 30, 45) : bandFromThresholds(seconds, 15, 25, 40);
  return male ? bandFromThresholds(seconds, 10, 20, 30) : bandFromThresholds(seconds, 10, 15, 25);
}

export interface AssessmentScoreInput {
  age: number;
  sex: BiologicalSexInput;
  singleLegStanceSeconds?: number;
  sitAndRiseScore?: number;
  wallSitSeconds?: number;
}

export interface AssessmentScoreResult {
  /** Average of the included tests' 1-4 bands — the headline number, shown as X.X / 4. */
  averageBand: number;
  label: string;
  includedCount: number;
}

/** Returns null when no scoreable test has a value yet — nothing to show. */
export function calculateAssessmentScore(input: AssessmentScoreInput): AssessmentScoreResult | null {
  const bands: ScoreBand[] = [];
  if (input.singleLegStanceSeconds != null) bands.push(singleLegStanceBand(input.age, input.singleLegStanceSeconds));
  if (input.sitAndRiseScore != null) bands.push(sitAndRiseBand(input.sitAndRiseScore));
  if (input.wallSitSeconds != null) bands.push(wallSitBand(input.age, input.sex, input.wallSitSeconds));
  if (bands.length === 0) return null;

  const averageBand = bands.reduce((sum, b) => sum + b, 0) / bands.length;
  const rounded = Math.min(4, Math.max(1, Math.round(averageBand))) as ScoreBand;
  return { averageBand, label: BAND_LABEL[rounded], includedCount: bands.length };
}
