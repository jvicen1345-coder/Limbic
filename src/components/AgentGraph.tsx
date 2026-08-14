"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { AgentNode, AgentLink } from "@/lib/agent-graph";

// labelHalfWidth is filled in after each label's text is rendered (see the data-update
// effect) by measuring its actual SVG bounding box — collision then reserves that much
// horizontal room per node so two labels can never visually touch, regardless of how long
// either string is.
type SimNode = AgentNode & d3.SimulationNodeDatum & { labelHalfWidth?: number };
type SimLink = { source: string | SimNode; target: string | SimNode; kind: "tree" | "cross" };

// Minimum gap kept between the edges of two neighboring labels.
const LABEL_COLLIDE_PADDING = 10;

// Bright, glowing fills tuned for the near-black canvas — see the .agent-node-circle glow
// filter in globals.css, which is what actually reads as "glowing," not just fill color.
const RING_COLOR: Record<number, string> = {
  0: "#bfe0ff",
  1: "#6ea8ff",
  2: "#42d6c8",
  3: "#8a97c4",
};
const RING_RADIUS: Record<number, number> = { 0: 30, 1: 22, 2: 17, 3: 12 };
const RING_RADIUS_COMPACT: Record<number, number> = { 0: 24, 1: 18, 2: 14, 3: 10 };
const RING_LINK_DISTANCE: Record<number, number> = { 1: 110, 2: 85, 3: 68 };
const RING_FONT_SIZE: Record<number, number> = { 0: 13, 1: 11, 2: 10.5, 3: 9.5 };

// Limbic Threads' "Prompt Agent" node (see AgentNode.variant) — deliberately larger and a
// warmer color than any ring's, so it reads as an action to take rather than another piece
// of connected content. The glow itself needs no separate CSS — .agent-node-circle's
// existing drop-shadow filter already keys off currentColor, so setting this fill/color
// automatically glows amber the same way every other node glows its own ring color.
const ACTION_NODE_RADIUS = 36;
const ACTION_NODE_RADIUS_COMPACT = 30;
// Dimmer than a raw "#ffb84d" gold — still clearly warmer than every ring's blue/teal, just
// not competing with them for attention.
const ACTION_NODE_COLOR = "#d89c41";
// Kept clear of the canvas edge and of the label rendered below the node (dy = radius +
// 14, plus the label's own line height) — see the two "fy = height - ..." assignments
// below, which both need to agree with this so the node never migrates when either fires.
const ACTION_NODE_BOTTOM_CLEARANCE = 26;

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

function nodeRadius(d: { ring: number; variant?: "action" }, radii: Record<number, number>, compact: boolean): number {
  if (d.variant === "action") return compact ? ACTION_NODE_RADIUS_COMPACT : ACTION_NODE_RADIUS;
  return radii[d.ring] ?? 14;
}

/** Bottom-center, fixed — not part of the force layout like every other node, so this is
 *  computed directly from canvas size rather than left to the simulation. */
function actionNodeFixedPos(width: number, height: number, compact: boolean) {
  const r = compact ? ACTION_NODE_RADIUS_COMPACT : ACTION_NODE_RADIUS;
  return { fx: width / 2, fy: height - r - ACTION_NODE_BOTTOM_CLEARANCE };
}

let logoGradientCounter = 0;

/** The center (ring 0) node's icon — same markup as components/icons.tsx's LogoIcon,
 *  hand-replicated here since this node is D3-appended SVG rather than JSX. Each call
 *  gets its own gradient id (a module-level counter, not React's
 *  useId, since this runs outside React) so multiple graphs mounted at once — Limbic
 *  Agent's own web and a Threads web, say — never collide on url(#id) resolution. */
function appendLogoIcon(container: d3.Selection<SVGGElement, unknown, null, undefined>, size: number) {
  const gradientId = `agent-graph-logo-gradient-${++logoGradientCounter}`;
  const icon = container
    .append("svg")
    .attr("x", -size / 2)
    .attr("y", -size / 2)
    .attr("width", size)
    .attr("height", size)
    .attr("viewBox", "0 0 160 160")
    .style("pointer-events", "none");
  const defs = icon.append("defs").append("radialGradient").attr("id", gradientId).attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
  defs.append("stop").attr("offset", "0%").attr("stop-color", "#1D6EB7");
  defs.append("stop").attr("offset", "100%").attr("stop-color", "#092B52");
  icon.append("circle").attr("cx", 80).attr("cy", 80).attr("r", 78).attr("fill", `url(#${gradientId})`);
  const lines = icon.append("g").attr("stroke", "#FFFFFF").attr("stroke-width", 3.2).attr("stroke-linecap", "round");
  const linkPoints: [number, number, number, number][] = [
    [80, 49.6, 54.4, 68],
    [54.4, 68, 64, 102.4],
    [64, 102.4, 96, 102.4],
    [96, 102.4, 105.6, 68],
    [105.6, 68, 80, 49.6],
    [80, 80, 80, 49.6],
    [80, 80, 54.4, 68],
    [80, 80, 64, 102.4],
    [80, 80, 96, 102.4],
    [80, 80, 105.6, 68],
  ];
  for (const [x1, y1, x2, y2] of linkPoints) {
    lines.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
  }
  const dots = icon.append("g").attr("fill", "#FFFFFF");
  const dotPoints: [number, number, number][] = [
    [80, 49.6, 4.5],
    [54.4, 68, 4.5],
    [105.6, 68, 4.5],
    [64, 102.4, 4.5],
    [96, 102.4, 4.5],
    [80, 80, 6],
  ];
  for (const [cx, cy, r] of dotPoints) {
    dots.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r);
  }
}

export function AgentGraph({
  nodes,
  links,
  selectedId,
  loadingId,
  width,
  height,
  onNodeClick,
  onBackgroundClick,
}: {
  nodes: AgentNode[];
  links: AgentLink[];
  selectedId: string | null;
  /** The node currently awaiting an expansion response, if any — shown with a soft pulse
   *  instead of the usual static glow. */
  loadingId: string | null;
  width: number;
  height: number;
  onNodeClick: (node: AgentNode) => void;
  onBackgroundClick?: () => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const prevLabelsRef = useRef<Map<string, string>>(new Map());
  // Read inside the tick handler below (defined once, in the mount-only effect) rather
  // than closing over the `width`/`height` props directly, which would go stale the
  // moment either one changes after mount.
  const sizeRef = useRef({ width, height });
  const onNodeClickRef = useRef(onNodeClick);
  const onBackgroundClickRef = useRef(onBackgroundClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onBackgroundClickRef.current = onBackgroundClick;
  }, [onNodeClick, onBackgroundClick]);

  // One-time setup: the SVG structure and the force simulation itself persist across
  // re-renders so existing node positions are never reset — only the second effect below
  // (keyed on nodes/links) feeds it new data, which is what makes the web grow outward
  // instead of re-arranging itself every time a node is added.
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.on("click", (event) => {
      if (event.target === svgRef.current) onBackgroundClickRef.current?.();
    });

    svg.append("g").attr("class", "agent-links");
    svg.append("g").attr("class", "agent-nodes");

    const simulation = d3
      .forceSimulation<SimNode>([])
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>([])
          .id((d) => d.id)
          .distance((d) => {
            const target = d.target as SimNode;
            return RING_LINK_DISTANCE[target.ring] ?? 90;
          })
          .strength((d) => (d.kind === "cross" ? 0.15 : 0.85))
      )
      .force("charge", d3.forceManyBody().strength(-260))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => {
          const r = d.variant === "action" ? ACTION_NODE_RADIUS : (RING_RADIUS[d.ring] ?? 14);
          return Math.max(r + 16, (d.labelHalfWidth ?? 0) + LABEL_COLLIDE_PADDING);
        })
      );
    // The centering "x"/"y" forces are added by the width/height effect below, which also
    // runs once on mount — kept out of this effect so this one-time setup never needs
    // width/height as a dependency (and never tears down/rebuilds the simulation when the
    // container resizes).

    simulation.on("tick", () => {
      // Only the gentle centering force (see the width/height effect below) pulls nodes
      // toward the middle — nothing stops repulsion/collision from pushing an outer-ring
      // node beyond the canvas's own bounds otherwise. That's harmless when nothing sits
      // past the canvas, but Limbic Threads (see components/ThreadsWeb.tsx) renders real
      // content right below it, and an escaped node would render on top of — and be
      // unclickable behind — that content instead of the graph. Clamped here, on the
      // simulation's own x/y (not just the rendered transform), so it also stops
      // affecting link endpoints and future ticks, not just this frame's paint.
      const { width: w, height: h } = sizeRef.current;
      const margin = 30;
      for (const n of simNodesRef.current) {
        n.x = Math.max(margin, Math.min(w - margin, n.x ?? w / 2));
        n.y = Math.max(margin, Math.min(h - margin, n.y ?? h / 2));
      }

      svg
        .select(".agent-links")
        .selectAll<SVGLineElement, SimLink>("line")
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      svg
        .select(".agent-nodes")
        .selectAll<SVGGElement, SimNode>("g.agent-node")
        .attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    simRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, []);

  // Keeps the gentle centering forces aligned if the container's size changes.
  useEffect(() => {
    sizeRef.current = { width, height };
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.force("x", d3.forceX(width / 2).strength(0.03));
    simulation.force("y", d3.forceY(height / 2).strength(0.03));
    const center = simNodesRef.current.find((n) => n.ring === 0);
    if (center) {
      center.fx = width / 2;
      center.fy = height / 2;
    }
    const actionNode = simNodesRef.current.find((n) => n.variant === "action");
    if (actionNode) {
      const { fx, fy } = actionNodeFixedPos(width, height, width < 460);
      actionNode.fx = fx;
      actionNode.fy = fy;
    }
    simulation.alpha(0.3).restart();
  }, [width, height]);

  // Data updates: merges incoming nodes into the simulation's own node array, preserving
  // x/y for anything that already existed and seeding brand-new nodes near their parent's
  // current position so they visibly grow outward from it rather than appearing at a
  // random spot on the canvas.
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const simulation = simRef.current;
    if (!simulation) return;

    const compact = width < 460;
    const radii = compact ? RING_RADIUS_COMPACT : RING_RADIUS;

    const existingById = new Map(simNodesRef.current.map((n) => [n.id, n]));
    const nextSimNodes: SimNode[] = nodes.map((n) => {
      const existing = existingById.get(n.id);
      if (existing) return Object.assign(existing, n);
      const parent = n.parentId ? existingById.get(n.parentId) : undefined;
      const seedX = parent?.x ?? width / 2;
      const seedY = parent?.y ?? height / 2;
      const jitter = () => (Math.random() - 0.5) * 20;
      const simNode: SimNode = { ...n, x: seedX + jitter(), y: seedY + jitter() };
      if (n.ring === 0) {
        simNode.fx = width / 2;
        simNode.fy = height / 2;
      }
      if (n.variant === "action") {
        const { fx, fy } = actionNodeFixedPos(width, height, compact);
        simNode.fx = fx;
        simNode.fy = fy;
      }
      return simNode;
    });
    simNodesRef.current = nextSimNodes;

    const nextSimLinks: SimLink[] = links.map((l) => ({ source: l.source, target: l.target, kind: l.kind }));

    // Links.
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const linkClass = (d: SimLink) => {
      const targetId = typeof d.target === "string" ? d.target : d.target.id;
      const toAction = nodeById.get(targetId)?.variant === "action";
      return `agent-link agent-link-${d.kind}${toAction ? " agent-link-action" : ""}`;
    };
    svg
      .select(".agent-links")
      .selectAll<SVGLineElement, SimLink>("line")
      .data(
        nextSimLinks,
        (d) => `${typeof d.source === "string" ? d.source : d.source.id}->${typeof d.target === "string" ? d.target : d.target.id}`
      )
      .join(
        // pathLength normalizes the line's dash coordinate space to a fixed 0-100 range
        // regardless of its actual on-screen length — which keeps changing every tick as
        // the simulation settles — so the draw-in animation always reads as "0% to 100%
        // grown" instead of resetting or glitching as the endpoints move.
        (enter) =>
          enter
            .append("line")
            .attr("pathLength", 100)
            .attr("stroke-dasharray", 100)
            .attr("class", (d) => `${linkClass(d)} agent-link-draw-in`),
        (update) => update.attr("class", linkClass),
        (exit) => exit.remove()
      );

    // Nodes.
    const nodeSel = svg
      .select(".agent-nodes")
      .selectAll<SVGGElement, SimNode>("g.agent-node")
      .data(nextSimNodes, (d) => d.id);

    const entered = nodeSel
      .enter()
      .append("g")
      .attr("class", "agent-node")
      .style("cursor", (d) => (d.expandable ? "pointer" : "default"))
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClickRef.current(d);
      });

    entered
      .append("g")
      .attr("class", "agent-node-pulse")
      .each(function (d) {
        const g = d3.select(this);
        const r = nodeRadius(d, radii, compact);
        const isAction = d.variant === "action";
        g.append("circle")
          .attr("class", "agent-node-circle")
          .attr("r", r)
          .attr("fill", isAction ? ACTION_NODE_COLOR : (RING_COLOR[d.ring] ?? "#8a97c4"))
          // The glow filter uses currentColor (see globals.css) so each ring glows its
          // own color — fill alone wouldn't drive that, since drop-shadow reads `color`.
          .style("color", isAction ? ACTION_NODE_COLOR : (RING_COLOR[d.ring] ?? "#8a97c4"));
        if (d.ring === 0) appendLogoIcon(g, r * 1.8);
        g.append("text")
          .attr("class", "agent-node-label")
          .attr("text-anchor", "middle")
          .attr("dy", r + 14)
          .attr("font-size", isAction ? 12 : (RING_FONT_SIZE[d.ring] ?? 10))
          .attr("font-weight", isAction ? 700 : 400)
          .text(truncate(d.label, d.ring === 0 ? 26 : 20));
      });

    const merged = entered.merge(nodeSel);
    merged
      .style("cursor", (d) => (d.expandable ? "pointer" : "default"))
      .classed("agent-node-selected", (d) => d.id === selectedId)
      .classed("agent-node-loading", (d) => d.id === loadingId)
      // The idle center placeholder ("Limbic Agent") breathes continuously; once it has
      // any children it has "answered" and settles into the normal static glow.
      .classed("agent-node-breathing", (d) => d.ring === 0 && !nodes.some((n) => n.parentId === d.id))
      // The action node gets its own slower, warmer pulse instead (see globals.css) —
      // never combined with agent-node-breathing, since only a ring-0 node can breathe.
      .classed("agent-node-action", (d) => d.variant === "action");

    merged.select(".agent-node-label").text((d) => truncate(d.label, d.ring === 0 ? 26 : 20));
    merged
      .select(".agent-node-circle")
      .attr("r", (d) => nodeRadius(d, radii, compact))
      .attr("fill", (d) => (d.variant === "action" ? ACTION_NODE_COLOR : (RING_COLOR[d.ring] ?? "#8a97c4")))
      .style("color", (d) => (d.variant === "action" ? ACTION_NODE_COLOR : (RING_COLOR[d.ring] ?? "#8a97c4")));
    merged.select(".agent-node-label").attr("dy", (d) => nodeRadius(d, radii, compact) + 14);

    // Measure each label's actual rendered width now that its final text/font-size are set,
    // so the collide force below (initialized by simulation.nodes()) can reserve enough
    // horizontal room to keep every label clear of its neighbors — a fixed circle-only
    // collision radius has no idea how wide "Post-Op Rehab Protocol" is versus "Pain".
    merged.select<SVGTextElement>(".agent-node-label").each(function (d) {
      d.labelHalfWidth = this.getBBox().width / 2;
    });

    simulation.nodes(nextSimNodes);
    (simulation.force("link") as d3.ForceLink<SimNode, SimLink>).links(nextSimLinks);
    simulation.alpha(0.7).restart();

    // The center node's label changes once (idle "Limbic Agent" -> the question, then
    // again once the model's polished label comes back) — flash the pulse-in animation
    // on that specific transition rather than only on brand-new nodes.
    merged.each(function (d) {
      const prev = prevLabelsRef.current.get(d.id);
      if (prev !== undefined && prev !== d.label) {
        const pulseNode = d3.select(this).select(".agent-node-pulse").node() as SVGGElement | null;
        if (pulseNode) {
          pulseNode.classList.remove("agent-node-pulse-replay");
          // Force a reflow so re-adding the class restarts the CSS animation.
          void pulseNode.getBoundingClientRect();
          pulseNode.classList.add("agent-node-pulse-replay");
        }
      }
      prevLabelsRef.current.set(d.id, d.label);
    });

    nodeSel.exit().remove();
  }, [nodes, links, selectedId, loadingId, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ width: "100%", height, display: "block", touchAction: "none" }}
    />
  );
}
