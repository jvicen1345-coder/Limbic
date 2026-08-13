"use client";

import { useEffect, useState } from "react";
import { HeroArticleCard } from "@/components/ArticleCard";
import type { DecoratedArticle } from "@/lib/feed";

const ROTATE_MS = 12000;

/** Auto-rotating hero — cycles through the top of the reader's ranked feed on a timer,
 *  the same rotation pattern as the Home sidebar's StockCard (see StockCard.tsx), just
 *  wrapping the full HeroArticleCard instead of a compact headline. Only ever fed
 *  articles that already resolved a real image (see HomeFeed's heroPool), so every
 *  rotation shows a picture. */
export function HeroFeed({ articles }: { articles: DecoratedArticle[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % articles.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [articles.length]);

  if (articles.length === 0) return null;
  const article = articles[index % articles.length];

  return (
    <div>
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
