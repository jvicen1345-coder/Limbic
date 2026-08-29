"use client";

import { useEffect, useState } from "react";
import { logVisit } from "@/app/actions/clinician-dashboard";

const AUTO_DISMISS_MS = 30000;
const CONFIRMATION_MS = 2500;

/** The "Did you see [code] today?" banner — shown by ClinicianDashboard.tsx whenever a
 *  patient is newly selected (card click or Morning Rounds' "Start Session") and
 *  hasLoggedVisitRecently comes back false. Mount this with `key={patientId}` from the
 *  parent so switching patients always starts a fresh 30s timer and clears any leftover
 *  confirmation state, rather than trying to reset internal state from a prop change. */
export function VisitLogBanner({
  patientId,
  patientCode,
  onLogged,
  onDismiss,
}: {
  patientId: string;
  patientCode: string;
  /** Fired the moment the visit is actually logged, so the parent can refresh the patient
   *  list and stop treating this patient as "not yet logged today." */
  onLogged: () => void;
  /** Fired when the banner should disappear — "No", the 30s timeout, or a couple seconds
   *  after a successful log (once the "Visit X logged" confirmation has been visible). */
  onDismiss: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYes = async () => {
    setPending(true);
    const result = await logVisit(patientId);
    setPending(false);
    if (!result.ok) {
      onDismiss();
      return;
    }
    setConfirmedCount(result.visitCount);
    onLogged();
    window.setTimeout(onDismiss, CONFIRMATION_MS);
  };

  if (confirmedCount !== null) {
    return (
      <div className="clindash-visit-banner">
        <span className="clindash-visit-banner-confirm">Visit {confirmedCount} logged</span>
      </div>
    );
  }

  return (
    <div className="clindash-visit-banner">
      <span>Did you see {patientCode} today?</span>
      <div className="clindash-visit-banner-actions">
        <button type="button" className="btn btn-primary" style={{ fontSize: 12.5 }} disabled={pending} onClick={handleYes}>
          Yes — Log Visit
        </button>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12.5 }} disabled={pending} onClick={onDismiss}>
          No
        </button>
      </div>
    </div>
  );
}
