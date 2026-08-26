"use client";

import { useState, useTransition } from "react";
import { addClinicalNote, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { CLINICAL_NOTE_TYPES } from "@/lib/clinician-dashboard-types";
import { PlusIcon } from "@/components/icons";

export function ClinicalNotesSection({ patient, onChanged }: { patient: PatientDetail; onChanged: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [visitNumber, setVisitNumber] = useState(String(patient.visitCount || 1));
  const [noteType, setNoteType] = useState<string>(CLINICAL_NOTE_TYPES[0]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await addClinicalNote(patient.id, { visitNumber: Number(visitNumber), noteType, content });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setContent("");
      setFormOpen(false);
      onChanged();
    });
  };

  return (
    <div className="clindash-section">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Clinical Notes
        </div>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setFormOpen((v) => !v)}>
          <PlusIcon size={13} />
          Add Note
        </button>
      </div>

      {patient.clinicalNotes.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>No clinical notes yet.</p>
      ) : (
        <div>
          {patient.clinicalNotes.map((n) => {
            const isExpanded = expandedId === n.id;
            return (
              <div className="clindash-note-item" key={n.id} onClick={() => setExpandedId(isExpanded ? null : n.id)}>
                <div className="clindash-note-item-top">
                  <span className="clindash-note-type-pill">{n.noteType}</span>
                  <span>Visit {n.visitNumber}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={isExpanded ? "clindash-note-full" : "clindash-note-preview"}>{n.content}</div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="clindash-inline-form">
          <div className="clindash-inline-form-row">
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="cn-visit">Visit number</label>
              <input
                className="input"
                id="cn-visit"
                type="number"
                min="1"
                value={visitNumber}
                onChange={(e) => setVisitNumber(e.target.value)}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="cn-type">Note type</label>
              <select className="input" id="cn-type" value={noteType} onChange={(e) => setNoteType(e.target.value)}>
                {CLINICAL_NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="cn-content">Note</label>
            <textarea
              className="input"
              id="cn-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          {error && <p style={{ fontSize: 12, color: "var(--color-danger)", margin: 0 }}>{error}</p>}
          <div className="clindash-inline-form-actions">
            <button type="button" className="btn btn-primary" disabled={pending || !content.trim()} onClick={handleAdd}>
              {pending ? "Saving…" : "Save Note"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={pending}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
