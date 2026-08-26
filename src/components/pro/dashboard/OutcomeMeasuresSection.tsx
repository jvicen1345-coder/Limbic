"use client";

import { Fragment, useState, useTransition } from "react";
import { addOutcomeEntry, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { OUTCOME_MEASURES } from "@/lib/clinician-dashboard-types";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import type { OutcomeMeasureEntry } from "@/generated/prisma/client";

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

export function OutcomeMeasuresSection({ patient, onChanged }: { patient: PatientDetail; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    <div className="clindash-section">
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
                {OUTCOME_MEASURES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
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
