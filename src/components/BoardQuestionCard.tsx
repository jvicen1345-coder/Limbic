"use client";

import { useState } from "react";
import { recordBoardQuestionAction } from "@/app/actions/daily-completion";
import { formatElapsed } from "@/lib/meta";
import { nowMs } from "@/lib/clock";
import { ShareCompletionButton } from "@/components/ShareCompletionButton";
import type { BoardQuestion } from "@/lib/board-content";

export function BoardQuestionCard({
  dateKey,
  question,
  initialSelectedIndex,
  initialElapsedSeconds,
  nexusOptIn,
}: {
  dateKey: string;
  question: BoardQuestion;
  /** This user's answer for today, as persisted server-side — replaces what used to be an
   *  unscoped "limbic:boards-question:<dateKey>" localStorage key shared by every account
   *  on the same browser. Null if they haven't answered yet today. */
  initialSelectedIndex: number | null;
  initialElapsedSeconds: number | null;
  nexusOptIn: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(initialSelectedIndex);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(initialElapsedSeconds);
  const [startedAt] = useState(() => nowMs());

  const answered = selectedIndex !== null;
  const isCorrectAnswer = selectedIndex === question.correctIndex;

  function choose(index: number) {
    if (answered) return;
    const elapsed = Math.round((nowMs() - startedAt) / 1000);
    setSelectedIndex(index);
    setElapsedSeconds(elapsed);
    recordBoardQuestionAction(dateKey, index, elapsed);
  }

  return (
    <div className="card elev-sm">
      <div className="card-kicker">Question of the day · {question.domain}</div>
      <p style={{ fontSize: 15, fontWeight: 600, margin: "6px 0 12px" }}>{question.question}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.choices.map((choice, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selectedIndex;
          let className = "btn btn-secondary";
          if (answered && isCorrect) className = "btn btn-primary";
          else if (answered && isSelected && !isCorrect) className = "btn btn-secondary";
          return (
            <button
              key={i}
              type="button"
              className={className}
              onClick={() => choose(i)}
              disabled={answered}
              style={{
                justifyContent: "flex-start",
                textAlign: "left",
                opacity: answered && !isCorrect && !isSelected ? 0.6 : 1,
                border:
                  answered && isSelected && !isCorrect ? "1.5px solid var(--color-accent-700)" : undefined,
              }}
            >
              {choice}
              {answered && isSelected && !isCorrect && " ✕"}
              {answered && isCorrect && " ✓"}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "12px 0 0" }}>{question.explanation}</p>
          {elapsedSeconds != null && (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
              Time: <strong>{formatElapsed(elapsedSeconds)}</strong>
            </p>
          )}
          <div style={{ marginTop: 12 }}>
            <ShareCompletionButton
              nexusOptIn={nexusOptIn}
              body={
                isCorrectAnswer
                  ? `Answered today's Limbic Boards question correctly${elapsedSeconds != null ? ` in ${formatElapsed(elapsedSeconds)}` : ""} ⚡`
                  : `Took a swing at today's Limbic Boards question${elapsedSeconds != null ? ` (${formatElapsed(elapsedSeconds)})` : ""}, locking in the right answer for next time.`
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
