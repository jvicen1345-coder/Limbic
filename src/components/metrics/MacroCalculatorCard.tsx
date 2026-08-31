"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateMacros, type MacroSex, type MacroResult, type MacroActivityLevel } from "@/lib/nutrition-macros";
import type { WellnessGoal, WellnessProfile } from "@/lib/vitals";

export function MacroCalculatorCard({ profile }: { profile: WellnessProfile }) {
  const [expectedWeightLbs, setExpectedWeightLbs] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState("");
  const [result, setResult] = useState<MacroResult | null>(null);

  const sex: MacroSex = profile.biologicalSex === "Male" ? "male" : "female";
  const activityLevel = (profile.activityLevel as MacroActivityLevel) || "Sedentary";
  const goal = (profile.wellnessGoal as WellnessGoal) || "General Health";
  const isWeightManagement = goal === "Weight Management";

  const hasProfile = profile.age != null && profile.age > 0 && profile.weightLbs != null && profile.weightLbs > 0 && profile.heightFeet != null && profile.heightFeet >= 0;

  const handleCalculate = () => {
    if (!hasProfile) return;
    const totalInches = (profile.heightFeet ?? 0) * 12 + (profile.heightInches ?? 0);
    const hasWeightGoal = isWeightManagement && Number(expectedWeightLbs) > 0 && Number(timelineWeeks) > 0;
    setResult(
      calculateMacros({
        age: profile.age!,
        weightLbs: profile.weightLbs!,
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
      <p className="wellness-calc-desc">Estimates your daily calorie and macronutrient targets, free for everyone.</p>

      {!hasProfile ? (
        <div className="wellness-calc-missing-profile">
          Add your age, weight, height, sex, activity level, and goal on the <Link href="/wellness/metrics#body-metrics">Metrics page</Link> to
          calculate your macros.
        </div>
      ) : (
        <>
          <p className="wellness-calc-desc" style={{ marginTop: -6 }}>
            Using your saved profile, {profile.age}yo, {profile.weightLbs} lbs, {profile.heightFeet}&rsquo;{profile.heightInches ?? 0}
            &rdquo;, {activityLevel}, goal: {goal}. <Link href="/wellness/metrics#body-metrics">Update</Link>
          </p>

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
              <p className="wellness-macro-weightgoal-hint">Optional; add these to dial your calorie target to a specific weight and timeline instead of a flat maintenance estimate.</p>
            </div>
          )}

          <button type="button" className="btn btn-primary" onClick={handleCalculate}>
            Calculate
          </button>
        </>
      )}

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
                Protein: {result.proteinGrams}g ({result.proteinPct}%)
              </span>
              <span className="wellness-macro-legend-item wellness-macro-legend-item--carb">
                Carbs: {result.carbGrams}g ({result.carbPct}%)
              </span>
              <span className="wellness-macro-legend-item wellness-macro-legend-item--fat">
                Fat: {result.fatGrams}g ({result.fatPct}%)
              </span>
            </div>
            {result.proteinCapped && (
              <p className="wellness-macro-weightgoal-hint" style={{ marginTop: 8 }}>
                Protein was capped to keep this calorie target realistic across all three macros; a very low calorie target can&rsquo;t
                fit a full bodyweight-based protein goal.
              </p>
            )}
          </div>
        </div>
      )}

      <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-600)", marginTop: 14 }}>
        These are estimated general guidelines based on population averages. Individual needs vary. Consult a registered dietitian for
        personalized nutrition planning.
      </p>
      <div className="wellness-calc-source">
        Sources: Mifflin MD, St Jeor ST, et al. Journal of the American Dietetic Association, 1990 (calories) · ISSN Position Stand on
        Protein and Exercise (protein target) · the widely-used ~3,500 kcal/lb rule of thumb (weight timeline, a simplification, not an
        exact prediction)
      </div>
    </div>
  );
}
