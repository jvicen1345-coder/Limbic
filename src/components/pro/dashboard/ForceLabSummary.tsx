"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getForceLabSessions, getAssessmentHistory, type ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

const RECENT_COUNT = 3;
const CONCERN_COUNT = 3;

function lsiColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Active patient workspace's Force Lab section (below HEP Assignments, above Clinical
 *  Notes — see PatientWorkspace.tsx) — self-fetching, same "mount effect + local getX()
 *  call" pattern as CECountdownCard/ClinicalQuestionLogSection, since this is the one place
 *  Force Lab data reaches the Clinician Dashboard and doesn't need to block the rest of
 *  the workspace's first paint. */
export function ForceLabSummary({ patientId, patientCode, forceUnit }: { patientId: string; patientCode: string; forceUnit: string }) {
  const [sessions, setSessions] = useState<ForceLabSession[] | null>(null);
  const [assessments, setAssessments] = useState<ForceLabAssessmentWithSessions[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getForceLabSessions(patientId).then((result) => {
      if (!cancelled) setSessions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    getAssessmentHistory(patientId).then((result) => {
      if (!cancelled) setAssessments(result);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (sessions === null) return null;

  const recent = sessions.slice(0, RECENT_COUNT);
  // getAssessmentHistory returns oldest-first (for trend charts elsewhere) — the last entry
  // is the most recent assessment.
  const latestAssessment = assessments && assessments.length > 0 ? assessments[assessments.length - 1] : null;
  const highestConcern = latestAssessment
    ? latestAssessment.sessions
        .filter((s) => s.lsi != null)
        .slice()
        .sort((a, b) => a.lsi! - b.lsi!)
        .slice(0, CONCERN_COUNT)
    : [];

  return (
    <div className="card elev-sm">
      <div className="clindash-section-header">
        <div className="card-kicker" style={{ margin: 0 }}>
          Force Lab
        </div>
        <Link href={`/pro/force-lab?patient=${patientId}`} className="btn btn-secondary" style={{ fontSize: 12 }}>
          Add Session
        </Link>
      </div>

      {recent.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>
          No force measurements recorded. Use Force Lab to add dynamometer data.
        </p>
      ) : (
        <>
          {recent.map((s) => {
            const right = s.rightPeak != null ? convertForDisplay(s.rightPeak, s.unit, forceUnit) : null;
            const left = s.leftPeak != null ? convertForDisplay(s.leftPeak, s.unit, forceUnit) : null;
            return (
              <div className="forcelab-summary-row" key={s.id}>
                <span className="forcelab-summary-muscle">{s.muscleGroup}</span>
                <span className="forcelab-summary-peaks">
                  <span>R: {right != null ? `${right} ${forceUnit}` : "—"}</span>
                  <span>L: {left != null ? `${left} ${forceUnit}` : "—"}</span>
                  {s.lsi != null && (
                    <span className="forcelab-lsi-pill" style={{ color: lsiColor(s.lsi), borderColor: lsiColor(s.lsi) }}>
                      LSI {s.lsi}%
                    </span>
                  )}
                </span>
                <span className="forcelab-summary-date">{new Date(s.sessionDate).toLocaleDateString()}</span>
              </div>
            );
          })}

          {latestAssessment && (
            <div className="forcelab-latest-assessment">
              <div className="forcelab-latest-assessment-title">Latest Assessment</div>
              <div className="forcelab-latest-assessment-row">
                <span className="forcelab-latest-assessment-date">{new Date(latestAssessment.assessmentDate).toLocaleDateString()}</span>
                <span className="forcelab-latest-assessment-count">{latestAssessment.musclesTested} muscles tested</span>
              </div>
              {highestConcern.length > 0 && (
                <div className="forcelab-latest-assessment-pills">
                  {highestConcern.map((s) => (
                    <span
                      key={s.id}
                      className="forcelab-lsi-pill"
                      style={{ color: lsiColor(s.lsi!), borderColor: lsiColor(s.lsi!) }}
                      title={s.muscleGroup}
                    >
                      {s.muscleGroup} {s.lsi}%
                    </span>
                  ))}
                </div>
              )}
              <Link href={`/pro/force-lab/patient/${encodeURIComponent(patientCode)}`} className="clindash-research-see-all">
                View Full Assessment
              </Link>
            </div>
          )}

          <Link href={`/pro/force-lab/patient/${encodeURIComponent(patientCode)}`} className="clindash-research-see-all">
            View all in Force Lab
          </Link>
        </>
      )}
    </div>
  );
}
