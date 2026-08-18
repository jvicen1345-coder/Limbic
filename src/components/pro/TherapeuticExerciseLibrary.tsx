"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { REGIONS, THERAPEUTIC_EXERCISES, type TherapeuticExercise } from "@/lib/therapeutic-exercises-static";

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
  const filtered = region === "All" ? THERAPEUTIC_EXERCISES : THERAPEUTIC_EXERCISES.filter((ex) => ex.region === region);

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
