"use client";

import { useTransition } from "react";
import { updateProfileFieldAction } from "@/app/actions/profile";

/** Profile → Credentials — Force Lab's unit preference (see User.forceUnit,
 *  getUserForceUnit in app/actions/force-lab.ts). Same uncontrolled-input +
 *  updateProfileFieldAction pattern as ProfileForm.tsx's own fields, just radios instead
 *  of a text/select input. */
export function ForceUnitPreferenceForm({ forceUnit }: { forceUnit: string | null }) {
  const [, startTransition] = useTransition();
  const current = forceUnit ?? "lbs";

  return (
    <div className="field">
      <label>Dynamometer Unit Preference</label>
      <div className="force-unit-radio-row">
        <label className="force-unit-radio-option">
          <input
            type="radio"
            name="forceUnit"
            value="lbs"
            defaultChecked={current === "lbs"}
            onChange={() => startTransition(() => updateProfileFieldAction("forceUnit", "lbs"))}
          />
          Pounds (lbs)
        </label>
        <label className="force-unit-radio-option">
          <input
            type="radio"
            name="forceUnit"
            value="kg"
            defaultChecked={current === "kg"}
            onChange={() => startTransition(() => updateProfileFieldAction("forceUnit", "kg"))}
          />
          Kilograms (kg)
        </label>
      </div>
    </div>
  );
}
