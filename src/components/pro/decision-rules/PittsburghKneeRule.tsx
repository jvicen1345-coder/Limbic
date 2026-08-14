"use client";

import { useState } from "react";
import { RuleAccordion } from "./RuleAccordion";

export function PittsburghKneeRule() {
  const [mechanism, setMechanism] = useState(false);
  const [ageCriterion, setAgeCriterion] = useState(false);
  const [unableToBearWeight, setUnableToBearWeight] = useState(false);

  const indicated = mechanism && (ageCriterion || unableToBearWeight);

  return (
    <RuleAccordion title="Pittsburgh Knee Rules" summary="Knee fracture screening, alternative to Ottawa">
      <label className="pro-check-row">
        <input type="checkbox" checked={mechanism} onChange={(e) => setMechanism(e.target.checked)} />
        Blunt trauma or fall mechanism
      </label>
      <label className="pro-check-row">
        <input type="checkbox" checked={ageCriterion} onChange={(e) => setAgeCriterion(e.target.checked)} />
        Age under 12 or over 50
      </label>
      <label className="pro-check-row">
        <input type="checkbox" checked={unableToBearWeight} onChange={(e) => setUnableToBearWeight(e.target.checked)} />
        Unable to bear weight, 4 steps, in the ED
      </label>
      <div className={`pro-result-banner pro-result-banner--${indicated ? "positive" : "negative"}`}>
        {mechanism ? (indicated ? "X-ray indicated" : "X-ray not indicated") : "Requires blunt trauma or fall mechanism to apply"}
      </div>
    </RuleAccordion>
  );
}
