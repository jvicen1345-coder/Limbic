/** Shared types for the Limbic Agent spiderweb — the mind-map graph the client renders
 *  with D3 and the server grows one ring at a time (see lib/agent.ts). Kept separate from
 *  lib/agent.ts (server-only) so the client component can import just the shapes. */

export type AgentRing = 0 | 1 | 2 | 3;

export interface AgentNode {
  id: string;
  parentId: string | null;
  ring: AgentRing;
  label: string;
  /** Longer explanation shown in the detail panel when the node is selected — absent on
   *  the center node, which only ever carries the original question. */
  detail?: string;
  /** Ring 1/2 nodes the student/clinician can click to grow the web further; false for
   *  ring 3 (evidence/red-flag) nodes, which are always terminal. */
  expandable: boolean;
}

export interface AgentLink {
  source: string;
  target: string;
}
