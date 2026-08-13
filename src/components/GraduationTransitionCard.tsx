"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { snoozeGraduationTransition } from "@/app/actions/account-migration";

/** Warm, celebratory — shown once a student's graduationDate has passed (see
 *  app/(app)/page.tsx), re-shown every 7 days until they act. "Maybe later" snoozes it
 *  (see app/actions/account-migration.ts snoozeGraduationTransition); "Upgrade to New Grad
 *  PRO" is a plain link with no side effect of its own. */
export function GraduationTransitionCard() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  return (
    <div
      className="elev-sm"
      style={{
        marginBottom: 16,
        padding: "18px 20px",
        borderRadius: "var(--radius-lg)",
        background: "color-mix(in srgb, var(--color-migration-gold) 10%, var(--color-surface))",
        border: "1px solid color-mix(in srgb, var(--color-migration-gold) 40%, transparent)",
      }}
    >
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "var(--color-migration-gold)" }}>
        Congratulations on graduating.
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: "6px 0 4px" }}>
        Your Limbic Student account is ready to transition to New Grad PRO.
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Everything carries over, your reading history, boards progress, streaks, saved
        articles, and Nexus profile are all waiting for you.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/pro" className="btn" style={{ background: "var(--color-migration-gold)", color: "#241704", border: "none" }}>
          Upgrade to New Grad PRO
        </Link>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await snoozeGraduationTransition();
              setDismissed(true);
            })
          }
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
