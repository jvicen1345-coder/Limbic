"use client";

import { useState, useTransition } from "react";
import { assignHEP, type AvailableHEP, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { PlusIcon } from "@/components/icons";

const MANUAL = "__manual__";

export function HEPSection({
  patient,
  availableHEPs,
  onChanged,
}: {
  patient: PatientDetail;
  availableHEPs: AvailableHEP[];
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(availableHEPs[0]?.id ?? MANUAL);
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isManual = selectedTemplate === MANUAL;

  const handleAssign = () => {
    setError(null);
    const template = availableHEPs.find((h) => h.id === selectedTemplate);
    const hepName = isManual ? manualName.trim() : template?.name ?? "";
    if (!hepName) {
      setError("Choose a saved program or enter a name.");
      return;
    }
    startTransition(async () => {
      const result = await assignHEP(patient.id, isManual ? null : selectedTemplate, hepName, null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setManualName("");
      setFormOpen(false);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          HEP Assignments
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Assign HEP
        </button>
      </div>

      {patient.hepAssignments.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No home exercise programs assigned yet.</p>
      ) : (
        <div>
          {patient.hepAssignments.map((a) => (
            <div className="clindash-hep-item" key={a.id}>
              <span className="clindash-hep-item-name">{a.hepName}</span>
              <span className="clindash-hep-item-date">{new Date(a.assignedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="hep-template">Program</label>
            <select
              className="input"
              id="hep-template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {availableHEPs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.bodyPart})
                </option>
              ))}
              <option value={MANUAL}>Enter manually…</option>
            </select>
          </div>
          {isManual && (
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="hep-manual">Program name</label>
              <input className="input" id="hep-manual" value={manualName} onChange={(e) => setManualName(e.target.value)} />
            </div>
          )}
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleAssign}>
              {pending ? "Assigning…" : "Assign"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
