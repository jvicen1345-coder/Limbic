"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeferredAgentGraph } from "@/components/DeferredAgentGraph";
import { NetworkIcon, ChevronRightIcon } from "@/components/icons";
import type { AgentNode, AgentLink } from "@/lib/agent-graph";
import type { ThreadsNodeData } from "@/lib/threads-graph";

/** Same staggered-reveal pacing as Limbic Agent's own web (see AgentClient.tsx). Ring 0 is
 *  always exactly the one center node (see lib/threads.ts), so the gap before ring 1 starts
 *  revealing is REVEAL_DELAY_MS + RING_PAUSE_MS — tuned to land at 800ms. */
const REVEAL_DELAY_MS = 300;
const RING_PAUSE_MS = 500;

/** Matches a "navigate" node's href that points at another article (e.g. the Connected
 *  Research/Related Guidelines nodes built in lib/threads.ts) — nothing else, so a Search
 *  link or /nexus still falls through to a real navigation below. */
const ARTICLE_HREF = /^\/article\/([^/?]+)$/;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function useContainerSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 640, height: 320 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/**
 * The navigation half of Limbic Threads — a small web of real destinations (related
 * articles, guidelines, Nexus discussions) around the current article, nothing else. No
 * AI generation and no PRO gate here; see components/ThreadsChat.tsx for the AI-insight
 * half this panel used to also render as graph nodes.
 */
export function ThreadsNav({
  webNodes,
  onNavigateToArticle,
}: {
  /** Server-computed node shells for this article — every node arrives with `detail`
   *  already filled in (see lib/threads.ts). */
  webNodes: ThreadsNodeData[];
  /** When provided, a "navigate" node whose href points at another article (see
   *  ARTICLE_HREF above) calls this with that article's id instead of doing a real
   *  navigation — see components/ArticleThreadsSplitView.tsx, which swaps the reading
   *  pane in place so exploring a chain of connected articles doesn't reload the whole
   *  page each time. Every other node (Search links, /nexus) still does a real navigation
   *  regardless — only leaving to a different article stays in-pane. Omit this prop to
   *  keep ThreadsNav's default behavior (always a real navigation). */
  onNavigateToArticle?: (articleId: string) => void;
}) {
  const router = useRouter();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const revealStarted = useRef(false);
  const [containerRef, size] = useContainerSize();

  const byId = useMemo(() => new Map(webNodes.map((n) => [n.id, n])), [webNodes]);
  const selectedWeb = selectedId ? (byId.get(selectedId) ?? null) : null;

  const nodes: AgentNode[] = useMemo(
    () =>
      webNodes
        .filter((n) => revealedIds.has(n.id))
        .map((n) => ({ id: n.id, parentId: n.parentId, ring: n.ring, label: n.label, expandable: true })),
    [webNodes, revealedIds]
  );
  const links: AgentLink[] = useMemo(
    () =>
      nodes
        .filter((n): n is AgentNode & { parentId: string } => n.parentId != null)
        .map((n) => ({ source: n.parentId, target: n.id, kind: "tree" as const })),
    [nodes]
  );

  useEffect(() => {
    if (revealStarted.current) return;
    revealStarted.current = true;
    (async () => {
      for (const ring of [0, 1, 2, 3] as const) {
        const ringNodes = webNodes.filter((n) => n.ring === ring);
        for (const n of ringNodes) {
          setRevealedIds((prev) => new Set(prev).add(n.id));
          await sleep(REVEAL_DELAY_MS);
        }
        await sleep(RING_PAUSE_MS);
      }
    })();
  }, [webNodes]);

  return (
    <div className="threads-wrap">
      <div className="threads-header">
        <NetworkIcon size={16} style={{ color: "#6ea8ff" }} />
        Limbic Threads
      </div>
      <p className="threads-caption">Explore connections from this article</p>
      <div className="agent-canvas-wrap threads-canvas-wrap" ref={containerRef}>
        <DeferredAgentGraph
          nodes={nodes}
          links={links}
          selectedId={selectedId}
          loadingId={null}
          width={size.width}
          height={size.height}
          onNodeClick={(node) => setSelectedId(node.id)}
          onBackgroundClick={() => setSelectedId(null)}
        />
      </div>

      {/* A normal block below the canvas, not an absolutely-positioned overlay on top of
          it like Limbic Agent's own .agent-detail-card (see src/styles) — Threads' canvas
          sits in a normal scrolling article page where a force-simulated node can end up
          anywhere, including right where a docked overlay would sit, which would make
          whatever's underneath unclickable. */}
      {selectedWeb && (
        <div className="threads-detail-panel">
          <button type="button" className="agent-detail-close" aria-label="Close" onClick={() => setSelectedId(null)}>
            ×
          </button>
          <div className="agent-detail-kicker">Ring {selectedWeb.ring}</div>
          <div className="agent-detail-title">{selectedWeb.label}</div>
          <p className="agent-detail-body">{selectedWeb.detail}</p>
          {selectedWeb.action.kind === "navigate" && (
            <button
              type="button"
              className="btn btn-secondary threads-detail-cta"
              onClick={() => {
                if (selectedWeb.action.kind !== "navigate") return;
                const articleMatch = ARTICLE_HREF.exec(selectedWeb.action.href);
                if (articleMatch && onNavigateToArticle) {
                  onNavigateToArticle(articleMatch[1]);
                } else {
                  router.push(selectedWeb.action.href);
                }
              }}
            >
              {selectedWeb.action.label}
              <ChevronRightIcon size={13} />
            </button>
          )}
          {selectedWeb.action.kind === "external" && (
            <a
              href={selectedWeb.action.kind === "external" ? selectedWeb.action.url : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary threads-detail-cta"
            >
              {selectedWeb.action.label} ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
