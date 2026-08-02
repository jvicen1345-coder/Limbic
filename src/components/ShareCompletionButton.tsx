"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createNexusPostAction } from "@/app/actions/nexus";

/** One-click "share your time" for Daily Term / Limbic Boards completions (see
 *  app/actions/daily-completion.ts) — reuses createNexusPostAction directly rather than a
 *  new action, since posting an auto-composed body is the same trust boundary as the
 *  regular Nexus composer already accepting any freeform text from an opted-in user. */
export function ShareCompletionButton({ body, nexusOptIn }: { body: string; nexusOptIn: boolean }) {
  const [shared, setShared] = useState(false);
  const [, startTransition] = useTransition();

  if (!nexusOptIn) {
    return (
      <Link href="/nexus" style={{ fontSize: 12.5, color: "var(--color-accent-700)" }}>
        Join Nexus to share your time
      </Link>
    );
  }

  if (shared) {
    return <span style={{ fontSize: 12.5, color: "var(--color-neutral-700)" }}>Shared to Nexus ✓</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => {
        setShared(true);
        const formData = new FormData();
        formData.set("body", body);
        startTransition(() => {
          createNexusPostAction(formData);
        });
      }}
    >
      Share to Nexus
    </button>
  );
}
