/** Shared types for the Limbic Agent spiderweb — the mind-map graph the client renders
 *  with D3 and the server grows one ring at a time (see lib/agent.ts). Kept separate from
 *  lib/agent.ts (server-only) so the client component can import just the shapes. */

export type AgentRing = 0 | 1 | 2 | 3;

export interface AgentNode {
  id: string;
  parentId: string | null;
  ring: AgentRing;
  label: string;
  /** Longer explanation shown in the detail overlay when the node is selected — absent on
   *  the idle center node, which only ever carries "Limbic Agent" until a question is asked. */
  detail?: string;
  /** Ring 1/2 nodes the student/clinician can click to grow the web further; false for
   *  ring 3 (evidence/red-flag) nodes and the center node, which are always terminal. */
  expandable: boolean;
}

export interface AgentLink {
  source: string;
  target: string;
  /** "tree" is a normal parent/child growth edge; "cross" is a subtle, dashed line the
   *  model drew between two related nodes in different branches (see expandAgentNode in
   *  lib/agent.ts) — visually distinct and never something a node's expansion depends on. */
  kind: "tree" | "cross";
}
