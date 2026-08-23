import "server-only";
import { prisma } from "@/lib/db";
import { refreshStravaToken } from "@/lib/strava-oauth";
import { mapActivityNameToCategory, humanizeActivityName, upsertSyncedVitalsLog, type SyncedActivityEntry } from "@/lib/fitness-sync";
import type { VitalsCategory } from "@/lib/vitals";

const SYNC_WINDOW_DAYS = 7;

interface StravaActivity {
  type: string; // "Run", "Ride", "WeightTraining", "Yoga", etc.
  moving_time: number; // seconds
  start_date_local: string; // ISO, already in the athlete's local time
}

/** Pulls the last week of activities for one connected Strava account and upserts them
 *  into the Activity Log — same refresh-then-pull-then-upsert shape as syncFitbitForUser
 *  in lib/fitbit-sync.ts, see that file's comment for the calling conventions shared by
 *  both. Strava access tokens are shorter-lived (~6h) than Fitbit's. */
export async function syncStravaForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "strava" } } });
  if (!connection) return { error: "Strava is not connected" };

  let accessToken = connection.accessToken;
  if (connection.expiresAt.getTime() < Date.now() + 60_000) {
    try {
      const refreshed = await refreshStravaToken(connection.refreshToken, connection.externalId);
      accessToken = refreshed.accessToken;
      await prisma.fitnessConnection.update({
        where: { id: connection.id },
        data: { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, expiresAt: refreshed.expiresAt },
      });
    } catch (err) {
      console.error("[strava-sync] token refresh failed", err);
      return { error: "Strava connection expired, reconnect it" };
    }
  }

  const after = Math.floor(Date.now() / 1000) - SYNC_WINDOW_DAYS * 86400;
  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[strava-sync] activities fetch failed (${res.status}): ${body.slice(0, 300)}`);
    return { error: "Could not reach Strava" };
  }
  const activities = (await res.json()) as StravaActivity[];

  const byDayCategory = new Map<string, { minutes: number; names: string[] }>();
  for (const activity of activities) {
    const date = activity.start_date_local.slice(0, 10);
    const category: VitalsCategory = mapActivityNameToCategory(activity.type);
    const minutes = Math.round(activity.moving_time / 60);
    if (minutes <= 0) continue;
    const key = `${date}|${category}`;
    const bucket = byDayCategory.get(key) ?? { minutes: 0, names: [] };
    bucket.minutes += minutes;
    bucket.names.push(humanizeActivityName(activity.type));
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
    await upsertSyncedVitalsLog(userId, "strava", entry);
    synced += 1;
  }

  await prisma.fitnessConnection.update({ where: { id: connection.id }, data: { lastSyncedAt: new Date() } });
  return { synced };
}
