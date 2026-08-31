"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import {
  submitAnatomyConnectAttempt,
  gradeAnatomyConnectAnswer,
  revealAnatomyConnectHint,
} from "@/app/actions/anatomy-connect";
import { ShareButton } from "@/components/ShareButton";
import type { AnatomyConnectResultView, AnatomyConnectStats } from "@/app/actions/anatomy-connect";
import type {
  AnatomyConnectField,
  AnatomyConnectionCheck,
  AnatomyConnectMuscleQuestions,
} from "@/lib/anatomy-connect-logic";

const ROW_COLOR_COUNT = 4;
const MAX_HINTS = 2;
const HINT_PENALTY_SECONDS = 30;

/** localStorage key marking that this browser has opened Anatomy Connect before. Used only
 *  to tell a brand-new player (who gets the How to Play card) from a returning player who
 *  simply hasn't solved one yet (who gets a "complete your first puzzle" placeholder) — the
 *  two look identical from the stats alone, since both read zero solved. Deliberately not a
 *  database column: it drives nothing but which of two onboarding cards renders, and the
 *  spec called for no schema change. */
const SEEN_KEY = "limbic-anatomy-connect-seen";

const FIELD_LABEL: Record<AnatomyConnectField, string> = { nerve: "Nerve", action: "Action", region: "Region" };

/** Whether this browser had already seen the game when the page loaded, read once and then
 *  frozen for the life of the page. Freezing matters: the effect below *writes* the flag on
 *  first visit, and a live re-read would then flip a brand-new player's How to Play card
 *  away mid-session. Null until the first client read — during SSR and hydration nothing
 *  onboarding-related renders, so neither card can flash the wrong way. */
let seenAtPageLoad: boolean | null = null;

function readSeenBefore(): boolean {
  if (seenAtPageLoad === null) {
    try {
      seenAtPageLoad = window.localStorage.getItem(SEEN_KEY) !== null;
    } catch {
      // Private mode or blocked storage — treat as a returning player, which just means the
      // quieter of the two cards.
      seenAtPageLoad = true;
    }
  }
  return seenAtPageLoad;
}

/** The value never changes after load, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};
const seenBeforeServerSnapshot = (): boolean | null => null;

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

const FIELD_TO_IDX_KEY = {
  nerve: "nerveIdx",
  action: "actionIdx",
  region: "regionIdx",
} as const satisfies Record<AnatomyConnectField, keyof Connection>;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Anatomy Connect's board (see app/games/anatomy-connect/page.tsx). Two fully separate
 * interaction models, both always mounted, with a 768px media query deciding which one is
 * visible — desktop is a click-to-select-then-click-to-connect column board, mobile is a
 * one-muscle-at-a-time multiple-choice flow. They deliberately keep their own progress state
 * (a half-built column board doesn't translate into "question 3 of 12") but share the timer,
 * the hint budget, and the finished/solved state, so a reader who finishes on a phone and
 * later opens the same day on a laptop sees the finished game rather than a fresh board.
 *
 * The client never holds the answer key: the props below are four independently shuffled
 * label columns plus, for mobile, pre-built option lists that carry no marker for which
 * option is right. Every verdict — per-question on mobile, the whole board on Submit — comes
 * back from a Server Action.
 */
export function AnatomyConnectGame({
  title,
  muscles,
  nerves,
  actions,
  regions,
  showRegion,
  uniformRegion,
  muscleQuestions,
  initialResult,
  stats,
}: {
  title: string;
  muscles: string[];
  nerves: string[];
  actions: string[];
  regions: string[];
  /** False on the five puzzles whose rows all share one region — the Region column would be
   *  four identical cards, so it's dropped from both layouts and from grading. */
  showRegion: boolean;
  /** The single shared region on those puzzles, used to fill the field the reader never
   *  answered so the existing server-side scoring keeps working untouched. */
  uniformRegion: string | null;
  muscleQuestions: AnatomyConnectMuscleQuestions[];
  initialResult: AnatomyConnectResultView | null;
  stats: AnatomyConnectStats;
}) {
  const fields = useMemo<AnatomyConnectField[]>(
    () => (showRegion ? ["nerve", "action", "region"] : ["nerve", "action"]),
    [showRegion]
  );

  // --- shared across both layouts ---
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintPenaltySeconds, setHintPenaltySeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintFlash, setHintFlash] = useState(false);
  const [solvedResult, setSolvedResult] = useState<AnatomyConnectResultView | null>(initialResult);
  const [results, setResults] = useState<Record<string, AnatomyConnectionCheck> | null>(null);
  const [pending, startTransition] = useTransition();

  const finished = solvedResult !== null || results !== null;
  const displayedSeconds = elapsedSeconds + hintPenaltySeconds;

  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [finished]);

  // The amber "+0:30" flash next to the timer, cleared a second after the hint lands.
  useEffect(() => {
    if (!hintFlash) return;
    const id = window.setTimeout(() => setHintFlash(false), 1000);
    return () => window.clearTimeout(id);
  }, [hintFlash]);

  const spendHint = useCallback(() => {
    setHintsUsed((n) => n + 1);
    setHintPenaltySeconds((s) => s + HINT_PENALTY_SECONDS);
    setHintFlash(true);
  }, []);

  const hintsRemaining = MAX_HINTS - hintsUsed;

  /** Grades a finished board. Shared by both layouts: desktop calls it from Submit, mobile
   *  from the end of its last question. Time submitted includes the hint penalty — that's
   *  what makes a hint cost something. */
  const submitBoard = useCallback(
    (userConnections: { muscle: string; nerve: string; action: string; region: string }[]) => {
      startTransition(async () => {
        const res = await submitAnatomyConnectAttempt(userConnections, 1, displayedSeconds);
        if (!res.ok) return;
        setResults(Object.fromEntries(res.results.map((r) => [r.muscle, r])));
        if (res.solved) setSolvedResult({ attempts: 1, timeSeconds: displayedSeconds });
      });
    },
    [displayedSeconds]
  );

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
      <div className="anatomy-connect-timer">
        Time: {formatTime(displayedSeconds)}
        {hintFlash && <span className="ac-timer-flash">+0:30</span>}
      </div>

      <AnatomyConnectDesktop
        muscles={muscles}
        nerves={nerves}
        actions={actions}
        regions={regions}
        fields={fields}
        showRegion={showRegion}
        uniformRegion={uniformRegion}
        results={results}
        finished={finished}
        pending={pending}
        hintsRemaining={hintsRemaining}
        onSpendHint={spendHint}
        onSubmit={submitBoard}
      />

      <AnatomyConnectMobile
        muscleQuestions={muscleQuestions}
        fields={fields}
        showRegion={showRegion}
        uniformRegion={uniformRegion}
        results={results}
        finished={finished}
        elapsedSeconds={displayedSeconds}
        dateLabel={dateLabel}
        hintsRemaining={hintsRemaining}
        onSpendHint={spendHint}
        onSubmit={submitBoard}
      />

      <AnatomyConnectStatsSection stats={stats} />
    </div>
  );
}

/* ==========================================================================
   Desktop — click a muscle, then click its nerve / action / region
   ========================================================================== */

function AnatomyConnectDesktop({
  muscles,
  nerves,
  actions,
  regions,
  fields,
  showRegion,
  uniformRegion,
  results,
  finished,
  pending,
  hintsRemaining,
  onSpendHint,
  onSubmit,
}: {
  muscles: string[];
  nerves: string[];
  actions: string[];
  regions: string[];
  fields: AnatomyConnectField[];
  showRegion: boolean;
  uniformRegion: string | null;
  results: Record<string, AnatomyConnectionCheck> | null;
  finished: boolean;
  pending: boolean;
  hintsRemaining: number;
  onSpendHint: () => void;
  onSubmit: (c: { muscle: string; nerve: string; action: string; region: string }[]) => void;
}) {
  const [connections, setConnections] = useState<Record<string, Connection>>({});
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  /** Nerve column indices revealed by a hint, shown with a muted green border and a "Hint"
   *  tag. Keyed by index rather than muscle because that's what the column renders. */
  const [hintedNerveIdxs, setHintedNerveIdxs] = useState<number[]>([]);
  const [hintPending, setHintPending] = useState(false);

  const rowColorByMuscle = useMemo(
    () => new Map(muscles.map((m, i) => [m, i % ROW_COLOR_COUNT])),
    [muscles]
  );

  const columnFor: Record<AnatomyConnectField, string[]> = { nerve: nerves, action: actions, region: regions };

  const connectedCount = useCallback(
    (m: string) => fields.filter((f) => connections[m]?.[FIELD_TO_IDX_KEY[f]] !== undefined).length,
    [connections, fields]
  );

  const rowIsComplete = useCallback((m: string) => connectedCount(m) === fields.length, [connectedCount, fields]);
  const allConnected = muscles.every(rowIsComplete);

  function selectMuscle(m: string) {
    if (finished) return;
    setSelectedMuscle((current) => (current === m ? null : m));
  }

  /** Assigns a card to the active muscle, stealing it from whichever muscle held it before.
   *  Reassignment rather than refusal is the point: a reader who mis-clicked shouldn't have
   *  to hunt down and clear the old row first. */
  function pick(field: AnatomyConnectField, idx: number) {
    if (!selectedMuscle || finished) return;
    const key = FIELD_TO_IDX_KEY[field];
    setConnections((prev) => {
      const next: Record<string, Connection> = {};
      for (const [m, c] of Object.entries(prev)) {
        next[m] = m !== selectedMuscle && c[key] === idx ? { ...c, [key]: undefined } : c;
      }
      next[selectedMuscle] = { ...next[selectedMuscle], [key]: idx };
      return next;
    });
  }

  function clearAll() {
    setConnections({});
    setSelectedMuscle(null);
    setHintedNerveIdxs([]);
  }

  /** Hints target the muscle the reader looks most stuck on — fewest connections made, ties
   *  broken by column order. Reveals that muscle's nerve, which is the step every row starts
   *  with. */
  function useHint() {
    if (hintsRemaining <= 0 || finished || hintPending) return;
    const target = [...muscles].sort((a, b) => connectedCount(a) - connectedCount(b))[0];
    if (!target) return;

    setHintPending(true);
    void (async () => {
      const res = await revealAnatomyConnectHint(target, "nerve");
      setHintPending(false);
      if (!res.ok) return;

      // Puzzles repeat nerve text across rows, so prefer an occurrence nobody has claimed —
      // pointing at a card already wired to another muscle would read as a contradiction.
      const claimed = new Set(Object.values(connections).map((c) => c.nerveIdx));
      const candidates = nerves.flatMap((n, i) => (n === res.answer ? [i] : []));
      const idx = candidates.find((i) => !claimed.has(i)) ?? candidates[0];
      if (idx !== undefined) setHintedNerveIdxs((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
      onSpendHint();
    })();
  }

  function submit() {
    if (!allConnected || pending || finished) return;
    onSubmit(
      muscles.map((m) => {
        const c = connections[m];
        return {
          muscle: m,
          nerve: nerves[c.nerveIdx!],
          action: actions[c.actionIdx!],
          // On a uniform-region puzzle the reader never sees a Region column, so the one
          // shared region is filled in here. Server-side scoring is untouched — it still
          // grades all three fields, and this one is trivially right for everybody.
          region: showRegion ? regions[c.regionIdx!] : (uniformRegion ?? ""),
        };
      })
    );
  }

  const instruction = (() => {
    if (finished) return "Board graded — the correct answer is shown under each miss";
    if (allConnected) return "All rows connected — ready to Submit";
    if (!selectedMuscle) return "Click a muscle to begin";
    const c = connections[selectedMuscle];
    for (const f of fields) {
      if (c?.[FIELD_TO_IDX_KEY[f]] === undefined) return `Now select the matching ${FIELD_LABEL[f]} →`;
    }
    return "Row complete — select another muscle or Submit";
  })();

  const ownerOf = (field: AnatomyConnectField, idx: number) =>
    muscles.find((m) => connections[m]?.[FIELD_TO_IDX_KEY[field]] === idx);

  return (
    <div className="anatomy-connect-desktop">
      <p className="anatomy-connect-instruction">{instruction}</p>

      <div className={`anatomy-connect-columns${showRegion ? "" : " anatomy-connect-columns-3"}`}>
        <div className="anatomy-connect-column">
          <div className="anatomy-connect-column-heading">Muscle</div>
          {muscles.map((m) => {
            const rowResult = results?.[m];
            const wholeRowCorrect = rowResult
              ? rowResult.nerveCorrect && rowResult.actionCorrect && (!showRegion || rowResult.regionCorrect)
              : undefined;
            return (
              <AnatomyConnectCard
                key={m}
                label={m}
                // Selection is dropped once the board is graded — a pulsing "pick your
                // nerve" marker on a read-only board would be inviting a click that no
                // longer does anything.
                active={selectedMuscle === m && !finished}
                colorIdx={connectedCount(m) > 0 ? rowColorByMuscle.get(m) : undefined}
                correct={wholeRowCorrect}
                disabled={finished}
                onClick={() => selectMuscle(m)}
              />
            );
          })}
        </div>

        {fields.map((field) => (
          <div className="anatomy-connect-column" key={field}>
            <div className="anatomy-connect-column-heading">{FIELD_LABEL[field]}</div>
            {columnFor[field].map((label, idx) => {
              const owner = ownerOf(field, idx);
              const ownerResult = owner ? results?.[owner] : undefined;
              const correct = ownerResult
                ? field === "nerve"
                  ? ownerResult.nerveCorrect
                  : field === "action"
                    ? ownerResult.actionCorrect
                    : ownerResult.regionCorrect
                : undefined;
              return (
                <AnatomyConnectCard
                  key={idx}
                  label={label}
                  active={false}
                  colorIdx={owner ? rowColorByMuscle.get(owner) : undefined}
                  correct={correct}
                  hinted={field === "nerve" && hintedNerveIdxs.includes(idx)}
                  correctAnswer={correct === false && ownerResult ? ownerResult.correct[field] : undefined}
                  disabled={finished}
                  onClick={() => pick(field, idx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="anatomy-connect-actions">
        <button type="button" className="btn btn-secondary" onClick={clearAll} disabled={pending || finished}>
          Clear
        </button>
        <button
          type="button"
          className="anatomy-connect-hint-btn"
          onClick={useHint}
          disabled={hintsRemaining <= 0 || finished || hintPending}
        >
          Hint ({hintsRemaining} remaining)
        </button>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!allConnected || pending || finished}>
          Submit
        </button>
      </div>

      {results && (
        <p className="anatomy-connect-attempts-note">
          {
            Object.values(results).filter(
              (r) => r.nerveCorrect && r.actionCorrect && (!showRegion || r.regionCorrect)
            ).length
          }{" "}
          of {muscles.length} rows fully correct
        </p>
      )}
    </div>
  );
}

function AnatomyConnectCard({
  label,
  active,
  colorIdx,
  correct,
  hinted,
  correctAnswer,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  colorIdx: number | undefined;
  correct: boolean | undefined;
  hinted?: boolean;
  correctAnswer?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const classes = ["anatomy-connect-card"];
  if (active) classes.push("anatomy-connect-card-active");
  if (colorIdx !== undefined) classes.push(`ac-color-${colorIdx}`);
  if (hinted) classes.push("anatomy-connect-card-hinted");
  if (correct === true) classes.push("anatomy-connect-card-correct");
  if (correct === false) classes.push("anatomy-connect-card-incorrect");

  return (
    <div className="anatomy-connect-card-wrap">
      <button type="button" className={classes.join(" ")} onClick={onClick} disabled={disabled}>
        {label}
        {active && <span className="anatomy-connect-active-dot" aria-hidden="true" />}
        {hinted && <span className="anatomy-connect-hint-tag">Hint</span>}
      </button>
      {correctAnswer && <div className="anatomy-connect-correct-note">Correct: {correctAnswer}</div>}
    </div>
  );
}

/* ==========================================================================
   Mobile — one muscle at a time, multiple choice
   ========================================================================== */

interface AnsweredQuestion {
  answer: string;
  correct: boolean;
  correctAnswer: string;
}

function AnatomyConnectMobile({
  muscleQuestions,
  fields,
  showRegion,
  uniformRegion,
  results,
  finished,
  elapsedSeconds,
  dateLabel,
  hintsRemaining,
  onSpendHint,
  onSubmit,
}: {
  muscleQuestions: AnatomyConnectMuscleQuestions[];
  fields: AnatomyConnectField[];
  showRegion: boolean;
  uniformRegion: string | null;
  results: Record<string, AnatomyConnectionCheck> | null;
  finished: boolean;
  elapsedSeconds: number;
  dateLabel: string;
  hintsRemaining: number;
  onSpendHint: () => void;
  onSubmit: (c: { muscle: string; nerve: string; action: string; region: string }[]) => void;
}) {
  const [muscleIdx, setMuscleIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Partial<Record<AnatomyConnectField, AnsweredQuestion>>>>({});
  const [showingMuscleResult, setShowingMuscleResult] = useState(false);
  const [hintedAnswer, setHintedAnswer] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  /** True from the moment the last muscle is finished until the graded board comes back.
   *  Without it the flow would drop back to the last muscle's first question — already
   *  answered — for the length of that round trip. */
  const [awaitingResults, setAwaitingResults] = useState(false);

  const totalQuestions = muscleQuestions.length * fields.length;
  const answeredCount = Object.values(answers).reduce((sum, byField) => sum + Object.keys(byField).length, 0);

  const current = muscleQuestions[muscleIdx];
  const currentQuestion = current?.questions[questionIdx];
  const currentAnswer = current && currentQuestion ? answers[current.muscle]?.[currentQuestion.field] : undefined;

  async function answer(option: string) {
    if (!current || !currentQuestion || currentAnswer || grading) return;
    setGrading(true);
    const res = await gradeAnatomyConnectAnswer(current.muscle, currentQuestion.field, option);
    setGrading(false);
    if (!res.ok) return;
    setAnswers((prev) => ({
      ...prev,
      [current.muscle]: {
        ...prev[current.muscle],
        [currentQuestion.field]: { answer: option, correct: res.correct, correctAnswer: res.correctAnswer },
      },
    }));
  }

  function useHint() {
    if (!current || !currentQuestion || hintsRemaining <= 0 || currentAnswer || hintedAnswer) return;
    void (async () => {
      const res = await revealAnatomyConnectHint(current.muscle, currentQuestion.field);
      if (!res.ok) return;
      setHintedAnswer(res.answer);
      onSpendHint();
    })();
  }

  function next() {
    setHintedAnswer(null);
    if (questionIdx + 1 < fields.length) {
      setQuestionIdx(questionIdx + 1);
      return;
    }
    setShowingMuscleResult(true);
  }

  function nextMuscle() {
    setShowingMuscleResult(false);
    setQuestionIdx(0);

    if (muscleIdx + 1 < muscleQuestions.length) {
      setMuscleIdx(muscleIdx + 1);
      return;
    }

    // Last muscle answered — hand the assembled board to the same server-side scoring the
    // desktop Submit uses, rather than trusting the per-question verdicts we already have.
    setAwaitingResults(true);
    onSubmit(
      muscleQuestions.map((mq) => {
        const byField = answers[mq.muscle] ?? {};
        return {
          muscle: mq.muscle,
          nerve: byField.nerve?.answer ?? "",
          action: byField.action?.answer ?? "",
          region: showRegion ? (byField.region?.answer ?? "") : (uniformRegion ?? ""),
        };
      })
    );
  }

  if (finished) {
    const correctRows = results
      ? Object.values(results).filter((r) => r.nerveCorrect && r.actionCorrect && (!showRegion || r.regionCorrect)).length
      : 0;
    const shareText = `Anatomy Connect — ${dateLabel} — ${correctRows}/${muscleQuestions.length} in ${formatTime(elapsedSeconds)} — limbic.center/games/anatomy-connect`;
    return (
      <div className="anatomy-connect-mobile">
        <div className="anatomy-connect-result-card">
          <div className="differential-result-title">
            {correctRows} of {muscleQuestions.length} rows correct
          </div>
          <p className="differential-result-sub">Time: {formatTime(elapsedSeconds)}</p>
        </div>
        <ShareButton text={shareText} label="Copy Result" className="btn btn-primary btn-block" />
      </div>
    );
  }

  if (awaitingResults || !current) {
    return (
      <div className="anatomy-connect-mobile">
        <p className="anatomy-connect-instruction">Scoring your answers...</p>
      </div>
    );
  }

  const muscleAnswers = answers[current.muscle] ?? {};
  const muscleCorrect = Object.values(muscleAnswers).filter((a) => a.correct).length;
  // Showing the region as a header pill while the region question is still open would hand
  // over the answer, so it only appears once region is settled — either answered, or never
  // asked because every row shares it.
  const regionPill = !showRegion ? uniformRegion : muscleAnswers.region?.correctAnswer;

  return (
    <div className="anatomy-connect-mobile">
      <div className="ac-progress-track" aria-hidden="true">
        <div className="ac-progress-fill" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
      </div>

      <div className="ac-muscle-header">
        <div className="ac-muscle-header-top">
          <span className="ac-muscle-progress">
            Muscle {muscleIdx + 1} of {muscleQuestions.length}
          </span>
          {regionPill && <span className="ac-region-pill">{regionPill}</span>}
        </div>
        <div className="ac-muscle-name">{current.muscle}</div>
      </div>

      {showingMuscleResult ? (
        <div className="ac-muscle-result">
          <div className="ac-muscle-result-name">{current.muscle}</div>
          <div className={`ac-muscle-result-score${muscleCorrect === fields.length ? " ac-score-all" : muscleCorrect > 0 ? " ac-score-some" : " ac-score-none"}`}>
            {muscleCorrect} of {fields.length} correct
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={nextMuscle}>
            {muscleIdx + 1 < muscleQuestions.length ? "Next Muscle →" : "See Results →"}
          </button>
        </div>
      ) : (
        currentQuestion && (
          <div className="ac-question-card">
            <div className="ac-question-label">{FIELD_LABEL[currentQuestion.field].toUpperCase()}</div>

            {currentQuestion.options.map((option) => {
              const classes = ["ac-option"];
              if (currentAnswer) {
                if (currentAnswer.answer === option) classes.push(currentAnswer.correct ? "ac-option-correct" : "ac-option-incorrect");
                else if (!currentAnswer.correct && currentAnswer.correctAnswer === option) classes.push("ac-option-reveal");
              } else if (hintedAnswer === option) {
                classes.push("ac-option-hinted");
              }
              return (
                <button
                  type="button"
                  key={option}
                  className={classes.join(" ")}
                  onClick={() => answer(option)}
                  disabled={!!currentAnswer || grading}
                >
                  <span>{option}</span>
                  {currentAnswer?.answer === option && (
                    <span className="ac-option-mark">{currentAnswer.correct ? "✓" : "✕"}</span>
                  )}
                  {currentAnswer && !currentAnswer.correct && currentAnswer.correctAnswer === option && (
                    <span className="ac-option-reveal-label">Correct answer</span>
                  )}
                </button>
              );
            })}

            {currentAnswer ? (
              <button type="button" className="btn btn-primary btn-block ac-next-btn" onClick={next}>
                Next
              </button>
            ) : (
              <button
                type="button"
                className="anatomy-connect-hint-btn ac-hint-mobile"
                onClick={useHint}
                disabled={hintsRemaining <= 0 || !!hintedAnswer}
              >
                Hint ({hintsRemaining} remaining)
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}

/* ========================================================================== */

function AnatomyConnectHeader({ title }: { title: string }) {
  return (
    <div className="differential-header">
      <h1 className="differential-title">Anatomy Connect</h1>
      <p className="differential-subtitle">Match each muscle to its nerve, primary action, and region.</p>
      <p className="anatomy-connect-puzzle-title">{title}</p>
    </div>
  );
}

function AnatomyConnectStatsSection({ stats }: { stats: AnatomyConnectStats }) {
  const seenBefore = useSyncExternalStore(subscribeToNothing, readSeenBefore, seenBeforeServerSnapshot);

  // Mark this browser as having seen the game. Separate from the read above, which is frozen
  // at page load precisely so this write can't retract the card it just decided to show.
  useEffect(() => {
    if (stats.totalSolved > 0) return;
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Nothing to do — readSeenBefore already fell back to the returning-player card.
    }
  }, [stats.totalSolved]);

  if (stats.totalSolved === 0 && seenBefore === false) return <AnatomyConnectHowToPlay />;

  return (
    <div className="card elev-sm differential-stats-card">
      <div className="games-stats-title">Your Stats</div>
      {stats.totalSolved === 0 ? (
        seenBefore === null ? null : (
          <p className="ac-stats-empty">Complete your first puzzle to see your stats</p>
        )
      ) : (
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
      )}
      <div className="differential-back-link">
        <Link href="/boards">Back to Boards</Link>
      </div>
    </div>
  );
}

const HOW_TO_PLAY_STEPS = [
  "Click a muscle on the left to select it",
  "Click the matching nerve, action, and region",
  "Each row gets a unique color when connected",
  "Connect all rows then hit Submit",
];

const HOW_TO_PLAY_TIPS = [
  "Use hints if you are stuck — costs 30 seconds each",
  "Wrong? The correct answer is shown after Submit",
  "Accuracy matters more than speed",
];

function AnatomyConnectHowToPlay() {
  return (
    <div className="ac-how-to-play">
      <div className="games-stats-title">How to Play</div>
      <ol className="ac-how-steps">
        {HOW_TO_PLAY_STEPS.map((step, i) => (
          <li key={step}>
            <span className="ac-how-step-num">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="ac-how-tips-label">Tips:</div>
      <ul className="ac-how-tips">
        {HOW_TO_PLAY_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <div className="differential-back-link">
        <Link href="/boards">Back to Boards</Link>
      </div>
    </div>
  );
}
