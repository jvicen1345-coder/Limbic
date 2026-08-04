"use client";

import Link from "next/link";
import { SaveButton } from "@/components/SaveButton";
import { BackButton } from "@/components/BackButton";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import type { DecoratedArticle } from "@/lib/feed";

/** The article body/tags/meta/Related markup — extracted from what used to be
 *  app/(app)/article/[id]/page.tsx's own JSX so the exact same rendering serves both the
 *  server-rendered first article and every article swapped in afterward via Limbic
 *  Threads (see components/ArticleThreadsSplitView.tsx, which renders this keyed by
 *  article id so SaveButton's optimistic state and this pane both reset cleanly on
 *  every swap rather than carrying over stale state from the previous article). */
export function ArticleReadingPane({ article, related }: { article: DecoratedArticle; related: DecoratedArticle[] }) {
  return (
    <div>
      <BackButton />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className={article.typeTagClass}>{article.typeLabel}</span>
        <span className="tag tag-neutral">{article.specialtyLabel}</span>
      </div>
      <h1 style={{ fontSize: 27, margin: "0 0 10px", lineHeight: 1.18 }}>{article.title}</h1>

      {article.evidenceLevel && (
        <div style={{ marginBottom: 18 }}>
          <EvidenceBadge level={article.evidenceLevel} size="lg" />
          <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-700)", margin: "6px 0 0" }}>
            {EVIDENCE_LEVEL_META[article.evidenceLevel].label} — {EVIDENCE_LEVEL_META[article.evidenceLevel].description}
          </p>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          {article.source} · {article.dateLabel} · {article.readMins} min read
        </div>
        <SaveButton articleId={article.id} saved={article.saved} size="md" />
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--color-text)", fontWeight: 600, margin: "0 0 18px" }}>
        {article.summary}
      </p>

      {article.body ? (
        article.body.map((para, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text)", margin: "0 0 14px" }}>
            {para}
          </p>
        ))
      ) : article.sourceUrl ? (
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ marginBottom: 18 }}
        >
          Read the full story at {article.source} ↗
        </a>
      ) : null}

      {article.tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 32px" }}>
          {article.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">
              {tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div style={{ borderTop: "1px solid var(--color-neutral-200)", paddingTop: 18 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              marginBottom: 10,
            }}
          >
            Related
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/article/${rel.id}`}
                style={{
                  cursor: "pointer",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-neutral-100)",
                  color: "inherit",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--color-accent-700)", marginBottom: 3 }}>{rel.typeLabel}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, lineHeight: 1.25 }}>{rel.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
