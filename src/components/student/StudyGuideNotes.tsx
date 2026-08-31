"use client";

import { useMemo, useState, useTransition } from "react";
import { updateStudyNotes } from "@/app/actions/study-guide";
import { parseStudyNotes } from "@/lib/study-notes-markdown";

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

/** Visual Aids page for one course (see
 *  app/(app)/student/study-guide/[syllabusId]/notes/page.tsx). "I want to get rid of the
 *  ability to create in the study guide page for now" — a course with no notes yet shows a
 *  plain message pointing at Study Guide Creator rather than a blank textarea to write one
 *  from scratch. Once a note exists (from Study Guide Creator, or a previous save here),
 *  it's still editable/save-able — that's managing existing content, not creating new. */
export function StudyGuideNotes({ courseId, courseCode, initialNotes }: { courseId: string; courseCode: string; initialNotes: string | null }) {
  const [saved, setSaved] = useState(initialNotes);
  const [draft, setDraft] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const dirty = draft !== (saved ?? "");

  if (saved === null) {
    return (
      <p className="atrium-dashboard-empty">No notes yet for {courseCode} — generate some from your slides in Study Guide Creator.</p>
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateStudyNotes(courseId, draft);
      if ("error" in result) return;
      setSaved(draft.trim() || null);
    });
  }

  return (
    <div>
      <p className="study-guide-notes-hint">
        For a table, put each row on its own line like <code>| Term | Definition |</code>.
      </p>
      <textarea className="input study-guide-notes-textarea" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button type="button" className="btn btn-primary" disabled={pending || !dirty} onClick={handleSave} style={{ marginTop: 8 }}>
        {pending ? "Saving…" : "Save notes"}
      </button>
      <StudyNotesPreview content={draft} />
    </div>
  );
}
