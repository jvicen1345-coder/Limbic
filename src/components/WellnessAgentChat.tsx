"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendWellnessAgentMessageAction, saveAgentRecommendationAction } from "@/app/actions/wellness-agent";
import { WELLNESS_GOAL_OPTIONS } from "@/lib/vitals";
import { NetworkIcon, SendIcon, ThumbsUpIcon, ThumbsDownIcon, BookmarkIcon } from "@/components/icons";

const EQUIPMENT_OPTIONS = [
  "No equipment — bodyweight only",
  "Resistance bands",
  "Dumbbells",
  "Kettlebells",
  "Barbell and plates",
  "Pull up bar",
  "Cable machine",
  "Full gym access",
];

const SUGGESTED_PROMPTS = [
  "What should I eat to support my strength training goal?",
  "I have dumbbells and a resistance band — what exercises can I do at home?",
  "How do I interpret my HRV score of 58ms?",
  "What does Zone 2 cardio feel like and how do I do it?",
  "How many calories should I be eating for my goal?",
  "What exercises are good for someone with a desk job?",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  feedback?: "up" | "down";
  saved?: boolean;
}

let messageCounter = 0;
function nextId() {
  messageCounter += 1;
  return `m${messageCounter}`;
}

export function WellnessAgentChat({ initialGoal }: { initialGoal: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>(initialGoal ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);

    startTransition(async () => {
      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const result = await sendWellnessAgentMessageAction(history, equipment, goal || null);
      if (result.ok) {
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: result.reply, sources: result.sources }]);
      } else {
        setError(result.message);
      }
    });
  };

  const handleFeedback = (id: string, feedback: "up" | "down") => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === feedback ? undefined : feedback } : m)));
  };

  const handleSave = (message: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, saved: true } : m)));
    startTransition(() => {
      saveAgentRecommendationAction(message.content, message.sources ?? []);
    });
  };

  const handleNewConversation = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="wellness-agent-chat">
      <div className="wellness-agent-personalize">
        <div className="wellness-agent-personalize-block">
          <div className="wellness-agent-personalize-label">Your equipment</div>
          <div className="wellness-chip-row">
            {EQUIPMENT_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`wellness-chip${equipment.includes(item) ? " wellness-chip--selected" : ""}`}
                onClick={() => toggleEquipment(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="wellness-agent-personalize-block">
          <div className="wellness-agent-personalize-label">Your wellness goal</div>
          <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)} style={{ maxWidth: 260 }}>
            <option value="">Select a goal…</option>
            {WELLNESS_GOAL_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="wellness-agent-messages">
        {messages.length === 0 && (
          <div className="wellness-agent-empty">
            <NetworkIcon size={28} style={{ color: "var(--color-migration-gold)" }} />
            <p>Ask about exercise, nutrition, recovery, or how to interpret a metric — here are a few ideas:</p>
            <div className="wellness-agent-prompts">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className="wellness-agent-prompt" onClick={() => send(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="wellness-agent-msg wellness-agent-msg--user">
              {m.content}
            </div>
          ) : (
            <div key={m.id} className="wellness-agent-msg wellness-agent-msg--agent">
              <p style={{ margin: 0 }}>{m.content}</p>
              {m.sources && m.sources.length > 0 && <div className="wellness-agent-msg-sources">Sources: {m.sources.join(", ")}</div>}
              <div className="wellness-agent-msg-actions">
                <button
                  type="button"
                  className={`wellness-agent-feedback-btn${m.feedback === "up" ? " wellness-agent-feedback-btn--active" : ""}`}
                  aria-label="Helpful"
                  onClick={() => handleFeedback(m.id, "up")}
                >
                  <ThumbsUpIcon size={13} />
                </button>
                <button
                  type="button"
                  className={`wellness-agent-feedback-btn${m.feedback === "down" ? " wellness-agent-feedback-btn--active" : ""}`}
                  aria-label="Not helpful"
                  onClick={() => handleFeedback(m.id, "down")}
                >
                  <ThumbsDownIcon size={13} />
                </button>
                <button type="button" className="wellness-agent-save-btn" onClick={() => handleSave(m)} disabled={m.saved}>
                  <BookmarkIcon size={13} filled={m.saved} />
                  {m.saved ? "Saved" : "Save this recommendation"}
                </button>
              </div>
            </div>
          )
        )}

        {pending && <div className="wellness-agent-msg wellness-agent-msg--agent wellness-agent-msg--pending">Thinking…</div>}
        {error && <div className="wellness-agent-error">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="wellness-agent-input-row">
        <input
          className="input"
          placeholder="Ask about exercise, nutrition, or recovery…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(input);
          }}
          disabled={pending}
        />
        <button type="button" className="btn btn-primary btn-icon" aria-label="Send" onClick={() => send(input)} disabled={pending || !input.trim()}>
          <SendIcon size={16} />
        </button>
      </div>

      {messages.length > 0 && (
        <button type="button" className="wellness-agent-new-convo" onClick={handleNewConversation}>
          New conversation
        </button>
      )}
    </div>
  );
}
