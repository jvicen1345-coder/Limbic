"use client";

import { cloneElement, isValidElement, useId, useMemo, useState, useTransition } from "react";
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
import { OUTCOME_MEASURES, findOutcomeMeasure, measureSummary } from "@/lib/outcome-measures";
import {
  saveAppraisalAction,
  draftAppraisalAction,
  publishAppraisalAction,
  unpublishAppraisalAction,
  deleteAppraisalDraftAction,
  lookupStudyMetadataAction,
  fetchStudyAbstractAction,
} from "@/app/actions/appraisal";
import type { StudyMetadata } from "@/lib/pubmed";

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

/**
 * One labelled control with an optional hint.
 *
 * The hint is associated with `aria-describedby` rather than being wrapped inside the
 * `<label>`. A wrapping label contributes *all* of its text to the control's accessible
 * name, so the hints here — which mention other fields by name, as in "Only needed if there
 * is no DOI or PMID" — ended up inside the names of the controls they sit under: a screen
 * reader announced that box as "Link Only needed if there is no DOI or PMID", and the DOI
 * field and the Link field both answered to "DOI". Name and description are different
 * things, and this keeps them apart.
 */
function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement<{ id?: string; "aria-describedby"?: string }>;
  wide?: boolean;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const control = isValidElement(children) ? cloneElement(children, { id, "aria-describedby": hintId }) : children;
  return (
    <div className={wide ? "appraisal-field appraisal-field-wide" : "appraisal-field"}>
      <label className="appraisal-field-label" htmlFor={id}>
        {label}
      </label>
      {control}
      {hint ? (
        <span className="appraisal-field-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
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

/**
 * Citation lookup. Six of this form's fields are bibliographic — pure transcription, and
 * the place a typo actually costs a reader (a mistyped DOI is a dead link out).
 *
 * The found record is shown and applied only on an explicit click, never automatically. A
 * DOI or PMID is exact, but a title goes through PubMed's search, which answers a near-miss
 * with its best guess: searching a real paper's exact title genuinely can return a different
 * paper. Silently filling a citation block from that would put the wrong study under an
 * appraisal. One extra click is the whole cost of never doing that.
 */
/** Fills the effect units, the MCID and its source from lib/outcome-measures.ts, for the
 *  eleven measures Limbic already carries figures for. The summary line under it is the
 *  reason this is worth more than saving two fields of typing: for the TUG, the 6MWT, the
 *  Berg and the 30-second sit-to-stand there is no single agreed MCID, and the picker says
 *  so instead of handing over a number that would then drive the magnitude verdict. */
function MeasurePicker({ measureId, onPick }: { measureId: string; onPick: (id: string) => void }) {
  const measure = findOutcomeMeasure(measureId);
  return (
    <div className="appraisal-measure">
      <div className="appraisal-field appraisal-field-wide">
        <label className="appraisal-field-label" htmlFor="appraisal-measure-select">
          Outcome measure
        </label>
        <select
          id="appraisal-measure-select"
          aria-describedby="appraisal-measure-hint"
          value={measureId}
          onChange={(e) => onPick(e.target.value)}
        >
          <option value="">Choose a measure to fill units and MCID…</option>
          {OUTCOME_MEASURES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.abbreviation} — {m.name}
            </option>
          ))}
        </select>
        <span className="appraisal-field-hint" id="appraisal-measure-hint">
          Optional. Fills the units and the MCID; the MCID source is still yours to write, since it asks where you
          got the number.
        </span>
      </div>
      {measure ? (
        <p className="appraisal-measure-summary" data-no-mcid={measure.mcid === null}>
          {measureSummary(measure)}
        </p>
      ) : null}
    </div>
  );
}

function CitationLookup({
  pending,
  onApply,
  run,
}: {
  pending: boolean;
  onApply: (metadata: StudyMetadata) => void;
  run: (fn: () => void) => void;
}) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<StudyMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = () =>
    run(async () => {
      setError(null);
      setFound(null);
      const result = await lookupStudyMetadataAction(query);
      if (!result.ok || !result.metadata) {
        setError(result.error ?? "Lookup failed.");
        return;
      }
      setFound(result.metadata);
    });

  return (
    <div className="appraisal-lookup">
      <div className="appraisal-field appraisal-field-wide">
        <label className="appraisal-field-label" htmlFor="appraisal-lookup-input">
          Look up the citation
        </label>
        <div className="appraisal-lookup-row">
          <input
            id="appraisal-lookup-input"
            aria-describedby="appraisal-lookup-hint"
            value={query}
            placeholder="DOI, PMID, PubMed link, or the study's title"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
          />
          <button type="button" className="appraisal-btn" onClick={search} disabled={pending || !query.trim()}>
            {pending ? "Looking…" : "Find"}
          </button>
        </div>
        <span className="appraisal-field-hint" id="appraisal-lookup-hint">
          Fills the title, authors, journal, year, DOI and PMID. Never the abstract — the numbers that matter
          aren&rsquo;t in one anyway.
        </span>
      </div>

      {error ? <p className="appraisal-message" data-kind="error">{error}</p> : null}

      {found ? (
        <div className="appraisal-lookup-result">
          <p className="appraisal-lookup-title">{found.title}</p>
          <p className="appraisal-lookup-meta">
            {[found.authors, found.journal, found.year, found.designHint].filter(Boolean).join(" · ")}
          </p>
          <p className="appraisal-lookup-meta">
            {found.doi ? `doi ${found.doi}` : "no DOI on record"} · PMID {found.pmid}
          </p>
          <div className="appraisal-actions">
            <button
              type="button"
              className="appraisal-btn appraisal-btn-primary"
              onClick={() => {
                onApply(found);
                setFound(null);
                setQuery("");
              }}
              disabled={pending}
            >
              Use this citation
            </button>
            <span className="appraisal-actions-note">Check it is the right paper before filling.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * PubMed's abstract, shown beside the form while numbers are being transcribed.
 *
 * Three things make this safe to have, and all three are structural rather than advisory.
 * The app fetches it from the public record, so nothing a subscriber agreement covers can
 * get in — there is no paste target here. It is held in this component's state and in no
 * other place: not on AppraisalInput, so it cannot be saved, published, or handed to the
 * drafting step, which takes AppraisalInput and has nowhere to put it. And it is fetched
 * only when asked for, on a record already identified.
 *
 * It stays collapsed by default. The pane is for checking a population or a follow-up period
 * without a second tab, not for working from — an appraisal built out of an abstract has no
 * attrition figure, no interval, and nothing this feature exists to surface.
 */
function AbstractPane({
  pmid,
  pending,
  run,
}: {
  pmid: string;
  pending: boolean;
  run: (fn: () => void) => void;
}) {
  const [text, setText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which record the held text belongs to, so changing the PMID cannot leave the previous
  // study's abstract on screen next to the new one's numbers.
  const [loadedFor, setLoadedFor] = useState("");

  const stale = text !== null && loadedFor !== pmid;

  const load = () =>
    run(async () => {
      setError(null);
      const result = await fetchStudyAbstractAction(pmid);
      if (!result.ok || !result.abstract) {
        setError(result.error ?? "Could not load the abstract.");
        setText(null);
        return;
      }
      setText(result.abstract);
      setLoadedFor(pmid);
      setOpen(true);
    });

  if (!pmid.trim()) {
    return (
      <p className="appraisal-abstract-empty">
        Look the study up above and its abstract can be shown here for reference while you enter the numbers.
      </p>
    );
  }

  return (
    <div className="appraisal-abstract">
      <div className="appraisal-actions" style={{ marginTop: 0 }}>
        {text === null || stale ? (
          <button type="button" className="appraisal-btn" onClick={load} disabled={pending}>
            {pending ? "Loading…" : stale ? "Load this record's abstract" : "Show the PubMed abstract"}
          </button>
        ) : (
          <button type="button" className="appraisal-btn" onClick={() => setOpen((v) => !v)} disabled={pending}>
            {open ? "Hide the abstract" : "Show the abstract"}
          </button>
        )}
        <span className="appraisal-actions-note">Reference only. Never saved, published, or sent to the draft.</span>
      </div>

      {error ? (
        <p className="appraisal-message" data-kind="error">
          {error}
        </p>
      ) : null}

      {text !== null && !stale && open ? (
        <div className="appraisal-abstract-pane">
          <p className="appraisal-abstract-label">PubMed abstract — reference, not part of your appraisal</p>
          {/* Selectable so a term can be checked, but never an input and never a source the
              form reads: every field on this page is typed by the appraiser. */}
          <p className="appraisal-abstract-text">{text}</p>
          <p className="appraisal-abstract-foot">
            Fetched from PubMed&rsquo;s record for PMID {loadedFor}. The numbers that decide this appraisal&rsquo;s
            verdicts — how many were randomised against how many were analysed, the confidence interval, whether the
            primary outcome was switched — are usually not in an abstract. That is what the paper is for.
          </p>
        </div>
      ) : null}
    </div>
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

  // Which measure the picker is showing. Editor-local rather than stored on the appraisal:
  // what matters to a reader is the MCID and its source, which are real fields, and an
  // appraisal may legitimately use a measure this library does not carry.
  const [measureId, setMeasureId] = useState("");

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
        <CitationLookup
          pending={pending}
          run={run}
          onApply={(m) =>
            onChange({
              ...row,
              input: {
                ...input,
                title: m.title,
                // Every field below is overwritten only when the record actually carries a
                // value, so a lookup can top up a partly-filled form without blanking work.
                authors: m.authors || input.authors,
                journal: m.journal || input.journal,
                year: m.year ?? input.year,
                doi: m.doi || input.doi,
                pmid: m.pmid || input.pmid,
                design: input.design || m.designHint,
              },
            })
          }
        />
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
        <AbstractPane pmid={input.pmid} pending={pending} run={run} />
        <MeasurePicker
          measureId={measureId}
          onPick={(id) => {
            setMeasureId(id);
            const measure = findOutcomeMeasure(id);
            if (!measure) return;
            onChange({
              ...row,
              input: {
                ...input,
                effectUnit: measure.unit,
                // Left null for a measure with no agreed MCID rather than filled with
                // something plausible — see lib/outcome-measures.ts. The appraiser can still
                // type one; they just have to mean it.
                mcid: measure.mcid,
                // MCID source is deliberately not filled. It asks where *you* got the
                // number, and this picker is not an answer to that — prefilling it would
                // satisfy the publish guard with a provenance nobody can follow. The note
                // shown under the picker is the context; the citation stays the appraiser's.
              },
            });
          }}
        />
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
