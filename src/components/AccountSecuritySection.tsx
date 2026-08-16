"use client";

import { useState, useTransition } from "react";
import { updateBackupEmail } from "@/app/actions/account-migration";

/** The Profile "Account Security" section — a backup email a student can add so they keep
 *  access after their .edu email stops working post-graduation (see app/actions/
 *  account-migration.ts, lib/session.ts signInWithPassword/signInWithGoogle, and the
 *  migration-reminder/graduation-transition surfaces on Home). Unlike ProfileForm.tsx's
 *  autosave pattern, this uses an explicit Save button with its own validation/confirmation
 *  messaging — closer to DeleteAccountSection.tsx's style — since a wrong backup email is
 *  the kind of mistake worth a deliberate confirm step rather than a silent onBlur save. */
export function AccountSecuritySection({
  backupEmail,
  backupEmailAddedAt,
  isStudent,
}: {
  backupEmail: string | null;
  backupEmailAddedAt: string | null;
  isStudent: boolean;
}) {
  const [value, setValue] = useState(backupEmail ?? "");
  const [addedAt, setAddedAt] = useState(backupEmailAddedAt);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateBackupEmail(value);
      if (result.ok) {
        setAddedAt(new Date().toISOString());
        setMessage({ kind: "ok", text: "Backup email saved" });
      } else {
        setMessage({ kind: "error", text: result.error ?? "Couldn't save that email." });
      }
    });
  };

  return (
    <div id="account-security" className="card elev-sm" style={{ marginTop: 18, scrollMarginTop: 90 }}>
      <div className="card-kicker">Account Security</div>

      <div style={{ marginTop: 10 }}>
        <label htmlFor="backup-email" style={{ fontSize: 14, fontFamily: "var(--font-heading)", display: "block" }}>
          Backup Email
        </label>
        <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "2px 0 10px" }}>
          Add a personal email to protect your account. If your .edu email expires you can
          sign in with this email and keep all your data.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            id="backup-email"
            type="email"
            className="input"
            style={{ flex: "1 1 240px" }}
            placeholder="you@personalemail.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="email"
          />
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={isPending || !value.trim()}>
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>

        {message && (
          <p
            style={{
              fontSize: 12.5,
              margin: "8px 0 0",
              color: message.kind === "ok" ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {message.text}
          </p>
        )}
        {!message && addedAt && (
          <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "8px 0 0" }}>
            Last updated {new Date(addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-accent-100)",
        }}
      >
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 13.5, color: "var(--color-accent-800)" }}>
          Why add a backup email?
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-accent-800)", margin: "6px 0 0" }}>
          Your .edu email may stop working after graduation. Adding a personal email now
          means your reading history, boards progress, streaks, saved articles, and Nexus
          profile will all carry over automatically when you transition to your next
          chapter. Your data is yours. We make sure you keep it.
        </p>
      </div>

      {isStudent && (
        <div
          style={{
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--color-migration-gold) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-migration-gold) 35%, transparent)",
          }}
        >
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text)", margin: 0 }}>
            <strong>Graduating soon?</strong> When you are ready to transition from Limbic
            Student to New Grad PRO your backup email becomes your primary sign in. Your
            founding member status, streaks, and all saved content carry over automatically.
          </p>
        </div>
      )}
    </div>
  );
}
