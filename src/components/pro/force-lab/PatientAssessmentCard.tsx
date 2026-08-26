import Link from "next/link";
import { getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";

function lsiColor(lsi: number | null): string {
  if (lsi == null) return "var(--color-neutral-700)";
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

const MAX_PILLS = 6;

/** One compact card in the patient session page's "Full Assessments" list (see
 *  page.tsx) — Compare hands off to the main workspace's Past Results section via a query
 *  param it reads on mount (see ForceLabWorkspace.tsx/PastResultsSection.tsx), rather than
 *  duplicating the comparison UI on this page too. */
export function PatientAssessmentCard({ assessment }: { assessment: ForceLabAssessmentWithSessions }) {
  const pills = assessment.sessions.slice(0, MAX_PILLS);
  const extra = assessment.sessions.length - pills.length;

  return (
    <div className="forcelab-assessment-summary-card">
      <div className="forcelab-assessment-summary-top">
        <span className="forcelab-assessment-summary-date">{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
        <span className="forcelab-assessment-summary-count">{assessment.musclesTested} muscles tested</span>
      </div>
      <div className="forcelab-assessment-summary-pills">
        {pills.map((s) => (
          <span key={s.id} className="forcelab-lsi-pill" style={{ color: lsiColor(s.lsi), borderColor: lsiColor(s.lsi) }} title={s.muscleGroup}>
            {s.muscleGroup} {s.lsi != null ? `${s.lsi}%` : ""}
          </span>
        ))}
        {extra > 0 && <span className="forcelab-assessment-summary-more">+{extra} more</span>}
      </div>
      <div className="forcelab-assessment-summary-actions">
        <Link href={`/pro/force-lab/assessment/${assessment.id}/print`} className="btn btn-secondary" style={{ fontSize: 12 }} target="_blank">
          View
        </Link>
        <Link href={`/pro/force-lab?compareAssessment=${assessment.id}`} className="btn btn-secondary" style={{ fontSize: 12 }}>
          Compare
        </Link>
      </div>
    </div>
  );
}
