"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

/** How long the "Copied" confirmation stays up before reverting to the normal label —
 *  same fixed-duration-feedback pattern as ProfessionalDatesForm's SAVED_CHECK_MS. */
const COPIED_MS = 2000;

/** Copies to the clipboard — defaults to the current page's URL (the article detail page's
 *  action row, see ArticleReadingPane.tsx) but accepts a `text` override for callers that
 *  want to share something more specific, like a game's result summary (see
 *  CrosswordGame.tsx's completion overlay) — one copy-to-clipboard codepath rather than a
 *  duplicated one per caller. `label`/`className` let a caller match its own surrounding
 *  button row instead of always rendering as a standalone secondary button. */
export function ShareButton({
  text,
  label = "Share",
  className = "btn btn-secondary",
}: {
  text?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text ?? window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), COPIED_MS);
      }}
    >
      {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      {copied ? "Copied" : label}
    </button>
  );
}
