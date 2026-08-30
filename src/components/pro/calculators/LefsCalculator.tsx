"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

const LEFS_ITEMS = [
  "Any of your usual work, housework, or school activities",
  "Your usual hobbies, recreational, or sporting activities",
  "Getting into or out of the bath",
  "Walking between rooms",
  "Putting on your shoes or socks",
  "Squatting",
  "Lifting an object, like a bag of groceries, from the floor",
  "Performing light activities around your home",
  "Performing heavy activities around your home",
  "Getting into or out of a car",
  "Walking 2 blocks",
  "Walking a mile",
  "Going up or down 10 stairs",
  "Standing for 1 hour",
  "Sitting for 1 hour",
  "Running on even ground",
  "Running on uneven ground",
  "Making sharp turns while running fast",
  "Hopping",
  "Rolling over in bed",
] as const;

const SCORE_LABELS = ["0, extreme difficulty/unable", "1, quite a bit of difficulty", "2, moderate difficulty", "3, a little bit of difficulty", "4, no difficulty"];

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const LEFS_MEASURE = {
  name: "LEFS",
  fullName: "Lower Extremity Functional Scale",
  measures: "Patient-reported difficulty across 20 lower-extremity functional activities.",
  population: "Any lower extremity orthopedic condition",
  itemCount: "20 items",
} as const;

/** Fully functional — all 20 items, each scored 0-4, summed in real time out of 80. Higher
 *  is better function; 80 is full function. */
export function LefsCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(LEFS_ITEMS.length).fill(4));

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
        result={{ value: `${total} / 80`, label: "Higher is better function, 80 is full function" }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {LEFS_ITEMS.map((item, i) => (
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
                {SCORE_LABELS.map((label, score) => (
                  <option key={score} value={score}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value">{total} / 80</div>
          <div className="pro-calc-result-label">Higher is better function, 80 is full function</div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", marginTop: 8 }}>
          Minimal detectable change: 9 points. Minimal clinically important difference: 9 points.
        </p>
      </CalcModal>
    </>
  );
}
