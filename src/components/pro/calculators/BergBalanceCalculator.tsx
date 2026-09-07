"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice, ItemScoreRow } from "./CalcModal";

/**
 * The Berg Balance Scale's fourteen task names — kept as row labels so an examiner scoring
 * from the form knows which task each row is. The per-item 0-4 scoring criteria that used
 * to sit in the dropdowns are gone; see LicensedInstrumentNotice in CalcModal.tsx for why,
 * and don't put them back. Task order matches the published scale, so row N here is item N
 * there.
 */
const BERG_ITEMS = [
  "Sitting to standing",
  "Standing unsupported",
  "Sitting unsupported, feet on floor",
  "Standing to sitting",
  "Transfers",
  "Standing with eyes closed",
  "Standing with feet together",
  "Reaching forward with outstretched arm",
  "Retrieving object from floor",
  "Turning to look behind",
  "Turning 360 degrees",
  "Placing alternate foot on stool",
  "Standing with one foot in front",
  "Standing on one foot",
] as const;

const BERG_MAX = BERG_ITEMS.length * 4;

function interpretBerg(total: number) {
  if (total >= 41) return { label: "Low fall risk", color: "var(--color-success)" };
  if (total >= 21) return { label: "Medium fall risk", color: "var(--color-warn)" };
  return { label: "High fall risk", color: "#dc2626" };
}

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const BERG_BALANCE_MEASURE = {
  name: "Berg Balance Scale",
  fullName: "BBS",
  measures: "Static and dynamic balance across 14 functional tasks.",
  population: "Older adults, neurological and balance-impaired patients",
  itemCount: "14 items",
  administration: "Clinician-Administered",
} as const;

/** Score entry for the Berg Balance Scale: fourteen task scores of 0-4 entered against the
 *  published criteria on your own copy of the form, summed out of 56. */
export function BergBalanceCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(BERG_ITEMS.length).fill(0));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const result = interpretBerg(total);

  return (
    <>
      <CalcCardShell {...BERG_BALANCE_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="Berg Balance Scale"
        onClose={() => setOpen(false)}
        testKey="berg"
        testName="Berg Balance Scale"
        result={{ value: `${total} / ${BERG_MAX}`, label: `${result.label}, 41-56 low, 21-40 medium, 0-20 high fall risk` }}
      >
        <LicensedInstrumentNotice instrument="Berg Balance Scale" developedBy="Berg, Wood-Dauphinée, Williams & Maki" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          Score each task 0 (unable or most impaired) to 4 (independent) against the criteria on your copy of the
          scale.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {BERG_ITEMS.map((item, i) => (
            <ItemScoreRow
              key={item}
              label={`${i + 1}. ${item}`}
              scores={[0, 1, 2, 3, 4]}
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
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {total} / {BERG_MAX}
          </div>
          <div className="pro-calc-result-label">{result.label}, 41-56 low, 21-40 medium, 0-20 high fall risk</div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 12 }}>
          Minimal detectable change: ~6.5 points (community-dwelling older adults). Minimal clinically important
          difference varies by baseline score and population, commonly cited in the 4-8 point range.
        </p>
      </CalcModal>
    </>
  );
}
