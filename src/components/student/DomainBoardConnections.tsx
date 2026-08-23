"use client";

import { useEffect, useState } from "react";
import type { BoardQuestion } from "@/lib/board-content";
import { getDomainAnswers, saveDomainAnswer } from "@/app/actions/domain-questions";

interface SavedAnswer {
  selectedAnswer: string;
  isCorrect: boolean;
}

/** One question in a domain's practice page — click-to-reveal, identical shape and
 *  correct/incorrect styling to SpecialtyQuestionPreview in
 *  components/specialty/SpecialtyBoardConnections.tsx (reuses the same .specialty-question-*
 *  CSS since it's the same visual pattern, just a different filter over the same question
 *  bank — see lib/board-content.ts questionsForDomain vs questionsForSpecialty). */
function DomainQuestionPreview({
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

/** Wraps a domain practice page's static `questions` (see lib/board-content.ts
 *  questionsForDomain) with today's saved answers (app/actions/domain-questions.ts) — same
 *  "load once, update optimistically on pick, no save button" flow as
 *  SpecialtyBoardConnections. questionIndex is each question's position in `questions`, a
 *  stable filter over a static array. */
export function DomainBoardConnections({ domain, questions }: { domain: string; questions: BoardQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, SavedAnswer> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDomainAnswers(domain).then((rows) => {
      if (cancelled) return;
      const map: Record<number, SavedAnswer> = {};
      for (const r of rows) map[r.questionIndex] = { selectedAnswer: r.selectedAnswer, isCorrect: r.isCorrect };
      setAnswers(map);
    });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  const handleSelect = (questionIndex: number, choiceIndex: number) => {
    if (!answers || answers[questionIndex]) return;
    const question = questions[questionIndex];
    const selectedAnswer = question.choices[choiceIndex];
    const isCorrect = choiceIndex === question.correctIndex;
    setAnswers((prev) => ({ ...(prev ?? {}), [questionIndex]: { selectedAnswer, isCorrect } }));
    void saveDomainAnswer(domain, questionIndex, selectedAnswer, isCorrect).catch((err) => {
      console.error("[DomainBoardConnections] failed to save answer:", err);
    });
  };

  if (questions.length === 0) {
    return <p className="specialty-table-note">No questions tagged for this domain yet.</p>;
  }

  if (answers === null) {
    return <p className="specialty-table-note">Loading today&rsquo;s questions&hellip;</p>;
  }

  return (
    <>
      {questions.map((q, index) => (
        <DomainQuestionPreview
          key={q.id}
          question={q}
          savedAnswer={answers[index]}
          onSelect={(choiceIndex) => handleSelect(index, choiceIndex)}
        />
      ))}
    </>
  );
}
