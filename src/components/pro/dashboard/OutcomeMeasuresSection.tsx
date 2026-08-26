"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import type { MutableRefObject } from "react";

export interface OutcomeMeasuresSectionHandle {
  /** Opens the Add Score form and scrolls it into view — called imperatively from the
   *  workspace milestone banner's "Record Outcomes Now" button while this section is
   *  already mounted (see PatientWorkspace.tsx), rather than through a prop-diffing signal
   *  (this section persists across re-renders for the same patient, so there's no clean
   *  "did this specific click already fire" prop shape to diff against). */
  openAndScroll: () => void;
  /** Same as openAndScroll, plus pre-fills the measure field — used by the Condition
   *  Intelligence card's "Recommended Measures" pills (see ConditionIntelligenceCard.tsx).
   *  Falls back to the "Other" option with the name typed into the custom-measure field
   *  when it isn't one of OUTCOME_MEASURES' fixed choices. */
  prefillMeasure: (measureName: string) => void;
}
import { addOutcomeEntry, type OutcomeBenchmark, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { getCalculatorProfilesForCurrentUser } from "@/app/actions/calculator-profiles";
import { OUTCOME_MEASURES } from "@/lib/clinician-dashboard-types";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import type { OutcomeMeasureEntry } from "@/generated/prisma/client";

function benchmarkVerdict(history: OutcomeMeasureEntry[], benchmark: OutcomeBenchmark): { label: string; className: string } | null {
  if (history.length < 2) return null;
  const first = history[0];
  const latest = history[history.length - 1];
  const rawChange = latest.score - first.score;
  const improvement = benchmark.higherIsBetter ? rawChange : -rawChange;
  if (improvement <= 0) return { label: "Score has declined", className: "clindash-benchmark-pill--bad" };
  if (improvement >= benchmark.mcid) return { label: "Meaningful improvement achieved", className: "clindash-benchmark-pill--good" };
  return { label: "Progress below MCID threshold", className: "clindash-benchmark-pill--warn" };
}

function trendArrow(latest: OutcomeMeasureEntry, previous: OutcomeMeasureEntry | undefined) {
  if (!previous) return null;
  const latestPct = latest.score / latest.maxScore;
  const prevPct = previous.score / previous.maxScore;
  if (latestPct > prevPct) return <span className="clindash-trend-arrow clindash-trend-arrow--up">&#9650;</span>;
  if (latestPct < prevPct) return <span className="clindash-trend-arrow clindash-trend-arrow--down">&#9660;</span>;
  return <span className="clindash-trend-arrow clindash-trend-arrow--flat">&mdash;</span>;
}

function TrendChart({ history }: { history: OutcomeMeasureEntry[] }) {
  if (history.length < 2) return <p className="clindash-trend-need-more">Log at least 2 scores to see a trend line.</p>;

  const points = history.map((h, i) => ({
    x: (i / (history.length - 1)) * 100,
    y: (h.score / h.maxScore) * 100,
    entry: h,
  }));
  const polyline = points.map((p) => `${p.x},${100 - p.y}`).join(" ");

  return (
    <div className="clindash-trend-chart-wrap">
      <div className="clindash-trend-chart">
        <svg className="clindash-trend-chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={polyline} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {points.map((p, i) => (
          <span
            key={i}
            className="clindash-trend-point"
            style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
            title={`${p.entry.score}/${p.entry.maxScore} on ${new Date(p.entry.recordedAt).toLocaleDateString()}`}
          />
        ))}
      </div>
    </div>
  );
}

const EMPTY_FORM = { measureName: OUTCOME_MEASURES[0] as string, customMeasure: "", score: "", maxScore: "", notes: "" };

export function OutcomeMeasuresSection({
  patient,
  onChanged,
  initiallyOpen = false,
  actionsRef,
}: {
  patient: PatientDetail;
  onChanged: () => void;
  /** True when this mount was triggered by a "jump straight to recording an outcome"
   *  action (Morning Rounds' "Record Outcomes" reminder row) — this section only exists
   *  in the tree once a patient is selected (see PatientWorkspace.tsx), so a plain
   *  mount-time initializer + a one-time mount effect covers that case cleanly, no
   *  prop-diffing needed. */
  initiallyOpen?: boolean;
  /** Lets a sibling (the workspace's milestone banner, still mounted for the *same*
   *  already-selected patient) trigger openAndScroll imperatively — same lightweight
   *  ref-registration pattern as ArticleToolsPanel's submitRef in
   *  GeneralizabilityChecker.tsx. The registration effect below only ever assigns to a
   *  ref, never calls setState, so it isn't subject to this repo's
   *  react-hooks/set-state-in-effect rule. */
  actionsRef?: MutableRefObject<OutcomeMeasuresSectionHandle | null>;
}) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(initiallyOpen);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Measure names pulled from the clinician's own saved Calculators tests (see
  // /pro/calculators) — testKey/testName are per-CalculatorResult, and CalculatorProfile
  // has no patient link (it's a de-identified scoring tool), so this is a user-scoped "which
  // tests have I actually run" list added to the picker below, not a per-patient query.
  const [savedTestNames, setSavedTestNames] = useState<string[]>([]);

  useEffect(() => {
    if (initiallyOpen) {
      document.getElementById("clindash-outcomes-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Mount-only — initiallyOpen is only meant to matter for the render this component
    // was created with, not for later prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCalculatorProfilesForCurrentUser().then((profiles) => {
      if (cancelled) return;
      const names = new Set<string>();
      for (const profile of profiles) {
        for (const result of profile.results) names.add(result.testName);
      }
      setSavedTestNames(Array.from(names));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const standardMeasures = (OUTCOME_MEASURES as readonly string[]).filter((m) => m !== "Other");
  const testedMeasures = savedTestNames.filter((name) => !standardMeasures.includes(name));
  const knownMeasures = [...standardMeasures, ...testedMeasures];

  useEffect(() => {
    if (!actionsRef) return;
    const openAndScroll = () => {
      setFormOpen(true);
      document.getElementById("clindash-outcomes-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    actionsRef.current = {
      openAndScroll,
      prefillMeasure: (measureName) => {
        const isKnown = knownMeasures.includes(measureName);
        setForm((f) => ({
          ...f,
          measureName: isKnown ? measureName : "Other",
          customMeasure: isKnown ? f.customMeasure : measureName,
        }));
        openAndScroll();
      },
    };
    return () => {
      actionsRef.current = null;
    };
  });

  const measureNames = Array.from(new Set(patient.outcomes.map((o) => o.measureName)));
  const byMeasure = new Map(measureNames.map((name) => [name, patient.outcomes.filter((o) => o.measureName === name)]));

  const handleAdd = () => {
    setError(null);
    const measureName = form.measureName === "Other" ? form.customMeasure.trim() : form.measureName;
    const score = Number(form.score);
    const maxScore = Number(form.maxScore);
    if (!measureName) {
      setError("Enter a measure name.");
      return;
    }
    startTransition(async () => {
      const result = await addOutcomeEntry(patient.id, { measureName, score, maxScore, notes: form.notes || undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(EMPTY_FORM);
      setFormOpen(false);
      onChanged();
    });
  };

  return (
    <div className="clindash-section" id="clindash-outcomes-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Outcome Measures
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Add Score
        </button>
      </div>

      {measureNames.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No outcome measures recorded yet.</p>
      ) : (
        <table className="clindash-outcome-table">
          <thead>
            <tr>
              <th>Measure</th>
              <th>Latest</th>
              <th>Trend</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {measureNames.map((name) => {
              const history = byMeasure.get(name)!;
              const latest = history[history.length - 1];
              const previous = history[history.length - 2];
              const isExpanded = expanded === name;
              return (
                <Fragment key={name}>
                  <tr className="clindash-outcome-row" onClick={() => setExpanded(isExpanded ? null : name)}>
                    <td style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <ChevronRightIcon size={12} style={{ transform: isExpanded ? "rotate(90deg)" : undefined }} />
                      {name}
                    </td>
                    <td>
                      {latest.score}/{latest.maxScore}
                    </td>
                    <td>{trendArrow(latest, previous)}</td>
                    <td>{new Date(latest.recordedAt).toLocaleDateString()}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={4}>
                        <div className="clindash-outcome-history">
                          {history
                            .slice()
                            .reverse()
                            .map((h) => (
                              <div className="clindash-outcome-history-row" key={h.id}>
                                <span>{new Date(h.recordedAt).toLocaleDateString()}</span>
                                <span>
                                  {h.score}/{h.maxScore}
                                  {h.notes ? ` — ${h.notes}` : ""}
                                </span>
                              </div>
                            ))}
                        </div>
                        {(() => {
                          const benchmark = patient.benchmarks[name];
                          if (!benchmark) return null;
                          const verdict = benchmarkVerdict(history, benchmark);
                          return (
                            <div>
                              <p className="clindash-benchmark-line">MCID for this measure is {benchmark.mcid} points</p>
                              {verdict && <span className={`clindash-benchmark-pill ${verdict.className}`}>{verdict.label}</span>}
                            </div>
                          );
                        })()}
                        <TrendChart history={history} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="clindash-inline-form-row">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="om-measure">Measure</label>
              <select
                className="input"
                id="om-measure"
                value={form.measureName}
                onChange={(e) => setForm((f) => ({ ...f, measureName: e.target.value }))}
              >
                <optgroup label="Standard measures">
                  {standardMeasures.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </optgroup>
                {testedMeasures.length > 0 && (
                  <optgroup label="From your saved tests">
                    {testedMeasures.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="Other">Other</option>
              </select>
            </div>
            {form.measureName === "Other" && (
              <div className="field" style={{ margin: 0 }}>
                <label htmlFor="om-custom">Measure name</label>
                <input
                  className="input"
                  id="om-custom"
                  value={form.customMeasure}
                  onChange={(e) => setForm((f) => ({ ...f, customMeasure: e.target.value }))}
                />
              </div>
            )}
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="om-score">Score</label>
              <input
                className="input"
                id="om-score"
                type="number"
                value={form.score}
                onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="om-max">Max score</label>
              <input
                className="input"
                id="om-max"
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
              />
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="om-notes">Notes (optional)</label>
            <input
              className="input"
              id="om-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending || !form.score || !form.maxScore} onClick={handleAdd}>
              {pending ? "Saving…" : "Save Score"}
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
