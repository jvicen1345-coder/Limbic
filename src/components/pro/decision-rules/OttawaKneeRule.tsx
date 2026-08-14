"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

const CRITERIA = ["Age 55 or older", "Tenderness at head of fibula", "Isolated tenderness of patella", "Inability to flex to 90 degrees", "Inability to bear weight, 4 steps, both immediately and in the ED"];

export function OttawaKneeRule() {
  const [checked, setChecked] = useState<boolean[]>(Array(CRITERIA.length).fill(false));
  const indicated = checked.some(Boolean);

  return (
    <RuleAccordion title="Ottawa Knee Rules" summary="Knee fracture screening">
      {CRITERIA.map((c, i) => (
        <label className="pro-check-row" key={c}>
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={(e) => {
              const next = [...checked];
              next[i] = e.target.checked;
              setChecked(next);
            }}
          />
          {c}
        </label>
      ))}
      <div className={`pro-result-banner pro-result-banner--${indicated ? "positive" : "negative"}`}>
        {indicated ? "X-ray indicated" : "X-ray not indicated"}
      </div>
    </RuleAccordion>
  );
}
