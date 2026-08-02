"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { AgentNode, AgentLink } from "@/lib/agent-graph";

type SimNode = AgentNode & d3.SimulationNodeDatum;
type SimLink = { source: string | SimNode; target: string | SimNode; kind: "tree" | "cross" };

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

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
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
        d3.forceCollide<SimNode>().radius((d) => (RING_RADIUS[d.ring] ?? 14) + 16)
      );
    // The centering "x"/"y" forces are added by the width/height effect below, which also
    // runs once on mount — kept out of this effect so this one-time setup never needs
    // width/height as a dependency (and never tears down/rebuilds the simulation when the
    // container resizes).

    simulation.on("tick", () => {
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
    const simulation = simRef.current;
    if (!simulation) return;
    simulation.force("x", d3.forceX(width / 2).strength(0.03));
    simulation.force("y", d3.forceY(height / 2).strength(0.03));
    const center = simNodesRef.current.find((n) => n.ring === 0);
    if (center) {
      center.fx = width / 2;
      center.fy = height / 2;
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
      return simNode;
    });
    simNodesRef.current = nextSimNodes;

    const nextSimLinks: SimLink[] = links.map((l) => ({ source: l.source, target: l.target, kind: l.kind }));

    simulation.nodes(nextSimNodes);
    (simulation.force("link") as d3.ForceLink<SimNode, SimLink>).links(nextSimLinks);
    simulation.alpha(0.7).restart();

    // Links.
    svg
      .select(".agent-links")
      .selectAll<SVGLineElement, SimLink>("line")
      .data(
        nextSimLinks,
        (d) => `${typeof d.source === "string" ? d.source : d.source.id}->${typeof d.target === "string" ? d.target : d.target.id}`
      )
      .join("line")
      .attr("class", (d) => `agent-link agent-link-${d.kind}`);

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
        g.append("circle")
          .attr("class", "agent-node-circle")
          .attr("r", radii[d.ring] ?? 14)
          .attr("fill", RING_COLOR[d.ring] ?? "#8a97c4")
          // The glow filter uses currentColor (see globals.css) so each ring glows its
          // own color — fill alone wouldn't drive that, since drop-shadow reads `color`.
          .style("color", RING_COLOR[d.ring] ?? "#8a97c4");
        g.append("text")
          .attr("class", "agent-node-label")
          .attr("text-anchor", "middle")
          .attr("dy", (radii[d.ring] ?? 14) + 14)
          .attr("font-size", RING_FONT_SIZE[d.ring] ?? 10)
          .text(truncate(d.label, d.ring === 0 ? 26 : 20));
      });

    const merged = entered.merge(nodeSel);
    merged
      .style("cursor", (d) => (d.expandable ? "pointer" : "default"))
      .classed("agent-node-selected", (d) => d.id === selectedId)
      .classed("agent-node-loading", (d) => d.id === loadingId)
      // The idle center placeholder ("Limbic Agent") breathes continuously; once it has
      // any children it has "answered" and settles into the normal static glow.
      .classed("agent-node-breathing", (d) => d.ring === 0 && !nodes.some((n) => n.parentId === d.id));

    merged.select(".agent-node-label").text((d) => truncate(d.label, d.ring === 0 ? 26 : 20));
    merged
      .select(".agent-node-circle")
      .attr("r", (d) => radii[d.ring] ?? 14)
      .attr("fill", (d) => RING_COLOR[d.ring] ?? "#8a97c4")
      .style("color", (d) => RING_COLOR[d.ring] ?? "#8a97c4");
    merged.select(".agent-node-label").attr("dy", (d) => (radii[d.ring] ?? 14) + 14);

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
