"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createStudyCard,
  updateStudyCard,
  deleteStudyCard,
  recordStudyCardResult,
  updateStudyNotes,
  type StudyGuideCourse,
  type StudyCardData,
} from "@/app/actions/study-guide";
import { parseStudyNotes } from "@/lib/study-notes-markdown";
import { TrashIcon, ChevronRightIcon } from "@/components/icons";

type StudyTab = "flashcards" | "quiz" | "notes";

/** Priority order for a fresh Self-Quiz round — cards never quizzed, then ones missed last
 *  time, then ones already known, each bucket lightly shuffled so the same card doesn't
 *  always lead. Not a real spaced-repetition scheduler, just "show me what I don't know
 *  first" — see recordStudyCardResult in app/actions/study-guide.ts for how lastResult is
 *  set. */
function quizOrder(cards: StudyCardData[]): StudyCardData[] {
  const rank = (c: StudyCardData) => (c.lastResult === "incorrect" ? 0 : c.lastResult === null ? 1 : 2);
  return [...cards].map((c) => ({ c, sort: rank(c) + Math.random() })).sort((a, b) => a.sort - b.sort).map((x) => x.c);
}

function StudyNotesPreview({ content }: { content: string }) {
  const blocks = useMemo(() => parseStudyNotes(content), [content]);
  if (blocks.length === 0) return null;
  return (
    <div className="study-guide-notes-preview">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <div key={i} className="study-guide-notes-table-wrap">
            <table className="study-guide-notes-table">
              <thead>
                <tr>
                  {block.header.map((cell, j) => (
                    <th key={j}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p key={i} className="study-guide-notes-paragraph">
            {block.lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < block.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      )}
    </div>
  );
}

function FlashcardsTab({ course, cards, pending, onAdd, onEdit, onDelete }: {
  course: StudyGuideCourse;
  cards: StudyCardData[];
  pending: boolean;
  onAdd: (front: string, back: string) => void;
  onEdit: (id: string, front: string, back: string) => void;
  onDelete: (id: string) => void;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [studyIndex, setStudyIndex] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  function startEdit(card: StudyCardData) {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  function saveEdit() {
    if (!editingId) return;
    onEdit(editingId, editFront, editBack);
    setEditingId(null);
  }

  if (studyIndex !== null && cards.length > 0) {
    const card = cards[Math.min(studyIndex, cards.length - 1)];
    return (
      <div className="study-guide-flip-session">
        <div className="study-guide-flip-progress">
          Card {studyIndex + 1} of {cards.length}
        </div>
        <button type="button" className="study-guide-flip-card" onClick={() => setFlipped((f) => !f)}>
          <span className="study-guide-flip-card-label">{flipped ? "Back" : "Front"}</span>
          <span className="study-guide-flip-card-text">{flipped ? card.back : card.front}</span>
          <span className="study-guide-flip-card-hint">Tap to flip</span>
        </button>
        <div className="study-guide-flip-nav">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={studyIndex === 0}
            onClick={() => {
              setFlipped(false);
              setStudyIndex((i) => Math.max(0, (i ?? 0) - 1));
            }}
          >
            ← Prev
          </button>
          {studyIndex < cards.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFlipped(false);
                setStudyIndex((i) => (i ?? 0) + 1);
              }}
            >
              Next →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStudyIndex(null)}>
              Done
            </button>
          )}
        </div>
        <button type="button" className="study-guide-flip-exit" onClick={() => setStudyIndex(null)}>
          Exit
        </button>
      </div>
    );
  }

  return (
    <div>
      {cards.length > 0 && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginBottom: 14 }}
          onClick={() => {
            setStudyIndex(0);
            setFlipped(false);
          }}
        >
          Study {course.courseCode} ({cards.length} card{cards.length === 1 ? "" : "s"})
        </button>
      )}

      {cards.length === 0 && <p className="atrium-dashboard-empty">No flashcards yet for {course.courseCode} — add one below.</p>}

      <div className="study-guide-card-list">
        {cards.map((card) =>
          editingId === card.id ? (
            <div key={card.id} className="study-guide-card-row study-guide-card-row--editing">
              <input className="input" value={editFront} onChange={(e) => setEditFront(e.target.value)} placeholder="Front" />
              <input className="input" value={editBack} onChange={(e) => setEditBack(e.target.value)} placeholder="Back" />
              <div className="study-guide-card-row-actions">
                <button type="button" className="btn btn-primary" disabled={pending} onClick={saveEdit}>
                  Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={card.id} className="study-guide-card-row">
              <span className="study-guide-card-front">{card.front}</span>
              <span className="study-guide-card-back">{card.back}</span>
              <div className="study-guide-card-row-actions">
                <button type="button" className="study-guide-card-edit" onClick={() => startEdit(card)}>
                  Edit
                </button>
                <button type="button" className="study-guide-card-delete" aria-label="Delete card" onClick={() => onDelete(card.id)}>
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="study-guide-add-card">
        <input className="input" placeholder="Front (term/question)" value={front} onChange={(e) => setFront(e.target.value)} />
        <input className="input" placeholder="Back (definition/answer)" value={back} onChange={(e) => setBack(e.target.value)} />
        <button
          type="button"
          className="btn btn-secondary"
          disabled={pending || !front.trim() || !back.trim()}
          onClick={() => {
            onAdd(front, back);
            setFront("");
            setBack("");
          }}
        >
          + Add card
        </button>
      </div>
    </div>
  );
}

function QuizTab({ course, cards, onRecordResult }: {
  course: StudyGuideCourse;
  cards: StudyCardData[];
  onRecordResult: (id: string, correct: boolean) => void;
}) {
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
    onRecordResult(session[index].id, correct);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (index < session.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setIndex((i) => i + 1); // past the end -> summary screen below
    }
  }

  if (cards.length === 0) {
    return <p className="atrium-dashboard-empty">Add a few flashcards first, then come back here to self-quiz on {course.courseCode}.</p>;
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

function NotesTab({ course, pending, onSave }: { course: StudyGuideCourse; pending: boolean; onSave: (content: string) => void }) {
  const [draft, setDraft] = useState(course.studyNotes ?? "");
  const dirty = draft !== (course.studyNotes ?? "");

  return (
    <div>
      <p className="study-guide-notes-hint">
        Write or paste notes for {course.courseCode}. For a table, put each row on its own line like{" "}
        <code>| Term | Definition |</code>.
      </p>
      <textarea
        className="input study-guide-notes-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={`e.g.\n| Term | Definition |\n| --- | --- |\n| ROM | Range of Motion |`}
      />
      <button type="button" className="btn btn-primary" disabled={pending || !dirty} onClick={() => onSave(draft)} style={{ marginTop: 8 }}>
        {pending ? "Saving…" : "Save notes"}
      </button>
      <StudyNotesPreview content={draft} />
    </div>
  );
}

/** Client UI for /student/study-guide (see that page's own doc comment for the feature's
 *  origin) — one <details> section per course (same uncontrolled-details pattern as
 *  components/student/SyllabiManager.tsx), each with its own Flashcards/Self-Quiz/Visual
 *  Aids tab state. Cards and notes both live in `courses` local state, updated optimistically
 *  from each server action's own returned/echoed values rather than a full refetch — same
 *  "optimistic, not a page reload" shape as every other mutation-heavy manager in this app. */
export function StudyGuideManager({ initialCourses }: { initialCourses: StudyGuideCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [activeTab, setActiveTab] = useState<Record<string, StudyTab>>({});
  const [pending, startTransition] = useTransition();

  function tabFor(courseId: string): StudyTab {
    return activeTab[courseId] ?? "flashcards";
  }

  function handleAddCard(courseId: string, front: string, back: string) {
    startTransition(async () => {
      const result = await createStudyCard(courseId, front, back);
      if ("error" in result) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, cards: [...c.cards, result.card] } : c)));
    });
  }

  function handleEditCard(courseId: string, cardId: string, front: string, back: string) {
    startTransition(async () => {
      const result = await updateStudyCard(cardId, front, back);
      if ("error" in result) return;
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, cards: c.cards.map((card) => (card.id === cardId ? { ...card, front: front.trim(), back: back.trim() } : card)) }
            : c
        )
      );
    });
  }

  function handleDeleteCard(courseId: string, cardId: string) {
    startTransition(async () => {
      const result = await deleteStudyCard(cardId);
      if ("error" in result) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) } : c)));
    });
  }

  function handleRecordResult(courseId: string, cardId: string, correct: boolean) {
    // Fire-and-forget, no pending gate — the quiz session's own UI already advances
    // immediately (see QuizTab's grade()); this just persists lastResult/reviewCount for
    // next time in the background.
    void recordStudyCardResult(cardId, correct);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              cards: c.cards.map((card) =>
                card.id === cardId ? { ...card, lastResult: correct ? "correct" : "incorrect", reviewCount: card.reviewCount + 1 } : card
              ),
            }
          : c
      )
    );
  }

  function handleSaveNotes(courseId: string, content: string) {
    startTransition(async () => {
      const result = await updateStudyNotes(courseId, content);
      if ("error" in result) return;
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, studyNotes: content.trim() || null } : c)));
    });
  }

  if (courses.length === 0) {
    return (
      <p className="atrium-dashboard-empty">
        Add a course in <a href="/student/assignments">Assignments</a> first — Study Guide organizes flashcards, self-quizzes, and
        visual notes by class.
      </p>
    );
  }

  return (
    <div className="study-guide-list">
      {courses.map((course) => {
        const tab = tabFor(course.id);
        return (
          <details key={course.id} className="study-guide-course-card" open={courses.length === 1}>
            <summary className="pro-accordion-summary study-guide-course-summary">
              <div>
                <div className="study-guide-course-title">
                  {course.courseCode} — {course.courseName}
                </div>
                <div className="study-guide-course-meta">
                  {course.cards.length} card{course.cards.length === 1 ? "" : "s"}
                  {course.studyNotes ? " · notes saved" : ""}
                </div>
              </div>
              <ChevronRightIcon size={16} className="pro-accordion-chevron" />
            </summary>
            <div className="pro-accordion-content">
              <div className="study-guide-tabs">
                {(["flashcards", "quiz", "notes"] as StudyTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={tab === t ? "study-guide-tab study-guide-tab--active" : "study-guide-tab"}
                    onClick={() => setActiveTab((prev) => ({ ...prev, [course.id]: t }))}
                  >
                    {t === "flashcards" ? "Flashcards" : t === "quiz" ? "Self-Quiz" : "Visual Aids"}
                  </button>
                ))}
              </div>

              {tab === "flashcards" && (
                <FlashcardsTab
                  course={course}
                  cards={course.cards}
                  pending={pending}
                  onAdd={(front, back) => handleAddCard(course.id, front, back)}
                  onEdit={(id, front, back) => handleEditCard(course.id, id, front, back)}
                  onDelete={(id) => handleDeleteCard(course.id, id)}
                />
              )}
              {tab === "quiz" && (
                <QuizTab course={course} cards={course.cards} onRecordResult={(id, correct) => handleRecordResult(course.id, id, correct)} />
              )}
              {tab === "notes" && <NotesTab course={course} pending={pending} onSave={(content) => handleSaveNotes(course.id, content)} />}
            </div>
          </details>
        );
      })}
    </div>
  );
}
