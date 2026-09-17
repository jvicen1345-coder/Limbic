"use client";

import { useTransition } from "react";
import { setGetTheAppDismissedAction } from "@/app/actions/profile";
import { Switch } from "@/components/Switch";

/** The Get the App card's own dismiss control (see GetTheAppCard.tsx) — optimistic like
 *  HomeWidgetToggle.tsx's pattern, so the switch (and the card content it drives) flips
 *  instantly instead of waiting on the round trip.
 *
 *  Controlled: the card owns dismissed state so a failed/no-op action can roll the compact
 *  UI back instead of leaving two useState copies out of sync. */
export function GetTheAppToggle({
  dismissed,
  onDismissedChange,
}: {
  dismissed: boolean;
  onDismissedChange: (dismissed: boolean) => void;
}) {
  const [, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
        {dismissed ? "Hidden" : "Shown"}
      </span>
      <Switch
        checked={dismissed}
        label={dismissed ? "Show the Get the App instructions" : "Hide the Get the App instructions"}
        onChange={() => {
          const previous = dismissed;
          const next = !dismissed;
          onDismissedChange(next);
          startTransition(async () => {
            try {
              const ok = await setGetTheAppDismissedAction(next);
              if (!ok) onDismissedChange(previous);
            } catch {
              onDismissedChange(previous);
            }
          });
        }}
      />
    </div>
  );
}
