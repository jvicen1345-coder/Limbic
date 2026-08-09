"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { hrvCategory, type HrvCategory } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";
import type { WellnessProfile } from "@/lib/vitals";

const CATEGORY_CLASS: Record<HrvCategory, string> = {
  Poor: "wellness-badge-poor",
  Fair: "wellness-badge-fair",
  Good: "wellness-badge-good",
  Excellent: "wellness-badge-excellent",
};

export function HrvCalculatorCard({ profile }: { profile: WellnessProfile }) {
  const [hrv, setHrv] = useState("");
  const [result, setResult] = useState<{ value: number; category: HrvCategory } | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasAge = profile.age != null && profile.age > 0;
  const canCalculate = hasAge && Number(hrv) > 0;

  const handleCalculate = () => {
    if (!canCalculate) return;
    const value = Number(hrv);
    setResult({ value, category: hrvCategory(profile.age!, value) });
    setSaved(false);
  };

  const handleSave = () => {
    if (result == null) return;
    startTransition(async () => {
      await saveMetricLog("hrv", result.value);
      setSaved(true);
    });
  };

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">HRV — Heart Rate Variability</div>
      <p className="wellness-calc-desc">
        From an Apple Watch, Whoop, Garmin, or manual measurement — interpreted against age-adjusted general reference ranges.
      </p>

      {!hasAge ? (
        <div className="wellness-calc-missing-profile">
          Add your age on the <Link href="/wellness/activity">Activity Log</Link> to interpret your HRV.
        </div>
      ) : (
        <>
          <div className="wellness-calc-inputs">
            <div className="field" style={{ flex: 1, minWidth: 120 }}>
              <label htmlFor="hrv-value">HRV (ms)</label>
              <input className="input" id="hrv-value" type="number" min={0} value={hrv} onChange={(e) => setHrv(e.target.value)} />
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
            <span className="wellness-calc-result-value">{result.value}ms</span>
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
          HRV measures the variation in time between consecutive heartbeats — a higher HRV generally reflects a nervous system that&rsquo;s
          well-recovered and adaptable, while a lower HRV can reflect accumulated stress, poor sleep, illness, or overtraining. It&rsquo;s
          highly individual — your own trend over time matters more than comparing your number to anyone else&rsquo;s.
        </p>
      </details>
      <div className="wellness-calc-source">Source: Frontiers in Public Health, 2021</div>
    </div>
  );
}
