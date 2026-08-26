import type { DashboardSummary } from "@/app/actions/clinician-dashboard";

const REASSESSMENT_AMBER = "#c9853a";

/** Four stat tiles above the three-column layout (see ClinicianDashboard.tsx) — always
 *  built off the server-fetched `summary` prop, which re-renders automatically after any
 *  mutation's revalidatePath("/pro/dashboard") without this component owning any state of
 *  its own. */
export function DailyBriefBar({ summary }: { summary: DashboardSummary }) {
  const ceOnTrack = summary.ceHours.completed > 15;

  return (
    <div className="clindash-brief-row">
      <div className="card elev-sm clindash-brief-tile">
        <div className="clindash-brief-tile-label">Active Patients</div>
        <div className="clindash-brief-tile-value">{summary.activePatients}</div>
      </div>
      <div className="card elev-sm clindash-brief-tile">
        <div className="clindash-brief-tile-label">Seen This Week</div>
        <div className="clindash-brief-tile-value">{summary.seenThisWeek}</div>
      </div>
      <div className="card elev-sm clindash-brief-tile">
        <div className="clindash-brief-tile-label">Due for Reassessment</div>
        <div
          className="clindash-brief-tile-value"
          style={{ color: summary.dueForReassessment > 0 ? REASSESSMENT_AMBER : "inherit" }}
        >
          {summary.dueForReassessment}
        </div>
      </div>
      <div className="card elev-sm clindash-brief-tile">
        <div className="clindash-brief-tile-label">CE Hours</div>
        <div
          className="clindash-brief-tile-value"
          style={{ color: ceOnTrack ? "var(--color-accent)" : REASSESSMENT_AMBER }}
        >
          {summary.ceHours.completed} of {summary.ceHours.total} hrs
        </div>
      </div>
    </div>
  );
}
