import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { dateToLocalIso } from "@/lib/limbic-calendar";
import { generateInsights, startOfWeekLocal, summarizeWeek, type VitalsLogEntry } from "@/lib/vitals";
import { WellnessDisclaimer } from "@/components/vitals/WellnessDisclaimer";
import { BodyMetricsCard } from "@/components/vitals/BodyMetricsCard";
import { WeeklyActivityChart } from "@/components/vitals/WeeklyActivityChart";
import { LogActivityForm } from "@/components/vitals/LogActivityForm";
import { InsightsCard } from "@/components/vitals/InsightsCard";

export default async function VitalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const thisWeekStart = startOfWeekLocal(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const thisWeekStartIso = dateToLocalIso(thisWeekStart);
  const lastWeekStartIso = dateToLocalIso(lastWeekStart);

  const [profile, logRows] = await Promise.all([
    prisma.vitalsProfile.findUnique({ where: { userId: user.id } }),
    prisma.vitalsLog.findMany({ where: { userId: user.id, date: { gte: lastWeekStart } }, orderBy: { createdAt: "desc" } }),
  ]);

  const logs: VitalsLogEntry[] = logRows.map((r) => ({
    id: r.id,
    date: dateToLocalIso(r.date),
    // The category column has no DB-level enum — this cast is safe because
    // logVitalsActivity only ever writes a value checked against VITALS_CATEGORIES.
    category: r.category as VitalsLogEntry["category"],
    minutes: r.minutes,
    activity: r.activity,
    notes: r.notes,
    createdAtMs: r.createdAt.getTime(),
  }));

  const thisWeek = summarizeWeek(logs, thisWeekStartIso);
  const lastWeek = summarizeWeek(logs, lastWeekStartIso);
  const insights = generateInsights(thisWeek, lastWeek);
  const recentLogs = [...logs].sort((a, b) => b.createdAtMs - a.createdAtMs).slice(0, 5);

  return (
    <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Vitals</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Track your own general wellness activity, week to week.
      </p>
      <WellnessDisclaimer />

      <BodyMetricsCard
        initial={{
          age: profile?.age ?? null,
          heightFeet: profile?.heightFeet ?? null,
          heightInches: profile?.heightInches ?? null,
          weightLbs: profile?.weightLbs ?? null,
          biologicalSex: profile?.biologicalSex ?? null,
          activityLevel: profile?.activityLevel ?? null,
          wellnessGoal: profile?.wellnessGoal ?? null,
        }}
      />

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">This week&rsquo;s activity</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Monday through Sunday — last week shown as a faint bar behind this week&rsquo;s.
        </p>
        <WeeklyActivityChart thisWeek={thisWeek} lastWeek={lastWeek} weekStartIso={thisWeekStartIso} />
      </div>

      <LogActivityForm recentLogs={recentLogs} />

      <InsightsCard insights={insights} />
    </div>
  );
}
