"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// The real published Functional Gait Assessment (Wrisley et al.) 10 items and their 0-3
// scoring criteria, in score order 0 (severe impairment) to 3 (normal) to match the
// select's value order below.
const FGA_ITEMS: { name: string; criteria: string[] }[] = [
  {
    name: "Gait on level surface",
    criteria: [
      "Cannot walk 20ft without assistance, severe gait deviations or imbalance",
      "Walks 20ft, slow speed, abnormal gait pattern, evidence of imbalance",
      "Walks 20ft, uses an assistive device, slower speed, mild gait deviations",
      "Walks 20ft without an assistive device, good speed, no evidence of imbalance, normal gait pattern",
    ],
  },
  {
    name: "Change in gait speed",
    criteria: [
      "Cannot change speeds, or loses balance and has to reach for the wall or be caught",
      "Makes only minor adjustments to walking speed, or accomplishes a change in speed with significant gait deviations, or changes speed but has to reach for support",
      "Able to change speed but demonstrates mild gait deviations, or no deviations but unable to achieve a significant change in velocity, or uses an assistive device",
      "Able to smoothly change walking speed without loss of balance or gait deviation, shows a significant difference between normal, fast, and slow speeds",
    ],
  },
  {
    name: "Gait with horizontal head turns",
    criteria: [
      "Performs the task with severe disruption of gait, staggers outside the 15in path, loses balance, stops, or reaches for the wall",
      "Performs head turns with moderate change in gait speed, slows down, staggers but recovers and continues walking",
      "Performs head turns with slight change in gait speed, minor disruption to smooth gait path, or uses an assistive device",
      "Performs head turns smoothly with no change in gait speed, good balance",
    ],
  },
  {
    name: "Gait with vertical head turns",
    criteria: [
      "Performs the task with severe disruption of gait, staggers outside the 15in path, loses balance, stops, or reaches for the wall",
      "Performs head turns with moderate change in gait speed, slows down, staggers but recovers and continues walking",
      "Performs head turns with slight change in gait speed, minor disruption to smooth gait path, or uses an assistive device",
      "Performs head turns smoothly with no change in gait speed, good balance",
    ],
  },
  {
    name: "Gait and pivot turn",
    criteria: [
      "Cannot turn safely, requires assistance to turn and stop",
      "Turns slowly, requires verbal cueing, requires several small steps to catch balance following the turn and stop",
      "Pivot turns safely but in >3 seconds and stops with no loss of balance",
      "Pivot turns safely within 3 seconds and stops quickly with no loss of balance",
    ],
  },
  {
    name: "Step over obstacle",
    criteria: [
      "Cannot perform without assistance",
      "Able to step over the box but must stop, then step over, may require verbal cueing",
      "Able to step over the box but must slow down and adjust steps to clear it safely",
      "Able to step over the box without changing gait speed, no evidence of imbalance",
    ],
  },
  {
    name: "Gait with narrow base of support",
    criteria: [
      "Unable to attempt 4 heel-to-toe steps without assistance",
      "Completes 4 steps heel-to-toe before stepping off the line, may grab for support",
      "Completes 7 steps heel-to-toe with minimal staggering",
      "Able to walk 10 heel-to-toe steps with no staggering",
    ],
  },
  {
    name: "Gait with eyes closed",
    criteria: [
      "Cannot walk 20ft without assistance, severe gait deviations, or imbalance",
      "Walks 20ft, slow speed, abnormal gait pattern, evidence of imbalance",
      "Walks 20ft, uses an assistive device, slower speed, mild gait deviations",
      "Walks 20ft, good speed, no evidence of imbalance",
    ],
  },
  {
    name: "Ambulating backward",
    criteria: [
      "Cannot walk 10ft without assistance, severe gait deviation or imbalance, or falls",
      "Walks 10ft, slow speed, abnormal gait pattern, evidence of imbalance",
      "Walks 10ft, slow speed, mild gait deviations",
      "Walks 10ft, good speed, no gait deviation or imbalance",
    ],
  },
  {
    name: "Steps",
    criteria: [
      "Cannot do safely",
      "Two feet to a stair, must use rail",
      "Alternating feet, must use rail",
      "Alternating feet, no rail, safely",
    ],
  },
];

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

export function FgaCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(FGA_ITEMS.length).fill(3));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const fallRisk = total < 22;

  return (
    <>
      <CalcCardShell {...FGA_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="Functional Gait Assessment"
        onClose={() => setOpen(false)}
        testKey="fga"
        testName="Functional Gait Assessment"
        result={{ value: `${total} / 30`, label: fallRisk ? "Below 22, indicates fall risk" : "22 or above, cut score not met" }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FGA_ITEMS.map((item, i) => (
            <div className="pro-item-row" key={item.name}>
              <span className="pro-item-row-label">
                {i + 1}. {item.name}
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
                {item.criteria.map((criterion, score) => (
                  <option key={score} value={score}>
                    {score} — {criterion}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value" style={{ color: fallRisk ? "#dc2626" : "var(--color-success)" }}>
            {total} / 30
          </div>
          <div className="pro-calc-result-label">{fallRisk ? "Below 22, indicates fall risk" : "22 or above, cut score not met"}</div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 12 }}>
          Minimal detectable change: 4.2 points (stroke). Minimal clinically important difference: 4 points
          (community-dwelling older adults).
        </p>
      </CalcModal>
    </>
  );
}
