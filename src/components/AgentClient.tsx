"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { askAgentAction, expandAgentNodeAction } from "@/app/actions/agent";
import { AgentGraph } from "@/components/AgentGraph";
import type { AgentNode, AgentLink, AgentRing } from "@/lib/agent-graph";

const GRAPH_HEIGHT = 520;

function useContainerWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
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
  const [nodes, setNodes] = useState<AgentNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerRef, containerWidth] = useContainerWidth();

  const links: AgentLink[] = useMemo(
    () =>
      nodes
        .filter((n): n is AgentNode & { parentId: string } => n.parentId != null)
        .map((n) => ({ source: n.parentId, target: n.id })),
    [nodes]
  );

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;
  const hasWeb = nodes.length > 0;

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || starting) return;
    setStarting(true);
    setError(null);
    const result = await askAgentAction(trimmed);
    setStarting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setAskedQuestion(trimmed);
    setNodes(result.nodes);
    setSelectedId("center");
  }

  async function handleNodeClick(node: AgentNode) {
    setSelectedId(node.id);
    if (!node.expandable) return;
    const alreadyExpanded = nodes.some((n) => n.parentId === node.id);
    if (alreadyExpanded || loadingId || !askedQuestion) return;

    setLoadingId(node.id);
    setError(null);
    const ancestors = [...ancestorLabelsOf(node.id, nodes), node.label];
    const result = await expandAgentNodeAction(askedQuestion, node.id, node.label, node.ring as AgentRing, ancestors);
    setLoadingId(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNodes((prev) => [...prev, ...result.nodes]);
  }

  function reset() {
    setNodes([]);
    setAskedQuestion(null);
    setSelectedId(null);
    setLoadingId(null);
    setError(null);
    setQuestion("");
  }

  return (
    <div className="screen-pad" style={{ maxWidth: 1100 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Agent</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 12px" }}>
        Clinical decision support — a living reasoning web that grows as you explore.
      </p>

      <div
        className="card elev-sm"
        style={{ marginBottom: 14, background: "var(--color-accent-100)", border: "1px solid var(--color-accent-300)" }}
      >
        <p style={{ fontSize: 12, color: "var(--color-accent-800)", margin: 0, lineHeight: 1.5 }}>
          <strong>Clinical decision support, not diagnosis.</strong> Limbic Agent never diagnoses a patient and
          never recommends medication. It exists to support your clinical reasoning — always defer to your own
          direct patient assessment and judgment.
        </p>
      </div>

      {!hasWeb ? (
        <div className="card elev-sm">
          <div className="card-kicker">Ask a clinical question or describe a case</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              className="input"
              placeholder="e.g. 45yo with lateral knee pain after increasing running mileage"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
            />
            <button type="button" className="btn btn-primary" disabled={starting || !question.trim()} onClick={handleAsk}>
              {starting ? "Building web…" : "Ask"}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 8 }}>{error}</p>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
              Exploring: <strong style={{ color: "var(--color-text)" }}>{askedQuestion}</strong>
            </div>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              New question
            </button>
          </div>

          {error && (
            <div className="card elev-sm" style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div
              ref={containerRef}
              className="card elev-sm"
              style={{ flex: "1 1 480px", minWidth: 0, padding: 0, overflow: "hidden" }}
            >
              <AgentGraph
                nodes={nodes}
                links={links}
                selectedId={selectedId}
                loadingId={loadingId}
                width={containerWidth}
                height={GRAPH_HEIGHT}
                onNodeClick={handleNodeClick}
              />
            </div>

            <div className="card elev-sm" style={{ flex: "0 0 280px", minWidth: 240, minHeight: 200 }}>
              {selectedNode ? (
                <>
                  <div className="card-kicker">
                    {selectedNode.ring === 0 ? "Your question" : `Ring ${selectedNode.ring}`}
                  </div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, margin: "6px 0 8px" }}>
                    {selectedNode.label}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
                    {selectedNode.detail}
                  </p>
                  {selectedNode.expandable && !nodes.some((n) => n.parentId === selectedNode.id) && (
                    <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", marginTop: 10, fontStyle: "italic" }}>
                      {loadingId === selectedNode.id ? "Growing the web…" : "Click this node again to expand it."}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>
                  Click a node to see the reasoning behind it.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
