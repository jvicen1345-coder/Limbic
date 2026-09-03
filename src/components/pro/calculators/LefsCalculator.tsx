"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice, ItemScoreRow } from "./CalcModal";

/** The LEFS is 20 items, each 0-4, summed out of 80. Like the DASH and unlike the ODI,
 *  the item *is* the text — there are no section headings to label rows with — so rows are
 *  numbered in the order they appear on the published form. The 20 item statements and the
 *  0-4 difficulty anchors are not reproduced here; see LicensedInstrumentNotice in
 *  CalcModal.tsx. */
const LEFS_ITEM_COUNT = 20;
const LEFS_MAX = LEFS_ITEM_COUNT * 4;

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const LEFS_MEASURE = {
  name: "LEFS",
  fullName: "Lower Extremity Functional Scale",
  measures: "Patient-reported difficulty across 20 lower-extremity functional activities.",
  population: "Any lower extremity orthopedic condition",
  itemCount: "20 items",
  administration: "Patient-Reported",
} as const;

/** Score entry for the LEFS: each item entered 0-4 from the completed form and summed out
 *  of 80. Higher is better function; 80 is full function. */
export function LefsCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(LEFS_ITEM_COUNT).fill(4));

  const total = scores.reduce((sum, s) => sum + s, 0);

  return (
    <>
      <CalcCardShell {...LEFS_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="LEFS, Lower Extremity Functional Scale"
        onClose={() => setOpen(false)}
        testKey="lefs"
        testName="LEFS"
        result={{ value: `${total} / ${LEFS_MAX}`, label: "Higher is better function, 80 is full function" }}
      >
        <LicensedInstrumentNotice instrument="LEFS" developedBy="Binkley, Stratford, Lott & Riddle" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          Enter each item&rsquo;s response, 0 (extreme difficulty or unable) to 4 (no difficulty), in the order they
          appear on the form.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {Array.from({ length: LEFS_ITEM_COUNT }, (_, i) => (
            <ItemScoreRow
              key={i}
              label={`Item ${i + 1}`}
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
          <div className="pro-calc-result-value">
            {total} / {LEFS_MAX}
          </div>
          <div className="pro-calc-result-label">Higher is better function, 80 is full function</div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 8 }}>
          Minimal detectable change: 9 points. Minimal clinically important difference: 9 points.
        </p>
      </CalcModal>
    </>
  );
}
