import "server-only";
import { prisma } from "@/lib/db";
import { getValidGoogleHealthAccessToken } from "@/lib/fitbit-sync";
import { todayLocalDateStr } from "@/lib/today";
import type { MetricsLogMetric } from "@/lib/metrics";

/** Tags every row this sync writes into MetricsLog, so it can find "today's" synced row to
 *  update in place on a re-sync instead of piling up duplicate points for the same day (a
 *  reader's resting HR/HRV/etc genuinely only needs one point per day here, unlike a
 *  self-timed calculator save which is a deliberate one-off). A manual "Save to my metrics"
 *  from a calculator card never carries this note, so it's never touched by this sync. */
const SYNC_NOTE = "Synced from Google Health";

interface GoogleHealthSampleTime {
  physicalTime?: string; // RFC 3339, UTC
}

interface GoogleHealthGenericDataPoint {
  [key: string]: unknown;
}

/** Fetches every data point Google has for one dataType and returns the single most recent
 *  one by sampleTime (point-in-time metrics) or interval.startTime (interval metrics) — no
 *  server-side date filter, since the exact filter field name for point-in-time dataTypes
 *  (unlike exercise/steps' documented interval.civil_start_time) isn't confirmed, and a
 *  reader's lifetime history for any one of these is small enough that fetching it all and
 *  reducing client-side is the safer bet over guessing wrong and getting a 400. */
async function fetchLatestDataPoint(accessToken: string, dataType: string): Promise<GoogleHealthGenericDataPoint | null> {
  const res = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/${dataType}/dataPoints?pageSize=200`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[google-health-metrics-sync] ${dataType} fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return null;
  }
  const data = (await res.json()) as { dataPoints?: GoogleHealthGenericDataPoint[] };
  const points = data.dataPoints ?? [];
  if (points.length === 0) return null;

  const timeOf = (point: GoogleHealthGenericDataPoint): number => {
    const body = point[dataType.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] as
      | { sampleTime?: GoogleHealthSampleTime; interval?: { startTime?: string } }
      | undefined;
    const iso = body?.sampleTime?.physicalTime ?? body?.interval?.startTime;
    return iso ? Date.parse(iso) : 0;
  };
  return points.reduce((latest, p) => (timeOf(p) > timeOf(latest) ? p : latest));
}

/** Pulls a numeric field out of a data point's dataType-named body, accepting either a
 *  number or a numeric string (the API returns int64 fields, like beatsPerMinute, as
 *  strings) and rejecting anything outside a sane physiological range — a wrong field name
 *  (undefined) or a genuinely bad reading both fail safe here rather than writing garbage. */
function readBoundedNumber(point: GoogleHealthGenericDataPoint | null, camelDataType: string, field: string, min: number, max: number): number | null {
  if (!point) return null;
  const body = point[camelDataType] as Record<string, unknown> | undefined;
  const raw = body?.[field];
  const value = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

/** Age isn't a dataType under dataTypes/{type}/dataPoints like the others — it's a single field
 *  on the separate users/me/profile resource ("The age in years based on the user's birth
 *  date" — the birth date itself isn't exposed, only this derived value), requiring its own
 *  profile.readonly scope (see lib/google-health-oauth.ts). Bounded the same defensive way
 *  as readBoundedNumber: a wrong field name or an implausible value both fail safe (null),
 *  never a bad write. */
async function fetchProfileAge(accessToken: string): Promise<number | null> {
  const res = await fetch("https://health.googleapis.com/v4/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[google-health-metrics-sync] profile fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return null;
  }
  const profile = (await res.json()) as { age?: unknown };
  const age = typeof profile.age === "number" ? profile.age : typeof profile.age === "string" ? Number(profile.age) : NaN;
  if (!Number.isFinite(age) || age < 5 || age > 120) return null;
  return age;
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

/** Pulls age/weight/height/heart-rate/HRV/body-fat/oxygen-saturation/blood-glucose from a
 *  connected Google Health account — age, weight, and height overwrite VitalsProfile (the
 *  same fields BodyMetricsCard's manual form edits, see prisma/schema.prisma's
 *  googleHealthSyncedAt comment for the "whoever wrote last wins" policy), the rest land as
 *  MetricsLog rows the Trends chart and log history already know how to render. Requires the
 *  health_metrics_and_measurements.readonly and profile.readonly scopes (see
 *  lib/google-health-oauth.ts) — an account connected before those scopes were added has
 *  none of this authorized, so every fetch below 403s harmlessly until they reconnect.
 *  Called alongside syncFitbitForUser from the same call sites
 *  (app/actions/fitness-connections.ts, app/api/cron/sync-fitness-trackers/route.ts). */
export async function syncGoogleHealthMetricsForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Google Health is not connected" };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleHealthAccessToken(connection);
  } catch (err) {
    console.error("[google-health-metrics-sync] token refresh failed", err);
    return { error: "Google Health connection expired, reconnect it" };
  }

  let synced = 0;

  const [weightPoint, heightPoint, heartRatePoint, hrvPoint, bodyFatPoint, oxygenPoint, glucosePoint, age] = await Promise.all([
    fetchLatestDataPoint(accessToken, "weight"),
    fetchLatestDataPoint(accessToken, "height"),
    fetchLatestDataPoint(accessToken, "heart-rate"),
    fetchLatestDataPoint(accessToken, "heart-rate-variability"),
    fetchLatestDataPoint(accessToken, "body-fat"),
    fetchLatestDataPoint(accessToken, "oxygen-saturation"),
    fetchLatestDataPoint(accessToken, "blood-glucose"),
    fetchProfileAge(accessToken),
  ]);

  const weightGrams = readBoundedNumber(weightPoint, "weight", "weightGrams", 18000, 320000);
  const heightMeters = readBoundedNumber(heightPoint, "height", "heightMeters", 0.6, 2.5);

  if (weightGrams != null || heightMeters != null || age != null) {
    const weightLbs = weightGrams != null ? weightGrams / 453.59237 : undefined;
    let heightFeet: number | undefined;
    let heightInches: number | undefined;
    if (heightMeters != null) {
      const totalInches = Math.round(heightMeters * 39.3700787);
      heightFeet = Math.floor(totalInches / 12);
      heightInches = totalInches % 12;
    }

    await prisma.vitalsProfile.upsert({
      where: { userId },
      create: { userId, age: age ?? undefined, weightLbs, heightFeet, heightInches, googleHealthSyncedAt: new Date() },
      update: {
        ...(age != null && { age }),
        ...(weightLbs != null && { weightLbs }),
        ...(heightFeet != null && { heightFeet, heightInches }),
        googleHealthSyncedAt: new Date(),
      },
    });
    synced += (weightGrams != null ? 1 : 0) + (heightMeters != null ? 1 : 0) + (age != null ? 1 : 0);
  }

  const readings: [MetricsLogMetric, number | null][] = [
    ["restingHR", readBoundedNumber(heartRatePoint, "heartRate", "beatsPerMinute", 25, 220)],
    ["hrv", readBoundedNumber(hrvPoint, "heartRateVariability", "rootMeanSquareOfSuccessiveDifferencesMilliseconds", 2, 300)],
    ["bodyFat", readBoundedNumber(bodyFatPoint, "bodyFat", "percentage", 2, 70)],
    ["oxygenSaturation", readBoundedNumber(oxygenPoint, "oxygenSaturation", "percentage", 50, 100)],
    ["bloodGlucose", readBoundedNumber(glucosePoint, "bloodGlucose", "bloodGlucoseMgPerDl", 20, 600)],
  ];
  for (const [metric, value] of readings) {
    if (value == null) continue;
    await upsertSyncedMetricLog(userId, metric, value);
    synced += 1;
  }

  return { synced };
}
