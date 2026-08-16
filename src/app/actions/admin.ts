"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

export interface DeleteUserResult {
  ok: boolean;
  error?: string;
}

/**
 * Admin-only — deletes one account and everything that cascades off it in schema.prisma
 * (saved articles, reading/games/boards history, HEP programs, calendar events, vitals,
 * Nexus posts/likes/comments/connections/messages), leaving everyone else's data untouched
 * — see app/(app)/admin/accounts/page.tsx, the per-row "Delete" button this backs.
 *
 * Refuses to delete the admin's own account (redirects them to Profile's own
 * deleteAccountAction instead, which has its own "type DELETE" confirmation) — this list is
 * for cleaning up other accounts, and silently signing the admin themselves out mid-review
 * because they misclicked their own row would be a bad way to find that out.
 */
export async function deleteUserAction(userId: string): Promise<DeleteUserResult> {
  const admin = await getCurrentUser();
  if (!admin || !(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  if (userId === admin.id) return { ok: false, error: "Use Profile to delete your own account." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  await prisma.$transaction([
    prisma.foundingFunderWaitlist.deleteMany({ where: { email: target.email ?? "" } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidatePath("/admin/accounts");
  return { ok: true };
}
