"use client";

import { useState } from "react";
import { CalcModal, CalcCardShell } from "./CalcModal";
import { CalcTimer } from "./CalcTimer";

const SECONDARY_TASKS = ["Serial subtraction (counting backward by 3s)", "Naming animals", "Reciting months backward", "Carrying a full cup of water"];

/** Functional timing/comparison math, timed either by hand or with the two built-in
 *  stopwatches (see CalcTimer); the clinical interpretation of the cost of dual-tasking is
 *  a TODO placeholder (see note below) pending validated cutoffs. */
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
      <CalcCardShell
        name="TUG Cognitive"
        fullName="Timed Up and Go, Cognitive Dual Task"
        measures="Fall risk under divided attention, comparing standard TUG to a dual-task TUG."
        population="Older adults, neurological/cognitive-impairment risk screening"
        itemCount="2 items"
        onOpen={() => setOpen(true)}
      />
      <CalcModal open={open} title="TUG, Cognitive Dual Task" onClose={() => setOpen(false)}>
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
        <p style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 10 }}>
          TODO: clinical interpretation of dual-task cost (validated cutoffs for elevated fall risk) is a placeholder,
          replace before launch.
        </p>
      </CalcModal>
    </>
  );
}
