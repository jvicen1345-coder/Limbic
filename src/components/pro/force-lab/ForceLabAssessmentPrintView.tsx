"use client";

import { useState, useTransition } from "react";
import { generatePatientReportSummary, type ForceLabAssessmentWithSessions } from "@/app/actions/force-lab";
import { getLSIStatus, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import { ForceLabAssessmentPrintTopbar, type ForceLabReportType } from "./ForceLabAssessmentPrintTopbar";
import { ForceLabPatientReportBody } from "./ForceLabPatientReportBody";

const NORM_STATUS_LABEL: Record<string, string> = {
  above_norm: "Above normative mean",
  within_norm: "Within 1 SD of normative mean",
  below_norm: "1–2 SD below normative mean",
  significantly_below: "More than 2 SD below normative mean",
};

function lsiTextColor(lsi: number | null): string {
  if (lsi == null) return "#666";
  const status = getLSIStatus(lsi);
  if (status === "normal") return FORCE_LAB_GREEN;
  if (status === "caution") return FORCE_LAB_AMBER;
  return FORCE_LAB_RED;
}

export interface NormWithData {
  muscleGroup: string;
  norm: { meanLbs: number; sdLbs: number; source: string; ageMin: number; ageMax: number };
  status: string;
}

/** Owns the Clinical/Patient report toggle for /pro/force-lab/assessment/[assessmentId]/print
 *  — page.tsx does all the data fetching (assessment, normative lookups) and hands it down
 *  here so switching tabs is a client-side render swap, never a navigation. The Clinical
 *  Report JSX below is moved here verbatim from page.tsx, unchanged — this file only adds
 *  the toggle and the Patient Report tab alongside it. */
export function ForceLabAssessmentPrintView({
  assessment,
  normsWithData,
  clinicianName,
  clinicianCredential,
  clinicianClinicName,
  generatedOn,
  initialPatientSummary,
}: {
  assessment: ForceLabAssessmentWithSessions;
  normsWithData: NormWithData[];
  clinicianName: string;
  clinicianCredential: string;
  clinicianClinicName: string;
  generatedOn: string;
  initialPatientSummary: string | null;
}) {
  const [reportType, setReportType] = useState<ForceLabReportType>("clinical");
  const [summary, setSummary] = useState(initialPatientSummary);
  const [generateError, setGenerateError] = useState(false);
  const [generating, startGenerating] = useTransition();

  const handleGenerateSummary = () => {
    setGenerateError(false);
    startGenerating(async () => {
      const result = await generatePatientReportSummary(assessment.id);
      if (result.ok) {
        setSummary(result.summary);
      } else {
        setGenerateError(true);
      }
    });
  };

  const normsByMuscleGroup = new Map(normsWithData.map((n) => [n.muscleGroup, n.status]));

  return (
    <>
      <ForceLabAssessmentPrintTopbar
        reportType={reportType}
        onReportTypeChange={setReportType}
        onGenerateSummary={handleGenerateSummary}
        generatingSummary={generating}
        hasSummary={summary != null}
      />
      {generateError && <p className="pbrief-patient-generate-error">Could not generate a patient summary. Please try again.</p>}

      {reportType === "patient" ? (
        <ForceLabPatientReportBody
          assessment={assessment}
          normsByMuscleGroup={normsByMuscleGroup}
          clinicianName={clinicianName}
          clinicianCredential={clinicianCredential}
          clinicianClinicName={clinicianClinicName}
          summary={summary}
        />
      ) : (
        <div className="patient-brief-doc">
          <div className="patient-brief-header">
            <div>
              <div className="patient-brief-clinic-name">Limbic Center for Physical Therapy</div>
              <div className="patient-brief-clinic-tagline">limbic.center</div>
            </div>
          </div>

          <div className="patient-brief-doc-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span>Dynamometer Assessment Report</span>
            <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
          </div>

          <div className="patient-brief-meta-grid">
            <div>
              <span className="patient-brief-meta-label">Identifier: </span>
              <span className="patient-brief-meta-value">{assessment.identifier ?? "—"}</span>
            </div>
            <div>
              <span className="patient-brief-meta-label">Patient code: </span>
              <span className="patient-brief-meta-value">{assessment.patient?.patientCode ?? "Unlinked"}</span>
            </div>
            <div>
              <span className="patient-brief-meta-label">Weight: </span>
              <span className="patient-brief-meta-value">
                {assessment.patientWeight != null ? `${assessment.patientWeight} ${assessment.patientWeightUnit ?? "kg"}` : "—"}
              </span>
            </div>
            <div>
              <span className="patient-brief-meta-label">Age: </span>
              <span className="patient-brief-meta-value">{assessment.patientAge ?? "—"}</span>
            </div>
            <div>
              <span className="patient-brief-meta-label">Sex: </span>
              <span className="patient-brief-meta-value">{assessment.patientSex ?? "—"}</span>
            </div>
            <div>
              <span className="patient-brief-meta-label">Dominant side: </span>
              <span className="patient-brief-meta-value">{assessment.dominantSide ?? "—"}</span>
            </div>
          </div>

          <div className="patient-brief-section">
            <div className="patient-brief-section-title">Muscle Group Results</div>
            <table className="pbrief-assessment-table">
              <thead>
                <tr>
                  <th>Muscle Group</th>
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
                {assessment.sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.muscleGroup}</td>
                    <td>{s.leftPeak ?? "—"}</td>
                    <td>{s.rightPeak ?? "—"}</td>
                    <td>{s.averageForceLeft ?? "—"}</td>
                    <td>{s.averageForceRight ?? "—"}</td>
                    <td>{s.leftTimeToPeak ?? "—"}</td>
                    <td>{s.rightTimeToPeak ?? "—"}</td>
                    <td>{s.forceWeightRatioLeft ?? "—"}</td>
                    <td>{s.forceWeightRatioRight ?? "—"}</td>
                    <td style={{ color: lsiTextColor(s.lsi), fontWeight: 700 }}>{s.lsi != null ? `${s.lsi}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {normsWithData.length > 0 && (
            <div className="patient-brief-section">
              <div className="patient-brief-section-title">Normative Comparison</div>
              {normsWithData.map(({ muscleGroup, norm, status }) => (
                <div className="pbrief-forcelab-row" key={muscleGroup}>
                  <span>{muscleGroup}</span>
                  <span>
                    Normative mean {norm.meanLbs} lb (SD {norm.sdLbs}) — {NORM_STATUS_LABEL[status] ?? status}
                    <span style={{ color: "#999" }}> · {norm.source}</span>
                  </span>
                </div>
              ))}
              <p className="pbrief-forcelab-note">Ages {"20+"}, published handheld-dynamometer normative literature.</p>
            </div>
          )}

          {assessment.notes && (
            <div className="patient-brief-section">
              <div className="patient-brief-section-title">Notes</div>
              <p className="patient-brief-summary-text">{assessment.notes}</p>
            </div>
          )}

          <div className="patient-brief-footer">
            This document was prepared by your physical therapist and does not constitute a complete medical record. Contact your clinician
            directly with any questions about your care. Generated via LimbicPRO on {generatedOn}.
          </div>
        </div>
      )}
    </>
  );
}
