"use client";

import { useState, useTransition } from "react";
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

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
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
