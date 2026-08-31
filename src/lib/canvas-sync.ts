import "server-only";
import { prisma } from "@/lib/db";
import { fetchCanvasAssignments, CanvasApiError } from "@/lib/canvas";

/** Pulls every due-dated assignment from a student's connected Canvas account and reconciles
 *  it against this app's own Assignment rows — see prisma/schema.prisma's CanvasConnection/
 *  Assignment comments for the shape being kept in sync. Upserts by (userId,
 *  canvasAssignmentId) rather than delete-all-then-recreate, so a `completed` checkbox a
 *  student already ticked here survives a re-sync; a fresh submission.workflow_state from
 *  Canvas is only used to *set* completed, never to un-set a local completion the student
 *  recorded some other way. Rows for assignments no longer returned by Canvas (deleted,
 *  unenrolled, or now missing a due date) are removed, so a stale item never lingers on the
 *  This Week card or calendar after it's gone from Canvas itself. */
export async function syncCanvasForUser(userId: string): Promise<{ synced: number } | { error: string }> {
  const connection = await prisma.canvasConnection.findUnique({ where: { userId } });
  if (!connection) return { error: "Canvas is not connected" };

  let fetched;
  try {
    fetched = await fetchCanvasAssignments(connection.domain, connection.accessToken);
  } catch (err) {
    const message = err instanceof CanvasApiError ? err.message : "Could not reach Canvas";
    console.error("[canvas-sync] fetch failed", err);
    return { error: message };
  }

  const seenIds = new Set(fetched.map((a) => a.canvasAssignmentId));
  const existing = await prisma.assignment.findMany({
    where: { userId, source: "canvas" },
    select: { id: true, canvasAssignmentId: true },
  });
  const existingByCanvasId = new Map(existing.map((a) => [a.canvasAssignmentId, a.id]));

  // canvasAssignmentId is only nullable at the schema level for syllabus-sourced rows (see
  // Assignment's comment) — every row here is already filtered to source: "canvas", so it's
  // always set in practice, but the `?? ""` keeps this a plain string comparison for TS
  // without asserting that away.
  const staleIds = existing.filter((a) => !seenIds.has(a.canvasAssignmentId ?? "")).map((a) => a.id);

  await prisma.$transaction([
    ...(staleIds.length > 0 ? [prisma.assignment.deleteMany({ where: { id: { in: staleIds } } })] : []),
    ...fetched.map((a) => {
      const existingId = existingByCanvasId.get(a.canvasAssignmentId);
      const data = {
        title: a.title,
        dueDate: a.dueDate,
        category: "Assignment",
        courseCode: a.courseCode,
        courseName: a.courseName,
        canvasCourseId: a.canvasCourseId,
        canvasHtmlUrl: a.htmlUrl,
      };
      return existingId
        ? prisma.assignment.update({
            where: { id: existingId },
            // Canvas's own submission state can only turn this on here — never off, so a
            // completion this app recorded some other way (there isn't one for Canvas rows
            // today, but the same rule protects syllabus rows from a sync that shouldn't
            // touch them at all) is never silently reverted by a re-sync.
            data: a.submitted ? { ...data, completed: true, completedAt: new Date() } : data,
          })
        : prisma.assignment.create({
            data: {
              ...data,
              userId,
              source: "canvas",
              canvasAssignmentId: a.canvasAssignmentId,
              completed: a.submitted,
              completedAt: a.submitted ? new Date() : null,
            },
          });
    }),
    prisma.canvasConnection.update({ where: { userId }, data: { lastSyncedAt: new Date() } }),
  ]);

  return { synced: fetched.length };
}
