"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RoleCards } from "@/components/RoleCards";
import { completeRoleOnboardingAction, saveRoleWithoutRedirect } from "@/app/actions/user-role";
import { ProgramSearch } from "@/components/programs/ProgramSearch";
import type { UserRole } from "@/lib/user-role";
import type { DPTProgram } from "@/generated/prisma/client";
import { CheckIcon } from "@/components/icons";

/** Renders in place of the entire app (see app/(app)/layout.tsx) for a brand-new account
 *  until it picks a role — there's no page underneath to dismiss "outside" to, and no close
 *  control, so a selection plus Continue is the only way out of this screen. A "PT Student"
 *  selection adds a second step (program selection, see components/programs/ProgramSearch.tsx)
 *  before landing on /home; "Physical Therapist"/"General" go straight there exactly as
 *  before (see completeRoleOnboardingAction, still a real form action + server redirect —
 *  unchanged for those two roles).
 *
 *  hasCompletedOnboarding is deliberately NOT set until Step 2 actually finishes (Continue or
 *  Skip), not when Step 1's Continue is clicked — that flag is exactly what app/(app)/
 *  layout.tsx branches render vs. hide this modal on, and setUserProgram (called from
 *  ProgramSearch when a result is picked) also revalidates the same root layout path. Flipping
 *  the flag any earlier means the very next revalidating action mid-Step-2 would have Next
 *  auto-refresh the layout straight past this modal to the real app, abandoning the flow
 *  before "Continue to Limbic" ever renders — confirmed live via Playwright before this
 *  ordering was fixed. */
export function OnboardingRoleModal() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<"role" | "program">("role");
  const [selectedProgram, setSelectedProgram] = useState<DPTProgram | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleFinishProgramStep() {
    startTransition(async () => {
      await saveRoleWithoutRedirect("pts");
      router.push("/home");
    });
  }

  if (step === "program") {
    return (
      <div className="onboarding-role-overlay">
        <div className="card elev-lg onboarding-role-card">
          <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Which DPT program are you in?</h1>
          <p className="card-body" style={{ marginTop: 2 }}>
            This personalizes your Atrium experience.
          </p>

          {selectedProgram ? (
            <div className="program-search-confirm">
              <p className="program-search-confirm-name">
                <CheckIcon size={15} style={{ color: "var(--color-success)" }} /> {selectedProgram.institution}
              </p>
              <p className="program-search-confirm-meta">{selectedProgram.stateName}</p>
              <p className="program-search-confirm-meta">{selectedProgram.calendarType ?? "Not published"}</p>
              <button type="button" className="program-search-change-link" onClick={() => setSelectedProgram(null)}>
                Change
              </button>
            </div>
          ) : (
            <ProgramSearch placeholder="Search for your school..." onSelected={setSelectedProgram} />
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: 20 }}
            disabled={!selectedProgram || pending}
            onClick={handleFinishProgramStep}
          >
            {pending ? "Saving…" : "Continue to Limbic"}
          </button>
          <button type="button" className="onboarding-skip-link" disabled={pending} onClick={handleFinishProgramStep}>
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-role-overlay">
      <div className="card elev-lg onboarding-role-card">
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>How are you using Limbic?</h1>
        <p className="card-body" style={{ marginTop: 2 }}>
          This just orders your sidebar to match — every section stays available either way,
          and you can change this anytime from Profile.
        </p>

        <RoleCards value={role} onChange={setRole} />

        {role === "pts" ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: 20 }}
            onClick={() => setStep("program")}
          >
            Continue
          </button>
        ) : (
          <form action={(formData) => startTransition(() => completeRoleOnboardingAction(formData))} style={{ marginTop: 20 }}>
            <input type="hidden" name="role" value={role ?? ""} />
            <button type="submit" className="btn btn-primary btn-block" disabled={!role || pending}>
              {pending ? "Saving…" : "Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
