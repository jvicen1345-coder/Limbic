"use server";

import { getCurrentUser } from "@/lib/session";
import { startAgentWeb, expandAgentNode, type AgentWebResult, type AgentWebError } from "@/lib/agent";
import type { AgentRing } from "@/lib/agent-graph";

const NOT_PRO_ERROR: AgentWebError = { ok: false, message: "Limbic Agent is a LimbicPro feature." };

/** Re-checked here, not just gated on the /agent page — a Server Action is its own
 *  callable endpoint regardless of which page's UI happens to call it (same reasoning as
 *  every other isPro-gated write in this app). */
async function requireProUser() {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return null;
  return user;
}

export async function askAgentAction(question: string): Promise<AgentWebResult | AgentWebError> {
  const user = await requireProUser();
  if (!user) return NOT_PRO_ERROR;
  const trimmed = question.trim();
  if (!trimmed) return { ok: false, message: "Ask a clinical question or describe a case to get started." };
  return startAgentWeb(trimmed, !!user.licenseNumber);
}

export async function expandAgentNodeAction(
  originalQuestion: string,
  parentId: string,
  nodeLabel: string,
  parentRing: AgentRing,
  ancestorLabels: string[],
  existingNodes: { id: string; label: string }[]
): Promise<AgentWebResult | AgentWebError> {
  const user = await requireProUser();
  if (!user) return NOT_PRO_ERROR;
  return expandAgentNode(
    originalQuestion,
    parentId,
    nodeLabel,
    parentRing,
    ancestorLabels,
    existingNodes,
    !!user.licenseNumber
  );
}
