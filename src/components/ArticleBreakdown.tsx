"use client";

import { useEffect, useState } from "react";
import { generateArticleBreakdownAction } from "@/app/actions/article-breakdown";
import { BREAKDOWN_FIELDS, type ArticleBreakdown } from "@/lib/article-breakdown-shared";

/** The article body on a research article — a five-field study breakdown standing in for
 *  the publisher's abstract, which is no longer rendered anywhere on this page (see
 *  lib/article-breakdown.ts for why).
 *
 *  Two paths in, and the fast one is the normal one:
 *
 *  - `initial` set: the breakdown was already in ArticleBreakdownCache when the page was
 *    built (lib/article-view.ts read it), so it server-renders with no fetch at all. This
 *    is every reader after the first for a given article, i.e. almost everyone.
 *  - `initial` null: nobody has opened this article yet. Generate on mount, once.
 *
 *  On failure the reader gets a short line plus the page's own link out to the source,
 *  which sits directly below this in ArticleReadingPane — deliberately *not* the abstract
 *  as a fallback, since not reprinting it is the point of the change. */
export function ArticleBreakdown({
  articleId,
  initial,
}: {
  articleId: string;
  initial: ArticleBreakdown | null;
}) {
  const [breakdown, setBreakdown] = useState<ArticleBreakdown | null>(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (initial) return;
    // Guards against a state update after the reader has already navigated (or swapped to
    // another article through Limbic Threads) while the call was in flight.
    let active = true;
    generateArticleBreakdownAction(articleId).then((res) => {
      if (!active) return;
      if (res.result) setBreakdown(res.result);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [articleId, initial]);

  if (failed) {
    return <p className="article-breakdown-failed">A breakdown isn&rsquo;t available for this study.</p>;
  }

  if (!breakdown) {
    return (
      <div className="article-breakdown-loading" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">Preparing the study breakdown…</span>
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="article-breakdown">
      {BREAKDOWN_FIELDS.map(({ key, label }) => (
        <div className="article-breakdown-row" key={key}>
          <div className="article-breakdown-label">{label}</div>
          {key === "findings" ? (
            <ul className="article-breakdown-findings">
              {breakdown.findings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          ) : (
            <p className="article-breakdown-value">{breakdown[key]}</p>
          )}
        </div>
      ))}
      <p className="article-breakdown-note">
        Summarized by Limbic from the published abstract. Read the source for the full text.
      </p>
    </div>
  );
}
