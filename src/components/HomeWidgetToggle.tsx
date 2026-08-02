"use client";

import { useState, useTransition } from "react";
import { toggleHomeWidgetAction } from "@/app/actions/profile";
import type { HomeWidgetId } from "@/lib/home-widgets";

export function HomeWidgetToggle({ id, label, visible }: { id: HomeWidgetId; label: string; visible: boolean }) {
  const [optimistic, setOptimistic] = useState(visible);
  const [, startTransition] = useTransition();
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={optimistic}
        onChange={() => {
          setOptimistic((v) => !v);
          startTransition(() => {
            toggleHomeWidgetAction(id);
          });
        }}
      />
      {label}
    </label>
  );
}
