"use client";

import { USER_ROLES, type UserRole } from "@/lib/user-role";

/** The three role cards — shared by the onboarding gate (components/OnboardingRoleModal.tsx)
 *  and Profile's Role section (components/UserRoleSection.tsx) so the two never drift out of
 *  sync. Purely controlled — no state of its own, no submit; the caller owns what happens
 *  with the selection. */
export function RoleCards({ value, onChange }: { value: UserRole | null; onChange: (role: UserRole) => void }) {
  return (
    <div className="role-cards">
      {USER_ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={value === r.value ? "role-card role-card--selected" : "role-card"}
          aria-pressed={value === r.value}
          onClick={() => onChange(r.value)}
        >
          <span className="role-card-label">{r.label}</span>
          <span className="role-card-description">{r.description}</span>
        </button>
      ))}
    </div>
  );
}
