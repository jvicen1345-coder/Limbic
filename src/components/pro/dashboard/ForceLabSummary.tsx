"use client";

import { useEffect, useState } from "react";
import { getForceLabCardData, type ForceLabCardData, type ForceLabTrend } from "@/app/actions/force-lab";
import { convertForDisplay, getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";

function lsiColor(lsi: number): string {
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

// Below 80 is a red pill even though getLSIStatus's own "deficit" boundary already starts
// there — kept as its own function (rather than reusing lsiColor above) since the spec draws
// the Needs Attention section's red/amber line at exactly 80, and lsiColor's green branch
// would never fire for a row that only appears once it's under the 85 attention threshold.
function attentionPillColor(lsi: number): string {
  return lsi < 80 ? FORCE_LAB_RED : FORCE_LAB_AMBER;
}

function TrendIndicator({ trend }: { trend: ForceLabTrend }) {
  if (trend === "insufficient_data") return null;
  if (trend === "improving") {
    return (
      <span className="forcelab-card-trend forcelab-card-trend--up" style={{ color: FORCE_LAB_GREEN }}>
        ↑ improving
      </span>
    );
  }
  if (trend === "declining") {
    return (
      <span className="forcelab-card-trend forcelab-card-trend--down" style={{ color: FORCE_LAB_RED }}>
        ↓ declining
      </span>
    );
  }
  return <span className="forcelab-card-trend forcelab-card-trend--stable">→ stable</span>;
}

/** Active patient workspace's Force Lab section (below HEP Assignments, above Clinical
 *  Notes — see PatientWorkspace.tsx) — self-fetching, same "mount effect + local getX() call"
 *  pattern as ClinicalQuestionLogSection, since this is the one place Force Lab data reaches
 *  the Clinician Dashboard and doesn't need to block the rest of the workspace's first paint.
 *  Single getForceLabCardData() fetch rather than this component's old separate
 *  getForceLabSessions/getAssessmentHistory calls — everything the redesigned card shows
 *  (session count, most recent reading + its trend, lowest-LSI muscle groups) is computed
 *  server-side in one round trip. */
export function ForceLabSummary({ patientId, patientCode, forceUnit }: { patientId: string; patientCode: string; forceUnit: string }) {
  const [data, setData] = useState<ForceLabCardData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getForceLabCardData(patientId).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (data === null) return null;

  const { sessionCount, mostRecent, mostRecentTrend, needsAttention } = data;
  const addSessionHref = `/pro/force-lab?patient=${patientId}`;
  const fullProfileHref = `/pro/force-lab/patient/${encodeURIComponent(patientCode)}`;

  return (
    <div className="card elev-sm forcelab-card">
      <div className="forcelab-card-header">
        <span className="forcelab-card-kicker">Force Lab</span>
        <span className="forcelab-card-patient-code">{patientCode}</span>
      </div>

      {sessionCount === 0 ? (
        <>
          <p className="forcelab-card-empty">No force measurements recorded</p>
          <a href={addSessionHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary forcelab-card-empty-btn">
            + Add First Session
          </a>
        </>
      ) : (
        <>
          <p className="forcelab-card-meta">
            {sessionCount} session{sessionCount === 1 ? "" : "s"}
            {mostRecent && <> · Last tested {new Date(mostRecent.sessionDate).toLocaleDateString()}</>}
          </p>

          {mostRecent && (
            <>
              <div className="forcelab-card-divider" />
              <div className="forcelab-card-section">
                <div className="forcelab-card-section-label">Most Recent</div>
                <div className="forcelab-card-muscle-name">{mostRecent.muscleGroup}</div>
                <div className="forcelab-card-columns">
                  <div className="forcelab-card-values">
                    <div>
                      R: {mostRecent.rightPeak != null ? `${convertForDisplay(mostRecent.rightPeak, mostRecent.unit, forceUnit)} ${forceUnit}` : "—"}
                    </div>
                    <div>
                      L: {mostRecent.leftPeak != null ? `${convertForDisplay(mostRecent.leftPeak, mostRecent.unit, forceUnit)} ${forceUnit}` : "—"}
                    </div>
                  </div>
                  <div className="forcelab-card-lsi-col">
                    {mostRecent.lsi != null && (
                      <span className="forcelab-lsi-pill" style={{ color: lsiColor(mostRecent.lsi), borderColor: lsiColor(mostRecent.lsi) }}>
                        LSI {mostRecent.lsi}%
                      </span>
                    )}
                    <TrendIndicator trend={mostRecentTrend} />
                  </div>
                </div>
              </div>
            </>
          )}

          {needsAttention.length > 0 && (
            <>
              <div className="forcelab-card-divider" />
              <div className="forcelab-card-section">
                <div className="forcelab-card-section-label" style={{ color: FORCE_LAB_AMBER }}>
                  Needs Attention
                </div>
                {needsAttention.map((entry) => (
                  <div className="forcelab-card-attention-row" key={entry.muscleGroup}>
                    <span className="forcelab-card-attention-muscle">{entry.muscleGroup}</span>
                    <span className="forcelab-card-attention-tags">
                      <span
                        className="forcelab-lsi-pill"
                        style={{ color: attentionPillColor(entry.lsi), borderColor: attentionPillColor(entry.lsi) }}
                      >
                        LSI {entry.lsi}%
                      </span>
                      <TrendIndicator trend={entry.trend} />
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="forcelab-card-actions">
            <a href={addSessionHref} target="_blank" rel="noopener noreferrer" className="forcelab-card-action-outline">
              + Add Session
            </a>
            <a href={fullProfileHref} target="_blank" rel="noopener noreferrer" className="forcelab-card-action-link">
              View Full Profile →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
