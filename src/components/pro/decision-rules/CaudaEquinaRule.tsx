"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";
import { AlertCircleIcon } from "@/components/icons";

const FLAGS = ["Saddle anesthesia", "Bladder dysfunction, retention or incontinence", "Bowel dysfunction", "Bilateral leg weakness", "Severe or progressive neurological deficit"];

export function CaudaEquinaRule({ open }: { open?: boolean }) {
  const [checked, setChecked] = useState<boolean[]>(Array(FLAGS.length).fill(false));
  const anyPositive = checked.some(Boolean);

  return (
    <RuleAccordion title="Cauda Equina Red Flags" summary="Emergency referral checklist, cauda equina syndrome" open={open}>
      {FLAGS.map((c, i) => (
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
      {anyPositive && (
        <div className="pro-alert-critical">
          <AlertCircleIcon size={22} />
          Immediate emergency referral indicated, do not delay
        </div>
      )}
    </RuleAccordion>
  );
}
