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
  const [expectedWeightLbs, setExpectedWeightLbs] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("");
  const [result, setResult] = useState<MacroResult | null>(null);

  const isWeightManagement = goal === "Weight Management";
  const canCalculate = Number(age) > 0 && Number(weightLbs) > 0 && Number(heightFeet) >= 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const totalInches = Number(heightFeet) * 12 + (Number(heightInches) || 0);
    const hasWeightGoal = isWeightManagement && Number(expectedWeightLbs) > 0 && Number(timelineWeeks) > 0;
    setResult(
      calculateMacros({
        age: Number(age),
        weightLbs: Number(weightLbs),
        heightInches: totalInches,
        sex,
        activityLevel,
        goal,
        weightGoal: hasWeightGoal ? { expectedWeightLbs: Number(expectedWeightLbs), timelineWeeks: Number(timelineWeeks) } : undefined,
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

      {isWeightManagement && (
        <div className="wellness-calc-inputs wellness-macro-weightgoal">
          <div className="field" style={{ flex: 1, minWidth: 130 }}>
            <label htmlFor="macro-expected-weight">Target weight (lbs)</label>
            <input
              className="input"
              id="macro-expected-weight"
              type="number"
              min={0}
              value={expectedWeightLbs}
              onChange={(e) => setExpectedWeightLbs(e.target.value)}
              placeholder="e.g. 150"
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 130 }}>
            <label htmlFor="macro-timeline">Timeline (weeks)</label>
            <input
              className="input"
              id="macro-timeline"
              type="number"
              min={1}
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <p className="wellness-macro-weightgoal-hint">Optional — add these to dial your calorie target to a specific weight and timeline instead of a flat maintenance estimate.</p>
        </div>
      )}

      <button type="button" className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
        Calculate
      </button>

      {result && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.calories.toLocaleString()}</span>
            <span className="wellness-calc-result-unit">calories / day</span>
          </div>

          {result.weightGoalAdjustment && (
            <p className="wellness-macro-weightgoal-result">
              {result.weightGoalAdjustment.weeklyRateLbs > 0
                ? `About ${Math.abs(result.weightGoalAdjustment.weeklyRateLbs).toFixed(1)} lb/week loss`
                : result.weightGoalAdjustment.weeklyRateLbs < 0
                  ? `About ${Math.abs(result.weightGoalAdjustment.weeklyRateLbs).toFixed(1)} lb/week gain`
                  : "Maintenance pace"}{" "}
              at this calorie target.
              {result.weightGoalAdjustment.wasClamped && (
                <span className="wellness-macro-weightgoal-warning">
                  {" "}
                  Your requested pace ({Math.abs(result.weightGoalAdjustment.requestedWeeklyRateLbs).toFixed(1)} lb/week) was faster than
                  generally recommended, so this is adjusted to a safer rate.
                </span>
              )}
            </p>
          )}

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
            {result.proteinCapped && (
              <p className="wellness-macro-weightgoal-hint" style={{ marginTop: 8 }}>
                Protein was capped to keep this calorie target realistic across all three macros — a very low calorie target can&rsquo;t
                fit a full bodyweight-based protein goal.
              </p>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 14 }}>
        These are estimated general guidelines based on population averages. Individual needs vary. Consult a registered dietitian for
        personalized nutrition planning.
      </p>
      <div className="wellness-calc-source">
        Sources: Mifflin MD, St Jeor ST, et al. Journal of the American Dietetic Association, 1990 (calories) · ISSN Position Stand on
        Protein and Exercise (protein target) · the widely-used ~3,500 kcal/lb rule of thumb (weight timeline — a simplification, not an
        exact prediction)
      </div>
    </div>
  );
}
