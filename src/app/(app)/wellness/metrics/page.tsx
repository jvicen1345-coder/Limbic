import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { dateToLocalIso } from "@/lib/limbic-calendar";
import { generateInsights, startOfWeekLocal, summarizeWeek, type VitalsLogEntry } from "@/lib/vitals";
import { isMetricsLogMetric } from "@/lib/metrics";
import { BodyMetricsCard } from "@/components/vitals/BodyMetricsCard";
import { WeeklyActivityChart } from "@/components/vitals/WeeklyActivityChart";
import { LogActivityForm } from "@/components/vitals/LogActivityForm";
import { InsightsCard } from "@/components/vitals/InsightsCard";
import { BmiCalculatorCard } from "@/components/metrics/BmiCalculatorCard";
import { MaxHeartRateCalculatorCard } from "@/components/metrics/MaxHeartRateCalculatorCard";
import { RpeScaleCard } from "@/components/metrics/RpeScaleCard";
import { HrvCalculatorCard } from "@/components/metrics/HrvCalculatorCard";
import { Vo2MaxCalculatorCard } from "@/components/metrics/Vo2MaxCalculatorCard";
import { MetricsTrackingSection, type MetricsLogEntry } from "@/components/metrics/MetricsTrackingSection";

export default async function MetricsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const thisWeekStart = startOfWeekLocal(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const thisWeekStartIso = dateToLocalIso(thisWeekStart);
  const lastWeekStartIso = dateToLocalIso(lastWeekStart);

  const [profile, logRows, metricsLogRows] = await Promise.all([
    prisma.vitalsProfile.findUnique({ where: { userId: user.id } }),
    prisma.vitalsLog.findMany({ where: { userId: user.id, date: { gte: lastWeekStart } }, orderBy: { createdAt: "desc" } }),
    prisma.metricsLog.findMany({ where: { userId: user.id }, orderBy: { loggedAt: "desc" }, take: 60 }),
  ]);

  const logs: VitalsLogEntry[] = logRows.map((r) => ({
    id: r.id,
    date: dateToLocalIso(r.date),
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

  const metricsLogs: MetricsLogEntry[] = metricsLogRows
    .filter((r) => isMetricsLogMetric(r.metric))
    .map((r) => ({ id: r.id, metric: r.metric as MetricsLogEntry["metric"], value: r.value, loggedAt: r.loggedAt }));

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Metrics</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Understand and track the numbers that matter for your health.
      </p>
      <div className="vitals-disclaimer">
        All metrics are for general wellness education only. Not medical advice. Consult your physician for medical interpretation.
      </div>

      <div id="calculators" className="wellness-section-label" style={{ marginTop: 8 }}>
        Your Health Calculators
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        <BmiCalculatorCard
          initialHeightFeet={profile?.heightFeet ?? null}
          initialHeightInches={profile?.heightInches ?? null}
          initialWeightLbs={profile?.weightLbs ?? null}
        />
        <MaxHeartRateCalculatorCard initialAge={profile?.age ?? null} />
        <RpeScaleCard />
        <HrvCalculatorCard initialAge={profile?.age ?? null} />
        <Vo2MaxCalculatorCard
          initialAge={profile?.age ?? null}
          initialWeightLbs={profile?.weightLbs ?? null}
          initialSex={profile?.biologicalSex ?? null}
        />
      </div>

      <div className="wellness-section-label">Your Metrics Over Time</div>
      <div style={{ marginBottom: 32 }}>
        <MetricsTrackingSection logs={metricsLogs} />
      </div>

      <div className="wellness-section-label">Weekly Activity</div>
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
