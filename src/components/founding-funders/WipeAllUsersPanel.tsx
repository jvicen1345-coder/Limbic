"use client";

import { useState, useTransition } from "react";
import { wipeAllUsersAction } from "@/app/actions/admin";

const CONFIRM_TEXT = "WIPE ALL USERS";

/** Same admin gate and plain styling as FoundingAdminPanel — see that component's doc
 *  comment. This one's a lot more destructive (every account, not one claim), so the
 *  confirm gate is a full-phrase match rather than a checkbox, and there's no in-place
 *  success state: wipeAllUsersAction deletes the admin's own account too and redirects to
 *  /sign-in, so this component is gone by the time it would matter. */
export function WipeAllUsersPanel({ userCount }: { userCount: number }) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canWipe = confirmText.trim() === CONFIRM_TEXT;

  const onClick = () => {
    if (!canWipe) return;
    setError(null);
    startTransition(async () => {
      const result = await wipeAllUsersAction();
      // Only reached on failure — success redirects away before returning here.
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  };

  return (
    <div className="ff-admin" style={{ borderColor: "color-mix(in srgb, var(--color-danger) 40%, transparent)" }}>
      <p className="ff-admin-title" style={{ color: "var(--color-danger)" }}>
        Admin — wipe all users
      </p>
      <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
        Permanently deletes every account currently in the database ({userCount} total) —
        every saved article, reading history, Nexus connection, Founding Funder listing,
        and the waitlist. Your own account goes too. This can&rsquo;t be undone.
      </p>
      <div className="ff-admin-form">
        <input
          className="input"
          placeholder={`Type "${CONFIRM_TEXT}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={pending}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn"
          disabled={!canWipe || pending}
          onClick={onClick}
          style={{ alignSelf: "flex-start", background: "var(--color-danger)", color: "#fff", border: "none" }}
        >
          {pending ? "Wiping…" : "Permanently wipe all users"}
        </button>
      </div>
      {error && <p className="ff-admin-message ff-admin-message--error">{error}</p>}
    </div>
  );
}
