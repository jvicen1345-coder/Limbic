"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

const CRITERIA: { label: string; points: number }[] = [
  { label: "Active cancer, treatment ongoing or within 6 months", points: 1 },
  { label: "Paralysis, paresis, or recent plaster immobilization of the lower extremity", points: 1 },
  { label: "Recently bedridden 3+ days, or major surgery within 12 weeks", points: 1 },
  { label: "Localized tenderness along the deep venous system", points: 1 },
  { label: "Entire leg swollen", points: 1 },
  { label: "Calf swelling 3cm greater than the other side", points: 1 },
  { label: "Pitting edema, confined to the symptomatic leg", points: 1 },
  { label: "Collateral superficial veins, non-varicose", points: 1 },
  { label: "Alternative diagnosis as likely or more likely than DVT", points: -2 },
];

function interpret(score: number) {
  if (score >= 2) return { label: "High probability", color: "#dc2626" };
  if (score === 1) return { label: "Moderate probability", color: "var(--color-warn)" };
  return { label: "Low probability", color: "var(--color-success)" };
}

export function WellsDvtRule({ open }: { open?: boolean }) {
  const [checked, setChecked] = useState<boolean[]>(Array(CRITERIA.length).fill(false));
  const score = CRITERIA.reduce((sum, c, i) => sum + (checked[i] ? c.points : 0), 0);
  const result = interpret(score);

  return (
    <RuleAccordion title="Wells Criteria for DVT" summary="Deep vein thrombosis risk stratification" open={open}>
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
          {c.label} ({c.points > 0 ? "+" : ""}
          {c.points})
        </label>
      ))}
      <div className="pro-calc-result">
        <div className="pro-calc-result-value" style={{ color: result.color }}>
          {score} points
        </div>
        <div className="pro-calc-result-label">{result.label}, score &ge;2 high, 1 moderate, &le;0 low</div>
      </div>
    </RuleAccordion>
  );
}
