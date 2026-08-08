"use client";

import { useState, useTransition } from "react";
import { recordCaseOfDayAction } from "@/app/actions/daily-completion";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import type { DailyCase } from "@/lib/cases-static";

export interface CaseOfDayCardInitialState {
  selectedIndex: number | null;
  elapsedSeconds: number | null;
}

/** Case of the Day, embedded as Daily Sharpening's third activity (see
 *  app/(app)/boards/sharpening/page.tsx) — a single select-then-reveal pass, unlike the
 *  two-attempt scored mechanic Case of the Day used back when it lived in Limbic Games.
 *  Still reuses the same cases-static.ts bank and the same DailyCompletion "caseOfDay"
 *  row shape (guesses/selectedIndex/status/elapsedSeconds) for storage compatibility —
 *  `attemptedIndexes` is always a single-element array here since there's only one try. */
export function CaseOfDayCard({
  dateKey,
  dayCase,
  initial,
  nexusOptIn,
}: {
  dateKey: string;
  dayCase: DailyCase;
  initial: CaseOfDayCardInitialState;
  nexusOptIn: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(initial.selectedIndex);
  const [revealed, setRevealed] = useState(initial.selectedIndex !== null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(initial.elapsedSeconds);
  const [startedAt] = useState(() => nowMs());
  const [, startTransition] = useTransition();

  function choose(index: number) {
    if (revealed) return;
    setSelectedIndex(index);
  }

  function reveal() {
    if (selectedIndex === null || revealed) return;
    const elapsed = Math.round((nowMs() - startedAt) / 1000);
    setRevealed(true);
    setElapsedSeconds(elapsed);
    const status = selectedIndex === dayCase.correctIndex ? "correct-first" : "wrong";
    startTransition(() => recordCaseOfDayAction(dateKey, [selectedIndex], selectedIndex, status, elapsed));
  }

  const isCorrect = selectedIndex === dayCase.correctIndex;

  return (
    <div className="card elev-sm">
      <div className="card-kicker">{dayCase.specialty} · Case of the Day</div>
      <p style={{ fontWeight: 600, fontSize: 15, margin: "6px 0 12px" }}>
        {dayCase.patientAge}-year-old {dayCase.patientSex} — {dayCase.chiefComplaint}
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
          if (!revealed) {
            if (selectedIndex === i) cls += " case-option-selected";
          } else if (i === dayCase.correctIndex) {
            cls += " case-option-correct";
          } else if (i === selectedIndex) {
            cls += " case-option-wrong";
          }
          return (
            <button key={i} type="button" className={cls} disabled={revealed} onClick={() => choose(i)}>
              {option}
            </button>
          );
        })}
      </div>

      {!revealed && selectedIndex !== null && (
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={reveal}>
          Reveal Answer
        </button>
      )}

      {revealed && (
        <div className="case-reveal">
          <p className="case-reveal-explanation">{dayCase.explanation}</p>
          {elapsedSeconds != null && (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 12px" }}>
              Time: <strong>{formatElapsed(elapsedSeconds)}</strong>
            </p>
          )}
          <ShareCompletionButton
            nexusOptIn={nexusOptIn}
            body={
              isCorrect
                ? `Got today's Limbic Case of the Day right${elapsedSeconds != null ? ` in ${formatElapsed(elapsedSeconds)}` : ""}.`
                : `Worked through today's Limbic Case of the Day${elapsedSeconds != null ? ` (${formatElapsed(elapsedSeconds)})` : ""} — locking in the right call for next time.`
            }
          />
        </div>
      )}
    </div>
  );
}
