"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { askAgentAction, expandAgentNodeAction } from "@/app/actions/agent";
import { AgentGraph } from "@/components/AgentGraph";
import type { AgentNode, AgentLink, AgentRing } from "@/lib/agent-graph";

/** Before any question is asked, the canvas shows exactly this one node, breathing (see
 *  the .agent-node-breathing rule in globals.css) — "the best clinician in the world,
 *  available 24/7," waiting. */
const IDLE_NODE: AgentNode = { id: "center", parentId: null, ring: 0, label: "Limbic Agent", expandable: false };

/** Delay between each node in a ring appearing — slow and deliberate on purpose, so the
 *  web reads as being thought through in real time rather than dumped onto the canvas. */
const REVEAL_DELAY_MS = 420;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function useContainerSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 640, height: 480 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Walks parentId up to the root, returning ancestor labels root-first (excluding the
 *  clicked node itself) — gives the model the reasoning path so far when expanding. */
function ancestorLabelsOf(nodeId: string, nodes: AgentNode[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const labels: string[] = [];
  let current = byId.get(nodeId)?.parentId ?? null;
  while (current) {
    const node = byId.get(current);
    if (!node) break;
    if (node.ring > 0) labels.unshift(node.label);
    current = node.parentId;
  }
  return labels;
}

export function AgentClient() {
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const [nodes, setNodes] = useState<AgentNode[]>([IDLE_NODE]);
  const [crossLinks, setCrossLinks] = useState<AgentLink[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerRef, size] = useContainerSize();

  const treeLinks: AgentLink[] = useMemo(
    () =>
      nodes
        .filter((n): n is AgentNode & { parentId: string } => n.parentId != null)
        .map((n) => ({ source: n.parentId, target: n.id, kind: "tree" as const })),
    [nodes]
  );
  const links = useMemo(() => [...treeLinks, ...crossLinks], [treeLinks, crossLinks]);
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  async function revealStaggered(newNodes: AgentNode[]) {
    for (const n of newNodes) {
      setNodes((prev) => [...prev, n]);
      await sleep(REVEAL_DELAY_MS);
    }
  }

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || starting) return;
    setStarting(true);
    setError(null);
    setSelectedId(null);
    setCrossLinks([]);
    setAskedQuestion(trimmed);
    // Instant, optimistic "transform" — the idle node becomes the question right away,
    // before the model has even responded, so the first thing the user sees is a reaction.
    setNodes([{ id: "center", parentId: null, ring: 0, label: truncate(trimmed, 42), expandable: false }]);

    const result = await askAgentAction(trimmed);
    if (!result.ok) {
      setStarting(false);
      setError(result.message);
      return;
    }

    const center = result.nodes.find((n) => n.ring === 0);
    const ring1 = result.nodes.filter((n) => n.ring === 1);
    if (center) {
      // A second, smaller transform: the raw question refines into the model's own
      // concise framing of it.
      setNodes([{ ...center, detail: trimmed }]);
      await sleep(500);
    }
    await revealStaggered(ring1);
    setStarting(false);
  }

  async function handleNodeClick(node: AgentNode) {
    setSelectedId(node.id);
    if (!node.expandable) return;
    const alreadyExpanded = nodes.some((n) => n.parentId === node.id);
    if (alreadyExpanded || loadingId || !askedQuestion) return;

    setLoadingId(node.id);
    setError(null);
    const ancestors = [...ancestorLabelsOf(node.id, nodes), node.label];
    const existingNodes = nodes.map((n) => ({ id: n.id, label: n.label }));
    const result = await expandAgentNodeAction(
      askedQuestion,
      node.id,
      node.label,
      node.ring as AgentRing,
      ancestors,
      existingNodes
    );
    setLoadingId(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await revealStaggered(result.nodes);
    if (result.crossLinks.length) setCrossLinks((prev) => [...prev, ...result.crossLinks]);
  }

  return (
    <div className="agent-page">
      <div className="agent-topbar">
        <span>
          <strong>Clinical decision support, not diagnosis.</strong> Never diagnoses, never recommends
          medication — always defer to your own direct patient assessment.
        </span>
      </div>

      <div className="agent-canvas-wrap" ref={containerRef}>
        <AgentGraph
          nodes={nodes}
          links={links}
          selectedId={selectedId}
          loadingId={loadingId}
          width={size.width}
          height={size.height}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedId(null)}
        />

        {selectedNode?.detail && (
          <div className="agent-detail-card">
            <button
              type="button"
              className="agent-detail-close"
              aria-label="Close"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            <div className="agent-detail-kicker">
              {selectedNode.ring === 0 ? "Your question" : `Ring ${selectedNode.ring}`}
            </div>
            <div className="agent-detail-title">{selectedNode.label}</div>
            <p className="agent-detail-body">{selectedNode.detail}</p>
            {selectedNode.expandable && !nodes.some((n) => n.parentId === selectedNode.id) && (
              <p className="agent-detail-hint">
                {loadingId === selectedNode.id ? "Growing the web…" : "Click this node again to expand it."}
              </p>
            )}
          </div>
        )}

        {error && <div className="agent-error">{error}</div>}
      </div>

      <div className="agent-input-bar">
        <input
          placeholder="Ask a clinical question or describe a case…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
          disabled={starting}
        />
        <button type="button" disabled={starting || !question.trim()} onClick={handleAsk}>
          {starting ? "Thinking…" : "Ask"}
        </button>
      </div>
    </div>
  );
}
