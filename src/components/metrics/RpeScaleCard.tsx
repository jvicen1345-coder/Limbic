"use client";

import { useState } from "react";
import { RPE_SCALE, interpretRpe } from "@/lib/metrics";

/** Green (6, no exertion) to red (20, maximal) — computed rather than 15 individual CSS
 *  rules, one per scale point, since the color is a pure linear function of the value. */
function rpeColor(value: number): string {
  const t = (value - 6) / (20 - 6);
  return `color-mix(in srgb, var(--color-danger) ${Math.round(t * 100)}%, var(--color-vitals-mobility))`;
}

export function RpeScaleCard() {
  const [selected, setSelected] = useState<number | null>(null);
  const interpretation = selected != null ? interpretRpe(selected) : null;

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">RPE Scale — Rate of Perceived Exertion</div>
      <p className="wellness-calc-desc">
        Not a calculator — an interactive reference. The Borg RPE scale runs from 6 (no exertion) to 20 (maximal effort). Tap a number
        below to see what it means.
      </p>

      <div className="wellness-rpe-scale">
        {RPE_SCALE.map((point) => (
          <button
            key={point.value}
            type="button"
            className={`wellness-rpe-point${selected === point.value ? " wellness-rpe-point--selected" : ""}`}
            style={{ background: rpeColor(point.value) }}
            onClick={() => setSelected(point.value)}
            aria-pressed={selected === point.value}
          >
            <span className="wellness-rpe-point-value">{point.value}</span>
            {point.label && <span className="wellness-rpe-point-label">{point.label}</span>}
          </button>
        ))}
      </div>

      {interpretation && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-value" style={{ fontSize: 20 }}>
            {interpretation.label}
          </div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 6 }}>{interpretation.recommendation}</p>
        </div>
      )}

      <details className="wellness-calc-education">
        <summary>What does this mean?</summary>
        <p>
          RPE lets you gauge training intensity using your own perceived effort instead of — or alongside — a heart rate monitor. It&rsquo;s
          especially useful when heart rate data isn&rsquo;t available, is affected by heat, stress, or medication, or when you simply
          want a quick gut-check on how a set or session actually felt. Matching your RPE to your intended training zone helps make sure
          your effort matches your goal for that day.
        </p>
      </details>
      <div className="wellness-calc-source">Source: Borg, 1982 — Journal of Physical Education</div>
    </div>
  );
}
