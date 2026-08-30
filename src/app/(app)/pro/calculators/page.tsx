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
        <div className="pro-grid-2">
          <NprsCalculator />
          <TugCalculator />
          <ThirtySecondStsCalculator />
          <SixMinuteWalkCalculator />
          <BergBalanceCalculator />
          <LefsCalculator />
          <DashCalculator />
          <OswestryCalculator />
          <PsfsCalculator />
          <MbessCalculator />
          <TugCognitiveCalculator />
          <FgaCalculator />
        </div>
      </CalculatorWorkspace>
    </div>
  );
}
