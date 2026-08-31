"use client";

import { useState, useTransition } from "react";
import { assignHEP, type AvailableHEP, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { PlusIcon } from "@/components/icons";
import { ExerciseListEditor, ExerciseListDisplay } from "./HepExerciseList";
import { parseHepExercises, type HepTemplateExercise } from "@/lib/hep-templates";

const MANUAL = "__manual__";

/** Current Home Exercise Program for one patient (see PatientWorkspace.tsx) — the most
 *  recent PatientHEPAssignment shown with its actual exercise list, so this reads as "what I
 *  want the client doing at home" rather than just a program name. assignHEP still creates a
 *  new row every time (see that action's own comment) rather than editing one in place, so
 *  older assignments remain available as collapsed history below — what's current is the
 *  thing worth a glance, the log is a click away. */
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
  const [manualExercises, setManualExercises] = useState<HepTemplateExercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isManual = selectedTemplate === MANUAL;
  const selectedTemplateData = availableHEPs.find((h) => h.id === selectedTemplate);
  const current = patient.hepAssignments[0] ?? null;
  const history = patient.hepAssignments.slice(1);

  const handleAssign = () => {
    setError(null);
    const hepName = isManual ? manualName.trim() : selectedTemplateData?.name ?? "";
    if (!hepName) {
      setError("Choose a saved program or enter a name.");
      return;
    }
    const exercises = isManual ? manualExercises.filter((ex) => ex.name.trim().length > 0) : selectedTemplateData?.exercises ?? [];
    startTransition(async () => {
      const result = await assignHEP(patient.id, isManual ? null : selectedTemplate, hepName, exercises.length > 0 ? exercises : null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setManualName("");
      setManualExercises([]);
      setFormOpen(false);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Home Exercise Program
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Update HEP
        </button>
      </div>

      {!current ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No home exercise program assigned yet.</p>
      ) : (
        <div className="clindash-hep-current">
          <div className="clindash-hep-current-top">
            <span className="clindash-hep-current-name">{current.hepName}</span>
            <span className="clindash-hep-item-date">Since {new Date(current.assignedAt).toLocaleDateString()}</span>
          </div>
          <ExerciseListDisplay
            exercises={parseHepExercises(current.exercises)}
            emptyText="No exercises attached to this program."
          />
        </div>
      )}

      {history.length > 0 && (
        <details className="clindash-hep-history">
          <summary>Past programs ({history.length})</summary>
          {history.map((a) => (
            <div className="clindash-hep-item" key={a.id}>
              <span className="clindash-hep-item-name">{a.hepName}</span>
              <span className="clindash-hep-item-date">{new Date(a.assignedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </details>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="hep-template">Program</label>
            <select className="input" id="hep-template" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
              {availableHEPs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.bodyPart})
                </option>
              ))}
              <option value={MANUAL}>Enter manually…</option>
            </select>
          </div>

          {isManual ? (
            <>
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="hep-manual">Program name</label>
                <input className="input" id="hep-manual" value={manualName} onChange={(e) => setManualName(e.target.value)} />
              </div>
              <ExerciseListEditor exercises={manualExercises} onChange={setManualExercises} />
            </>
          ) : (
            selectedTemplateData &&
            selectedTemplateData.exercises.length > 0 && (
              <ExerciseListDisplay exercises={selectedTemplateData.exercises} emptyText="" />
            )
          )}

          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleAssign}>
              {pending ? "Saving…" : "Save"}
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
