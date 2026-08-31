"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { scoreArticleGeneralizability } from "@/app/actions/research-literacy";
import type { GeneralizabilityScore } from "@/lib/generalizability-score";
import { extractArticleVariablesAction } from "@/app/actions/article-variables";
import type { ArticleVariablesResult } from "@/lib/article-variables";
import { buildHistogramBins, type ArticleVariable } from "@/lib/histogram";
import { ZapIcon, ChevronRightIcon, ExternalLinkIcon } from "@/components/icons";

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
 *  Topics pills). Two tools, which behave deliberately differently:
 *
 *  1. The generalizability score runs *automatically* the first time the panel is expanded —
 *     no field, no button, no patient description. It scores this article against typical PT
 *     practice across six fixed domains (see lib/generalizability-score.ts) and is cached
 *     forever per article, so the second reader to open the same article sees the score
 *     instantly with a "Cached" pill and no Anthropic call. It is a different tool from the
 *     Generalizability Checker on /pro/research-literacy — that one compares a study against
 *     a patient the reader describes, and is completely untouched by this panel.
 *  2. The Article Histogram Explorer is unchanged: still an on-demand tool with its own
 *     pre-filled Study field (DOI preferred over sourceUrl) and its own Find Variables
 *     button, reusing the same server action, result type and histogram-bin math as the
 *     standalone components/pro/ArticleHistogramExplorer.tsx. */
export function ArticleResearchPanel({
  articleId,
  articleDoi,
  articleSourceUrl,
  articleTitle,
  articleSummary,
}: {
  articleId: string;
  articleDoi: string | null;
  articleSourceUrl: string | null;
  articleTitle: string;
  articleSummary: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const studyDefault = useMemo(
    () => (articleDoi ? `https://doi.org/${articleDoi}` : (articleSourceUrl ?? "")),
    [articleDoi, articleSourceUrl]
  );

  // Tool 1 — automatic generalizability score
  const [scoreResult, setScoreResult] = useState<GeneralizabilityScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Tool 2 — Article Histogram Explorer
  const [histStudy, setHistStudy] = useState(studyDefault);
  const [histResult, setHistResult] = useState<ArticleVariablesResult | null>(null);
  const [histSelectedIndex, setHistSelectedIndex] = useState(0);
  const [histFieldError, setHistFieldError] = useState<string | null>(null);
  const [histError, setHistError] = useState<string | null>(null);
  const [histPending, startHistTransition] = useTransition();

  const runScore = useCallback(async () => {
    setScoreLoading(true);
    setScoreError(null);

    const res = await scoreArticleGeneralizability(articleId, articleDoi, articleSourceUrl, articleTitle, articleSummary);

    if (res.error) {
      setScoreError(res.error);
    } else if (res.result) {
      setScoreResult(res.result);
    }

    setScoreLoading(false);
  }, [articleId, articleDoi, articleSourceUrl, articleTitle, articleSummary]);

  /** Expanding the panel is what triggers the score — there's no button to press. Scored at
   *  most once per mount: an already-scored article (or one still in flight) is never
   *  re-requested when the reader collapses and re-opens the panel. A previous *failure* is
   *  not retried automatically either; the error state offers a Try again link instead, so a
   *  study whose abstract genuinely can't be scored doesn't re-call on every open. */
  function handleExpand() {
    setExpanded(true);
    if (scoreResult || scoreLoading || scoreError) return;
    void runScore();
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
        onClick={() => (expanded ? setExpanded(false) : handleExpand())}
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
            <div className="gen-score-header">
              <div className="article-research-panel-kicker">Generalizability Score</div>
              {scoreResult?.cached && <span className="gen-score-cached-pill">Cached</span>}
            </div>

            {scoreLoading ? (
              <div className="gen-score-loading">
                <div className="gen-score-shimmer-bar" aria-hidden="true" />
                <p className="gen-score-loading-text">Analyzing study population, setting, and design...</p>
              </div>
            ) : scoreError ? (
              <div className="gen-score-error-wrap">
                <p className="gen-score-error">{scoreError}</p>
                <button type="button" className="gen-score-link" onClick={() => void runScore()}>
                  Try again
                </button>
              </div>
            ) : scoreResult ? (
              <div className="gen-score-result">
                <div className="gen-score-headline">
                  <div className="gen-score-number" style={{ color: scoreResult.color }}>
                    {scoreResult.overallScore.toFixed(1)}
                  </div>
                  <div className="gen-score-label" style={{ color: scoreResult.color }}>
                    {scoreResult.label}
                  </div>
                </div>

                <div className="gen-score-scale">
                  <div
                    className="gen-score-scale-fill"
                    style={{ width: `${scoreResult.overallScore * 10}%`, background: scoreResult.color }}
                  />
                  <span
                    className="gen-score-scale-dot"
                    style={{ left: `${scoreResult.overallScore * 10}%`, borderColor: scoreResult.color }}
                    aria-hidden="true"
                  />
                </div>
                <div className="gen-score-scale-labels">
                  <span>Less generalizable</span>
                  <span>More generalizable</span>
                </div>

                <p className="gen-score-summary">{scoreResult.summary}</p>

                {breakdownOpen && (
                  <>
                    <div className="gen-score-factors">
                      {scoreResult.factors.map((f) => (
                        <div key={f.name} className="gen-score-factor">
                          <div className="gen-score-factor-top">
                            <span className="gen-score-factor-name">{f.name}</span>
                            <span className="gen-score-factor-bar">
                              <span
                                className="gen-score-factor-bar-fill"
                                style={{ width: `${f.score * 10}%`, background: scoreResult.color }}
                              />
                            </span>
                            <span className="gen-score-factor-value">{f.score}</span>
                          </div>
                          <p className="gen-score-factor-finding">{f.finding}</p>
                          <p className="gen-score-factor-impact">{f.impact}</p>
                        </div>
                      ))}
                    </div>

                    <div className="gen-score-limitations">
                      <div className="article-research-panel-kicker">Generalizability limitations</div>
                      <ul className="gen-score-limitation-list">
                        {scoreResult.limitations.map((l) => (
                          <li key={l}>
                            <span className="gen-score-limitation-dot" aria-hidden="true" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  className="gen-score-link gen-score-breakdown-toggle"
                  onClick={() => setBreakdownOpen((v) => !v)}
                  aria-expanded={breakdownOpen}
                >
                  {breakdownOpen ? "Hide breakdown" : "Show breakdown"}
                </button>

                <p className="article-research-panel-disclaimer">
                  Scored from the available abstract. Read the full methods before applying to patient care.
                </p>
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
