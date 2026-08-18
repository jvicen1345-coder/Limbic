"use client";

import { useState, useTransition } from "react";
import { createHepAction } from "@/app/actions/hep";
import { XIcon } from "@/components/icons";
import { THERAPEUTIC_EXERCISES, parseDosage } from "@/lib/therapeutic-exercises-static";

interface DraftExercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  notes: string;
  imageUrl: string;
  videoUrl: string;
}

let idSeq = 1;

const EMPTY_DRAFT: Omit<DraftExercise, "id"> = { name: "", sets: "", reps: "", notes: "", imageUrl: "", videoUrl: "" };

export function HepBuilder({ isPro }: { isPro: boolean }) {
  const [programName, setProgramName] = useState("");
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [isPending, startTransition] = useTransition();

  const canSave = programName.trim().length > 0 && exercises.length > 0;

  function addExercise(prefill?: Omit<DraftExercise, "id">) {
    setExercises((prev) => [...prev, { id: idSeq++, ...(prefill ?? EMPTY_DRAFT) }]);
  }
  function addFromLibrary(exerciseName: string) {
    const ex = THERAPEUTIC_EXERCISES.find((e) => e.name === exerciseName);
    if (!ex) return;
    const { reps, sets } = parseDosage(ex.dosage);
    addExercise({ name: ex.name, sets, reps, notes: ex.cue, imageUrl: "", videoUrl: "" });
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
                  <input
                    className="input"
                    placeholder="Straight leg raise"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
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
                <div className="field" style={{ flex: 2, minWidth: 140 }}>
                  <label>Notes</label>
                  <input
                    className="input"
                    placeholder="2x/day, no pain"
                    value={ex.notes}
                    onChange={(e) => updateExercise(ex.id, "notes", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Remove exercise"
                  style={{ width: 34, height: 34, flexShrink: 0 }}
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

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" onClick={() => addExercise()}>
            + Add exercise
          </button>
          <select
            className="btn btn-secondary"
            value=""
            aria-label="Add from exercise library"
            onChange={(e) => {
              if (e.target.value) addFromLibrary(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              + Add from library
            </option>
            {THERAPEUTIC_EXERCISES.map((ex) => (
              <option key={ex.name} value={ex.name}>
                {ex.name} ({ex.condition})
              </option>
            ))}
          </select>
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
}
