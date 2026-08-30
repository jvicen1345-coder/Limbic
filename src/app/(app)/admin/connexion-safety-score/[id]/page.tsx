import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { getSafetyAssessment } from "@/app/actions/connexion-safety-score";
import { SafetyAssessmentForm } from "@/components/connexion/SafetyAssessmentForm";

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
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
            Administered by {assessment.administeredByName} · Total {assessment.totalScore} / 208 · {assessment.riskLevel} Risk
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
