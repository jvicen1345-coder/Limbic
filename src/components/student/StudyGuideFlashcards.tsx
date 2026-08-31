"use client";

import { useState, useTransition } from "react";
import { updateStudyCard, deleteStudyCard, type StudyCardData } from "@/app/actions/study-guide";
import { TrashIcon } from "@/components/icons";

/** Flashcards page for one course (see
 *  app/(app)/student/study-guide/[syllabusId]/flashcards/page.tsx) — a flip-through study
 *  session plus Edit/Delete on each existing card. No "add a card" form: "I want to get rid
 *  of the ability to create in the study guide page for now" — new cards only come from
 *  Study Guide Creator (/student/slides, app/actions/slide-breakdown.ts) now. Edit/Delete
 *  stayed, since those manage content that already exists rather than create new content. */
export function StudyGuideFlashcards({ courseCode, initialCards }: { courseCode: string; initialCards: StudyCardData[] }) {
  const [cards, setCards] = useState(initialCards);
  const [pending, startTransition] = useTransition();
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
    const front = editFront;
    const back = editBack;
    startTransition(async () => {
      const result = await updateStudyCard(editingId, front, back);
      if ("error" in result) return;
      setCards((prev) => prev.map((c) => (c.id === editingId ? { ...c, front: front.trim(), back: back.trim() } : c)));
      setEditingId(null);
    });
  }

  function handleDelete(cardId: string) {
    startTransition(async () => {
      const result = await deleteStudyCard(cardId);
      if ("error" in result) return;
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    });
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
      {cards.length === 0 ? (
        <p className="atrium-dashboard-empty">
          No flashcards yet for {courseCode} — generate some from your slides in Study Guide Creator.
        </p>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginBottom: 14 }}
            onClick={() => {
              setStudyIndex(0);
              setFlipped(false);
            }}
          >
            Study {courseCode} ({cards.length} card{cards.length === 1 ? "" : "s"})
          </button>

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
                    <button type="button" className="study-guide-card-delete" aria-label="Delete card" onClick={() => handleDelete(card.id)}>
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
