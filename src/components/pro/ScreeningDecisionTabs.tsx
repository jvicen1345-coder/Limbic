"use client";

import { useMemo, useState } from "react";
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
import { ReferralTriggersCategory, REFERRAL_TRIGGER_TEXT } from "@/components/pro/red-flags/ReferralTriggersCategory";
import { matchesSearch, searchTerms } from "@/lib/reference-search";

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

/** Each decision rule as one searchable entry. The rule components themselves own their
 *  scoring UI and pass their own title/summary to RuleAccordion; what's repeated here is
 *  only what the Clinical Reference search needs to match on — the title plus the terms a
 *  reader would actually type looking for it ("x-ray", "clot", "saddle"), which aren't
 *  visible on the collapsed card at all. */
const DECISION_RULES: { title: string; keywords: string; Card: (props: { open?: boolean }) => React.ReactElement }[] = [
  { title: "Ottawa Ankle Rules", keywords: "ankle foot malleolus fracture screening x-ray imaging bear weight", Card: OttawaAnkleRule },
  { title: "Ottawa Knee Rules", keywords: "knee patella fibular head fracture screening x-ray imaging", Card: OttawaKneeRule },
  { title: "Canadian C-Spine Rules", keywords: "cervical spine neck trauma clearance x-ray imaging collar", Card: CanadianCSpineRule },
  { title: "Pittsburgh Knee Rules", keywords: "knee fracture screening x-ray imaging fall trauma", Card: PittsburghKneeRule },
  { title: "Wells Criteria for DVT", keywords: "deep vein thrombosis clot calf swelling leg risk stratification", Card: WellsDvtRule },
  { title: "Wells Criteria for PE", keywords: "pulmonary embolism clot lung dyspnea risk stratification", Card: WellsPeRule },
  { title: "Cauda Equina Red Flags", keywords: "saddle anesthesia bowel bladder emergency lumbar referral", Card: CaudaEquinaRule },
  { title: "NEXUS Criteria", keywords: "cervical spine imaging trauma low risk midline tenderness", Card: NexusRule },
];

/** The red-flag side of this tab, in the order they render. A category matches the search
 *  as a whole — its individual flags are a checklist a clinician works through top to
 *  bottom, so filtering rows out of one would misrepresent the screen. */
const RED_FLAG_CATEGORIES: { title: string; flags: string[] }[] = [
  { title: "Oncology", flags: ONCOLOGY },
  { title: "Cardiovascular", flags: CARDIOVASCULAR },
  { title: "Neurological", flags: NEUROLOGICAL },
  { title: "Systemic, Infection", flags: INFECTION },
  { title: "Fracture Risk", flags: FRACTURE_RISK },
];

function filterScreening(query: string) {
  const terms = searchTerms(query);
  return {
    terms,
    rules: DECISION_RULES.filter((r) => matchesSearch(terms, r.title, r.keywords)),
    categories: RED_FLAG_CATEGORIES.filter((c) => matchesSearch(terms, c.title, c.flags)),
    referralTriggers: matchesSearch(terms, "Referral Triggers", REFERRAL_TRIGGER_TEXT),
  };
}

/** Match count for this tab's label in the Clinical Reference search — see
 *  countLabValueMatches in LabValuesReference.tsx for the shape and why. Counts both
 *  sub-tabs, since from the outside this is one tab. */
export function countScreeningMatches(query: string): number {
  const { rules, categories, referralTriggers } = filterScreening(query);
  return rules.length + categories.length + (referralTriggers ? 1 : 0);
}

/** Decision Rules and Red Flag Screening used to be two separate LimbicPRO sidebar rows/
 *  routes (/pro/decision-rules, /pro/red-flags) — merged onto one page since both are
 *  checklist-style clinical screening tools used in the same moment of an exam, not really
 *  separate destinations. /pro/red-flags now redirects here (see its page.tsx). */
export function ScreeningDecisionTabs({ query = "" }: { query?: string }) {
  const [tab, setTab] = useState<Tab>("decisionRules");
  const { terms, rules, categories, referralTriggers } = filterScreening(query);
  const searching = terms.length > 0;
  const ruleCount = rules.length;
  const redFlagCount = categories.length + (referralTriggers ? 1 : 0);

  // Memoized rather than rebuilt inline: SlidingTabs re-measures its underline whenever the
  // tabs array identity changes, so a fresh array every render would re-measure on every
  // keystroke elsewhere on the page.
  const tabsWithCounts = useMemo(
    () =>
      !searching
        ? TABS
        : TABS.map((t) => ({ ...t, label: `${t.label} (${t.id === "decisionRules" ? ruleCount : redFlagCount})` })),
    [searching, ruleCount, redFlagCount]
  );

  // A search narrow enough to leave a handful of cards standing opens them, so the reader
  // lands on the criteria instead of a list they still have to click.
  const expandRules = searching && ruleCount <= 3;
  const expandFlags = searching && redFlagCount <= 3;

  return (
    <>
      <SlidingTabs tabs={tabsWithCounts} active={tab} onChange={setTab} />
      <div style={{ marginTop: 16 }}>
        {tab === "decisionRules" && (
          <>
            <div className="pro-disclaimer">
              These tools support clinical reasoning. They do not replace clinical judgment or a full patient
              examination.
            </div>
            <div className="pro-accordion">
              {rules.map((rule) => (
                <rule.Card key={rule.title} open={expandRules} />
              ))}
            </div>
            {ruleCount === 0 && <p className="clinref-empty">No decision rules match this search.</p>}
          </>
        )}
        {tab === "redFlags" && (
          <>
            <div className="pro-disclaimer">
              Red flags indicate the need for further evaluation, not a diagnosis. Always use clinical judgment.
            </div>
            <div className="pro-accordion">
              {categories.map((c) => (
                <RedFlagCategory key={c.title} title={c.title} flags={c.flags} open={expandFlags} />
              ))}
              {referralTriggers && <ReferralTriggersCategory open={expandFlags} />}
            </div>
            {redFlagCount === 0 && <p className="clinref-empty">No red flag categories match this search.</p>}
          </>
        )}
      </div>
    </>
  );
}
