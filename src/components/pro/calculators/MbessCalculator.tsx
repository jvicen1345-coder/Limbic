"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

const CONDITIONS = ["Double leg stance, firm surface", "Single leg stance, firm surface", "Tandem stance, firm surface", "Double leg stance, foam surface", "Single leg stance, foam surface", "Tandem stance, foam surface"] as const;

// The official BESS/mBESS error types, counted once per occurrence (max 1 per category
// per stance) across the 20-second trial. Applies identically to all six conditions above.
const ERROR_CRITERIA = [
  "Lifting hands off the iliac crests",
  "Opening the eyes",
  "Step, stumble, or fall",
  "Moving the hip into more than 30° of flexion or abduction",
  "Lifting the forefoot or heel off the testing surface",
  "Remaining out of the testing position for more than 5 seconds",
];

/** Fully functional — error-count inputs, the running total, the built-in 20-second-per-
 *  stance countdown (see CalcTimer), and the real official BESS error-counting criteria
 *  are all live. */
export function MbessCalculator() {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<number[]>(Array(CONDITIONS.length).fill(0));

  const total = errors.reduce((sum, e) => sum + e, 0);

  return (
    <>
      <CalcCardShell
        name="mBESS"
        fullName="Modified Balance Error Scoring System"
        measures="Postural stability errors across 3 stances on 2 surfaces."
        population="Concussion/vestibular screening"
        itemCount="6 conditions"
        onOpen={() => setOpen(true)}
      />
      <CalcModal
        open={open}
        title="mBESS, Modified Balance Error Scoring System"
        onClose={() => setOpen(false)}
        testKey="mbess"
        testName="mBESS"
        result={{ value: `${total} errors`, label: "Higher error count indicates worse balance" }}
      >
        <CalcTimer mode="countdown" durationSeconds={20} label="20s per stance — reset before timing the next condition" />
        <div className="pro-calc-result" style={{ marginBottom: 14 }}>
          <div className="pro-calc-result-label" style={{ fontWeight: 600, marginBottom: 4 }}>Count one error per occurrence, per stance (max 10 per stance):</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
            {ERROR_CRITERIA.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CONDITIONS.map((condition, i) => (
            <div className="pro-item-row" key={condition}>
              <span className="pro-item-row-label">{condition}</span>
              <input
                className="input pro-item-row-select"
                type="number"
                min={0}
                max={10}
                value={errors[i]}
                onChange={(e) => {
                  const next = [...errors];
                  next[i] = Math.min(10, Math.max(0, Number(e.target.value)));
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
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 8 }}>
          If a stance cannot be held for at least 5 seconds, score it the maximum of 10 errors for that condition.
          Minimal detectable change: roughly 3-5 error points (varies by rater and population); a 1-2 error increase
          after concussion can still fall within measurement error alone.
        </p>
      </CalcModal>
    </>
  );
}
