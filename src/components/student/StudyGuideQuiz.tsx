"use client";

import { useState } from "react";
import { recordStudyCardResult, type StudyCardData } from "@/app/actions/study-guide";

/** Priority order for a fresh Self-Quiz round — cards never quizzed, then ones missed last
 *  time, then ones already known, each bucket lightly shuffled so the same card doesn't
 *  always lead. Not a real spaced-repetition scheduler, just "show me what I don't know
 *  first" — see recordStudyCardResult in app/actions/study-guide.ts for how lastResult is
 *  set. */
function quizOrder(cards: StudyCardData[]): StudyCardData[] {
  const rank = (c: StudyCardData) => (c.lastResult === "incorrect" ? 0 : c.lastResult === null ? 1 : 2);
  return [...cards].map((c) => ({ c, sort: rank(c) + Math.random() })).sort((a, b) => a.sort - b.sort).map((x) => x.c);
}

/** Self-Quiz page for one course (see
 *  app/(app)/student/study-guide/[syllabusId]/quiz/page.tsx) — reviews the course's existing
 *  StudyCard deck, so this page was unaffected by removing "create" from the Study Guide
 *  pages (see StudyGuideFlashcards.tsx's own doc comment): a quiz session only ever reads
 *  and grades cards, it doesn't add any. */
export function StudyGuideQuiz({ courseCode, cards }: { courseCode: string; cards: StudyCardData[] }) {
  const [session, setSession] = useState<StudyCardData[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  function startQuiz() {
    setSession(quizOrder(cards));
    setIndex(0);
    setRevealed(false);
    setScore({ correct: 0, total: 0 });
  }

  function grade(correct: boolean) {
    if (!session) return;
    void recordStudyCardResult(session[index].id, correct);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  if (cards.length === 0) {
    return <p className="atrium-dashboard-empty">Add a few flashcards first (via Study Guide Creator), then come back here to self-quiz on {courseCode}.</p>;
  }

  if (!session) {
    return (
      <div>
        <p className="atrium-dashboard-empty" style={{ marginBottom: 12 }}>
          {cards.length} card{cards.length === 1 ? "" : "s"} in this deck. Cards you missed last time come up first.
        </p>
        <button type="button" className="btn btn-primary" onClick={startQuiz}>
          Start Self-Quiz
        </button>
      </div>
    );
  }

  if (index >= session.length) {
    return (
      <div className="study-guide-quiz-summary">
        <p className="study-guide-quiz-summary-score">
          {score.correct} / {score.total} correct
        </p>
        <button type="button" className="btn btn-primary" onClick={startQuiz}>
          Quiz again
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setSession(null)} style={{ marginLeft: 8 }}>
          Back
        </button>
      </div>
    );
  }

  const card = session[index];
  return (
    <div className="study-guide-quiz-session">
      <div className="study-guide-flip-progress">
        Card {index + 1} of {session.length} · {score.correct}/{score.total} correct so far
      </div>
      <div className="study-guide-flip-card study-guide-flip-card--quiz">
        <span className="study-guide-flip-card-label">Question</span>
        <span className="study-guide-flip-card-text">{card.front}</span>
        {revealed && (
          <>
            <span className="study-guide-flip-card-label" style={{ marginTop: 14 }}>
              Answer
            </span>
            <span className="study-guide-flip-card-text">{card.back}</span>
          </>
        )}
      </div>
      {!revealed ? (
        <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
          Show Answer
        </button>
      ) : (
        <div className="study-guide-quiz-grade-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => grade(false)}>
            Missed it
          </button>
          <button type="button" className="btn btn-primary" onClick={() => grade(true)}>
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
