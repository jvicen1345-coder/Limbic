"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

function interpret(value: number): { label: string; color: string } {
  if (value <= 3) return { label: "Mild", color: "var(--color-success)" };
  if (value <= 6) return { label: "Moderate", color: "var(--color-warn)" };
  return { label: "Severe", color: "#dc2626" };
}

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const NPRS_MEASURE = {
  name: "NPRS",
  fullName: "Numeric Pain Rating Scale",
  measures: "Patient-reported pain intensity on a single 0-10 scale.",
  population: "Any patient reporting pain",
  itemCount: "1 item",
} as const;

/** Fully functional — a single 0-10 slider with a real-time band label. */
export function NprsCalculator() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const result = interpret(value);

  return (
    <>
      <CalcCardShell {...NPRS_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="NPRS, Numeric Pain Rating Scale"
        onClose={() => setOpen(false)}
        testKey="nprs"
        testName="NPRS"
        result={{ value: `${value} / 10`, label: `${result.label} pain, 0-3 Mild, 4-6 Moderate, 7-10 Severe` }}
      >
        <div className="pro-slider-row">
          <label htmlFor="nprs-slider" style={{ fontSize: 13 }}>
            Rate current pain, 0 (no pain) to 10 (worst pain imaginable)
          </label>
          <input
            id="nprs-slider"
            type="range"
            className="pro-slider"
            min={0}
            max={10}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          <div className="pro-slider-scale">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
        <div className="pro-calc-result" style={{ marginTop: 16 }}>
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {value} / 10
          </div>
          <div className="pro-calc-result-label">{result.label} pain, 0-3 Mild, 4-6 Moderate, 7-10 Severe</div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", marginTop: 12 }}>
          Minimal clinically important difference: 2 points (general musculoskeletal pain populations). A single-item
          scale like this doesn&rsquo;t have a well-established minimal detectable change.
        </p>
      </CalcModal>
    </>
  );
}
