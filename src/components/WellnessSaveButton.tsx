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
      className="btn btn-ghost btn-icon icon-btn-sized"
      aria-label={optimisticSaved ? "Remove from saved" : "Save"}
      // Custom property rather than a literal size — see SaveButton.tsx for why.
      style={{ "--icon-btn-dim": `${dim}px`, flexShrink: 0 } as React.CSSProperties}
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
