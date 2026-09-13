"use client";

import { USER_ROLES, type UserRole } from "@/lib/user-role";

function openRoleSection() {
  window.dispatchEvent(new Event("limbic:edit-role"));
}

/** Profile header Role shortcut — same pattern as ProfileThemeCard: the click both
 *  jumps to `#profile-role` and puts UserRoleSection into edit, so "Edit" is not a
 *  scroll-only fake CTA. */
export function ProfileRoleCard({ role }: { role: UserRole | null }) {
  const label = USER_ROLES.find((r) => r.value === role)?.label ?? "Not set";
  return (
    <a
      href="#profile-role"
      className="card elev-sm profile-status-card"
      aria-label={`Edit role: ${label}`}
      onClick={openRoleSection}
    >
      <div className="card-kicker">Role</div>
      <div className="profile-status-value">{label}</div>
      <div className="profile-status-action">Edit</div>
    </a>
  );
}
