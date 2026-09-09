"use client";

import dynamic from "next/dynamic";
import type { AgentGraphProps } from "@/components/AgentGraph";

const AgentGraph = dynamic(() => import("@/components/AgentGraph").then((module) => module.AgentGraph), {
  loading: () => (
    <div
      role="status"
      aria-label="Loading clinical reasoning graph"
      aria-busy="true"
      style={{ width: "100%", height: "100%", minHeight: 320 }}
    />
  ),
});

export function DeferredAgentGraph(props: AgentGraphProps) {
  return <AgentGraph {...props} />;
}
