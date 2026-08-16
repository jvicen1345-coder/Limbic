"use client";

import { useState, useTransition } from "react";
import { RoleCards } from "@/components/RoleCards";
import { completeRoleOnboardingAction } from "@/app/actions/user-role";
import type { UserRole } from "@/lib/user-role";

/** Renders in place of the entire app (see app/(app)/layout.tsx) for a brand-new account
 *  until it picks a role — there's no page underneath to dismiss "outside" to, and no close
 *  control, so a selection plus Continue is the only way out of this screen. */
export function OnboardingRoleModal() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="onboarding-role-overlay">
      <div className="card elev-lg onboarding-role-card">
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>How are you using Limbic?</h1>
        <p className="card-body" style={{ marginTop: 2 }}>
          This just orders your sidebar to match — every section stays available either way,
          and you can change this anytime from Profile.
        </p>

        <RoleCards value={role} onChange={setRole} />

        <form
          action={(formData) => {
            if (!role) return;
            startTransition(() => completeRoleOnboardingAction(formData));
          }}
          style={{ marginTop: 20 }}
        >
          <input type="hidden" name="role" value={role ?? ""} />
          <button type="submit" className="btn btn-primary btn-block" disabled={!role || pending}>
            {pending ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
