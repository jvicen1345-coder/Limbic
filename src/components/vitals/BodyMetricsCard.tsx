"use client";

import { useState, useTransition } from "react";
import { saveVitalsProfile } from "@/app/actions/vitals";
import { ACTIVITY_LEVEL_OPTIONS, BIOLOGICAL_SEX_OPTIONS, WELLNESS_GOAL_OPTIONS } from "@/lib/vitals";
import { CheckIcon } from "@/components/icons";

const SAVED_CHECK_MS = 1600;

export interface VitalsProfileValues {
  age: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  biologicalSex: string | null;
  activityLevel: string | null;
  wellnessGoal: string | null;
}

/** A number input's local string state so the field can sit empty (not "0") — cleared to
 *  null on save when blank. */
function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function BodyMetricsCard({ initial }: { initial: VitalsProfileValues }) {
  const [age, setAge] = useState(initial.age?.toString() ?? "");
  const [heightFeet, setHeightFeet] = useState(initial.heightFeet?.toString() ?? "");
  const [heightInches, setHeightInches] = useState(initial.heightInches?.toString() ?? "");
  const [weightLbs, setWeightLbs] = useState(initial.weightLbs?.toString() ?? "");
  const [biologicalSex, setBiologicalSex] = useState(initial.biologicalSex ?? "");
  const [activityLevel, setActivityLevel] = useState(initial.activityLevel ?? "");
  const [wellnessGoal, setWellnessGoal] = useState(initial.wellnessGoal ?? "");
  const [showSaved, setShowSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveVitalsProfile({
        age: toNumberOrNull(age),
        heightFeet: toNumberOrNull(heightFeet),
        heightInches: toNumberOrNull(heightInches),
        weightLbs: toNumberOrNull(weightLbs),
        biologicalSex: biologicalSex || null,
        activityLevel: activityLevel || null,
        wellnessGoal: wellnessGoal || null,
      });
      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), SAVED_CHECK_MS);
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Your body metrics</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        A few details to personalize your wellness tracking — all optional, all private to you.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="vitals-age">Age</label>
            <input className="input" id="vitals-age" type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="vitals-weight">Weight (lbs)</label>
            <input className="input" id="vitals-weight" type="number" min={0} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="vitals-height-feet">Height</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="input"
              id="vitals-height-feet"
              type="number"
              min={0}
              placeholder="Feet"
              value={heightFeet}
              onChange={(e) => setHeightFeet(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              className="input"
              id="vitals-height-inches"
              type="number"
              min={0}
              max={11}
              placeholder="Inches"
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="vitals-sex">Biological sex</label>
          <select className="input" id="vitals-sex" value={biologicalSex} onChange={(e) => setBiologicalSex(e.target.value)}>
            <option value="">Select…</option>
            {BIOLOGICAL_SEX_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="vitals-activity">Activity level</label>
          <select className="input" id="vitals-activity" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            <option value="">Select…</option>
            {ACTIVITY_LEVEL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="vitals-goal">Primary wellness goal</label>
          <select className="input" id="vitals-goal" value={wellnessGoal} onChange={(e) => setWellnessGoal(e.target.value)}>
            <option value="">Select…</option>
            {WELLNESS_GOAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
            {pending ? "Saving…" : "Save"}
          </button>
          {showSaved && <CheckIcon size={14} className="profile-date-saved-check" />}
        </div>
      </div>
    </div>
  );
}
