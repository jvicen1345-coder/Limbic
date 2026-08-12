"use client";

import Link from "next/link";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { BackButton } from "@/components/BackButton";
import { ArticleImage } from "@/components/ArticleImage";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import { slugifyTopic } from "@/lib/topic-slug";
import type { DecoratedArticle } from "@/lib/feed";
import type { EvidenceLevel } from "@/lib/types";

/** Which of the Related grid's 6 left-border colors a card gets (see
 *  .article-related-border-* in globals.css) — keyed off the card's own evidence badge
 *  rather than its specialty, so the border tells the reader something the badge doesn't
 *  already show right next to it. */
function relatedBorderClass(level: EvidenceLevel | undefined): string {
  switch (level) {
    case "Research":
      return "article-related-border-res";
    case "RCT":
      return "article-related-border-rct";
    case "SR":
      return "article-related-border-sr";
    case "MA":
      return "article-related-border-ma";
    case "CPG":
      return "article-related-border-cpg";
    default:
      return "article-related-border-default";
  }
}

/** The article body/tags/meta/Related markup — extracted from what used to be
 *  app/(app)/article/[id]/page.tsx's own JSX so the exact same rendering serves both the
 *  server-rendered first article and every article swapped in afterward via Limbic
 *  Threads (see components/ArticleThreadsSplitView.tsx, which renders this keyed by
 *  article id so SaveButton's optimistic state and this pane both reset cleanly on
 *  every swap rather than carrying over stale state from the previous article). */
export function ArticleReadingPane({ article, related }: { article: DecoratedArticle; related: DecoratedArticle[] }) {
  const evidenceMeta = article.evidenceLevel ? EVIDENCE_LEVEL_META[article.evidenceLevel] : null;

  return (
    <div className="article-reading-card">
      <BackButton />

      <div style={{ marginTop: 14 }}>
        {evidenceMeta && article.evidenceLevel && (
          <>
            <EvidenceBadge level={article.evidenceLevel} size="xl" />
            {evidenceMeta.description && <p className="article-evidence-caption">{evidenceMeta.description}</p>}
          </>
        )}

        <div className="article-breadcrumb">
          {article.typeLabel} · {article.specialtyLabel}
        </div>

        <h1 className="article-hero-title">{article.title}</h1>

        <div className="article-hero-journal">{article.source}</div>
        <div className="article-hero-datemeta">
          {article.dateLabel} · {article.readMins} min read
        </div>
      </div>

      <hr className="article-hero-divider" />

      <div className="article-prose">
        {article.body && article.body.length > 0 ? (
          article.body.map((para, i) => (
            <p key={i} className={i === 0 ? "article-lede" : undefined}>
              {para}
            </p>
          ))
        ) : (
          <p className="article-lede">
            {article.summary}
            {article.sourceUrl && (
              <span className="article-continue-inline">
                {" "}
                …{" "}
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Continue reading at source
                </a>
              </span>
            )}
          </p>
        )}
      </div>

      {article.sourceUrl && (
        <div className="article-actions">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary article-actions-primary"
          >
            Read the full story at {article.source} →
          </a>
          <div className="article-actions-secondary">
            <SaveButton articleId={article.id} saved={article.saved} article={article} label="Save Article" />
            <ShareButton />
          </div>
        </div>
      )}

      {article.tags.length > 0 && (
        <div>
          <div className="article-section-label">Topics</div>
          <div className="article-topics-row">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/home?topic=${slugifyTopic(tag)}`} className="tag tag-outline article-topic-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <div className="article-section-label">Related</div>
          <div className="article-related-grid">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/article/${rel.id}`}
                className={`card elev-sm card-hoverable article-related-card ${relatedBorderClass(rel.evidenceLevel)}`}
              >
                {rel.image && (
                  <div className="article-related-thumb">
                    <ArticleImage src={rel.image} fill />
                  </div>
                )}
                <div className="article-related-body">
                  <div className="article-related-top">
                    {rel.evidenceLevel && <EvidenceBadge level={rel.evidenceLevel} />}
                    <span className="tag tag-neutral">{rel.specialtyLabel}</span>
                  </div>
                  <hr className="article-related-divider" />
                  <div className="article-related-title">{rel.title}</div>
                  <div className="article-related-meta">
                    {rel.source} · {rel.readMins} min
                  </div>
                  <div className="article-related-date">{rel.dateLabel}</div>
                </div>
                <span className="article-related-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
