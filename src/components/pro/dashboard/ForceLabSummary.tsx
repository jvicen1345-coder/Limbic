"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getForceLabSessions } from "@/app/actions/force-lab";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import type { ForceLabSession } from "@/generated/prisma/client";

const RECENT_COUNT = 3;

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

  useEffect(() => {
    let cancelled = false;
    getForceLabSessions(patientId).then((result) => {
      if (!cancelled) setSessions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (sessions === null) return null;

  const recent = sessions.slice(0, RECENT_COUNT);

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
          <Link href={`/pro/force-lab/patient/${encodeURIComponent(patientCode)}`} className="clindash-research-see-all">
            View all in Force Lab
          </Link>
        </>
      )}
    </div>
  );
}
