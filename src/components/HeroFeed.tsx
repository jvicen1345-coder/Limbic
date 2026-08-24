"use client";

import { useEffect, useRef, useState } from "react";
import { HeroArticleCard } from "@/components/ArticleCard";
import type { DecoratedArticle } from "@/lib/feed";

const ROTATE_MS = 12000;
const SWIPE_THRESHOLD_PX = 40;

/** Auto-rotating hero — cycles through the top of the reader's ranked feed on a timer,
 *  the same rotation pattern as the Home sidebar's StockCard (see StockCard.tsx), just
 *  wrapping the full HeroArticleCard instead of a compact headline. Only ever fed
 *  articles that already resolved a real image (see HomeFeed's heroPool), so every
 *  rotation shows a picture.
 *
 *  Also swipeable on touch — left advances, right goes back, same direction convention as
 *  a native carousel. Read via React's synthetic touch events rather than a native
 *  addEventListener effect (see PullToRefresh.tsx for that heavier pattern) since nothing
 *  here needs passive:false/preventDefault; a horizontal-dominant drag past
 *  SWIPE_THRESHOLD_PX switches articles, anything more vertical than horizontal is left
 *  alone as the reader scrolling the page. The rotation timer restarts on every index
 *  change — including a manual swipe or dot tap below — so a reader who just navigated
 *  manually always gets the full ROTATE_MS before the next auto-advance, rather than
 *  potentially getting yanked forward a moment later. */
export function HeroFeed({ articles }: { articles: DecoratedArticle[] }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (articles.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % articles.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [articles.length, index]);

  if (articles.length === 0) return null;
  const article = articles[index % articles.length];

  const go = (delta: number) => {
    if (articles.length <= 1) return;
    setIndex((i) => (i + delta + articles.length) % articles.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Keyed by article id so rotating swaps remount the card, otherwise SaveButton's
       *  own optimistic-saved state (see SaveButton.tsx) would carry over from whichever
       *  article previously occupied this slot. */}
      <HeroArticleCard key={article.id} article={article} />
      {articles.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center" }}>
          {articles.map((a, i) => (
            <button
              key={a.id}
              type="button"
              aria-label={`Show recommended story ${i + 1} of ${articles.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "var(--color-accent)" : "var(--color-neutral-300)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
