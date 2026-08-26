"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import {
  getClinicDashboard,
  getRecentTransfers,
  getClinicPatientsForTransfer,
  inviteClinicMember,
  removeClinicMember,
  transferPatient,
  type ClinicTeamOverview,
  type RecentTransfer,
  type ClinicPatientLookup,
} from "@/app/actions/clinic-pro";
import { manageClinicSeatsAction } from "@/app/actions/pro";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";

const ADDITIONAL_SEAT_PRICE = "$15 per additional seat above 6";

/** "Team Overview" tab (see ClinicianDashboard.tsx's tab bar) — self-fetching, same
 *  "mount effect + local getX() call" pattern as CECountdownCard/ClinicalQuestionLogSection,
 *  since this only ever renders for a clinic admin who's actively switched to this tab, not
 *  on every dashboard load. `onChanged` lets a parent-level refreshTick bump ride along
 *  with this component's own refetch, matching ClinicianDashboard.tsx's existing
 *  after-mutation refresh convention. */
export function TeamOverview() {
  const [pending, startTransition] = useTransition();
  const [overview, setOverview] = useState<ClinicTeamOverview | null | undefined>(undefined);
  const [transfers, setTransfers] = useState<RecentTransfer[]>([]);
  const [candidates, setCandidates] = useState<ClinicPatientLookup[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [transferCode, setTransferCode] = useState("");
  const [transferToUserId, setTransferToUserId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  const refresh = () => {
    Promise.all([getClinicDashboard(), getRecentTransfers(), getClinicPatientsForTransfer()]).then(([o, t, c]) => {
      setOverview(o);
      setTransfers(t);
      setCandidates(c);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  if (overview === undefined) return null;
  if (overview === null) return <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Not authorized.</p>;

  const seatsPercent = Math.min(100, Math.round((overview.seatsUsed / overview.maxSeats) * 100));

  const handleInvite = () => {
    setInviteError(null);
    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      setInviteError("Enter an email address.");
      return;
    }
    startTransition(async () => {
      const result = await inviteClinicMember(trimmed);
      if (!result.ok) {
        setInviteError(result.error);
        return;
      }
      setInviteEmail("");
      setInviteOpen(false);
      refresh();
    });
  };

  const handleRemove = (userId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from your clinic? Their patient records stay intact.`)) return;
    startTransition(async () => {
      await removeClinicMember(userId);
      refresh();
    });
  };

  const handleTransfer = () => {
    setTransferError(null);
    const candidate = candidates.find((c) => c.patientCode.trim().toLowerCase() === transferCode.trim().toLowerCase());
    if (!candidate) {
      setTransferError("Enter a valid patient code from your clinic.");
      return;
    }
    if (!transferToUserId) {
      setTransferError("Choose a clinician to assign this patient to.");
      return;
    }
    startTransition(async () => {
      const result = await transferPatient(candidate.id, transferToUserId, transferReason);
      if (!result.ok) {
        setTransferError(result.error);
        return;
      }
      setTransferCode("");
      setTransferToUserId("");
      setTransferReason("");
      refresh();
    });
  };

  return (
    <div className="clindash-team-overview">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Team Members
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 11.5 }} onClick={() => setInviteOpen((v) => !v)}>
          <PlusIcon size={12} />
          Invite Clinician
        </button>
      </div>

      {inviteOpen && (
        <div className="clindash-inline-form" style={{ marginBottom: 14 }}>
          <input
            className="input"
            type="email"
            placeholder="clinician@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          {inviteError && <p style={{ fontSize: 11.5, color: "var(--color-danger)", margin: 0 }}>{inviteError}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} disabled={pending} onClick={handleInvite}>
              Send Invite
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} disabled={pending} onClick={() => setInviteOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="clindash-team-table-wrap">
        <table className="clindash-team-table">
          <thead>
            <tr>
              <th></th>
              <th>Clinician Name</th>
              <th>Active Patients</th>
              <th>Seen This Week</th>
              <th>CE Hours</th>
              <th>Last Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {overview.members.map((m) => {
              const expanded = expandedId === m.userId;
              return (
                <Fragment key={m.userId}>
                  <tr className="clindash-team-row" onClick={() => setExpandedId(expanded ? null : m.userId)}>
                    <td>
                      <ChevronRightIcon size={12} style={{ transform: expanded ? "rotate(90deg)" : undefined }} />
                    </td>
                    <td>{m.name}</td>
                    <td>{m.activePatients}</td>
                    <td>{m.seenThisWeek}</td>
                    <td>{m.ceHours}</td>
                    <td>{m.lastActive ? new Date(m.lastActive).toLocaleDateString() : "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {m.isSelf ? (
                        <span className="clindash-team-you-label">You</span>
                      ) : (
                        <button type="button" className="clindash-question-delete" disabled={pending} onClick={() => handleRemove(m.userId, m.name)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="clindash-team-row-detail">
                      <td colSpan={7}>
                        {m.patients.length === 0 ? (
                          <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: 0 }}>No active patients.</p>
                        ) : (
                          m.patients.map((p) => (
                            <div className="clindash-team-patient-row" key={p.patientCode}>
                              <span>{p.patientCode}</span>
                              <span>{p.condition}</span>
                              <span>
                                Visit {p.visitCount} of {p.totalVisits}
                              </span>
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="clindash-seats-section">
        <div className="clindash-seats-label">
          Seats used: {overview.seatsUsed} of {overview.maxSeats}
        </div>
        <div className="clindash-ce-progress-bar">
          <div className="clindash-ce-progress-fill" style={{ width: `${seatsPercent}%` }} />
        </div>
        <p className="clindash-seats-price">{ADDITIONAL_SEAT_PRICE}</p>
        <form action={manageClinicSeatsAction}>
          <button type="submit" className="clindash-seats-add-link">
            Add Seats
          </button>
        </form>
      </div>

      <div className="clindash-transfer-section">
        <div className="card-kicker" style={{ margin: "0 0 10px" }}>
          Transfer a Patient
        </div>
        <div className="clindash-inline-form-row">
          <input
            className="input"
            list="clinic-patient-codes"
            placeholder="Patient code"
            value={transferCode}
            onChange={(e) => setTransferCode(e.target.value)}
          />
          <datalist id="clinic-patient-codes">
            {candidates.map((c) => (
              <option key={c.id} value={c.patientCode}>
                {c.ownerName}
              </option>
            ))}
          </datalist>
          <select className="input" value={transferToUserId} onChange={(e) => setTransferToUserId(e.target.value)}>
            <option value="">Assign to…</option>
            {overview.members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Reason (optional)"
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
          />
        </div>
        {transferError && <p style={{ fontSize: 11.5, color: "var(--color-danger)", margin: "8px 0 0" }}>{transferError}</p>}
        <button type="button" className="btn btn-primary" style={{ fontSize: 12, marginTop: 10 }} disabled={pending} onClick={handleTransfer}>
          Transfer
        </button>

        {transfers.length > 0 && (
          <div className="clindash-transfer-recent">
            {transfers.map((t) => (
              <div className="clindash-transfer-recent-row" key={t.id}>
                <span>{t.patientCode}</span>
                <span>
                  {t.fromName} → {t.toName}
                </span>
                <span>{new Date(t.transferredAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
