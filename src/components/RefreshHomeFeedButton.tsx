"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshHomeFeedAction } from "@/app/actions/home";
import { RefreshIcon } from "@/components/icons";

/** Same pattern as RefreshWellnessButton — a Server Action does the actual cache
 *  invalidation (see app/actions/home.ts), then router.refresh() re-renders this page
 *  against the now-fresh data. */
export function RefreshHomeFeedButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary btn-icon"
      aria-label="Refresh articles"
      title="Get new articles"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await refreshHomeFeedAction();
          router.refresh();
        });
      }}
    >
      <RefreshIcon size={16} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
    </button>
  );
}
