"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

const HIGH_RISK = ["Age 65 or older", "Dangerous mechanism, fall from height, axial load, high-speed MVC, ejection, motorized recreational vehicle, bicycle collision", "Paresthesias in extremities"];
const LOW_RISK = ["Simple rear-end motor vehicle collision", "Sitting position in the ED", "Ambulatory at any time since injury", "Delayed onset of neck pain", "Absence of midline cervical tenderness"];

/** Three-step interactive decision tree — a high-risk factor requires imaging outright; no
 *  low-risk factor also requires imaging (ROM can't be safely assessed); otherwise ROM
 *  itself decides. */
export function CanadianCSpineRule({ open }: { open?: boolean }) {
  const [highRisk, setHighRisk] = useState<boolean[]>(Array(HIGH_RISK.length).fill(false));
  const [lowRisk, setLowRisk] = useState<boolean[]>(Array(LOW_RISK.length).fill(false));
  const [canRotate45, setCanRotate45] = useState<boolean | null>(null);

  const anyHighRisk = highRisk.some(Boolean);
  const anyLowRisk = lowRisk.some(Boolean);

  let result: { label: string; positive: boolean } | null = null;
  if (anyHighRisk) {
    result = { label: "Imaging required, high-risk factor present", positive: true };
  } else if (!anyLowRisk) {
    result = { label: "Imaging required, no low-risk factor present to allow safe ROM assessment", positive: true };
  } else if (canRotate45 === true) {
    result = { label: "No imaging required, able to actively rotate 45 degrees each way", positive: false };
  } else if (canRotate45 === false) {
    result = { label: "Imaging required, unable to actively rotate 45 degrees each way", positive: true };
  }

  return (
    <RuleAccordion title="Canadian C-Spine Rules" summary="Cervical spine clearance after trauma" open={open}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Step 1, any high risk factor present?</div>
        {HIGH_RISK.map((c, i) => (
          <label className="pro-check-row" key={c}>
            <input
              type="checkbox"
              checked={highRisk[i]}
              onChange={(e) => {
                const next = [...highRisk];
                next[i] = e.target.checked;
                setHighRisk(next);
              }}
            />
            {c}
          </label>
        ))}
      </div>
      {!anyHighRisk && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Step 2, any low risk factor present?</div>
          {LOW_RISK.map((c, i) => (
            <label className="pro-check-row" key={c}>
              <input
                type="checkbox"
                checked={lowRisk[i]}
                onChange={(e) => {
                  const next = [...lowRisk];
                  next[i] = e.target.checked;
                  setLowRisk(next);
                }}
              />
              {c}
            </label>
          ))}
        </div>
      )}
      {!anyHighRisk && anyLowRisk && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
            Step 3, able to actively rotate neck 45 degrees, both left and right?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={canRotate45 === true ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setCanRotate45(true)}>
              Yes
            </button>
            <button type="button" className={canRotate45 === false ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setCanRotate45(false)}>
              No
            </button>
          </div>
        </div>
      )}
      {result && <div className={`pro-result-banner pro-result-banner--${result.positive ? "positive" : "negative"}`}>{result.label}</div>}
    </RuleAccordion>
  );
}
