"use client";

import { useState } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";
import { LabValuesReference } from "@/components/pro/LabValuesReference";
import { MedicationReference } from "@/components/pro/MedicationReference";
import { MedicalTerminologyReference } from "@/components/pro/MedicalTerminologyReference";

type Tab = "labValues" | "medications" | "terminology";

const TABS: { id: Tab; label: string }[] = [
  { id: "labValues", label: "Lab Values" },
  { id: "medications", label: "Medications" },
  { id: "terminology", label: "Medical Terminology and Abbreviations" },
];

/** Lab Values and Medications used to be two separate LimbicPRO sidebar rows/routes
 *  (/pro/lab-values, /pro/medications) — merged onto one page since both are static
 *  quick-lookup reference content with no interactivity of their own beyond the accordions
 *  each already had. /pro/medications now redirects here (see its page.tsx). */
export function ClinicalReferenceTabs() {
  const [tab, setTab] = useState<Tab>("labValues");

  return (
    <>
      <SlidingTabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 16 }}>
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
