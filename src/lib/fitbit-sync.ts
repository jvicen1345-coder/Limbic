import "server-only";
import { prisma } from "@/lib/db";
import { refreshFitbitToken } from "@/lib/fitbit-oauth";
import { mapActivityNameToCategory, upsertSyncedVitalsLog, type SyncedActivityEntry } from "@/lib/fitness-sync";
import type { VitalsCategory } from "@/lib/vitals";

const SYNC_WINDOW_DAYS = 7;

interface FitbitActivitiesDayResponse {
  activities?: { name: string; duration: number }[]; // duration in milliseconds
}

function isoDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Pulls the last week of logged exercises for one connected Fitbit account and upserts
 *  them into the Activity Log — refreshes the access token first if it's expired or about
 *  to be (Fitbit access tokens are short-lived, ~8h). Called from the daily cron (see
 *  app/api/cron/sync-fitness-trackers/route.ts) and from the "Sync now" button
 *  (app/actions/fitness-connections.ts). Re-syncing the same week is safe: each day's
 *  category total is replaced in place, not accumulated (see upsertSyncedVitalsLog). */
export async function syncFitbitForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId, provider: "fitbit" } } });
  if (!connection) return { error: "Fitbit is not connected" };

  let accessToken = connection.accessToken;
  if (connection.expiresAt.getTime() < Date.now() + 60_000) {
    try {
      const refreshed = await refreshFitbitToken(connection.refreshToken);
      accessToken = refreshed.accessToken;
      await prisma.fitnessConnection.update({
        where: { id: connection.id },
        data: { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken, expiresAt: refreshed.expiresAt },
      });
    } catch (err) {
      console.error("[fitbit-sync] token refresh failed", err);
      return { error: "Fitbit connection expired, reconnect it" };
    }
  }

  let synced = 0;
  for (let daysAgo = 0; daysAgo < SYNC_WINDOW_DAYS; daysAgo++) {
    const date = isoDateNDaysAgo(daysAgo);
    const res = await fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) continue; // Skip a bad day rather than aborting the whole week's sync.
    const data = (await res.json()) as FitbitActivitiesDayResponse;
    const activities = data.activities ?? [];
    if (activities.length === 0) continue;

    const byCategory = new Map<VitalsCategory, { minutes: number; names: string[] }>();
    for (const activity of activities) {
      const category = mapActivityNameToCategory(activity.name);
      const minutes = Math.round(activity.duration / 60000);
      if (minutes <= 0) continue;
      const bucket = byCategory.get(category) ?? { minutes: 0, names: [] };
      bucket.minutes += minutes;
      bucket.names.push(activity.name);
      byCategory.set(category, bucket);
    }

    for (const [category, bucket] of byCategory) {
      const entry: SyncedActivityEntry = {
        date,
        category,
        minutes: bucket.minutes,
        activity: bucket.names.length <= 2 ? bucket.names.join(", ") : `${bucket.names.length} activities`,
      };
      await upsertSyncedVitalsLog(userId, "fitbit", entry);
      synced += 1;
    }
  }

  await prisma.fitnessConnection.update({ where: { id: connection.id }, data: { lastSyncedAt: new Date() } });
  return { synced };
}
