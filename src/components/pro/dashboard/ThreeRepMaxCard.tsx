"use client";

import { useEffect, useState, useTransition } from "react";
import { createThreeRepMaxTest, getThreeRepMaxCardData, type ThreeRepMaxEntry } from "@/app/actions/three-rep-max";
import { LIFTS, SEXES, STRENGTH_LEVEL_LABELS, MIN_AGE, MAX_AGE, type Lift, type Sex, type StrengthLevel } from "@/lib/three-rep-max-standards";
import { FORCE_LAB_GREEN, FORCE_LAB_AMBER } from "@/lib/force-lab-units";
import { PlusIcon } from "@/components/icons";

function levelColor(level: StrengthLevel): string {
  if (level === "advanced" || level === "elite") return FORCE_LAB_GREEN;
  if (level === "intermediate") return FORCE_LAB_AMBER;
  return "var(--color-neutral-700)";
}

function LiftRow({ lift, entry }: { lift: { value: Lift; label: string }; entry: ThreeRepMaxEntry | undefined }) {
  if (!entry) {
    return (
      <div className="trm-lift-row trm-lift-row--empty">
        <span className="trm-lift-name">{lift.label}</span>
        <span className="trm-lift-value">Not tested</span>
      </div>
    );
  }

  const { classification } = entry;
  return (
    <div className="trm-lift-row">
      <div>
        <div className="trm-lift-name">{lift.label}</div>
        <div className="trm-lift-meta">
          {Math.round(entry.weightLbs)} lbs × 3 · age {entry.age} · est. 1RM {Math.round(entry.oneRepMaxLbs)} lbs ·{" "}
          {new Date(entry.testedAt).toLocaleDateString()}
        </div>
      </div>
      <div className="trm-lift-standing">
        <span className="trm-level-badge" style={{ color: levelColor(classification.level), borderColor: levelColor(classification.level) }}>
          {STRENGTH_LEVEL_LABELS[classification.level]}
        </span>
        <span className="trm-age-bracket">vs. ages {classification.ageBracket}</span>
        {classification.nextLevel && classification.lbsToNextLevel != null && (
          <span className="trm-next-level">
            {classification.lbsToNextLevel} lbs to {STRENGTH_LEVEL_LABELS[classification.nextLevel]}
          </span>
        )}
      </div>
    </div>
  );
}

/** Active patient workspace's 3-Rep-Max card (below Force Lab — see PatientWorkspace.tsx) —
 *  self-fetching, same "mount effect + local getX() call" pattern as ForceLabSummary, since
 *  this is a separate data source (a barbell rep-max test, not dynamometer force) that
 *  shouldn't block the rest of the workspace's first paint. Tracks the "big three" — Squat,
 *  Bench Press, Deadlift — each classified against bodyweight-and-age-relative strength
 *  standards (see lib/three-rep-max-standards.ts) so a clinician has quick general-population
 *  context to discuss with the patient — "how does this compare to other people around their
 *  age," not just a raw number. */
export function ThreeRepMaxCard({ patientId, patientCode }: { patientId: string; patientCode: string }) {
  const [entries, setEntries] = useState<ThreeRepMaxEntry[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [lift, setLift] = useState<Lift>(LIFTS[0].value);
  const [weightLbs, setWeightLbs] = useState("");
  const [bodyweightLbs, setBodyweightLbs] = useState("");
  const [sex, setSex] = useState<Sex>(SEXES[0].value);
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getThreeRepMaxCardData(patientId).then((result) => {
      if (!cancelled) setEntries(result);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (entries === null) return null;

  const byLift = new Map(entries.map((e) => [e.lift, e]));

  const handleSave = () => {
    setError(null);
    const weight = parseFloat(weightLbs);
    const bodyweight = parseFloat(bodyweightLbs);
    const ageValue = parseInt(age, 10);
    if (!(weight > 0)) {
      setError("Enter the weight lifted for 3 reps.");
      return;
    }
    if (!(bodyweight > 0)) {
      setError("Enter the patient's bodyweight.");
      return;
    }
    if (!Number.isFinite(ageValue) || ageValue < MIN_AGE || ageValue > MAX_AGE) {
      setError(`Enter an age between ${MIN_AGE} and ${MAX_AGE}.`);
      return;
    }
    startTransition(async () => {
      const result = await createThreeRepMaxTest(patientId, lift, weight, bodyweight, sex, ageValue);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setWeightLbs("");
      setAge("");
      getThreeRepMaxCardData(patientId).then(setEntries);
    });
  };

  return (
    <div className="card elev-sm forcelab-card">
      <div className="forcelab-card-header">
        <span className="forcelab-card-kicker">3-Rep Max</span>
        <span className="forcelab-card-patient-code">{patientCode}</span>
      </div>

      <div className="forcelab-card-divider" />

      <div className="trm-lift-list">
        {LIFTS.map((l) => (
          <LiftRow key={l.value} lift={l} entry={byLift.get(l.value)} />
        ))}
      </div>

      <div className="forcelab-card-actions">
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Log Test
        </button>
      </div>

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="clindash-inline-form-row">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="trm-lift">Lift</label>
              <select className="input" id="trm-lift" value={lift} onChange={(e) => setLift(e.target.value as Lift)}>
                {LIFTS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="trm-sex">Sex</label>
              <select className="input" id="trm-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                {SEXES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="trm-age">Age</label>
              <input
                className="input"
                id="trm-age"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
          </div>
          <div className="clindash-inline-form-row">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="trm-weight">Weight lifted for 3 reps (lbs)</label>
              <input
                className="input"
                id="trm-weight"
                type="number"
                min="0"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="trm-bodyweight">Patient bodyweight (lbs)</label>
              <input
                className="input"
                id="trm-bodyweight"
                type="number"
                min="0"
                value={bodyweightLbs}
                onChange={(e) => setBodyweightLbs(e.target.value)}
              />
            </div>
          </div>
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending} onClick={handleSave}>
              {pending ? "Saving…" : "Save Test"}
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
