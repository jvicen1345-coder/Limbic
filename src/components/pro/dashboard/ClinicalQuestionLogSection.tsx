"use client";

import { useEffect, useState, useTransition } from "react";
import {
  answerClinicalQuestion,
  deleteClinicalQuestion,
  getAllQuestions,
  logClinicalQuestion,
  type ClinicalQuestionLogView,
} from "@/app/actions/clinician-dashboard";
import { CheckCircleIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";

/** Right column, below the research digest — default workspace state only (see
 *  ClinicianDashboard.tsx, which only mounts this when no patient is selected). */
export function ClinicalQuestionLogSection() {
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<ClinicalQuestionLogView | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [answeredOpen, setAnsweredOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    getAllQuestions().then(setView);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!view) return null;

  const handleAdd = () => {
    setError(null);
    if (!questionText.trim()) {
      setError("Enter a question.");
      return;
    }
    startTransition(async () => {
      const result = await logClinicalQuestion(questionText);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setQuestionText("");
      setFormOpen(false);
      refresh();
    });
  };

  const handleAsk = (id: string) => {
    startTransition(async () => {
      const result = await answerClinicalQuestion(id);
      if (result.ok) {
        window.open(`/agent?topic=${encodeURIComponent(result.question)}`, "_blank", "noopener,noreferrer");
        refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    startTransition(async () => {
      await deleteClinicalQuestion(id);
      refresh();
    });
  };

  const hasAny = view.unanswered.length > 0 || view.answered.length > 0;

  return (
    <div className="clindash-question-log">
      <div className="clindash-section-header" style={{ marginBottom: 8 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Questions to Answer
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 11.5 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={12} />
          Add Question
        </button>
      </div>

      {formOpen && (
        <div className="clindash-inline-form" style={{ marginBottom: 10 }}>
          <input
            className="input"
            placeholder="What came up in clinic today?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          {error && <p style={{ fontSize: 11.5, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} disabled={pending} onClick={handleAdd}>
              Save
            </button>
            <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setFormOpen(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!hasAny ? (
        <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>
          No questions logged. Tap Add Question to capture clinical questions as they come up.
        </p>
      ) : (
        <>
          {view.unanswered.map((q) => (
            <div className="clindash-question-card" key={q.id}>
              <div className="clindash-question-text">{q.question}</div>
              <div className="clindash-question-date">{new Date(q.createdAt).toLocaleDateString()}</div>
              <div className="clindash-question-actions">
                <button type="button" className="clindash-question-ask" disabled={pending} onClick={() => handleAsk(q.id)}>
                  Ask Limbic Agent
                </button>
                <button type="button" className="clindash-question-delete" disabled={pending} onClick={() => handleDelete(q.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {view.unansweredTotalCount > view.unanswered.length && (
            <p className="clindash-question-see-all">
              +{view.unansweredTotalCount - view.unanswered.length} more unanswered
            </p>
          )}

          {view.answered.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="clindash-question-answered-label"
                onClick={() => setAnsweredOpen((v) => !v)}
              >
                <CheckCircleIcon size={13} />
                Answered ({view.answered.length})
                <ChevronRightIcon size={12} style={{ transform: answeredOpen ? "rotate(90deg)" : undefined }} />
              </button>
              {answeredOpen && (
                <div style={{ marginTop: 6 }}>
                  {view.answered.map((q) => (
                    <div className="clindash-question-card" key={q.id} style={{ opacity: 0.75 }}>
                      <div className="clindash-question-text">{q.question}</div>
                      <div className="clindash-question-date">{new Date(q.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
