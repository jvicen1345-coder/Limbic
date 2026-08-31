"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { toggleSaveAction } from "@/app/actions/saved";
import { BookmarkIcon } from "@/components/icons";
import type { Article } from "@/lib/types";

export function SaveButton({
  articleId,
  saved,
  size = "md",
  article,
  label,
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
  /** When set, renders a labeled "Save Article" / "Saved" text button (see the article
   *  detail page's action row in components/ArticleReadingPane.tsx) instead of the bare
   *  icon-only button every other caller uses — same toggle underneath, just a different
   *  shell around it so there's one save codepath instead of two. */
  label?: string;
}) {
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [, startTransition] = useTransition();
  const dim = size === "sm" ? 30 : 32;
  const icon = size === "sm" ? 15 : 16;

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOptimisticSaved((v) => !v);
    startTransition(() => {
      toggleSaveAction(articleId, article);
    });
  };

  if (label) {
    return (
      <button type="button" className="btn btn-secondary" onClick={onClick}>
        <BookmarkIcon size={15} filled={optimisticSaved} />
        {optimisticSaved ? "Saved" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon icon-btn-sized"
      aria-label={optimisticSaved ? "Remove from saved" : "Save"}
      // Size passed as a custom property rather than a literal width/height: an inline
      // width beats any stylesheet rule, which left this button stuck below the touch
      // target floor on phones. See .icon-btn-sized in globals.css.
      style={{ "--icon-btn-dim": `${dim}px`, flexShrink: 0 } as React.CSSProperties}
      onClick={onClick}
    >
      <BookmarkIcon size={icon} filled={optimisticSaved} />
    </button>
  );
}
