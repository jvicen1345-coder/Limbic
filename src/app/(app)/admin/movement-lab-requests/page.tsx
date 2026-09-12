import { redirect } from "next/navigation";
import { hasAdminArea } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { MovementLabRequestQueue } from "@/components/MovementLabRequestQueue";
import { searchExercisesScored } from "@/lib/movement-lab";
import type { RequestMatch } from "@/components/MovementLabRequestQueue";

/** An average at or below this matched only an indication, a target or a region — related to
 *  the request rather than the thing itself. See searchExercisesScored on where the bands come
 *  from. Set at the name/alias boundary so "found it" means what an admin would mean by it. */
const CONFIDENT_SCORE_PER_TERM = 50;

/**
 * Does the bank already contain the exercise this row is asking for?
 *
 * Answered here, at render time, because Movement Lab is a static TS catalog — so the queue
 * can check itself rather than sending an admin to search for each row by hand.
 *
 * Deliberately searched without the requested region as a filter. A clinician's guess at the
 * region is often not where the exercise ends up (several of the shoulder-tagged requests are
 * filed under Back), and a region filter would hide exactly those. The match reports the
 * region it actually landed in instead, which is the more useful thing to show.
 */
function findMatch(name: string): RequestMatch | null {
  const scored = searchExercisesScored(name);
  const top = scored[0];
  if (!top) return null;
  return {
    id: top.exercise.id,
    name: top.exercise.name,
    region: top.exercise.region,
    confident: top.terms > 0 && top.score / top.terms >= CONFIDENT_SCORE_PER_TERM,
    alsoSee: scored.slice(1, 3).map((s) => s.exercise.name),
  };
}

/** Admin-only — read-only queue of every pending Movement Lab exercise request (see the
 *  inline "Request to add" flow on components/pro/dashboard/HepExerciseList.tsx,
 *  app/actions/movement-lab-requests.ts). Same "must be admin" redirect idiom as
 *  /admin/suggestions and /admin/licenses. */
export default async function AdminMovementLabRequestsPage() {
  if (!(await hasAdminArea("movementLab"))) redirect("/home");

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
    match: findMatch(r.name),
  }));
  const readyToMark = rows.filter((r) => r.match?.confident).length;

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Movement Lab Exercise Requests</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Exercises clinicians couldn&rsquo;t find in Movement Lab, requested inline from the Clinician Dashboard, {rows.length} awaiting
        review.
        {readyToMark > 0 && (
          <>
            {" "}
            <strong style={{ color: "var(--color-success)" }}>
              {readyToMark} {readyToMark === 1 ? "is" : "are"} already in the Lab
            </strong>{" "}
            and can be marked added.
          </>
        )}
      </p>

      <div className="card elev-sm">
        <MovementLabRequestQueue rows={rows} />
      </div>
    </div>
  );
}
