"use client";

import { useState, useTransition } from "react";
import { deleteForceLabSession, linkSessionToPatient } from "@/app/actions/force-lab";
import { ForceLabTrendChart } from "./ForceLabTrendChart";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";

function statusColor(status: "normal" | "caution" | "deficit"): string {
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Read-only detail for a session clicked from Session History (see
 *  ForceLabWorkspace.tsx). `history` is every session for this same muscle group already
 *  scoped by ForceLabWorkspace to this session's patient (or lack of one) — see
 *  getForceLabHistory's own comment on why an unlinked session's trend never mixes with a
 *  linked one. Normative comparison here is display-only, from whatever age/sex the
 *  clinician typed in Section 3 at the time this session was originally saved — since that
 *  isn't persisted (see StrengthProfilePanel's comment on the same no-PHI constraint), a
 *  session reopened later simply doesn't show a normative line at all, same as if age/sex
 *  had never been entered. */
export function SessionDetailView({
  session,
  patients,
  forceUnit,
  history,
  onEdit,
  onDeleted,
  onLinked,
}: {
  session: ForceLabSession;
  patients: PatientListEntry[];
  forceUnit: string;
  history: ForceLabSession[];
  onEdit: () => void;
  onDeleted: () => void;
  onLinked: (session: ForceLabSession) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkPatientId, setLinkPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this Force Lab session? This can't be undone.")) return;
    startTransition(async () => {
      await deleteForceLabSession(session.id);
      onDeleted();
    });
  };

  const handleLink = () => {
    if (!linkPatientId) return;
    setError(null);
    startTransition(async () => {
      const result = await linkSessionToPatient(session.id, linkPatientId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLinkOpen(false);
      onLinked(result.session);
    });
  };

  const lsiStatus = session.lsi != null ? getLSIStatus(session.lsi) : null;
  const rightDisplay = session.rightPeak != null ? convertForDisplay(session.rightPeak, session.unit, forceUnit) : null;
  const leftDisplay = session.leftPeak != null ? convertForDisplay(session.leftPeak, session.unit, forceUnit) : null;

  return (
    <div className="forcelab-session-view">
      <div className="forcelab-session-view-header">
        <div>
          <h2 className="forcelab-session-view-title">{session.muscleGroup}</h2>
          <p className="forcelab-session-view-sub">
            {new Date(session.sessionDate).toLocaleDateString()}
            {session.patientCode && <span className="tag" style={{ marginLeft: 8 }}>{session.patientCode}</span>}
          </p>
        </div>
        <div className="forcelab-session-view-actions">
          <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="clindash-question-delete" disabled={pending} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="forcelab-force-display">
        <div className="forcelab-force-display-col">
          <div className="forcelab-force-display-label forcelab-force-display-label--right">Right</div>
          <div className="forcelab-force-display-value">{rightDisplay != null ? `${rightDisplay} ${forceUnit}` : "—"}</div>
          <div className="forcelab-force-display-muted">
            {session.rightTimeToPeak != null ? `${session.rightTimeToPeak}s to peak` : "No time to peak recorded"}
          </div>
        </div>
        <div className="forcelab-force-display-col">
          <div className="forcelab-force-display-label forcelab-force-display-label--left">Left</div>
          <div className="forcelab-force-display-value">{leftDisplay != null ? `${leftDisplay} ${forceUnit}` : "—"}</div>
          <div className="forcelab-force-display-muted">
            {session.leftTimeToPeak != null ? `${session.leftTimeToPeak}s to peak` : "No time to peak recorded"}
          </div>
        </div>
      </div>

      {session.difference != null && (
        <div className="forcelab-calculated-row">
          <span>
            Difference: <strong>{session.difference} {session.unit}</strong>
          </span>
          <span>
            Percent Difference: <strong>{session.percentDiff}%</strong>
          </span>
          <span style={{ color: lsiStatus ? statusColor(lsiStatus) : undefined }}>
            LSI: <strong>{session.lsi}%</strong>
          </span>
        </div>
      )}

      {session.notes && (
        <div className="forcelab-session-notes">
          <div className="forcelab-form-section-title">Notes</div>
          <p>{session.notes}</p>
        </div>
      )}

      <div className="forcelab-form-section">
        <div className="forcelab-form-section-title">Trend</div>
        <ForceLabTrendChart sessions={history} unitLabel={forceUnit} />
      </div>

      <div className="forcelab-link-row">
        {!linkOpen ? (
          <button type="button" className="clindash-seats-add-link" onClick={() => setLinkOpen(true)}>
            {session.patientId ? "Change Patient" : "Link to Patient"}
          </button>
        ) : (
          <div className="clindash-inline-form">
            <select className="input" value={linkPatientId} onChange={(e) => setLinkPatientId(e.target.value)}>
              <option value="">Choose a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patientCode} — {p.condition}
                </option>
              ))}
            </select>
            {error && <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-danger)", margin: 0 }}>{error}</p>}
            <div className="clindash-inline-form-actions">
              <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} disabled={pending || !linkPatientId} onClick={handleLink}>
                Save
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setLinkOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
