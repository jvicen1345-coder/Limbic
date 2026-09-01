"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice } from "./CalcModal";

/** The DASH is 30 items. Unlike the ODI or Berg there are no section or task headings to
 *  label rows with — on this instrument the item *is* the text — so rows are numbered, and
 *  the numbering matches the published form. The 30 item statements and their per-item
 *  response anchors are not reproduced here; see LicensedInstrumentNotice in CalcModal.tsx.
 *  The DASH is licensed by the Institute for Work & Health, which requires a licence
 *  agreement and forbids modifying the instrument, so this one especially does not get its
 *  text restored. */
const DASH_ITEM_COUNT = 30;

/** The published scoring rule: at least 27 of the 30 items must be answered, and the score
 *  is the mean of the answered items rescaled to 0-100. Below 27 the manual says the score
 *  cannot be calculated — so this reports that rather than quietly substituting values, as
 *  the previous version did by defaulting every unanswered item to 1. */
const DASH_MIN_ANSWERED = 27;

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const DASH_MEASURE = {
  name: "DASH",
  fullName: "Disabilities of Arm, Shoulder, and Hand",
  measures: "Patient-reported upper extremity disability and symptoms.",
  population: "Any upper extremity condition",
  itemCount: "30 items",
  administration: "Patient-Reported",
} as const;

/** Score entry for the DASH: each answered item entered 1-5 from the completed form, scored
 *  with the published formula, ((sum / n) - 1) x 25. */
export function DashCalculator() {
  const [open, setOpen] = useState(false);
  // null = not answered, which is a real state on this instrument rather than a default.
  const [scores, setScores] = useState<(number | null)[]>(Array(DASH_ITEM_COUNT).fill(null));

  const answered = scores.filter((s): s is number => s !== null);
  const scorable = answered.length >= DASH_MIN_ANSWERED;
  const dashScore = scorable
    ? Math.round((answered.reduce((sum, s) => sum + s, 0) / answered.length - 1) * 25 * 10) / 10
    : null;

  const resultValue = dashScore === null ? "—" : `${dashScore} / 100`;
  const resultLabel = scorable
    ? "Higher indicates more disability"
    : `Needs ${DASH_MIN_ANSWERED} of ${DASH_ITEM_COUNT} items answered, ${answered.length} entered`;

  return (
    <>
      <CalcCardShell {...DASH_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="DASH, Disabilities of Arm, Shoulder, and Hand"
        onClose={() => setOpen(false)}
        testKey="dash"
        testName="DASH"
        result={dashScore === null ? null : { value: resultValue, label: resultLabel }}
      >
        <LicensedInstrumentNotice instrument="DASH" developedBy="the Institute for Work & Health" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          Enter each item&rsquo;s response, 1 to 5, in the order they appear on the form. Leave an item blank if the
          patient did not answer it.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {Array.from({ length: DASH_ITEM_COUNT }, (_, i) => (
            <div className="pro-item-row" key={i}>
              <span className="pro-item-row-label">Item {i + 1}</span>
              <select
                className="input pro-item-row-select"
                aria-label={`Item ${i + 1} response`}
                value={scores[i] ?? ""}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = e.target.value === "" ? null : Number(e.target.value);
                  setScores(next);
                }}
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value">{resultValue}</div>
          <div className="pro-calc-result-label">{resultLabel}</div>
        </div>
        <p style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)", marginTop: 8 }}>
          Formula: ((sum of answered items / number answered) &minus; 1) &times; 25. The published manual requires at
          least {DASH_MIN_ANSWERED} of {DASH_ITEM_COUNT} items answered. Minimal detectable change: ~11 points.
          Minimal clinically important difference: ~11 points (musculoskeletal disorders, pooled meta-analysis
          estimate).
        </p>
      </CalcModal>
    </>
  );
}
