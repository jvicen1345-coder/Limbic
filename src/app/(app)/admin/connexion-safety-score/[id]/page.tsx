import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { getSafetyAssessment } from "@/app/actions/connexion-safety-score";
import { SafetyAssessmentForm } from "@/components/connexion/SafetyAssessmentForm";
import { SAFETY_SCORE_DOMAINS, domainMaxScore } from "@/lib/connexion-safety-score";

/** View/edit one Connexion Safety Score assessment — same form as .../new, pre-filled and
 *  wired to updateSafetyAssessment instead of createSafetyAssessment. */
export default async function ConnexionSafetyScoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isSiteAdmin())) redirect("/home");

  const { id } = await params;
  const assessment = await getSafetyAssessment(id);
  if (!assessment) notFound();

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>{assessment.clientName}</h1>
          {/* Domain subtotals beside the total, matching the printed report — the risk band
              on its own says how bad, not what drove it. */}
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 4px" }}>
            Administered by {assessment.administeredByName} · Total {assessment.totalScore} / 208 · {assessment.riskLevel} Risk
          </p>
          <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
            Environmental {assessment.environmentalScore} / {domainMaxScore(SAFETY_SCORE_DOMAINS[0])} · Mobility{" "}
            {assessment.mobilityScore} / {domainMaxScore(SAFETY_SCORE_DOMAINS[1])} · Fall risk{" "}
            {assessment.fallRiskScore} / {domainMaxScore(SAFETY_SCORE_DOMAINS[2])}
          </p>
        </div>
        <Link href={`/admin/connexion-safety-score/${id}/print`} className="btn btn-secondary" target="_blank">
          Print
        </Link>
      </div>
      <SafetyAssessmentForm mode="edit" id={id} initial={assessment} />
    </div>
  );
}
