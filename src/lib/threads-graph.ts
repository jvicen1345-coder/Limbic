/** Client-safe types for Limbic Threads — reuses the exact same node/link/ring shape as
 *  Limbic Agent's spiderweb (see lib/agent-graph.ts) so components/ThreadsNav.tsx can
 *  render with the same AgentGraph D3 component unmodified. What's different about
 *  Threads is what a click DOES — every node here also carries a ThreadsNodeAction
 *  describing that, kept in a side map rather than on AgentNode itself so AgentGraph
 *  never needs to know about it. AI-generated insight questions and the open-ended
 *  "Prompt Agent" handoff are NOT nodes in this web — they live in the separate
 *  ThreadsChat panel instead (see components/ThreadsChat.tsx), which is why
 *  ThreadsNodeAction only has real, non-AI destinations below. */

export type ThreadsRing = 0 | 1 | 2 | 3;

/** The 5 questions ThreadsChat can ask on a viewer's behalf (see components/ThreadsChat.tsx)
 *  — their answers are synthesized by Limbic Agent on demand for PRO users (see
 *  lib/threads-agent.ts), never fabricated ahead of time or shown as if sourced content. */
export type ThreadsInsightKind =
  | "implications"
  | "patient-education"
  | "contraindications"
  | "outcome-measures"
  | "case-studies";

export type ThreadsNodeAction =
  /** A real destination inside the app — an article, Search prefiltered by a tag, /nexus,
   *  or /clips. */
  | { kind: "navigate"; label: string; href: string }
  /** A real destination outside the app — a clip's actual YouTube URL. */
  | { kind: "external"; label: string; url: string };

export interface ThreadsNodeData {
  id: string;
  parentId: string | null;
  ring: ThreadsRing;
  label: string;
  /** Pre-computed for every real-data node (see lib/threads.ts) — always present by the
   *  time the node reaches the client. Insight/agent-handoff nodes start without one and
   *  get it filled in lazily (or replaced with an upsell message for non-PRO viewers). */
  detail: string;
  action: ThreadsNodeAction;
}

/** Node label + what to ask Limbic Agent for, shared between lib/threads.ts (builds the
 *  node shell) and lib/threads-agent.ts (server-only — prompts Claude with the same
 *  framing) so the two never drift apart. */
export const THREADS_INSIGHT_META: Record<ThreadsInsightKind, { label: string; ask: string }> = {
  implications: {
    label: "Clinical Implications",
    ask: "what this specific finding means for day-to-day clinical practice, how it should change or confirm what a treating clinician actually does",
  },
  "patient-education": {
    label: "Patient Education",
    ask: "how a clinician should explain this article's finding to a patient in plain, non-clinical language",
  },
  contraindications: {
    label: "Contraindications",
    ask: "precautions, contraindications, or red flags a clinician should watch for when applying what this article describes",
  },
  "outcome-measures": {
    label: "Outcome Measures",
    ask: "specific, established outcome measures or ways to track a patient's progress relevant to this article's topic",
  },
  "case-studies": {
    label: "Case Studies",
    ask: "what a realistic real-world clinical case applying this article's finding might look like",
  },
};
