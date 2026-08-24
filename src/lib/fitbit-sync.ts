import "server-only";
import { prisma } from "@/lib/db";
import { refreshGoogleHealthToken } from "@/lib/google-health-oauth";
import {
  mapActivityNameToCategory,
  humanizeActivityName,
  upsertSyncedVitalsLog,
  localDateFromGoogleHealthInterval,
  type SyncedActivityEntry,
  type GoogleHealthInterval,
} from "@/lib/fitness-sync";
import type { VitalsCategory } from "@/lib/vitals";
import type { FitnessConnection } from "@/generated/prisma/client";

const SYNC_WINDOW_DAYS = 7;

/** Shared by this file's exercise sync and lib/google-health-metrics-sync.ts's vitals sync —
 *  both hit the same Google OAuth2 client/tokens, just different dataTypes underneath, so
 *  the "refresh if expiring, persist the new pair" logic only needs to live once. Throws if
 *  the refresh itself fails, same as the exercise sync's original behavior. */
export async function getValidGoogleHealthAccessToken(
  connection: Pick<FitnessConnection, "id" | "accessToken" | "refreshToken" | "expiresAt">
): Promise<string> {
  if (connection.expiresAt.getTime() >= Date.now() + 60_000) return connection.accessToken;
  const refreshed = await refreshGoogleHealthToken(connection.refreshToken);
  await prisma.fitnessConnection.update({
    where: { id: connection.id },
    data: { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, expiresAt: refreshed.expiresAt },
  });
  return refreshed.accessToken;
}

interface GoogleHealthExerciseDataPoint {
  exercise?: {
    exerciseType?: string;
    interval?: GoogleHealthInterval;
  };
}

interface GoogleHealthDataPointsResponse {
  dataPoints?: GoogleHealthExerciseDataPoint[];
}

/** Pulls the last week of exercise sessions for one connected Google Health account and
 *  upserts them into the Activity Log — refreshes the access token first if it's expired
 *  or about to be. Called from the daily cron (see app/api/cron/sync-fitness-trackers/
 *  route.ts) and from the "Sync now" button (app/actions/fitness-connections.ts).
 *  Re-syncing the same week is safe: each day's category total is replaced in place, not
 *  accumulated (see upsertSyncedVitalsLog). See lib/google-health-oauth.ts for why this
 *  targets health.googleapis.com rather than Fitbit's own (now-deprecated) Web API. */
export async function syncFitbitForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Fitbit is not connected" };

  let accessToken: string;
  try {
    accessToken = await getValidGoogleHealthAccessToken(connection);
  } catch (err) {
    console.error("[fitbit-sync] token refresh failed", err);
    return { error: "Fitbit connection expired, reconnect it" };
  }

  const since = new Date(Date.now() - SYNC_WINDOW_DAYS * 86400000).toISOString().slice(0, 19);
  const params = new URLSearchParams({ filter: `exercise.interval.civil_start_time >= "${since}"` });
  const res = await fetch(`https://health.googleapis.com/v4/users/me/dataTypes/exercise/dataPoints?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[fitbit-sync] exercise fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return { error: "Could not reach Google Health" };
  }
  const data = (await res.json()) as GoogleHealthDataPointsResponse;

  const byDayCategory = new Map<string, { minutes: number; names: string[] }>();
  for (const point of data.dataPoints ?? []) {
    const exercise = point.exercise;
    if (!exercise?.exerciseType || !exercise.interval) continue;
    const date = localDateFromGoogleHealthInterval(exercise.interval);
    if (!date) continue;

    const start = Date.parse(exercise.interval.startTime);
    const end = Date.parse(exercise.interval.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const minutes = Math.round((end - start) / 60000);
    if (minutes <= 0) continue;

    const category: VitalsCategory = mapActivityNameToCategory(exercise.exerciseType);
    const key = `${date}|${category}`;
    const bucket = byDayCategory.get(key) ?? { minutes: 0, names: [] };
    bucket.minutes += minutes;
    bucket.names.push(humanizeActivityName(exercise.exerciseType));
    byDayCategory.set(key, bucket);
  }

  let synced = 0;
  for (const [key, bucket] of byDayCategory) {
    const [date, category] = key.split("|") as [string, VitalsCategory];
    const entry: SyncedActivityEntry = {
      date,
      category,
      minutes: bucket.minutes,
      activity: bucket.names.length <= 2 ? bucket.names.join(", ") : `${bucket.names.length} activities`,
    };
    await upsertSyncedVitalsLog(userId, "fitbit", entry);
    synced += 1;
  }

  await prisma.fitnessConnection.update({ where: { id: connection.id }, data: { lastSyncedAt: new Date() } });
  return { synced };
}
