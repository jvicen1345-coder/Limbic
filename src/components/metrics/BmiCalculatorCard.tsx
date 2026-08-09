"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { calculateBmi, bmiCategory, bmiSpectrumPercent, type BmiCategory } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";
import type { WellnessProfile } from "@/lib/vitals";

const CATEGORY_CLASS: Record<BmiCategory, string> = {
  Underweight: "wellness-badge-fair",
  "Healthy Weight": "wellness-badge-good",
  Overweight: "wellness-badge-fair",
  Obese: "wellness-badge-poor",
};

export function BmiCalculatorCard({ profile }: { profile: WellnessProfile }) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasData = profile.heightFeet != null && profile.heightFeet > 0 && profile.weightLbs != null && profile.weightLbs > 0;
  const result = hasData ? calculateBmi(profile.heightFeet!, profile.heightInches ?? 0, profile.weightLbs!) : null;
  const category = result != null ? bmiCategory(result) : null;

  const handleSave = () => {
    if (result == null) return;
    startTransition(async () => {
      await saveMetricLog("bmi", result);
      setSaved(true);
    });
  };

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">BMI — Body Mass Index</div>
      <p className="wellness-calc-desc">
        A general screening measure comparing your weight to your height, used across population health research.
      </p>

      {!hasData ? (
        <div className="wellness-calc-missing-profile">
          Add your height and weight on the <Link href="/wellness/activity">Activity Log</Link> to see your BMI.
        </div>
      ) : (
        <p className="wellness-calc-desc" style={{ marginTop: -6 }}>
          Using your saved height ({profile.heightFeet}&rsquo;{profile.heightInches ?? 0}&rdquo;) and weight ({profile.weightLbs} lbs) —{" "}
          <Link href="/wellness/activity">update</Link>.
        </p>
      )}

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
