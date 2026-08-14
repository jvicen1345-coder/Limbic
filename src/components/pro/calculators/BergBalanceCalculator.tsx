"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// TODO: Replace the generic 0-4 score labels below with the official Berg Balance Scale
// per-item scoring criteria text (each item's 5 score levels have their own specific
// description in the published scale) before launch.
const BERG_ITEMS = [
  "Sitting to standing",
  "Standing unsupported",
  "Sitting unsupported",
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

const SCORE_LABELS = ["0, unable", "1, maximal assistance/cueing", "2, moderate assistance/cueing", "3, minimal assistance/cueing", "4, independent"];

function interpretBerg(total: number) {
  if (total >= 41) return { label: "Low fall risk", color: "var(--color-success)" };
  if (total >= 21) return { label: "Medium fall risk", color: "var(--color-warn)" };
  return { label: "High fall risk", color: "#dc2626" };
}

/** Fully functional — all 14 items, each scored 0-4, summed in real time out of 56. */
export function BergBalanceCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(BERG_ITEMS.length).fill(0));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const result = interpretBerg(total);

  return (
    <>
      <CalcCardShell
        name="Berg Balance Scale"
        fullName="BBS"
        measures="Static and dynamic balance across 14 functional tasks."
        population="Older adults, neurological and balance-impaired patients"
        itemCount="14 items"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="Berg Balance Scale" onClose={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {BERG_ITEMS.map((item, i) => (
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
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {total} / 56
          </div>
          <div className="pro-calc-result-label">{result.label}, 41-56 low, 21-40 medium, 0-20 high fall risk</div>
        </div>
      </CalcModal>
    </>
  );
}
