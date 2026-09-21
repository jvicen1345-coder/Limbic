import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentLink, AgentNode } from "./agent-graph";
import { collapseSiblingsOnOpen, collapsedChildCounts, isLinkDrawn, visibleAgentNodes } from "./agent-focus";

function node(partial: Pick<AgentNode, "id" | "parentId" | "ring"> & Partial<AgentNode>): AgentNode {
  return { label: partial.id, expandable: partial.ring > 0 && partial.ring < 3, ...partial };
}

const tree: AgentNode[] = [
  node({ id: "center", parentId: null, ring: 0, expandable: false }),
  node({ id: "a", parentId: "center", ring: 1 }),
  node({ id: "b", parentId: "center", ring: 1 }),
  node({ id: "c", parentId: "center", ring: 1 }),
  node({ id: "a1", parentId: "a", ring: 2 }),
  node({ id: "a2", parentId: "a", ring: 2 }),
  node({ id: "a1x", parentId: "a1", ring: 3, expandable: false }),
  node({ id: "a2x", parentId: "a2", ring: 3, expandable: false }),
  node({ id: "b1", parentId: "b", ring: 2 }),
];

describe("collapseSiblingsOnOpen", () => {
  it("collapses sibling branches that already have children and leaves never-expanded siblings alone", () => {
    const opened = collapseSiblingsOnOpen(new Set(), "b", tree);
    assert.deepEqual([...opened].sort(), ["a"]);
    assert.equal(opened.has("c"), false);
    assert.equal(opened.has("b"), false);
  });

  it("reopens a collapsed parent without discarding nested collapse inside that branch", () => {
    const afterA1 = collapseSiblingsOnOpen(new Set(), "a1", tree);
    assert.deepEqual([...afterA1].sort(), ["a2"]);
    const afterB = collapseSiblingsOnOpen(afterA1, "b", tree);
    assert.ok(afterB.has("a"));
    assert.ok(afterB.has("a2"));
    assert.equal(afterB.has("b"), false);
    const reopenedA = collapseSiblingsOnOpen(afterB, "a", tree);
    assert.equal(reopenedA.has("a"), false);
    assert.ok(reopenedA.has("a2"));
    assert.ok(reopenedA.has("b"));
  });
});

describe("visibleAgentNodes", () => {
  it("hides descendants of a collapsed parent and keeps that parent on the canvas", () => {
    const collapsed = collapseSiblingsOnOpen(new Set(), "b", tree);
    const visible = visibleAgentNodes(tree, collapsed).map((n) => n.id);
    assert.deepEqual(visible.sort(), ["a", "b", "b1", "c", "center"]);
    assert.equal(tree.length, 9);
  });

  it("restores previously generated descendants, still hiding a nested collapsed sibling", () => {
    const collapsed = collapseSiblingsOnOpen(collapseSiblingsOnOpen(new Set(), "a1", tree), "b", tree);
    const reopened = collapseSiblingsOnOpen(collapsed, "a", tree);
    const visible = visibleAgentNodes(tree, reopened).map((n) => n.id);
    assert.ok(visible.includes("a1"));
    assert.ok(visible.includes("a1x"));
    assert.ok(visible.includes("a2"));
    assert.equal(visible.includes("a2x"), false);
    assert.equal(visible.includes("b1"), false);
    assert.ok(visible.includes("b"));
    assert.equal(collapsedChildCounts(tree, reopened).a2, 1);
    assert.equal(collapsedChildCounts(tree, reopened).b, 1);
  });
});

describe("collapsedChildCounts", () => {
  it("counts direct hidden children and skips parents that were never expanded", () => {
    const collapsed = collapseSiblingsOnOpen(new Set(), "b", tree);
    assert.deepEqual(collapsedChildCounts(tree, collapsed), { a: 2 });
    assert.equal(collapsedChildCounts(tree, new Set()).c, undefined);
  });
});

describe("isLinkDrawn", () => {
  const crossAB: AgentLink = { source: "a1", target: "b1", kind: "cross" };
  const crossOther: AgentLink = { source: "c", target: "a2", kind: "cross" };
  const treeLink: AgentLink = { source: "a", target: "a1", kind: "tree" };

  it("hides every cross-link until a node is hovered or selected", () => {
    assert.equal(isLinkDrawn(crossAB, null, null), false);
    assert.equal(isLinkDrawn(treeLink, null, null), true);
  });

  it("draws only the hovered node's relations, and falls back to the selection when nothing is hovered", () => {
    assert.equal(isLinkDrawn(crossAB, "a1", "c"), true);
    assert.equal(isLinkDrawn(crossOther, "a1", "c"), false);
    assert.equal(isLinkDrawn(crossOther, null, "c"), true);
    assert.equal(isLinkDrawn(crossAB, null, "c"), false);
    assert.equal(isLinkDrawn(crossAB, null, null), false);
  });
});
