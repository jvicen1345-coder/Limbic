"use client";

import { useMemo, useState } from "react";
import { SlidingTabs } from "@/components/SlidingTabs";
import { SearchIcon, XIcon } from "@/components/icons";
import { LabValuesReference, countLabValueMatches } from "@/components/pro/LabValuesReference";
import { MedicationReference, countMedicationMatches } from "@/components/pro/MedicationReference";
import { MedicalTerminologyReference, countTerminologyMatches } from "@/components/pro/MedicalTerminologyReference";
import { ScreeningDecisionTabs, countScreeningMatches } from "@/components/pro/ScreeningDecisionTabs";
import { SpecialTestsLibrary, countSpecialTestMatches } from "@/components/pro/SpecialTestsLibrary";
import { CalculatorWorkspace } from "@/components/pro/calculators/CalculatorWorkspace";
import { NprsCalculator, NPRS_MEASURE } from "@/components/pro/calculators/NprsCalculator";
import { TugCalculator, TUG_MEASURE } from "@/components/pro/calculators/TugCalculator";
import { ThirtySecondStsCalculator, THIRTY_SECOND_STS_MEASURE } from "@/components/pro/calculators/ThirtySecondStsCalculator";
import { SixMinuteWalkCalculator, SIX_MINUTE_WALK_MEASURE } from "@/components/pro/calculators/SixMinuteWalkCalculator";
import { BergBalanceCalculator, BERG_BALANCE_MEASURE } from "@/components/pro/calculators/BergBalanceCalculator";
import { LefsCalculator, LEFS_MEASURE } from "@/components/pro/calculators/LefsCalculator";
import { DashCalculator, DASH_MEASURE } from "@/components/pro/calculators/DashCalculator";
import { OswestryCalculator, OSWESTRY_MEASURE } from "@/components/pro/calculators/OswestryCalculator";
import { PsfsCalculator, PSFS_MEASURE } from "@/components/pro/calculators/PsfsCalculator";
import { MbessCalculator, MBESS_MEASURE } from "@/components/pro/calculators/MbessCalculator";
import { TugCognitiveCalculator, TUG_COGNITIVE_MEASURE } from "@/components/pro/calculators/TugCognitiveCalculator";
import { FgaCalculator, FGA_MEASURE } from "@/components/pro/calculators/FgaCalculator";
import { matchesSearch, searchTerms } from "@/lib/reference-search";
import type { CalculatorProfileView } from "@/app/actions/calculator-profiles";

type Tab = "outcomeMeasures" | "screeningDecision" | "specialTests" | "labValues" | "medications" | "terminology";

const TABS: { id: Tab; label: string }[] = [
  { id: "outcomeMeasures", label: "Outcome Measures" },
  { id: "screeningDecision", label: "Screening & Decision Support" },
  { id: "specialTests", label: "Special Tests" },
  { id: "labValues", label: "Lab Values" },
  { id: "medications", label: "Medications" },
  { id: "terminology", label: "Terminology & Abbreviations" },
];

/** The 12 outcome measures, each paired with the card copy it renders (exported from its
 *  own calculator file, so the searchable text and the text on the card can't drift apart)
 *  plus the extra terms a reader would plausibly type looking for it — a measure's body
 *  region or the condition it's used for is rarely in its own name. */
const OUTCOME_MEASURES: {
  meta: { name: string; fullName: string; measures: string; population: string };
  keywords: string;
  Card: () => React.ReactElement;
}[] = [
  { meta: NPRS_MEASURE, keywords: "pain intensity scale numeric", Card: NprsCalculator },
  { meta: TUG_MEASURE, keywords: "gait mobility fall risk timed balance geriatric", Card: TugCalculator },
  { meta: THIRTY_SECOND_STS_MEASURE, keywords: "chair stand strength lower extremity geriatric sit stand", Card: ThirtySecondStsCalculator },
  { meta: SIX_MINUTE_WALK_MEASURE, keywords: "endurance aerobic gait distance cardiopulmonary walk", Card: SixMinuteWalkCalculator },
  { meta: BERG_BALANCE_MEASURE, keywords: "balance fall risk neurological geriatric vestibular", Card: BergBalanceCalculator },
  { meta: LEFS_MEASURE, keywords: "knee hip ankle lower extremity function questionnaire", Card: LefsCalculator },
  { meta: DASH_MEASURE, keywords: "shoulder elbow wrist hand upper extremity questionnaire", Card: DashCalculator },
  { meta: OSWESTRY_MEASURE, keywords: "low back pain lumbar disability questionnaire odi", Card: OswestryCalculator },
  { meta: PSFS_MEASURE, keywords: "goals patient specific function activities any region", Card: PsfsCalculator },
  { meta: MBESS_MEASURE, keywords: "concussion balance error scoring vestibular sideline", Card: MbessCalculator },
  { meta: TUG_COGNITIVE_MEASURE, keywords: "dual task cognitive fall risk gait attention", Card: TugCognitiveCalculator },
  { meta: FGA_MEASURE, keywords: "gait dynamic balance vestibular walking fall risk", Card: FgaCalculator },
];

function countOutcomeMeasureMatches(query: string): number {
  const terms = searchTerms(query);
  return OUTCOME_MEASURES.filter((m) => matchesSearch(terms, m.meta.name, m.meta.fullName, m.meta.measures, m.meta.population, m.keywords)).length;
}

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
 *  accordions each already had. /pro/medications now redirects here (see its page.tsx).
 *
 *  The search box filters whichever tab is showing, and every tab reports how many of its
 *  own rows match the same query (each reference module exports a count* helper for this) —
 *  six tabs deep, a reader typing "warfarin" from Outcome Measures shouldn't have to click
 *  through the other five to find out Medications is where it lives. Each tab's own chips
 *  and sub-tabs still filter on top of the search. */
export function ClinicalReferenceTabs({ initialProfiles }: { initialProfiles: CalculatorProfileView[] }) {
  const [tab, setTab] = useState<Tab>("outcomeMeasures");
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const terms = searchTerms(query);

  const counts: Record<Tab, number> = useMemo(
    () => ({
      outcomeMeasures: countOutcomeMeasureMatches(query),
      screeningDecision: countScreeningMatches(query),
      specialTests: countSpecialTestMatches(query),
      labValues: countLabValueMatches(query),
      medications: countMedicationMatches(query),
      terminology: countTerminologyMatches(query),
    }),
    [query]
  );

  // Memoized rather than rebuilt inline: SlidingTabs re-measures its underline whenever the
  // tabs array identity changes, so a fresh array every keystroke would re-measure needlessly.
  const tabs = useMemo(
    () => (searching ? TABS.map((t) => ({ ...t, label: `${t.label} (${counts[t.id]})` })) : TABS),
    [searching, counts]
  );

  const measures = OUTCOME_MEASURES.filter((m) =>
    matchesSearch(terms, m.meta.name, m.meta.fullName, m.meta.measures, m.meta.population, m.keywords)
  );
  const elsewhere = TABS.filter((t) => t.id !== tab && counts[t.id] > 0);

  return (
    <>
      <div className="clinref-toolbar">
        <div className="clinref-toolbar-tabs">
          <SlidingTabs tabs={tabs} active={tab} onChange={setTab} />
        </div>
        <div className="clinref-search">
          <SearchIcon size={15} className="clinref-search-icon" />
          <input
            type="search"
            className="clinref-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search every reference — tests, labs, drugs, abbreviations"
            aria-label="Search clinical reference"
          />
          {searching && (
            <button type="button" className="clinref-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <XIcon size={13} />
            </button>
          )}
        </div>
      </div>

      {searching && counts[tab] === 0 && elsewhere.length > 0 && (
        <p className="clinref-elsewhere">
          Nothing here for &ldquo;{query.trim()}&rdquo;. Found in{" "}
          {elsewhere.map((t, i) => (
            <span key={t.id}>
              {i > 0 && (i === elsewhere.length - 1 ? " and " : ", ")}
              <button type="button" className="clinref-elsewhere-link" onClick={() => setTab(t.id)}>
                {t.label} ({counts[t.id]})
              </button>
            </span>
          ))}
          .
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        {tab === "outcomeMeasures" && (
          <CalculatorWorkspace initialProfiles={initialProfiles}>
            <div className="pro-grid-2">
              {measures.map((m) => (
                <m.Card key={m.meta.name} />
              ))}
            </div>
            {measures.length === 0 && <p className="clinref-empty">No outcome measures match this search.</p>}
          </CalculatorWorkspace>
        )}
        {tab === "screeningDecision" && <ScreeningDecisionTabs query={query} />}
        {tab === "specialTests" && <SpecialTestsLibrary initialRegionId={null} query={query} />}
        {tab === "labValues" && <LabValuesReference query={query} />}
        {tab === "medications" && (
          <>
            <div className="pro-disclaimer">
              This reference is for clinical awareness only. Always verify current medications with the patient and
              medical team.
            </div>
            <MedicationReference query={query} />
          </>
        )}
        {tab === "terminology" && <MedicalTerminologyReference query={query} />}
      </div>
    </>
  );
}
