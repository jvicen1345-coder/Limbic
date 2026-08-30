"use client";

import { useState } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";
import { LabValuesReference } from "@/components/pro/LabValuesReference";
import { MedicationReference } from "@/components/pro/MedicationReference";
import { MedicalTerminologyReference } from "@/components/pro/MedicalTerminologyReference";
import { ScreeningDecisionTabs } from "@/components/pro/ScreeningDecisionTabs";
import { SpecialTestsLibrary } from "@/components/pro/SpecialTestsLibrary";
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
import type { CalculatorProfileView } from "@/app/actions/calculator-profiles";

type Tab = "outcomeMeasures" | "screeningDecision" | "specialTests" | "labValues" | "medications" | "terminology";

const TABS: { id: Tab; label: string }[] = [
  { id: "outcomeMeasures", label: "Outcome Measures" },
  { id: "screeningDecision", label: "Screening & Decision Support" },
  { id: "specialTests", label: "Special Tests" },
  { id: "labValues", label: "Lab Values" },
  { id: "medications", label: "Medications" },
  { id: "terminology", label: "Medical Terminology and Abbreviations" },
];

/** One consolidated clinical-reference hub — this is what "Clinical Reference" in the
 *  Limbic Student sidebar links to (see AppShell.tsx), so a student reaches every free
 *  clinical-reference tool from one place instead of hunting across separate LimbicPRO
 *  sidebar rows. Outcome Measures, Screening & Decision Support, and Special Tests are the
 *  same components/data their own standalone /pro/calculators, /pro/decision-rules, and
 *  /pro/special-tests pages render — those pages (and their own LimbicPRO sidebar links)
 *  stay as they are for a non-student reader; this is just a second, combined entry point
 *  into the same free content. Lab Values and Medications used to be two separate LimbicPRO
 *  sidebar rows/routes (/pro/lab-values, /pro/medications) — merged onto one page since both
 *  are static quick-lookup reference content with no interactivity of their own beyond the
 *  accordions each already had. /pro/medications now redirects here (see its page.tsx). */
export function ClinicalReferenceTabs({ initialProfiles }: { initialProfiles: CalculatorProfileView[] }) {
  const [tab, setTab] = useState<Tab>("outcomeMeasures");

  return (
    <>
      <SlidingTabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 16 }}>
        {tab === "outcomeMeasures" && (
          <CalculatorWorkspace initialProfiles={initialProfiles}>
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
        )}
        {tab === "screeningDecision" && <ScreeningDecisionTabs />}
        {tab === "specialTests" && <SpecialTestsLibrary initialRegionId={null} />}
        {tab === "labValues" && <LabValuesReference />}
        {tab === "medications" && (
          <>
            <div className="pro-disclaimer">
              This reference is for clinical awareness only. Always verify current medications with the patient and
              medical team.
            </div>
            <MedicationReference />
          </>
        )}
        {tab === "terminology" && <MedicalTerminologyReference />}
      </div>
    </>
  );
}
