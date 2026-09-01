"use client";

import { useMemo, useState, useTransition } from "react";
import { addSessionExerciseLog, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { ExerciseListEditor, ExerciseListDisplay } from "./HepExerciseList";
import { parseHepExercises, type HepTemplateExercise } from "@/lib/hep-templates";
import { computeExerciseProgression, type ExerciseProgressionTrend } from "@/lib/exercise-progression";
import { FORCE_LAB_GREEN, FORCE_LAB_RED } from "@/lib/force-lab-units";
import { PlusIcon } from "@/components/icons";

function TrendBadge({ trend }: { trend: ExerciseProgressionTrend }) {
  if (trend === "up") return <span style={{ color: FORCE_LAB_GREEN, fontSize: 12, fontWeight: 700 }}>↑ progressing</span>;
  if (trend === "down") return <span style={{ color: FORCE_LAB_RED, fontSize: 12, fontWeight: 700 }}>↓ regressing</span>;
  if (trend === "flat") return <span style={{ color: "var(--color-neutral-700)", fontSize: 12 }}>→ holding steady</span>;
  return null;
}

/** What was actually done with the patient in clinic, one entry per visit — distinct from
 *  HEPSection above it (what the patient does on their own at home). Kept as history, newest
 *  first, same "log entries, don't overwrite" shape as ClinicalNotesSection just below this
 *  one, so a clinician can look back at what was worked on in a past session. */
export function SessionExerciseSection({ patient, onChanged }: { patient: PatientDetail; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [visitNumber, setVisitNumber] = useState(String(patient.visitCount || 1));
  const [exercises, setExercises] = useState<HepTemplateExercise[]>([]);
  const [error, setError] = useState<string | null>(null);

  const progression = useMemo(() => computeExerciseProgression(patient.sessionExerciseLogs), [patient.sessionExerciseLogs]);

  const handleSave = () => {
    setError(null);
    const cleaned = exercises.filter((ex) => ex.name.trim().length > 0);
    if (cleaned.length === 0) {
      setError("Add at least one exercise.");
      return;
    }
    startTransition(async () => {
      const result = await addSessionExerciseLog(patient.id, Number(visitNumber), cleaned);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setExercises([]);
      setFormOpen(false);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Session Exercises
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Log Session
        </button>
      </div>

      {patient.sessionExerciseLogs.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No sessions logged yet.</p>
      ) : (
        <div>
          {patient.sessionExerciseLogs.map((log) => (
            <div className="clindash-session-exercise-item" key={log.id}>
              <div className="clindash-note-item-top">
                <span>Visit {log.visitNumber}</span>
                <span>{new Date(log.loggedAt).toLocaleDateString()}</span>
              </div>
              <ExerciseListDisplay exercises={parseHepExercises(log.exercises)} emptyText="" />
            </div>
          ))}
        </div>
      )}

      {progression.length > 0 && (
        <details className="clindash-hep-history">
          <summary>Progression ({progression.length})</summary>
          {progression.map((p) => (
            <div className="clindash-progression-row" key={p.name}>
              <div className="clindash-progression-header">
                <span className="clindash-progression-name">{p.name}</span>
                <TrendBadge trend={p.trend} />
              </div>
              <div className="clindash-progression-points">
                {p.points.map((pt, i) => (
                  <span className="clindash-progression-point" key={i}>
                    Visit {pt.visitNumber}: {[pt.weight, pt.sets && pt.reps && `${pt.sets}×${pt.reps}`].filter(Boolean).join(" · ") || "—"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </details>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="se-visit">Visit number</label>
            <input
              className="input"
              id="se-visit"
              type="number"
              min="1"
              value={visitNumber}
              onChange={(e) => setVisitNumber(e.target.value)}
            />
          </div>
          <ExerciseListEditor exercises={exercises} onChange={setExercises} />
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save Session"}
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
