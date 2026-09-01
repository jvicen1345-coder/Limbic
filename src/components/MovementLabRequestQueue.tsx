"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMovementLabRequestAdded, declineMovementLabRequest } from "@/app/actions/movement-lab-requests";

export interface PendingMovementLabRequestRow {
  id: string;
  accountName: string;
  name: string;
  region: string | null;
  note: string | null;
  /** ISO string, not a Date — this is a client component. */
  createdAt: string;
}

/** Admin-only Mark Added/Decline queue (see app/(app)/admin/movement-lab-requests/page.tsx,
 *  which gates on isSiteAdmin() before this ever renders) — same shape as
 *  LicenseVerificationQueue.tsx. "Mark Added" doesn't write anything into Movement Lab
 *  itself (a static TS catalog, not a database table) — it just records that an admin has
 *  since added the exercise to the appropriate region file by hand. */
export function MovementLabRequestQueue({ rows }: { rows: PendingMovementLabRequestRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleAdded = (id: string) => {
    startTransition(async () => {
      await markMovementLabRequestAdded(id);
      router.refresh();
    });
  };

  const handleDecline = (id: string) => {
    startTransition(async () => {
      await declineMovementLabRequest(id);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No pending exercise requests.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
            <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Requested by</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Exercise</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Region</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Note</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Requested</th>
            <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
              <td style={{ padding: "8px 10px 8px 0" }}>{r.accountName}</td>
              <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.name}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.region ?? "—"}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", maxWidth: 280 }}>{r.note ?? "—"}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td style={{ padding: "8px 0 8px 10px", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-primary" disabled={pending} onClick={() => handleAdded(r.id)}>
                    Mark Added
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => handleDecline(r.id)}>
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
