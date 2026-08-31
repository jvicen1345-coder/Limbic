"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

// The real published Oswestry Disability Index 2.0 section names and their full 0-5
// statement wording (Fairbank & Pynsent). Each section's statements are ordered least to
// most disabled, matching the select's 0-5 score values below.
const OSWESTRY_SECTIONS: { name: string; statements: string[] }[] = [
  {
    name: "Pain intensity",
    statements: [
      "I have no pain at the moment",
      "The pain is very mild at the moment",
      "The pain is moderate at the moment",
      "The pain is fairly severe at the moment",
      "The pain is very severe at the moment",
      "The pain is the worst imaginable at the moment",
    ],
  },
  {
    name: "Personal care (washing, dressing, etc.)",
    statements: [
      "I can look after myself normally without causing extra pain",
      "I can look after myself normally, but it causes extra pain",
      "It is painful to look after myself, and I am slow and careful",
      "I need some help but manage most of my personal care",
      "I need help every day in most aspects of self-care",
      "I do not get dressed, wash with difficulty, and stay in bed",
    ],
  },
  {
    name: "Lifting",
    statements: [
      "I can lift heavy weights without extra pain",
      "I can lift heavy weights, but it gives extra pain",
      "Pain prevents me from lifting heavy weights off the floor, but I can manage if they are conveniently positioned, e.g., on a table",
      "Pain prevents me from lifting heavy weights, but I can manage light to medium weights if they are conveniently positioned",
      "I can lift only very light weights",
      "I cannot lift or carry anything at all",
    ],
  },
  {
    name: "Walking",
    statements: [
      "Pain does not prevent me walking any distance",
      "Pain prevents me walking more than 1 mile",
      "Pain prevents me walking more than 1/2 mile",
      "Pain prevents me walking more than 1/4 mile",
      "I can only walk using a stick or crutches",
      "I am in bed most of the time and have to crawl to the toilet",
    ],
  },
  {
    name: "Sitting",
    statements: [
      "I can sit in any chair as long as I like",
      "I can only sit in my favorite chair as long as I like",
      "Pain prevents me from sitting more than 1 hour",
      "Pain prevents me from sitting more than 30 minutes",
      "Pain prevents me from sitting more than 10 minutes",
      "Pain prevents me from sitting at all",
    ],
  },
  {
    name: "Standing",
    statements: [
      "I can stand as long as I want without extra pain",
      "I can stand as long as I want, but it gives me extra pain",
      "Pain prevents me from standing for more than 1 hour",
      "Pain prevents me from standing for more than 30 minutes",
      "Pain prevents me from standing for more than 10 minutes",
      "Pain prevents me from standing at all",
    ],
  },
  {
    name: "Sleeping",
    statements: [
      "My sleep is never disturbed by pain",
      "My sleep is occasionally disturbed by pain",
      "Because of pain, I have less than 6 hours sleep",
      "Because of pain, I have less than 4 hours sleep",
      "Because of pain, I have less than 2 hours sleep",
      "Pain prevents me from sleeping at all",
    ],
  },
  {
    name: "Sex life (if applicable)",
    statements: [
      "My sex life is normal and causes no extra pain",
      "My sex life is normal but causes some extra pain",
      "My sex life is nearly normal but is very painful",
      "My sex life is severely restricted by pain",
      "My sex life is nearly absent because of pain",
      "Pain prevents any sex life at all",
    ],
  },
  {
    name: "Social life",
    statements: [
      "My social life is normal and gives me no extra pain",
      "My social life is normal but increases the degree of pain",
      "Pain has no significant effect on my social life apart from limiting my more energetic interests, e.g., sport",
      "Pain has restricted my social life, and I do not go out as often",
      "Pain has restricted my social life to my home",
      "I have no social life because of pain",
    ],
  },
  {
    name: "Traveling",
    statements: [
      "I can travel anywhere without pain",
      "I can travel anywhere, but it gives extra pain",
      "Pain is bad, but I manage journeys over 2 hours",
      "Pain restricts me to journeys of less than 1 hour",
      "Pain restricts me to short necessary journeys under 30 minutes",
      "Pain prevents me from traveling except to receive treatment",
    ],
  },
];

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

/** Fully functional — the real Oswestry Disability Index 2.0 section names and 0-5
 *  statement wording, scored with the real formula, (total / 50) x 100. */
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          {OSWESTRY_SECTIONS.map((section, i) => (
            <div className="pro-item-row" key={section.name}>
              <span className="pro-item-row-label">
                {i + 1}. {section.name}
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
                {section.statements.map((statement, s) => (
                  <option key={s} value={s}>
                    {s} — {statement}
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
        <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 8 }}>
          0-20% minimal, 21-40% moderate, 41-60% severe, 61-80% crippled, 81-100% bed bound or exaggerating. Minimal
          detectable change: ~9 percentage points. Minimal clinically important difference: ~10 percentage points
          (commonly cited; varies with calculation method and population).
        </p>
      </CalcModal>
    </>
  );
}
