"use client";

import { useEffect, useRef } from "react";
import { QUESTION_TURN_ID, type AgentTranscriptTurn } from "@/lib/agent-transcript";

/**
 * Accumulating transcript for the path the clinician walked. Visual language is
 * Threads' chat (components/ThreadsChat.tsx, .threads-chat-* in src/styles/agent.css)
 * so Agent does not invent a second bubble style. This panel does not call the model.
 */
export function AgentReasoning({
  turns,
  loadingId,
  expandHintId,
  thinking,
}: {
  turns: readonly AgentTranscriptTurn[];
  loadingId: string | null;
  expandHintId: string | null;
  thinking: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns, loadingId, expandHintId, thinking]);

  return (
    <div className="agent-reasoning threads-chat-wrap">
      <div className="threads-header">Reasoning</div>
      <p className="threads-caption">The path you walked, in the order you opened it.</p>
      <div
        className="threads-chat-scroll"
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Reasoning transcript"
        tabIndex={0}
      >
        <div className="threads-chat-bubble threads-chat-bubble-assistant">
          Ask a question to build the web. Select a node to add its reasoning here. The map stays visible while you
          read.
        </div>
        {turns.map((turn) => (
          <div key={turn.nodeId} className="threads-chat-turn">
            <div className="threads-chat-bubble threads-chat-bubble-user">{turn.label}</div>
            {turn.detail ? (
              <div className="threads-chat-bubble threads-chat-bubble-assistant">{turn.detail}</div>
            ) : null}
            {turn.nodeId === QUESTION_TURN_ID && thinking ? (
              <p className="agent-detail-hint">Building the web…</p>
            ) : null}
            {loadingId === turn.nodeId ? <p className="agent-detail-hint">Growing the web…</p> : null}
            {expandHintId === turn.nodeId ? (
              <p className="agent-detail-hint">Click this node again to expand it.</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
