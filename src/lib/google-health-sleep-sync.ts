import "server-only";
import { prisma } from "@/lib/db";
import { getValidGoogleHealthAccessToken } from "@/lib/fitbit-sync";
import { localDateFromGoogleHealthInterval, type GoogleHealthInterval } from "@/lib/fitness-sync";
import { todayLocalDateStr } from "@/lib/today";
import type { MetricsLogMetric } from "@/lib/metrics";

const SYNC_WINDOW_DAYS = 7;
const SYNC_NOTE = "Synced from Google Health";

/** One overnight sleep session — see developers.google.com/health/data-types/sleep. `date`
 *  on the resulting SleepLog row is the local date the interval *starts* on (the night of,
 *  not the morning woken up — see prisma/schema.prisma's SleepLog comment), since a session
 *  spanning midnight otherwise groups ambiguously. `summary.minutesAsleep` is preferred when
 *  present; if it's ever missing (an unconfirmed field on a sparsely-documented part of this
 *  API — see this file's own defensive fallback below), total time in the interval is used
 *  as a reasonable approximation rather than dropping the night entirely. */
interface SleepDataPoint {
  sleep?: {
    interval?: GoogleHealthInterval;
    summary?: {
      minutesAsleep?: number;
      minutesAwake?: number;
      minutesInSleepPeriod?: number;
    };
  };
}

/** Mirrors minutesAsleep into MetricsLog as hours (one decimal) rather than raw minutes —
 *  purely a display convenience for the Trends chart (see MetricsTrackingSection.tsx's
 *  "Sleep" line); SleepLog itself (see prisma/schema.prisma) stays the precise source of
 *  truth in minutes. */
async function upsertSyncedSleepMetricLog(userId: string, minutesAsleep: number): Promise<void> {
  const startOfToday = new Date(todayLocalDateStr() + "T00:00:00");
  const metric: MetricsLogMetric = "sleepHours";
  const hours = Math.round((minutesAsleep / 60) * 10) / 10;
  const existing = await prisma.metricsLog.findFirst({
    where: { userId, metric, notes: SYNC_NOTE, loggedAt: { gte: startOfToday } },
  });
  if (existing) {
    await prisma.metricsLog.update({ where: { id: existing.id }, data: { value: hours } });
  } else {
    await prisma.metricsLog.create({ data: { userId, metric, value: hours, notes: SYNC_NOTE } });
  }
}

/** Pulls the last week of overnight sleep sessions from a connected Google Health account
 *  into SleepLog (one row per night, upserted in place — see prisma/schema.prisma) and also
 *  mirrors last night's total into a MetricsLog "sleepHours" row so it rides the same
 *  Trends chart every other synced metric already uses (see
 *  components/metrics/MetricsTrackingSection.tsx). Requires the sleep.readonly scope (see
 *  lib/google-health-oauth.ts) — an account connected before that scope was added simply has
 *  nothing to sync until they reconnect. Called alongside syncFitbitForUser/
 *  syncGoogleHealthMetricsForUser from the same call sites. */
export async function syncGoogleHealthSleepForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Google Health is not connected" };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleHealthAccessToken(connection);
  } catch (err) {
    console.error("[google-health-sleep-sync] token refresh failed", err);
    return { error: "Google Health connection expired, reconnect it" };
  }

  const res = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/sleep/dataPoints?pageSize=200`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[google-health-sleep-sync] sleep fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return { error: "Could not reach Google Health" };
  }
  const data = (await res.json()) as { dataPoints?: SleepDataPoint[] };

  const cutoff = Date.now() - SYNC_WINDOW_DAYS * 86400000;
  let synced = 0;
  let latestMinutesAsleep: number | null = null;
  let latestDate = "";

  for (const point of data.dataPoints ?? []) {
    const sleep = point.sleep;
    if (!sleep?.interval) continue;
    const startMs = Date.parse(sleep.interval.startTime);
    const endMs = Date.parse(sleep.interval.endTime);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs || startMs < cutoff) continue;

    const date = localDateFromGoogleHealthInterval(sleep.interval);
    if (!date) continue;

    const minutesInInterval = Math.round((endMs - startMs) / 60000);
    const summaryAsleep = sleep.summary?.minutesAsleep;
    const minutesAsleep =
      typeof summaryAsleep === "number" && Number.isFinite(summaryAsleep) && summaryAsleep > 0 && summaryAsleep <= minutesInInterval
        ? Math.round(summaryAsleep)
        : minutesInInterval;
    // A single night outside this range is either a nap (data type Session doesn't
    // distinguish) or a bad reading — either way not worth showing as "last night's sleep".
    if (minutesAsleep < 30 || minutesAsleep > 960) continue;

    const summaryAwake = sleep.summary?.minutesAwake;
    const minutesAwake = typeof summaryAwake === "number" && Number.isFinite(summaryAwake) && summaryAwake >= 0 ? Math.round(summaryAwake) : undefined;

    await prisma.sleepLog.upsert({
      where: { userId_date: { userId, date: new Date(`${date}T00:00:00`) } },
      create: { userId, date: new Date(`${date}T00:00:00`), minutesAsleep, minutesInBed: minutesInInterval, minutesAwake },
      update: { minutesAsleep, minutesInBed: minutesInInterval, minutesAwake },
    });
    synced += 1;

    if (date > latestDate) {
      latestDate = date;
      latestMinutesAsleep = minutesAsleep;
    }
  }

  // Mirrors the most recent night into MetricsLog's Trends chart, so it rides the same
  // shared line chart every other synced metric already uses.
  if (latestMinutesAsleep != null) {
    await upsertSyncedSleepMetricLog(userId, latestMinutesAsleep);
  }

  return { synced };
}
