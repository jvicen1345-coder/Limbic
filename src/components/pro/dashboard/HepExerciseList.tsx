"use client";

import { useMemo, useState, useTransition } from "react";
import { XIcon } from "@/components/icons";
import type { HepTemplateExercise } from "@/lib/hep-templates";
import { searchExercises, MOVEMENT_REGIONS, type MovementExercise, type MovementRegion } from "@/lib/movement-lab";
import { requestMovementLabExercise } from "@/app/actions/movement-lab-requests";

let idSeq = 1;
type DraftRow = HepTemplateExercise & { _id: number };
const EMPTY_ROW: HepTemplateExercise = { name: "", sets: "", reps: "", weight: "", notes: "", imageUrl: "", videoUrl: "" };

/** Rough patient-facing dosage note for an autocompleted Movement Lab pick — same fields as
 *  HepBuilder.tsx's own addFromMovementLab, kept as its own small copy here rather than a
 *  shared import since it's a one-off string join, not shared business logic, and the two
 *  components otherwise have no reason to depend on each other. */
function movementExerciseNotes(ex: MovementExercise): string {
  return [ex.dosage.hold ? `hold ${ex.dosage.hold}` : "", ex.dosage.frequency, ex.cue.replace(/^“|”$/g, "")].filter(Boolean).join(" — ");
}

/** The "Exercise" name input for one row in ExerciseListEditor below — autocompletes against
 *  Movement Lab as the clinician types (searchExercises, same ranked search
 *  MovementLabPicker.tsx and the browse page use), and when nothing matches offers to submit
 *  a MovementLabExerciseRequest for admin review (see app/actions/movement-lab-requests.ts)
 *  instead of leaving the clinician stuck typing a name Movement Lab has no record of. */
function ExerciseNameField({
  value,
  onNameChange,
  onPickMovementExercise,
}: {
  value: string;
  onNameChange: (name: string) => void;
  onPickMovementExercise: (exercise: MovementExercise) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestRegion, setRequestRegion] = useState<MovementRegion | "">("");
  const [requestNote, setRequestNote] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const query = value.trim();
  const results = useMemo(() => (query.length >= 2 ? searchExercises(query).slice(0, 5) : []), [query]);
  const showDropdown = focused && query.length >= 2 && !requestOpen && !requestSent;

  const handleSubmitRequest = () => {
    startTransition(async () => {
      const result = await requestMovementLabExercise(query, requestRegion || null, requestNote);
      if (result.ok) setRequestSent(true);
    });
  };

  return (
    <div className="hep-exercise-name-field">
      <input
        className="input"
        placeholder="Exercise"
        value={value}
        onChange={(e) => {
          onNameChange(e.target.value);
          setRequestOpen(false);
          setRequestSent(false);
        }}
        onFocus={() => setFocused(true)}
        // Delayed so a click on a dropdown row (below) registers before the dropdown
        // unmounts — an onMouseDown on those rows fires first regardless, but this also
        // covers keyboard/touch selection without needing per-row event juggling.
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />

      {showDropdown && (
        <div className="hep-exercise-autocomplete">
          {results.length > 0 ? (
            results.map((ex) => (
              <button
                type="button"
                key={ex.id}
                className="hep-exercise-autocomplete-row"
                onMouseDown={() => {
                  onPickMovementExercise(ex);
                  setFocused(false);
                }}
              >
                <span className="hep-exercise-autocomplete-name">{ex.name}</span>
                <span className="hep-exercise-autocomplete-region">{ex.region}</span>
              </button>
            ))
          ) : (
            <button
              type="button"
              className="hep-exercise-autocomplete-request"
              onMouseDown={() => {
                setRequestOpen(true);
                setFocused(false);
              }}
            >
              Not in Movement Lab — Request to add &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}

      {requestOpen && !requestSent && (
        <div className="hep-exercise-request-form">
          <select className="input" value={requestRegion} onChange={(e) => setRequestRegion(e.target.value as MovementRegion | "")}>
            <option value="">Region (optional)</option>
            {MOVEMENT_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Why you need it (optional)"
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
          />
          <div className="hep-exercise-request-actions">
            <button type="button" className="btn btn-secondary" disabled={pending} onClick={handleSubmitRequest}>
              {pending ? "Sending…" : "Send request"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRequestOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {requestSent && <p className="hep-exercise-request-sent">Requested — an admin will review it.</p>}
    </div>
  );
}

/** Compact exercise-row editor shared by the HEP section's manual-entry path and the Session
 *  Exercises section (see HEPSection.tsx, SessionExerciseSection.tsx) — a scoped-down sibling
 *  of components/HepBuilder.tsx's own exercise rows: no image/video URLs or the standalone
 *  Movement Lab picker button, since those belong to authoring a reusable template on the
 *  /hep page, not a quick per-patient list here (autocomplete on the name field above covers
 *  the "pull from Movement Lab" need instead). Row identity (a local id counter) is internal,
 *  same as HepBuilder's own DraftExercise[] — the parent only ever sees plain
 *  HepTemplateExercise[] through onChange. */
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
    onChange(
      next.map((r) => ({ name: r.name, sets: r.sets, reps: r.reps, weight: r.weight, notes: r.notes, imageUrl: r.imageUrl, videoUrl: r.videoUrl }))
    );
  };

  const addRow = () => emit([...rows, { ...EMPTY_ROW, _id: idSeq++ }]);
  const updateField = (id: number, field: keyof HepTemplateExercise, value: string) =>
    emit(rows.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
  const removeRow = (id: number) => emit(rows.filter((r) => r._id !== id));

  // A Movement Lab pick fills the name always, but only backfills sets/reps/notes the
  // clinician hasn't already typed something into — picking shouldn't clobber an edit made
  // before the autocomplete match was chosen. Weight is left alone either way: Movement Lab
  // dosage doesn't specify a load, so there's nothing meaningful to fill it with.
  const handlePickMovementExercise = (id: number, exercise: MovementExercise) =>
    emit(
      rows.map((r) =>
        r._id === id
          ? {
              ...r,
              name: exercise.name,
              sets: r.sets || exercise.dosage.sets,
              reps: r.reps || exercise.dosage.reps,
              notes: r.notes || movementExerciseNotes(exercise),
            }
          : r
      )
    );

  return (
    <div className="hep-exercise-editor">
      {rows.map((r) => (
        <div className="hep-exercise-editor-row" key={r._id}>
          <div className="hep-exercise-editor-name-row">
            <ExerciseNameField
              value={r.name}
              onNameChange={(name) => updateField(r._id, "name", name)}
              onPickMovementExercise={(ex) => handlePickMovementExercise(r._id, ex)}
            />
            <button
              type="button"
              className="hep-exercise-editor-remove"
              aria-label="Remove exercise"
              onClick={() => removeRow(r._id)}
            >
              <XIcon size={13} />
            </button>
          </div>
          <div className="hep-exercise-editor-dosage-row">
            <input className="input" placeholder="Sets" value={r.sets} onChange={(e) => updateField(r._id, "sets", e.target.value)} />
            <input className="input" placeholder="Reps" value={r.reps} onChange={(e) => updateField(r._id, "reps", e.target.value)} />
            <input
              className="input"
              placeholder="Weight (e.g. 20 lbs)"
              value={r.weight}
              onChange={(e) => updateField(r._id, "weight", e.target.value)}
            />
            <input className="input" placeholder="Notes" value={r.notes} onChange={(e) => updateField(r._id, "notes", e.target.value)} />
          </div>
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
      {exercises.map((ex, i) => {
        const setsReps = [ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`].filter(Boolean).join(" × ");
        const dosage = [setsReps, ex.weight && `@ ${ex.weight}`].filter(Boolean).join(" ");
        return (
          <li key={i}>
            <span className="hep-exercise-display-name">{ex.name}</span>
            {dosage && <span className="hep-exercise-display-dosage">{dosage}</span>}
            {ex.notes && <span className="hep-exercise-display-notes">{ex.notes}</span>}
          </li>
        );
      })}
    </ul>
  );
}
