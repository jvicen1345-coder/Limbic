import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { FreeToolBanner } from "@/components/pro/FreeToolBanner";
import { getCalculatorProfilesForCurrentUser } from "@/app/actions/calculator-profiles";

export const metadata: Metadata = {
  title: "Outcome Measures",
};
import { CalculatorWorkspace } from "@/components/pro/calculators/CalculatorWorkspace";
import { NprsCalculator } from "@/components/pro/calculators/NprsCalculator";
import { TugCalculator } from "@/components/pro/calculators/TugCalculator";
import { ThirtySecondStsCalculator } from "@/components/pro/calculators/ThirtySecondStsCalculator";
import { SixMinuteWalkCalculator } from "@/components/pro/calculators/SixMinuteWalkCalculator";
import { BergBalanceCalculator } from "@/components/pro/calculators/BergBalanceCalculator";
import { LefsCalculator } from "@/components/pro/calculators/LefsCalculator";
import { DashCalculator } from "@/components/pro/calculators/DashCalculator";
import { OswestryCalculator } from "@/components/pro/calculators/OswestryCalculator";
import { PsfsCalculator } from "@/components/pro/calculators/PsfsCalculator";
import { MbessCalculator } from "@/components/pro/calculators/MbessCalculator";
import { TugCognitiveCalculator } from "@/components/pro/calculators/TugCognitiveCalculator";
import { FgaCalculator } from "@/components/pro/calculators/FgaCalculator";

/** Grouped by body region — a reader scanning for "what do I have for the shoulder" (or
 *  low back, or balance) shouldn't have to scan all 12 cards to find it. Region is purely a
 *  presentation grouping (not a field on each measure's own _MEASURE export, which only
 *  drives what's shown on the card itself — see CalcCardShell) since nothing else in the
 *  app needs to know a calculator's region. Whether each one is patient-reported vs
 *  clinician-administered is the other, independent axis — that's the badge every card
 *  already shows via its own administration field, so a region can (and does, e.g. Lower
 *  Extremity) freely mix both kinds without needing a second level of grouping here. */
const REGIONS: { title: string; Calculators: React.ComponentType[] }[] = [
  { title: "Spine", Calculators: [OswestryCalculator] },
  { title: "Upper Extremity", Calculators: [DashCalculator] },
  { title: "Lower Extremity", Calculators: [LefsCalculator, ThirtySecondStsCalculator] },
  { title: "Balance, Gait & Neurological", Calculators: [BergBalanceCalculator, MbessCalculator, TugCalculator, TugCognitiveCalculator, FgaCalculator] },
  { title: "Cardiopulmonary & Endurance", Calculators: [SixMinuteWalkCalculator] },
  { title: "General / Multiple Regions", Calculators: [NprsCalculator, PsfsCalculator] },
];

export default async function ProCalculatorsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profiles = await getCalculatorProfilesForCurrentUser();

  return (
    <div className="screen-pad">
      <FreeToolBanner isPro={user.isPro} />
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Outcome Measures</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Validated outcome measures and functional assessments, scored and interpreted in real time.
      </p>

      <CalculatorWorkspace initialProfiles={profiles}>
        {REGIONS.map((region) => (
          <section key={region.title} className="pro-calc-region">
            <h2 className="pro-calc-region-title">{region.title}</h2>
            <div className="pro-grid-2">
              {region.Calculators.map((Calculator, i) => (
                <Calculator key={i} />
              ))}
            </div>
          </section>
        ))}
      </CalculatorWorkspace>
    </div>
  );
}
