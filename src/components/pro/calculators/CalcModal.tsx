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
