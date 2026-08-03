"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgentGraph } from "@/components/AgentGraph";
import { generateThreadsInsightAction } from "@/app/actions/threads";
import { NetworkIcon, ChevronRightIcon, LockIcon } from "@/components/icons";
import type { AgentNode, AgentLink } from "@/lib/agent-graph";
import type { ThreadsNodeData } from "@/lib/threads-graph";

/** Same staggered-reveal pacing as Limbic Agent's own web (see AgentClient.tsx) — slow
 *  and deliberate so each ring reads as appearing in sequence, not dumped on screen. */
const REVEAL_DELAY_MS = 380;
const RING_PAUSE_MS = 500;

/**
 * The 5 insight nodes (see lib/threads-graph.ts THREADS_INSIGHT_META) call Limbic Agent
 * live — same ANTHROPIC_API_KEY-gated path as lib/agent.ts, currently unfunded, so every
 * attempt fails with the same generic "isn't available right now" message regardless of
 * PRO status. Rather than let a click sit there and fail (reading as a bug, not a
 * limitation), this skips the attempt entirely and shows a plain "Coming Soon" state —
 * same spirit as AgentClient.tsx's own AGENT_DEMO_MODE flag. Flip to true once billing is
 * set up on the Anthropic account; nothing else about this component needs to change,
 * the real generateThreadsInsightAction path below is already fully wired.
 */
const THREADS_INSIGHTS_ENABLED = false;

/** Matches a "navigate" node's href that points at another article (e.g. the Connected
 *  Research/Related Guidelines nodes built in lib/threads.ts) — nothing else, so a Search
 *  link or /nexus/​/clips still falls through to a real navigation below. */
const ARTICLE_HREF = /^\/article\/([^/?]+)$/;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function useContainerSize(active: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 640, height: 420 });
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);
  return [ref, size] as const;
}

export function ThreadsWeb({
  articleId,
  webNodes,
  isPro,
  autoExpand = false,
  onNavigateToArticle,
}: {
  articleId: string;
  /** Server-computed node shells for this article — real-data nodes arrive with `detail`
   *  already filled in; the 5 insight nodes and the agent-handoff node arrive with an
   *  empty/static detail and get theirs lazily (see lib/threads.ts). */
  webNodes: ThreadsNodeData[];
  isPro: boolean;
  autoExpand?: boolean;
  /** When provided, a "navigate" node whose href points at another article (see
   *  ARTICLE_HREF above) calls this with that article's id instead of doing a real
   *  navigation — see components/ArticleThreadsSplitView.tsx, which swaps the reading
   *  pane in place so exploring a chain of connected articles doesn't reload the whole
   *  page each time. Every other node (Search links, /nexus, external clips) still does a
   *  real navigation regardless — only leaving to a different article stays in-pane.
   *  Omit this prop to keep ThreadsWeb's default behavior (always a real navigation),
   *  same as before this existed. */
  onNavigateToArticle?: (articleId: string) => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(autoExpand);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [insightCache, setInsightCache] = useState<Record<string, string>>({});
  const [insightError, setInsightError] = useState<Record<string, string>>({});
  const revealStarted = useRef(false);
  const [containerRef, size] = useContainerSize(expanded);

  const byId = useMemo(() => new Map(webNodes.map((n) => [n.id, n])), [webNodes]);
  const selectedWeb = selectedId ? (byId.get(selectedId) ?? null) : null;

  const nodes: AgentNode[] = useMemo(
    () =>
      webNodes
        .filter((n) => revealedIds.has(n.id))
        .map((n) => ({
          id: n.id,
          parentId: n.parentId,
          ring: n.ring,
          label: n.label,
          expandable: true,
        })),
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
    if (!expanded || revealStarted.current) return;
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
  }, [expanded, webNodes]);

  async function handleNodeClick(node: AgentNode) {
    setSelectedId(node.id);
    const web = byId.get(node.id);
    if (!web || web.action.kind !== "insight") return;
    if (!THREADS_INSIGHTS_ENABLED) return;
    if (!isPro) return;
    if (insightCache[node.id] || loadingId === node.id) return;

    setLoadingId(node.id);
    setInsightError((prev) => ({ ...prev, [node.id]: "" }));
    const result = await generateThreadsInsightAction(articleId, web.action.insightKind);
    setLoadingId(null);
    if (result.ok) {
      setInsightCache((prev) => ({ ...prev, [node.id]: result.detail }));
    } else {
      setInsightError((prev) => ({ ...prev, [node.id]: result.message }));
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="threads-collapsed-line" onClick={() => setExpanded(true)}>
        <NetworkIcon size={15} style={{ color: "var(--color-accent)" }} />
        Explore Connections
        <ChevronRightIcon size={14} />
      </button>
    );
  }

  const isInsight = selectedWeb?.action.kind === "insight";
  // Takes priority over the PRO gate below — while generation is unfunded, a free viewer
  // seeing an "Upgrade to unlock this" prompt for something that wouldn't work even if
  // they paid would be actively misleading, not just unpolished.
  const comingSoon = isInsight && !THREADS_INSIGHTS_ENABLED;
  const gated =
    selectedWeb && !comingSoon && (selectedWeb.action.kind === "insight" || selectedWeb.action.kind === "agent-handoff") && !isPro;
  const insightText = selectedWeb && isInsight ? insightCache[selectedWeb.id] : undefined;
  const insightErr = selectedWeb && isInsight ? insightError[selectedWeb.id] : undefined;
  const bodyText = gated || comingSoon ? undefined : (insightText ?? selectedWeb?.detail);

  return (
    <div className="threads-wrap">
      <div className="threads-header">
        <NetworkIcon size={16} style={{ color: "#6ea8ff" }} />
        Limbic Threads
      </div>
      <div className="agent-canvas-wrap threads-canvas-wrap" ref={containerRef}>
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
      </div>

      {/* A normal block below the canvas, not an absolutely-positioned overlay on top of
          it like Limbic Agent's own .agent-detail-card (see globals.css) — Agent's chat is
          a fixed-height full-screen surface where a floating card never blocks anything
          meaningful, but Threads' canvas sits in a normal scrolling article page where a
          force-simulated node can end up anywhere, including right where a docked overlay
          would sit — which made whatever was underneath the previous card unclickable. */}
      {selectedWeb && (
        <div className="threads-detail-panel">
          <button type="button" className="agent-detail-close" aria-label="Close" onClick={() => setSelectedId(null)}>
            ×
          </button>
          <div className="agent-detail-kicker">Ring {selectedWeb.ring}</div>
          <div className="agent-detail-title">
            {selectedWeb.label}
            {comingSoon && <span className="threads-coming-soon-badge">Coming Soon</span>}
          </div>

          {comingSoon ? (
            <p className="agent-detail-body">
              Limbic Agent&rsquo;s AI-generated clinical reasoning is still in development for this node — check back soon.
            </p>
          ) : gated ? (
            <>
              <p className="agent-detail-body">Unlock deeper, AI-generated clinical reasoning for this article with LimbicPro.</p>
              <Link href="/pro" className="btn btn-primary threads-detail-cta">
                <LockIcon size={12} />
                Upgrade to LimbicPro
              </Link>
            </>
          ) : loadingId === selectedWeb.id ? (
            <p className="agent-detail-hint">Limbic Agent is thinking…</p>
          ) : insightErr ? (
            <p className="agent-detail-body">{insightErr}</p>
          ) : (
            <>
              <p className="agent-detail-body">{bodyText}</p>
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
              {selectedWeb.action.kind === "agent-handoff" && (
                <Link
                  href={`/agent?q=${encodeURIComponent(selectedWeb.action.kind === "agent-handoff" ? selectedWeb.action.topic : "")}`}
                  className="btn btn-primary threads-detail-cta"
                >
                  Continue in Limbic Agent
                  <ChevronRightIcon size={13} />
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
