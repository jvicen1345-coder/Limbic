"use client";

import { useEffect, useState } from "react";
import { checkArticleOpenAccessAction } from "@/app/actions/article";

/** The feed-card counterpart to the "Open Access" badge on the article detail page (see
 *  components/ArticleReadingPane.tsx) — same look, different data flow. The detail page
 *  already has one article's Unpaywall result computed server-side before it renders; a
 *  feed has many cards at once, so checking every one up front would make the whole feed
 *  wait on a burst of Unpaywall lookups. Instead each card mounts first, then independently
 *  asks for its own doi's status — nothing here blocks the feed's initial paint, and a
 *  card with no doi (every non-PubMed source) never calls out at all. Renders nothing while
 *  loading or once resolved false, so a non-open-access card looks exactly as it did
 *  before this existed. */
export function OpenAccessPill({ doi }: { doi?: string }) {
  const [isOpenAccess, setIsOpenAccess] = useState(false);

  useEffect(() => {
    if (!doi) return;
    let cancelled = false;
    checkArticleOpenAccessAction(doi).then((result) => {
      if (!cancelled) setIsOpenAccess(result);
    });
    return () => {
      cancelled = true;
    };
  }, [doi]);

  if (!isOpenAccess) return null;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: "rgba(22, 163, 74, 0.12)",
        border: "1px solid rgba(22, 163, 74, 0.3)",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#16a34a",
      }}
    >
      Open Access
    </span>
  );
}
