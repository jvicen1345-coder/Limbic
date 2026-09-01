import { notFound } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { getSafetyAssessment } from "@/app/actions/connexion-safety-score";
import { SAFETY_SCORE_DOMAINS, RISK_SCALE, CAREGIVER_SKILLS, FOLLOW_UP_OPTIONS, computeSafetyScoreTotals, domainMaxScore } from "@/lib/connexion-safety-score";
import { ConnexionSafetyScorePrintTopbar } from "@/components/connexion/ConnexionSafetyScorePrintTopbar";

/** Standalone print document for one Connexion Safety Score assessment — same pattern as
 *  patient-brief/[patientId] and the Force Lab assessment print page: outside the (app)
 *  route group (no sidebar to hide for print), forced light mode via the reused
 *  .patient-brief-* classes (literal colors, never the app's --color-* tokens), isSiteAdmin
 *  ownership check, fixed topbar hidden on print. Unlike the clinician-dashboard patient
 *  brief, this DOES show the client's name/address — Connexion clients are named parties on
 *  a real paper safety report, not anonymized ClinicalPatient records. */
export default async function ConnexionSafetyScorePrintPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isSiteAdmin())) notFound();

  const { id } = await params;
  const assessment = await getSafetyAssessment(id);
  if (!assessment) notFound();

  const totals = computeSafetyScoreTotals(assessment.itemScores);
  const generatedOn = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const assessmentDateFormatted = new Date(`${assessment.assessmentDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const followUpLabel = FOLLOW_UP_OPTIONS.find((o) => o.key === assessment.followUp)?.label;

  return (
    <div className="patient-brief-page">
      <ConnexionSafetyScorePrintTopbar assessmentId={id} />

      <div className="patient-brief-doc">
        <div className="patient-brief-header">
          <div>
            <div className="patient-brief-clinic-name">Connexion Safety Score™</div>
            <div className="patient-brief-clinic-tagline">Home Safety & Fall-Risk Assessment</div>
          </div>
        </div>

        <div className="patient-brief-meta-grid">
          <div>
            <span className="patient-brief-meta-label">Client: </span>
            <span className="patient-brief-meta-value">{assessment.clientName}</span>
          </div>
          <div>
            <span className="patient-brief-meta-label">Date: </span>
            <span className="patient-brief-meta-value">{assessmentDateFormatted}</span>
          </div>
          <div>
            <span className="patient-brief-meta-label">PT: </span>
            <span className="patient-brief-meta-value">{assessment.administeredByName}</span>
          </div>
          <div>
            <span className="patient-brief-meta-label">Address: </span>
            <span className="patient-brief-meta-value">{assessment.clientAddress || "—"}</span>
          </div>
        </div>

        {SAFETY_SCORE_DOMAINS.map((domain) => {
          const domainScore = domain.key === "environmental" ? totals.environmental : domain.key === "mobility" ? totals.mobility : totals.fallRisk;
          return (
            <div className="patient-brief-section" key={domain.key}>
              <div className="patient-brief-section-title">
                {domain.name} — {domainScore} / {domainMaxScore(domain)}
              </div>
              {domain.sections.map((section) => (
                <table className="patient-brief-hep-table" key={section.key} style={{ marginBottom: 12 }}>
                  {section.label && (
                    <thead>
                      <tr>
                        <th colSpan={2}>{section.label}</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {section.items.map((item) => (
                      <tr className="patient-brief-hep-row" key={item.key}>
                        <td>{item.label}</td>
                        <td style={{ textAlign: "right" }}>
                          {assessment.itemScores[item.key] ?? 0} — {RISK_SCALE[assessment.itemScores[item.key] ?? 0].label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          );
        })}

        <div className="patient-brief-section">
          <div className="patient-brief-section-title">Total Risk Score</div>
          {/* The three domain subtotals alongside the total, not just the total and its band.
              computeSafetyScoreTotals already returns them, and showing them is what lets a
              reader see *which* domain drove the risk level rather than taking a single 0-208
              figure on trust — the "can independently review the basis" property that keeps a
              scoring tool a reference rather than something that decides for the clinician.
              The per-item tables above carry the full detail; this is the bridge between them
              and the headline number. */}
          <p className="patient-brief-summary-text">
            {totals.total} / 208 — {totals.riskLevel} Risk. {totals.riskAction}.
          </p>
          <p className="patient-brief-summary-text">
            Environmental safety {totals.environmental} / {domainMaxScore(SAFETY_SCORE_DOMAINS[0])} · Functional
            mobility {totals.mobility} / {domainMaxScore(SAFETY_SCORE_DOMAINS[1])} · Fall risk {totals.fallRisk} /{" "}
            {domainMaxScore(SAFETY_SCORE_DOMAINS[2])}. Scored from the items above during the visit; a structured
            record of what was found on the day, not a prediction about this individual.
          </p>
        </div>

        {(assessment.criticalFindings.length > 0 || assessment.criticalFindingsOther) && (
          <div className="patient-brief-section">
            <div className="patient-brief-section-title">Important Safety Override</div>
            <p className="patient-brief-summary-text">
              {[...assessment.criticalFindings, assessment.criticalFindingsOther].filter(Boolean).join("; ")}
            </p>
          </div>
        )}

        {assessment.equipment.length > 0 && (
          <div className="patient-brief-section">
            <div className="patient-brief-section-title">Equipment Recommendations</div>
            <table className="patient-brief-hep-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Location</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {assessment.equipment.map((e, i) => (
                  <tr className="patient-brief-hep-row" key={i}>
                    <td>{e.equipment}</td>
                    <td>{e.location || "—"}</td>
                    <td>{e.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {assessment.ptRecommendation && (
          <div className="patient-brief-section">
            <div className="patient-brief-section-title">PT Recommendation</div>
            <p className="patient-brief-summary-text">{assessment.ptRecommendation}</p>
          </div>
        )}

        <div className="patient-brief-section">
          <div className="patient-brief-section-title">Caregiver Safety Check</div>
          <table className="patient-brief-hep-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {CAREGIVER_SKILLS.map((skill) => (
                <tr className="patient-brief-hep-row" key={skill.key}>
                  <td>{skill.label}</td>
                  <td style={{ textAlign: "right" }}>
                    {assessment.caregiverSkills[skill.key] === "demonstrated"
                      ? "Demonstrated"
                      : assessment.caregiverSkills[skill.key] === "needsTraining"
                        ? "Needs Training"
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assessment.caregiverTrainingNote && <p className="patient-brief-summary-text" style={{ marginTop: 8 }}>{assessment.caregiverTrainingNote}</p>}
        </div>

        {(assessment.priorityActionsUrgent || assessment.priorityActionsSoon || assessment.priorityActionsMonitor) && (
          <div className="patient-brief-section">
            <div className="patient-brief-section-title">Priority Action Plan</div>
            {assessment.priorityActionsUrgent && (
              <p className="patient-brief-summary-text">
                <strong>Address Immediately:</strong> {assessment.priorityActionsUrgent}
              </p>
            )}
            {assessment.priorityActionsSoon && (
              <p className="patient-brief-summary-text">
                <strong>Address Soon:</strong> {assessment.priorityActionsSoon}
              </p>
            )}
            {assessment.priorityActionsMonitor && (
              <p className="patient-brief-summary-text">
                <strong>Consider / Monitor:</strong> {assessment.priorityActionsMonitor}
              </p>
            )}
          </div>
        )}

        <div className="patient-brief-section">
          <div className="patient-brief-section-title">Connexion Safety Summary</div>
          {assessment.biggestRisk && (
            <p className="patient-brief-summary-text">
              <strong>Biggest risk identified:</strong> {assessment.biggestRisk}
            </p>
          )}
          {assessment.mostImportantChange && (
            <p className="patient-brief-summary-text">
              <strong>Most important change:</strong> {assessment.mostImportantChange}
            </p>
          )}
          {assessment.equipmentRecommendedNote && (
            <p className="patient-brief-summary-text">
              <strong>Equipment recommended:</strong> {assessment.equipmentRecommendedNote}
            </p>
          )}
          <p className="patient-brief-summary-text">
            <strong>Follow-up:</strong> {followUpLabel ?? "Not specified"}
            {assessment.followUp === "other" && assessment.followUpOther ? ` — ${assessment.followUpOther}` : ""}
          </p>
        </div>

        <div className="patient-brief-footer">
          The Connexion Safety Score™ was administered in person by a licensed Connexion Method physical therapist. Generated on {generatedOn}.
        </div>
      </div>
    </div>
  );
}
