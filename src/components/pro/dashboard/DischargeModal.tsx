"use client";

import { useState, useTransition } from "react";
import { confirmDischargeSummary, dischargePatient, generateDischargeSummaryAction } from "@/app/actions/clinician-dashboard";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon } from "@/components/icons";

/** "Before You Discharge" — opened either from the workspace's own Discharge button, or
 *  from the "Generate Discharge Summary" button that appears once a patient is within 2
 *  visits of their planned total (see PatientWorkspace.tsx for both triggers). Either way
 *  this is the only place dischargePatient actually gets called from the workspace now —
 *  the old direct Discharge-button-calls-dischargePatient path is gone, per this feature's
 *  own spec. */
export function DischargeModal({
  open,
  patientId,
  onClose,
  onDischarged,
}: {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onDischarged: () => void;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!shouldRender) return null;

  const resetAndClose = () => {
    setSummary(null);
    setError(null);
    onClose();
  };

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateDischargeSummaryAction(patientId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSummary(result.summary);
    });
  };

  const handleDischargeWithoutSummary = () => {
    startTransition(async () => {
      const result = await dischargePatient(patientId);
      if (result.ok) {
        onDischarged();
        resetAndClose();
      }
    });
  };

  const handleConfirmAndDischarge = () => {
    if (!summary) return;
    setError(null);
    startTransition(async () => {
      const confirmResult = await confirmDischargeSummary(patientId, summary);
      if (!confirmResult.ok) {
        setError(confirmResult.error);
        return;
      }
      const dischargeResult = await dischargePatient(patientId);
      if (!dischargeResult.ok) {
        setError(dischargeResult.error);
        return;
      }
      onDischarged();
      resetAndClose();
    });
  };

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={resetAndClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">Before You Discharge</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={resetAndClose}>
            <XIcon size={16} />
          </button>
        </div>

        {error && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 10 }}>{error}</p>}

        {summary === null ? (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={pending}>
              {pending ? "Generating…" : "Generate Discharge Summary"}
            </button>
            <button
              type="button"
              className="clindash-milestone-banner-dismiss"
              onClick={handleDischargeWithoutSummary}
              disabled={pending}
            >
              Discharge Without Summary
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <textarea
              className="ppm-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={pending}
            />
            <p className="clindash-disclaimer">Review this summary carefully. You are responsible for clinical accuracy.</p>
            <div className="cal-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={handleGenerate} disabled={pending}>
                {pending ? "Regenerating…" : "Regenerate"}
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmAndDischarge} disabled={pending}>
                {pending ? "Discharging…" : "Confirm and Discharge"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
