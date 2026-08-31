"use client";

import { useEffect, useState, useTransition, type RefObject } from "react";
import { checkGeneralizabilityAction } from "@/app/actions/generalizability";
import { ExternalLinkIcon } from "@/components/icons";
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
 *  HrvCalculatorCard/Vo2MaxCalculatorCard already use, for the same visual vocabulary.
 *
 *  studyInput is lifted to the shared field ArticleToolsPanel renders once above both this
 *  and ArticleHistogramExplorer — a PubMed URL, bare PMID, DOI, or citation/title resolves
 *  server-side to a real fetched abstract (see lib/pubmed.ts resolvePubmedAbstract), which
 *  is what actually gets read; typing a plain population description into that same shared
 *  box still works exactly as before if nothing resolves (this tool, unlike the histogram
 *  one, has that free-text fallback). result.resolvedArticle and
 *  result.studyPopulationSummary are how the reader confirms what was actually found/read
 *  before trusting the score.
 *
 *  submitRef (optional) is how ArticleToolsPanel's shared "send" button/Enter key triggers
 *  this tool's own check without lifting its fetch state up — kept pointed at the latest
 *  handleCheck on every render via a ref-only effect (no setState, so it's not the "sync
 *  state from a prop" pattern the other calculators' profile pre-fill avoids), and
 *  handleCheck already no-ops via canCheck when the population field isn't filled in yet,
 *  so the panel can call it unconditionally. */
export function GeneralizabilityChecker({ studyInput, submitRef }: { studyInput: string; submitRef?: RefObject<() => void> }) {
  const [targetPopulation, setTargetPopulation] = useState("");
  const [result, setResult] = useState<GeneralizabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canCheck = studyInput.trim().length > 0 && targetPopulation.trim().length > 0 && !pending;

  const handleCheck = () => {
    if (!canCheck) return;
    setError(null);
    startTransition(async () => {
      const res = await checkGeneralizabilityAction(studyInput, targetPopulation);
      if (res.ok) {
        setResult(res);
      } else {
        setResult(null);
        setError(res.message);
      }
    });
  };

  useEffect(() => {
    if (submitRef) submitRef.current = handleCheck;
  });

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Generalizability Checker</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Reads the study pasted into the Study field above (or just its population, if that&rsquo;s what you typed
        there instead of a link). Describe the population you&rsquo;re comparing it to below and get a scored read on
        how well the findings likely transfer.
      </p>

      <div style={{ marginTop: 12 }}>
        <div className="field">
          <label htmlFor="gen-target-population">Your patient or population</label>
          <textarea
            className="input"
            id="gen-target-population"
            rows={3}
            placeholder="e.g. 68-year-old with chronic (2+ years) low back pain, prior L4-L5 fusion, several comorbidities"
            value={targetPopulation}
            onChange={(e) => setTargetPopulation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCheck();
              }
            }}
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
          {result.resolvedArticle && (
            <a
              href={result.resolvedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-accent-700)", marginBottom: 10 }}
            >
              Found: {result.resolvedArticle.title} — {result.resolvedArticle.journal}
              <ExternalLinkIcon size={11} />
            </a>
          )}

          <div className="wellness-calc-result-row">
            <span className="wellness-calc-result-value">{result.score}/4</span>
            <span className={`wellness-badge ${CATEGORY_CLASS[result.category]}`}>{result.category}</span>
          </div>

          <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)", margin: "10px 0 0", fontStyle: "italic" }}>
            {result.studyPopulationSummary}
          </p>
          <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "8px 0 0", lineHeight: 1.6 }}>{result.rationale}</p>

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

      <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-600)", marginTop: 14 }}>
        A support judgment based only on the PubMed abstract or description given, not a substitute for reading the
        actual study and applying your own clinical reasoning.
      </p>
    </div>
  );
}
