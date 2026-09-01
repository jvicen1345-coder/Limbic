"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MOVEMENT_LAB_TOTAL,
  MOVEMENT_REGIONS,
  formatDosage,
  searchExercises,
  type MovementExercise,
  type MovementRegion,
} from "@/lib/movement-lab";
import { useSwitchToMovementLabTab } from "@/components/ExerciseProgramsTabs";

/**
 * The HEP Builder's "add from the bank" control (see components/HepBuilder.tsx).
 *
 * This replaced a plain `<select>` over THERAPEUTIC_EXERCISES, which worked only because
 * that list had one entry in it — a native dropdown over 160+ options with no search is
 * unusable, and a clinician looking for "the band external rotation one" would have to
 * scroll it. So: a search box over the same ranked search the browse page uses, a region
 * narrowing chip row, and a short scrolling result list.
 *
 * Deliberately does not repeat the browse page's full detail accordion. A clinician reaching
 * for this has already decided what they want; the full record — technique, errors,
 * precautions — is one click away on /movement-lab, which is linked at the bottom.
 */
export function MovementLabPicker({ onPick }: { onPick: (exercise: MovementExercise) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<MovementRegion | "">("");
  const switchToMovementLab = useSwitchToMovementLabTab();

  // Only shown once the picker is open, so the search runs on nothing while it's collapsed.
  const results = useMemo(
    () => (open ? searchExercises(query, { region: region || undefined }).slice(0, 40) : []),
    [open, query, region],
  );

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        + Add from Movement Lab
      </button>
    );
  }

  return (
    <div className="ml-picker card elev-sm" style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Movement Lab — {MOVEMENT_LAB_TOTAL} exercises
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Done
        </button>
      </div>

      <div className="field">
        <label htmlFor="ml-picker-search">Search</label>
        {/* autoFocus is safe here specifically because the picker only mounts on an explicit
            click — focusing its one input is what that click asked for, rather than stealing
            focus on page load. */}
        <input
          className="input"
          id="ml-picker-search"
          type="search"
          autoFocus
          placeholder="Clamshell, rotator cuff, sciatica…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pro-filter-bar" style={{ marginBottom: 0 }}>
        <button
          type="button"
          className={`pro-filter-chip${region === "" ? " active" : ""}`}
          onClick={() => setRegion("")}
        >
          All
        </button>
        {MOVEMENT_REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`pro-filter-chip${region === r ? " active" : ""}`}
            onClick={() => setRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>
          Nothing matches. Try a condition name, or the name you learned the exercise under.
        </p>
      ) : (
        <div className="ml-picker-results">
          {results.map((ex) => (
            <button key={ex.id} type="button" className="ml-picker-row" onClick={() => onPick(ex)}>
              <span>
                <span className="ml-picker-row-name">{ex.name}</span>
                <span className="ml-picker-row-sub">
                  {ex.region} · {formatDosage(ex.dosage)}
                </span>
              </span>
              <span className="ml-picker-row-sub" aria-hidden="true">
                Add
              </span>
            </button>
          ))}
        </div>
      )}

      {switchToMovementLab ? (
        <button
          type="button"
          onClick={switchToMovementLab}
          style={{
            color: "var(--color-accent-700)",
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            fontSize: 12,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          Browse the full Movement Lab, with technique and precautions
        </button>
      ) : (
        <Link href="/movement-lab" style={{ fontSize: 12 }}>
          Browse the full Movement Lab, with technique and precautions
        </Link>
      )}
    </div>
  );
}
