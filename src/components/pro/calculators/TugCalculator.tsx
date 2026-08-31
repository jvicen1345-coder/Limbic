"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

const NORMS = [
  { max: 10, label: "Normal", color: "var(--color-success)" },
  { max: 20, label: "Good mobility, fall risk low", color: "var(--color-success)" },
  { max: 30, label: "Moderate fall risk", color: "var(--color-warn)" },
  { max: Infinity, label: "High fall risk, functional impairment", color: "#dc2626" },
];

function interpretTug(seconds: number) {
  return NORMS.find((n) => seconds <= n.max) ?? NORMS[NORMS.length - 1];
}

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const TUG_MEASURE = {
  name: "Timed Up and Go",
  fullName: "TUG",
  measures: "Functional mobility and fall risk from a single timed sit-to-walk-to-sit trial.",
  population: "Older adults, general mobility/fall-risk screening",
  itemCount: "1 item",
  administration: "Clinician-Administered",
} as const;

/** Fully functional — a single timed-seconds input compared against the standard TUG
 *  norms bands, either typed in directly or filled from the built-in stopwatch (see
 *  CalcTimer). */
export function TugCalculator() {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState("");
  const parsed = Number(seconds);
  const valid = seconds !== "" && Number.isFinite(parsed) && parsed >= 0;
  const result = valid ? interpretTug(parsed) : null;

  return (
    <>
      <CalcCardShell {...TUG_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="Timed Up and Go"
        onClose={() => setOpen(false)}
        testKey="tug"
        testName="Timed Up and Go"
        result={result ? { value: `${parsed}s`, label: result.label } : null}
      >
        <CalcTimer mode="stopwatch" onUseTime={(s) => setSeconds(String(s))} />
        <div className="field">
          <label htmlFor="tug-seconds">Time, seconds</label>
          <input
            id="tug-seconds"
            className="input"
            type="number"
            min={0}
            step={0.1}
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
          />
        </div>
        {result && (
          <div className="pro-calc-result" style={{ marginTop: 14 }}>
            <div className="pro-calc-result-value" style={{ color: result.color }}>
              {parsed}s
            </div>
            <div className="pro-calc-result-label">{result.label}</div>
          </div>
        )}
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 12 }}>
          Norms: under 10s normal, 10-20s good mobility/low fall risk, 20-30s moderate fall risk, over 30s high fall
          risk/functional impairment. Age-adjusted norms vary by population, use clinical judgment alongside this
          general cutoff. Minimal detectable change: ~4 seconds (community-dwelling older adults); MCID varies
          substantially by population and condition, with no single widely-accepted value.
        </p>
      </CalcModal>
    </>
  );
}
