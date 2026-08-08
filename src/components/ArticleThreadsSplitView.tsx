"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { swapArticleAction } from "@/app/actions/article";
import { ArticleReadingPane } from "@/components/ArticleReadingPane";
import { ThreadsWeb } from "@/components/ThreadsWeb";
import { ReadingProgressTracker } from "@/components/ReadingProgressTracker";
import type { ArticleViewData } from "@/lib/article-view";

/**
 * Owns the article reading pane + Limbic Threads panel as a persistent pair. Clicking a
 * connected-article node in Threads (see the onNavigateToArticle prop on ThreadsWeb) swaps
 * the reading pane's content in place instead of doing a full page navigation — no reload,
 * no losing the Threads panel, so a reader can follow a chain of connected articles
 * ("blood-flow restriction -> connected study -> its related guideline -> ...") without
 * losing their place each time.
 *
 * The Threads panel itself always rebuilds fresh around whichever article is current (see
 * the `key={view.article.id}` below) — a web is FOR one article, so that's the correct
 * behavior, not something to preserve. Threads is always visible and building itself
 * automatically the moment either the initial page load or a swap lands (see
 * components/ThreadsWeb.tsx), so unlike before, nothing here needs to remember whether the
 * reader has swapped at least once.
 */
export function ArticleThreadsSplitView({
  initialView,
  isPro,
}: {
  initialView: ArticleViewData;
  isPro: boolean;
}) {
  const [view, setView] = useState(initialView);
  const [swapError, setSwapError] = useState<string | null>(null);
  // Guards against re-running the swap for the id already on screen — both the click
  // handler and the popstate handler funnel through this.
  const currentIdRef = useRef(initialView.article.id);

  const swapTo = useCallback(async (articleId: string, { pushUrl }: { pushUrl: boolean }) => {
    if (articleId === currentIdRef.current) return;
    setSwapError(null);
    const result = await swapArticleAction(articleId);
    if (!result.ok) {
      setSwapError(result.message);
      return;
    }
    currentIdRef.current = articleId;
    setView(result.data);
    if (pushUrl) window.history.pushState(null, "", `/article/${articleId}`);
  }, []);

  // Browser Back/Forward — pushState above only updates the address bar, it doesn't
  // re-render anything on its own, so the pane has to notice the URL changed and catch
  // up to it itself. Doesn't push a new history entry (that's what triggered this in the
  // first place) — just re-syncs the pane to whatever id is now in the URL.
  useEffect(() => {
    function handlePopState() {
      const match = /^\/article\/([^/?]+)/.exec(window.location.pathname);
      if (match) swapTo(match[1], { pushUrl: false });
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [swapTo]);

  return (
    <div className="article-split-pad">
      <ReadingProgressTracker articleId={view.article.id} />
      <div className="article-split">
        <div className="article-split-reading">
          <ArticleReadingPane key={view.article.id} article={view.article} related={view.related} />
          {swapError && (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 12 }}>{swapError}</p>
          )}
        </div>
        <div className="article-split-threads">
          <ThreadsWeb
            key={view.article.id}
            articleId={view.article.id}
            webNodes={view.threadsNodes}
            isPro={isPro}
            onNavigateToArticle={(id) => swapTo(id, { pushUrl: true })}
          />
        </div>
      </div>
    </div>
  );
}
