"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/actions/admin";

export interface AccountRow {
  id: string;
  name: string;
  email: string | null;
  licenseEmail: string | null;
  licenseNumber: string | null;
  isGuest: boolean;
  hasPassword: boolean;
  isPro: boolean;
  isFoundingFunder: boolean;
  createdAt: string;
}

/** One row's Delete button — a two-click confirm ("Delete" then "Confirm?" for a few
 *  seconds) rather than a native confirm() popup, since this deletes one account at a
 *  time and a lighter but still-deliberate confirm is the right amount of friction. */
function DeleteButton({ userId, onDeleted }: { userId: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px", color: "var(--color-danger)" }}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          Delete
        </button>
        {/* Stays visible after a rejected delete (e.g. trying to delete your own row) even
         *  once back in this collapsed state — cleared the moment "Delete" is clicked again. */}
        {error && <span style={{ fontSize: 11.5, color: "var(--color-danger)" }}>{error}</span>}
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        type="button"
        className="btn"
        disabled={pending}
        style={{ fontSize: 12, padding: "4px 10px", background: "var(--color-danger)", color: "#fff", border: "none" }}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteUserAction(userId);
            if (result.ok) {
              onDeleted();
            } else {
              setError(result.error ?? "Something went wrong.");
              setConfirming(false);
            }
          });
        }}
      >
        {pending ? "Deleting…" : "Confirm?"}
      </button>
      <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </span>
  );
}

/** /admin/accounts (gated by isSiteAdmin() in that page) — every account, with a delete
 *  button per row. Client component only for that delete interaction; the row data itself
 *  is fetched server-side and passed in once. */
export function AccountsAdminTable({ rows: initialRows }: { rows: AccountRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const router = useRouter();

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No accounts.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
            <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Name</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Sign-in</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Joined</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Guest</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Password</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Pro</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Founding Funder</th>
            <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
              <td style={{ padding: "6px 10px 6px 0" }}>{u.name}</td>
              <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)" }}>
                {u.email ?? u.licenseEmail ?? u.licenseNumber ?? "N/A"}
              </td>
              <td style={{ padding: "6px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td style={{ padding: "6px 10px" }}>{u.isGuest ? "Yes" : ""}</td>
              <td style={{ padding: "6px 10px" }}>{u.hasPassword ? "Set" : "None"}</td>
              <td style={{ padding: "6px 10px" }}>{u.isPro ? "Yes" : ""}</td>
              <td style={{ padding: "6px 10px" }}>{u.isFoundingFunder ? "Yes" : ""}</td>
              <td style={{ padding: "6px 0 6px 10px" }}>
                <DeleteButton
                  userId={u.id}
                  onDeleted={() => {
                    setRows((prev) => prev.filter((r) => r.id !== u.id));
                    router.refresh();
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
