"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice, ItemScoreRow } from "./CalcModal";

/**
 * The Functional Gait Assessment's ten task names — kept as row labels so an examiner
 * scoring from the form knows which task each row is. The per-item 0-3 scoring criteria
 * that used to sit in the dropdowns are gone; see LicensedInstrumentNotice in CalcModal.tsx
 * for why, and don't put them back. Task order matches the published assessment, so row N
 * here is item N there.
 */
const FGA_ITEMS = [
  "Gait on level surface",
  "Change in gait speed",
  "Gait with horizontal head turns",
  "Gait with vertical head turns",
  "Gait and pivot turn",
  "Step over obstacle",
  "Gait with narrow base of support",
  "Gait with eyes closed",
  "Ambulating backward",
  "Steps",
] as const;

const FGA_MAX = FGA_ITEMS.length * 3;
/** Published cut score: below 22 of 30 predicts falls in community-dwelling older adults. */
const FGA_FALL_RISK_CUT = 22;

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const FGA_MEASURE = {
  name: "Functional Gait Assessment",
  fullName: "FGA",
  measures: "Gait-based dynamic balance across 10 walking tasks.",
  population: "Vestibular and balance-impaired patients",
  itemCount: "10 items",
  administration: "Clinician-Administered",
} as const;

/** Score entry for the FGA: ten task scores of 0-3 entered against the published criteria
 *  on your own copy of the form, summed out of 30. */
export function FgaCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(FGA_ITEMS.length).fill(3));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const fallRisk = total < FGA_FALL_RISK_CUT;
  const label = fallRisk ? "Below 22, indicates fall risk" : "22 or above, cut score not met";

  return (
    <>
      <CalcCardShell {...FGA_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="FGA, Functional Gait Assessment"
        onClose={() => setOpen(false)}
        testKey="fga"
        testName="Functional Gait Assessment"
        result={{ value: `${total} / ${FGA_MAX}`, label }}
      >
        <LicensedInstrumentNotice instrument="FGA" developedBy="Wrisley, Marchetti, Kuharsky & Whitney" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          Score each task 0 (severe impairment) to 3 (normal) against the criteria on your copy of the assessment.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FGA_ITEMS.map((item, i) => (
            <ItemScoreRow
              key={item}
              label={`${i + 1}. ${item}`}
              scores={[0, 1, 2, 3]}
              value={scores[i]}
              onChange={(next) => {
                const updated = [...scores];
                updated[i] = next ?? 0;
                setScores(updated);
              }}
            />
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value" style={{ color: fallRisk ? "#dc2626" : "var(--color-success)" }}>
            {total} / {FGA_MAX}
          </div>
          <div className="pro-calc-result-label">{label}</div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 12 }}>
          Minimal detectable change: 4.2 points (stroke). Minimal clinically important difference: 4 points
          (community-dwelling older adults).
        </p>
      </CalcModal>
    </>
  );
}
