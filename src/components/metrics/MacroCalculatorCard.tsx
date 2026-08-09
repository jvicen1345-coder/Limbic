"use client";

import { useState } from "react";
import {
  calculateMacros,
  ACTIVITY_LEVEL_OPTIONS,
  WELLNESS_GOAL_OPTIONS,
  type MacroSex,
  type MacroResult,
  type MacroActivityLevel,
} from "@/lib/nutrition-macros";
import type { WellnessGoal } from "@/lib/vitals";

export function MacroCalculatorCard({
  initialAge,
  initialWeightLbs,
  initialHeightFeet,
  initialHeightInches,
  initialSex,
  initialActivityLevel,
  initialGoal,
}: {
  initialAge: number | null;
  initialWeightLbs: number | null;
  initialHeightFeet: number | null;
  initialHeightInches: number | null;
  initialSex: string | null;
  initialActivityLevel: string | null;
  initialGoal: string | null;
}) {
  const [age, setAge] = useState(initialAge?.toString() ?? "");
  const [weightLbs, setWeightLbs] = useState(initialWeightLbs?.toString() ?? "");
  const [heightFeet, setHeightFeet] = useState(initialHeightFeet?.toString() ?? "");
  const [heightInches, setHeightInches] = useState(initialHeightInches?.toString() ?? "");
  const [sex, setSex] = useState<MacroSex>(initialSex === "Male" ? "male" : "female");
  const [activityLevel, setActivityLevel] = useState<MacroActivityLevel>(
    (initialActivityLevel as MacroActivityLevel) || "Sedentary"
  );
  const [goal, setGoal] = useState<WellnessGoal>((initialGoal as WellnessGoal) || "General Health");
  const [result, setResult] = useState<MacroResult | null>(null);

  const canCalculate = Number(age) > 0 && Number(weightLbs) > 0 && Number(heightFeet) >= 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const totalInches = Number(heightFeet) * 12 + (Number(heightInches) || 0);
    setResult(
      calculateMacros({
        age: Number(age),
        weightLbs: Number(weightLbs),
        heightInches: totalInches,
        sex,
        activityLevel,
        goal,
      })
    );
  };

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">Macro Calculator</div>
      <p className="wellness-calc-desc">Estimates your daily calorie and macronutrient targets — free for everyone.</p>

      <div className="wellness-calc-inputs">
        <div className="field" style={{ flex: 1, minWidth: 70 }}>
          <label htmlFor="macro-age">Age</label>
          <input className="input" id="macro-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 100 }}>
          <label htmlFor="macro-weight">Weight (lbs)</label>
          <input className="input" id="macro-weight" type="number" min={0} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 70 }}>
          <label htmlFor="macro-height-ft">Height (ft)</label>
          <input className="input" id="macro-height-ft" type="number" min={0} value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 70 }}>
          <label htmlFor="macro-height-in">Height (in)</label>
          <input
            className="input"
            id="macro-height-in"
            type="number"
            min={0}
            max={11}
            value={heightInches}
            onChange={(e) => setHeightInches(e.target.value)}
          />
        </div>
      </div>
      <div className="wellness-calc-inputs">
        <div className="field" style={{ flex: 1, minWidth: 110 }}>
          <label htmlFor="macro-sex">Sex</label>
          <select className="input" id="macro-sex" value={sex} onChange={(e) => setSex(e.target.value as MacroSex)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div className="field" style={{ flex: 1, minWidth: 150 }}>
          <label htmlFor="macro-activity">Activity level</label>
          <select className="input" id="macro-activity" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as MacroActivityLevel)}>
            {ACTIVITY_LEVEL_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: 1, minWidth: 150 }}>
          <label htmlFor="macro-goal">Goal</label>
          <select className="input" id="macro-goal" value={goal} onChange={(e) => setGoal(e.target.value as WellnessGoal)}>
            {WELLNESS_GOAL_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="button" className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
        Calculate
      </button>

      {result && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.calories.toLocaleString()}</span>
            <span className="wellness-calc-result-unit">calories / day</span>
          </div>

          <div className="wellness-macro-split">
            <div className="wellness-macro-bar">
              <span className="wellness-macro-bar-segment wellness-macro-bar-segment--protein" style={{ width: `${result.proteinPct}%` }} />
              <span className="wellness-macro-bar-segment wellness-macro-bar-segment--carb" style={{ width: `${result.carbPct}%` }} />
              <span className="wellness-macro-bar-segment wellness-macro-bar-segment--fat" style={{ width: `${result.fatPct}%` }} />
            </div>
            <div className="wellness-macro-legend">
              <span className="wellness-macro-legend-item wellness-macro-legend-item--protein">
                Protein — {result.proteinGrams}g ({result.proteinPct}%)
              </span>
              <span className="wellness-macro-legend-item wellness-macro-legend-item--carb">
                Carbs — {result.carbGrams}g ({result.carbPct}%)
              </span>
              <span className="wellness-macro-legend-item wellness-macro-legend-item--fat">
                Fat — {result.fatGrams}g ({result.fatPct}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 14 }}>
        These are estimated general guidelines based on population averages. Individual needs vary. Consult a registered dietitian for
        personalized nutrition planning.
      </p>
      <div className="wellness-calc-source">Source: Mifflin MD, St Jeor ST, et al. Journal of the American Dietetic Association, 1990</div>
    </div>
  );
}
