import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { MovementLabRequestQueue } from "@/components/MovementLabRequestQueue";

/** Admin-only — read-only queue of every pending Movement Lab exercise request (see the
 *  inline "Request to add" flow on components/pro/dashboard/HepExerciseList.tsx,
 *  app/actions/movement-lab-requests.ts). Same "must be admin" redirect idiom as
 *  /admin/suggestions and /admin/licenses. */
export default async function AdminMovementLabRequestsPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const pending = await prisma.movementLabExerciseRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, region: true, note: true, createdAt: true, user: { select: { name: true } } },
  });
  const rows = pending.map((r) => ({
    id: r.id,
    accountName: r.user.name,
    name: r.name,
    region: r.region,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Movement Lab Exercise Requests</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Exercises clinicians couldn&rsquo;t find in Movement Lab, requested inline from the Clinician Dashboard, {rows.length} awaiting
        review.
      </p>

      <div className="card elev-sm">
        <MovementLabRequestQueue rows={rows} />
      </div>
    </div>
  );
}
