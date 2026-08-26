/** Persistent amber banner above the Outcome Measures section once a patient hits a
 *  REASSESSMENT_INTERVAL_VISITS milestone with no outcome recorded today — see
 *  getPatientsWithOutcomeReminders in app/actions/clinician-dashboard.ts, which is what
 *  decides whether this renders at all (ClinicianDashboard.tsx only mounts it for a
 *  patient in that list). Disappears on its own the next time that list no longer
 *  includes this patient — i.e. once an outcome is actually recorded — not through any
 *  state owned here. */
export function OutcomeMilestoneBanner({
  visitCount,
  onRecordNow,
  onDismiss,
}: {
  visitCount: number;
  onRecordNow: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="clindash-milestone-banner">
      <div className="clindash-milestone-banner-text">Visit {visitCount} milestone — time for an outcome reassessment.</div>
      <div className="clindash-milestone-banner-actions">
        <button type="button" className="btn btn-primary" style={{ fontSize: 12.5 }} onClick={onRecordNow}>
          Record Outcomes Now
        </button>
        <button type="button" className="clindash-milestone-banner-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
