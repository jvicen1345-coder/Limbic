"use client";

import { useEffect, useState, useTransition } from "react";
import { addPatientGoal, getGoalBankSuggestions, updateGoalStatus, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { GOAL_CATEGORIES, GOAL_STATUSES } from "@/lib/clinician-dashboard-types";
import { CheckCircleIcon, PlusIcon } from "@/components/icons";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  met: "Met",
  "partially-met": "Partially Met",
  "not-met": "Not Met",
};

function SuggestedGoals({ category, bodyRegion, onUse }: { category: string; bodyRegion: string; onUse: (text: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGoalBankSuggestions(bodyRegion, category).then((result) => {
      if (!cancelled) setSuggestions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [category, bodyRegion]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="clindash-suggested-goals">
      <div className="clindash-suggested-goals-title">Suggested Goals</div>
      {suggestions.map((s, i) => (
        <div className="clindash-suggested-goal-row" key={i}>
          <span>{s}</span>
          <button type="button" className="btn btn-ghost clindash-suggested-goal-use" onClick={() => onUse(s)}>
            Use This Goal
          </button>
        </div>
      ))}
    </div>
  );
}

/** Between the patient header and the Pre-Visit Brief section on the active-patient
 *  workspace — patient.goals comes straight off getPatientDetail (no separate round trip),
 *  same "already loaded" pattern the rest of this workspace uses. */
export function PatientGoalsSection({ patient, onChanged }: { patient: PatientDetail; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] = useState<string>(GOAL_CATEGORIES[0]);
  const [goalText, setGoalText] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    if (!goalText.trim()) {
      setError("Goal text is required.");
      return;
    }
    startTransition(async () => {
      const result = await addPatientGoal(patient.id, goalText, category, timeframe);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Clears and stays open (rather than closing) so adding several goals in a row
      // doesn't need "Add Goal" clicked again between each one — timeframe/category are
      // left as-is since a run of goals often shares both.
      setGoalText("");
      setTimeframe("");
      onChanged();
    });
  };

  const handleStatusChange = (goalId: string, status: string) => {
    startTransition(async () => {
      await updateGoalStatus(goalId, status);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Patient Goals
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Add Goal
        </button>
      </div>

      {patient.goals.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No goals recorded yet.</p>
      ) : (
        <div>
          {patient.goals.map((g) => (
            <div className={`clindash-goal-row${g.status === "not-met" ? " clindash-goal-row--not-met" : ""}`} key={g.id}>
              <div className="clindash-goal-top">
                <span className="clindash-goal-text">
                  {g.status === "met" && <CheckCircleIcon size={13} className="clindash-goal-met-check" />} {g.goalText}
                </span>
                <div className="clindash-goal-meta">
                  {g.timeframe && <span className="clindash-goal-timeframe">{g.timeframe}</span>}
                  <select
                    className="clindash-goal-status-select"
                    value={g.status}
                    disabled={pending}
                    onChange={(e) => handleStatusChange(g.id, e.target.value)}
                  >
                    {GOAL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pg-category">Goal category</label>
            <select className="input" id="pg-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <SuggestedGoals category={category} bodyRegion={patient.bodyRegion} onUse={setGoalText} />

          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pg-text">Goal text</label>
            <textarea
              className="input"
              id="pg-text"
              rows={3}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="pg-timeframe">Timeframe</label>
            <input
              className="input"
              id="pg-timeframe"
              placeholder="e.g. 4 weeks"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending || !goalText.trim()} onClick={handleSave}>
              {pending ? "Saving…" : "Save Goal"}
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
