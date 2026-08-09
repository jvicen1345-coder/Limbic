"use client";

import { useState, useTransition } from "react";
import { calculateVo2Max, vo2MaxCategory, type BiologicalSexInput, type Vo2MaxCategory } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";

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

export function Vo2MaxCalculatorCard({
  initialAge,
  initialWeightLbs,
  initialSex,
}: {
  initialAge: number | null;
  initialWeightLbs: number | null;
  initialSex: string | null;
}) {
  const [age, setAge] = useState(initialAge?.toString() ?? "");
  const [weightLbs, setWeightLbs] = useState(initialWeightLbs?.toString() ?? "");
  const [sex, setSex] = useState<BiologicalSexInput>(sexFromProfile(initialSex));
  const [mileMinutes, setMileMinutes] = useState("");
  const [mileSeconds, setMileSeconds] = useState("");
  const [heartRateAfter, setHeartRateAfter] = useState("");
  const [result, setResult] = useState<{ value: number; category: Vo2MaxCategory } | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const canCalculate =
    Number(age) > 0 && Number(weightLbs) > 0 && Number(mileMinutes) >= 0 && Number(mileSeconds) >= 0 && Number(heartRateAfter) > 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const mileTimeMinutes = Number(mileMinutes) + Number(mileSeconds) / 60;
    const value = calculateVo2Max({
      weightLbs: Number(weightLbs),
      age: Number(age),
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
      <div className="wellness-calc-inputs">
        <div className="field" style={{ flex: 1, minWidth: 80 }}>
          <label htmlFor="vo2-age">Age</label>
          <input className="input" id="vo2-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 90 }}>
          <label htmlFor="vo2-weight">Weight (lbs)</label>
          <input className="input" id="vo2-weight" type="number" min={0} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 110 }}>
          <label htmlFor="vo2-sex">Sex</label>
          <select className="input" id="vo2-sex" value={sex} onChange={(e) => setSex(e.target.value as BiologicalSexInput)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <button type="button" className="btn btn-primary" disabled={!canCalculate} onClick={handleCalculate}>
        Calculate
      </button>

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
