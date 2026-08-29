"use client";

import { useState, useTransition } from "react";
import { updatePatient, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { BODY_REGIONS, CLINICIAN_SPECIALTIES } from "@/lib/clinician-dashboard-types";

function dateInputValue(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

/** The active-patient workspace's "Edit" form (see PatientWorkspace.tsx, which owns
 *  whether this is shown) — wires up updatePatient, an action that already existed fully
 *  built but had no caller anywhere in the UI. Includes visitCount ("which visit a patient
 *  is on") for hand-correcting it — e.g. a patient transferred in mid-episode, or a
 *  data-entry slip — even though the normal way it advances is "Log Visit" (see
 *  VisitLogBanner/logVisit). Safe to hand-edit: nothing else on this workspace cross-checks
 *  visitCount against the number of VisitLog rows, so there's no consistency to break —
 *  VisitLog is only ever read for "did I already log a visit in the last 24 hours" and
 *  today's clinic-wide patient count, neither of which cares what visitCount itself says. */
export function EditPatientForm({ patient, onChanged, onClose }: { patient: PatientDetail; onChanged: () => void; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [condition, setCondition] = useState(patient.condition);
  const [bodyRegion, setBodyRegion] = useState(patient.bodyRegion);
  const [specialty, setSpecialty] = useState(patient.specialty);
  const [visitCount, setVisitCount] = useState(String(patient.visitCount));
  const [totalVisits, setTotalVisits] = useState(String(patient.totalVisits));
  const [nextVisit, setNextVisit] = useState(dateInputValue(patient.nextVisit));
  const [notes, setNotes] = useState(patient.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const visitCountNum = Number(visitCount);
    const totalVisitsNum = Number(totalVisits);
    if (!condition.trim()) {
      setError("Condition is required.");
      return;
    }
    if (!Number.isInteger(visitCountNum) || visitCountNum < 0) {
      setError("Current visit must be a whole number, 0 or more.");
      return;
    }
    if (!Number.isFinite(totalVisitsNum) || totalVisitsNum <= 0) {
      setError("Planned total visits must be a positive number.");
      return;
    }
    startTransition(async () => {
      const result = await updatePatient(patient.id, {
        condition,
        bodyRegion,
        specialty,
        visitCount: visitCountNum,
        totalVisits: totalVisitsNum,
        nextVisit: nextVisit || null,
        notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChanged();
      onClose();
    });
  };

  return (
    <div className="clindash-inline-form" style={{ marginBottom: 16 }}>
      <div className="card-kicker" style={{ margin: 0 }}>
        Edit Patient
      </div>
      <div className="clindash-inline-form-row">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="ep-condition">Condition</label>
          <input className="input" id="ep-condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="ep-region">Body region</label>
          <select className="input" id="ep-region" value={bodyRegion} onChange={(e) => setBodyRegion(e.target.value)}>
            {BODY_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="clindash-inline-form-row">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="ep-specialty">Specialty</label>
          <select className="input" id="ep-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            {CLINICIAN_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="ep-visits">Planned total visits</label>
          <input className="input" id="ep-visits" type="number" min="1" value={totalVisits} onChange={(e) => setTotalVisits(e.target.value)} />
        </div>
      </div>
      <div className="clindash-inline-form-row">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="ep-visit-count">Current visit</label>
          <input className="input" id="ep-visit-count" type="number" min="0" value={visitCount} onChange={(e) => setVisitCount(e.target.value)} />
        </div>
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="ep-next">Next visit (optional)</label>
        <input className="input" id="ep-next" type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} />
      </div>
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="ep-notes">Notes</label>
        <textarea className="input" id="ep-notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ resize: "vertical" }} />
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
      <div className="clindash-inline-form-actions">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : "Save Changes"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>
  );
}
