"use client";

import { useState } from "react";
import { XIcon } from "@/components/icons";
import type { HepTemplateExercise } from "@/lib/hep-templates";

let idSeq = 1;
type DraftRow = HepTemplateExercise & { _id: number };
const EMPTY_ROW: HepTemplateExercise = { name: "", sets: "", reps: "", notes: "", imageUrl: "", videoUrl: "" };

/** Compact exercise-row editor shared by the HEP section's manual-entry path and the Session
 *  Exercises section (see HEPSection.tsx, SessionExerciseSection.tsx) — a scoped-down sibling
 *  of components/HepBuilder.tsx's own exercise rows: name/sets/reps/notes only, no
 *  image/video URLs or the Movement Lab picker, since those belong to authoring a reusable
 *  template on the /hep page, not a quick per-patient list here. Row identity (a local id
 *  counter) is internal, same as HepBuilder's own DraftExercise[] — the parent only ever
 *  sees plain HepTemplateExercise[] through onChange. */
export function ExerciseListEditor({
  exercises,
  onChange,
}: {
  exercises: HepTemplateExercise[];
  onChange: (exercises: HepTemplateExercise[]) => void;
}) {
  const [rows, setRows] = useState<DraftRow[]>(() => exercises.map((ex) => ({ ...ex, _id: idSeq++ })));

  const emit = (next: DraftRow[]) => {
    setRows(next);
    onChange(next.map((r) => ({ name: r.name, sets: r.sets, reps: r.reps, notes: r.notes, imageUrl: r.imageUrl, videoUrl: r.videoUrl })));
  };

  const addRow = () => emit([...rows, { ...EMPTY_ROW, _id: idSeq++ }]);
  const updateRow = (id: number, field: keyof HepTemplateExercise, value: string) =>
    emit(rows.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
  const removeRow = (id: number) => emit(rows.filter((r) => r._id !== id));

  return (
    <div className="hep-exercise-editor">
      {rows.map((r) => (
        <div className="hep-exercise-editor-row" key={r._id}>
          <input className="input" placeholder="Exercise" value={r.name} onChange={(e) => updateRow(r._id, "name", e.target.value)} />
          <input className="input" placeholder="Sets" value={r.sets} onChange={(e) => updateRow(r._id, "sets", e.target.value)} />
          <input className="input" placeholder="Reps" value={r.reps} onChange={(e) => updateRow(r._id, "reps", e.target.value)} />
          <input className="input" placeholder="Notes" value={r.notes} onChange={(e) => updateRow(r._id, "notes", e.target.value)} />
          <button
            type="button"
            className="hep-exercise-editor-remove"
            aria-label="Remove exercise"
            onClick={() => removeRow(r._id)}
          >
            <XIcon size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secondary" style={{ fontSize: 12, alignSelf: "flex-start" }} onClick={addRow}>
        + Add exercise
      </button>
    </div>
  );
}

/** Read-only rendering of the same HepTemplateExercise[] shape — the current HEP's exercise
 *  list and each Session Exercises history entry (see HEPSection.tsx,
 *  SessionExerciseSection.tsx). */
export function ExerciseListDisplay({ exercises, emptyText }: { exercises: HepTemplateExercise[]; emptyText: string }) {
  if (exercises.length === 0) {
    return <p className="hep-exercise-display-empty">{emptyText}</p>;
  }
  return (
    <ul className="hep-exercise-display">
      {exercises.map((ex, i) => (
        <li key={i}>
          <span className="hep-exercise-display-name">{ex.name}</span>
          {(ex.sets || ex.reps) && (
            <span className="hep-exercise-display-dosage">
              {ex.sets && `${ex.sets} sets`}
              {ex.sets && ex.reps && " × "}
              {ex.reps && `${ex.reps} reps`}
            </span>
          )}
          {ex.notes && <span className="hep-exercise-display-notes">{ex.notes}</span>}
        </li>
      ))}
    </ul>
  );
}
