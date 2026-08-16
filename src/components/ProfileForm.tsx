"use client";

import { useTransition } from "react";
import { updateProfileFieldAction } from "@/app/actions/profile";
import { SPECIALTIES, STATES } from "@/lib/meta";

export function ProfileForm({
  name,
  specialty,
  practiceState,
  school,
  isStudent,
  headline,
  bio,
}: {
  name: string;
  specialty: string;
  practiceState: string;
  /** Shown in the sidebar "signed in as" subtitle instead of specialty/practiceState for a
   *  student account (see AppShell.tsx) — only editable here when isStudent, since it has
   *  no meaning for a practicing clinician account. */
  school: string;
  isStudent: boolean;
  headline: string;
  bio: string;
}) {
  const [, startTransition] = useTransition();

  return (
    <div className="profile-form-fields">
      <div className="field">
        <label htmlFor="pf-name">Name</label>
        <input
          className="input"
          id="pf-name"
          defaultValue={name}
          onChange={(e) => startTransition(() => updateProfileFieldAction("name", e.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="pf-specialty">Specialty</label>
        <select
          className="input"
          id="pf-specialty"
          defaultValue={specialty}
          onChange={(e) => startTransition(() => updateProfileFieldAction("specialty", e.target.value))}
        >
          {SPECIALTIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="pf-state">Practice state</label>
        <select
          className="input"
          id="pf-state"
          defaultValue={practiceState}
          onChange={(e) => startTransition(() => updateProfileFieldAction("practiceState", e.target.value))}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {isStudent && (
        <div className="field">
          <label htmlFor="pf-school">School</label>
          <input
            className="input"
            id="pf-school"
            placeholder="e.g. Chapman University"
            defaultValue={school}
            onChange={(e) => startTransition(() => updateProfileFieldAction("school", e.target.value))}
          />
        </div>
      )}
      <div className="field">
        <label htmlFor="pf-headline">Nexus headline</label>
        <input
          className="input"
          id="pf-headline"
          placeholder="e.g. Outpatient Ortho PT · Austin, TX"
          defaultValue={headline}
          onChange={(e) => startTransition(() => updateProfileFieldAction("headline", e.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="pf-bio">Nexus bio</label>
        <textarea
          className="input"
          id="pf-bio"
          rows={3}
          placeholder="A couple sentences for your Nexus profile…"
          defaultValue={bio}
          onChange={(e) => startTransition(() => updateProfileFieldAction("bio", e.target.value))}
        />
      </div>
    </div>
  );
}
