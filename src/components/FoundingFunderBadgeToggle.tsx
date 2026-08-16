"use client";

import { useState, useTransition } from "react";
import { setFoundingFunderBadgeHiddenAction } from "@/app/actions/profile";
import { Switch } from "@/components/Switch";

/** Profile's Founding Funder badge toggle — optimistic like GetTheAppToggle.tsx's pattern,
 *  so the switch flips instantly instead of waiting on the round trip. Only rendered for an
 *  actual funder (see app/(app)/profile/page.tsx) — there's nothing to toggle otherwise. */
export function FoundingFunderBadgeToggle({ hidden }: { hidden: boolean }) {
  const [optimistic, setOptimistic] = useState(hidden);
  const [, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{optimistic ? "Hidden" : "Shown"}</span>
      <Switch
        checked={!optimistic}
        label="Show Founding Funder badge"
        onChange={() => {
          const next = !optimistic;
          setOptimistic(next);
          startTransition(() => {
            setFoundingFunderBadgeHiddenAction(next);
          });
        }}
      />
    </div>
  );
}
