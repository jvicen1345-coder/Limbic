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

/** Macro split (% of daily calories from protein/carb/fat) per wellness goal — general
 *  guideline ranges, not personalized. */
const GOAL_MACRO_SPLIT: Record<WellnessGoal, { protein: number; carb: number; fat: number }> = {
  "General Health": { protein: 0.3, carb: 0.4, fat: 0.3 },
  "Weight Management": { protein: 0.35, carb: 0.35, fat: 0.3 },
  "Build Strength": { protein: 0.3, carb: 0.45, fat: 0.25 },
  "Improve Flexibility": { protein: 0.25, carb: 0.45, fat: 0.3 },
  "Stress Reduction": { protein: 0.25, carb: 0.45, fat: 0.3 },
};

export interface MacroResult {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

export function calculateMacros(input: {
  weightLbs: number;
  heightInches: number;
  age: number;
  sex: MacroSex;
  activityLevel: MacroActivityLevel;
  goal: WellnessGoal;
}): MacroResult {
  const bmr = calculateBmr(input);
  const calories = calculateTdee(bmr, input.activityLevel);
  const split = GOAL_MACRO_SPLIT[input.goal];
  return {
    calories: Math.round(calories),
    proteinGrams: Math.round((calories * split.protein) / 4),
    carbGrams: Math.round((calories * split.carb) / 4),
    fatGrams: Math.round((calories * split.fat) / 9),
    proteinPct: Math.round(split.protein * 100),
    carbPct: Math.round(split.carb * 100),
    fatPct: Math.round(split.fat * 100),
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
