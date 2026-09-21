"use client";

import { useEffect, useRef, useState } from "react";
import { DeferredAgentGraph } from "@/components/DeferredAgentGraph";
import type { AgentLink, AgentNode } from "@/lib/agent-graph";

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

/**
 * Structure only — the question at the center, category labels, and expansion.
 * Clinical prose stays in AgentReasoning. Focus mode and hover-only cross-links
 * are the #535 behavior: AgentGraph draws a cross-link only while an endpoint is
 * hovered or selected, and collapsed siblings show the dashed count ring.
 */
export function AgentWeb({
  nodes,
  links,
  selectedId,
  loadingId,
  collapsedChildCounts,
  error,
  onNodeClick,
  onBackgroundClick,
}: {
  nodes: AgentNode[];
  links: AgentLink[];
  selectedId: string | null;
  loadingId: string | null;
  collapsedChildCounts: Readonly<Record<string, number>>;
  error: string | null;
  onNodeClick: (node: AgentNode) => void;
  onBackgroundClick: () => void;
}) {
  const [containerRef, size] = useContainerSize();

  return (
    <div className="agent-web-pane">
      <div className="agent-canvas-wrap" ref={containerRef}>
        <DeferredAgentGraph
          nodes={nodes}
          links={links}
          selectedId={selectedId}
          loadingId={loadingId}
          width={size.width}
          height={size.height}
          focusMode
          collapsedChildCounts={collapsedChildCounts}
          onNodeClick={onNodeClick}
          onBackgroundClick={onBackgroundClick}
        />
        {error ? <div className="agent-error">{error}</div> : null}
      </div>
    </div>
  );
}
