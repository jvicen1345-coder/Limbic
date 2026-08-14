"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";

/** Fully functional — the patient names up to 3 of their own activities, each rated 0-10,
 *  averaged in real time. */
export function PsfsCalculator() {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState([
    { name: "", score: 5 },
    { name: "", score: 5 },
    { name: "", score: 5 },
  ]);

  const answered = activities.filter((a) => a.name.trim().length > 0);
  const average = answered.length > 0 ? answered.reduce((sum, a) => sum + a.score, 0) / answered.length : null;

  return (
    <>
      <CalcCardShell
        name="PSFS"
        fullName="Patient Specific Functional Scale"
        measures="Patient-selected activities rated for current difficulty, tracked over time."
        population="Any condition, any body region"
        itemCount="3 activities"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="PSFS, Patient Specific Functional Scale" onClose={() => setOpen(false)}>
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 0, marginBottom: 12 }}>
          Ask the patient to identify up to 3 important activities they are unable to do or are having difficulty
          with. Rate each 0 (unable to perform) to 10 (able to perform at prior level).
        </p>
        {activities.map((activity, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder={`Activity ${i + 1}`}
              value={activity.name}
              onChange={(e) => {
                const next = [...activities];
                next[i] = { ...next[i], name: e.target.value };
                setActivities(next);
              }}
            />
            <select
              className="input"
              style={{ width: 100 }}
              value={activity.score}
              onChange={(e) => {
                const next = [...activities];
                next[i] = { ...next[i], score: Number(e.target.value) };
                setActivities(next);
              }}
            >
              {Array.from({ length: 11 }, (_, s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="pro-calc-result">
          <div className="pro-calc-result-value">{average != null ? average.toFixed(1) : "—"} / 10</div>
          <div className="pro-calc-result-label">
            Average across {answered.length} named {answered.length === 1 ? "activity" : "activities"}. MCID: 2
            points per activity.
          </div>
        </div>
      </CalcModal>
    </>
  );
}
