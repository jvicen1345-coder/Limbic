"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// TODO: Add the full official mBESS error-counting criteria (what qualifies as an error
// per stance) before launch — condition list and error totals below are functional, the
// scoring rubric text is a placeholder.
const CONDITIONS = ["Double leg stance, firm surface", "Single leg stance, firm surface", "Tandem stance, firm surface", "Double leg stance, foam surface", "Single leg stance, foam surface", "Tandem stance, foam surface"] as const;

/** Placeholder with TODO — error-count inputs and the running total are functional; the
 *  per-condition error-counting criteria text is a TODO placeholder. */
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
      <CalcModal open={open} title="mBESS, Modified Balance Error Scoring System" onClose={() => setOpen(false)}>
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
          TODO: full official error-counting criteria per condition, replace this placeholder note before launch.
        </p>
      </CalcModal>
    </>
  );
}
