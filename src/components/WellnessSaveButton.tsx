"use client";

import { useState, useTransition } from "react";
import { toggleSaveWellnessAction } from "@/app/actions/wellness";
import { BookmarkIcon } from "@/components/icons";

interface WellnessSaveSnapshot {
  title: string;
  source: string;
  /** Absent for a seed wellness article, which links to our own /wellness/[id] instead. */
  sourceUrl?: string;
  date?: string;
  readMins?: number;
  summary?: string;
  duration?: string;
}

/** Same optimistic toggle pattern as components/SaveButton.tsx, targeting the dedicated
 *  SavedWellness table instead of SavedArticle — wellness articles and videos have no
 *  ArticleType/specialty, so they don't fit through the regular save action. */
export function WellnessSaveButton({
  itemId,
  kind,
  saved,
  snapshot,
  size = "md",
}: {
  itemId: string;
  kind: "article" | "video";
  saved: boolean;
  snapshot: WellnessSaveSnapshot;
  size?: "sm" | "md";
}) {
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [, startTransition] = useTransition();
  const dim = size === "sm" ? 30 : 32;
  const icon = size === "sm" ? 15 : 16;

  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      aria-label={optimisticSaved ? "Remove from saved" : "Save"}
      style={{ width: dim, height: dim, flexShrink: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setOptimisticSaved((v) => !v);
        startTransition(() => {
          toggleSaveWellnessAction(itemId, kind, snapshot);
        });
      }}
    >
      <BookmarkIcon size={icon} filled={optimisticSaved} />
    </button>
  );
}
