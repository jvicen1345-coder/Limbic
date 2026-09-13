"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { RoleCards } from "@/components/RoleCards";
import { updateUserRoleAction } from "@/app/actions/user-role";
import { USER_ROLES, type UserRole } from "@/lib/user-role";

/** Profile's Role section — the same three cards the onboarding gate uses (see
 *  components/OnboardingRoleModal.tsx), just editable in place instead of blocking
 *  anything. Changing this only reorders the sidebar's Zone 2 sections (see
 *  lib/user-role.ts zoneTwoOrder, components/AppShell.tsx) — nothing is ever hidden. */
export function UserRoleSection({ role }: { role: UserRole | null }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<UserRole | null>(role);
  const [pending, startTransition] = useTransition();

  const currentLabel = USER_ROLES.find((r) => r.value === role)?.label ?? "Not set";
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  function clearRoleHash() {
    if (window.location.hash !== "#profile-role") return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  useEffect(() => {
    const enter = () => {
      shouldFocus.current = true;
      setEditing(true);
      // One-shot jump target — leave the hash up and a remount (Save's
      // revalidate, Cancel + navigation) re-enters edit on mount.
      clearRoleHash();
    };
    if (window.location.hash === "#profile-role") enter();
    window.addEventListener("limbic:edit-role", enter);
    return () => window.removeEventListener("limbic:edit-role", enter);
  }, []);

  useEffect(() => {
    if (!editing || !shouldFocus.current) return;
    shouldFocus.current = false;
    const moveFocus = () => {
      const firstCard = sectionRef.current?.querySelector<HTMLElement>(".role-card");
      (firstCard ?? sectionRef.current)?.focus();
    };
    moveFocus();
    // Second frame: RoleCards is in the same commit, but a leftover fragment
    // focus can still fire after the click. Reclaim onto the first control.
    requestAnimationFrame(moveFocus);
  }, [editing]);

  return (
    <div
      id="profile-role"
      ref={sectionRef}
      tabIndex={-1}
      className="card elev-sm"
      style={{ marginBottom: 18, scrollMarginTop: 24 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker">Role</div>
        {!editing && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12.5, padding: "4px 10px" }}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <RoleCards value={selected} onChange={setSelected} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selected || pending}
              onClick={() => {
                if (!selected) return;
                startTransition(async () => {
                  await updateUserRoleAction(selected);
                  clearRoleHash();
                  setEditing(false);
                });
              }}
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSelected(role);
                clearRoleHash();
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className="card-body" style={{ marginTop: 2 }}>
          {currentLabel}
        </p>
      )}
    </div>
  );
}
