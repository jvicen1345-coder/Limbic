import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { SafetyAssessmentForm } from "@/components/connexion/SafetyAssessmentForm";

/** New Connexion Safety Score assessment. `?visitRequestId=` (see the "Start Safety Score"
 *  link on VisitRequestsAdminList) pre-fills the client name from that lead and links the
 *  saved assessment back to it. */
export default async function NewConnexionSafetyScorePage({ searchParams }: { searchParams: Promise<{ visitRequestId?: string }> }) {
  if (!(await isSiteAdmin())) redirect("/home");

  const { visitRequestId } = await searchParams;
  const visitRequest = visitRequestId ? await prisma.connexionVisitRequest.findUnique({ where: { id: visitRequestId } }) : null;

  return (
    <div className="screen-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>New Safety Score Assessment</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>Visible only to site admins.</p>
      <SafetyAssessmentForm mode="create" visitRequestId={visitRequest?.id ?? null} initialClientName={visitRequest?.name} />
    </div>
  );
}
