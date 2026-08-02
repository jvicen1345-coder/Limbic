"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "@/components/icons";

/** Floats over the top of the Clips feed (see components/ClipsFeed.tsx). There's no
 *  server-side state to persist here, unlike RefreshWellnessButton — the feed's ordering
 *  (see lib/clip-rotation.ts orderClipsForUser) is already recomputed fresh, unseen-first,
 *  on every request; a plain router.refresh() is enough to pull a newly-shuffled batch,
 *  and clips/page.tsx keys <ClipsFeed> off that batch's content so a genuinely different
 *  order forces a clean remount instead of leaving stale laps on screen. */
export function RefreshClipsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="clip-action-btn"
      aria-label="Refresh clips"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
    >
      <RefreshIcon size={18} style={pending ? { animation: "spin 0.8s linear infinite" } : undefined} />
    </button>
  );
}
