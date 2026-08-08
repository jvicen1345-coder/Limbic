"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

/** How long the "Copied" confirmation stays up before reverting to the normal label —
 *  same fixed-duration-feedback pattern as ProfessionalDatesForm's SAVED_CHECK_MS. */
const COPIED_MS = 2000;

/** Copies the current page's URL to the clipboard — the article detail page's action row
 *  (see ArticleReadingPane.tsx) is the only caller today, but this reads location.href
 *  itself rather than taking a url prop so it's correct wherever it's dropped in. */
export function ShareButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), COPIED_MS);
      }}
    >
      {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
