/** The Nutrition page's free Macro Calculator (see app/(app)/wellness/nutrition/page.tsx)
 *  and its "Nutrition Sources" section — general population-average estimates, not
 *  personalized medical nutrition therapy (see the calculator's own disclaimer). Kept free
 *  of server-only imports so the client calculator component can compute without a round
 *  trip, same convention as lib/metrics.ts. */
import { ACTIVITY_LEVEL_OPTIONS, WELLNESS_GOAL_OPTIONS, type WellnessGoal } from "@/lib/vitals";

export { ACTIVITY_LEVEL_OPTIONS, WELLNESS_GOAL_OPTIONS };

export type MacroSex = "male" | "female";
export type MacroActivityLevel = (typeof ACTIVITY_LEVEL_OPTIONS)[number];

const ACTIVITY_MULTIPLIERS: Record<MacroActivityLevel, number> = {
  Sedentary: 1.2,
  "Lightly Active": 1.375,
  Active: 1.55,
  "Very Active": 1.725,
};

/** Mifflin-St Jeor equation — the most widely validated BMR formula for general population
 *  use. Source: Mifflin MD, St Jeor ST, et al. Journal of the American Dietetic
 *  Association, 1990. */
export function calculateBmr(input: { weightLbs: number; heightInches: number; age: number; sex: MacroSex }): number {
  const weightKg = input.weightLbs * 0.453592;
  const heightCm = input.heightInches * 2.54;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(bmr: number, activityLevel: MacroActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

// ————————————————————————————————————————————————————————————————————————
// Weight Management — turns a target weight + timeline into a real calorie
// deficit/surplus on top of TDEE, clamped to a generally-considered-safe rate.
// ————————————————————————————————————————————————————————————————————————

/** ~3500 kcal per pound of body weight — the standard (if simplified) rule of thumb for
 *  converting a calorie deficit/surplus into an expected rate of weight change. Real-world
 *  weight change isn't perfectly linear against this (metabolic adaptation, water weight,
 *  body composition all matter), but it's the widely-taught general-guideline conversion,
 *  same "population average, not personalized" framing as the rest of this calculator. */
const CALORIES_PER_LB = 3500;

/** Commonly cited safe-rate ceilings — roughly 2 lb/week loss, 1 lb/week gain — beyond
 *  which a target/timeline combination gets capped rather than honored literally, with the
 *  UI surfacing that the pace was adjusted (see WeightGoalAdjustment.wasClamped). */
const MAX_SAFE_DAILY_DEFICIT = 1000;
const MAX_SAFE_DAILY_SURPLUS = 500;

/** A floor beneath which this calculator won't recommend going regardless of how aggressive
 *  the requested timeline is — an absolute-minimum safety net, not a personalized minimum. */
const MIN_SAFE_CALORIES = 1200;

export interface WeightGoalInput {
  expectedWeightLbs: number;
  timelineWeeks: number;
}

export interface WeightGoalAdjustment {
  adjustedCalories: number;
  /** Positive = deficit (below TDEE), negative = surplus (above TDEE) — after clamping. */
  dailyDelta: number;
  /** The rate this calculator is actually showing, after any safety clamp. Positive = losing. */
  weeklyRateLbs: number;
  /** What the raw target/timeline math asked for, before clamping — used to tell the reader
   *  when and why their number was adjusted. Positive = losing. */
  requestedWeeklyRateLbs: number;
  wasClamped: boolean;
}

export function calculateWeightGoalAdjustment(tdee: number, currentWeightLbs: number, weightGoal: WeightGoalInput): WeightGoalAdjustment {
  const deltaLbs = currentWeightLbs - weightGoal.expectedWeightLbs; // positive = wants to lose
  const weeks = Math.max(1, weightGoal.timelineWeeks);
  const requestedDailyDelta = (deltaLbs * CALORIES_PER_LB) / (weeks * 7); // positive = needs a deficit

  let dailyDelta = requestedDailyDelta;
  if (dailyDelta > MAX_SAFE_DAILY_DEFICIT) dailyDelta = MAX_SAFE_DAILY_DEFICIT;
  if (dailyDelta < -MAX_SAFE_DAILY_SURPLUS) dailyDelta = -MAX_SAFE_DAILY_SURPLUS;
  const rateClamped = dailyDelta !== requestedDailyDelta;

  let adjustedCalories = tdee - dailyDelta;
  const floorClamped = adjustedCalories < MIN_SAFE_CALORIES;
  if (floorClamped) adjustedCalories = MIN_SAFE_CALORIES;
  const actualDailyDelta = tdee - adjustedCalories;

  return {
    adjustedCalories: Math.round(adjustedCalories),
    dailyDelta: Math.round(actualDailyDelta),
    weeklyRateLbs: (actualDailyDelta * 7) / CALORIES_PER_LB,
    requestedWeeklyRateLbs: deltaLbs / weeks,
    wasClamped: rateClamped || floorClamped,
  };
}

// ————————————————————————————————————————————————————————————————————————
// Macro split
// ————————————————————————————————————————————————————————————————————————

/** Protein anchored to bodyweight (grams per lb), not a percentage of calories — a % split
 *  can quietly under- or over-shoot real protein needs depending on total calorie intake
 *  (e.g. a aggressive deficit at a fixed 30% protein can land well below what's needed to
 *  preserve lean mass). General ranges drawn from ISSN/ACSM position stands: ~0.7-1g/lb for
 *  building or preserving muscle, a bit lower where the goal isn't muscle-focused. */
const GOAL_PROTEIN_PER_LB: Record<WellnessGoal, number> = {
  "General Health": 0.7,
  "Weight Management": 1.0, // higher protein helps preserve lean mass in a deficit
  "Build Strength": 1.0,
  "Improve Flexibility": 0.6,
  "Stress Reduction": 0.6,
};

/** Fat as a percentage of total calories — protein is fixed first (above), then fat, then
 *  carbs fill whatever calories remain. */
const GOAL_FAT_PCT: Record<WellnessGoal, number> = {
  "General Health": 0.3,
  "Weight Management": 0.25,
  "Build Strength": 0.25,
  "Improve Flexibility": 0.3,
  "Stress Reduction": 0.3,
};

export interface MacroResult {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  /** Present only when a Weight Management timeline was actually provided and used. */
  weightGoalAdjustment?: WeightGoalAdjustment;
  /** True when the bodyweight-based protein target had to be capped to fit the calorie
   *  budget (see the 40% cap in calculateMacros) — worth a note in the UI since the shown
   *  protein number is then lower than a plain g/lb formula would otherwise suggest. */
  proteinCapped: boolean;
}

export function calculateMacros(input: {
  weightLbs: number;
  heightInches: number;
  age: number;
  sex: MacroSex;
  activityLevel: MacroActivityLevel;
  goal: WellnessGoal;
  /** Only read when goal is "Weight Management" — ignored otherwise. */
  weightGoal?: WeightGoalInput;
}): MacroResult {
  const bmr = calculateBmr(input);
  const tdee = calculateTdee(bmr, input.activityLevel);

  let calories = tdee;
  let weightGoalAdjustment: WeightGoalAdjustment | undefined;
  if (input.goal === "Weight Management" && input.weightGoal) {
    weightGoalAdjustment = calculateWeightGoalAdjustment(tdee, input.weightLbs, input.weightGoal);
    calories = weightGoalAdjustment.adjustedCalories;
  }

  // Protein is bodyweight-anchored (see GOAL_PROTEIN_PER_LB above), but at a heavily
  // clamped-down calorie target (see MIN_SAFE_CALORIES) that fixed gram target can eat an
  // unrealistic share of the whole budget, crowding out carbs and fat almost entirely — a
  // 200g protein target against a 1200-calorie floor is 67% of calories on its own. Capping
  // protein at 40% of calories keeps every macro's percentage sane even at the edges,
  // rather than only ever reading correctly at a typical, unclamped calorie level.
  const uncappedProteinCalories = GOAL_PROTEIN_PER_LB[input.goal] * input.weightLbs * 4;
  const proteinCalories = Math.min(uncappedProteinCalories, calories * 0.4);
  const proteinGrams = Math.round(proteinCalories / 4);
  const fatCalories = calories * GOAL_FAT_PCT[input.goal];
  const fatGrams = Math.round(fatCalories / 9);
  // Floors at 0 rather than going negative — protein and fat together could still exceed
  // total calories at an extreme enough clamp; this keeps the math honest regardless.
  const carbCalories = Math.max(0, calories - proteinCalories - fatCalories);
  const carbGrams = Math.round(carbCalories / 4);

  return {
    calories: Math.round(calories),
    proteinGrams,
    carbGrams,
    fatGrams,
    proteinPct: Math.round((proteinCalories / calories) * 100),
    carbPct: Math.round((carbCalories / calories) * 100),
    fatPct: Math.round((fatCalories / calories) * 100),
    weightGoalAdjustment,
    proteinCapped: proteinCalories < uncappedProteinCalories,
  };
}

export interface NutritionSource {
  title: string;
  description: string;
  url: string;
  domain: string;
}

export const NUTRITION_SOURCES: NutritionSource[] = [
  {
    title: "USDA Dietary Guidelines",
    description: "The federal government's official dietary guidance — evidence-based recommendations on what and how much to eat.",
    url: "https://www.dietaryguidelines.gov",
    domain: "dietaryguidelines.gov",
  },
  {
    title: "ACSM Nutrition and Exercise",
    description: "The American College of Sports Medicine's guidance on fueling exercise and athletic performance.",
    url: "https://www.acsm.org",
    domain: "acsm.org",
  },
  {
    title: "WHO Healthy Diet Fact Sheet",
    description: "The World Health Organization's global reference on what makes up a healthy diet.",
    url: "https://www.who.int",
    domain: "who.int",
  },
  {
    title: "NIH Office of Dietary Supplements",
    description: "Fact sheets on vitamins, minerals, and supplements, grounded in current research.",
    url: "https://ods.od.nih.gov",
    domain: "ods.od.nih.gov",
  },
];
