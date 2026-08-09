"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { dismissMigrationBanner } from "@/app/actions/account-migration";

/** Amber, informational — shown to student-tier readers who haven't added a backup email
 *  once checkMigrationReminders() has flagged their account (see lib/migration-reminder.ts,
 *  app/(app)/page.tsx). Dismiss is session-only (a cookie, not the database — see
 *  app/actions/account-migration.ts dismissMigrationBanner), so it returns next session. */
export function MigrationReminderBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        background: "color-mix(in srgb, var(--color-migration-amber) 15%, var(--color-surface))",
        borderLeft: "3px solid var(--color-migration-amber)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>Your account security</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-neutral-700)", margin: "4px 0 8px" }}>
          Your .edu email may stop working after graduation. Add a personal backup email in
          Profile Settings to make sure you never lose access to your Limbic data.
        </p>
        <Link
          href="/profile#account-security"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--color-migration-amber)", textDecoration: "none" }}
        >
          → Add backup email
        </Link>
      </div>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ flexShrink: 0 }}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await dismissMigrationBanner();
            setDismissed(true);
          })
        }
      >
        Dismiss
      </button>
    </div>
  );
}
