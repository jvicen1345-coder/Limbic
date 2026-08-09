"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshHomeFeedAction } from "@/app/actions/home";
import { RefreshIcon } from "@/components/icons";

/** Same pattern as RefreshWellnessButton — a Server Action does the actual cache
 *  invalidation (see app/actions/home.ts), then router.refresh() re-renders this page
 *  against the now-fresh data. `gridArticleFingerprints` are title fingerprints (see
 *  lib/home-grid-rotation.ts titleFingerprint) of whatever the grid is showing right now
 *  (see components/HomeFeed.tsx) — passed along so the action can mark them seen before
 *  the next render picks the grid's articles again, which is what actually makes Refresh
 *  rotate to different cards instead of landing back on the same ones. */
export function RefreshHomeFeedButton({ gridArticleFingerprints }: { gridArticleFingerprints: string[] }) {
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
          await refreshHomeFeedAction(gridArticleFingerprints);
          router.refresh();
        });
      }}
    >
      <RefreshIcon size={16} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
    </button>
  );
}
