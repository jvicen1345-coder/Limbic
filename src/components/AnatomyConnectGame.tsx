"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { submitAnatomyConnectAttempt } from "@/app/actions/anatomy-connect";
import { ShareButton } from "@/components/ShareButton";
import type { AnatomyConnectResultView, AnatomyConnectStats } from "@/app/actions/anatomy-connect";

const ROW_COLOR_COUNT = 4;

/** One muscle's in-progress connection — indices into the shuffled nerves/actions/regions
 *  columns (not the label strings themselves), since several puzzles reuse the same nerve
 *  or action text across more than one row (e.g. two muscles both innervated by "Tibial
 *  S1-S2") — indexing by position lets each occurrence be claimed independently instead of
 *  one claiming the text and blocking the other's identical, equally correct choice. */
interface Connection {
  nerveIdx?: number;
  actionIdx?: number;
  regionIdx?: number;
}

function isComplete(c: Connection | undefined): c is Required<Connection> {
  return !!c && c.nerveIdx !== undefined && c.actionIdx !== undefined && c.regionIdx !== undefined;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AnatomyConnectGame({
  title,
  muscles,
  nerves,
  actions,
  regions,
  initialResult,
  stats,
}: {
  title: string;
  muscles: string[];
  nerves: string[];
  actions: string[];
  regions: string[];
  initialResult: AnatomyConnectResultView | null;
  stats: AnatomyConnectStats;
}) {
  const [connections, setConnections] = useState<Record<string, Connection>>({});
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [results, setResults] = useState<Record<string, { nerveCorrect: boolean; actionCorrect: boolean; regionCorrect: boolean }> | null>(null);
  const [solvedResult, setSolvedResult] = useState<AnatomyConnectResultView | null>(initialResult);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (solvedResult) return;
    const id = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [solvedResult]);

  const rowColorByMuscle = new Map(muscles.map((m, i) => [m, i % ROW_COLOR_COUNT]));
  const allConnected = muscles.every((m) => isComplete(connections[m]));

  function usedElsewhere(field: "nerveIdx" | "actionIdx" | "regionIdx", idx: number, excludeMuscle: string): boolean {
    return Object.entries(connections).some(([m, c]) => m !== excludeMuscle && c[field] === idx);
  }

  function pick(field: "nerveIdx" | "actionIdx" | "regionIdx", idx: number) {
    if (!selectedMuscle || solvedResult) return;
    if (usedElsewhere(field, idx, selectedMuscle)) return;
    setConnections((prev) => ({ ...prev, [selectedMuscle]: { ...prev[selectedMuscle], [field]: idx } }));
  }

  function clearAll() {
    setConnections({});
    setSelectedMuscle(null);
    setResults(null);
  }

  function submit() {
    if (!allConnected || pending || solvedResult) return;
    const userConnections = muscles.map((m) => {
      const c = connections[m];
      return { muscle: m, nerve: nerves[c.nerveIdx!], action: actions[c.actionIdx!], region: regions[c.regionIdx!] };
    });
    const nextAttempts = attempts + 1;

    startTransition(async () => {
      const res = await submitAnatomyConnectAttempt(userConnections, nextAttempts, elapsedSeconds);
      if (!res.ok) return;
      setAttempts(nextAttempts);
      setResults(Object.fromEntries(res.results.map((r) => [r.muscle, r])));
      if (res.solved) setSolvedResult({ attempts: nextAttempts, timeSeconds: elapsedSeconds });
    });
  }

  const dateLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (solvedResult) {
    const shareText = `Anatomy Connect — ${dateLabel} — Solved in ${formatTime(solvedResult.timeSeconds)} — limbic.center/games/anatomy-connect`;
    return (
      <div className="screen-pad anatomy-connect-page">
        <AnatomyConnectHeader title={title} />
        <div className="anatomy-connect-result-card">
          <div className="differential-result-title">Solved</div>
          <p className="differential-result-sub">Time: {formatTime(solvedResult.timeSeconds)}</p>
        </div>
        <ShareButton text={shareText} label="Copy Result" className="btn btn-primary btn-block" />
        <AnatomyConnectStatsSection stats={stats} />
      </div>
    );
  }

  return (
    <div className="screen-pad anatomy-connect-page">
      <AnatomyConnectHeader title={title} />
      <div className="anatomy-connect-timer">Time: {formatTime(elapsedSeconds)}</div>

      {/* Desktop: four columns, click a muscle then click one item in each other column. */}
      <div className="anatomy-connect-columns">
        <AnatomyConnectColumn
          heading="Muscle"
          items={muscles}
          getState={(m) => ({
            active: selectedMuscle === m,
            color: isComplete(connections[m]) ? rowColorByMuscle.get(m) : undefined,
            disabled: false,
            correct: results?.[m] ? results[m].nerveCorrect && results[m].actionCorrect && results[m].regionCorrect : undefined,
          })}
          onClick={(m) => setSelectedMuscle(m)}
        />
        <AnatomyConnectColumn
          heading="Nerve"
          items={nerves}
          getState={(_, idx) => {
            const c = selectedMuscle ? connections[selectedMuscle] : undefined;
            const owningMuscle = muscles.find((m) => connections[m]?.nerveIdx === idx);
            return {
              active: c?.nerveIdx === idx,
              color: owningMuscle && isComplete(connections[owningMuscle]) ? rowColorByMuscle.get(owningMuscle) : undefined,
              disabled: !selectedMuscle || (owningMuscle !== undefined && owningMuscle !== selectedMuscle),
              correct: owningMuscle && results?.[owningMuscle] ? results[owningMuscle].nerveCorrect : undefined,
            };
          }}
          onClick={(_, idx) => pick("nerveIdx", idx)}
        />
        <AnatomyConnectColumn
          heading="Action"
          items={actions}
          getState={(_, idx) => {
            const c = selectedMuscle ? connections[selectedMuscle] : undefined;
            const owningMuscle = muscles.find((m) => connections[m]?.actionIdx === idx);
            return {
              active: c?.actionIdx === idx,
              color: owningMuscle && isComplete(connections[owningMuscle]) ? rowColorByMuscle.get(owningMuscle) : undefined,
              disabled: !selectedMuscle || (owningMuscle !== undefined && owningMuscle !== selectedMuscle),
              correct: owningMuscle && results?.[owningMuscle] ? results[owningMuscle].actionCorrect : undefined,
            };
          }}
          onClick={(_, idx) => pick("actionIdx", idx)}
        />
        <AnatomyConnectColumn
          heading="Region"
          items={regions}
          getState={(_, idx) => {
            const c = selectedMuscle ? connections[selectedMuscle] : undefined;
            const owningMuscle = muscles.find((m) => connections[m]?.regionIdx === idx);
            return {
              active: c?.regionIdx === idx,
              color: owningMuscle && isComplete(connections[owningMuscle]) ? rowColorByMuscle.get(owningMuscle) : undefined,
              disabled: !selectedMuscle || (owningMuscle !== undefined && owningMuscle !== selectedMuscle),
              correct: owningMuscle && results?.[owningMuscle] ? results[owningMuscle].regionCorrect : undefined,
            };
          }}
          onClick={(_, idx) => pick("regionIdx", idx)}
        />
      </div>

      {/* Mobile: pick a muscle card, then match it via three dropdowns. */}
      <div className="anatomy-connect-mobile-list">
        {muscles.map((m) => {
          const c = connections[m];
          const rowResult = results?.[m];
          return (
            <div key={m} className={`anatomy-connect-mobile-row${isComplete(c) ? ` ac-color-${rowColorByMuscle.get(m)}` : ""}`}>
              <div className="anatomy-connect-mobile-muscle">{m}</div>
              <select
                className="input"
                value={c?.nerveIdx ?? ""}
                onChange={(e) => setConnections((prev) => ({ ...prev, [m]: { ...prev[m], nerveIdx: Number(e.target.value) } }))}
              >
                <option value="" disabled>
                  Nerve
                </option>
                {nerves.map((n, idx) => (
                  <option key={idx} value={idx}>
                    {n}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={c?.actionIdx ?? ""}
                onChange={(e) => setConnections((prev) => ({ ...prev, [m]: { ...prev[m], actionIdx: Number(e.target.value) } }))}
              >
                <option value="" disabled>
                  Action
                </option>
                {actions.map((a, idx) => (
                  <option key={idx} value={idx}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={c?.regionIdx ?? ""}
                onChange={(e) => setConnections((prev) => ({ ...prev, [m]: { ...prev[m], regionIdx: Number(e.target.value) } }))}
              >
                <option value="" disabled>
                  Region
                </option>
                {regions.map((r, idx) => (
                  <option key={idx} value={idx}>
                    {r}
                  </option>
                ))}
              </select>
              {rowResult && (
                <div className="anatomy-connect-mobile-feedback">
                  {rowResult.nerveCorrect && rowResult.actionCorrect && rowResult.regionCorrect ? "Correct" : "Not quite — check the highlighted fields"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="anatomy-connect-actions">
        <button type="button" className="btn btn-secondary" onClick={clearAll} disabled={pending}>
          Clear
        </button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!allConnected || pending}>
          Submit
        </button>
      </div>
      {attempts > 0 && results && (
        <p className="anatomy-connect-attempts-note">
          Attempt {attempts} — {Object.values(results).filter((r) => r.nerveCorrect && r.actionCorrect && r.regionCorrect).length} of{" "}
          {muscles.length} fully correct
        </p>
      )}

      <AnatomyConnectStatsSection stats={stats} />
    </div>
  );
}

function AnatomyConnectHeader({ title }: { title: string }) {
  return (
    <div className="differential-header">
      <h1 className="differential-title">Anatomy Connect</h1>
      <p className="differential-subtitle">Match each muscle to its nerve, primary action, and region.</p>
      <p className="anatomy-connect-puzzle-title">{title}</p>
    </div>
  );
}

interface ColumnItemState {
  active: boolean;
  color: number | undefined;
  disabled: boolean;
  correct: boolean | undefined;
}

function AnatomyConnectColumn({
  heading,
  items,
  getState,
  onClick,
}: {
  heading: string;
  items: string[];
  getState: (item: string, idx: number) => ColumnItemState;
  onClick: (item: string, idx: number) => void;
}) {
  return (
    <div className="anatomy-connect-column">
      <div className="anatomy-connect-column-heading">{heading}</div>
      {items.map((item, idx) => {
        const state = getState(item, idx);
        const classes = ["anatomy-connect-card"];
        if (state.active) classes.push("anatomy-connect-card-active");
        if (state.disabled) classes.push("anatomy-connect-card-disabled");
        if (state.color !== undefined) classes.push(`ac-color-${state.color}`);
        if (state.correct === true) classes.push("anatomy-connect-card-correct");
        if (state.correct === false) classes.push("anatomy-connect-card-incorrect");
        return (
          <button
            type="button"
            key={idx}
            className={classes.join(" ")}
            onClick={() => onClick(item, idx)}
            disabled={state.disabled}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function AnatomyConnectStatsSection({ stats }: { stats: AnatomyConnectStats }) {
  return (
    <div className="card elev-sm differential-stats-card">
      <div className="games-stats-title">Your Stats</div>
      <div className="games-stats-grid">
        <div className="games-stat-tile">
          <div className="games-stat-value">{stats.totalSolved}</div>
          <div className="games-stat-label">Solved</div>
        </div>
        <div className="games-stat-tile">
          <div className="games-stat-value">{stats.solveRate}%</div>
          <div className="games-stat-label">Solve Rate</div>
        </div>
        <div className="games-stat-tile">
          <div className="games-stat-value">{formatTime(Math.round(stats.averageTimeSeconds))}</div>
          <div className="games-stat-label">Avg Time</div>
        </div>
      </div>
      <div className="differential-back-link">
        <Link href="/boards">Back to Boards</Link>
      </div>
    </div>
  );
}
