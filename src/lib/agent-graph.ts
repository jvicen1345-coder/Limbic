/** Shared types for the Limbic Agent spiderweb — the mind-map graph the client renders
 *  with D3 and the server grows one ring at a time (see lib/agent.ts). Kept separate from
 *  lib/agent.ts (server-only) so the client component can import just the shapes. */

export type AgentRing = 0 | 1 | 2 | 3;

export interface AgentNode {
  id: string;
  parentId: string | null;
  ring: AgentRing;
  label: string;
  /** Longer explanation appended to the reasoning transcript when the node is selected —
   *  absent on the idle center node, which only ever carries "Limbic Agent" until a question
   *  is asked. Not rendered inside the web. */
  detail?: string;
  /** Ring 1/2 nodes the student/clinician can click to grow the web further; false for
   *  ring 3 (evidence/red-flag) nodes and the center node, which are always terminal. */
  expandable: boolean;
  /** Pins a node to the bottom-center of the canvas and renders it larger, with a warm
   *  amber glow/pulse, instead of the uniform ring-based styling every other node gets
   *  (see AgentGraph.tsx). Not currently set by either Limbic Agent's own spiderweb
   *  (AgentClient.tsx) or Limbic Threads' nav web (lib/threads.ts, components/ThreadsNav.tsx)
   *  — Threads' AI-generated "Prompt Agent" handoff moved to components/ThreadsChat.tsx's
   *  free-text bar instead of being a graph node. Kept as a generic, reusable variant rather
   *  than removed, since AgentGraph.tsx's rendering for it is otherwise unchanged. */
  variant?: "action";
}

export interface AgentLink {
  source: string;
  target: string;
  /** "tree" is a normal parent/child growth edge; "cross" is a dashed relation the
   *  model drew between two nodes in different branches (see expandAgentNode in
   *  lib/agent.ts). Cross-links stay in state, but AgentGraph draws one only while an
   *  endpoint is hovered or selected. */
  kind: "tree" | "cross";
}
