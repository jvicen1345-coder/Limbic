"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// TODO: Replace these generic section placeholders with the real 10 published Oswestry
// section names (pain intensity, personal care, lifting, walking, sitting, standing,
// sleeping, sex life, social life, traveling) and their full 0-5 wording before launch.
const OSWESTRY_SECTIONS = Array.from({ length: 10 }, (_, i) => `Section ${i + 1}`);

function interpretOswestry(pct: number) {
  if (pct <= 20) return { label: "Minimal disability", color: "var(--color-success)" };
  if (pct <= 40) return { label: "Moderate disability", color: "var(--color-warn)" };
  if (pct <= 60) return { label: "Severe disability", color: "#dc2626" };
  if (pct <= 80) return { label: "Crippled", color: "#dc2626" };
  return { label: "Bed bound or exaggerating", color: "#dc2626" };
}

/** Functional with formula — the real Oswestry formula, (total / 50) x 100, applied to 10
 *  generic placeholder sections pending the real section wording (see TODO above). */
export function OswestryCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const percent = Math.round((total / 50) * 100);
  const result = interpretOswestry(percent);

  return (
    <>
      <CalcCardShell
        name="Oswestry"
        fullName="Oswestry Low Back Pain Disability Index"
        measures="Patient-reported disability across 10 activities of daily living."
        population="Low back pain"
        itemCount="10 sections"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="Oswestry Low Back Pain Disability Index" onClose={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {OSWESTRY_SECTIONS.map((section, i) => (
            <div className="pro-item-row" key={section}>
              <span className="pro-item-row-label">{section}</span>
              <select
                className="input pro-item-row-select"
                value={scores[i]}
                onChange={(e) => {
                  const next = [...scores];
                  next[i] = Number(e.target.value);
                  setScores(next);
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {percent}%
          </div>
          <div className="pro-calc-result-label">{result.label}</div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", marginTop: 8 }}>
          0-20% minimal, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed bound or exaggerating.
        </p>
      </CalcModal>
    </>
  );
}
