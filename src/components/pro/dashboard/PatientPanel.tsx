"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPatient, type PatientListEntry } from "@/app/actions/clinician-dashboard";
import { BODY_REGIONS, CLINICIAN_SPECIALTIES, bodyRegionTagClass } from "@/lib/clinician-dashboard-types";
import { UserPlusIcon, XIcon } from "@/components/icons";

interface AddPatientForm {
  patientCode: string;
  condition: string;
  bodyRegion: string;
  specialty: string;
  totalVisits: string;
  nextVisit: string;
  referralSource: string;
}

const EMPTY_FORM: AddPatientForm = {
  patientCode: "",
  condition: "",
  bodyRegion: BODY_REGIONS[0],
  specialty: CLINICIAN_SPECIALTIES[0],
  totalVisits: "12",
  nextVisit: "",
  referralSource: "",
};

/** Left column of /pro/dashboard — the active caseload list plus its slide-open "Add
 *  Patient" form. Patients are referenced only by a clinician-assigned code (see
 *  ClinicalPatient.patientCode in schema.prisma) — there is no name field anywhere in this
 *  form, by design: no PHI is stored. */
export function PatientPanel({
  patients,
  selectedPatientId,
  onSelect,
  outcomeReminderIds,
}: {
  patients: PatientListEntry[];
  selectedPatientId: string | null;
  onSelect: (id: string | null) => void;
  /** Patient ids currently in getPatientsWithOutcomeReminders — a visitCount milestone
   *  with no outcome recorded today (see OutcomeMilestoneBanner.tsx for the workspace-side
   *  counterpart). Renders the small "Reassessment due" pill below. */
  outcomeReminderIds: Set<string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setError(null);
    const totalVisits = Number(form.totalVisits);
    startTransition(async () => {
      const result = await createPatient({
        patientCode: form.patientCode,
        condition: form.condition,
        bodyRegion: form.bodyRegion,
        specialty: form.specialty,
        totalVisits,
        nextVisit: form.nextVisit || undefined,
        referralSource: form.referralSource || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(EMPTY_FORM);
      setFormOpen(false);
      router.refresh();
      onSelect(result.patient.id);
    });
  };

  return (
    <div className="card elev-sm">
      <div className="clindash-panel-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Caseload
        </div>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Add patient" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? <XIcon size={15} /> : <UserPlusIcon size={15} />}
        </button>
      </div>

      {formOpen && (
        <div className="clindash-add-patient-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-code">Patient code</label>
            <input
              className="input"
              id="pp-code"
              placeholder="e.g. PT-014"
              value={form.patientCode}
              onChange={(e) => setForm((f) => ({ ...f, patientCode: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-condition">Condition</label>
            <input
              className="input"
              id="pp-condition"
              placeholder="e.g. Post-op ACL reconstruction"
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-region">Body region</label>
            <select
              className="input"
              id="pp-region"
              value={form.bodyRegion}
              onChange={(e) => setForm((f) => ({ ...f, bodyRegion: e.target.value }))}
            >
              {BODY_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-specialty">Specialty</label>
            <select
              className="input"
              id="pp-specialty"
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            >
              {CLINICIAN_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-visits">Planned total visits</label>
            <input
              className="input"
              id="pp-visits"
              type="number"
              min="1"
              value={form.totalVisits}
              onChange={(e) => setForm((f) => ({ ...f, totalVisits: e.target.value }))}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-next">Next visit (optional)</label>
            <input
              className="input"
              id="pp-next"
              type="date"
              value={form.nextVisit}
              onChange={(e) => setForm((f) => ({ ...f, nextVisit: e.target.value }))}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pp-referral">Referral source (optional)</label>
            <input
              className="input"
              id="pp-referral"
              placeholder="e.g. Dr. Smith — Orthopedics, Self-referral, Word of mouth"
              value={form.referralSource}
              onChange={(e) => setForm((f) => ({ ...f, referralSource: e.target.value }))}
            />
          </div>

          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}

          <p className="clindash-hipaa-note">
            Reminder: use a clinic-assigned code only, never a patient&rsquo;s name. Limbic does not store patient
            identities.
          </p>

          <div className="clindash-add-patient-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending || !form.patientCode.trim() || !form.condition.trim()}
              onClick={handleCreate}
            >
              {pending ? "Adding…" : "Add Patient"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {patients.length === 0 ? (
        <p className="clindash-empty-state">
          No active patients yet. Add your first patient to start preparing pre-visit briefs and tracking outcomes.
        </p>
      ) : (
        <div className="clindash-patient-list">
          {patients.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`clindash-patient-card${p.id === selectedPatientId ? " clindash-patient-card--selected" : ""}`}
              onClick={() => onSelect(p.id === selectedPatientId ? null : p.id)}
            >
              <div className="clindash-patient-card-top">
                <span className="clindash-patient-code">{p.patientCode}</span>
                {p.dueForReassessment && <span className="clindash-reassess-dot" title="Due for reassessment" />}
              </div>
              <div className="clindash-patient-condition">{p.condition}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                <span className={`tag ${bodyRegionTagClass(p.bodyRegion)}`} style={{ fontSize: "var(--fs-10)" }}>
                  {p.bodyRegion}
                </span>
                <span className="clindash-patient-progress">
                  Visit {p.visitCount} of {p.totalVisits}
                </span>
                {outcomeReminderIds.has(p.id) && <span className="clindash-reassess-pill">Reassessment due</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
