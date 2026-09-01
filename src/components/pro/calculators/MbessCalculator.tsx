"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

/** The six mBESS testing conditions — plain descriptions of the stance and surface being
 *  tested, kept as row labels so an examiner knows which trial each error count belongs to.
 *  The enumerated official error definitions that used to be listed above the inputs are
 *  gone; see LicensedInstrumentNotice in CalcModal.tsx. Count errors against your own copy
 *  of the protocol. */
const CONDITIONS = [
  "Double leg stance, firm surface",
  "Single leg stance, firm surface",
  "Tandem stance, firm surface",
  "Double leg stance, foam surface",
  "Single leg stance, foam surface",
  "Tandem stance, foam surface",
] as const;

/** Published protocol: errors are capped at 10 per 20-second trial. */
const MAX_ERRORS_PER_CONDITION = 10;

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const MBESS_MEASURE = {
  name: "mBESS",
  fullName: "Modified Balance Error Scoring System",
  measures: "Postural stability errors across 3 stances on 2 surfaces.",
  population: "Concussion/vestibular screening",
  itemCount: "6 conditions",
  administration: "Clinician-Administered",
} as const;

/** Score entry for the mBESS: per-condition error counts entered from your own copy of the
 *  protocol, totalled live, alongside the built-in 20-second-per-stance countdown. */
export function MbessCalculator() {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<number[]>(Array(CONDITIONS.length).fill(0));

  const total = errors.reduce((sum, e) => sum + e, 0);

  return (
    <>
      <CalcCardShell {...MBESS_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="mBESS, Modified Balance Error Scoring System"
        onClose={() => setOpen(false)}
        testKey="mbess"
        testName="mBESS"
        result={{ value: `${total} errors`, label: "Higher error count indicates worse balance" }}
      >
        <LicensedInstrumentNotice instrument="BESS protocol" developedBy="Riemann & Guskiewicz" />
        <CalcTimer mode="countdown" durationSeconds={20} label="20s per stance — reset before timing the next condition" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "10px 0" }}>
          Count errors against your copy of the protocol and enter the total for each condition, to a maximum of{" "}
          {MAX_ERRORS_PER_CONDITION} per trial.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CONDITIONS.map((condition, i) => (
            <div className="pro-item-row" key={condition}>
              <span className="pro-item-row-label">{condition}</span>
              <input
                className="input pro-item-row-select"
                type="number"
                aria-label={`${condition} error count`}
                min={0}
                max={MAX_ERRORS_PER_CONDITION}
                value={errors[i]}
                onChange={(e) => {
                  const next = [...errors];
                  next[i] = Math.min(MAX_ERRORS_PER_CONDITION, Math.max(0, Number(e.target.value)));
                  setErrors(next);
                }}
              />
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value">{total} errors</div>
          <div className="pro-calc-result-label">Higher error count indicates worse balance</div>
        </div>
        <p style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)", marginTop: 8 }}>
          If a stance cannot be held for at least 5 seconds, score it the maximum of {MAX_ERRORS_PER_CONDITION} errors
          for that condition. Minimal detectable change: roughly 3-5 error points (varies by rater and population); a
          1-2 error increase after concussion can still fall within measurement error alone.
        </p>
      </CalcModal>
    </>
  );
}
