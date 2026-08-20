"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

// TODO: Replace with the real published Rikli & Jones age/sex-normative table before
// launch — these are placeholder round numbers, not verified reference values.
const NORMS_PLACEHOLDER: Record<string, string> = {
  "60-64": "male: 14-19, female: 12-17",
  "65-69": "male: 12-18, female: 11-16",
  "70-74": "male: 12-17, female: 10-15",
  "75-79": "male: 11-17, female: 10-15",
  "80-84": "male: 10-15, female: 9-14",
  "85-89": "male: 8-14, female: 8-13",
  "90-94": "male: 7-12, female: 4-11",
};

/** Functional with placeholder norms — reps and age/sex inputs, plus the built-in 30-second
 *  countdown (see CalcTimer), are live; the comparison table is a TODO placeholder (see
 *  NORMS_PLACEHOLDER above) pending the real published reference values. */
export function ThirtySecondStsCalculator() {
  const [open, setOpen] = useState(false);
  const [reps, setReps] = useState("");
  const [ageGroup, setAgeGroup] = useState("60-64");
  const [sex, setSex] = useState("female");

  return (
    <>
      <CalcCardShell
        name="30 Second Sit to Stand"
        fullName="30-Second Chair Stand Test"
        measures="Lower extremity strength and fall risk from repetitions completed in 30 seconds."
        population="Older adults"
        itemCount="1 item"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="30 Second Sit to Stand" onClose={() => setOpen(false)}>
        <CalcTimer mode="countdown" durationSeconds={30} />
        <div className="field">
          <label htmlFor="sts-reps">Repetitions completed</label>
          <input id="sts-reps" className="input" type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="sts-age">Age group</label>
            <select id="sts-age" className="input" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
              {Object.keys(NORMS_PLACEHOLDER).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="sts-sex">Sex</label>
            <select id="sts-sex" className="input" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>
        {reps !== "" && (
          <div className="pro-calc-result" style={{ marginTop: 14 }}>
            <div className="pro-calc-result-value">{reps} reps</div>
            <div className="pro-calc-result-label">
              Placeholder norm range for {sex}, {ageGroup}: {NORMS_PLACEHOLDER[ageGroup]?.split(", ").find((s) => s.startsWith(sex))?.split(": ")[1]}
            </div>
          </div>
        )}
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 10 }}>
          TODO: norm table above is placeholder, replace with the verified Rikli &amp; Jones age/sex-normative
          values before launch.
        </p>
      </CalcModal>
    </>
  );
}
