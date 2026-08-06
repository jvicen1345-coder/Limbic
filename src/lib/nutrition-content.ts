/** Static content for /wellness/nutrition and the Wellness overview's "tip of the day"
 *  preview card. All general wellness information — no condition-specific claims, no
 *  medical advice (see components/vitals/WellnessDisclaimer.tsx, shown on the page this
 *  content lives on). */
import type { WellnessGoal } from "@/lib/vitals";

export interface NutritionSection {
  title: string;
  body: string;
}

export const NUTRITION_SECTIONS: NutritionSection[] = [
  {
    title: "Hydration",
    body:
      "A commonly cited general guideline is roughly half your body weight in ounces of water a day, with more on days with longer or more intense activity. A sedentary day may need less; a very active day often calls for extra water before, during, and after exercise to help replace what's lost through sweat.",
  },
  {
    title: "Macronutrients",
    body:
      "Protein supports muscle repair and recovery — many active adults aim for a source of protein at most meals. Carbohydrates are the body's primary fuel for exercise, especially higher-intensity training. Fats support hormone production and longer-duration energy. A general balance of all three, rather than cutting out any one, tends to serve active people well.",
  },
  {
    title: "Pre- and post-workout nutrition",
    body:
      "A light meal or snack pairing carbohydrates with a little protein roughly 1–3 hours before activity can help provide steady energy. Afterward, eating within a couple of hours — again pairing protein with carbohydrates — supports recovery. Staying hydrated before and after matters as much as what's eaten.",
  },
  {
    title: "Anti-inflammatory foods",
    body:
      "Colorful fruits and vegetables, fatty fish, nuts, olive oil, and whole grains are commonly grouped together in general nutrition guidance as anti-inflammatory choices. Highly processed foods and added sugars are often grouped the other way. This is general dietary pattern information, not a treatment for any condition.",
  },
  {
    title: "Recovery nutrition",
    body:
      "On rest days, eating patterns don't need to change dramatically — continuing to eat regularly, with enough protein and micronutrient-rich foods, supports the same recovery processes as active days. Sleep plays a major role too, and a heavy meal too close to bedtime can interfere with sleep quality for some people.",
  },
];

/** Wellness+ (LimbicPro) — goal-specific general guidance, keyed off VitalsProfile's
 *  wellnessGoal. All framed as general wellness information, same as the free sections
 *  above, just narrowed to the reader's stated goal. */
export const NUTRITION_GOAL_TIPS: Record<WellnessGoal, string> = {
  "General Health":
    "Balanced eating, general overview: a wide variety of whole foods, regular meal timing, and adequate hydration form the foundation of most general wellness nutrition guidance, regardless of specific goals.",
  "Weight Management":
    "General caloric awareness: tracking roughly what you eat for a week or two, without judgment, is a simple way to understand your current eating patterns before making changes. Small, sustainable adjustments tend to stick better than large, sudden ones.",
  "Build Strength":
    "General protein timing guidance: spreading protein intake across 3–4 meals a day, rather than one large serving, is a commonly cited general approach for supporting muscle-building goals alongside resistance training.",
  "Improve Flexibility":
    "General hydration and anti-inflammatory tips: well-hydrated tissue tends to move more comfortably, and anti-inflammatory foods are often paired with mobility-focused routines as a general wellness combination.",
  "Stress Reduction":
    "General magnesium and omega-3 awareness: foods like leafy greens, nuts, seeds, and fatty fish are commonly discussed in general wellness contexts around relaxation and stress. This is general dietary information, not a treatment recommendation.",
};

/** The Wellness overview's rotating "tip of the day" preview card — deterministic by
 *  calendar day, same idea as lib/wordle-words.ts's word-of-the-day (one tip per day, not
 *  random on every load). */
export const NUTRITION_DAILY_TIPS: string[] = [
  "Pairing protein with carbs after a workout supports recovery — even a simple snack works.",
  "A good rule of thumb: drink water before you feel thirsty, especially on active days.",
  "Colorful produce at most meals is a simple way to cover a wide range of nutrients.",
  "Rest days still deserve regular meals — recovery is still active work for your body.",
  "A light pre-workout snack with some carbohydrate can help provide steadier energy.",
  "Whole grains, nuts, and fatty fish are commonly grouped as anti-inflammatory choices.",
  "Spreading protein across meals, rather than one big serving, is a common general approach.",
];

export function nutritionTipForDate(dateKey: string): string {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (Math.imul(h, 31) + dateKey.charCodeAt(i)) >>> 0;
  return NUTRITION_DAILY_TIPS[h % NUTRITION_DAILY_TIPS.length];
}

/** Live-sourced wellness articles carry no topic tags (see lib/news-live.ts
 *  fetchLiveWellness), so "general nutrition articles" for the bottom of the Nutrition
 *  page is a keyword match on title/summary — same "classify by keyword" heuristic this
 *  app already uses elsewhere for untagged content (see lib/limbic-calendar.ts
 *  isEventPost). */
const NUTRITION_KEYWORDS = ["nutrition", "diet", "food", "eating", "protein", "hydration", "meal", "vitamin", "recipe"];

export function isNutritionArticle(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return NUTRITION_KEYWORDS.some((kw) => text.includes(kw));
}
