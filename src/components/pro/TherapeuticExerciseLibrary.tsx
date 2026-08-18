"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

interface TherapeuticExercise {
  name: string;
  condition: string;
  region: string;
  setup: string;
  steps: string[];
  dosage: string;
  cue: string;
  pairsWith: string[];
}

const REGIONS = ["All", "Spine", "Shoulder", "Hip", "Knee", "Ankle/Foot", "Neurological", "Geriatrics"] as const;

// Real, clinician-sourced entries only — no filler content here (unlike SpecialTestsLibrary/
// GuidelinesLibrary's "coming soon" scaffolding), since fabricating dosage/technique details
// for a clinical exercise library would be irresponsible. Grows one real entry at a time.
const EXERCISES: TherapeuticExercise[] = [
  {
    name: "Thoracic Extension Exercise",
    condition: "Thoracic Kyphosis",
    region: "Spine",
    setup: "Sit upright in a chair with feet supported. Place both hands behind the head, elbows out.",
    steps: [
      "Gently draw the shoulder blades back and down.",
      "Extend the upper back over the back of the chair without forcing the neck backward.",
      "Hold 3–5 seconds.",
      "Return to neutral.",
    ],
    dosage: "10 reps × 2–3 sets",
    cue: "“Lift your breastbone toward the ceiling while keeping your ribs controlled—don’t arch from your low back.”",
    pairsWith: ["Scapular retraction", "Thoracic extension mobility work", "Pectoral stretching", "Cervical postural exercises"],
  },
];

function ExerciseCard({ ex }: { ex: TherapeuticExercise }) {
  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>
          <div>{ex.name}</div>
          <div className="pro-accordion-summary-sub">
            <span className="tag tag-accent" style={{ marginRight: 6 }}>
              {ex.region}
            </span>
            For {ex.condition}
          </div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <div style={{ fontSize: 12.5, display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <strong>Setup:</strong> {ex.setup}
          </div>
          <div>
            <strong>Steps:</strong>
            <ol style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              {ex.steps.map((step) => (
                <li key={step} style={{ marginBottom: 2 }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <strong>Dosage:</strong> {ex.dosage}
          </div>
          <div>
            <strong>PT cue:</strong> {ex.cue}
          </div>
          <div>
            <strong>Pairs well with:</strong> {ex.pairsWith.join(", ")}
          </div>
        </div>
      </div>
    </details>
  );
}

export function TherapeuticExerciseLibrary() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const filtered = region === "All" ? EXERCISES : EXERCISES.filter((ex) => ex.region === region);

  return (
    <>
      <div className="pro-filter-bar">
        {REGIONS.map((r) => (
          <button key={r} type="button" className={`pro-filter-chip${region === r ? " active" : ""}`} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>No exercises in this region yet.</p>
      ) : (
        <div className="pro-accordion">
          {filtered.map((ex) => (
            <ExerciseCard ex={ex} key={ex.name} />
          ))}
        </div>
      )}
    </>
  );
}
