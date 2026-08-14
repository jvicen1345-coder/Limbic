"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// TODO: Replace generic "Item N" placeholders with the real 10 published FGA item names
// and their 0-3 scoring criteria (gait level surface, change in gait speed, gait with
// horizontal/vertical head turns, gait and pivot turn, step over obstacle, gait with
// narrow base of support, gait with eyes closed, ambulating backward, steps, walking with
// stairs) before launch.
const FGA_ITEMS = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

/** Placeholder with TODO — the 0-3 scoring, sum, and cutoff comparison are functional; the
 *  10 item names/criteria are a TODO placeholder. */
export function FgaCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(10).fill(3));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const fallRisk = total < 22;

  return (
    <>
      <CalcCardShell
        name="Functional Gait Assessment"
        fullName="FGA"
        measures="Gait-based dynamic balance across 10 walking tasks."
        population="Vestibular and balance-impaired patients"
        itemCount="10 items"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="Functional Gait Assessment" onClose={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {FGA_ITEMS.map((item, i) => (
            <div className="pro-item-row" key={item}>
              <span className="pro-item-row-label">{item}</span>
              <select
                className="input pro-item-row-select"
                value={scores[i]}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = Number(e.target.value);
                  setScores(next);
                }}
              >
                {[0, 1, 2, 3].map((s) => (
                  <option key={s} value={s}>
                    {s}
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
      </CalcModal>
    </>
  );
}
