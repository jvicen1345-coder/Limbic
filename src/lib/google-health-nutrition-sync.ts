import "server-only";
import { prisma } from "@/lib/db";
import { getValidGoogleHealthAccessToken } from "@/lib/fitbit-sync";
import { localDateFromGoogleHealthInterval, type GoogleHealthInterval } from "@/lib/fitness-sync";
import { todayLocalDateStr } from "@/lib/today";
import type { MetricsLogMetric } from "@/lib/metrics";

const SYNC_NOTE = "Synced from Google Health";
/** How many days back to fetch — nutrition-log entries are logged per meal, so unlike the
 *  single-latest-point metrics (weight, HR, ...) this needs every entry within the window,
 *  not just the newest, to sum a given day's total correctly. */
const SYNC_WINDOW_DAYS = 3;

/** One logged food/meal entry — see developers.google.com/health/data-types/nutrition. Each
 *  entry is a single food item, not a daily total, so today's calories/protein/carbs/fat are
 *  the sum of every entry whose interval falls on today's local date (see
 *  localDateFromGoogleHealthInterval). */
interface NutritionLogDataPoint {
  nutritionLog?: {
    interval?: GoogleHealthInterval;
    energy?: { kcal?: number };
    totalCarbohydrate?: { grams?: number };
    totalFat?: { grams?: number };
    nutrients?: { nutrient?: string; quantity?: { grams?: number } }[];
  };
}

function proteinGrams(entry: NutritionLogDataPoint["nutritionLog"]): number {
  const protein = entry?.nutrients?.find((n) => n.nutrient === "PROTEIN");
  return typeof protein?.quantity?.grams === "number" ? protein.quantity.grams : 0;
}

async function upsertSyncedMetricLog(userId: string, metric: MetricsLogMetric, value: number): Promise<void> {
  const startOfToday = new Date(todayLocalDateStr() + "T00:00:00");
  const existing = await prisma.metricsLog.findFirst({
    where: { userId, metric, notes: SYNC_NOTE, loggedAt: { gte: startOfToday } },
  });
  if (existing) {
    await prisma.metricsLog.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.metricsLog.create({ data: { userId, metric, value, notes: SYNC_NOTE } });
  }
}

/** Sums today's logged food entries from a connected Google Health account into four
 *  MetricsLog rows (caloriesConsumed, proteinConsumedG, carbsConsumedG, fatConsumedG) — the
 *  same generic per-day-upsert pattern lib/google-health-metrics-sync.ts already uses for
 *  restingHR/bodyFat/etc, reused here rather than a new table since this is exactly the same
 *  shape (one number, once a day). Shown on /wellness/nutrition alongside the existing
 *  MacroCalculatorCard's calculated targets. Requires the nutrition.readonly scope (see
 *  lib/google-health-oauth.ts) — an account connected before that scope was added simply has
 *  nothing to sum until they reconnect (empty dataPoints, not an error). Called alongside
 *  syncFitbitForUser/syncGoogleHealthMetricsForUser from the same call sites. */
export async function syncGoogleHealthNutritionForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Google Health is not connected" };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleHealthAccessToken(connection);
  } catch (err) {
    console.error("[google-health-nutrition-sync] token refresh failed", err);
    return { error: "Google Health connection expired, reconnect it" };
  }

  const res = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/nutrition-log/dataPoints?pageSize=200`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[google-health-nutrition-sync] nutrition-log fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return { error: "Could not reach Google Health" };
  }
  const data = (await res.json()) as { dataPoints?: NutritionLogDataPoint[] };

  const today = todayLocalDateStr();
  const cutoff = Date.now() - SYNC_WINDOW_DAYS * 86400000;

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let matched = 0;

  for (const point of data.dataPoints ?? []) {
    const entry = point.nutritionLog;
    if (!entry?.interval) continue;
    const startMs = Date.parse(entry.interval.startTime);
    if (Number.isFinite(startMs) && startMs < cutoff) continue; // cheap pre-filter, exact day check below
    const date = localDateFromGoogleHealthInterval(entry.interval);
    if (date !== today) continue;

    matched += 1;
    if (typeof entry.energy?.kcal === "number" && Number.isFinite(entry.energy.kcal) && entry.energy.kcal >= 0) calories += entry.energy.kcal;
    if (typeof entry.totalCarbohydrate?.grams === "number" && Number.isFinite(entry.totalCarbohydrate.grams) && entry.totalCarbohydrate.grams >= 0)
      carbs += entry.totalCarbohydrate.grams;
    if (typeof entry.totalFat?.grams === "number" && Number.isFinite(entry.totalFat.grams) && entry.totalFat.grams >= 0) fat += entry.totalFat.grams;
    protein += proteinGrams(entry);
  }

  if (matched === 0) return { synced: 0 };

  // A day's true total genuinely can be 0 for one macro (e.g. a zero-carb meal) — only
  // calories consumed at all is worth bounds-checking as a sanity guard against a parsing
  // bug silently summing nonsense into a huge number.
  if (calories > 15000) {
    console.error(`[google-health-nutrition-sync] implausible daily calorie total (${calories}) for user ${userId}, skipping write`);
    return { synced: 0 };
  }

  await Promise.all([
    upsertSyncedMetricLog(userId, "caloriesConsumed", Math.round(calories)),
    upsertSyncedMetricLog(userId, "proteinConsumedG", Math.round(protein)),
    upsertSyncedMetricLog(userId, "carbsConsumedG", Math.round(carbs)),
    upsertSyncedMetricLog(userId, "fatConsumedG", Math.round(fat)),
  ]);

  return { synced: 4 };
}
