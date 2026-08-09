"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";

const MAX_LENGTH = 2000;

export interface SubmitSuggestionResult {
  ok: boolean;
  error?: string;
}

/**
 * Profile page's anonymous Suggestion Box (see components/SuggestionBoxCard.tsx). Requires
 * a signed-in session purely to keep this a real-user-only surface, not a public form —
 * the submitter's identity is never written anywhere. The Suggestion row itself has no
 * userId/user relation at all (see prisma/schema.prisma), so there's nothing here for even
 * a site admin to trace back to an account.
 */
export async function submitSuggestionAction(body: string): Promise<SubmitSuggestionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You need to be signed in to send a suggestion." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Write a suggestion before sending." };
  if (trimmed.length > MAX_LENGTH) return { ok: false, error: `Keep it under ${MAX_LENGTH} characters.` };

  await prisma.suggestion.create({ data: { body: trimmed } });
  return { ok: true };
}

/** Admin-only — lets an admin clear out old/handled suggestions so the list stays
 *  manageable, same "re-check server-side even though the UI is admin-only" reasoning as
 *  every other admin action (see app/actions/admin.ts). */
export async function deleteSuggestionAction(id: string) {
  if (!(await isSiteAdmin())) return;
  await prisma.suggestion.delete({ where: { id } });
  revalidatePath("/admin/suggestions");
}
