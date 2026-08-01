"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendConnectionRequestAction, respondConnectionAction } from "@/app/actions/nexus";
import { CheckIcon, XIcon, UserPlusIcon, MessageCircleIcon } from "@/components/icons";
import type { ConnectionState } from "@/lib/nexus";

/** `compact` renders icon-only buttons (for tight spaces like the Home aside) instead of
 *  icon+label — same states, same actions. */
export function ConnectButton({ userId, state, compact = false }: { userId: string; state: ConnectionState; compact?: boolean }) {
  const [optimistic, setOptimistic] = useState(state);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const btnClass = compact ? "btn btn-secondary btn-icon" : "btn btn-secondary";

  if (optimistic.status === "accepted") {
    return (
      <button
        type="button"
        className={btnClass}
        aria-label="Message"
        onClick={() => router.push(`/nexus/messages/${userId}`)}
      >
        <MessageCircleIcon size={15} />
        {!compact && "Message"}
      </button>
    );
  }

  if (optimistic.status === "pending-incoming") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          className={compact ? "btn btn-primary btn-icon" : "btn btn-primary"}
          aria-label="Accept"
          onClick={() => {
            setOptimistic({ status: "accepted", connectionId: optimistic.status === "pending-incoming" ? optimistic.connectionId : "" });
            startTransition(() => respondConnectionAction(optimistic.connectionId, true));
          }}
        >
          <CheckIcon size={15} />
          {!compact && "Accept"}
        </button>
        <button
          type="button"
          className={compact ? "btn btn-ghost btn-icon" : "btn btn-ghost"}
          aria-label="Decline"
          onClick={() => {
            const id = optimistic.connectionId;
            setOptimistic({ status: "declined", connectionId: id });
            startTransition(() => respondConnectionAction(id, false));
          }}
        >
          <XIcon size={15} />
          {!compact && "Decline"}
        </button>
      </div>
    );
  }

  if (optimistic.status === "pending-outgoing") {
    return (
      <button type="button" className={btnClass} disabled aria-label="Pending">
        {compact ? <UserPlusIcon size={15} /> : "Pending"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={btnClass}
      aria-label="Connect"
      onClick={() => {
        setOptimistic({ status: "pending-outgoing", connectionId: "" });
        startTransition(() => sendConnectionRequestAction(userId));
      }}
    >
      <UserPlusIcon size={15} />
      {!compact && "Connect"}
    </button>
  );
}
