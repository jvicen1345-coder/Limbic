"use client";

import { useMemo, useState, useTransition, useImperativeHandle, forwardRef } from "react";
import { createHepAction } from "@/app/actions/hep";
import { requestMovementLabExercise } from "@/app/actions/movement-lab-requests";
import { XIcon } from "@/components/icons";
import { MovementLabPicker } from "@/components/movement-lab/MovementLabPicker";
import { searchExercises, MOVEMENT_REGIONS, type MovementExercise, type MovementRegion } from "@/lib/movement-lab";
import { HEP_TEMPLATE_KINDS, HEP_TEMPLATE_KIND_LABELS, type HepTemplateExercise, type HepTemplateKind } from "@/lib/hep-templates";

/** Autocompletes the "Exercise" field against Movement Lab as the clinician types — same
 *  ranked search (searchExercises) and dropdown behavior as the Clinician Dashboard's own
 *  exercise-name autocomplete (see ExerciseNameField in components/pro/dashboard/
 *  HepExerciseList.tsx), kept as its own local copy here rather than a shared import since
 *  the two builders' surrounding row shapes have always evolved independently (this one also
 *  carries image/video URL fields and the standalone Movement Lab picker button below). The
 *  "request to add" flow is only offered to isPro accounts, matching
 *  requestMovementLabExercise's own isPro gate — a licensed-but-not-pro clinician (who can
 *  still use this builder, see hasLicenseAccess in app/(app)/hep/page.tsx) sees a plain
 *  "nothing matches" message instead of a request button that would just fail silently. */
function ExerciseNameField({
  value,
  onNameChange,
  onPickMovementExercise,
  isPro,
}: {
  value: string;
  onNameChange: (name: string) => void;
  onPickMovementExercise: (exercise: MovementExercise) => void;
  isPro: boolean;
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
        placeholder="Straight leg raise"
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
          ) : isPro ? (
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
          ) : (
            <p className="hep-exercise-autocomplete-empty">Nothing matches in Movement Lab.</p>
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

interface DraftExercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  frequency: string;
  notes: string;
  imageUrl: string;
  videoUrl: string;
}

let idSeq = 1;

const EMPTY_DRAFT: Omit<DraftExercise, "id"> = {
  name: "",
  sets: "",
  reps: "",
  weight: "",
  frequency: "",
  notes: "",
  imageUrl: "",
  videoUrl: "",
};

/** The fields a Movement Lab pick fills in — shared by the "+ Add from Movement Lab" picker
 *  (addFromMovementLab below, which creates a new row) and the inline autocomplete
 *  (applyMovementExercise, which fills an existing one). `weight` stays empty either way —
 *  Movement Lab dosage doesn't specify a load, so there's nothing meaningful to fill it
 *  with. `notes` gets the hold time plus the patient-facing cue; frequency now has its own
 *  field (see HepTemplateExercise in lib/hep-templates.ts) so it's no longer folded in here
 *  the way it used to be. */
function movementExerciseFields(ex: MovementExercise): Pick<DraftExercise, "sets" | "reps" | "weight" | "frequency" | "notes"> {
  return {
    sets: ex.dosage.sets,
    reps: ex.dosage.reps,
    weight: "",
    frequency: ex.dosage.frequency,
    notes: [ex.dosage.hold ? `hold ${ex.dosage.hold}` : "", ex.cue.replace(/^“|”$/g, "")].filter(Boolean).join(" — "),
  };
}

/** Imperative handle so the template library panel (a sibling, not a parent/child of the
 *  builder) can populate the builder from a saved template and read its current draft to
 *  save as a new one — see components/HepTemplateLibrary.tsx and app/(app)/hep/page.tsx.
 *  Deliberately not a controlled component (programName/exercises lifted to a parent) —
 *  that would mean touching every setState call below; this bolts on external read/write
 *  access without changing any of the builder's own state management or behavior. */
export interface HepBuilderHandle {
  loadTemplate(name: string, exercises: HepTemplateExercise[], kind: HepTemplateKind): void;
  getDraft(): { programName: string; exercises: HepTemplateExercise[]; kind: HepTemplateKind } | null;
}

/** A draft handed in by the page rather than built here — how a Movement Lab selection or a
 *  protocol phase arrives (see app/(app)/hep/page.tsx, which reads ?exercises= and
 *  ?protocol=&phase= and resolves them server-side). Consumed once, as the initial state:
 *  the builder stays uncontrolled after mount, so a later navigation with different params
 *  is a fresh page load and therefore a fresh mount, and nothing here has to reconcile a
 *  changing prop against edits the clinician has already made to the draft. */
export interface HepInitialDraft {
  programName: string;
  exercises: HepTemplateExercise[];
}

export const HepBuilder = forwardRef<HepBuilderHandle, { isPro: boolean; initialDraft?: HepInitialDraft | null }>(
  function HepBuilder({ isPro, initialDraft }, ref) {
  const [programName, setProgramName] = useState(initialDraft?.programName ?? "");
  const [exercises, setExercises] = useState<DraftExercise[]>(() =>
    (initialDraft?.exercises ?? []).map((ex) => ({ id: idSeq++, ...ex })),
  );
  // Only meaningful for "Save current as template" (see HepWorkspace.tsx saveCurrentAsTemplate,
  // saveHepTemplateAction) — "Save program" below still writes a kind-less HepProgram, same as
  // before this field existed. Defaults to "home" since that's the only kind that existed
  // until now, so an old bookmarked draft or a Movement Lab deep-link (which doesn't specify
  // one) still behaves exactly as it always has.
  const [kind, setKind] = useState<HepTemplateKind>("home");
  const [isPending, startTransition] = useTransition();

  useImperativeHandle(ref, () => ({
    loadTemplate(name, templateExercises, templateKind) {
      setProgramName(name);
      setExercises(templateExercises.map((ex) => ({ id: idSeq++, ...ex })));
      setKind(templateKind);
    },
    getDraft() {
      if (!programName.trim() || exercises.length === 0) return null;
      return {
        programName: programName.trim(),
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          frequency: ex.frequency,
          notes: ex.notes,
          imageUrl: ex.imageUrl,
          videoUrl: ex.videoUrl,
        })),
        kind,
      };
    },
  }));

  const canSave = programName.trim().length > 0 && exercises.length > 0;

  function addExercise(prefill?: Omit<DraftExercise, "id">) {
    setExercises((prev) => [...prev, { id: idSeq++, ...(prefill ?? EMPTY_DRAFT) }]);
  }
  function addFromMovementLab(ex: MovementExercise) {
    addExercise({ name: ex.name, ...movementExerciseFields(ex), imageUrl: "", videoUrl: "" });
  }
  // Fills an existing row from an autocomplete pick (see ExerciseNameField below) — name
  // always overwrites, but sets/reps/frequency/notes only backfill fields the clinician
  // hasn't already typed into, same "don't clobber an edit made before the match was
  // chosen" reasoning as the Clinician Dashboard's own autocomplete (handlePickMovementExercise
  // in components/pro/dashboard/HepExerciseList.tsx).
  function applyMovementExercise(id: number, ex: MovementExercise) {
    const fields = movementExerciseFields(ex);
    setExercises((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              name: ex.name,
              sets: row.sets || fields.sets,
              reps: row.reps || fields.reps,
              frequency: row.frequency || fields.frequency,
              notes: row.notes || fields.notes,
            }
          : row,
      ),
    );
  }
  function updateExercise(id: number, field: keyof Omit<DraftExercise, "id">, value: string) {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  }
  function removeExercise(id: number) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function save() {
    if (!canSave) return;
    const payload = {
      programName: programName.trim(),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        frequency: ex.frequency,
        notes: ex.notes,
        imageUrl: ex.imageUrl,
        videoUrl: ex.videoUrl,
      })),
    };
    startTransition(() => {
      createHepAction(payload);
    });
    setProgramName("");
    setExercises([]);
  }

  return (
    <div className="card elev-sm" style={{ marginBottom: 22 }}>
      <div className="card-kicker">New program</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
        <div className="field">
          <label>Program type</label>
          <div className="pro-filter-bar" style={{ marginBottom: 0 }}>
            {HEP_TEMPLATE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={`pro-filter-chip${kind === k ? " active" : ""}`}
                onClick={() => setKind(k)}
              >
                {HEP_TEMPLATE_KIND_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="hep-program">Program name</label>
          <input
            className="input"
            id="hep-program"
            placeholder="Post-op ACL, Phase 2"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exercises.map((ex) => (
            <div
              key={ex.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: 10,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-neutral-100)",
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="field" style={{ flex: 2, minWidth: 140 }}>
                  <label>Exercise</label>
                  <ExerciseNameField
                    value={ex.name}
                    onNameChange={(name) => updateExercise(ex.id, "name", name)}
                    onPickMovementExercise={(movementEx) => applyMovementExercise(ex.id, movementEx)}
                    isPro={isPro}
                  />
                </div>
                <div className="field" style={{ width: 70 }}>
                  <label>Sets</label>
                  <input
                    className="input"
                    placeholder="3"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                  />
                </div>
                <div className="field" style={{ width: 70 }}>
                  <label>Reps</label>
                  <input
                    className="input"
                    placeholder="12"
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                  />
                </div>
                <div className="field" style={{ width: 100 }}>
                  <label>Weight</label>
                  <input
                    className="input"
                    placeholder="20 lbs"
                    value={ex.weight}
                    onChange={(e) => updateExercise(ex.id, "weight", e.target.value)}
                  />
                </div>
                <div className="field" style={{ width: 100 }}>
                  <label>Frequency</label>
                  <input
                    className="input"
                    placeholder="2x/day"
                    value={ex.frequency}
                    onChange={(e) => updateExercise(ex.id, "frequency", e.target.value)}
                  />
                </div>
                <div className="field" style={{ flex: 2, minWidth: 140 }}>
                  <label>Notes</label>
                  <input
                    className="input"
                    placeholder="No pain, ice after"
                    value={ex.notes}
                    onChange={(e) => updateExercise(ex.id, "notes", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon icon-btn-sized"
                  aria-label="Remove exercise"
                  style={{ "--icon-btn-dim": "34px", flexShrink: 0 } as React.CSSProperties}
                  onClick={() => removeExercise(ex.id)}
                >
                  <XIcon size={15} />
                </button>
              </div>

              {isPro && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div className="field" style={{ flex: 1, minWidth: 160 }}>
                    <label>Image URL (PRO)</label>
                    <input
                      className="input"
                      placeholder="https://..."
                      value={ex.imageUrl}
                      onChange={(e) => updateExercise(ex.id, "imageUrl", e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: 160 }}>
                    <label>Video URL (PRO)</label>
                    <input
                      className="input"
                      placeholder="https://youtube.com/..."
                      value={ex.videoUrl}
                      onChange={(e) => updateExercise(ex.id, "videoUrl", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!isPro && exercises.length > 0 && (
          <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>
            <a href="/pro/membership">Upgrade to LimbicPRO</a> to attach a photo or video link to each exercise.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
          <button type="button" className="btn btn-secondary" onClick={() => addExercise()}>
            + Add exercise
          </button>
          <MovementLabPicker onPick={addFromMovementLab} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            borderTop: "1px solid var(--color-neutral-200)",
            paddingTop: 14,
          }}
        >
          <button type="button" className="btn btn-primary" disabled={!canSave || isPending} onClick={save}>
            Save program
          </button>
        </div>
      </div>
    </div>
  );
});
