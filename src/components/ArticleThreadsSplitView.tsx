"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { swapArticleAction } from "@/app/actions/article";
import { ArticleReadingPane } from "@/components/ArticleReadingPane";
import { ReadingProgressTracker } from "@/components/ReadingProgressTracker";
import { ThreadsChat } from "@/components/ThreadsChat";
import type { ArticleViewData } from "@/lib/article-view";

const ThreadsNav = dynamic(() => import("@/components/ThreadsNav").then((module) => module.ThreadsNav), {
  loading: () => (
    <div role="status" aria-label="Loading article connections" aria-busy="true" style={{ minHeight: 320 }} />
  ),
});

/**
 * Owns the article reading pane + Limbic Threads panel as a persistent pair. Threads itself
 * is two stacked panels: ThreadsNav (a small web of real navigation — related articles,
 * guidelines, Nexus) and ThreadsChat (AI-generated clinical reasoning, as chat rather than
 * more graph nodes). Clicking a connected-article node in ThreadsNav (see its
 * onNavigateToArticle prop) swaps the reading pane's content in place instead of doing a
 * full page navigation — no reload, no losing either Threads panel, so a reader can follow
 * a chain of connected articles ("blood-flow restriction -> connected study -> its related
 * guideline -> ...") without losing their place each time.
 *
 * Both panels rebuild fresh around whichever article is current (see the `key={view.article.id}`
 * below) — Threads is FOR one article, so that's the correct behavior, not something to
 * preserve across a swap.
 */
export function ArticleThreadsSplitView({
  initialView,
  isPro,
  hasResearchAccess,
}: {
  initialView: ArticleViewData;
  isPro: boolean;
  hasResearchAccess: boolean;
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
          <ArticleReadingPane
            key={view.article.id}
            article={view.article}
            related={view.related}
            unpaywallResult={view.unpaywallResult}
            breakdown={view.breakdown}
            hasBreakdown={view.hasBreakdown}
            hasResearchAccess={hasResearchAccess}
          />
          {swapError && (
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 12 }}>{swapError}</p>
          )}
        </div>
        <div className="article-split-threads">
          <ThreadsNav
            key={`nav-${view.article.id}`}
            webNodes={view.threadsNodes}
            onNavigateToArticle={(id) => swapTo(id, { pushUrl: true })}
          />
          <ThreadsChat
            key={`chat-${view.article.id}`}
            articleId={view.article.id}
            articleTitle={view.article.title}
            isPro={isPro}
          />
        </div>
      </div>
    </div>
  );
}
