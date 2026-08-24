"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

/** One interactive red-flag checklist category (the Red Flag Screening tab of
 *  /pro/decision-rules, see ScreeningDecisionTabs.tsx) — each checked flag turns red and
 *  the running positive count shows in the collapsed summary. */
export function RedFlagCategory({ title, flags }: { title: string; flags: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(Array(flags.length).fill(false));
  const count = checked.filter(Boolean).length;

  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={`pro-flag-count${count > 0 ? " pro-flag-count--active" : ""}`}>{count} positive</span>
          <ChevronRightIcon size={16} className="pro-accordion-chevron" />
        </div>
      </summary>
      <div className="pro-accordion-content">
        {flags.map((flag, i) => (
          <label className={`pro-check-row${checked[i] ? " pro-check-row--flagged" : ""}`} key={flag}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => {
                const next = [...checked];
                next[i] = e.target.checked;
                setChecked(next);
              }}
            />
            {flag}
          </label>
        ))}
      </div>
    </details>
  );
}
