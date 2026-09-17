"use client";

import { useState, useTransition } from "react";
import { createNexusPostAction } from "@/app/actions/nexus";

/** One-click "share your time" for Daily Term / Limbic Boards completions (see
 *  app/actions/daily-completion.ts) — reuses createNexusPostAction directly rather than a
 *  new action, since posting an auto-composed body is the same trust boundary as the
 *  regular Nexus composer already accepting any freeform text from an opted-in user.
 *
 *  `nexusOptIn` is supplied as "this reader can post to Nexus" — the callers already fold
 *  in whether Nexus is visible to them at all (see lib/nexus-visibility.ts), so a reader
 *  Nexus is hidden from renders nothing here rather than an invitation to a feature they
 *  cannot reach. */
export function ShareCompletionButton({ body, nexusOptIn }: { body: string; nexusOptIn: boolean }) {
  const [shared, setShared] = useState(false);
  const [, startTransition] = useTransition();

  if (!nexusOptIn) return null;

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
