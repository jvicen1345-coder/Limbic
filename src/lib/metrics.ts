/** Shared types/formulas for Limbic Metrics (see app/(app)/wellness/metrics/page.tsx,
 *  app/actions/metrics.ts) — pure calculator math and interpretation only, no server-only
 *  imports, same convention as lib/vitals.ts, so client calculator components can import
 *  from here directly and compute results without a round trip. General wellness education
 *  only, never medical advice or diagnosis. */

/** Every value a MetricsLog row's `metric` column can hold — matches the documented union
 *  in prisma/schema.prisma's MetricsLog comment exactly. */
export const METRICS_LOG_METRICS = [
  "bmi",
  "hrv",
  "vo2max",
  "restingHR",
  "maxHR",
  "singleLegStance",
  "sitAndRise",
  "wallSit",
  "shoulderScratch",
  "bodyFat",
  "oxygenSaturation",
  "bloodGlucose",
  "sleepHours",
  "caloriesConsumed",
  "proteinConsumedG",
  "carbsConsumedG",
  "fatConsumedG",
] as const;
export type MetricsLogMetric = (typeof METRICS_LOG_METRICS)[number];

export function isMetricsLogMetric(value: string): value is MetricsLogMetric {
  return (METRICS_LOG_METRICS as readonly string[]).includes(value);
}

// ————————————————————————————————————————————————————————————————————————
// BMI
// ————————————————————————————————————————————————————————————————————————

export type BmiCategory = "Underweight" | "Healthy Weight" | "Overweight" | "Obese";

/** Weight (kg) / height (m)^2 — the standard BMI formula, computed from imperial inputs
 *  since that's what the calculator collects (see spec). */
export function calculateBmi(heightFeet: number, heightInches: number, weightLbs: number): number {
  const totalInches = heightFeet * 12 + heightInches;
  const heightM = totalInches * 0.0254;
  const weightKg = weightLbs * 0.453592;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy Weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/** Where on a 15–40 BMI spectrum bar this value falls, clamped 0–100 — purely for the
 *  visual "colored spectrum bar" the spec calls for. */
export function bmiSpectrumPercent(bmi: number): number {
  const MIN = 15;
  const MAX = 40;
  return Math.max(0, Math.min(100, ((bmi - MIN) / (MAX - MIN)) * 100));
}

// ————————————————————————————————————————————————————————————————————————
// Maximum Heart Rate + training zones
// ————————————————————————————————————————————————————————————————————————

export type MaxHrFormula = "haskell" | "tanaka";

export function calculateMaxHeartRate(age: number, formula: MaxHrFormula = "haskell"): number {
  return formula === "tanaka" ? 208 - 0.7 * age : 220 - age;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  pctLow: number;
  pctHigh: number;
  purpose: string;
}

export const HEART_RATE_ZONES: Omit<HeartRateZone, "zone">[] = [
  { name: "Zone 1", pctLow: 0.5, pctHigh: 0.6, purpose: "Recovery" },
  { name: "Zone 2", pctLow: 0.6, pctHigh: 0.7, purpose: "Aerobic base" },
  { name: "Zone 3", pctLow: 0.7, pctHigh: 0.8, purpose: "Aerobic fitness" },
  { name: "Zone 4", pctLow: 0.8, pctHigh: 0.9, purpose: "Anaerobic threshold" },
  { name: "Zone 5", pctLow: 0.9, pctHigh: 1.0, purpose: "Maximum effort" },
];

export interface HeartRateZoneResult extends HeartRateZone {
  bpmLow: number;
  bpmHigh: number;
}

export function calculateHeartRateZones(maxHr: number): HeartRateZoneResult[] {
  return HEART_RATE_ZONES.map((z, i) => ({
    ...z,
    zone: i + 1,
    bpmLow: Math.round(maxHr * z.pctLow),
    bpmHigh: Math.round(maxHr * z.pctHigh),
  }));
}

// ————————————————————————————————————————————————————————————————————————
// RPE — Borg Scale (6–20)
// ————————————————————————————————————————————————————————————————————————

export interface RpePoint {
  value: number;
  label: string | null;
}

/** The classic Borg 6–20 scale only labels the odd numbers — the even numbers between them
 *  are still valid selections (intensity between two labeled anchors), just unlabeled. */
export const RPE_SCALE: RpePoint[] = [
  { value: 6, label: "No exertion" },
  { value: 7, label: null },
  { value: 8, label: null },
  { value: 9, label: "Very light" },
  { value: 10, label: null },
  { value: 11, label: "Light" },
  { value: 12, label: null },
  { value: 13, label: "Somewhat hard" },
  { value: 14, label: null },
  { value: 15, label: "Hard" },
  { value: 16, label: null },
  { value: 17, label: "Very hard" },
  { value: 18, label: null },
  { value: 19, label: "Extremely hard" },
  { value: 20, label: "Maximal" },
];

export interface RpeInterpretation {
  label: string;
  recommendation: string;
}

export function interpretRpe(value: number): RpeInterpretation {
  if (value <= 8) {
    return {
      label: "Very low intensity",
      recommendation: "This is recovery-zone effort, appropriate for active recovery days or warm-ups, not for building fitness on its own.",
    };
  }
  if (value <= 11) {
    return {
      label: "Light intensity",
      recommendation: "A sustainable, conversational pace, good for base-building aerobic work like Zone 2 cardio.",
    };
  }
  if (value <= 14) {
    return {
      label: "Moderate intensity",
      recommendation: "Breathing is noticeably harder but you could still speak in short sentences, a solid general-fitness training intensity.",
    };
  }
  if (value <= 16) {
    return {
      label: "Hard intensity",
      recommendation: "This is a genuinely challenging effort, appropriate for tempo work or strength training, but not sustainable for long durations.",
    };
  }
  if (value <= 19) {
    return {
      label: "Very hard intensity",
      recommendation: "Near-maximal effort, reserve this for short intervals with adequate recovery between bouts.",
    };
  }
  return {
    label: "Maximal effort",
    recommendation: "All-out effort, only appropriate briefly, and generally not something to sustain or repeat without full recovery.",
  };
}

// ————————————————————————————————————————————————————————————————————————
// HRV — Heart Rate Variability (age-adjusted)
// ————————————————————————————————————————————————————————————————————————

export type HrvCategory = "Poor" | "Fair" | "Good" | "Excellent";

interface HrvBand {
  ageLabel: string;
  minAge: number;
  maxAge: number | null;
  fairMin: number;
  goodMin: number;
  excellentMin: number;
}

export const HRV_BANDS: HrvBand[] = [
  { ageLabel: "20-29", minAge: 20, maxAge: 29, fairMin: 55, goodMin: 65, excellentMin: 75 },
  { ageLabel: "30-39", minAge: 30, maxAge: 39, fairMin: 45, goodMin: 55, excellentMin: 65 },
  { ageLabel: "40-49", minAge: 40, maxAge: 49, fairMin: 35, goodMin: 45, excellentMin: 55 },
  { ageLabel: "50+", minAge: 50, maxAge: null, fairMin: 25, goodMin: 35, excellentMin: 45 },
];

function hrvBandForAge(age: number): HrvBand {
  return HRV_BANDS.find((b) => age >= b.minAge && (b.maxAge === null || age <= b.maxAge)) ?? HRV_BANDS[HRV_BANDS.length - 1];
}

export function hrvCategory(age: number, hrvMs: number): HrvCategory {
  const band = hrvBandForAge(age);
  if (hrvMs >= band.excellentMin) return "Excellent";
  if (hrvMs >= band.goodMin) return "Good";
  if (hrvMs >= band.fairMin) return "Fair";
  return "Poor";
}

// ————————————————————————————————————————————————————————————————————————
// Sub-VO2 Max Estimate — Rockport Walking Test
// ————————————————————————————————————————————————————————————————————————

export type BiologicalSexInput = "male" | "female";

export interface RockportInput {
  weightLbs: number;
  age: number;
  sex: BiologicalSexInput;
  mileTimeMinutes: number; // decimal minutes, e.g. 13.5 for 13:30
  heartRateAfter: number;
}

export function calculateVo2Max(input: RockportInput): number {
  const sexValue = input.sex === "male" ? 1 : 0;
  return (
    132.853 -
    0.0769 * input.weightLbs -
    0.3877 * input.age +
    6.315 * sexValue -
    3.2649 * input.mileTimeMinutes -
    0.1565 * input.heartRateAfter
  );
}

export type Vo2MaxCategory = "Poor" | "Fair" | "Good" | "Excellent" | "Superior";

export function vo2MaxCategory(vo2: number, sex: BiologicalSexInput): Vo2MaxCategory {
  const t = sex === "male" ? { fair: 38, good: 45, excellent: 52, superior: 58 } : { fair: 28, good: 35, excellent: 42, superior: 48 };
  if (vo2 >= t.superior) return "Superior";
  if (vo2 >= t.excellent) return "Excellent";
  if (vo2 >= t.good) return "Good";
  if (vo2 >= t.fair) return "Fair";
  return "Poor";
}

/** Parses an "MM:SS" mile-time string into decimal minutes (e.g. "13:30" -> 13.5); returns
 *  null for anything that doesn't parse, so calculator UIs can validate before computing. */
export function parseMileTime(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes + seconds / 60;
}

// ————————————————————————————————————————————————————————————————————————
// Metrics Over Time — pure-SVG sparkline path, same approach as StockCard's
// sparklinePath (see lib/stock.ts buildStockView) — no charting library.
// ————————————————————————————————————————————————————————————————————————

export function buildSparklinePath(values: number[], width = 220, height = 60): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `M0,${(height / 2).toFixed(1)} L${width},${(height / 2).toFixed(1)}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`);
  return "M" + points.join(" L");
}

export type Trend = "up" | "down" | "stable";

/** Compares the last two values in a chronologically-ordered series — "stable" within a
 *  small tolerance so float noise doesn't flip-flop the arrow. */
export function trendDirection(values: number[]): Trend {
  if (values.length < 2) return "stable";
  const delta = values[values.length - 1] - values[values.length - 2];
  const tolerance = Math.abs(values[values.length - 2]) * 0.01;
  if (delta > tolerance) return "up";
  if (delta < -tolerance) return "down";
  return "stable";
}
