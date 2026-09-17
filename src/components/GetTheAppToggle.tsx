"use client";

import { useRef, useTransition } from "react";
import { setGetTheAppDismissedAction } from "@/app/actions/profile";
import { Switch } from "@/components/Switch";

/** The Get the App card's own dismiss control (see GetTheAppCard.tsx) — optimistic like
 *  HomeWidgetToggle.tsx's pattern, so the switch (and the card content it drives) flips
 *  instantly instead of waiting on the round trip.
 *
 *  Controlled: the card owns dismissed state so a failed/no-op action can roll the compact
 *  UI back instead of leaving two useState copies out of sync. Disabled while the action
 *  is in flight so a second click cannot race the first. */
export function GetTheAppToggle({
  dismissed,
  onDismissedChange,
}: {
  dismissed: boolean;
  onDismissedChange: (dismissed: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const inflight = useRef(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
        {dismissed ? "Hidden" : "Shown"}
      </span>
      <Switch
        checked={dismissed}
        disabled={pending}
        label={dismissed ? "Show the Get the App instructions" : "Hide the Get the App instructions"}
        onChange={() => {
          if (pending || inflight.current) return;
          inflight.current = true;
          const previous = dismissed;
          const next = !dismissed;
          onDismissedChange(next);
          startTransition(async () => {
            try {
              const ok = await setGetTheAppDismissedAction(next);
              if (!ok) onDismissedChange(previous);
            } catch {
              onDismissedChange(previous);
            } finally {
              inflight.current = false;
            }
          });
        }}
      />
    </div>
  );
}
