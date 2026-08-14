"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// TODO: Build out items 6-30 of the full DASH item list before launch. First 5 items are
// the real published DASH wording; the formula below is the real DASH formula, applied
// here to only the 5 built items as a functional demo of the math, not a calibrated
// 30-item score.
const DASH_FUNCTIONAL_ITEMS = [
  "Open a tight or new jar",
  "Write",
  "Turn a key",
  "Prepare a meal",
  "Push open a heavy door",
] as const;

const SCORE_LABELS = ["1, no difficulty", "2, mild difficulty", "3, moderate difficulty", "4, severe difficulty", "5, unable"];

export function DashCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(DASH_FUNCTIONAL_ITEMS.length).fill(1));

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const dashScore = Math.round(((average - 1) * 25) * 10) / 10;

  return (
    <>
      <CalcCardShell
        name="DASH"
        fullName="Disabilities of Arm, Shoulder, and Hand"
        measures="Patient-reported upper extremity disability and symptoms."
        population="Any upper extremity condition"
        itemCount="30 items, 5 built"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="DASH, Disabilities of Arm, Shoulder, and Hand" onClose={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DASH_FUNCTIONAL_ITEMS.map((item, i) => (
            <div className="pro-item-row" key={item}>
              <span className="pro-item-row-label">
                {i + 1}. {item}
              </span>
              <select
                className="input pro-item-row-select"
                value={scores[i]}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = Number(e.target.value);
                  setScores(next);
                }}
              >
                {SCORE_LABELS.map((label, idx) => (
                  <option key={idx} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="pro-item-row" style={{ opacity: 0.5 }}>
            <span className="pro-item-row-label">6-30. Remaining items coming soon</span>
            <span style={{ fontSize: 12 }}>TODO</span>
          </div>
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value">{dashScore} / 100</div>
          <div className="pro-calc-result-label">
            Demo score from first 5 items only, formula: ((sum of items / n) - 1) &times; 25, higher is more
            disability
          </div>
        </div>
      </CalcModal>
    </>
  );
}
