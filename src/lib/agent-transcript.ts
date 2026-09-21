import type { AgentNode } from "@/lib/agent-graph";

/** Opening turn. Not a graph node id — the live center node is always "center"
 *  (see startAgentWeb), and this id stays distinct so the echo can be recognized. */
export const QUESTION_TURN_ID = "question";

export interface AgentTranscriptTurn {
  nodeId: string;
  /** User bubble. The opening turn is the question the clinician typed; later turns
   *  are the selected node's short label. */
  label: string;
  /** Assistant bubble. Empty on the opening echo — the question itself is the label.
   *  Node turns carry that node's existing `detail`. */
  detail: string;
}

export function questionEchoTurn(question: string): AgentTranscriptTurn {
  return { nodeId: QUESTION_TURN_ID, label: question.trim(), detail: "" };
}

/**
 * Append a node's label and existing detail. Selecting a node that is already in the
 * transcript returns the same array — no duplicate, and the caller must not treat that
 * as a reason to call the model again.
 *
 * The center node's detail is the question itself (set in startAgentWeb and again when
 * AgentClient applies the response). That text is already the opening turn, so selecting
 * the center does not add a second copy. Any other node whose detail happens to match
 * the question still appends; only the live center id is special.
 */
export function appendNodeTurn(
  turns: readonly AgentTranscriptTurn[],
  node: Pick<AgentNode, "id" | "label" | "detail">,
): readonly AgentTranscriptTurn[] {
  const detail = node.detail?.trim() ?? "";
  if (!detail) return turns;
  if (turns.some((turn) => turn.nodeId === node.id)) return turns;
  const echoed = turns.find((turn) => turn.nodeId === QUESTION_TURN_ID)?.label;
  if (echoed && node.id === "center" && detail === echoed) return turns;
  return [...turns, { nodeId: node.id, label: node.label, detail }];
}
