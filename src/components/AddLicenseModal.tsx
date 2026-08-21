"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitLicenseVerification } from "@/app/actions/license";
import { namesLooselyMatch } from "@/lib/license-verification";
import { US_STATES } from "@/lib/us-states";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon } from "@/components/icons";

const TOTAL_STEPS = 4;

/** The 4-step "Add License" wizard, triggered from ProfessionalCredentialsCard's "Add
 *  License" button — collects everything submitLicenseVerification needs (state, license
 *  number, full name, attestation) and creates a new License row with status "pending" for
 *  an admin to review (see app/(app)/admin/licenses/page.tsx). Same modal shell (.cal-modal-*)
 *  the calendar's Add Event modal already established, so this doesn't invent a second modal
 *  visual language. */
export function AddLicenseModal({
  open,
  accountName,
  claimedStates,
  onClose,
}: {
  open: boolean;
  accountName: string;
  /** States this reader already has a pending or verified License row for — excluded from
   *  the Step 1 dropdown, since only one active license per state is allowed. A state whose
   *  only row was rejected is NOT included here, so it stays selectable for resubmission
   *  (see submitLicenseVerification). */
  claimedStates: string[];
  onClose: () => void;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [state, setState] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFullName, setLicenseFullName] = useState("");
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shouldRender) return null;

  const availableStates = US_STATES.filter((s) => !claimedStates.includes(s));

  const nameMismatch = licenseFullName.trim().length > 0 && !namesLooselyMatch(licenseFullName, accountName);

  const canAdvance =
    (step === 1 && state.trim().length > 0) ||
    (step === 2 && licenseNumber.trim().length > 0) ||
    (step === 3 && licenseFullName.trim().length > 0);

  const handleClose = () => {
    // Reset so a reopen (after a close mid-flow) starts fresh rather than resuming a
    // half-filled, possibly stale form.
    setStep(1);
    setState("");
    setLicenseNumber("");
    setLicenseFullName("");
    setAttestationChecked(false);
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!attestationChecked) return;
    setError(null);
    startTransition(async () => {
      const result = await submitLicenseVerification({
        state,
        licenseNumber,
        licenseFullName,
        attestationConfirmed: attestationChecked,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong, try again.");
        return;
      }
      router.refresh();
      handleClose();
    });
  };

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={handleClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">Add License</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={handleClose}>
            <XIcon size={16} />
          </button>
        </div>

        <div className="license-modal-progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={`license-modal-progress-seg${i < step ? " license-modal-progress-seg--done" : ""}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="license-state">Step 1 of 4, Select your state</label>
            {availableStates.length > 0 ? (
              <select className="input" id="license-state" value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Select a state…</option>
                {availableStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <p className="license-modal-helper">
                You already have a license on file for every state — nothing left to add.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="license-number">Step 2 of 4, Enter your license number exactly as it appears on your license</label>
            <input
              className="input"
              id="license-number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              autoFocus
            />
            <p className="license-modal-helper">Format varies by state. Include any letters or dashes.</p>
          </div>
        )}

        {step === 3 && (
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="license-name">Step 3 of 4, Enter your full name exactly as it appears on your license</label>
            <input
              className="input"
              id="license-name"
              value={licenseFullName}
              onChange={(e) => setLicenseFullName(e.target.value)}
              autoFocus
            />
            <p className="license-modal-helper">Your Limbic account name: {accountName}</p>
            {nameMismatch && (
              <p className="license-modal-warning">
                This name does not match your Limbic account name. Please ensure the name you enter matches your license exactly.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 10 }}>
              Step 4 of 4, Confirm your credentials
            </div>
            <div className="license-modal-summary">
              <div className="license-modal-summary-row">
                <span className="license-modal-summary-label">State</span>
                <span className="license-modal-summary-value">{state}</span>
              </div>
              <div className="license-modal-summary-row">
                <span className="license-modal-summary-label">License number</span>
                <span className="license-modal-summary-value">{licenseNumber}</span>
              </div>
              <div className="license-modal-summary-row">
                <span className="license-modal-summary-label">Name on license</span>
                <span className="license-modal-summary-value">{licenseFullName}</span>
              </div>
            </div>

            <label className="license-modal-attestation">
              <input
                type="checkbox"
                checked={attestationChecked}
                onChange={(e) => setAttestationChecked(e.target.checked)}
              />
              <span>
                I confirm that I am the licensed physical therapist associated with this license number and that the information I
                have provided is accurate. I understand that providing false credentials may result in permanent account termination
                and may be reported to my state licensing board.
              </span>
            </label>

            {error && <p className="license-modal-warning" style={{ color: "var(--color-danger)" }}>{error}</p>}
          </div>
        )}

        <div className="cal-modal-actions">
          {step > 1 && (
            <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={pending}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" className="btn btn-primary" disabled={!canAdvance} onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={!attestationChecked || pending} onClick={handleSubmit}>
              {pending ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
