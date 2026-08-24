import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { BodyMetricsCard } from "@/components/vitals/BodyMetricsCard";
import { BmiCalculatorCard } from "@/components/metrics/BmiCalculatorCard";
import { MaxHeartRateCalculatorCard } from "@/components/metrics/MaxHeartRateCalculatorCard";
import { HrvCalculatorCard } from "@/components/metrics/HrvCalculatorCard";
import { Vo2MaxCalculatorCard } from "@/components/metrics/Vo2MaxCalculatorCard";
import type { WellnessProfile } from "@/lib/vitals";

/** Pure calculator inputs — tracking/trends now live on the Overview page's "Trends" tab
 *  (see app/(app)/wellness/page.tsx), RPE moved to the Exercise Library page's Rep
 *  Continuum tab (it's about training intensity, not a body metric), and the weekly
 *  activity log moved to its own page at /wellness/activity. The identity fields each
 *  calculator needs (age, weight,
 *  height, sex...) are entered right here via BodyMetricsCard, not on a separate page,
 *  it's the one place this profile is entered; every calculator below just reads it back. */
export default async function MetricsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const row = await prisma.vitalsProfile.findUnique({ where: { userId: user.id } });
  const profile: WellnessProfile = {
    age: row?.age ?? null,
    heightFeet: row?.heightFeet ?? null,
    heightInches: row?.heightInches ?? null,
    weightLbs: row?.weightLbs ?? null,
    biologicalSex: row?.biologicalSex ?? null,
    activityLevel: row?.activityLevel ?? null,
    wellnessGoal: row?.wellnessGoal ?? null,
  };

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Metrics</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Understand the numbers that matter for your health.
      </p>
      <div className="vitals-disclaimer">
        All metrics are for general wellness education only. Not medical advice. Consult your physician for medical interpretation.
      </div>

      <BodyMetricsCard
        initial={profile}
        googleHealthSyncedAt={row?.googleHealthSyncedAt ? row.googleHealthSyncedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
      />

      <div id="calculators" className="wellness-section-label" style={{ marginTop: 8 }}>
        Your Health Calculators
      </div>
      <div className="metrics-calc-grid">
        <BmiCalculatorCard profile={profile} />
        <MaxHeartRateCalculatorCard profile={profile} />
        <HrvCalculatorCard profile={profile} />
        <Vo2MaxCalculatorCard profile={profile} />
      </div>
    </div>
  );
}
