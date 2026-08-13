"use client";

import { useState, useTransition } from "react";
import { generateWipeCodeAction, wipeAllUsersAction } from "@/app/actions/admin";

const CONFIRM_TEXT = "WIPE ALL USERS";

/** Same admin gate and plain styling as FoundingAdminPanel — see that component's doc
 *  comment. This one's a lot more destructive (every account, not one claim), so it's
 *  gated two ways: a full-phrase confirm match (client-side, catches fat-fingers) and a
 *  one-time code minted by "Generate one-time wipe code" (server-side, see
 *  app/actions/admin.ts) — knowing the phrase alone isn't enough. There's no in-place
 *  success state after wiping: wipeAllUsersAction deletes the admin's own account too and
 *  redirects to /sign-in, so this component is gone by the time it would matter. */
export function WipeAllUsersPanel({ userCount }: { userCount: number }) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [genPending, startGenTransition] = useTransition();
  const [wipePending, startWipeTransition] = useTransition();

  const canWipe = confirmText.trim() === CONFIRM_TEXT && codeInput.trim().length > 0;

  const onGenerate = () => {
    setError(null);
    startGenTransition(async () => {
      const result = await generateWipeCodeAction();
      if (result.ok && result.code) {
        setGeneratedCode(result.code);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  const onWipe = () => {
    if (!canWipe) return;
    setError(null);
    startWipeTransition(async () => {
      const result = await wipeAllUsersAction(codeInput);
      // Only reached on failure — success redirects away before returning here.
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  };

  return (
    <div className="ff-admin" style={{ borderColor: "color-mix(in srgb, var(--color-danger) 40%, transparent)" }}>
      <p className="ff-admin-title" style={{ color: "var(--color-danger)" }}>
        Admin, wipe all users
      </p>
      <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 12px" }}>
        Permanently deletes every account currently in the database ({userCount} total),
        every saved article, reading history, Nexus connection, Founding Funder listing,
        and the waitlist. Your own account goes too. This can&rsquo;t be undone.
      </p>

      <button type="button" className="btn btn-secondary" disabled={genPending} onClick={onGenerate}>
        {genPending ? "Generating…" : "Generate one-time wipe code"}
      </button>

      {generatedCode && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-neutral-200)",
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: 18, letterSpacing: "0.08em" }}>{generatedCode}</div>
          <p style={{ fontSize: 11.5, color: "var(--color-neutral-700)", margin: "6px 0 0" }}>
            Shown once, save it now. It stops working the moment it&rsquo;s used (or a new
            code is generated).
          </p>
        </div>
      )}

      <div className="ff-admin-form" style={{ marginTop: 14 }}>
        <input
          className="input"
          placeholder="One-time wipe code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          disabled={wipePending}
          autoComplete="off"
        />
        <input
          className="input"
          placeholder={`Type "${CONFIRM_TEXT}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={wipePending}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn"
          disabled={!canWipe || wipePending}
          onClick={onWipe}
          style={{ alignSelf: "flex-start", background: "var(--color-danger)", color: "#fff", border: "none" }}
        >
          {wipePending ? "Wiping…" : "Permanently wipe all users"}
        </button>
      </div>
      {error && <p className="ff-admin-message ff-admin-message--error">{error}</p>}
    </div>
  );
}
