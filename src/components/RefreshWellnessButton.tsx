"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshWellnessAction } from "@/app/actions/wellness";
import { RefreshIcon } from "@/components/icons";

export function RefreshWellnessButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await refreshWellnessAction();
          router.refresh();
        });
      }}
    >
      <RefreshIcon size={15} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
