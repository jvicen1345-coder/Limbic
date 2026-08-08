"use client";

import { useState } from "react";
import { useTransition } from "react";
import { recordHomeQuestionAction } from "@/app/actions/daily-completion";
import { CheckIcon } from "@/components/icons";
import type { HomeQuestion } from "@/lib/home-questions-static";

export interface HomeQuestionData {
  dateKey: string;
  question: HomeQuestion;
  /** This reader's answer for today, as persisted server-side — set once they've actually
   *  revealed the answer (not just picked one), so a page reload before revealing starts
   *  them fresh rather than pre-selecting a choice they never confirmed. */
  initialSelectedIndex: number | null;
}

/** Home's own general-audience "Question of the Day" — sits second in the right sidebar,
 *  right below Continue Reading (see components/HomeFeed.tsx). Distinct from Limbic
 *  Boards' student-facing daily question (see BoardQuestionCard.tsx): general-public
 *  content, no domain label, and a two-step select-then-reveal flow instead of revealing
 *  the instant a choice is picked — a reader can change their mind before committing. */
export function HomeQuestionCard({ data }: { data: HomeQuestionData }) {
  const { dateKey, question } = data;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(data.initialSelectedIndex);
  const [revealed, setRevealed] = useState(data.initialSelectedIndex !== null);
  const [, startTransition] = useTransition();

  function choose(index: number) {
    if (revealed) return;
    setSelectedIndex(index);
  }

  function reveal() {
    if (selectedIndex === null || revealed) return;
    setRevealed(true);
    startTransition(() => recordHomeQuestionAction(dateKey, selectedIndex));
  }

  return (
    <div className="card elev-sm">
      <div className="home-question-header">
        <div className="card-kicker">Question of the Day</div>
        {revealed && (
          <span className="home-question-completed">
            <CheckIcon size={11} />
            Completed
          </span>
        )}
      </div>
      <p className="home-question-text">{question.question}</p>
      <div className="home-question-options">
        {question.choices.map((choice, i) => {
          let stateClass = "";
          if (!revealed) {
            if (selectedIndex === i) stateClass = "home-question-option-selected";
          } else if (i === question.correctIndex) {
            stateClass = "home-question-option-correct";
          } else if (i === selectedIndex) {
            stateClass = "home-question-option-incorrect";
          }
          return (
            <button
              key={i}
              type="button"
              className={`home-question-option${stateClass ? ` ${stateClass}` : ""}`}
              onClick={() => choose(i)}
              disabled={revealed}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {!revealed && selectedIndex !== null && (
        <button type="button" className="btn btn-primary btn-block" onClick={reveal}>
          Reveal Answer
        </button>
      )}
      {revealed && <p className="home-question-explanation">{question.explanation}</p>}
    </div>
  );
}
