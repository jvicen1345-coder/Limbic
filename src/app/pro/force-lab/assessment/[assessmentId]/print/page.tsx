import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getNormativeData } from "@/app/actions/force-lab";
import { getLSIStatus, getNormativeComparison, FORCE_LAB_GREEN, FORCE_LAB_AMBER, FORCE_LAB_RED } from "@/lib/force-lab-units";
import { ForceLabAssessmentPrintTopbar } from "@/components/pro/force-lab/ForceLabAssessmentPrintTopbar";

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

/** Standalone print document for one Force Lab assessment (see the "Download Assessment"
 *  link on AssessmentExpandedView.tsx / PatientAssessmentCard.tsx) — same pattern as
 *  patient-brief/[patientId]: outside the (app) route group (no sidebar to hide for print),
 *  forced light mode via the reused .patient-brief-* classes (literal colors, never the
 *  app's --color-* tokens), notFound() ownership check, a fixed topbar hidden on print. */
export default async function ForceLabAssessmentPrintPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params;
  const user = await getCurrentUser();
  if (!user || !user.isPro) notFound();

  const assessment = await prisma.forceLabAssessment.findUnique({
    where: { id: assessmentId },
    include: { sessions: { orderBy: { muscleGroup: "asc" } }, patient: { select: { patientCode: true } } },
  });
  if (!assessment || assessment.userId !== user.id) notFound();

  const canLookUpNorms = assessment.patientAge != null && assessment.patientSex != null;
  const norms = canLookUpNorms
    ? await Promise.all(
        assessment.sessions.map(async (s) => {
          // Same "compare whichever side is larger, right on a tie" convention as
          // ForceLabEntryForm's own normative lookup.
          const side = (s.rightPeak ?? 0) >= (s.leftPeak ?? 0) ? "right" : "left";
          const value = side === "right" ? s.rightPeak : s.leftPeak;
          const norm = await getNormativeData(s.muscleGroup, assessment.patientAge!, assessment.patientSex!, side);
          if (!norm || value == null) return { muscleGroup: s.muscleGroup, norm: null, status: null };
          return { muscleGroup: s.muscleGroup, norm, status: getNormativeComparison(value, norm.meanLbs, norm.sdLbs) };
        })
      )
    : [];
  const normsWithData = norms.filter((n): n is { muscleGroup: string; norm: NonNullable<(typeof norms)[number]["norm"]>; status: string } => n.norm !== null);

  const generatedOn = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="patient-brief-page">
      <ForceLabAssessmentPrintTopbar />

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
    </div>
  );
}
