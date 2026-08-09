"use client";

import { useState, useTransition } from "react";
import { calculateBmi, bmiCategory, bmiSpectrumPercent, type BmiCategory } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";

const CATEGORY_CLASS: Record<BmiCategory, string> = {
  Underweight: "wellness-badge-fair",
  "Healthy Weight": "wellness-badge-good",
  Overweight: "wellness-badge-fair",
  Obese: "wellness-badge-poor",
};

export function BmiCalculatorCard({
  initialHeightFeet,
  initialHeightInches,
  initialWeightLbs,
}: {
  initialHeightFeet: number | null;
  initialHeightInches: number | null;
  initialWeightLbs: number | null;
}) {
  const [heightFeet, setHeightFeet] = useState(initialHeightFeet?.toString() ?? "");
  const [heightInches, setHeightInches] = useState(initialHeightInches?.toString() ?? "");
  const [weightLbs, setWeightLbs] = useState(initialWeightLbs?.toString() ?? "");
  const [result, setResult] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const canCalculate = Number(heightFeet) > 0 && Number(weightLbs) > 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    setResult(calculateBmi(Number(heightFeet), Number(heightInches) || 0, Number(weightLbs)));
    setSaved(false);
  };

  const handleSave = () => {
    if (result == null) return;
    startTransition(async () => {
      await saveMetricLog("bmi", result);
      setSaved(true);
    });
  };

  const category = result != null ? bmiCategory(result) : null;

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">BMI — Body Mass Index</div>
      <p className="wellness-calc-desc">
        A general screening measure comparing your weight to your height, used across population health research.
      </p>

      <div className="wellness-calc-inputs">
        <div className="field" style={{ flex: 1, minWidth: 90 }}>
          <label htmlFor="bmi-height-feet">Height (ft)</label>
          <input className="input" id="bmi-height-feet" type="number" min={0} value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 90 }}>
          <label htmlFor="bmi-height-inches">Height (in)</label>
          <input
            className="input"
            id="bmi-height-inches"
            type="number"
            min={0}
            max={11}
            value={heightInches}
            onChange={(e) => setHeightInches(e.target.value)}
          />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 90 }}>
          <label htmlFor="bmi-weight">Weight (lbs)</label>
          <input className="input" id="bmi-weight" type="number" min={0} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
        </div>
      </div>

      <button type="button" className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
        Calculate
      </button>

      {result != null && category && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.toFixed(1)}</span>
            <span className={`wellness-badge ${CATEGORY_CLASS[category]}`}>{category}</span>
          </div>
          <div className="wellness-spectrum-bar">
            <div className="wellness-spectrum-marker" style={{ left: `${bmiSpectrumPercent(result)}%` }} />
          </div>
          <div className="wellness-spectrum-labels">
            <span>Underweight</span>
            <span>Healthy</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save to my metrics"}
            </button>
            {saved && <CheckIcon size={14} className="profile-date-saved-check" />}
          </div>

          <p className="wellness-calc-caution">
            BMI does not account for muscle mass, bone density, age, or body composition — it&rsquo;s a general population screening
            measure, not a diagnostic one. A very muscular person can score as &ldquo;overweight&rdquo; despite low body fat.
          </p>
        </div>
      )}

      <details className="wellness-calc-education">
        <summary>What does this mean?</summary>
        <p>
          BMI is a simple ratio of weight to height used as a general population-level screening tool. It doesn&rsquo;t directly measure body
          fat, and it has real limitations — BMI does not account for muscle mass, bone density, or body composition. A very muscular
          person can score as &ldquo;overweight&rdquo; despite low body fat. Use it as one general data point, not a complete picture of
          health.
        </p>
      </details>
      <div className="wellness-calc-source">
        Source: World Health Organization (WHO) — <a href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" target="_blank" rel="noopener noreferrer">who.int obesity and overweight fact sheet</a>
      </div>
    </div>
  );
}
