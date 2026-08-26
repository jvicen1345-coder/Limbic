"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { linkAssessmentToPatient, type ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";
import type { PatientListEntry } from "@/app/actions/clinician-dashboard";
import { getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";

function lsiBorderColor(lsi: number | null): string | undefined {
  if (lsi == null) return undefined;
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

/** Full inline detail for one row of the Past Results history list (see
 *  PastResultsSection.tsx, which owns fetching this and toggling it open) — every column
 *  ForceLabSession stores for a paste-imported muscle group, not just the peak/LSI summary
 *  the collapsed row shows. */
export function AssessmentExpandedView({
  assessment,
  patients,
  onLinked,
}: {
  assessment: ForceLabAssessmentWithSessions;
  patients: PatientListEntry[];
  onLinked: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [linking, setLinking] = useState(false);
  const [patientId, setPatientId] = useState("");

  const handleLink = () => {
    if (!patientId) return;
    startTransition(async () => {
      const result = await linkAssessmentToPatient(assessment.id, patientId);
      if (result.ok) {
        setLinking(false);
        onLinked();
      }
    });
  };

  return (
    <div className="forcelab-expanded-view">
      <div className="forcelab-expanded-meta-bar">
        <span className="forcelab-meta-pill">Identifier: {assessment.identifier ?? "—"}</span>
        <span className="forcelab-meta-pill">
          Weight: {assessment.patientWeight != null ? `${assessment.patientWeight} ${assessment.patientWeightUnit ?? "kg"}` : "—"}
        </span>
        <span className="forcelab-meta-pill">Age: {assessment.patientAge ?? "—"}</span>
        <span className="forcelab-meta-pill">Sex: {assessment.patientSex ?? "—"}</span>
        <span className="forcelab-meta-pill">Dominant Side: {assessment.dominantSide ?? "—"}</span>
        <span className="forcelab-meta-pill">Date: {new Date(assessment.assessmentDate).toLocaleDateString()}</span>
      </div>

      <div className="forcelab-patient-history-table-wrap" style={{ marginTop: 12 }}>
        <table className="forcelab-patient-history-table">
          <thead>
            <tr>
              <th>Muscle Group</th>
              <th>Rep 1 L</th>
              <th>Rep 1 R</th>
              <th>Rep 2 L</th>
              <th>Rep 2 R</th>
              <th>Rep 3 L</th>
              <th>Rep 3 R</th>
              <th>Peak L</th>
              <th>Peak R</th>
              <th>Avg L</th>
              <th>Avg R</th>
              <th>TTP L</th>
              <th>TTP R</th>
              <th>FW Ratio L</th>
              <th>FW Ratio R</th>
              <th>LSI</th>
            </tr>
          </thead>
          <tbody>
            {assessment.sessions.map((s) => {
              const borderColor = lsiBorderColor(s.lsi);
              return (
                <tr key={s.id} style={borderColor ? { borderLeft: `3px solid ${borderColor}` } : undefined}>
                  <td>{s.muscleGroup}</td>
                  <td>{s.rep1Left ?? "—"}</td>
                  <td>{s.rep1Right ?? "—"}</td>
                  <td>{s.rep2Left ?? "—"}</td>
                  <td>{s.rep2Right ?? "—"}</td>
                  <td>{s.rep3Left ?? "—"}</td>
                  <td>{s.rep3Right ?? "—"}</td>
                  <td>{s.leftPeak ?? "—"}</td>
                  <td>{s.rightPeak ?? "—"}</td>
                  <td>{s.averageForceLeft ?? "—"}</td>
                  <td>{s.averageForceRight ?? "—"}</td>
                  <td>{s.leftTimeToPeak ?? "—"}</td>
                  <td>{s.rightTimeToPeak ?? "—"}</td>
                  <td>{s.forceWeightRatioLeft ?? "—"}</td>
                  <td>{s.forceWeightRatioRight ?? "—"}</td>
                  <td style={{ fontWeight: 700 }}>{s.lsi != null ? `${s.lsi}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="forcelab-expanded-actions">
        {assessment.patient ? (
          <span className="forcelab-patient-pill">{assessment.patient.patientCode}</span>
        ) : linking ? (
          <>
            <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ width: "auto" }}>
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patientCode} — {p.condition}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" disabled={!patientId || pending} onClick={handleLink}>
              Save Link
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setLinking(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => setLinking(true)}>
            Link to Patient
          </button>
        )}

        {assessment.patientId && (
          <Link href={`/pro/patient-brief/${assessment.patientId}`} className="btn btn-secondary">
            Add to Patient Brief
          </Link>
        )}
        <Link href={`/pro/force-lab/assessment/${assessment.id}/print`} className="btn btn-secondary" target="_blank">
          Download Assessment
        </Link>
      </div>
    </div>
  );
}
