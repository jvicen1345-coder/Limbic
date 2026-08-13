"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { calculateMaxHeartRate, calculateHeartRateZones, type MaxHrFormula } from "@/lib/metrics";
import { saveMetricLog } from "@/app/actions/metrics";
import { CheckIcon } from "@/components/icons";
import type { WellnessProfile } from "@/lib/vitals";

export function MaxHeartRateCalculatorCard({ profile }: { profile: WellnessProfile }) {
  const [formula, setFormula] = useState<MaxHrFormula>("haskell");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasAge = profile.age != null && profile.age > 0;
  const result = hasAge ? calculateMaxHeartRate(profile.age!, formula) : null;
  const zones = result != null ? calculateHeartRateZones(result) : null;

  const handleSave = () => {
    if (result == null) return;
    startTransition(async () => {
      await saveMetricLog("maxHR", result);
      setSaved(true);
    });
  };

  return (
    <div className="wellness-calc-card">
      <div className="wellness-calc-title">Maximum Heart Rate &amp; Training Zones</div>
      <p className="wellness-calc-desc">Estimates your maximum heart rate and the training zones that fall within it.</p>

      {!hasAge ? (
        <div className="wellness-calc-missing-profile">
          Add your age on the <Link href="/wellness/activity">Activity Log</Link> to see your training zones.
        </div>
      ) : (
        <div className="wellness-calc-inputs">
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="mhr-formula">Formula</label>
            <select className="input" id="mhr-formula" value={formula} onChange={(e) => setFormula(e.target.value as MaxHrFormula)}>
              <option value="haskell">220 − age</option>
              <option value="tanaka">Tanaka, 208 − (0.7 × age)</option>
            </select>
          </div>
        </div>
      )}

      {result != null && zones && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{Math.round(result)}</span>
            <span className="wellness-calc-result-unit">BPM max</span>
          </div>

          <div className="wellness-hr-zones">
            {zones.map((z) => (
              <div key={z.zone} className={`wellness-hr-zone wellness-hr-zone--${z.zone}`}>
                <span className="wellness-hr-zone-name">
                  Zone {z.zone} · {Math.round(z.pctLow * 100)}-{Math.round(z.pctHigh * 100)}%
                </span>
                <span className="wellness-hr-zone-bpm">
                  {z.bpmLow}-{z.bpmHigh} BPM
                </span>
                <span className="wellness-hr-zone-purpose">{z.purpose}</span>
              </div>
            ))}
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
          Zone 1 (Recovery) is easy effort for active recovery days. Zone 2 (Fat burning, aerobic base) is a conversational pace that
          builds your aerobic engine over time, most endurance training research points to this zone as underrated for long-term
          health. Zone 3 (Aerobic fitness) is a moderately hard, sustainable effort. Zone 4 (Anaerobic threshold) is the pace you could
          hold for maybe 20-60 minutes at a hard effort. Zone 5 (Maximum effort) is only sustainable for short bursts, used for interval
          training.
        </p>
      </details>
      <div className="wellness-calc-source">Source: American College of Sports Medicine (ACSM)</div>
    </div>
  );
}
