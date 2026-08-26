/** Persistent amber banner at the top of the active-patient workspace — driven entirely by
 *  ClinicianDashboard.tsx's `redFlagAlerts` state (populated via checkRedFlags in the same
 *  effect that loads patient detail, so it re-runs on every patient open and every
 *  onChanged-triggered refresh — see that file's own comment). Renders nothing once
 *  `alerts` is empty, which happens naturally once every flag for this patient has been
 *  dismissed. */
export function ClinicalAlertBanner({
  alerts,
  onDismiss,
}: {
  alerts: { id: string; description: string }[];
  onDismiss: (alertId: string) => void;
}) {
  if (alerts.length === 0) return null;

  return (
    <div className="clindash-alert-banner">
      <div className="clindash-alert-header">Clinical Alert</div>
      <div className="clindash-alert-list">
        {alerts.map((alert) => (
          <div className="clindash-alert-item" key={alert.id}>
            <span className="clindash-alert-item-text">{alert.description}</span>
            <button type="button" className="clindash-alert-item-dismiss" onClick={() => onDismiss(alert.id)}>
              Dismiss
            </button>
          </div>
        ))}
      </div>
      <div className="clindash-alert-footer">
        <a href="/pro/red-flags" target="_blank" rel="noopener noreferrer" className="clindash-ci-find-link">
          Review Red Flag Criteria
        </a>
      </div>
    </div>
  );
}
