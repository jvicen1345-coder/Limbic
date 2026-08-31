"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

const SECONDARY_TASKS = ["Serial subtraction (counting backward by 3s)", "Naming animals", "Reciting months backward", "Carrying a full cup of water"];

/** Card copy for this measure, lifted out of the JSX so the Clinical Reference
 *  search box can match against it (see lib/reference-search.ts) without the text
 *  being written twice. Spread straight into CalcCardShell below. */
export const TUG_COGNITIVE_MEASURE = {
  name: "TUG Cognitive",
  fullName: "Timed Up and Go, Cognitive Dual Task",
  measures: "Fall risk under divided attention, comparing standard TUG to a dual-task TUG.",
  population: "Older adults, neurological/cognitive-impairment risk screening",
  itemCount: "2 items",
  administration: "Clinician-Administered",
} as const;

/** Fully functional — timing/comparison math (by hand or the two built-in stopwatches, see
 *  CalcTimer) and the clinical interpretation guidance below are both live. Unlike the
 *  standard TUG, the dual-task-cost literature hasn't converged on one universally
 *  validated cutoff, so the guidance is framed as a general trend rather than a single
 *  hard number, see the note below. */
export function TugCognitiveCalculator() {
  const [open, setOpen] = useState(false);
  const [standardSeconds, setStandardSeconds] = useState("");
  const [cognitiveSeconds, setCognitiveSeconds] = useState("");
  const [task, setTask] = useState(SECONDARY_TASKS[0]);

  const std = Number(standardSeconds);
  const cog = Number(cognitiveSeconds);
  const canCompare = standardSeconds !== "" && cognitiveSeconds !== "" && Number.isFinite(std) && Number.isFinite(cog);
  const diff = canCompare ? Math.round((cog - std) * 10) / 10 : null;
  const percentCost = canCompare && std > 0 ? Math.round(((cog - std) / std) * 100) : null;

  return (
    <>
      <CalcCardShell {...TUG_COGNITIVE_MEASURE} onOpen={() => setOpen(true)} />
      <CalcModal
        open={open}
        title="TUG, Cognitive Dual Task"
        onClose={() => setOpen(false)}
        testKey="tug-cognitive"
        testName="TUG Cognitive"
        result={
          diff != null
            ? { value: `+${diff}s${percentCost != null ? ` (${percentCost}%)` : ""}`, label: "Dual-task cost vs standard TUG" }
            : null
        }
      >
        <div className="field">
          <label htmlFor="tugc-task">Secondary task</label>
          <select id="tugc-task" className="input" value={task} onChange={(e) => setTask(e.target.value)}>
            {SECONDARY_TASKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="pro-grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="tugc-standard">Standard TUG, seconds</label>
            <CalcTimer mode="stopwatch" label="Standard trial" onUseTime={(s) => setStandardSeconds(String(s))} />
            <input
              id="tugc-standard"
              className="input"
              type="number"
              min={0}
              step={0.1}
              value={standardSeconds}
              onChange={(e) => setStandardSeconds(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tugc-cognitive">Dual-task TUG, seconds</label>
            <CalcTimer mode="stopwatch" label="Dual-task trial" onUseTime={(s) => setCognitiveSeconds(String(s))} />
            <input
              id="tugc-cognitive"
              className="input"
              type="number"
              min={0}
              step={0.1}
              value={cognitiveSeconds}
              onChange={(e) => setCognitiveSeconds(e.target.value)}
            />
          </div>
        </div>
        {diff != null && (
          <div className="pro-calc-result" style={{ marginTop: 14 }}>
            <div className="pro-calc-result-value">
              +{diff}s{percentCost != null ? ` (${percentCost}%)` : ""}
            </div>
            <div className="pro-calc-result-label">Dual-task cost vs standard TUG</div>
          </div>
        )}
        <p style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)", marginTop: 10 }}>
          Unlike the standard TUG, the dual-task-cost literature hasn&rsquo;t converged on a single universally validated
          cutoff. As a general trend, a dual-task cost above roughly 20% is often considered clinically meaningful,
          and an absolute dual-task TUG time above ~15 seconds is more consistently associated with elevated fall
          risk across studies than the percentage cost alone. Use alongside the standard TUG norms and the rest of
          the fall risk picture, not as a standalone cutoff. Test-retest reliability studies report a minimal
          detectable change of roughly 2.6-2.8 seconds for total dual-task time in older adults.
        </p>
      </CalcModal>
    </>
  );
}
