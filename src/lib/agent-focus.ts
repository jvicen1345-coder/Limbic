import type { AgentLink, AgentNode } from "@/lib/agent-graph";

/**
 * Focus mode for the Limbic Agent web. The full node list stays in client state;
 * these helpers only decide which branch is on the canvas and which cross-links
 * are drawn. Threads does not use them.
 */

export function collapseSiblingsOnOpen(
  collapsed: ReadonlySet<string>,
  nodeId: string,
  nodes: readonly AgentNode[],
): Set<string> {
  const next = new Set(collapsed);
  next.delete(nodeId);
  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return next;
  for (const sibling of nodes) {
    if (sibling.id === nodeId || sibling.parentId !== node.parentId) continue;
    if (nodes.some((child) => child.parentId === sibling.id)) next.add(sibling.id);
  }
  return next;
}

export function visibleAgentNodes(nodes: readonly AgentNode[], collapsed: ReadonlySet<string>): AgentNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.filter((node) => !hasCollapsedAncestor(node, collapsed, byId));
}

function hasCollapsedAncestor(
  node: AgentNode,
  collapsed: ReadonlySet<string>,
  byId: ReadonlyMap<string, AgentNode>,
): boolean {
  const seen = new Set<string>();
  let parentId = node.parentId;
  while (parentId) {
    if (seen.has(parentId)) return false;
    seen.add(parentId);
    if (collapsed.has(parentId)) return true;
    parentId = byId.get(parentId)?.parentId ?? null;
  }
  return false;
}

/** Direct hidden children of each collapsed parent. Zero-child ids are omitted so a
 *  never-expanded node cannot pick up a collapsed affordance. */
export function collapsedChildCounts(
  nodes: readonly AgentNode[],
  collapsed: ReadonlySet<string>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of collapsed) {
    let count = 0;
    for (const node of nodes) if (node.parentId === id) count += 1;
    if (count > 0) counts[id] = count;
  }
  return counts;
}

/** Tree links always draw. A cross-link draws only when it touches the hovered node,
 *  or the selected node when nothing is hovered. */
export function isLinkDrawn(
  link: Pick<AgentLink, "source" | "target" | "kind">,
  hoverId: string | null,
  selectedId: string | null,
): boolean {
  if (link.kind !== "cross") return true;
  const focusId = hoverId ?? selectedId;
  if (!focusId) return false;
  return link.source === focusId || link.target === focusId;
}
