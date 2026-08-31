"use client";

import { useEffect, useState, useTransition } from "react";
import {
  recordBoardQuestionAction,
  recordBoardTermRevealAction,
  recordCaseOfDayAction,
  recordSharpeningTargetAction,
} from "@/app/actions/daily-completion";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";
import { BoardChoiceList } from "@/components/boards/BoardChoiceList";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
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

/** What of today's session is already on file, from the three DailyCompletion rows (see
 *  app/(app)/boards/page.tsx). Each step is written the moment it's answered, so a partly
 *  filled shape here is the normal state of a session someone walked away from mid-way. */
export interface SavedSharpeningProgress {
  question: { selectedIndex: number; elapsedSeconds: number } | null;
  term: { elapsedSeconds: number } | null;
  dayCase: { selectedIndex: number; elapsedSeconds: number } | null;
}

/** Replaces the old three-independent-cards Daily Sharpening (Board Question, Term of the
 *  Day, Case of the Day each opening and completing on their own) with one unified,
 *  timed, forward-only session — see /boards/page.tsx. Term of the Day keeps its existing
 *  reveal-only mechanic (no new fill-in-the-blank grading) rather than becoming a
 *  multiple-choice question — a reveal always counts as "correct" for the session score,
 *  the same as it always counted as simply "done" before this redesign; only the question
 *  and case steps have a real wrong answer.
 *
 *  Each step's DailyCompletion row is written as that step is answered. It used to be all
 *  three at once on the summary screen's "Done" click, which meant answering everything
 *  and then closing the tab — or losing the connection — recorded nothing at all: no
 *  completion, no streak, no activity row for a session the reader had actually finished.
 *  "Done" now only dismisses the summary; nothing depends on it being clicked. The same
 *  change is what makes resuming possible, since a half-finished session is now readable
 *  back off those rows (see SavedSharpeningProgress and resumeFrom below). */
export function DailySharpeningSession({
  dateKey,
  question,
  term,
  dayCase,
  alreadyComplete,
  saved,
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
  /** Today's partial progress, if any — see SavedSharpeningProgress. */
  saved: SavedSharpeningProgress;
  /** Today's "beat the clock" pacing target in seconds — the standard NPTE 3-question
   *  benchmark unless a previous session ran over it, in which case that session's own time
   *  becomes the target until a session finally beats the real benchmark again (see
   *  User.boardsSharpeningTargetSeconds, recordSharpeningTargetAction). */
  targetSeconds: number;
  nexusOptIn: boolean;
}) {
  /** Rebuilds the in-memory session from whatever is already persisted for today, so a
   *  refresh (or a phone locking mid-session) picks up at the next unanswered step with
   *  the clock where it left off, instead of restarting a session the reader is partway
   *  through and re-asking questions they already answered. Steps are strictly ordered, so
   *  the resume point is just the first one with no row. */
  function resumeFrom(): { results: StepResult[]; elapsedMs: number } | null {
    const results: StepResult[] = [];
    if (saved.question) {
      results.push({
        title: "Board Question",
        correct: saved.question.selectedIndex === question.correctIndex,
        correctAnswerText: question.choices[question.correctIndex],
        elapsedSeconds: saved.question.elapsedSeconds,
      });
    }
    if (saved.question && saved.term) {
      results.push({ title: "Term of the Day", correct: true, correctAnswerText: term.definition, elapsedSeconds: saved.term.elapsedSeconds });
    }
    if (saved.question && saved.term && saved.dayCase) {
      results.push({
        title: "Case of the Day",
        correct: saved.dayCase.selectedIndex === dayCase.correctIndex,
        correctAnswerText: dayCase.options[dayCase.correctIndex],
        elapsedSeconds: saved.dayCase.elapsedSeconds,
      });
    }
    if (results.length === 0 || results.length === STEP_COUNT) return null;
    return { results, elapsedMs: results.reduce((sum, r) => sum + r.elapsedSeconds, 0) * 1000 };
  }

  const [resumed] = useState(resumeFrom);

  const [sessionState, setSessionState] = useState<SessionState>(resumed ? "active" : "idle");
  const [finishedNow, setFinishedNow] = useState(false);
  const [doneClicked, setDoneClicked] = useState(false);
  const [, startTransition] = useTransition();

  const [stepIndex, setStepIndex] = useState(resumed?.results.length ?? 0);
  const [showingResult, setShowingResult] = useState(false);
  const [results, setResults] = useState<StepResult[]>(resumed?.results ?? []);

  // The clock is kept as two pieces rather than a counter incremented once a second: time
  // banked from steps already finished, plus the wall-clock delta since the current step
  // started. A per-tick counter drifts, and browsers throttle background-tab intervals to
  // roughly once a minute, so a reader who switched tabs mid-question used to come back
  // with a total far short of the time they'd actually taken — while that total is what
  // gets compared against the NPTE benchmark and saved as tomorrow's target. Deriving from
  // timestamps means a missed tick costs nothing: the next one computes the true elapsed.
  const [accumulatedMs, setAccumulatedMs] = useState(resumed?.elapsedMs ?? 0);
  // A resumed session's clock starts at mount — there's no "Begin" click to start it from,
  // the reader is already mid-session. Same read-the-clock-once-on-mount initializer as
  // BoardQuestionCard's own `startedAt`.
  const [runStartMs, setRunStartMs] = useState<number | null>(() => (resumed ? nowMs() : null));
  const [elapsedMs, setElapsedMs] = useState(resumed?.elapsedMs ?? 0);
  const [stepStartMs, setStepStartMs] = useState(resumed?.elapsedMs ?? 0);

  const [questionSelected, setQuestionSelected] = useState<number | null>(null);
  const [termRevealed, setTermRevealed] = useState(false);
  const [caseSelected, setCaseSelected] = useState<number | null>(null);

  const elapsedSeconds = Math.round(elapsedMs / 1000);

  useEffect(() => {
    if (runStartMs === null) return;
    const id = window.setInterval(() => setElapsedMs(accumulatedMs + (Date.now() - runStartMs)), 250);
    return () => window.clearInterval(id);
  }, [runStartMs, accumulatedMs]);

  /** Stops the clock and returns the true total in ms at this instant. The clock runs only
   *  while a question is on screen: it's paused the moment an answer lands and restarted
   *  on "Next", so reading an explanation doesn't count toward a total that's measured
   *  against the NPTE's own answering pace. It used to keep running through explanations
   *  for the first two steps but not the third (the timer stopped at the last answer),
   *  which made the total neither answering time nor total time on the page. */
  function pauseClock(): number {
    const total = accumulatedMs + (runStartMs === null ? 0 : nowMs() - runStartMs);
    setAccumulatedMs(total);
    setElapsedMs(total);
    setRunStartMs(null);
    return total;
  }

  function beginSession() {
    setStepIndex(0);
    setShowingResult(false);
    setResults([]);
    setAccumulatedMs(0);
    setElapsedMs(0);
    setStepStartMs(0);
    setRunStartMs(nowMs());
    setQuestionSelected(null);
    setTermRevealed(false);
    setCaseSelected(null);
    setSessionState("active");
  }

  /** Banks the step's time, records the result, and persists it. `persist` is the step's
   *  own server action, called with the seconds that step took. */
  function completeStep(title: string, correct: boolean, correctAnswerText: string, persist: (stepSeconds: number) => void) {
    const totalMs = pauseClock();
    const stepSeconds = Math.max(0, Math.round((totalMs - stepStartMs) / 1000));
    const nextResults = [...results, { title, correct, correctAnswerText, elapsedSeconds: stepSeconds }];
    setResults(nextResults);
    setShowingResult(true);
    startTransition(() => {
      persist(stepSeconds);
      // The last step ends the session for pacing purposes, so tomorrow's target is set
      // here rather than on the summary screen's Done click — the reader who closes the
      // tab on the summary has still finished, and their time should still count.
      if (nextResults.length === STEP_COUNT) recordSharpeningTargetAction(Math.round(totalMs / 1000));
    });
  }

  function answerQuestion(index: number) {
    if (questionSelected !== null) return;
    setQuestionSelected(index);
    completeStep("Board Question", index === question.correctIndex, question.choices[question.correctIndex], (s) =>
      recordBoardQuestionAction(dateKey, index, s, question.id)
    );
  }

  function revealTerm() {
    if (termRevealed) return;
    setTermRevealed(true);
    completeStep("Term of the Day", true, term.definition, (s) => recordBoardTermRevealAction(dateKey, s, term.id));
  }

  function answerCase(index: number) {
    if (caseSelected !== null) return;
    setCaseSelected(index);
    completeStep("Case of the Day", index === dayCase.correctIndex, dayCase.options[dayCase.correctIndex], (s) =>
      recordCaseOfDayAction(dateKey, [index], index, index === dayCase.correctIndex ? "correct-first" : "wrong", s)
    );
  }

  function nextStep() {
    if (stepIndex === STEP_COUNT - 1) {
      setSessionState("complete");
      return;
    }
    setStepStartMs(elapsedMs);
    setRunStartMs(nowMs());
    setShowingResult(false);
    setStepIndex((i) => i + 1);
  }

  function handleDone() {
    setDoneClicked(true);
    setFinishedNow(true);
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
    // A personal target only exists once a previous session ran over the NPTE benchmark
    // (see recordSharpeningTargetAction, app/actions/daily-completion.ts — it resets
    // boardsSharpeningTargetSeconds back to null the moment a session beats the real
    // benchmark). So targetSeconds differing from the benchmark is exactly "this reader
    // has a personal best on record to beat" — no separate fetch needed for that signal.
    const hasPersonalBest = targetSeconds !== NPTE_THREE_QUESTION_BENCHMARK_SECONDS;
    return (
      <button type="button" className="card elev-sm sharpen-dose-card" onClick={() => setSessionState("preview")}>
        <div className="card-kicker">Daily Dose</div>
        <div className="sharpen-dose-title">3 board-level questions, one from each category</div>
        <div className="sharpen-dose-meta">
          <span>Board Question</span>
          <span>Term of the Day</span>
          <span>Case of the Day</span>
        </div>
        {hasPersonalBest && (
          <div className="sharpen-challenge-card">
            <div className="sharpen-challenge-label">Today&rsquo;s Challenge</div>
            <div className="sharpen-challenge-value">Beat your best time — {formatElapsed(targetSeconds)}</div>
          </div>
        )}
        <span className="sharpen-intro-card-hint">Tap to begin →</span>
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
          NPTE. The timer runs while a question is on screen and pauses while you read the explanation, so it measures your
          answering pace — the NPTE&rsquo;s recommended pace for 3 questions is {formatElapsed(NPTE_THREE_QUESTION_BENCHMARK_SECONDS)}
          {isPersonalTarget ? `, but today's target is ${formatElapsed(targetSeconds)}, your own time to beat from a slower day. Get under the real benchmark and it resets.` : "."}
        </p>
        <button type="button" className="btn btn-primary sharpen-begin-btn" onClick={beginSession}>
          Begin Session
        </button>
        <p className="sharpen-preview-footnote">Each question is saved as you answer it — you can stop and pick up where you left off</p>
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
          <div className={`sharpen-timer${overTime ? " sharpen-timer--over" : ""}`} role="timer" aria-live="off">
            {formatElapsed(elapsedSeconds)}
          </div>
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
              <BoardChoiceList
                choices={question.choices}
                correctIndex={question.correctIndex}
                selectedIndex={questionSelected}
                onSelect={answerQuestion}
              />
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
