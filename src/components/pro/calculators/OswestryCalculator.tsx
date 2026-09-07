"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell, LicensedInstrumentNotice, ItemScoreRow } from "./CalcModal";

/**
 * The ODI 2.0's ten section headings — kept as row labels so the examiner can see which
 * section each score belongs to. The sixty graded statements that used to sit in the
 * dropdowns are gone; see LicensedInstrumentNotice in CalcModal.tsx for why, and don't put
 * them back. Section order matches the published form, so row N here is section N there.
 */
const OSWESTRY_SECTIONS = [
  "Pain intensity",
  "Personal care (washing, dressing, etc.)",
  "Lifting",
  "Walking",
  "Sitting",
  "Standing",
  "Sleeping",
  "Sex life",
  "Social life",
  "Traveling",
] as const;

function interpretOswestry(pct: number) {
  if (pct <= 20) return { label: "Minimal disability", color: "var(--color-success)" };
  if (pct <= 40) return { label: "Moderate disability", color: "var(--color-warn)" };
  if (pct <= 60) return { label: "Severe disability", color: "#dc2626" };
  if (pct <= 80) return { label: "Crippled", color: "#dc2626" };
  return { label: "Bed bound or exaggerating", color: "#dc2626" };
}

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const OSWESTRY_MEASURE = {
  name: "Oswestry",
  fullName: "Oswestry Low Back Pain Disability Index",
  measures: "Patient-reported disability across 10 activities of daily living.",
  population: "Low back pain",
  itemCount: "10 sections",
  administration: "Patient-Reported",
} as const;

/** Score entry for the ODI: ten section scores of 0-5 entered from the completed form,
 *  scored with the published formula, (total / 50) x 100. */
export function OswestryCalculator() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<number[]>(Array(10).fill(0));

  const total = scores.reduce((sum, s) => sum + s, 0);
  const percent = Math.round((total / 50) * 100);
  const result = interpretOswestry(percent);

  return (
    <>
      <CalcCardShell {...OSWESTRY_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="Oswestry Low Back Pain Disability Index"
        onClose={() => setOpen(false)}
        testKey="oswestry"
        testName="Oswestry"
        result={{ value: `${percent}%`, label: result.label }}
      >
        <LicensedInstrumentNotice instrument="ODI" developedBy="Fairbank & Pynsent" />
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          Enter each section&rsquo;s score, 0 (least disabled) to 5 (most disabled), from the completed form.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {OSWESTRY_SECTIONS.map((section, i) => (
            <ItemScoreRow
              key={section}
              label={`${i + 1}. ${section}`}
              scores={[0, 1, 2, 3, 4, 5]}
              value={scores[i]}
              onChange={(next) => {
                const updated = [...scores];
                updated[i] = next ?? 0;
                setScores(updated);
              }}
            />
          ))}
        </div>
        <div className="pro-calc-result" style={{ marginTop: 14 }}>
          <div className="pro-calc-result-value" style={{ color: result.color }}>
            {percent}%
          </div>
          <div className="pro-calc-result-label">
            {result.label} &middot; raw {total} / 50
          </div>
        </div>
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 8 }}>
          0-20% minimal, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed bound or exaggerating. Minimal
          detectable change: ~9 percentage points. Minimal clinically important difference: ~10 percentage points
          (commonly cited; varies with calculation method and population).
        </p>
      </CalcModal>
    </>
  );
}
