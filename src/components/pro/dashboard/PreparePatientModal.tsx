"use client";

import { useState, useTransition } from "react";
import { confirmPatientBrief, generatePatientFacingBriefAction, type PatientDetail } from "@/app/actions/clinician-dashboard";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { XIcon, DownloadIcon } from "@/components/icons";

const STEPS = ["Review Brief", "Review HEP", "Confirm Details", "Download"];

/** The 4-step "Prepare for Patient" flow, triggered from the active-patient workspace's
 *  own button (see PatientWorkspace.tsx) — builds the printable patient document at
 *  /pro/patient-brief/[patientId] without ever writing patient PHI into it: the only
 *  editable fields here are the clinician's own display info (name, credentials, clinic
 *  name, email), passed to the print page as URL search params since it's a fresh
 *  navigation with no shared client state, not anything about the patient. Same
 *  .cal-modal-backdrop + useExitAnimation shell every other modal in this app uses. */
export function PreparePatientModal({
  open,
  patient,
  clinicianName,
  clinicianCredential,
  clinicianClinicName,
  clinicianEmail,
  onClose,
}: {
  open: boolean;
  patient: PatientDetail;
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  clinicianEmail: string;
  onClose: () => void;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [briefText, setBriefText] = useState("");
  const [briefGenerated, setBriefGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeHEP, setIncludeHEP] = useState(patient.hepAssignments.length > 0);
  const [name, setName] = useState(clinicianName);
  const [credential, setCredential] = useState(clinicianCredential);
  const [clinicName, setClinicName] = useState(clinicianClinicName);
  const [email, setEmail] = useState(clinicianEmail);

  if (!shouldRender) return null;

  const currentHEP = patient.hepAssignments[0] ?? null;

  const resetAndClose = () => {
    setStep(1);
    setBriefText("");
    setBriefGenerated(false);
    setError(null);
    onClose();
  };

  const handleGenerateBrief = () => {
    setError(null);
    startTransition(async () => {
      const result = await generatePatientFacingBriefAction(patient.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBriefText(result.brief);
      setBriefGenerated(true);
    });
  };

  const handleAdvanceFromBrief = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmPatientBrief(patient.id, briefText);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep(2);
    });
  };

  const printHref = (() => {
    const params = new URLSearchParams();
    params.set("name", name);
    if (credential) params.set("credential", credential);
    if (clinicName) params.set("clinicName", clinicName);
    if (email) params.set("email", email);
    params.set("includeHep", includeHEP ? "1" : "0");
    return `/pro/patient-brief/${patient.id}?${params.toString()}`;
  })();

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={resetAndClose}>
      <div className="ppm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">Prepare for Patient — {patient.patientCode}</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={resetAndClose}>
            <XIcon size={16} />
          </button>
        </div>

        <div className="ppm-steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            return (
              <div className="ppm-step" key={label}>
                <span className={`ppm-step-bar${n <= step ? " ppm-step-bar--done" : ""}`} />
                <span className={`ppm-step-label${n === step ? " ppm-step-label--active" : ""}`}>
                  {n}. {label}
                </span>
              </div>
            );
          })}
        </div>

        {error && <p style={{ fontSize: 12, color: "var(--color-danger)", marginBottom: 10 }}>{error}</p>}

        {step === 1 && (
          <div>
            <div className="ppm-step-heading">Review the patient-facing summary</div>
            {!briefGenerated ? (
              <button type="button" className="btn btn-primary" onClick={handleGenerateBrief} disabled={pending}>
                {pending ? "Generating…" : "Generate Summary"}
              </button>
            ) : (
              <>
                <textarea className="ppm-textarea" value={briefText} onChange={(e) => setBriefText(e.target.value)} />
                <p className="clindash-disclaimer" style={{ marginTop: 8 }}>
                  Written for the patient in plain language by Limbic Agent. Review and edit before sharing — it never
                  includes a diagnosis or medical advice, and always encourages the patient to reach out with
                  questions.
                </p>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="ppm-step-heading">Review the home exercise program</div>
            {currentHEP ? (
              <>
                <div className="ppm-hep-row">
                  <span className="ppm-hep-row-name">{currentHEP.hepName}</span>
                  <span>Assigned {new Date(currentHEP.assignedAt).toLocaleDateString()}</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13 }}>
                  <input type="checkbox" checked={includeHEP} onChange={(e) => setIncludeHEP(e.target.checked)} />
                  Include this program in the printed document
                </label>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
                No home exercise program is assigned to this patient yet. The printed document will skip the HEP
                section.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="ppm-details-grid">
            <div className="ppm-step-heading" style={{ marginBottom: 0 }}>
              Confirm the details on the document
            </div>
            <p className="ppm-patient-name-line">
              Patient reference: <strong>{patient.patientCode}</strong>
              <span className="ppm-patient-name-note"> No patient name is ever printed on this document.</span>
            </p>
            <div className="ppm-details-row">
              <label className="ppm-details-label" htmlFor="ppm-name">
                Clinician name
              </label>
              <input className="input" id="ppm-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="ppm-details-row">
              <label className="ppm-details-label" htmlFor="ppm-credential">
                Credentials
              </label>
              <input className="input" id="ppm-credential" value={credential} onChange={(e) => setCredential(e.target.value)} />
            </div>
            <div className="ppm-details-row">
              <label className="ppm-details-label" htmlFor="ppm-clinic">
                Clinic name
              </label>
              <input className="input" id="ppm-clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
            </div>
            <div className="ppm-details-row">
              <label className="ppm-details-label" htmlFor="ppm-email">
                Contact email
              </label>
              <input className="input" id="ppm-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="ppm-download-wrap">
            <a
              href={printHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={resetAndClose}
            >
              <DownloadIcon size={14} />
              Open Printable Document
            </a>
            <p className="ppm-download-instruction">
              Opens the patient document in a new tab, formatted for printing. Use your browser&rsquo;s print dialog
              (Ctrl/Cmd+P) and choose &ldquo;Save as PDF&rdquo; to download it.
            </p>
          </div>
        )}

        <div className="ppm-actions">
          <div>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)} disabled={pending}>
                Back
              </button>
            )}
          </div>
          <div className="ppm-actions-right">
            {step === 1 && briefGenerated && (
              <button type="button" className="btn btn-primary" onClick={handleAdvanceFromBrief} disabled={pending || !briefText.trim()}>
                {pending ? "Saving…" : "Next"}
              </button>
            )}
            {step === 2 && (
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            )}
            {step === 3 && (
              <button type="button" className="btn btn-primary" onClick={() => setStep(4)} disabled={!name.trim()}>
                Next
              </button>
            )}
            {step === 4 && (
              <button type="button" className="btn btn-secondary" onClick={resetAndClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
