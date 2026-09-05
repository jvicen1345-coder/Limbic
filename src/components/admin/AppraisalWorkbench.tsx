"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SPECIALTY_META } from "@/lib/meta";
import type { Specialty } from "@/lib/types";
import {
  emptyAppraisalInput,
  runAppraisalChecks,
  publishBlockers,
  SOURCE_ACCESS,
  SOURCE_ACCESS_LABELS,
  type AppraisalInput,
  type CheckVerdict,
  type SourceAccess,
} from "@/lib/appraisal";
import {
  saveAppraisalAction,
  draftAppraisalAction,
  publishAppraisalAction,
  unpublishAppraisalAction,
  deleteAppraisalDraftAction,
} from "@/app/actions/appraisal";

export interface AppraisalRow {
  id: string;
  status: string;
  /** ISO strings, not Dates — this is a client component. */
  updatedAt: string;
  publishedAt: string | null;
  input: AppraisalInput;
  summary: string;
  body: string[];
  specialty: string;
  tags: string[];
}

/**
 * The appraisal workbench (see app/(app)/admin/appraisals/page.tsx, which gates on
 * isSiteAdmin() before this renders; lib/appraisal.ts for the design).
 *
 * The single most important thing about this form is a field it does not have. There is no
 * box to paste an abstract into and no box to paste an article into, because the whole
 * feature exists to make those unnecessary: the appraiser reads the paper themselves and
 * enters facts about it — sample sizes, an effect and its interval, an MCID and where that
 * MCID comes from. Facts are not copyrightable and never leave this machine as anyone
 * else's text, which is what keeps the feature clear of publishers' subscriber terms.
 *
 * The findings panel updates as the numbers are typed, computed by the same pure
 * runAppraisalChecks() the server and the reader surface use — so the verdict an appraiser
 * sees while writing is character-for-character the verdict a reader gets. Drafting is the
 * last step and the smallest one: the model is handed these fields plus those findings and
 * asked for prose, and everything it returns lands in editable textareas, because a draft
 * nobody has read is not something to publish.
 */

const VERDICT_COLORS: Record<CheckVerdict, string> = {
  ok: "var(--color-success, #24614F)",
  caution: "var(--color-warn, #8A6D1F)",
  concern: "var(--color-danger, #9E2B25)",
  unknown: "var(--color-neutral-700)",
};

const VERDICT_LABELS: Record<CheckVerdict, string> = {
  ok: "Clear",
  caution: "Caution",
  concern: "Concern",
  unknown: "Not entered",
};

const SPECIALTIES = Object.keys(SPECIALTY_META) as Specialty[];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** A blank row for "New appraisal" — not persisted until the first save, so opening the
 *  form and changing your mind leaves nothing behind. */
function blankRow(): AppraisalRow {
  return {
    id: "",
    status: "draft",
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    input: emptyAppraisalInput(),
    summary: "",
    body: [],
    specialty: "ortho",
    tags: [],
  };
}

function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "appraisal-field appraisal-field-wide" : "appraisal-field"}>
      <span className="appraisal-field-label">{label}</span>
      {children}
      {hint ? <span className="appraisal-field-hint">{hint}</span> : null}
    </label>
  );
}

export function AppraisalWorkbench({ rows }: { rows: AppraisalRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AppraisalRow | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const openRow = (row: AppraisalRow) => {
    setMessage(null);
    // Cloned so an abandoned edit never mutates the row still shown in the list behind it.
    setEditing({ ...row, input: { ...row.input }, body: [...row.body], tags: [...row.tags] });
  };

  if (!editing) {
    return (
      <>
        <div className="appraisal-toolbar">
          <button type="button" className="appraisal-btn appraisal-btn-primary" onClick={() => openRow(blankRow())}>
            New appraisal
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="appraisal-empty">
            Nothing yet. An appraisal starts after you have read a paper — the form asks for the numbers you took
            out of it, not for the paper.
          </p>
        ) : (
          <ul className="appraisal-list">
            {rows.map((row) => {
              const headline = runAppraisalChecks(row.input).find((c) => c.verdict === "concern");
              return (
                <li key={row.id} className="appraisal-list-row">
                  <button type="button" className="appraisal-list-open" onClick={() => openRow(row)}>
                    <span className="appraisal-list-title">{row.input.title || "Untitled appraisal"}</span>
                    <span className="appraisal-list-meta">
                      {row.status === "published" ? "Published" : "Draft"}
                      {row.publishedAt ? ` · ${formatDate(row.publishedAt)}` : ` · edited ${formatDate(row.updatedAt)}`}
                      {" · "}
                      {SOURCE_ACCESS_LABELS[row.input.sourceAccess]}
                    </span>
                    {headline ? <span className="appraisal-list-flag">{headline.label}: {headline.detail}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </>
    );
  }

  return (
    <AppraisalForm
      row={editing}
      pending={pending}
      message={message}
      setMessage={setMessage}
      onChange={setEditing}
      onClose={() => {
        setEditing(null);
        setMessage(null);
        router.refresh();
      }}
      run={(fn) => startTransition(fn)}
    />
  );
}

function AppraisalForm({
  row,
  pending,
  message,
  setMessage,
  onChange,
  onClose,
  run,
}: {
  row: AppraisalRow;
  pending: boolean;
  message: { kind: "error" | "ok"; text: string } | null;
  setMessage: (m: { kind: "error" | "ok"; text: string } | null) => void;
  onChange: (row: AppraisalRow) => void;
  onClose: () => void;
  run: (fn: () => void) => void;
}) {
  const input = row.input;
  const setInput = <K extends keyof AppraisalInput>(key: K, value: AppraisalInput[K]) =>
    onChange({ ...row, input: { ...input, [key]: value } });

  // Recomputed on every keystroke from the same pure function the server and the published
  // article use. There is no second implementation to drift.
  const checks = useMemo(() => runAppraisalChecks(input), [input]);
  const blockers = useMemo(() => publishBlockers(input, row.body), [input, row.body]);

  const numberValue = (v: number | null) => (v === null ? "" : String(v));
  const onNumber = <K extends keyof AppraisalInput>(key: K) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInput(key, (raw === "" ? null : Number(raw)) as AppraisalInput[K]);
  };

  const save = (after?: (id: string) => void) =>
    run(async () => {
      const result = await saveAppraisalAction({
        id: row.id || undefined,
        input,
        summary: row.summary,
        body: row.body,
        specialty: row.specialty,
        tags: row.tags,
      });
      if (!result.ok || !result.id) {
        setMessage({ kind: "error", text: result.error ?? "Could not save." });
        return;
      }
      onChange({ ...row, id: result.id });
      setMessage({ kind: "ok", text: "Saved." });
      after?.(result.id);
    });

  const draft = () =>
    run(async () => {
      setMessage(null);
      const result = await draftAppraisalAction({ input });
      if (!result.ok || !result.draft) {
        setMessage({ kind: "error", text: result.error ?? "Could not draft." });
        return;
      }
      onChange({ ...row, summary: result.draft.summary, body: result.draft.paragraphs });
      setMessage({ kind: "ok", text: "Drafted. Read every line before you publish it." });
    });

  const publish = () =>
    save((id) =>
      run(async () => {
        const result = await publishAppraisalAction(id);
        setMessage(
          result.ok
            ? { kind: "ok", text: "Published." }
            : { kind: "error", text: result.error ?? "Could not publish." },
        );
        if (result.ok) onChange({ ...row, id, status: "published" });
      }),
    );

  const unpublish = () =>
    run(async () => {
      const result = await unpublishAppraisalAction(row.id);
      setMessage(
        result.ok ? { kind: "ok", text: "Pulled back to draft." } : { kind: "error", text: result.error ?? "Failed." },
      );
      if (result.ok) onChange({ ...row, status: "draft" });
    });

  const remove = () =>
    run(async () => {
      const result = await deleteAppraisalDraftAction(row.id);
      if (result.ok) {
        onClose();
        return;
      }
      setMessage({ kind: "error", text: result.error ?? "Could not delete." });
    });

  return (
    <div className="appraisal-form">
      <div className="appraisal-toolbar">
        <button type="button" className="appraisal-btn" onClick={onClose} disabled={pending}>
          ← All appraisals
        </button>
        <span className="appraisal-status-pill" data-status={row.status}>
          {row.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      <p className="appraisal-preamble">
        Enter what you took out of the paper, not the paper. There is no field here for an abstract or an article
        body on purpose — numbers and your own words are yours to publish; an author&rsquo;s sentences are not, and
        uploading a subscription PDF anywhere would breach most publishers&rsquo; terms on its own.
      </p>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">The study</h2>
        <div className="appraisal-grid">
          <Field label="Title" wide>
            <input value={input.title} onChange={(e) => setInput("title", e.target.value)} />
          </Field>
          <Field label="Authors" hint="Short form, e.g. Smith et al.">
            <input value={input.authors} onChange={(e) => setInput("authors", e.target.value)} />
          </Field>
          <Field label="Journal">
            <input value={input.journal} onChange={(e) => setInput("journal", e.target.value)} />
          </Field>
          <Field label="Year">
            <input inputMode="numeric" value={numberValue(input.year)} onChange={onNumber("year")} />
          </Field>
          <Field label="DOI" hint="Preferred — it outlives a publisher's URL scheme.">
            <input value={input.doi} onChange={(e) => setInput("doi", e.target.value)} />
          </Field>
          <Field label="PMID">
            <input value={input.pmid} onChange={(e) => setInput("pmid", e.target.value)} />
          </Field>
          <Field label="Link" wide hint="Only needed if there is no DOI or PMID.">
            <input value={input.sourceUrl} onChange={(e) => setInput("sourceUrl", e.target.value)} />
          </Field>
          <Field label="How you read it" hint="Recorded on the published piece and kept as the provenance record.">
            <select
              value={input.sourceAccess}
              onChange={(e) => setInput("sourceAccess", e.target.value as SourceAccess)}
            >
              {SOURCE_ACCESS.map((v) => (
                <option key={v} value={v}>
                  {SOURCE_ACCESS_LABELS[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Specialty">
            <select value={row.specialty} onChange={(e) => onChange({ ...row, specialty: e.target.value })}>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {SPECIALTY_META[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">Design, in your words</h2>
        <div className="appraisal-grid">
          <Field label="Design" hint="e.g. Randomised controlled trial, parallel groups">
            <input value={input.design} onChange={(e) => setInput("design", e.target.value)} />
          </Field>
          <Field label="Follow-up (weeks)">
            <input inputMode="numeric" value={numberValue(input.followUpWeeks)} onChange={onNumber("followUpWeeks")} />
          </Field>
          <Field label="Population" wide>
            <input value={input.population} onChange={(e) => setInput("population", e.target.value)} />
          </Field>
          <Field label="Setting">
            <input value={input.setting} onChange={(e) => setInput("setting", e.target.value)} />
          </Field>
          <Field label="Intervention">
            <input value={input.intervention} onChange={(e) => setInput("intervention", e.target.value)} />
          </Field>
          <Field label="Comparator">
            <input value={input.comparator} onChange={(e) => setInput("comparator", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">The numbers</h2>
        <p className="appraisal-section-note">
          Randomised and analysed are two different numbers, and the gap between them is usually the part an abstract
          leaves out. The MCID is what turns a significant result into a meaningful one — or doesn&rsquo;t.
        </p>
        <div className="appraisal-grid">
          <Field label="Randomised (n)">
            <input inputMode="numeric" value={numberValue(input.nRandomised)} onChange={onNumber("nRandomised")} />
          </Field>
          <Field label="Analysed (n)">
            <input inputMode="numeric" value={numberValue(input.nAnalysed)} onChange={onNumber("nAnalysed")} />
          </Field>
          <Field label="Primary outcome" wide hint="As reported, e.g. NPRS pain at 12 weeks">
            <input
              value={input.primaryOutcomeName}
              onChange={(e) => setInput("primaryOutcomeName", e.target.value)}
            />
          </Field>
          <Field label="Effect type">
            <select
              value={input.effectMeasure}
              onChange={(e) => setInput("effectMeasure", e.target.value as AppraisalInput["effectMeasure"])}
            >
              <option value="difference">Difference (mean difference, change score)</option>
              <option value="ratio">Ratio (risk, odds, hazard)</option>
            </select>
          </Field>
          <Field label="Units" hint="e.g. points on the NPRS">
            <input value={input.effectUnit} onChange={(e) => setInput("effectUnit", e.target.value)} />
          </Field>
          <Field label="Between-group effect">
            <input inputMode="decimal" value={numberValue(input.effectPoint)} onChange={onNumber("effectPoint")} />
          </Field>
          <Field label="95% CI lower">
            <input inputMode="decimal" value={numberValue(input.effectCiLower)} onChange={onNumber("effectCiLower")} />
          </Field>
          <Field label="95% CI upper">
            <input inputMode="decimal" value={numberValue(input.effectCiUpper)} onChange={onNumber("effectCiUpper")} />
          </Field>
          <Field label="p value" hint="Free text — &lt;0.001 is fine.">
            <input value={input.pValue} onChange={(e) => setInput("pValue", e.target.value)} />
          </Field>
          <Field label="Published MCID" hint="A magnitude, whichever direction favours treatment.">
            <input inputMode="decimal" value={numberValue(input.mcid)} onChange={onNumber("mcid")} />
          </Field>
          <Field label="MCID source" wide hint="Required if you enter an MCID — readers have to be able to check it.">
            <input value={input.mcidSource} onChange={(e) => setInput("mcidSource", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">Integrity</h2>
        <div className="appraisal-grid">
          <label className="appraisal-check">
            <input
              type="checkbox"
              checked={input.registered}
              onChange={(e) => setInput("registered", e.target.checked)}
            />
            <span>Prospectively registered</span>
          </label>
          <Field label="Registration ID">
            <input value={input.registrationId} onChange={(e) => setInput("registrationId", e.target.value)} />
          </Field>
          <label className="appraisal-check">
            <input
              type="checkbox"
              checked={input.primaryOutcomeChanged}
              onChange={(e) => setInput("primaryOutcomeChanged", e.target.checked)}
              disabled={!input.registered}
            />
            <span>Primary outcome differs from the registered one</span>
          </label>
          <Field label="Funding">
            <input value={input.fundingSource} onChange={(e) => setInput("fundingSource", e.target.value)} />
          </Field>
          <label className="appraisal-check">
            <input
              type="checkbox"
              checked={input.conflictsDeclared}
              onChange={(e) => setInput("conflictsDeclared", e.target.checked)}
            />
            <span>Conflicts of interest declared</span>
          </label>
        </div>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">What the numbers show</h2>
        <p className="appraisal-section-note">
          Computed from the fields above, never written by a model. These are the findings the published appraisal
          carries, and the drafting step is given them as settled — so the prose can never disagree with them.
        </p>
        <ul className="appraisal-checks">
          {checks.map((c) => (
            <li key={c.id} className="appraisal-check-row">
              <span className="appraisal-check-verdict" style={{ color: VERDICT_COLORS[c.verdict] }}>
                {VERDICT_LABELS[c.verdict]}
              </span>
              <span className="appraisal-check-body">
                <strong>{c.label}.</strong> {c.detail}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">Your take</h2>
        <p className="appraisal-section-note">
          This is the appraisal. Everything above is bookkeeping — what you think of the study is the reason anyone
          reads it. The draft is built around this, in your voice.
        </p>
        <textarea
          className="appraisal-notes"
          rows={7}
          value={input.notes}
          onChange={(e) => setInput("notes", e.target.value)}
          placeholder="What did you make of it? What would you say to a colleague who cited this at you?"
        />
        <div className="appraisal-actions">
          <button type="button" className="appraisal-btn" onClick={draft} disabled={pending}>
            {pending ? "Working…" : "Draft from these fields"}
          </button>
          <span className="appraisal-actions-note">
            Sends the fields above and the findings — never the paper.
          </span>
        </div>
      </section>

      <section className="appraisal-section">
        <h2 className="appraisal-section-title">The piece</h2>
        <Field label="Card summary" wide>
          <input value={row.summary} onChange={(e) => onChange({ ...row, summary: e.target.value })} />
        </Field>
        {row.body.map((para, i) => (
          <textarea
            key={i}
            className="appraisal-para"
            rows={4}
            value={para}
            onChange={(e) => {
              const next = [...row.body];
              next[i] = e.target.value;
              onChange({ ...row, body: next });
            }}
          />
        ))}
        <div className="appraisal-actions">
          <button
            type="button"
            className="appraisal-btn"
            onClick={() => onChange({ ...row, body: [...row.body, ""] })}
            disabled={pending}
          >
            Add a paragraph
          </button>
          {row.body.length > 0 ? (
            <button
              type="button"
              className="appraisal-btn"
              onClick={() => onChange({ ...row, body: row.body.slice(0, -1) })}
              disabled={pending}
            >
              Remove the last
            </button>
          ) : null}
        </div>
      </section>

      {blockers.length > 0 ? (
        <ul className="appraisal-blockers">
          {blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}

      {message ? (
        <p className="appraisal-message" data-kind={message.kind}>
          {message.text}
        </p>
      ) : null}

      <div className="appraisal-actions appraisal-actions-final">
        <button type="button" className="appraisal-btn" onClick={() => save()} disabled={pending}>
          Save draft
        </button>
        {row.status === "published" ? (
          <button type="button" className="appraisal-btn" onClick={unpublish} disabled={pending}>
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            className="appraisal-btn appraisal-btn-primary"
            onClick={publish}
            disabled={pending || blockers.length > 0}
          >
            Publish
          </button>
        )}
        {row.id && row.status !== "published" ? (
          <button type="button" className="appraisal-btn appraisal-btn-danger" onClick={remove} disabled={pending}>
            Delete draft
          </button>
        ) : null}
      </div>
    </div>
  );
}
