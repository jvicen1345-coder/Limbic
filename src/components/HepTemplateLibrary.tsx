"use client";

import { useState, useTransition } from "react";
import { deleteHepTemplateAction, type HepTemplateSummary } from "@/app/actions/hep";
import { HEP_TEMPLATE_BODY_PARTS, HEP_TEMPLATE_BODY_PART_NOTE, type HepTemplateBodyPart } from "@/lib/hep-templates";

function TemplateCard({ template, onLoad }: { template: HepTemplateSummary; onLoad: (templateId: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="hep-template-card">
      <div className="hep-template-card-name">{template.name}</div>
      <div className="hep-template-card-meta">
        {template.exerciseCount} {template.exerciseCount === 1 ? "exercise" : "exercises"}
      </div>
      <div className="hep-template-card-actions">
        <button type="button" className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => onLoad(template.id)}>
          Load
        </button>
        {confirming ? (
          <button
            type="button"
            className="btn"
            disabled={pending}
            style={{ fontSize: 12, padding: "4px 10px", background: "var(--color-danger)", color: "#fff", border: "none" }}
            onClick={() => startTransition(async () => void (await deleteHepTemplateAction(template.id)))}
          >
            Confirm?
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: "4px 10px", color: "var(--color-danger)" }}
            onClick={() => setConfirming(true)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function TemplateCategory({ bodyPart, templates, onLoad }: { bodyPart: HepTemplateBodyPart; templates: HepTemplateSummary[]; onLoad: (templateId: string) => void }) {
  const note = HEP_TEMPLATE_BODY_PART_NOTE[bodyPart];
  return (
    <details className="hep-template-category">
      <summary>
        <span>
          {bodyPart}
          {note && <span className="hep-template-category-note"> — {note}</span>}
        </span>
        <span className="hep-template-category-count">{templates.length}</span>
      </summary>
      {templates.length > 0 ? (
        <div className="hep-template-card-list">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onLoad={onLoad} />
          ))}
        </div>
      ) : (
        <p className="hep-template-category-empty">No saved templates yet</p>
      )}
    </details>
  );
}

export function HepTemplateLibrary({
  templatesByBodyPart,
  onLoad,
  onSaveCurrent,
  saveError,
  clearSaveError,
}: {
  templatesByBodyPart: Record<HepTemplateBodyPart, HepTemplateSummary[]>;
  onLoad: (templateId: string) => void;
  onSaveCurrent: (bodyPart: HepTemplateBodyPart) => boolean;
  saveError: string | null;
  clearSaveError: () => void;
}) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<HepTemplateBodyPart>(HEP_TEMPLATE_BODY_PARTS[0]);
  const [justSaved, setJustSaved] = useState(false);

  function confirmSave() {
    const ok = onSaveCurrent(selectedBodyPart);
    if (ok) {
      setPromptOpen(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  }

  return (
    <details className="hep-template-panel" open>
      <summary className="hep-template-panel-header">
        <div className="hep-template-panel-header-text">
          <span className="card-title">My Templates</span>
          <span className="hep-template-panel-subtitle">Saved layouts by body part</span>
        </div>
      </summary>

      <div className="hep-template-panel-body">
        <div className="hep-template-category-list">
          {HEP_TEMPLATE_BODY_PARTS.map((bp) => (
            <TemplateCategory key={bp} bodyPart={bp} templates={templatesByBodyPart[bp]} onLoad={onLoad} />
          ))}
        </div>

        <div className="hep-template-save-row">
          {promptOpen ? (
            <div className="hep-template-save-prompt">
              <label htmlFor="hep-template-bodypart" className="hep-template-category-note">
                Save under which category?
              </label>
              <select
                id="hep-template-bodypart"
                className="input"
                value={selectedBodyPart}
                onChange={(e) => setSelectedBodyPart(e.target.value as HepTemplateBodyPart)}
              >
                {HEP_TEMPLATE_BODY_PARTS.map((bp) => (
                  <option key={bp} value={bp}>
                    {bp}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSave}>
                  Confirm
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setPromptOpen(false);
                    clearSaveError();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%" }}
              onClick={() => {
                clearSaveError();
                setPromptOpen(true);
              }}
            >
              + Save current as template
            </button>
          )}
          {saveError && <p className="hep-template-save-error">{saveError}</p>}
          {justSaved && <p className="hep-template-save-success">Template saved</p>}
        </div>
      </div>
    </details>
  );
}
