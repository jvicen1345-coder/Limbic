"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addSessionExerciseLog,
  updateSessionExerciseLog,
  deleteSessionExerciseLog,
  type PatientDetail,
} from "@/app/actions/clinician-dashboard";
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

/** Which entry the inline form below is currently editing — `logId: null` is the "Log
 *  Session" new-entry form, an id is a correction to that existing row. */
type SessionDraft = { logId: string | null; visitNumber: string; exercises: HepTemplateExercise[] };

/** The one inline form, shared by the new-session and edit-a-past-session paths so both
 *  offer the same fields. The parent keys this on the draft's logId, which matters:
 *  ExerciseListEditor seeds its rows from props once on mount, so switching straight from
 *  one session's edit form to another's has to remount rather than re-render. */
function SessionForm({
  draft,
  pending,
  error,
  onSave,
  onCancel,
}: {
  draft: SessionDraft;
  pending: boolean;
  error: string | null;
  onSave: (visitNumber: string, exercises: HepTemplateExercise[]) => void;
  onCancel: () => void;
}) {
  const [visitNumber, setVisitNumber] = useState(draft.visitNumber);
  const [exercises, setExercises] = useState<HepTemplateExercise[]>(draft.exercises);
  const fieldId = `se-visit-${draft.logId ?? "new"}`;

  return (
    <div className="clindash-inline-form">
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor={fieldId}>Visit number</label>
        <input
          className="input"
          id={fieldId}
          type="number"
          min="1"
          value={visitNumber}
          onChange={(e) => setVisitNumber(e.target.value)}
        />
      </div>
      <ExerciseListEditor exercises={exercises} onChange={setExercises} />
      {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
      <div className="clindash-inline-form-actions">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => onSave(visitNumber, exercises)}>
          {pending ? "Saving…" : draft.logId ? "Save Changes" : "Save Session"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** What was actually done with the patient in clinic, one entry per visit — distinct from
 *  HEPSection above it (what the patient does on their own at home). Kept as history, newest
 *  first, same "log entries" shape as ClinicalNotesSection just below this one, so a
 *  clinician can look back at what was worked on in a past session. Past entries are
 *  editable in place (see updateSessionExerciseLog): a session is often written up after
 *  the fact, and the numbers feed the progression trend below, so a wrong weight is worth
 *  correcting rather than logging a second time. */
export function SessionExerciseSection({ patient, onChanged }: { patient: PatientDetail; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  /** Kept apart from `error` above, which belongs to whichever form is open: a delete can
   *  be triggered from a row other than the one being edited, and its failure shouldn't
   *  appear inside that unrelated form. */
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progression = useMemo(() => computeExerciseProgression(patient.sessionExerciseLogs), [patient.sessionExerciseLogs]);

  const openNew = () => {
    setError(null);
    setDraft((current) =>
      current && current.logId === null ? null : { logId: null, visitNumber: String(patient.visitCount || 1), exercises: [] }
    );
  };

  const openEdit = (log: PatientDetail["sessionExerciseLogs"][number]) => {
    setError(null);
    setDraft({ logId: log.id, visitNumber: String(log.visitNumber), exercises: parseHepExercises(log.exercises) });
  };

  const handleSave = (visitNumber: string, exercises: HepTemplateExercise[]) => {
    if (!draft) return;
    const cleaned = exercises.filter((ex) => ex.name.trim().length > 0);
    if (cleaned.length === 0) {
      setError("Add at least one exercise.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = draft.logId
        ? await updateSessionExerciseLog(draft.logId, Number(visitNumber), cleaned)
        : await addSessionExerciseLog(patient.id, Number(visitNumber), cleaned);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(null);
      onChanged();
    });
  };

  const handleDelete = (logId: string) => {
    if (!window.confirm("Delete this logged session? This can't be undone.")) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteSessionExerciseLog(logId);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      if (draft?.logId === logId) setDraft(null);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Session Exercises
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={openNew}>
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
                <span className="clindash-session-exercise-actions">
                  <button
                    type="button"
                    className="clindash-session-exercise-action"
                    disabled={pending}
                    onClick={() => (draft?.logId === log.id ? setDraft(null) : openEdit(log))}
                  >
                    {draft?.logId === log.id ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="clindash-session-exercise-action clindash-session-exercise-action--danger"
                    disabled={pending}
                    onClick={() => handleDelete(log.id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
              {draft?.logId === log.id ? (
                <SessionForm
                  key={log.id}
                  draft={draft}
                  pending={pending}
                  error={error}
                  onSave={handleSave}
                  onCancel={() => setDraft(null)}
                />
              ) : (
                <ExerciseListDisplay exercises={parseHepExercises(log.exercises)} emptyText="" />
              )}
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

      {deleteError && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: "8px 0 0" }}>{deleteError}</p>}

      {draft && draft.logId === null && (
        <SessionForm
          key="new"
          draft={draft}
          pending={pending}
          error={error}
          onSave={handleSave}
          onCancel={() => setDraft(null)}
        />
      )}
    </div>
  );
}
