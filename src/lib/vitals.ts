/** Shared types/helpers for Limbic Vitals (see app/(app)/wellness/metrics/page.tsx,
 *  components/vitals/*, app/actions/vitals.ts) — general wellness tracking, not medical
 *  advice or condition-specific. Kept free of server-only imports so client components can
 *  import from here too, same convention as lib/limbic-calendar.ts. */

export const VITALS_CATEGORIES = ["cardio", "strength", "mobility", "mindfulness"] as const;
export type VitalsCategory = (typeof VITALS_CATEGORIES)[number];

export const VITALS_CATEGORY_LABEL: Record<VitalsCategory, string> = {
  cardio: "Cardio",
  strength: "Strength",
  mobility: "Mobility",
  mindfulness: "Mindfulness",
};

/** Placeholder activity suggestions shown per category on the log form (see spec) — not a
 *  closed list, just examples; the activity name field is free text. */
export const VITALS_CATEGORY_SUGGESTIONS: Record<VitalsCategory, string[]> = {
  cardio: ["Running", "Cycling", "Swimming", "Walking"],
  strength: ["Weight Training", "Resistance Bands", "Bodyweight"],
  mobility: ["Stretching", "Yoga", "Foam Rolling"],
  mindfulness: ["Meditation", "Breathing", "Rest"],
};

export const BIOLOGICAL_SEX_OPTIONS = ["Male", "Female", "Prefer not to say"] as const;
export const ACTIVITY_LEVEL_OPTIONS = ["Sedentary", "Lightly Active", "Active", "Very Active"] as const;
export const WELLNESS_GOAL_OPTIONS = [
  "General Health",
  "Weight Management",
  "Build Strength",
  "Improve Flexibility",
  "Stress Reduction",
] as const;
export type WellnessGoal = (typeof WELLNESS_GOAL_OPTIONS)[number];

/** The single source of personal-profile data (age, body metrics, activity level, goal)
 *  used everywhere it feeds a calculation — BodyMetricsCard on /wellness/activity is the
 *  only place it's *entered*; every calculator card (BMI, Max HR, HRV, VO2 Max, Macro,
 *  the Assess Yourself score) just reads it via this shape instead of collecting its own
 *  copy of the same fields. */
export interface WellnessProfile {
  age: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  biologicalSex: string | null;
  activityLevel: string | null;
  wellnessGoal: string | null;
}

export interface VitalsLogEntry {
  id: string;
  /** Local ISO "YYYY-MM-DD" — the activity's own date, not when it was logged. */
  date: string;
  category: VitalsCategory;
  minutes: number;
  activity: string;
  notes: string | null;
  /** Epoch ms the row was created — used to order the "last 5 logged" list by when the
   *  reader actually logged it, independent of which date they backdated it to. */
  createdAtMs: number;
}

type CategoryMinutes = Record<VitalsCategory, number>;

function emptyCategoryMinutes(): CategoryMinutes {
  return { cardio: 0, strength: 0, mobility: 0, mindfulness: 0 };
}

/** Monday-start week (the spec's "current week Monday through Sunday") — local-clock
 *  based, same convention as every other "today"/"this week" concept in this app (see
 *  lib/today.ts's own note on why: matches the server's wall clock, not UTC). */
export function startOfWeekLocal(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface WeekSummary {
  /** 7 entries, Monday..Sunday. */
  days: CategoryMinutes[];
  totals: CategoryMinutes;
  totalMinutes: number;
  /** Distinct days (of the 7) with at least one minute logged. */
  activeDayCount: number;
}

export function summarizeWeek(logs: VitalsLogEntry[], weekStartIso: string): WeekSummary {
  const days = Array.from({ length: 7 }, () => emptyCategoryMinutes());
  const totals = emptyCategoryMinutes();
  const activeDays = new Set<string>();
  const start = new Date(weekStartIso + "T00:00:00");

  for (const log of logs) {
    const logDate = new Date(log.date + "T00:00:00");
    const dayIndex = Math.round((logDate.getTime() - start.getTime()) / 86400000);
    if (dayIndex < 0 || dayIndex > 6) continue;
    days[dayIndex][log.category] += log.minutes;
    totals[log.category] += log.minutes;
    if (log.minutes > 0) activeDays.add(log.date);
  }

  const totalMinutes = VITALS_CATEGORIES.reduce((sum, c) => sum + totals[c], 0);
  return { days, totals, totalMinutes, activeDayCount: activeDays.size };
}

/** Purely mathematical observations off this week's/last week's totals — no medical
 *  interpretation, just "you did more/less/mostly X" pattern-matching. Capped at 3 per the
 *  spec, with a couple of graceful fallbacks (empty week / no notable pattern). */
export function generateInsights(thisWeek: WeekSummary, lastWeek: WeekSummary): string[] {
  if (thisWeek.totalMinutes === 0) {
    return ["No activity logged yet this week — every minute counts."];
  }

  const insights: string[] = [];
  const byMinutesDesc = [...VITALS_CATEGORIES].sort((a, b) => thisWeek.totals[b] - thisWeek.totals[a]);
  const top = byMinutesDesc[0];
  const lowest = byMinutesDesc[byMinutesDesc.length - 1];

  if (thisWeek.totals[top] >= thisWeek.totalMinutes * 0.5 && thisWeek.totals[lowest] === 0 && top !== lowest) {
    insights.push(
      `You logged mostly ${VITALS_CATEGORY_LABEL[top]} this week — consider adding some ${VITALS_CATEGORY_LABEL[lowest]} work.`
    );
  }

  if (thisWeek.activeDayCount >= 4) {
    insights.push(`Great consistency — you logged activity ${thisWeek.activeDayCount} out of 7 days this week.`);
  }

  let bestIncrease: { category: VitalsCategory; delta: number } | null = null;
  for (const c of VITALS_CATEGORIES) {
    const delta = thisWeek.totals[c] - lastWeek.totals[c];
    if (lastWeek.totals[c] > 0 && delta > 0 && (!bestIncrease || delta > bestIncrease.delta)) {
      bestIncrease = { category: c, delta };
    }
  }
  if (bestIncrease) {
    insights.push(`Your ${VITALS_CATEGORY_LABEL[bestIncrease.category]} minutes are up from last week — keep it up.`);
  }

  if (insights.length === 0) {
    insights.push(`You logged ${thisWeek.totalMinutes} minutes of activity this week.`);
  }

  return insights.slice(0, 3);
}
