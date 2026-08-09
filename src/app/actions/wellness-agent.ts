"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendWellnessAgentMessage, type WellnessAgentMessage, type WellnessAgentReply, type WellnessAgentError } from "@/lib/wellness-agent";

const NOT_ELIGIBLE_ERROR: WellnessAgentError = {
  ok: false,
  message: "Limbic Agent Wellness is available with LimbicWellness+ or LimbicPRO.",
};

/** Re-checked here, not just gated on the /wellness/agent page — a Server Action is its
 *  own callable endpoint regardless of which page's UI happens to call it (same reasoning
 *  as app/actions/agent.ts requireProUser). */
async function requireWellnessAgentUser() {
  const user = await getCurrentUser();
  if (!user || !(user.isWellnessPlus || user.isPro)) return null;
  return user;
}

export async function sendWellnessAgentMessageAction(
  history: WellnessAgentMessage[],
  equipment: string[],
  goal: string | null
): Promise<WellnessAgentReply | WellnessAgentError> {
  const user = await requireWellnessAgentUser();
  if (!user) return NOT_ELIGIBLE_ERROR;
  const trimmedHistory = history.filter((m) => m.content.trim().length > 0);
  if (trimmedHistory.length === 0) return { ok: false, message: "Ask a question to get started." };
  return sendWellnessAgentMessage(trimmedHistory, { equipment, goal });
}

/** Saves one agent response to Saved Wellness (see app/(app)/saved/wellness/page.tsx) — a
 *  fresh random itemId each time rather than reusing toggleSaveWellnessAction's toggle
 *  semantics, since an AI response has no natural pool id to toggle by and every save here
 *  is a distinct message, not a repeatable bookmark on the same underlying item. */
export async function saveAgentRecommendationAction(replyText: string, sources: string[]) {
  const user = await requireWellnessAgentUser();
  if (!user) return;
  const trimmed = replyText.trim();
  if (!trimmed) return;

  await prisma.savedWellness.create({
    data: {
      userId: user.id,
      itemId: randomUUID(),
      kind: "agent",
      title: "Limbic Agent Wellness recommendation",
      source: "Limbic Agent Wellness",
      summary: sources.length > 0 ? `${trimmed}\n\nSources: ${sources.join(", ")}` : trimmed,
    },
  });
  revalidatePath("/", "layout");
}
