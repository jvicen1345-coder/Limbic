"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

const CRITERIA = ["No posterior midline cervical tenderness", "No evidence of intoxication", "Normal level of alertness", "No focal neurological deficit", "No painful distracting injury"];

export function NexusRule({ open }: { open?: boolean }) {
  const [checked, setChecked] = useState<boolean[]>(Array(CRITERIA.length).fill(false));
  const allPresent = checked.every(Boolean);

  return (
    <RuleAccordion title="NEXUS Criteria" summary="Cervical spine imaging after trauma, low risk criteria" open={open}>
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
      <div className={`pro-result-banner pro-result-banner--${allPresent ? "negative" : "positive"}`}>
        {allPresent ? "Cleared without imaging, all five criteria met" : "Imaging required, all five criteria must be present to clear"}
      </div>
    </RuleAccordion>
  );
}
