import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getNormativeData } from "@/app/actions/force-lab";
import { getNormativeComparison } from "@/lib/force-lab-units";
import { credentialFromName } from "@/lib/meta";
import { ForceLabAssessmentPrintView } from "@/components/pro/force-lab/ForceLabAssessmentPrintView";

/** Standalone print document for one Force Lab assessment (see the "Download Assessment"
 *  link on AssessmentExpandedView.tsx / PatientAssessmentCard.tsx) — same pattern as
 *  patient-brief/[patientId]: outside the (app) route group (no sidebar to hide for print),
 *  forced light mode via the reused .patient-brief-* classes (literal colors, never the
 *  app's --color-* tokens), notFound() ownership check, a fixed topbar hidden on print. This
 *  page only does data fetching — ForceLabAssessmentPrintView is the client component that
 *  owns the Clinical/Patient report toggle and renders both document layouts. */
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

  // user.name stores the credential inline ("Jane Doe, DPT" — see credentialFromName's own
  // comment), so the plain name for "Prepared by: <name>, <credential>" is everything before
  // that same comma — otherwise a clinician with a credential in their name sees it twice.
  const clinicianCredential = credentialFromName(user.name) ?? "";
  const clinicianName = clinicianCredential ? user.name.slice(0, user.name.lastIndexOf(",")).trim() : user.name;

  return (
    <div className="patient-brief-page">
      <ForceLabAssessmentPrintView
        assessment={assessment}
        normsWithData={normsWithData}
        clinicianName={clinicianName}
        clinicianCredential={clinicianCredential}
        clinicianClinicName={user.clinicName ?? ""}
        generatedOn={generatedOn}
        initialPatientSummary={assessment.patientSummary}
      />
    </div>
  );
}
