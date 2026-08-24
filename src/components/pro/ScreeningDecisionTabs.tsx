"use client";

import { useState } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";
import { OttawaAnkleRule } from "@/components/pro/decision-rules/OttawaAnkleRule";
import { OttawaKneeRule } from "@/components/pro/decision-rules/OttawaKneeRule";
import { CanadianCSpineRule } from "@/components/pro/decision-rules/CanadianCSpineRule";
import { PittsburghKneeRule } from "@/components/pro/decision-rules/PittsburghKneeRule";
import { WellsDvtRule } from "@/components/pro/decision-rules/WellsDvtRule";
import { WellsPeRule } from "@/components/pro/decision-rules/WellsPeRule";
import { CaudaEquinaRule } from "@/components/pro/decision-rules/CaudaEquinaRule";
import { NexusRule } from "@/components/pro/decision-rules/NexusRule";
import { RedFlagCategory } from "@/components/pro/red-flags/RedFlagCategory";
import { ReferralTriggersCategory } from "@/components/pro/red-flags/ReferralTriggersCategory";

type Tab = "decisionRules" | "redFlags";

const TABS: { id: Tab; label: string }[] = [
  { id: "decisionRules", label: "Decision Rules" },
  { id: "redFlags", label: "Red Flag Screening" },
];

const ONCOLOGY = [
  "Age over 50 with new onset back pain",
  "History of cancer",
  "Unexplained weight loss greater than 10 pounds in 6 months",
  "Night pain not relieved by position change",
  "Pain at rest or at night",
  "Failure to improve with conservative treatment after 4-6 weeks",
  "Multiple levels involved",
];

const CARDIOVASCULAR = [
  "Chest pain or pressure with exertion",
  "Pain radiating to left arm or jaw",
  "Syncope or near-syncope",
  "Severe hypertension at rest",
  "Irregular pulse",
  "Unexplained dyspnea",
  "Ankle edema, bilateral",
  "Claudication symptoms",
];

const NEUROLOGICAL = [
  "Bilateral upper or lower extremity symptoms",
  "Saddle anesthesia",
  "Bowel or bladder dysfunction",
  "Hyperreflexia",
  "Positive Babinski",
  "Cranial nerve symptoms",
  "Sudden severe headache, worst of life",
  "Progressive neurological deficit",
];

const INFECTION = [
  "Fever over 100.4",
  "Recent infection, UTI, skin, respiratory",
  "Immunocompromised status",
  "IV drug use history",
  "Recent surgical procedure",
  "Night sweats",
  "Fatigue disproportionate to activity",
];

const FRACTURE_RISK = [
  "History of osteoporosis",
  "Prolonged corticosteroid use",
  "Age over 70",
  "Female, post-menopausal",
  "Trauma mechanism, even minor",
  "Point tenderness over vertebral body",
  "Pain severity disproportionate to mechanism",
];

/** Decision Rules and Red Flag Screening used to be two separate LimbicPRO sidebar rows/
 *  routes (/pro/decision-rules, /pro/red-flags) — merged onto one page since both are
 *  checklist-style clinical screening tools used in the same moment of an exam, not really
 *  separate destinations. /pro/red-flags now redirects here (see its page.tsx). */
export function ScreeningDecisionTabs() {
  const [tab, setTab] = useState<Tab>("decisionRules");

  return (
    <>
      <SlidingTabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 16 }}>
        {tab === "decisionRules" && (
          <>
            <div className="pro-disclaimer">
              These tools support clinical reasoning. They do not replace clinical judgment or a full patient
              examination.
            </div>
            <div className="pro-accordion">
              <OttawaAnkleRule />
              <OttawaKneeRule />
              <CanadianCSpineRule />
              <PittsburghKneeRule />
              <WellsDvtRule />
              <WellsPeRule />
              <CaudaEquinaRule />
              <NexusRule />
            </div>
          </>
        )}
        {tab === "redFlags" && (
          <>
            <div className="pro-disclaimer">
              Red flags indicate the need for further evaluation, not a diagnosis. Always use clinical judgment.
            </div>
            <div className="pro-accordion">
              <RedFlagCategory title="Oncology" flags={ONCOLOGY} />
              <RedFlagCategory title="Cardiovascular" flags={CARDIOVASCULAR} />
              <RedFlagCategory title="Neurological" flags={NEUROLOGICAL} />
              <RedFlagCategory title="Systemic, Infection" flags={INFECTION} />
              <RedFlagCategory title="Fracture Risk" flags={FRACTURE_RISK} />
              <ReferralTriggersCategory />
            </div>
          </>
        )}
      </div>
    </>
  );
}
