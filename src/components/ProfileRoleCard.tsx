"use client";

import { USER_ROLES, type UserRole } from "@/lib/user-role";

function openRoleSection(event: React.MouseEvent<HTMLAnchorElement>) {
  // Own scroll + focus so the fragment navigation does not land on (or steal
  // focus back to) the section wrapper after UserRoleSection focuses a control.
  event.preventDefault();
  document.getElementById("profile-role")?.scrollIntoView({ block: "start" });
  window.dispatchEvent(new Event("limbic:edit-role"));
  if (window.location.hash !== "#profile-role") {
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#profile-role`,
    );
  }
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
