"use client";

import { useState, useTransition } from "react";
import { makePrimaryEmail, dismissBackupSigninBanner } from "@/app/actions/account-migration";

/** One-time banner shown after a sign-in that matched on backupEmail rather than the
 *  primary email (see lib/session.ts signInToUserRecord, hasBackupSigninFlag) — offers to
 *  promote that backup email to primary right away. */
export function BackupSigninBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  return (
    <div
      className="card elev-sm"
      style={{
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <p style={{ fontSize: 13.5, margin: 0 }}>
        You signed in with your backup email. Would you like to make this your primary email?
      </p>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await makePrimaryEmail();
              setDismissed(true);
            })
          }
        >
          Yes
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await dismissBackupSigninBanner();
              setDismissed(true);
            })
          }
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
