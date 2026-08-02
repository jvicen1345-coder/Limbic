"use client";

import { useState, useTransition } from "react";
import { toggleSaveClipAction } from "@/app/actions/clips";
import { BookmarkIcon } from "@/components/icons";
import type { Clip } from "@/lib/types";

/** Same optimistic toggle pattern as components/SaveButton.tsx and WellnessSaveButton.tsx,
 *  targeting the dedicated SavedClip table. "overlay" (default) matches the translucent
 *  circle style of the other clip-actions buttons over a video, for use in the ClipsFeed
 *  swipe view; "ghost" matches the plain light-surface icon buttons used everywhere else
 *  (e.g. components/SavedClipCard.tsx on /saved/clips). */
export function ClipSaveButton({
  clip,
  saved,
  variant = "overlay",
}: {
  clip: Clip;
  saved: boolean;
  variant?: "overlay" | "ghost";
}) {
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={variant === "overlay" ? "clip-action-btn" : "btn btn-ghost btn-icon"}
      style={variant === "overlay" ? { padding: 0 } : { width: 30, height: 30 }}
      aria-label={optimisticSaved ? "Remove from saved" : "Save"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setOptimisticSaved((v) => !v);
        startTransition(() => {
          toggleSaveClipAction(clip.id, { title: clip.title, source: clip.source, url: clip.url, specialty: clip.specialty });
        });
      }}
    >
      <BookmarkIcon size={variant === "overlay" ? 20 : 15} filled={optimisticSaved} />
    </button>
  );
}
