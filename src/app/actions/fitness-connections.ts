"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revokeGoogleHealthToken } from "@/lib/google-health-oauth";
import { deauthorizeStrava } from "@/lib/strava-oauth";
import { syncFitbitForUser } from "@/lib/fitbit-sync";
import { syncStravaForUser } from "@/lib/strava-sync";
import { syncGoogleHealthMetricsForUser } from "@/lib/google-health-metrics-sync";

type Provider = "fitbit" | "strava";

/** "Sync now" button on either tracker's card (see components/vitals/TrackerConnectCard.tsx)
 *  — the daily cron (app/api/cron/sync-fitness-trackers/route.ts) does this same pull on a
 *  schedule, this just lets the reader trigger it on demand instead of waiting. Google
 *  Health additionally runs its body-metrics/vitals sync alongside the exercise sync (see
 *  lib/google-health-metrics-sync.ts) — Strava has no equivalent, it's exercise-only. */
export async function syncFitnessConnectionAction(provider: Provider): Promise<{ synced: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in" };

  if (provider === "fitbit") {
    const [exerciseResult, metricsResult] = await Promise.all([syncFitbitForUser(user.id), syncGoogleHealthMetricsForUser(user.id)]);
    revalidatePath("/wellness/activity");
    revalidatePath("/wellness/metrics");
    revalidatePath("/wellness");
    if ("error" in exerciseResult) return exerciseResult;
    const metricsSynced = "synced" in metricsResult ? metricsResult.synced : 0;
    return { synced: exerciseResult.synced + metricsSynced };
  }

  const result = await syncStravaForUser(user.id);
  revalidatePath("/wellness/activity");
  return result;
}

export async function disconnectFitnessConnectionAction(provider: Provider): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const connection = await prisma.fitnessConnection.findUnique({ where: { userId_provider: { userId: user.id, provider } } });
  if (!connection) return;

  if (provider === "fitbit") {
    await revokeGoogleHealthToken(connection.accessToken);
  } else {
    await deauthorizeStrava(connection.accessToken);
  }
  await prisma.fitnessConnection.delete({ where: { id: connection.id } });
  revalidatePath("/wellness/activity");
}
