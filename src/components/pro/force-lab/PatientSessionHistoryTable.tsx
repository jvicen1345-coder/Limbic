"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteForceLabSession } from "@/app/actions/force-lab";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

function lsiColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Session history table on /pro/force-lab/patient/[patientCode] — "View" links into the
 *  main tool pre-loaded to that exact session (see ForceLabWorkspace.tsx's
 *  initialSessionId); "Delete" removes it in place without leaving this page. */
export function PatientSessionHistoryTable({ sessions, forceUnit }: { sessions: ForceLabSession[]; forceUnit: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(sessions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this Force Lab session? This can't be undone.")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteForceLabSession(id);
      setRows((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 14 }}>No Force Lab sessions for this patient yet.</p>;
  }

  return (
    <div className="forcelab-patient-history-table-wrap">
      <table className="forcelab-patient-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Muscle Group</th>
            <th>Right Peak</th>
            <th>Left Peak</th>
            <th>LSI</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const right = s.rightPeak != null ? convertForDisplay(s.rightPeak, s.unit, forceUnit) : null;
            const left = s.leftPeak != null ? convertForDisplay(s.leftPeak, s.unit, forceUnit) : null;
            return (
              <tr key={s.id}>
                <td>{new Date(s.sessionDate).toLocaleDateString()}</td>
                <td>{s.muscleGroup}</td>
                <td>{right != null ? `${right} ${forceUnit}` : "—"}</td>
                <td>{left != null ? `${left} ${forceUnit}` : "—"}</td>
                <td style={{ color: s.lsi != null ? lsiColor(s.lsi) : undefined, fontWeight: 700 }}>{s.lsi != null ? `${s.lsi}%` : "—"}</td>
                <td>
                  <Link href={`/pro/force-lab?session=${s.id}`} className="clindash-seats-add-link" style={{ marginRight: 14 }}>
                    View
                  </Link>
                  <button
                    type="button"
                    className="clindash-question-delete"
                    disabled={pending && deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
