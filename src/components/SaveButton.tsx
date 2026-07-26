"use client";

import { useState, useTransition } from "react";
import { toggleSaveAction } from "@/app/actions/saved";
import { BookmarkIcon } from "@/components/icons";

export function SaveButton({
  articleId,
  saved,
  size = "md",
}: {
  articleId: string;
  saved: boolean;
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
        setOptimisticSaved((v) => !v);
        startTransition(() => {
          toggleSaveAction(articleId);
        });
      }}
    >
      <BookmarkIcon size={icon} filled={optimisticSaved} />
    </button>
  );
}
