"use client";

import { useState } from "react";

interface LabRow {
  name: string;
  abbrev: string;
  range: string;
  relevance: string;
  exercise: string;
  hold?: string;
  tags: string[];
}

const CATEGORIES = ["All", "Blood Count", "Metabolic", "Cardiac", "Coagulation", "Inflammatory", "Glucose", "Electrolytes"] as const;

const ROWS: LabRow[] = [
  { name: "White Blood Cell", abbrev: "WBC", range: "4.5-11.0 K/uL", relevance: "Infection, immune status", exercise: "Very low counts raise infection risk with exertion", tags: ["Blood Count"] },
  { name: "Red Blood Cell", abbrev: "RBC", range: "M: 4.5-5.5, F: 4.0-5.0 M/uL", relevance: "Oxygen carrying capacity", exercise: "Low counts reduce aerobic exercise tolerance", tags: ["Blood Count"] },
  { name: "Hemoglobin", abbrev: "Hgb", range: "M: 13.5-17.5, F: 12.0-15.5 g/dL", relevance: "Anemia, exercise tolerance", exercise: "Monitor for fatigue, dyspnea disproportionate to activity", hold: "Below 8 g/dL, hold vigorous exercise", tags: ["Blood Count"] },
  { name: "Hematocrit", abbrev: "Hct", range: "M: 41-53%, F: 36-46%", relevance: "Oxygen delivery", exercise: "Low values pair with reduced exercise capacity", tags: ["Blood Count"] },
  { name: "Platelets", abbrev: "PLT", range: "150-400 K/uL", relevance: "Bleeding precautions", exercise: "Low counts raise bruising/bleeding risk with resistive work", hold: "Below 50K, no resistive exercise", tags: ["Blood Count"] },

  { name: "Sodium", abbrev: "Na", range: "136-145 mEq/L", relevance: "Fluid balance", exercise: "Abnormal values may signal dehydration/overhydration risk", tags: ["Metabolic", "Electrolytes"] },
  { name: "Potassium", abbrev: "K", range: "3.5-5.0 mEq/L", relevance: "Cardiac function, muscle function", exercise: "Abnormal values raise arrhythmia/cramping risk with exertion", hold: "Below 3.0 or above 6.0, hold exercise", tags: ["Metabolic", "Electrolytes"] },
  { name: "Creatinine", abbrev: "Cr", range: "M: 0.7-1.2, F: 0.5-1.0 mg/dL", relevance: "Renal function", exercise: "Impaired renal function may limit exercise capacity", tags: ["Metabolic"] },
  { name: "Blood Urea Nitrogen", abbrev: "BUN", range: "7-20 mg/dL", relevance: "Renal and hydration status", exercise: "Elevated values may reflect dehydration, hydrate before sessions", tags: ["Metabolic"] },
  { name: "Glucose", abbrev: "Glu", range: "70-100 mg/dL fasting", relevance: "Diabetes management", exercise: "Check before exercise in diabetic patients, exercise affects glucose", hold: "Below 70 or above 400, hold exercise", tags: ["Metabolic", "Glucose"] },
  { name: "Calcium", abbrev: "Ca", range: "8.5-10.5 mg/dL", relevance: "Bone health, muscle function", exercise: "Abnormal values affect muscle contraction and bone loading tolerance", tags: ["Metabolic", "Electrolytes"] },

  { name: "Troponin I", abbrev: "TnI", range: "Less than 0.04 ng/mL", relevance: "Myocardial injury", exercise: "Any elevation is a contraindication to exertion pending workup", hold: "Elevated, hold exercise, contact physician", tags: ["Cardiac"] },
  { name: "B-type Natriuretic Peptide", abbrev: "BNP", range: "Less than 100 pg/mL", relevance: "Heart failure severity", exercise: "Elevated values may limit exercise tolerance, monitor for dyspnea", tags: ["Cardiac"] },
  { name: "Creatine Kinase, Total", abbrev: "CK", range: "22-198 U/L", relevance: "Muscle damage", exercise: "Elevated after intense exercise, distinguish from cardiac injury", tags: ["Cardiac"] },
  { name: "Creatine Kinase, MB", abbrev: "CK-MB", range: "Less than 3% of total CK", relevance: "Cardiac specificity", exercise: "Helps distinguish cardiac from skeletal muscle source of CK", tags: ["Cardiac"] },

  { name: "Prothrombin Time", abbrev: "PT", range: "11-13 seconds", relevance: "Bleeding risk", exercise: "Prolonged values raise bleeding/bruising risk with manual therapy", tags: ["Coagulation"] },
  { name: "International Normalized Ratio", abbrev: "INR", range: "0.8-1.2, therapeutic 2-3", relevance: "Anticoagulation monitoring", exercise: "Guides manual therapy intensity and fall-risk precautions", hold: "Above 3.5, contact physician before exercise", tags: ["Coagulation"] },
  { name: "Activated Partial Thromboplastin Time", abbrev: "aPTT", range: "25-35 seconds", relevance: "Heparin monitoring", exercise: "Prolonged values raise bleeding risk with resistive or manual work", tags: ["Coagulation"] },

  { name: "Erythrocyte Sedimentation Rate", abbrev: "ESR", range: "M: 0-15, F: 0-20 mm/hr", relevance: "Inflammation marker", exercise: "Elevated values may indicate an active process, screen before loading", tags: ["Inflammatory"] },
  { name: "C-Reactive Protein", abbrev: "CRP", range: "Less than 1.0 mg/dL", relevance: "Acute inflammation", exercise: "Elevated values may indicate infection or acute flare", tags: ["Inflammatory"] },
  { name: "Uric Acid", abbrev: "UA", range: "M: 3.4-7.0, F: 2.4-6.0 mg/dL", relevance: "Gout", exercise: "Elevated values correlate with gout flare risk at loaded joints", tags: ["Inflammatory"] },
];

const HOLD_GUIDELINES = [
  "Hemoglobin below 8 g/dL, hold vigorous exercise",
  "Platelets below 50K, no resistive exercise",
  "Potassium below 3.0 or above 6.0, hold exercise",
  "Resting glucose below 70 or above 400, hold exercise",
  "INR above 3.5, contact physician before exercise",
  "Troponin elevated, hold exercise, contact physician",
];

export function LabValuesReference() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const filtered = category === "All" ? ROWS : ROWS.filter((r) => r.tags.includes(category));

  return (
    <>
      <div className="pro-disclaimer">Reference values vary by laboratory. Always verify with the ordering institution.</div>
      <div className="pro-filter-bar">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`pro-filter-chip${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="pro-table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Lab Value</th>
              <th>Abbrev</th>
              <th>Normal Range</th>
              <th>PT Relevance</th>
              <th>Exercise Implications</th>
              <th>When to Hold Exercise</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.abbrev}</td>
                <td>{row.range}</td>
                <td>{row.relevance}</td>
                <td>{row.exercise}</td>
                <td className={row.hold ? "pro-table-hold" : undefined}>{row.hold ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card elev-sm" style={{ marginTop: 16 }}>
        <div className="card-kicker">Exercise hold guidelines</div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {HOLD_GUIDELINES.map((g) => (
            <li key={g} style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
              {g}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
