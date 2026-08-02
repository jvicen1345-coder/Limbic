"use client";

import { useEffect, useState, useTransition } from "react";
import { recordBoardsActivityAction } from "@/app/actions/boards";
import type { BoardQuestion } from "@/lib/board-content";

interface StoredAnswer {
  selectedIndex: number;
}

export function BoardQuestionCard({ dateKey, question }: { dateKey: string; question: BoardQuestion }) {
  const storageKey = `limbic:boards-question:${dateKey}`;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Restores today's answer if the student already answered — same pattern as
  // WordleGame's localStorage restore (unavailable during SSR, so deferred to an effect).
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredAnswer;
        /* eslint-disable-next-line react-hooks/set-state-in-effect -- restoring today's
           saved answer from localStorage, which is unavailable during SSR */
        setSelectedIndex(parsed.selectedIndex);
      } catch {
        // corrupt/old-shape storage — just start fresh
      }
    }
  }, [storageKey]);

  const answered = selectedIndex !== null;

  function choose(index: number) {
    if (answered) return;
    setSelectedIndex(index);
    localStorage.setItem(storageKey, JSON.stringify({ selectedIndex: index } satisfies StoredAnswer));
    startTransition(() => {
      recordBoardsActivityAction(dateKey);
    });
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
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "12px 0 0" }}>{question.explanation}</p>
      )}
    </div>
  );
}
