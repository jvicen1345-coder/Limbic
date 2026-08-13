"use client";

import { useRef, useState, useTransition } from "react";
import { sendNexusMessageAction } from "@/app/actions/nexus";

interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export function MessageThread({
  otherUserId,
  currentUserId,
  initialMessages,
}: {
  otherUserId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "4px 2px" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", textAlign: "center", marginTop: 20 }}>
            You&rsquo;re connected, say hello.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.senderId === currentUserId ? "message-bubble message-bubble-mine" : "message-bubble message-bubble-theirs"}
            style={{ display: "flex" }}
          >
            {m.body}
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        style={{ display: "flex", gap: 8, paddingTop: 10 }}
        action={(formData) => {
          const body = String(formData.get("body") ?? "").trim();
          if (!body) return;
          setMessages((prev) => [
            ...prev,
            { id: `optimistic-${Date.now()}`, body, senderId: currentUserId, createdAt: new Date().toISOString() },
          ]);
          formRef.current?.reset();
          startTransition(() => sendNexusMessageAction(otherUserId, formData));
        }}
      >
        <input className="input" name="body" placeholder="Write a message…" autoComplete="off" required />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </>
  );
}
