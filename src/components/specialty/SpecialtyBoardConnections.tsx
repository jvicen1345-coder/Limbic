"use client";

import { useEffect, useState } from "react";
import type { BoardQuestion } from "@/lib/board-content";
import { getSpecialtyAnswers, saveSpecialtyAnswer } from "@/app/actions/specialty-questions";

interface SavedAnswer {
  selectedAnswer: string;
  isCorrect: boolean;
}

/** One question in the "Board-Level Questions for This Specialty" preview — click-to-reveal,
 *  same correct/incorrect styling convention as components/BoardQuestionCard.tsx, just
 *  without that card's timing/streak/share machinery, since this is a specialty page's
 *  static sample rather than a tracked daily attempt. Purely presentational — SpecialtyBoard
 *  Connections below owns whether a question is answered and fires the save. */
function SpecialtyQuestionPreview({
  question,
  savedAnswer,
  onSelect,
}: {
  question: BoardQuestion;
  savedAnswer: SavedAnswer | undefined;
  onSelect: (choiceIndex: number) => void;
}) {
  const answered = savedAnswer !== undefined;
  const selectedIndex = answered ? question.choices.findIndex((c) => c === savedAnswer.selectedAnswer) : -1;

  return (
    <div className="specialty-question-card">
      <p className="specialty-question-text">{question.question}</p>
      <div className="specialty-question-options">
        {question.choices.map((choice, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selectedIndex;
          let stateClass = "";
          if (answered && isCorrect) stateClass = "specialty-question-option--correct";
          else if (answered && isSelected) stateClass = "specialty-question-option--incorrect";
          return (
            <button
              key={choice}
              type="button"
              className={`specialty-question-option ${stateClass}`}
              disabled={answered}
              onClick={() => onSelect(i)}
            >
              {choice}
              {answered && isCorrect && " ✓"}
              {answered && isSelected && !isCorrect && " ✕"}
            </button>
          );
        })}
      </div>
      {answered && <p className="specialty-question-explanation">{question.explanation}</p>}
    </div>
  );
}

/** Wraps the specialty page's static `questions` (see lib/board-content.ts
 *  questionsForSpecialty) with today's saved answers (app/actions/specialty-questions.ts) —
 *  loaded once on mount, then updated optimistically the moment a reader picks a choice, so
 *  there's no save button and no wait on the round-trip before the card flips to its
 *  correct/incorrect state. questionIndex is just each question's position in `questions`,
 *  which is a stable filter over a static array, so it doesn't shift day to day. */
export function SpecialtyBoardConnections({ specialty, questions }: { specialty: string; questions: BoardQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, SavedAnswer> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSpecialtyAnswers(specialty).then((rows) => {
      if (cancelled) return;
      const map: Record<number, SavedAnswer> = {};
      for (const r of rows) map[r.questionIndex] = { selectedAnswer: r.selectedAnswer, isCorrect: r.isCorrect };
      setAnswers(map);
    });
    return () => {
      cancelled = true;
    };
  }, [specialty]);

  const handleSelect = (questionIndex: number, choiceIndex: number) => {
    if (!answers || answers[questionIndex]) return;
    const question = questions[questionIndex];
    const selectedAnswer = question.choices[choiceIndex];
    const isCorrect = choiceIndex === question.correctIndex;
    setAnswers((prev) => ({ ...(prev ?? {}), [questionIndex]: { selectedAnswer, isCorrect } }));
    void saveSpecialtyAnswer(specialty, questionIndex, selectedAnswer, isCorrect).catch((err) => {
      console.error("[SpecialtyBoardConnections] failed to save answer:", err);
    });
  };

  if (questions.length === 0) {
    return <p className="specialty-table-note">No specialty-tagged questions yet — check Daily Sharpening for today&rsquo;s question.</p>;
  }

  if (answers === null) {
    return <p className="specialty-table-note">Loading today&rsquo;s questions&hellip;</p>;
  }

  return (
    <>
      {questions.map((q, index) => (
        <SpecialtyQuestionPreview
          key={q.id}
          question={q}
          savedAnswer={answers[index]}
          onSelect={(choiceIndex) => handleSelect(index, choiceIndex)}
        />
      ))}
    </>
  );
}
