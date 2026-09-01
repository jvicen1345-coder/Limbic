"use client";

import Link from "next/link";
import { WellnessSaveButton } from "@/components/WellnessSaveButton";
import { markWellnessOpenedAction } from "@/app/actions/wellness";
import { CheckIcon } from "@/components/icons";
import type { WellnessArticle } from "@/lib/types";
import { formatDate } from "@/lib/meta";

/** Overview's "Latest Wellness Articles" preview — the same three articles the plain
 *  RowCards WellnessListItem used to render as three identical rows, re-laid-out with the
 *  first as a featured card and the other two as compact list rows beneath it, so the feed
 *  reads as "here's the one to read, plus two more" rather than an undifferentiated stack.
 *  Same data, same links, same save/opened tracking as WellnessListItem — see that
 *  component (components/RowCards.tsx) for why external vs. internal articles link
 *  differently and why only the external case fires markWellnessOpenedAction here. */

function ArticleLink({ w, className }: { w: WellnessArticle; className: string }) {
  return w.sourceUrl ? (
    <a
      href={w.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => markWellnessOpenedAction(w.id)}
    >
      {w.title}
    </a>
  ) : (
    <Link href={`/wellness/${w.id}`} className={className}>
      {w.title}
    </Link>
  );
}

function saveSnapshot(w: WellnessArticle) {
  return { title: w.title, source: w.source, sourceUrl: w.sourceUrl, date: w.date, readMins: w.readMins, summary: w.summary };
}

export function WellnessArticlePreview({
  articles,
  savedIds,
  openedIds,
}: {
  articles: WellnessArticle[];
  savedIds: string[];
  openedIds: string[];
}) {
  if (articles.length === 0) return null;
  const [featured, ...rest] = articles;
  const savedSet = new Set(savedIds);
  const openedSet = new Set(openedIds);

  return (
    <div>
      <div className="wellness-article-featured">
        <div className="wellness-article-featured-body">
          <ArticleLink w={featured} className="wellness-article-featured-title" />
          <div className="wellness-article-featured-meta">
            <span>{featured.source}</span>
            <span className="wellness-article-dot" />
            <span>{formatDate(featured.date)}</span>
            {openedSet.has(featured.id) && (
              <span className="wellness-article-read" title="You&rsquo;ve already read this">
                <CheckIcon size={11} />
                Read
              </span>
            )}
          </div>
        </div>
        <WellnessSaveButton
          itemId={featured.id}
          kind="article"
          saved={savedSet.has(featured.id)}
          size="sm"
          snapshot={saveSnapshot(featured)}
        />
        {/* Decorative — the whole title is already the link, so this must not be announced
            again to a screen reader as a second, unlabeled route to the same article. */}
        <span className="wellness-article-featured-arrow" aria-hidden="true">
          →
        </span>
      </div>

      {rest.map((w) => (
        <div key={w.id} className="wellness-article-row">
          <ArticleLink w={w} className="wellness-article-row-title" />
          <div className="wellness-article-row-meta">
            <span>
              {w.source} &middot; {formatDate(w.date)}
            </span>
            <WellnessSaveButton itemId={w.id} kind="article" saved={savedSet.has(w.id)} size="sm" snapshot={saveSnapshot(w)} />
          </div>
        </div>
      ))}
    </div>
  );
}
