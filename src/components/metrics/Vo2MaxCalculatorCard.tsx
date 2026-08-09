"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { calculateVo2Max, vo2MaxCategory, type BiologicalSexInput, type Vo2MaxCategory } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";
import type { WellnessProfile } from "@/lib/vitals";

const CATEGORY_CLASS: Record<Vo2MaxCategory, string> = {
  Poor: "wellness-badge-poor",
  Fair: "wellness-badge-fair",
  Good: "wellness-badge-good",
  Excellent: "wellness-badge-excellent",
  Superior: "wellness-badge-superior",
};

function sexFromProfile(value: string | null): BiologicalSexInput {
  return value === "Male" ? "male" : "female";
}

export function Vo2MaxCalculatorCard({ profile }: { profile: WellnessProfile }) {
  const [mileMinutes, setMileMinutes] = useState("");
  const [mileSeconds, setMileSeconds] = useState("");
  const [heartRateAfter, setHeartRateAfter] = useState("");
  const [result, setResult] = useState<{ value: number; category: Vo2MaxCategory } | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasProfile = profile.age != null && profile.age > 0 && profile.weightLbs != null && profile.weightLbs > 0;
  const sex = sexFromProfile(profile.biologicalSex);
  const canCalculate = hasProfile && Number(mileMinutes) >= 0 && Number(mileSeconds) >= 0 && Number(heartRateAfter) > 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const mileTimeMinutes = Number(mileMinutes) + Number(mileSeconds) / 60;
    const value = calculateVo2Max({
      weightLbs: profile.weightLbs!,
      age: profile.age!,
      sex,
      mileTimeMinutes,
      heartRateAfter: Number(heartRateAfter),
    });
    setResult({ value, category: vo2MaxCategory(value, sex) });
    setSaved(false);
  };

  const handleSave = () => {
    if (result == null) return;
    startTransition(async () => {
      await saveMetricLog("vo2max", result.value);
      setSaved(true);
    });
  };

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">Sub-VO2 Max Estimate</div>
      <p className="wellness-calc-desc">The Rockport Walking Test — a one-mile walk estimate of your aerobic capacity, no running required.</p>

      {!hasProfile ? (
        <div className="wellness-calc-missing-profile">
          Add your age and weight on the <Link href="/wellness/activity">Activity Log</Link> to estimate your VO2 max.
        </div>
      ) : (
        <>
          <p className="wellness-calc-desc" style={{ marginTop: -6 }}>
            Using your saved age ({profile.age}), weight ({profile.weightLbs} lbs), and sex ({sex}) — <Link href="/wellness/activity">update</Link>.
          </p>
          <div className="wellness-calc-inputs">
            <div className="field" style={{ flex: 1, minWidth: 80 }}>
              <label htmlFor="vo2-mile-min">Mile time (min)</label>
              <input className="input" id="vo2-mile-min" type="number" min={0} value={mileMinutes} onChange={(e) => setMileMinutes(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 80 }}>
              <label htmlFor="vo2-mile-sec">Mile time (sec)</label>
              <input
                className="input"
                id="vo2-mile-sec"
                type="number"
                min={0}
                max={59}
                value={mileSeconds}
                onChange={(e) => setMileSeconds(e.target.value)}
              />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 110 }}>
              <label htmlFor="vo2-hr">Heart rate after (BPM)</label>
              <input className="input" id="vo2-hr" type="number" min={0} value={heartRateAfter} onChange={(e) => setHeartRateAfter(e.target.value)} />
            </div>
          </div>

          <button type="button" className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
            Calculate
          </button>
        </>
      )}

      {result && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.value.toFixed(1)}</span>
            <span className="wellness-calc-result-unit">mL/kg/min</span>
            <span className={`wellness-badge ${CATEGORY_CLASS[result.category]}`}>{result.category}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save to my metrics"}
            </button>
            {saved && <CheckIcon size={14} className="profile-date-saved-check" />}
          </div>
        </div>
      )}

      <details className="wellness-calc-education">
        <summary>What does this mean?</summary>
        <p>
          VO2 max measures how efficiently your body uses oxygen during intense exercise — it&rsquo;s one of the most studied markers of
          aerobic fitness, and higher values are consistently linked to lower risk of cardiovascular disease and all-cause mortality.
          Unlike a lab treadmill test, this is a general estimate from a submaximal field test — useful for tracking your own trend over
          time rather than a precise lab measurement.
        </p>
      </details>
      <div className="wellness-calc-source">Source: Rockport Walking Institute, American Heart Association</div>
    </div>
  );
}
