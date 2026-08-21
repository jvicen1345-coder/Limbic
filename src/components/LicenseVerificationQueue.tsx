"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyLicenseAction, rejectLicenseAction } from "@/app/actions/license";

export interface PendingLicenseRow {
  /** License row id — the target of verify/reject, not the user id, since one reader can
   *  have more than one pending row (a different state each) to review individually. */
  id: string;
  accountName: string;
  state: string;
  licenseNumber: string;
  fullName: string;
  /** ISO string, not a Date — this is a client component. */
  submittedAt: string | null;
}

/** Admin-only Verify/Reject queue (see app/(app)/admin/licenses/page.tsx, which gates on
 *  isSiteAdmin() before this ever renders) — a client component only because Verify/Reject
 *  need a pending state and a way to refresh the list after acting. */
export function LicenseVerificationQueue({ rows }: { rows: PendingLicenseRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleVerify = (licenseId: string) => {
    startTransition(async () => {
      await verifyLicenseAction(licenseId);
      router.refresh();
    });
  };

  const handleReject = (licenseId: string) => {
    startTransition(async () => {
      await rejectLicenseAction(licenseId);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No pending license submissions.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
            <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Limbic account name</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>State</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>License #</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Name on license</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Submitted</th>
            <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
              <td style={{ padding: "8px 10px 8px 0" }}>{r.accountName}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.state}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.licenseNumber}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.fullName}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {r.submittedAt
                  ? new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "N/A"}
              </td>
              <td style={{ padding: "8px 0 8px 10px", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-primary" disabled={pending} onClick={() => handleVerify(r.id)}>
                    Verify
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => handleReject(r.id)}>
                    Reject
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
