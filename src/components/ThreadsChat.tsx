"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateThreadsInsightAction } from "@/app/actions/threads";
import { NetworkIcon, SendIcon, LockIcon } from "@/components/icons";
import { THREADS_INSIGHT_META, type ThreadsInsightKind } from "@/lib/threads-graph";

/**
 * Live — every insight question goes to the real generateThreadsInsightAction path
 * (lib/threads-agent.ts), a real Anthropic API call. Note: as of this flip, this
 * environment's ANTHROPIC_API_KEY is empty, so every attempt will fail with the generic
 * "isn't available right now" message until a real key (and billing on that Anthropic
 * account) is configured — same caveat as AgentClient.tsx's own AGENT_DEMO_MODE flag.
 * Flip back to false to show a plain "Coming Soon" reply instead of attempting the call.
 */
const THREADS_INSIGHTS_ENABLED = true;

const INSIGHT_KINDS = Object.keys(THREADS_INSIGHT_META) as ThreadsInsightKind[];

interface Turn {
  kind: ThreadsInsightKind;
  status: "loading" | "done" | "error" | "coming-soon" | "gated";
  text?: string;
}

/**
 * The AI-insight half of Limbic Threads, as a chat rather than more graph nodes (see
 * components/ThreadsNav.tsx for the navigation half). Every one of the 5 questions in
 * THREADS_INSIGHT_META is reachable here as a quick-reply chip — previously only
 * "implications" ever appeared, as a single web node. The open-ended "Prompt Agent"
 * handoff is the free-text bar at the bottom, same /agent?topic= handoff as before, just
 * typed instead of clicking a dedicated node.
 */
export function ThreadsChat({
  articleId,
  articleTitle,
  isPro,
}: {
  articleId: string;
  articleTitle: string;
  isPro: boolean;
}) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loadingKind, setLoadingKind] = useState<ThreadsInsightKind | null>(null);
  const [question, setQuestion] = useState("");

  async function handleAsk(kind: ThreadsInsightKind) {
    if (loadingKind) return;
    const existing = turns.find((t) => t.kind === kind);
    if (existing && existing.status !== "error") return;

    if (!THREADS_INSIGHTS_ENABLED) {
      setTurns((prev) => [...prev, { kind, status: "coming-soon" }]);
      return;
    }
    if (!isPro) {
      setTurns((prev) => [...prev, { kind, status: "gated" }]);
      return;
    }

    setTurns((prev) => [...prev.filter((t) => t.kind !== kind), { kind, status: "loading" }]);
    setLoadingKind(kind);
    const result = await generateThreadsInsightAction(articleId, kind);
    setLoadingKind(null);
    setTurns((prev) =>
      prev.map((t) =>
        t.kind === kind
          ? result.ok
            ? { kind, status: "done" as const, text: result.detail }
            : { kind, status: "error" as const, text: result.message }
          : t
      )
    );
  }

  function handleSend() {
    router.push(`/agent?topic=${encodeURIComponent(question.trim() || articleTitle)}`);
    setQuestion("");
  }

  return (
    <div className="threads-chat-wrap">
      <div className="threads-header">
        <NetworkIcon size={16} style={{ color: "#6ea8ff" }} />
        Ask Limbic Agent
      </div>
      <p className="threads-caption">AI-generated clinical reasoning about this article</p>

      <div className="threads-chat-scroll">
        <div className="threads-chat-bubble threads-chat-bubble-assistant">
          Ask about this article&rsquo;s clinical implications, patient education, contraindications, outcome
          measures, or a realistic case example.
        </div>

        {turns.map((turn) => (
          <div key={turn.kind} className="threads-chat-turn">
            <div className="threads-chat-bubble threads-chat-bubble-user">{THREADS_INSIGHT_META[turn.kind].label}</div>
            <div className="threads-chat-bubble threads-chat-bubble-assistant">
              {turn.status === "loading" && <span className="agent-detail-hint">Limbic Agent is thinking…</span>}
              {turn.status === "coming-soon" && (
                <>
                  Limbic Agent&rsquo;s AI-generated clinical reasoning is still in development, check back soon.
                  <span className="threads-coming-soon-badge">Coming Soon</span>
                </>
              )}
              {turn.status === "gated" && (
                <>
                  <p style={{ margin: "0 0 10px" }}>
                    Unlock deeper, AI-generated clinical reasoning for this article with LimbicPro.
                  </p>
                  <Link href="/pro" className="btn btn-primary threads-detail-cta">
                    <LockIcon size={12} />
                    Upgrade to LimbicPro
                  </Link>
                </>
              )}
              {(turn.status === "error" || turn.status === "done") && turn.text}
            </div>
          </div>
        ))}
      </div>

      <div className="threads-chat-chips">
        {INSIGHT_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className="threads-chat-chip"
            disabled={loadingKind !== null || turns.some((t) => t.kind === kind && t.status !== "error")}
            onClick={() => handleAsk(kind)}
          >
            {THREADS_INSIGHT_META[kind].label}
          </button>
        ))}
      </div>

      {isPro ? (
        <div className="threads-chat-input-bar">
          <input
            placeholder="Ask Limbic Agent anything about this article…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button type="button" aria-label="Ask Limbic Agent" onClick={handleSend}>
            <SendIcon size={16} />
          </button>
        </div>
      ) : (
        <Link href="/pro" className="btn btn-primary threads-chat-upgrade-cta">
          <LockIcon size={12} />
          Upgrade to ask Limbic Agent anything
        </Link>
      )}
    </div>
  );
}
