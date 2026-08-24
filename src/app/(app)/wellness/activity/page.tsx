import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { dateToLocalIso } from "@/lib/limbic-calendar";
import { generateInsights, startOfWeekLocal, summarizeWeek, type VitalsLogEntry } from "@/lib/vitals";
import { WellnessDisclaimer } from "@/components/vitals/WellnessDisclaimer";
import { WeeklyActivityChart } from "@/components/vitals/WeeklyActivityChart";
import { LogActivityForm } from "@/components/vitals/LogActivityForm";
import { InsightsCard } from "@/components/vitals/InsightsCard";
import { AppleHealthUploadCard } from "@/components/vitals/AppleHealthUploadCard";
import { TrackerConnectCard } from "@/components/vitals/TrackerConnectCard";
import { googleHealthEnabled as fitbitEnabled } from "@/lib/google-health-oauth";
import { stravaEnabled } from "@/lib/strava-oauth";

/** The exercise-input page — weekly cardio/strength/mobility/mindfulness logging, split
 *  out from Metrics (which is now pure calculators, see app/(app)/wellness/metrics/page.tsx)
 *  so each Explore card is either an input surface or a reference/calculator surface, not
 *  both. Body Metrics (age/height/weight/sex/activity/goal) lives on Metrics instead, the
 *  calculators there are what actually read it, so entering it happens right next to them. */
export default async function ActivityLogPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const thisWeekStart = startOfWeekLocal(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const thisWeekStartIso = dateToLocalIso(thisWeekStart);
  const lastWeekStartIso = dateToLocalIso(lastWeekStart);

  const logRows = await prisma.vitalsLog.findMany({ where: { userId: user.id, date: { gte: lastWeekStart } }, orderBy: { createdAt: "desc" } });
  const fitnessConnections = await prisma.fitnessConnection.findMany({ where: { userId: user.id } });
  const fitbitConnection = fitnessConnections.find((c) => c.provider === "fitbit") ?? null;
  const stravaConnection = fitnessConnections.find((c) => c.provider === "strava") ?? null;

  const logs: VitalsLogEntry[] = logRows.map((r) => ({
    id: r.id,
    date: dateToLocalIso(r.date),
    category: r.category as VitalsLogEntry["category"],
    minutes: r.minutes,
    activity: r.activity,
    notes: r.notes,
    source: r.source,
    createdAtMs: r.createdAt.getTime(),
  }));

  const thisWeek = summarizeWeek(logs, thisWeekStartIso);
  const lastWeek = summarizeWeek(logs, lastWeekStartIso);
  const insights = generateInsights(thisWeek, lastWeek);
  const recentLogs = [...logs].sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 5);

  return (
    <div className="screen-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Activity Log</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Track your own general wellness activity, week to week.
      </p>
      <WellnessDisclaimer />

      <TrackerConnectCard
        fitbit={{
          enabled: fitbitEnabled(),
          connected: !!fitbitConnection,
          lastSynced: fitbitConnection?.lastSyncedAt
            ? fitbitConnection.lastSyncedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : null,
        }}
        strava={{
          enabled: stravaEnabled(),
          connected: !!stravaConnection,
          lastSynced: stravaConnection?.lastSyncedAt
            ? stravaConnection.lastSyncedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : null,
        }}
      />

      <AppleHealthUploadCard />

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">This week&rsquo;s activity</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Monday through Sunday, last week shown as a faint bar behind this week&rsquo;s.
        </p>
        <WeeklyActivityChart thisWeek={thisWeek} lastWeek={lastWeek} weekStartIso={thisWeekStartIso} />
      </div>

      <LogActivityForm recentLogs={recentLogs} />

      <InsightsCard insights={insights} />
    </div>
  );
}
