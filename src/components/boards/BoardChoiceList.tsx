"use client";

/** The multiple-choice answer list for a board question, shared by the two places one is
 *  rendered: Daily Sharpening's first step (components/DailySharpeningSession.tsx) and the
 *  standalone Question of the Day card a licensed clinician gets instead of the full
 *  student hub (components/BoardQuestionCard.tsx). The two had drifted — the standalone
 *  card marked the picked-and-wrong choice with a ✕ and the right one with a ✓, the
 *  session showed neither — so the same question looked like a different question
 *  depending on which surface a reader hit it from. */
export function BoardChoiceList({
  choices,
  correctIndex,
  selectedIndex,
  onSelect,
}: {
  choices: string[];
  correctIndex: number;
  /** Null until answered; once set, every choice is disabled and graded. */
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  const answered = selectedIndex !== null;

  return (
    <div className="board-choice-list">
      {choices.map((choice, i) => {
        const isCorrect = i === correctIndex;
        const isSelected = i === selectedIndex;
        const isWrongPick = answered && isSelected && !isCorrect;
        return (
          <button
            key={i}
            type="button"
            className={`btn ${answered && isCorrect ? "btn-primary" : "btn-secondary"} board-choice${
              isWrongPick ? " board-choice--wrong" : ""
            }${answered && !isCorrect && !isSelected ? " board-choice--dimmed" : ""}`}
            onClick={() => onSelect(i)}
            disabled={answered}
          >
            <span>{choice}</span>
            {answered && isCorrect && (
              <span className="board-choice-mark" aria-label="Correct answer">
                ✓
              </span>
            )}
            {isWrongPick && (
              <span className="board-choice-mark" aria-label="Your answer, incorrect">
                ✕
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
