"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitDifferentialGuess } from "@/app/actions/differential";
import { ShareButton } from "@/components/ShareButton";
import type { DifferentialCategory, DifferentialDifficulty } from "@/lib/differential-cases";
import type { DifferentialResultView, DifferentialStats } from "@/app/actions/differential";

const TOTAL_CLUES = 5;

/** 5 clues used = 1 point, down to 1 clue used = 5 points — fewer clues is worth more,
 *  per the game's "how quickly can you identify it" premise. */
function scoreForCluesUsed(cluesUsed: number): number {
  return TOTAL_CLUES + 1 - cluesUsed;
}

function categorySlug(category: string): string {
  return category.toLowerCase();
}

function difficultyLabel(difficulty: DifferentialDifficulty): string {
  return difficulty[0].toUpperCase() + difficulty.slice(1);
}

export function DifferentialGame({
  dateKey,
  category,
  difficulty,
  clues,
  initialResult,
  stats,
}: {
  dateKey: string;
  category: DifferentialCategory;
  difficulty: DifferentialDifficulty;
  clues: string[];
  initialResult: DifferentialResultView | null;
  stats: DifferentialStats;
}) {
  const [clueCount, setClueCount] = useState(initialResult ? TOTAL_CLUES : 1);
  const [guessValue, setGuessValue] = useState("");
  const [priorGuesses, setPriorGuesses] = useState<string[]>(initialResult ? initialResult.guesses.slice(0, -1) : []);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<DifferentialResultView | null>(initialResult);
  const [pending, startTransition] = useTransition();

  const done = result !== null;
  const dateLabel = new Date(dateKey + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  function revealNextClue() {
    if (clueCount >= TOTAL_CLUES) return;
    setClueCount((c) => c + 1);
    setFeedback(null);
  }

  function submitGuess() {
    const guess = guessValue.trim();
    if (!guess || pending || done) return;

    startTransition(async () => {
      const res = await submitDifferentialGuess(guess, clueCount, priorGuesses);
      if (!res.ok) return;

      if (res.correct || clueCount >= TOTAL_CLUES) {
        setResult({ correct: res.correct, cluesUsed: clueCount, guesses: [...priorGuesses, guess], condition: res.condition });
        return;
      }

      setPriorGuesses((prev) => [...prev, guess]);
      setGuessValue("");
      setFeedback("Not quite — reveal another clue and try again.");
    });
  }

  if (done && result) {
    const score = result.correct ? scoreForCluesUsed(result.cluesUsed) : 0;
    const shareText = result.correct
      ? `Differential — ${dateLabel} — Got it in ${result.cluesUsed} clues — ${score} points — limbic.center/games/differential`
      : `Differential — ${dateLabel} — Didn't get it today — limbic.center/games/differential`;

    return (
      <div className="screen-pad differential-page">
        <DifferentialHeader />
        <div className={`differential-result-card ${result.correct ? "differential-result-card--correct" : "differential-result-card--incorrect"}`}>
          <div className="differential-result-title">{result.correct ? `Correct — ${result.condition}` : `The answer was ${result.condition}`}</div>
          {result.correct ? (
            <p className="differential-result-sub">
              You got it in {result.cluesUsed} {result.cluesUsed === 1 ? "clue" : "clues"} — {score} points
            </p>
          ) : (
            <p className="differential-result-sub">Come back tomorrow for a new case.</p>
          )}
        </div>

        <div className="differential-clue-list">
          {clues.map((clue, i) => (
            <div key={i} className="differential-clue-list-item">
              <span className="differential-clue-list-num">{i + 1}</span>
              <span>{clue}</span>
            </div>
          ))}
        </div>

        <ShareButton text={shareText} label="Copy Result" className="btn btn-primary btn-block" />
        <DifferentialStatsSection stats={stats} />
      </div>
    );
  }

  return (
    <div className="screen-pad differential-page">
      <DifferentialHeader />

      <div className={`specialty-accent-${categorySlug(category)} differential-category-pill`}>{category}</div>

      <div className="differential-clue-card">
        <p className="differential-clue-text">{clues[clueCount - 1]}</p>
      </div>
      <div className="differential-clue-counter">
        Clue {clueCount} of {TOTAL_CLUES}
      </div>

      <button type="button" className="btn btn-secondary btn-block" onClick={revealNextClue} disabled={clueCount >= TOTAL_CLUES}>
        Reveal Next Clue
      </button>

      <div className="differential-guess-row">
        <input
          type="text"
          className="input"
          placeholder="Enter your diagnosis"
          value={guessValue}
          onChange={(e) => setGuessValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitGuess()}
          disabled={pending}
        />
        <button type="button" className="btn btn-primary" onClick={submitGuess} disabled={pending || !guessValue.trim()}>
          Submit
        </button>
      </div>
      {feedback && <p className="differential-feedback">{feedback}</p>}

      <p className="differential-difficulty-label">Difficulty: {difficultyLabel(difficulty)}</p>
      <p className="differential-score-hint">
        Score if correct now: {scoreForCluesUsed(clueCount)} {scoreForCluesUsed(clueCount) === 1 ? "point" : "points"}
      </p>

      <DifferentialStatsSection stats={stats} />
    </div>
  );
}

function DifferentialHeader() {
  return (
    <div className="differential-header">
      <h1 className="differential-title">Differential</h1>
      <p className="differential-subtitle">Identify the condition. Fewer clues is better.</p>
    </div>
  );
}

function DifferentialStatsSection({ stats }: { stats: DifferentialStats }) {
  const correctPct = stats.totalPlayed > 0 ? Math.round((stats.totalCorrect / stats.totalPlayed) * 100) : 0;
  return (
    <div className="card elev-sm differential-stats-card">
      <div className="games-stats-title">Your Stats</div>
      <div className="games-stats-grid">
        <div className="games-stat-tile">
          <div className="games-stat-value">{stats.totalPlayed}</div>
          <div className="games-stat-label">Played</div>
        </div>
        <div className="games-stat-tile">
          <div className="games-stat-value">{correctPct}%</div>
          <div className="games-stat-label">Correct</div>
        </div>
        <div className="games-stat-tile">
          <div className="games-stat-value">{stats.averageCluesUsed.toFixed(1)}</div>
          <div className="games-stat-label">Avg Clues Used</div>
        </div>
        <div className="games-stat-tile">
          <div className="games-stat-value">{stats.currentStreak}</div>
          <div className="games-stat-label">Current Streak</div>
        </div>
      </div>
      <div className="differential-back-link">
        <Link href="/games">Back to Games</Link>
      </div>
    </div>
  );
}
