"use client";

import { useState, useTransition } from "react";
import { setGetTheAppDismissedAction } from "@/app/actions/profile";
import { Switch } from "@/components/Switch";

/** The Get the App card's own dismiss control (see GetTheAppCard.tsx) — optimistic like
 *  HomeWidgetToggle.tsx's pattern, so the switch (and the card content it drives) flips
 *  instantly instead of waiting on the round trip. */
export function GetTheAppToggle({ dismissed }: { dismissed: boolean }) {
  const [optimistic, setOptimistic] = useState(dismissed);
  const [, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
        {optimistic ? "Hidden" : "Already added?"}
      </span>
      <Switch
        checked={optimistic}
        label="Hide the Get the App instructions"
        onChange={() => {
          const next = !optimistic;
          setOptimistic(next);
          startTransition(() => {
            setGetTheAppDismissedAction(next);
          });
        }}
      />
    </div>
  );
}
