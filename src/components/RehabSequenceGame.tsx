"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitRehabSequence } from "@/app/actions/rehab-sequence";
import { ShareButton } from "@/components/ShareButton";
import type { RehabSequenceCategory, RehabSequenceDifficulty } from "@/lib/rehab-sequence-cases";
import type { RehabSequenceResultView, RehabStats } from "@/app/actions/rehab-sequence";

const TOTAL_STEPS = 8;

/** Fisher-Yates — a fresh shuffle every page load, per spec, run once on mount via
 *  useState's lazy initializer rather than in render (which would reshuffle on every
 *  re-render, scrambling the reader's in-progress arrangement). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function categorySlug(category: string): string {
  return category.toLowerCase();
}

export function RehabSequenceGame({
  title,
  category,
  difficulty,
  context,
  interventions,
  rationale,
  initialResult,
  stats,
}: {
  title: string;
  category: RehabSequenceCategory;
  difficulty: RehabSequenceDifficulty;
  context: string;
  interventions: string[];
  rationale: string[];
  initialResult: RehabSequenceResultView | null;
  stats: RehabStats;
}) {
  const [sequence, setSequence] = useState<string[]>(() => (initialResult ? initialResult.sequenceGiven : shuffle(interventions)));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [submission, setSubmission] = useState<{
    score: number;
    correct: boolean;
    correctPositions: boolean[];
    correctSequence: string[];
    rationale: string[];
  } | null>(
    initialResult
      ? {
          score: initialResult.score,
          correct: initialResult.correct,
          correctPositions: initialResult.sequenceGiven.map((step, i) => step === interventions[i]),
          correctSequence: interventions,
          rationale,
        }
      : null
  );
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    if (submission) return;
    const target = index + direction;
    if (target < 0 || target >= sequence.length) return;
    setSequence((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onDrop(index: number) {
    if (submission || dragIndex === null || dragIndex === index) return;
    setSequence((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  function submit() {
    if (pending || submission) return;
    startTransition(async () => {
      const res = await submitRehabSequence(sequence);
      if (!res.ok) return;
      setSubmission(res);
    });
  }

  const dateLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="screen-pad rehab-sequence-page">
      <div className="differential-header">
        <h1 className="differential-title">Rehab Sequence</h1>
        <p className="differential-subtitle">Arrange the interventions in the correct clinical order.</p>
      </div>

      <div className="rehab-case-card">
        <div className="rehab-case-header">
          <div className="rehab-case-title">{title}</div>
          <div className="rehab-case-pills">
            <span className={`specialty-accent-${categorySlug(category)} differential-category-pill`}>{category}</span>
            <span className={`rehab-difficulty-pill rehab-difficulty-pill--${difficulty}`}>{difficulty}</span>
          </div>
        </div>
        <p className="rehab-case-context">{context}</p>
      </div>

      {submission && (
        <div className={`differential-result-card ${submission.correct ? "differential-result-card--correct" : ""}`}>
          <div className="differential-result-title">
            {submission.correct ? "Perfect sequence. Clinical reasoning confirmed." : `${submission.score} of ${TOTAL_STEPS} correct`}
          </div>
          {!submission.correct && <p className="differential-result-sub">Review the correct order and rationale below.</p>}
        </div>
      )}

      <div className="rehab-sequence-list">
        {sequence.map((step, i) => {
          const positionResult = submission ? submission.correctPositions[i] : undefined;
          const classes = ["rehab-sequence-card"];
          if (positionResult === true) classes.push("rehab-sequence-card-correct");
          if (positionResult === false) classes.push("rehab-sequence-card-incorrect");
          return (
            <div
              key={step}
              className={classes.join(" ")}
              draggable={!submission}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
            >
              <span className="rehab-sequence-num">{i + 1}</span>
              <span className="rehab-sequence-text">{step}</span>
              {!submission && (
                <span className="rehab-sequence-arrows">
                  <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    ▲
                  </button>
                  <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === sequence.length - 1}>
                    ▼
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!submission && (
        <button type="button" className="btn btn-primary btn-block" onClick={submit} disabled={pending}>
          Submit
        </button>
      )}

      {submission && (
        <>
          <div className="rehab-sequence-review">
            <div className="rehab-sequence-review-heading">Correct Sequence</div>
            {submission.correctSequence.map((step, i) => (
              <div key={i} className="rehab-sequence-review-row">
                <span className="differential-clue-list-num">{i + 1}</span>
                <div>
                  <p className="rehab-sequence-review-step">{step}</p>
                  <p className="rehab-sequence-review-rationale">{submission.rationale[i]}</p>
                </div>
              </div>
            ))}
          </div>
          <ShareButton
            text={`Rehab Sequence — ${dateLabel} — ${submission.score} of ${TOTAL_STEPS} correct — limbic.center/games/rehab-sequence`}
            label="Copy Result"
            className="btn btn-primary btn-block"
          />
        </>
      )}

      <div className="card elev-sm differential-stats-card">
        <div className="games-stats-title">Your Stats</div>
        <div className="games-stats-grid">
          <div className="games-stat-tile">
            <div className="games-stat-value">{stats.totalPlayed}</div>
            <div className="games-stat-label">Played</div>
          </div>
          <div className="games-stat-tile">
            <div className="games-stat-value">{stats.perfectSolves}</div>
            <div className="games-stat-label">Perfect Solves</div>
          </div>
          <div className="games-stat-tile">
            <div className="games-stat-value">{stats.averageScore.toFixed(1)}</div>
            <div className="games-stat-label">Avg Score / {TOTAL_STEPS}</div>
          </div>
        </div>
        <div className="differential-back-link">
          <Link href="/games">Back to Games</Link>
        </div>
      </div>
    </div>
  );
}
