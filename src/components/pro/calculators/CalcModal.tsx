"use client";

import { useState } from "react";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon, CheckIcon } from "@/components/icons";
import { useCalculatorProfile } from "./CalculatorProfileContext";

export interface CalcResult {
  value: string;
  label: string;
}

/** The "Save to profile" footer — only rendered when the calling calculator passed
 *  `testKey`/`testName` (every one of the 12 tools does) and there's both an active
 *  Calculator Profile (see CalculatorProfilesPanel.tsx) and a real result to save. Resets
 *  its "Saved" confirmation whenever the result itself changes (a new input value means a
 *  new, not-yet-saved result), so re-opening the modal or editing an input doesn't leave a
 *  stale checkmark showing — the React-recommended "adjust state during render" pattern
 *  (comparing against a snapshot of the previous render) rather than an effect, since an
 *  effect's setState here would cause an extra visible re-render for what should be
 *  synchronous with the prop change. */
function SaveToProfileFooter({ testKey, testName, result }: { testKey: string; testName: string; result: CalcResult }) {
  const { activeProfileLabel, saveResult } = useCalculatorProfile();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [prevResult, setPrevResult] = useState(result);

  if (prevResult.value !== result.value || prevResult.label !== result.label) {
    setPrevResult(result);
    setState("idle");
  }

  if (!activeProfileLabel) {
    return (
      <p style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)", marginTop: 14 }}>
        Select or create a profile in the panel on the right to save this result.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ fontSize: 12.5 }}
        disabled={state === "saving"}
        onClick={async () => {
          setState("saving");
          const ok = await saveResult(testKey, testName, result.value, result.label);
          setState(ok ? "saved" : "error");
        }}
      >
        {state === "saving" ? "Saving…" : `Save to ${activeProfileLabel}`}
      </button>
      {state === "saved" && (
        <span style={{ fontSize: 12, color: "var(--color-success)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <CheckIcon size={13} /> Saved
        </span>
      )}
      {state === "error" && <span style={{ fontSize: 12, color: "var(--color-danger)" }}>Couldn&rsquo;t save, try again.</span>}
    </div>
  );
}

/** Shared modal shell for every /pro/calculators card's "Calculate" button — same
 *  .cal-modal-* visual language as the calendar's Add Event modal and AddLicenseModal
 *  (see .cal-modal-backdrop/.cal-modal in globals.css), widened via .pro-calc-modal for
 *  calculators with long item lists (Berg, LEFS). testKey/testName/result are optional so
 *  this stays usable for a future calculator that has no meaningful single result to save;
 *  every current one passes all three. */
export function CalcModal({
  open,
  title,
  onClose,
  children,
  testKey,
  testName,
  result,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  testKey?: string;
  testName?: string;
  result?: CalcResult | null;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  if (!shouldRender) return null;

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={onClose}>
      <div className="cal-modal pro-calc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">{title}</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>
        {children}
        {testKey && testName && result && <SaveToProfileFooter testKey={testKey} testName={testName} result={result} />}
      </div>
    </div>
  );
}

/**
 * One scored item: its label and a row of tap-once score buttons.
 *
 * These calculators became score entry when the instruments' own item text came out (see
 * LicensedInstrumentNotice below), which left the examiner transcribing numbers off a paper
 * form — thirty of them on the DASH, twenty on the LEFS. A native `<select>` costs two
 * interactions per item and hides the range until it is opened, which is a poor trade for a
 * 0-5 scale you already know: a row of buttons is one tap, shows the whole range at a
 * glance, and keeps the position of each value stable down the column so the eye can run
 * straight down it.
 *
 * `value` may be null for instruments where "not answered" is a real state the scoring rule
 * cares about (the DASH cannot be scored below 27 of 30 answered); pass `allowUnset` there
 * and tapping the selected value again clears it.
 */
export function ItemScoreRow({
  label,
  scores,
  value,
  onChange,
  allowUnset = false,
}: {
  label: string;
  /** The selectable values in display order, e.g. [0,1,2,3,4,5] or [1,2,3,4,5]. */
  scores: readonly number[];
  value: number | null;
  onChange: (next: number | null) => void;
  allowUnset?: boolean;
}) {
  return (
    <div className="pro-item-row">
      <span className="pro-item-row-label">{label}</span>
      <div className="pro-score-row" role="group" aria-label={label}>
        {scores.map((score) => {
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              className={selected ? "pro-score-btn pro-score-btn--on" : "pro-score-btn"}
              aria-pressed={selected}
              onClick={() => onChange(selected && allowUnset ? null : score)}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Shown at the top of every calculator for a published instrument whose items and response
 * wording are somebody else's copyrighted work.
 *
 * These calculators used to reproduce the instruments in full — all 30 DASH items, the ODI
 * 2.0's sixty graded statements, Berg's and the FGA's per-item scoring criteria — with no
 * attribution, no licence, and no copyright notice, inside a paid subscription. Item text
 * and graded response wording are the protected expression of these measures, and several
 * have active licensing programmes (the DASH in particular is licensed by the Institute for
 * Work & Health, which requires an agreement and forbids modification). Reproducing them
 * behind a paywall is commercial use of exactly the kind those programmes exist to capture.
 *
 * So the tools became score-entry instead: the clinician administers the real form from
 * their own licensed copy and enters the numbers, and Limbic does the arithmetic,
 * interpretation bands and MDC/MCID — none of which is protected expression. Almost all of
 * the clinical value survives, and none of the copying does.
 *
 * What is deliberately kept is short functional labels for the rows an examiner has to fill
 * in — the ODI's ten section headings, Berg's and the FGA's task names. Those are titles,
 * not the instrument's expression, and without them the input is an unlabelled column of
 * dropdowns. Where the item *is* the text (the DASH, the LEFS), rows are numbered instead.
 * Don't reintroduce item statements or graded criteria to any of these.
 *
 * The licence terms below were checked against the rights holders' own pages rather than
 * assumed, and each has a real route to restoring the full instrument if someone asks:
 *
 *  - DASH — Institute for Work & Health. Free for non-profit use with no licence, but
 *    commercial use needs a limited-use licence and a fee, the instrument must be kept
 *    unaltered (the version this replaced had restructured its response anchors, so it
 *    breached that too), and it may not be "incorporated into a product that is sold".
 *    LimbicPRO is sold. They explicitly invite EMR and software integration: submit the
 *    DASH User Profile form and write to dash@iwh.on.ca.
 *  - ODI — licensed to Mapi Research Trust. Free for students, clinicians and clinical
 *    practices; funded academics, healthcare organisations, commercial users and IT
 *    companies need a licence agreement, at what they describe as an affordable fee.
 *    Request through eprovide.mapi-trust.org.
 *  - LEFS — copyright J.M. Binkley 1996; published reproductions carry "reprinted with
 *    permission of the American Physical Therapy Association".
 *  - Berg Balance Scale — copyrighted; reproduced with permission from Katherine Berg, and
 *    the open licences that do cover it are non-commercial.
 *
 * So score entry is the right default for a paid product holding no licences — but it is a
 * default, not a verdict. If a licence is obtained for any one of these, that instrument can
 * have its items back on its own terms, with whatever copyright line the licence requires.
 */
export function LicensedInstrumentNotice({ instrument, developedBy }: { instrument: string; developedBy: string }) {
  return (
    <p className="pro-calc-licence-notice">
      Score entry only. Administer the {instrument} from your own licensed or authorised copy of the form — its
      items and response wording are not reproduced here. Developed by {developedBy}.
    </p>
  );
}

/** "Patient-Reported" — the patient fills this out themselves (a PROM) — vs
 *  "Clinician-Administered" — the PT times, counts, or scores it. Shown as a badge on every
 *  card (see CalcCardShell below) alongside the region-based grouping on
 *  app/(app)/pro/calculators/page.tsx, so a reader can tell at a glance which of the two
 *  ways of gathering the measure it is, independent of which body region it's grouped
 *  under. */
export type CalcAdministration = "Patient-Reported" | "Clinician-Administered";

const ADMINISTRATION_BADGE_CLASS: Record<CalcAdministration, string> = {
  "Patient-Reported": "pro-calc-admin-badge--patient",
  "Clinician-Administered": "pro-calc-admin-badge--clinician",
};

export function CalcCardShell({
  name,
  fullName,
  measures,
  population,
  itemCount,
  administration,
  onOpen,
}: {
  name: string;
  fullName: string;
  measures: string;
  population: string;
  itemCount: string;
  administration: CalcAdministration;
  onOpen: () => void;
}) {
  return (
    <div className="card elev-sm pro-calc-card">
      <span className={`pro-calc-admin-badge ${ADMINISTRATION_BADGE_CLASS[administration]}`}>{administration}</span>
      <div className="pro-calc-title">{name}</div>
      <p className="pro-calc-fullname">{fullName}</p>
      <p className="pro-calc-desc">{measures}</p>
      <p className="pro-calc-meta">
        {population} &middot; {itemCount}
      </p>
      <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={onOpen}>
        Calculate
      </button>
    </div>
  );
}
