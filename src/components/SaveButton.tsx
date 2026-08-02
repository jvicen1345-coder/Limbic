"use client";

import { useState, useTransition } from "react";
import { toggleSaveAction } from "@/app/actions/saved";
import { BookmarkIcon } from "@/components/icons";
import type { Article } from "@/lib/types";

export function SaveButton({
  articleId,
  saved,
  size = "md",
  article,
}: {
  articleId: string;
  saved: boolean;
  size?: "sm" | "md";
  /** The article as currently displayed, when known — snapshotted straight into
   *  SavedArticle instead of having the server re-resolve articleId from scratch, which
   *  can't recover context a live source only attached at search time (e.g. a PubMed
   *  practice-guideline search tags its results type: "guideline", but re-resolving that
   *  same PMID by id alone always falls back to type: "research" — see lib/pubmed.ts
   *  fetchPubmedById). Omitted for saves that aren't real resolvable articles (clips,
   *  wellness), which already work fine without a snapshot. */
  article?: Article;
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
          toggleSaveAction(articleId, article);
        });
      }}
    >
      <BookmarkIcon size={icon} filled={optimisticSaved} />
    </button>
  );
}
