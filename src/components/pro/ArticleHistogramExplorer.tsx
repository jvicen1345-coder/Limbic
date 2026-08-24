"use client";

import { useState, useTransition } from "react";
import { extractArticleVariablesAction } from "@/app/actions/article-variables";
import { ExternalLinkIcon } from "@/components/icons";
import { buildHistogramBins, type ArticleVariable } from "@/lib/histogram";
import type { ArticleVariablesResult, ArticleVariablesError } from "@/lib/article-variables";

function formatStat(v: ArticleVariable): string {
  const parts: string[] = [];
  if (v.n != null) parts.push(`n=${v.n}`);
  if (v.mean != null) parts.push(`mean ${v.mean}${v.sd != null ? ` ± ${v.sd}` : ""}${v.unit ? ` ${v.unit}` : ""}`);
  else if (v.median != null) parts.push(`median ${v.median}${v.unit ? ` ${v.unit}` : ""}`);
  if (v.min != null && v.max != null) parts.push(`range ${v.min}–${v.max}${v.unit ? ` ${v.unit}` : ""}`);
  return parts.join(" · ");
}

/** Lets a reader pick one of a resolved article's reported variables and see an
 *  approximate distribution for it — see lib/article-variables.ts for the extraction step
 *  (a real PubMed abstract required, model only extracts real reported numbers) and
 *  lib/histogram.ts for the deterministic, non-LLM bin math that turns those numbers into
 *  bars. Same resolve-a-real-article-first shape as GeneralizabilityChecker.tsx, but this
 *  tool has no free-text fallback: a plotted histogram implies real numbers behind it. */
export function ArticleHistogramExplorer() {
  const [studyInput, setStudyInput] = useState("");
  const [result, setResult] = useState<ArticleVariablesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  const canFind = studyInput.trim().length > 0 && !pending;

  const handleFind = () => {
    if (!canFind) return;
    setError(null);
    startTransition(async () => {
      const res: ArticleVariablesResult | ArticleVariablesError = await extractArticleVariablesAction(studyInput);
      if (res.ok) {
        setResult(res);
        setSelectedIndex(0);
      } else {
        setResult(null);
        setError(res.message);
      }
    });
  };

  const selectedVariable = result?.variables[selectedIndex] ?? null;
  const bins = selectedVariable ? buildHistogramBins(selectedVariable) : null;

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Article Histogram Explorer</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Paste a PubMed link, PMID, DOI, or citation and pick one of its reported variables to see an
        approximate distribution — reconstructed from the article&rsquo;s own summary statistics, the same
        shape-first habit the guide below teaches.
      </p>

      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="hist-study-input">Study — link, PMID, DOI, or citation</label>
        <textarea
          className="input"
          id="hist-study-input"
          rows={2}
          placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov/34567890/"
          value={studyInput}
          onChange={(e) => setStudyInput(e.target.value)}
        />
      </div>

      <button type="button" className="btn btn-primary" disabled={!canFind} onClick={handleFind} style={{ marginTop: 12 }}>
        {pending ? "Reading article…" : "Find variables"}
      </button>

      {error && <p style={{ fontSize: 13, color: "var(--color-danger)", marginTop: 12 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <a
            href={result.resolvedArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--color-accent-700)", marginBottom: 12 }}
          >
            {result.resolvedArticle.title} — {result.resolvedArticle.journal}
            <ExternalLinkIcon size={11} />
          </a>

          {result.variables.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              This abstract doesn&rsquo;t report enough detail (a mean/SD or median/range) on any variable to plot a
              distribution.
            </p>
          ) : (
            <>
              <div className="histogram-var-picker">
                {result.variables.map((v, i) => (
                  <button
                    key={v.name + i}
                    type="button"
                    className={`histogram-var-pill${i === selectedIndex ? " histogram-var-pill-active" : ""}`}
                    onClick={() => setSelectedIndex(i)}
                  >
                    {v.name}
                  </button>
                ))}
              </div>

              {selectedVariable && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginBottom: 8 }}>
                    {formatStat(selectedVariable)}
                    {selectedVariable.shape !== "unknown" ? ` · ${selectedVariable.shape.replace("-", " ")}` : ""}
                  </div>

                  {bins ? (
                    <div className="histogram-wrap">
                      <div className="histogram-bars">
                        {bins.map((b, i) => (
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
      )}
    </div>
  );
}
