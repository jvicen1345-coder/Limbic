import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { BmiCalculatorCard } from "@/components/metrics/BmiCalculatorCard";
import { MaxHeartRateCalculatorCard } from "@/components/metrics/MaxHeartRateCalculatorCard";
import { HrvCalculatorCard } from "@/components/metrics/HrvCalculatorCard";
import { Vo2MaxCalculatorCard } from "@/components/metrics/Vo2MaxCalculatorCard";

/** Pure calculator inputs — tracking/trends now live on the Overview page's "Trends" tab
 *  (see app/(app)/wellness/page.tsx), RPE moved to the Rep Continuum page (it's about
 *  training intensity, not a body metric), and the weekly activity log moved to its own
 *  page at /wellness/activity. This page's job is just: fill in numbers, get a result. */
export default async function MetricsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.vitalsProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Metrics</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Understand the numbers that matter for your health.
      </p>
      <div className="vitals-disclaimer">
        All metrics are for general wellness education only. Not medical advice. Consult your physician for medical interpretation.
      </div>

      <div id="calculators" className="wellness-section-label" style={{ marginTop: 8 }}>
        Your Health Calculators
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BmiCalculatorCard
          initialHeightFeet={profile?.heightFeet ?? null}
          initialHeightInches={profile?.heightInches ?? null}
          initialWeightLbs={profile?.weightLbs ?? null}
        />
        <MaxHeartRateCalculatorCard initialAge={profile?.age ?? null} />
        <HrvCalculatorCard initialAge={profile?.age ?? null} />
        <Vo2MaxCalculatorCard
          initialAge={profile?.age ?? null}
          initialWeightLbs={profile?.weightLbs ?? null}
          initialSex={profile?.biologicalSex ?? null}
        />
      </div>
    </div>
  );
}
