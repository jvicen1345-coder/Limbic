"use client";

import { useEffect, useState, useTransition } from "react";
import {
  recordBoardQuestionAction,
  recordBoardTermRevealAction,
  recordCaseOfDayAction,
  recordSharpeningTargetAction,
} from "@/app/actions/daily-completion";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";
import { formatElapsed } from "@/lib/meta";
import { NPTE_THREE_QUESTION_BENCHMARK_SECONDS, type BoardQuestion, type BoardTerm } from "@/lib/board-content";
import type { DailyCase } from "@/lib/cases-static";

type SessionState = "idle" | "preview" | "active" | "complete";

interface StepResult {
  title: string;
  correct: boolean;
  correctAnswerText: string;
  elapsedSeconds: number;
}

const STEP_COUNT = 3;

/** Replaces the old three-independent-cards Daily Sharpening (Board Question, Term of the
 *  Day, Case of the Day each opening and completing on their own) with one unified,
 *  timed, forward-only session — see /boards/page.tsx. All three DailyCompletion rows
 *  (kinds "boardQuestion"/"boardTerm"/"caseOfDay") are still written through the same
 *  existing server actions as before, just batched on the summary screen's "Done" click
 *  rather than one at a time per card, matching "complete all three to mark today's
 *  sharpening as done." Term of the Day keeps its existing reveal-only mechanic (no new
 *  fill-in-the-blank grading) rather than becoming a multiple-choice question — a reveal
 *  always counts as "correct" for the session score, the same as it always counted as
 *  simply "done" before this redesign; only the question and case steps have a real wrong
 *  answer. */
export function DailySharpeningSession({
  dateKey,
  question,
  term,
  dayCase,
  alreadyComplete,
  targetSeconds,
  nexusOptIn,
}: {
  dateKey: string;
  question: BoardQuestion;
  term: BoardTerm;
  dayCase: DailyCase;
  /** Whether all three of today's DailyCompletion rows already exist, as of the server
   *  render — the session still tracks its own `finishedNow` on top of this so clicking
   *  Done reflects the completed state immediately, without needing a full page reload. */
  alreadyComplete: boolean;
  /** Today's "beat the clock" pacing target in seconds — the standard NPTE 3-question
   *  benchmark unless a previous session ran over it, in which case that session's own time
   *  becomes the target until a session finally beats the real benchmark again (see
   *  User.boardsSharpeningTargetSeconds, recordSharpeningTargetAction). */
  targetSeconds: number;
  nexusOptIn: boolean;
}) {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [finishedNow, setFinishedNow] = useState(false);
  const [doneClicked, setDoneClicked] = useState(false);
  const [, startTransition] = useTransition();

  const [stepIndex, setStepIndex] = useState(0);
  const [showingResult, setShowingResult] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [stepStartElapsed, setStepStartElapsed] = useState(0);

  const [questionSelected, setQuestionSelected] = useState<number | null>(null);
  const [termRevealed, setTermRevealed] = useState(false);
  const [caseSelected, setCaseSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  function beginSession() {
    setStepIndex(0);
    setShowingResult(false);
    setResults([]);
    setElapsedSeconds(0);
    setStepStartElapsed(0);
    setTimerRunning(true);
    setQuestionSelected(null);
    setTermRevealed(false);
    setCaseSelected(null);
    setSessionState("active");
  }

  function recordStepResult(title: string, correct: boolean, correctAnswerText: string) {
    setResults((r) => [...r, { title, correct, correctAnswerText, elapsedSeconds: Math.max(0, elapsedSeconds - stepStartElapsed) }]);
    setShowingResult(true);
    if (stepIndex === STEP_COUNT - 1) setTimerRunning(false);
  }

  function answerQuestion(index: number) {
    if (questionSelected !== null) return;
    setQuestionSelected(index);
    recordStepResult("Board Question", index === question.correctIndex, question.choices[question.correctIndex]);
  }

  function revealTerm() {
    if (termRevealed) return;
    setTermRevealed(true);
    recordStepResult("Term of the Day", true, term.definition);
  }

  function answerCase(index: number) {
    if (caseSelected !== null) return;
    setCaseSelected(index);
    recordStepResult("Case of the Day", index === dayCase.correctIndex, dayCase.options[dayCase.correctIndex]);
  }

  function nextStep() {
    if (stepIndex === STEP_COUNT - 1) {
      setSessionState("complete");
      return;
    }
    setStepStartElapsed(elapsedSeconds);
    setShowingResult(false);
    setStepIndex((i) => i + 1);
  }

  function handleDone() {
    if (doneClicked || questionSelected === null || caseSelected === null || results.length < STEP_COUNT) return;
    setDoneClicked(true);
    setFinishedNow(true);
    startTransition(() => {
      recordBoardQuestionAction(dateKey, questionSelected, results[0].elapsedSeconds);
      recordBoardTermRevealAction(dateKey, results[1].elapsedSeconds);
      recordCaseOfDayAction(dateKey, [caseSelected], caseSelected, caseSelected === dayCase.correctIndex ? "correct-first" : "wrong", results[2].elapsedSeconds);
      recordSharpeningTargetAction(elapsedSeconds);
    });
  }

  // — idle —
  if (sessionState === "idle") {
    if (alreadyComplete || finishedNow) {
      return (
        <div className="card elev-sm sharpen-done-card">
          <div className="sharpen-done-title">Today&rsquo;s sharpening is done.</div>
          <p className="sharpen-done-body">Come back tomorrow.</p>
        </div>
      );
    }
    return (
      <button type="button" className="card elev-sm sharpen-dose-card" onClick={() => setSessionState("preview")}>
        <div className="card-kicker">Daily Dose</div>
        <div className="sharpen-dose-title">3 board-level questions, one from each category</div>
        <div className="sharpen-dose-meta">
          <span>Board Question</span>
          <span>Term of the Day</span>
          <span>Case of the Day</span>
        </div>
        <div className="sharpen-dose-footer">
          <span className="sharpen-dose-target">Beat your time: {formatElapsed(targetSeconds)}</span>
          <span className="sharpen-intro-card-hint">Tap to begin →</span>
        </div>
      </button>
    );
  }

  // — preview —
  if (sessionState === "preview") {
    const isPersonalTarget = targetSeconds !== NPTE_THREE_QUESTION_BENCHMARK_SECONDS;
    return (
      <div className="card elev-sm">
        <div className="sharpen-preview-title">Daily Sharpening Session</div>
        <p className="sharpen-preview-subtitle">3 board-level questions, one from each category</p>
        <div className="dashboard-metrics-row">
          <div className="dashboard-metric-tile">
            <div className="card-kicker">Questions</div>
            <div className="dashboard-metric-value">3</div>
          </div>
          <div className="dashboard-metric-tile">
            <div className="card-kicker">NPTE avg time</div>
            <div className="dashboard-metric-value">1.4 min</div>
          </div>
          <div className="dashboard-metric-tile">
            <div className="card-kicker">Beat your time</div>
            <div className="dashboard-metric-value">{formatElapsed(targetSeconds)}</div>
          </div>
        </div>
        <p className="sharpen-preview-desc">
          Each session includes one board question, one clinical term, and one case scenario, mirroring the structure of the
          NPTE. Your timer starts when you begin and keeps running the whole session, the NPTE&rsquo;s recommended pace for 3
          questions is {formatElapsed(NPTE_THREE_QUESTION_BENCHMARK_SECONDS)}
          {isPersonalTarget ? `, but today's target is ${formatElapsed(targetSeconds)}, your own time to beat from a slower day. Get under the real benchmark and it resets.` : "."}
        </p>
        <button type="button" className="btn btn-primary sharpen-begin-btn" onClick={beginSession}>
          Begin Session
        </button>
        <p className="sharpen-preview-footnote">Complete all three to mark today&rsquo;s sharpening as done</p>
      </div>
    );
  }

  // — active —
  if (sessionState === "active") {
    const currentResult = showingResult ? results[stepIndex] : null;
    const explanation = stepIndex === 0 ? question.explanation : stepIndex === 1 ? (term.memoryAid ?? "Definition revealed.") : dayCase.explanation;
    const overTime = elapsedSeconds > targetSeconds;

    return (
      <div>
        <div className="sharpen-active-header">
          <div className={`sharpen-timer${overTime ? " sharpen-timer--over" : ""}`}>{formatElapsed(elapsedSeconds)}</div>
          {overTime && <div className="sharpen-timer-over-label">Over time: target was {formatElapsed(targetSeconds)}</div>}
          <div className="sharpen-progress-row">
            <div className="sharpen-progress-label">
              Question {stepIndex + 1} of {STEP_COUNT}
            </div>
            <div className="sharpen-progress-dots">
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <span
                  key={i}
                  className={`sharpen-progress-dot${i < results.length ? " sharpen-progress-dot--done" : i === stepIndex ? " sharpen-progress-dot--current" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card elev-sm">
          {stepIndex === 0 && (
            <>
              <div className="card-kicker">Question · {question.domain}</div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "6px 0 12px" }}>{question.question}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {question.choices.map((choice, i) => {
                  const isCorrect = i === question.correctIndex;
                  const isSelected = i === questionSelected;
                  let className = "btn btn-secondary";
                  if (questionSelected !== null && isCorrect) className = "btn btn-primary";
                  return (
                    <button
                      key={i}
                      type="button"
                      className={className}
                      disabled={questionSelected !== null}
                      onClick={() => answerQuestion(i)}
                      style={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        opacity: questionSelected !== null && !isCorrect && !isSelected ? 0.6 : 1,
                        border: questionSelected !== null && isSelected && !isCorrect ? "1.5px solid var(--color-accent-700)" : undefined,
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {stepIndex === 1 && (
            <>
              <div className="card-kicker">Term of the Day</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, margin: "6px 0" }}>{term.term}</div>
              {!termRevealed ? (
                <button type="button" className="btn btn-primary" onClick={revealTerm}>
                  Reveal Definition
                </button>
              ) : (
                <>
                  <p style={{ fontSize: 14, margin: "0 0 6px" }}>{term.definition}</p>
                  {term.memoryAid && (
                    <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", fontStyle: "italic", margin: 0 }}>{term.memoryAid}</p>
                  )}
                </>
              )}
            </>
          )}

          {stepIndex === 2 && (
            <>
              <div className="card-kicker">
                {dayCase.specialty} · Case of the Day
              </div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: "6px 0 12px" }}>
                {dayCase.patientAge}-year-old {dayCase.patientSex}, {dayCase.chiefComplaint}
              </p>
              <div className="case-section">
                <div className="case-section-title">History</div>
                <ul className="case-bullet-list">
                  {dayCase.history.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
              <div className="case-section">
                <div className="case-section-title">Key Findings</div>
                <ul className="case-bullet-list">
                  {dayCase.keyFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="case-section-title">{dayCase.question}</div>
              <div className="case-option-list">
                {dayCase.options.map((option, i) => {
                  let cls = "case-option";
                  if (caseSelected !== null) {
                    if (i === dayCase.correctIndex) cls += " case-option-correct";
                    else if (i === caseSelected) cls += " case-option-wrong";
                  }
                  return (
                    <button key={i} type="button" className={cls} disabled={caseSelected !== null} onClick={() => answerCase(i)}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {showingResult && currentResult && (
            <>
              <div className={`sharpen-result-banner${currentResult.correct ? " sharpen-result-banner--correct" : " sharpen-result-banner--incorrect"}`}>
                {currentResult.correct ? "Correct" : "Incorrect"}
              </div>
              <p className="sharpen-result-explanation">{explanation}</p>
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                {stepIndex === STEP_COUNT - 1 ? "See Results" : "Next Question"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // — complete —
  const correctCount = results.filter((r) => r.correct).length;
  const avgSeconds = Math.round(elapsedSeconds / STEP_COUNT);
  const allCorrect = correctCount === STEP_COUNT;
  const beatBenchmark = elapsedSeconds < NPTE_THREE_QUESTION_BENCHMARK_SECONDS;

  return (
    <div className="card elev-sm">
      <div className="sharpen-summary-time">Completed in {formatElapsed(elapsedSeconds)}</div>
      <p className="sharpen-summary-score">
        Score: {correctCount} out of {STEP_COUNT} correct
      </p>
      {allCorrect && <span className="sharpen-perfect-badge">Perfect Session</span>}
      <p className="sharpen-summary-context">
        The NPTE allows ~1.4 minutes per question. Your average: {avgSeconds} second{avgSeconds === 1 ? "" : "s"} per question.
      </p>
      <p className={`sharpen-summary-target${beatBenchmark ? " sharpen-summary-target--beat" : ""}`}>
        {beatBenchmark
          ? `You beat the NPTE benchmark of ${formatElapsed(NPTE_THREE_QUESTION_BENCHMARK_SECONDS)}. Tomorrow's target resets to the benchmark.`
          : `Tomorrow's target to beat: ${formatElapsed(elapsedSeconds)}; get under the NPTE benchmark of ${formatElapsed(NPTE_THREE_QUESTION_BENCHMARK_SECONDS)} to reset it.`}
      </p>
      <div className="sharpen-breakdown-list">
        {results.map((r, i) => (
          <div key={i} className="sharpen-breakdown-item">
            <div className="sharpen-breakdown-row">
              <div className="sharpen-breakdown-title">{r.title}</div>
              <div className={`sharpen-breakdown-status${r.correct ? " sharpen-breakdown-status--correct" : " sharpen-breakdown-status--incorrect"}`}>
                {r.correct ? "Correct" : "Incorrect"}
              </div>
            </div>
            <p className="sharpen-breakdown-answer">Correct answer: {r.correctAnswerText}</p>
          </div>
        ))}
      </div>
      <div className="sharpen-summary-actions">
        <ShareCompletionButton
          nexusOptIn={nexusOptIn}
          body={`Completed today's Limbic Boards Daily Sharpening, ${correctCount}/${STEP_COUNT} correct in ${formatElapsed(elapsedSeconds)}.`}
        />
        <button type="button" className="btn btn-primary" disabled={doneClicked} onClick={handleDone}>
          {doneClicked ? "Saved" : "Done"}
        </button>
      </div>
    </div>
  );
}
