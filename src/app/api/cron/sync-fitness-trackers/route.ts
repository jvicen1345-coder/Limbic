import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncFitbitForUser } from "@/lib/fitbit-sync";
import { syncStravaForUser } from "@/lib/strava-sync";

/**
 * Runs syncFitbitForUser/syncStravaForUser for every connected FitnessConnection — see the
 * "crons" entry in vercel.json, which hits this daily. Same "scheduled job, no signed-in
 * user" auth pattern as app/api/cron/refresh-interest-profiles/route.ts. Errors on one
 * account (an expired connection needing reconnect, a flaky upstream call) are logged and
 * skipped rather than aborting the whole run, so one broken connection doesn't block
 * everyone else's daily sync.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connections = await prisma.fitnessConnection.findMany({ select: { userId: true, provider: true } });
  let synced = 0;
  let failed = 0;
  for (const { userId, provider } of connections) {
    try {
      const result = provider === "fitbit" ? await syncFitbitForUser(userId) : await syncStravaForUser(userId);
      if ("error" in result) failed++;
      else synced++;
    } catch (err) {
      console.error(`[cron/sync-fitness-trackers] ${provider} sync failed for user ${userId}`, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, accounts: connections.length, synced, failed });
}
