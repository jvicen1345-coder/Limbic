"use client";

import { useState } from "react";
import { updateQuestionTags, type TaggedBoardQuestion } from "@/app/actions/boards-tagging";
import { ATLAS_CONTENT } from "@/lib/atlas-content";
import { ANTERIOR_GROUPS, POSTERIOR_GROUPS } from "@/lib/atlas-regions";
import { ChevronRightIcon } from "@/components/icons";

const ALL_GROUPS = [...ANTERIOR_GROUPS, ...POSTERIOR_GROUPS];

function zoneName(zoneId: string): string {
  return ATLAS_CONTENT[zoneId]?.name ?? zoneId;
}

function TagForm({ question, onSaved }: { question: TaggedBoardQuestion; onSaved: (bodyRegions: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(question.bodyRegions));
  const [saving, setSaving] = useState(false);

  function toggle(zoneId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const bodyRegions = Array.from(selected);
    await updateQuestionTags(question.id, bodyRegions, question.muscleGroups);
    setSaving(false);
    onSaved(bodyRegions);
  }

  return (
    <div style={{ marginTop: 10, borderTop: "1px solid var(--color-divider)", paddingTop: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
        {ALL_GROUPS.map((g) => (
          <div key={g.label}>
            <div style={{ fontSize: "var(--fs-11)", fontWeight: 600, color: "var(--color-neutral-700)", textTransform: "uppercase", marginBottom: 4 }}>
              {g.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {g.zones.map((z) => (
                <label key={z} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                  <input type="checkbox" checked={selected.has(z)} onChange={() => toggle(z)} />
                  {zoneName(z)}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Tags"}
      </button>
    </div>
  );
}

function QuestionRow({ question: initial }: { question: TaggedBoardQuestion }) {
  const [question, setQuestion] = useState(initial);
  const [open, setOpen] = useState(false);

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {question.question}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {question.bodyRegions.length === 0 ? (
          <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)" }}>No regions tagged</span>
        ) : (
          question.bodyRegions.map((z) => (
            <span className="tag tag-accent" key={z}>
              {zoneName(z)}
            </span>
          ))
        )}
      </div>
      <button type="button" className="btn btn-secondary" onClick={() => setOpen((v) => !v)}>
        Tag Regions
        <ChevronRightIcon size={13} style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 0.15s" }} />
      </button>
      {open && (
        <TagForm
          question={question}
          onSaved={(bodyRegions) => {
            setQuestion((q) => ({ ...q, bodyRegions }));
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function BoardsTaggingAdminList({ questions }: { questions: TaggedBoardQuestion[] }) {
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  const filtered = untaggedOnly ? questions.filter((q) => q.bodyRegions.length === 0) : questions;

  return (
    <>
      <div className="pro-filter-bar">
        <button type="button" className={`pro-filter-chip${untaggedOnly ? " active" : ""}`} onClick={() => setUntaggedOnly((v) => !v)}>
          Untagged only
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {filtered.map((q) => (
          <QuestionRow question={q} key={q.id} />
        ))}
      </div>
    </>
  );
}
