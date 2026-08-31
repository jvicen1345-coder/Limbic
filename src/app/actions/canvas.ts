"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { verifyCanvasToken, normalizeCanvasDomain, CanvasApiError } from "@/lib/canvas";
import { syncCanvasForUser } from "@/lib/canvas-sync";

type ActionError = { error: string };

/** Same gate as every mutation in app/actions/syllabus.ts — a Canvas connection is part of
 *  the same Limbic Student assignment-tracking feature, not "signed in" generally. */
async function requireStudentUser() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return null;
  return user;
}

export interface CanvasConnectionInfo {
  domain: string;
  canvasName: string | null;
  lastSyncedAt: Date | null;
}

export async function getCanvasConnection(): Promise<CanvasConnectionInfo | null> {
  const user = await requireStudentUser();
  if (!user) return null;

  const connection = await prisma.canvasConnection.findUnique({ where: { userId: user.id } });
  if (!connection) return null;
  return { domain: connection.domain, canvasName: connection.canvasName, lastSyncedAt: connection.lastSyncedAt };
}

/** Verifies the domain/token pair against Canvas itself before storing anything — see
 *  lib/canvas.ts verifyCanvasToken — then runs an initial sync so the assignments page and
 *  the Atrium widgets have real data the moment this returns, rather than an empty connection
 *  the student has to separately trigger a sync on to see anything happen. */
export async function connectCanvasAction(rawDomain: string, token: string): Promise<ActionError | { success: true; synced: number }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const domain = normalizeCanvasDomain(rawDomain);
  if (!domain || !token.trim()) return { error: "Canvas domain and access token are both required." };

  let identity;
  try {
    identity = await verifyCanvasToken(domain, token.trim());
  } catch (err) {
    return { error: err instanceof CanvasApiError ? err.message : "Could not connect to Canvas." };
  }

  await prisma.canvasConnection.upsert({
    where: { userId: user.id },
    create: { userId: user.id, domain, accessToken: token.trim(), canvasUserId: String(identity.id), canvasName: identity.name },
    update: { domain, accessToken: token.trim(), canvasUserId: String(identity.id), canvasName: identity.name },
  });

  const result = await syncCanvasForUser(user.id);
  revalidatePath("/student/assignments");
  revalidatePath("/student");
  if ("error" in result) return { error: `Connected, but the first sync failed: ${result.error}` };
  return { success: true, synced: result.synced };
}

export async function disconnectCanvasAction(): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.$transaction([
    prisma.assignment.deleteMany({ where: { userId: user.id, source: "canvas" } }),
    prisma.canvasConnection.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true };
}

export async function syncCanvasNowAction(): Promise<ActionError | { success: true; synced: number }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const result = await syncCanvasForUser(user.id);
  revalidatePath("/student/assignments");
  revalidatePath("/student");
  if ("error" in result) return { error: result.error };
  return { success: true, synced: result.synced };
}
