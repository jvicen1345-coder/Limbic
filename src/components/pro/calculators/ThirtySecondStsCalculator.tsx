"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";
import { useCalculatorProfile } from "./CalculatorProfileContext";

// The real published Rikli & Jones (1999) 30-Second Chair Stand age/sex-normative table
// (average range, mean +/- 1 SD).
const STS_NORMS: Record<string, string> = {
  "60-64": "male: 14-19, female: 12-17",
  "65-69": "male: 12-18, female: 11-16",
  "70-74": "male: 12-17, female: 10-15",
  "75-79": "male: 11-17, female: 10-15",
  "80-84": "male: 10-15, female: 9-14",
  "85-89": "male: 8-14, female: 8-13",
  "90-94": "male: 7-12, female: 4-11",
};

const AGE_GROUP_BANDS = Object.keys(STS_NORMS);

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const THIRTY_SECOND_STS_MEASURE = {
  name: "30 Second Sit to Stand",
  fullName: "30-Second Chair Stand Test",
  measures: "Lower extremity strength and fall risk from repetitions completed in 30 seconds.",
  population: "Older adults",
  itemCount: "1 item",
  administration: "Clinician-Administered",
} as const;

/** Maps a raw client age (as entered on a Calculator Profile) to the nearest published
 *  Rikli & Jones 5-year band, clamped to the table's 60-94 range rather than leaving a
 *  younger/older client's age unmatched. */
function ageToGroup(age: number): string {
  const index = Math.floor((age - 60) / 5);
  return AGE_GROUP_BANDS[Math.max(0, Math.min(AGE_GROUP_BANDS.length - 1, index))];
}

/** Fully functional — reps and age/sex inputs, the built-in 30-second countdown (see
 *  CalcTimer), and the real published Rikli & Jones normative comparison table are all
 *  live. Age/sex pre-fill from the active Calculator Profile (see
 *  CalculatorProfileContext.tsx) whenever it's set, so a clinician who already entered
 *  them there doesn't retype them here — still freely editable locally afterward. */
export function ThirtySecondStsCalculator() {
  const { activeProfileAge, activeProfileSex } = useCalculatorProfile();
  const [open, setOpen] = useState(false);
  const [reps, setReps] = useState("");
  const [ageGroup, setAgeGroup] = useState(activeProfileAge != null ? ageToGroup(activeProfileAge) : "60-64");
  const [sex, setSex] = useState(activeProfileSex ?? "female");

  // Re-syncs from the active Calculator Profile whenever it changes (a different profile
  // selected, or age/sex edited on the current one) — the "adjust state during render"
  // pattern (comparing against a snapshot of the previous render) rather than an effect,
  // same reasoning as CalcModal.tsx's SaveToProfileFooter: an effect's setState here would
  // cause an extra visible re-render for what should be synchronous with the prop change.
  const [prevAge, setPrevAge] = useState(activeProfileAge);
  const [prevSex, setPrevSex] = useState(activeProfileSex);
  if (activeProfileAge !== prevAge || activeProfileSex !== prevSex) {
    setPrevAge(activeProfileAge);
    setPrevSex(activeProfileSex);
    if (activeProfileAge != null) setAgeGroup(ageToGroup(activeProfileAge));
    if (activeProfileSex != null) setSex(activeProfileSex);
  }

  return (
    <>
      <CalcCardShell {...THIRTY_SECOND_STS_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="30 Second Sit to Stand"
        onClose={() => setOpen(false)}
        testKey="sts30"
        testName="30 Second Sit to Stand"
        result={
          reps !== ""
            ? {
                value: `${reps} reps`,
                label: `Normal range for ${sex}, ${ageGroup}: ${STS_NORMS[ageGroup]?.split(", ").find((s) => s.startsWith(sex))?.split(": ")[1]}`,
              }
            : null
        }
      >
        <CalcTimer mode="countdown" durationSeconds={30} />
        <div className="field">
          <label htmlFor="sts-reps">Repetitions completed</label>
          <input id="sts-reps" className="input" type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="sts-age">Age group</label>
            <select id="sts-age" className="input" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
              {Object.keys(STS_NORMS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="sts-sex">Sex</label>
            <select id="sts-sex" className="input" value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>
        {reps !== "" && (
          <div className="pro-calc-result" style={{ marginTop: 14 }}>
            <div className="pro-calc-result-value">{reps} reps</div>
            <div className="pro-calc-result-label">
              Normal range for {sex}, {ageGroup}: {STS_NORMS[ageGroup]?.split(", ").find((s) => s.startsWith(sex))?.split(": ")[1]}
            </div>
          </div>
        )}
        <p style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)", marginTop: 10 }}>
          Source: Rikli RE, Jones CJ. Development and validation of a functional fitness test for community-residing
          older adults. J Aging Phys Act. 1999. Values below the range suggest below-average lower extremity strength
          and increased fall risk for that age/sex group. Minimal detectable change: ~2 repetitions
          (community-dwelling older adults).
        </p>
      </CalcModal>
    </>
  );
}
