"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

const CRITERIA: { label: string; points: number }[] = [
  { label: "Clinical signs and symptoms of DVT", points: 3 },
  { label: "PE is the #1 diagnosis, or equally likely", points: 3 },
  { label: "Heart rate greater than 100 bpm", points: 1.5 },
  { label: "Immobilization 3+ days, or surgery in the previous 4 weeks", points: 1.5 },
  { label: "Previous, objectively diagnosed DVT or PE", points: 1.5 },
  { label: "Hemoptysis", points: 1 },
  { label: "Malignancy, treated within 6 months or palliative", points: 1 },
];

function interpret(score: number) {
  if (score > 6) return { label: "High probability", color: "#dc2626" };
  if (score >= 2) return { label: "Moderate probability", color: "var(--color-warn)" };
  return { label: "Low probability", color: "var(--color-success)" };
}

export function WellsPeRule() {
  const [checked, setChecked] = useState<boolean[]>(Array(CRITERIA.length).fill(false));
  const score = CRITERIA.reduce((sum, c, i) => sum + (checked[i] ? c.points : 0), 0);
  const result = interpret(score);

  return (
    <RuleAccordion title="Wells Criteria for PE" summary="Pulmonary embolism risk stratification">
      {CRITERIA.map((c, i) => (
        <label className="pro-check-row" key={c.label}>
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={(e) => {
              const next = [...checked];
              next[i] = e.target.checked;
              setChecked(next);
            }}
          />
          {c.label} (+{c.points})
        </label>
      ))}
      <div className="pro-calc-result">
        <div className="pro-calc-result-value" style={{ color: result.color }}>
          {score} points
        </div>
        <div className="pro-calc-result-label">{result.label}, score &gt;6 high, 2&ndash;6 moderate, &lt;2 low</div>
      </div>
      <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 8 }}>
        A simplified two-tier version is also used clinically: score &le;4 as &ldquo;PE unlikely&rdquo; (consider
        D-dimer) and &gt;4 as &ldquo;PE likely&rdquo; (consider imaging), often paired with the PERC rule to decide
        whether further workup is needed at all in low-risk patients.
      </p>
    </RuleAccordion>
  );
}
