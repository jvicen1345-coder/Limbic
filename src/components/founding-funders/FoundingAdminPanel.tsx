"use client";

import { useState, useTransition, type FormEvent } from "react";
import { claimFoundingSpotAction } from "@/app/actions/founding-funders";

/** Only rendered for accounts on the FOUNDING_FUNDERS_ADMIN_EMAILS allowlist (see
 *  app/founding-funders/page.tsx, lib/admin.ts isSiteAdmin) — the manual "mark this Zelle
 *  payment as confirmed" tool until a real payment flow exists. Deliberately styled plain
 *  (see .ff-admin in globals.css), not part of the letter's visual language. */
export function FoundingAdminPanel() {
  const [identifier, setIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [credential, setCredential] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await claimFoundingSpotAction({ identifier, displayName, credential });
      if (result.ok) {
        setMessage({ ok: true, text: `Claimed, ${result.claimedCount} of 25 spots filled.` });
        setIdentifier("");
        setDisplayName("");
        setCredential("");
      } else {
        setMessage({ ok: false, text: result.error ?? "Something went wrong." });
      }
    });
  };

  return (
    <div className="ff-admin">
      <p className="ff-admin-title">Admin, claim a founding spot</p>
      <form className="ff-admin-form" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Reader's sign-in email or license #"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={pending}
          required
        />
        <input
          className="input"
          placeholder="Display name (e.g. Jordan)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={pending}
          required
        />
        <input
          className="input"
          placeholder="Credential (e.g. DPT Student, PT), optional"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          disabled={pending}
        />
        <button type="submit" className="btn btn-primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
          {pending ? "Claiming…" : "Claim spot"}
        </button>
      </form>
      {message && (
        <p className={`ff-admin-message ${message.ok ? "ff-admin-message--ok" : "ff-admin-message--error"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
