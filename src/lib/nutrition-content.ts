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
      "Protein supports muscle repair and recovery; many active adults aim for a source of protein at most meals. Carbohydrates are the body's primary fuel for exercise, especially higher-intensity training. Fats support hormone production and longer-duration energy. A general balance of all three, rather than cutting out any one, tends to serve active people well.",
  },
  {
    title: "Pre- and post-workout nutrition",
    body:
      "A light meal or snack pairing carbohydrates with a little protein roughly 1–3 hours before activity can help provide steady energy. Afterward, eating within a couple of hours, again pairing protein with carbohydrates, supports recovery. Staying hydrated before and after matters as much as what's eaten.",
  },
  {
    title: "Anti-inflammatory foods",
    body:
      "Colorful fruits and vegetables, fatty fish, nuts, olive oil, and whole grains are commonly grouped together in general nutrition guidance as anti-inflammatory choices. Highly processed foods and added sugars are often grouped the other way. This is general dietary pattern information, not a treatment for any condition.",
  },
  {
    title: "Recovery nutrition",
    body:
      "On rest days, eating patterns don't need to change dramatically; continuing to eat regularly, with enough protein and micronutrient-rich foods, supports the same recovery processes as active days. Sleep plays a major role too, and a heavy meal too close to bedtime can interfere with sleep quality for some people.",
  },
];

/** Wellness+ (LimbicPro) — goal-specific general guidance, keyed off VitalsProfile's
 *  wellnessGoal. Three short bullets per goal (not a paragraph) so /wellness/nutrition's
 *  "Personalized for Your Goal" card can render them as a scannable list rather than a
 *  block of text — all still general wellness information, same as the free sections
 *  above, just narrowed to the reader's stated goal. */
export const NUTRITION_GOAL_TIPS: Record<WellnessGoal, string[]> = {
  "General Health": ["Balanced whole foods", "Regular meal timing", "Adequate hydration"],
  "Weight Management": ["Mindful portion awareness", "Regular meal timing", "Staying hydrated before meals"],
  "Build Strength": ["Protein at every meal", "Post-workout nutrition within 2 hours", "Consistent meal timing"],
  "Improve Flexibility": ["Anti-inflammatory food patterns", "Adequate hydration", "Omega-3 rich foods"],
  "Stress Reduction": [
    "Magnesium-rich foods: leafy greens, nuts",
    "Limiting caffeine after noon",
    "Regular meal timing for stable energy",
  ],
};

/** The Wellness overview's rotating "tip of the day" preview card, and
 *  /wellness/nutrition's "Nutrition of the Day" card — deterministic by calendar day, same
 *  idea as lib/wordle-words.ts's word-of-the-day (one tip per day, not random on every
 *  load, same tip for every reader that day). */
export const NUTRITION_DAILY_TIPS: string[] = [
  "Pairing protein with carbs after a workout supports recovery; even a simple snack works.",
  "A good rule of thumb: drink water before you feel thirsty, especially on active days.",
  "Colorful produce at most meals is a simple way to cover a wide range of nutrients.",
  "Rest days still deserve regular meals; recovery is still active work for your body.",
  "A light pre-workout snack with some carbohydrate can help provide steadier energy.",
  "Whole grains, nuts, and fatty fish are commonly grouped as anti-inflammatory choices.",
  "Spreading protein across meals, rather than one big serving, is a common general approach.",
  "Eating within 2 hours post-workout helps replenish glycogen stores and supports muscle recovery.",
  "Colorful fruits and vegetables provide a wide range of antioxidants that support general health.",
  "Staying hydrated before you feel thirsty helps maintain consistent energy during activity.",
  "A palm-sized portion of protein at each meal is a simple general guideline for active adults.",
  "Whole grains provide sustained energy compared to refined carbohydrates for longer activities.",
  "Healthy fats from sources like nuts, olive oil, and fatty fish support hormone production.",
  "Sleep quality affects appetite regulation; consistent sleep supports healthy eating patterns.",
  "Meal timing matters; eating regularly throughout the day helps maintain steady energy levels.",
];

export function nutritionTipForDate(dateKey: string): string {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (Math.imul(h, 31) + dateKey.charCodeAt(i)) >>> 0;
  return NUTRITION_DAILY_TIPS[h % NUTRITION_DAILY_TIPS.length];
}

/** /wellness/nutrition's "Quick Tips" pill row — short, scannable, one per general
 *  category. `kind` drives the pill's left dot color (see .nutrition-quicktip-dot-* in
 *  globals.css), reusing the same literal hues Limbic Vitals already assigns to
 *  strength/mobility/mindfulness rather than inventing new ones. */
export type QuickTipKind = "hydration" | "energy" | "recovery" | "sleep";

export interface QuickTip {
  kind: QuickTipKind;
  text: string;
}

export const NUTRITION_QUICK_TIPS: QuickTip[] = [
  { kind: "hydration", text: "Drink water before you feel thirsty" },
  { kind: "energy", text: "Carbs before, protein after workouts" },
  { kind: "recovery", text: "Colorful plate supports recovery" },
  { kind: "sleep", text: "Sleep supports appetite regulation" },
];

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
