import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { VisitRequestsAdminList } from "@/components/connexion/VisitRequestsAdminList";

/** Admin-only — every home-visit request submitted through ConnexionScheduleSection (see
 *  ConnexionVisitRequest in schema.prisma, submitVisitRequest in app/actions/connexion.ts).
 *  Same "must be admin" redirect idiom as /admin/suggestions and /admin/licenses. */
export default async function AdminConnexionVisitsPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const requests = await prisma.connexionVisitRequest.findMany({ orderBy: { createdAt: "desc" } });
  const newCount = requests.filter((r) => r.status === "new").length;

  const rows = requests.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    preferredDate: r.preferredDate?.toISOString() ?? null,
    preferredTime: r.preferredTime,
    visitReason: r.visitReason,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="screen-pad" style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Connexion Visit Requests</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Home visit requests from /connexion and /connexion/delia, {requests.length} total,{" "}
        {newCount} new. Visible only to site admins.
      </p>

      <div className="card elev-sm">
        <VisitRequestsAdminList rows={rows} />
      </div>
    </div>
  );
}
