"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import type { MovementLabRequestStatus } from "@/lib/movement-lab-requests";

interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Submitted inline from the exercise-name autocomplete on the Clinician Dashboard's HEP/
 *  Session Exercises editor (see components/pro/dashboard/HepExerciseList.tsx) when a typed
 *  exercise name has no Movement Lab match. Any signed-in clinician can submit — same isPro
 *  gate as the rest of that dashboard's exercise-logging actions, not admin-only; review
 *  happens at /admin/movement-lab-requests (app/actions/movement-lab-requests.ts below). */
export async function requestMovementLabExercise(name: string, region: string | null, note: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return { ok: false, error: "Not authorized." };

  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: "An exercise name is required." };

  await prisma.movementLabExerciseRequest.create({
    data: { userId: user.id, name: trimmedName, region, note: note.trim() || null },
  });

  revalidatePath("/admin/movement-lab-requests");
  return { ok: true };
}

/** Shared by markMovementLabRequestAdded/declineMovementLabRequest below — same
 *  isSiteAdmin() gate as every other admin surface (Suggestions, License Queue). Leaves the
 *  row in place with its new status rather than deleting it, same "keep a record" reasoning
 *  as rejectLicenseAction in app/actions/license.ts. Movement Lab itself is a hand-curated
 *  static TS catalog (lib/movement-lab), not a database table — marking a request "added"
 *  doesn't insert anything automatically, it just records that an admin has since written it
 *  into the appropriate region file by hand. */
async function setRequestStatus(id: string, status: MovementLabRequestStatus): Promise<ActionResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  await prisma.movementLabExerciseRequest.update({ where: { id }, data: { status, reviewedAt: new Date() } });
  revalidatePath("/admin/movement-lab-requests");
  return { ok: true };
}

export async function markMovementLabRequestAdded(id: string): Promise<ActionResult> {
  return setRequestStatus(id, "added");
}

export async function declineMovementLabRequest(id: string): Promise<ActionResult> {
  return setRequestStatus(id, "declined");
}
