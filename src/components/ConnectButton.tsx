"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendConnectionRequestAction, respondConnectionAction } from "@/app/actions/nexus";
import { CheckIcon, XIcon, UserPlusIcon, MessageCircleIcon } from "@/components/icons";
import type { ConnectionState } from "@/lib/nexus";

export function ConnectButton({ userId, state }: { userId: string; state: ConnectionState }) {
  const [optimistic, setOptimistic] = useState(state);
  const [, startTransition] = useTransition();
  const router = useRouter();

  if (optimistic.status === "accepted") {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => router.push(`/nexus/messages/${userId}`)}
      >
        <MessageCircleIcon size={15} />
        Message
      </button>
    );
  }

  if (optimistic.status === "pending-incoming") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setOptimistic({ status: "accepted", connectionId: optimistic.status === "pending-incoming" ? optimistic.connectionId : "" });
            startTransition(() => respondConnectionAction(optimistic.connectionId, true));
          }}
        >
          <CheckIcon size={15} />
          Accept
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const id = optimistic.connectionId;
            setOptimistic({ status: "declined", connectionId: id });
            startTransition(() => respondConnectionAction(id, false));
          }}
        >
          <XIcon size={15} />
          Decline
        </button>
      </div>
    );
  }

  if (optimistic.status === "pending-outgoing") {
    return (
      <button type="button" className="btn btn-secondary" disabled>
        Pending
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => {
        setOptimistic({ status: "pending-outgoing", connectionId: "" });
        startTransition(() => sendConnectionRequestAction(userId));
      }}
    >
      <UserPlusIcon size={15} />
      Connect
    </button>
  );
}
