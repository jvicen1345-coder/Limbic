"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateVisitRequestStatusAction, type ConnexionVisitStatus } from "@/app/actions/connexion";

export interface VisitRequestRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS: { value: ConnexionVisitStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

/** Admin-only status queue for /admin/connexion-visits (gated by isSiteAdmin() in that
 *  page). Client component only for the per-row status dropdown — same
 *  useTransition + router.refresh() pattern as LicenseVerificationQueue. */
export function VisitRequestsAdminList({ rows }: { rows: VisitRequestRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: ConnexionVisitStatus) => {
    startTransition(async () => {
      await updateVisitRequestStatusAction(id, status);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No visit requests yet.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--color-neutral-700)" }}>
            <th style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>Name</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Phone</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Email</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Preferred</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Message</th>
            <th style={{ padding: "4px 10px", fontWeight: 600 }}>Submitted</th>
            <th style={{ padding: "4px 0 4px 10px", fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
              <td style={{ padding: "8px 10px 8px 0" }}>{r.name}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>{r.phone}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)" }}>{r.email}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {r.preferredDate
                  ? new Date(r.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
                {r.preferredTime ? ` · ${r.preferredTime}` : ""}
              </td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", maxWidth: 220 }}>{r.message ?? "—"}</td>
              <td style={{ padding: "8px 10px", color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>
                {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td style={{ padding: "8px 0 8px 10px", whiteSpace: "nowrap" }}>
                <select
                  className="input"
                  style={{ minHeight: 30, padding: "4px 10px", fontSize: 12.5 }}
                  value={r.status}
                  disabled={pending}
                  onChange={(e) => handleStatusChange(r.id, e.target.value as ConnexionVisitStatus)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
