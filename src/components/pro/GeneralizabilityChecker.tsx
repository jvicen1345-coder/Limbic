"use client";

import { useState, useTransition } from "react";
import { checkGeneralizabilityAction } from "@/app/actions/generalizability";
import type { GeneralizabilityResult } from "@/lib/generalizability";

const CATEGORY_CLASS: Record<GeneralizabilityResult["category"], string> = {
  Poor: "wellness-badge-poor",
  Fair: "wellness-badge-fair",
  Good: "wellness-badge-good",
  Excellent: "wellness-badge-excellent",
};

/** A structured, single-shot judgment call to Claude (see lib/generalizability.ts,
 *  app/actions/generalizability.ts) — same "describe two things, get a scored comparison
 *  back" shape as this app's other calculators, just backed by an LLM call instead of a
 *  formula, since "does this population match" isn't reducible to arithmetic the way
 *  BMI/VO2 Max are. Reuses the exact Poor/Fair/Good/Excellent badge styling
 *  HrvCalculatorCard/Vo2MaxCalculatorCard already use, for the same visual vocabulary. */
export function GeneralizabilityChecker() {
  const [studyPopulation, setStudyPopulation] = useState("");
  const [targetPopulation, setTargetPopulation] = useState("");
  const [result, setResult] = useState<GeneralizabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canCheck = studyPopulation.trim().length > 0 && targetPopulation.trim().length > 0 && !pending;

  const handleCheck = () => {
    if (!canCheck) return;
    setError(null);
    startTransition(async () => {
      const res = await checkGeneralizabilityAction(studyPopulation, targetPopulation);
      if (res.ok) {
        setResult(res);
      } else {
        setResult(null);
        setError(res.message);
      }
    });
  };

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Generalizability Checker</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Describe a study&rsquo;s population and the population you&rsquo;re comparing it to — age range, diagnosis and
        severity, comorbidities, setting, anything relevant — and get a scored read on how well the findings likely
        transfer.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        <div className="field">
          <label htmlFor="gen-study-population">Study&rsquo;s population</label>
          <textarea
            className="input"
            id="gen-study-population"
            rows={3}
            placeholder="e.g. 45 adults aged 20-35 with acute (under 6 weeks) low back pain, no prior surgery, recruited from one outpatient clinic"
            value={studyPopulation}
            onChange={(e) => setStudyPopulation(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="gen-target-population">Your patient or population</label>
          <textarea
            className="input"
            id="gen-target-population"
            rows={3}
            placeholder="e.g. 68-year-old with chronic (2+ years) low back pain, prior L4-L5 fusion, several comorbidities"
            value={targetPopulation}
            onChange={(e) => setTargetPopulation(e.target.value)}
          />
        </div>
      </div>

      <button type="button" className="btn btn-primary" disabled={!canCheck} onClick={handleCheck} style={{ marginTop: 12 }}>
        {pending ? "Checking…" : "Check generalizability"}
      </button>

      {error && (
        <p style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 12 }}>{error}</p>
      )}

      {result && (
        <div className="wellness-calc-result">
          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.score}/4</span>
            <span className={`wellness-badge ${CATEGORY_CLASS[result.category]}`}>{result.category}</span>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "10px 0 0", lineHeight: 1.6 }}>{result.rationale}</p>

          {result.matches.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-vitals-mobility)" }}>What matches</div>
              <ul style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "4px 0 0", paddingLeft: 18 }}>
                {result.matches.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {result.mismatches.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-danger)" }}>What doesn&rsquo;t</div>
              <ul style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "4px 0 0", paddingLeft: 18 }}>
                {result.mismatches.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--color-neutral-600)", marginTop: 14 }}>
        A support judgment based only on what you describe here, not a substitute for reading the actual study and
        applying your own clinical reasoning.
      </p>
    </div>
  );
}
