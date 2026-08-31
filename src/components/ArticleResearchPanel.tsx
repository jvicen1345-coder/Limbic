"use client";

import { useMemo, useState, useTransition } from "react";
import { checkGeneralizabilityAction } from "@/app/actions/generalizability";
import type { GeneralizabilityResult } from "@/lib/generalizability";
import { extractArticleVariablesAction } from "@/app/actions/article-variables";
import type { ArticleVariablesResult } from "@/lib/article-variables";
import { buildHistogramBins, type ArticleVariable } from "@/lib/histogram";
import { ZapIcon, ChevronRightIcon, ExternalLinkIcon } from "@/components/icons";

const CATEGORY_CLASS: Record<GeneralizabilityResult["category"], string> = {
  Poor: "wellness-badge-poor",
  Fair: "wellness-badge-fair",
  Good: "wellness-badge-good",
  Excellent: "wellness-badge-excellent",
};

const EMPTY_STUDY_MESSAGE = "Paste a PubMed link, DOI, or PMID to analyze.";
const ANALYZE_ERROR_MESSAGE = "Could not analyze this study. Try editing the study field and checking again.";

function formatVariableStat(v: ArticleVariable): string {
  const parts: string[] = [];
  if (v.n != null) parts.push(`n=${v.n}`);
  if (v.mean != null) parts.push(`mean ${v.mean}${v.sd != null ? ` ± ${v.sd}` : ""}${v.unit ? ` ${v.unit}` : ""}`);
  else if (v.median != null) parts.push(`median ${v.median}${v.unit ? ` ${v.unit}` : ""}`);
  if (v.min != null && v.max != null) parts.push(`range ${v.min}–${v.max}${v.unit ? ` ${v.unit}` : ""}`);
  return parts.join(" · ");
}

/** A pulsing placeholder shown in place of a tool's result area while its action is in
 *  flight — plain CSS animation (see .article-research-panel-loading-placeholder in
 *  globals.css), no library. */
function LoadingPlaceholder() {
  return <div className="article-research-panel-loading-placeholder" aria-hidden="true" />;
}

/** Collapsible "Analyze This Study" panel on the article detail page (see
 *  components/ArticleReadingPane.tsx, positioned between the read button section and the
 *  Topics pills) — reuses the exact same server actions, result types, and histogram-bin
 *  math as the standalone Generalizability Checker / Article Histogram Explorer on
 *  /pro/research-literacy (see components/pro/GeneralizabilityChecker.tsx,
 *  components/pro/ArticleHistogramExplorer.tsx, lib/histogram.ts) — no LLM-calling or
 *  scoring logic is duplicated here, only the two actions are called directly and their
 *  results rendered with the same shared .wellness-badge/.histogram-* classes those
 *  components already use. The surrounding shell (per-tool study fields, full-width 44px
 *  buttons, inline field validation) is its own layout, distinct from the standalone page's
 *  single-shared-field ArticleToolsPanel, since this is a compact inline panel rather than a
 *  dedicated page.
 *
 *  Both tools' Study fields are pre-filled independently from the same computed value (DOI
 *  preferred over sourceUrl) but are otherwise fully independent state — editing one never
 *  touches the other, matching the two tools' own independent studyInput on the standalone
 *  page. */
export function ArticleResearchPanel({
  articleDoi,
  articleSourceUrl,
}: {
  articleDoi: string | null;
  articleSourceUrl: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const studyDefault = useMemo(
    () => (articleDoi ? `https://doi.org/${articleDoi}` : (articleSourceUrl ?? "")),
    [articleDoi, articleSourceUrl]
  );

  // Tool 1 — Generalizability Checker
  const [genStudy, setGenStudy] = useState(studyDefault);
  const [genPatient, setGenPatient] = useState("");
  const [genResult, setGenResult] = useState<GeneralizabilityResult | null>(null);
  const [genFieldError, setGenFieldError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genPending, startGenTransition] = useTransition();

  // Tool 2 — Article Histogram Explorer
  const [histStudy, setHistStudy] = useState(studyDefault);
  const [histResult, setHistResult] = useState<ArticleVariablesResult | null>(null);
  const [histSelectedIndex, setHistSelectedIndex] = useState(0);
  const [histFieldError, setHistFieldError] = useState<string | null>(null);
  const [histError, setHistError] = useState<string | null>(null);
  const [histPending, startHistTransition] = useTransition();

  function handleCheckGeneralizability() {
    setGenFieldError(null);
    setGenError(null);
    if (!genStudy.trim()) {
      setGenFieldError(EMPTY_STUDY_MESSAGE);
      return;
    }
    if (!genPatient.trim()) {
      setGenFieldError("Describe your patient or population to check generalizability.");
      return;
    }
    startGenTransition(async () => {
      const res = await checkGeneralizabilityAction(genStudy, genPatient);
      if (res.ok) {
        setGenResult(res);
      } else {
        setGenResult(null);
        setGenError(ANALYZE_ERROR_MESSAGE);
      }
    });
  }

  function handleFindVariables() {
    setHistFieldError(null);
    setHistError(null);
    if (!histStudy.trim()) {
      setHistFieldError(EMPTY_STUDY_MESSAGE);
      return;
    }
    startHistTransition(async () => {
      const res = await extractArticleVariablesAction(histStudy);
      if (res.ok) {
        setHistResult(res);
        setHistSelectedIndex(0);
      } else {
        setHistResult(null);
        setHistError(ANALYZE_ERROR_MESSAGE);
      }
    });
  }

  const selectedVariable = histResult?.variables[histSelectedIndex] ?? null;
  const histBins = selectedVariable ? buildHistogramBins(selectedVariable) : null;

  return (
    <div className="article-research-panel">
      <button
        type="button"
        className="article-research-panel-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="article-research-panel-toggle-left">
          <ZapIcon size={16} className="article-research-panel-zap" />
          Analyze This Study with Limbic Agent
        </span>
        <ChevronRightIcon
          size={14}
          className="article-research-panel-chevron"
          style={{ transform: expanded ? "rotate(90deg)" : undefined }}
        />
      </button>

      {expanded && (
        <div className="article-research-panel-body">
          <div className="article-research-panel-section">
            <div className="article-research-panel-kicker">Generalizability Checker</div>
            <p className="article-research-panel-desc">
              Describe your patient below and check how well this study&rsquo;s findings likely transfer.
            </p>

            <div className="article-research-panel-field">
              <label htmlFor="research-panel-gen-study">Study</label>
              <textarea
                id="research-panel-gen-study"
                className="input"
                rows={2}
                value={genStudy}
                onChange={(e) => setGenStudy(e.target.value)}
              />
              {studyDefault && <p className="article-research-panel-prefill-note">Loaded from this article — edit if needed</p>}
            </div>

            <div className="article-research-panel-field">
              <label htmlFor="research-panel-gen-patient">Your patient or population</label>
              <textarea
                id="research-panel-gen-patient"
                className="input"
                rows={3}
                placeholder="e.g. 68-year-old with chronic low back pain, prior L4-L5 fusion"
                value={genPatient}
                onChange={(e) => setGenPatient(e.target.value)}
              />
            </div>

            {genFieldError && <p className="article-research-panel-field-error">{genFieldError}</p>}

            <button
              type="button"
              className="btn btn-primary article-research-panel-submit"
              disabled={genPending}
              onClick={handleCheckGeneralizability}
            >
              {genPending ? "Checking..." : "Check Generalizability"}
            </button>

            {genPending ? (
              <LoadingPlaceholder />
            ) : genError ? (
              <p className="article-research-panel-error">{genError}</p>
            ) : genResult ? (
              <div className="wellness-calc-result">
                {genResult.resolvedArticle && (
                  <a
                    href={genResult.resolvedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-accent-700)", marginBottom: 10 }}
                  >
                    Found: {genResult.resolvedArticle.title} — {genResult.resolvedArticle.journal}
                    <ExternalLinkIcon size={11} />
                  </a>
                )}

                <div className="wellness-calc-result-row">
                  <span className="wellness-calc-result-value">{genResult.score}/4</span>
                  <span className={`wellness-badge ${CATEGORY_CLASS[genResult.category]}`}>{genResult.category}</span>
                </div>

                <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)", margin: "10px 0 0", fontStyle: "italic" }}>
                  {genResult.studyPopulationSummary}
                </p>
                <p style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: "8px 0 0", lineHeight: 1.6 }}>
                  {genResult.rationale}
                </p>

                {genResult.matches.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-vitals-mobility)" }}>What matches</div>
                    <ul style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "4px 0 0", paddingLeft: 18 }}>
                      {genResult.matches.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {genResult.mismatches.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-danger)" }}>What doesn&rsquo;t</div>
                    <ul style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "4px 0 0", paddingLeft: 18 }}>
                      {genResult.mismatches.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="article-research-panel-disclaimer">Support judgment only — not a substitute for your clinical reasoning</p>
              </div>
            ) : null}
          </div>

          <hr className="article-research-panel-divider" />

          <div className="article-research-panel-section">
            <div className="article-research-panel-kicker">Article Histogram Explorer</div>
            <p className="article-research-panel-desc">
              Find the reported variables in this study and see their approximate distributions.
            </p>

            <div className="article-research-panel-field">
              <label htmlFor="research-panel-hist-study">Study</label>
              <textarea
                id="research-panel-hist-study"
                className="input"
                rows={2}
                value={histStudy}
                onChange={(e) => setHistStudy(e.target.value)}
              />
              {studyDefault && <p className="article-research-panel-prefill-note">Loaded from this article — edit if needed</p>}
            </div>

            {histFieldError && <p className="article-research-panel-field-error">{histFieldError}</p>}

            <button
              type="button"
              className="btn btn-primary article-research-panel-submit"
              disabled={histPending}
              onClick={handleFindVariables}
            >
              {histPending ? "Finding variables..." : "Find Variables"}
            </button>

            {histPending ? (
              <LoadingPlaceholder />
            ) : histError ? (
              <p className="article-research-panel-error">{histError}</p>
            ) : histResult ? (
              <div style={{ marginTop: 4 }}>
                <a
                  href={histResult.resolvedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-accent-700)", marginBottom: 12 }}
                >
                  {histResult.resolvedArticle.title} — {histResult.resolvedArticle.journal}
                  <ExternalLinkIcon size={11} />
                </a>

                {histResult.variables.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                    This abstract doesn&rsquo;t report enough detail (a mean/SD or median/range) on any variable to plot a
                    distribution.
                  </p>
                ) : (
                  <>
                    <div className="histogram-var-picker">
                      {histResult.variables.map((v, i) => (
                        <button
                          key={v.name + i}
                          type="button"
                          className={`histogram-var-pill${i === histSelectedIndex ? " histogram-var-pill-active" : ""}`}
                          onClick={() => setHistSelectedIndex(i)}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>

                    {selectedVariable && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginBottom: 8 }}>
                          {formatVariableStat(selectedVariable)}
                          {selectedVariable.shape !== "unknown" ? ` · ${selectedVariable.shape.replace("-", " ")}` : ""}
                        </div>

                        {histBins ? (
                          <div className="histogram-wrap">
                            <div className="histogram-bars">
                              {histBins.map((b, i) => (
                                <div key={i} className="histogram-bar-col">
                                  <div className="histogram-bar" style={{ height: `${b.heightPct}%` }} />
                                  <span className="histogram-bar-label">{b.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                            Not enough reported spread (an SD or a min/max range) to reconstruct a shape for this variable.
                          </p>
                        )}

                        <p className="histogram-caption">
                          Approximate distribution reconstructed from the article&rsquo;s reported summary statistics —
                          illustrative only, not the study&rsquo;s actual raw data.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
