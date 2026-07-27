"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DecoratedArticle } from "@/lib/feed";

const ROTATE_MS = 6000;

/** A real og:image can still fail to load client-side (hotlink protection, a since-
 *  removed asset, …). Keyed by article id from the parent so switching articles remounts
 *  this and naturally resets `failed`, instead of tracking that reset with an effect. */
function ArticleImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domains
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: "100%",
        height: 90,
        objectFit: "cover",
        borderRadius: "var(--radius-md)",
        marginBottom: 8,
        display: "block",
      }}
    />
  );
}

/** Small auto-rotating headline card for the home sidebar — cycles through the latest
 *  news (guidelines/industry/equipment, not research or events; see page.tsx) on a
 *  timer. Shows each article's own image (its real og:image) when one could be found;
 *  otherwise just renders the text, since a fabricated stand-in would misrepresent what
 *  the article actually looks like. */
export function RevolvingNews({ articles }: { articles: DecoratedArticle[] }) {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (articles.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % articles.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [articles.length]);

  if (articles.length === 0) return null;
  const article = articles[index % articles.length];

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div className="card-kicker" style={{ margin: 0, fontSize: 9 }}>
        Latest news
      </div>
      <div
        key={article.id}
        className="revolving-news-item"
        style={{ cursor: "pointer", marginTop: 8 }}
        onClick={() => router.push(`/article/${article.id}`)}
      >
        {article.image && <ArticleImage key={article.id} src={article.image} />}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span className={article.typeTagClass} style={{ fontSize: 9.5, padding: "2px 8px" }}>
            {article.typeLabel}
          </span>
          <span style={{ fontSize: 10, color: "var(--color-neutral-700)" }}>{article.dateLabel}</span>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, lineHeight: 1.3 }}>{article.title}</div>
        <div style={{ fontSize: 10.5, color: "var(--color-neutral-700)", marginTop: 5 }}>{article.source}</div>
      </div>
      {articles.length > 1 && (
        <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
          {articles.map((a, i) => (
            <button
              key={a.id}
              type="button"
              aria-label={`Show story ${i + 1} of ${articles.length}`}
              aria-current={i === index}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              style={{
                width: 6,
                height: 6,
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
