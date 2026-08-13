"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { recordHealthTriviaAction } from "@/app/actions/daily-completion";
import { ShareButton } from "@/components/ShareButton";
import { TriviaTopicIcon } from "@/components/TriviaTopicIcon";
import { CheckIcon, XIcon } from "@/components/icons";
import type { TriviaQuestion } from "@/lib/trivia-static";

const TOTAL = 5;

export function HealthTriviaGame({
  dateKey,
  questions,
  initialAnswers,
}: {
  dateKey: string;
  questions: TriviaQuestion[];
  /** Answers already recorded today, in question order — resuming picks up on the next
   *  unanswered question; a full 5-length array means today's round is already finished. */
  initialAnswers: number[];
}) {
  const [answers, setAnswers] = useState<number[]>(initialAnswers);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "results">(initialAnswers.length >= TOTAL ? "results" : "quiz");
  const [, startTransition] = useTransition();

  const currentIndex = answers.length;
  const currentQuestion = questions[currentIndex];

  function choose(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function reveal() {
    if (selected === null || revealed) return;
    setRevealed(true);
    const nextAnswers = [...answers, selected];
    const status = nextAnswers.length >= TOTAL ? "won" : "playing";
    startTransition(() => recordHealthTriviaAction(dateKey, nextAnswers, status));
  }

  function advance() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    setRevealed(false);
    if (nextAnswers.length >= TOTAL) setPhase("results");
  }

  if (phase === "results") {
    const score = answers.reduce((sum, a, i) => sum + (a === questions[i].correctIndex ? 1 : 0), 0);
    const dateLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const shareText = `Limbic Health Trivia, ${dateLabel}\nScore: ${score}/${TOTAL}\nlimbic.center/games/trivia`;

    return (
      <div className="screen-pad trivia-page">
        <div className="trivia-results">
          <div className="card-kicker">Health Trivia</div>
          <div className="trivia-results-score">
            {score} out of {TOTAL}
          </div>
          <div className="trivia-results-review">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex;
              return (
                <div key={q.id} className="trivia-review-row">
                  <span className={isCorrect ? "trivia-review-icon trivia-review-icon-correct" : "trivia-review-icon trivia-review-icon-incorrect"}>
                    {isCorrect ? <CheckIcon size={13} /> : <XIcon size={13} />}
                  </span>
                  <div>
                    <p className="trivia-review-question">{q.question}</p>
                    <p className="trivia-review-answer">{q.options[q.correctIndex]}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="trivia-results-actions">
            <ShareButton text={shareText} label="Share Results" className="btn btn-primary btn-block" />
            <Link href="/games" className="btn btn-secondary btn-block">
              Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLast = currentIndex === TOTAL - 1;

  return (
    <div className="screen-pad trivia-page">
      <div className="trivia-progress">
        <span>
          Question {currentIndex + 1} of {TOTAL}
        </span>
        <div className="trivia-progress-bar">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={`trivia-progress-dot${i <= currentIndex ? " trivia-progress-dot-active" : ""}`} />
          ))}
        </div>
      </div>

      <TriviaTopicIcon key={currentQuestion.id} topic={currentQuestion.topic} />

      <p className="trivia-question-text">{currentQuestion.question}</p>

      <div className="trivia-options">
        {currentQuestion.options.map((option, i) => {
          let cls = "trivia-option";
          if (!revealed) {
            if (selected === i) cls += " trivia-option-selected";
          } else if (i === currentQuestion.correctIndex) {
            cls += " trivia-option-correct";
          } else if (i === selected) {
            cls += " trivia-option-incorrect";
          }
          return (
            <button key={i} type="button" className={cls} disabled={revealed} onClick={() => choose(i)}>
              {option}
            </button>
          );
        })}
      </div>

      {!revealed && selected !== null && (
        <button type="button" className="btn btn-primary btn-block" onClick={reveal}>
          Reveal Answer
        </button>
      )}

      {revealed && (
        <>
          <p className="trivia-explanation">{currentQuestion.explanation}</p>
          <button type="button" className="btn btn-primary btn-block" onClick={advance}>
            {isLast ? "Show Results" : "Next Question"}
          </button>
        </>
      )}
    </div>
  );
}
