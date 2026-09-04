"use client";

import Link from "next/link";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { BackButton } from "@/components/BackButton";
import { ArticleImage } from "@/components/ArticleImage";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { ArticleResearchPanel } from "@/components/ArticleResearchPanel";
import { ArticleBreakdown } from "@/components/ArticleBreakdown";
import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import { slugifyTopic } from "@/lib/topic-slug";
import { getOaStatusLabel, type UnpaywallResult } from "@/lib/unpaywall-shared";
import type { ArticleBreakdown as ArticleBreakdownData } from "@/lib/article-breakdown-shared";
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
export function ArticleReadingPane({
  article,
  related,
  unpaywallResult,
  hasResearchAccess,
  breakdown,
  hasBreakdown,
}: {
  article: DecoratedArticle;
  related: DecoratedArticle[];
  unpaywallResult: UnpaywallResult | null;
  hasResearchAccess: boolean;
  breakdown: ArticleBreakdownData | null;
  hasBreakdown: boolean;
}) {
  const evidenceMeta = article.evidenceLevel ? EVIDENCE_LEVEL_META[article.evidenceLevel] : null;

  return (
    <div className="article-reading-card">
      <BackButton />

      <div style={{ marginTop: 14 }}>
        {evidenceMeta && article.evidenceLevel && (
          <>
            <EvidenceBadge level={article.evidenceLevel} size="xl" />
            {unpaywallResult?.isOpenAccess && (
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
                  marginLeft: "8px",
                  verticalAlign: "middle",
                }}
              >
                Open Access
              </span>
            )}
            {evidenceMeta.description && <p className="article-evidence-caption">{evidenceMeta.description}</p>}
          </>
        )}

        <div className="article-breadcrumb">
          {article.typeLabel} · {article.specialtyLabel}
        </div>

        <h1 className="article-hero-title">{article.title}</h1>

        <div className="article-hero-journal">{article.source}</div>
        {/* Year included here, unlike the feed cards — see formatDateWithYear in lib/meta.ts.
            The read-time that used to follow it is dropped: every Article estimates readMins
            from `summary`, and no source produces one long enough for the estimate to mean
            anything — PubMed clips it to 320 chars and the AOPT guidelines carry a one-line
            blurb, so `Math.round(words / 200)` rounds to zero and estimateReadMins returns
            its floor of 2 for all of them alike. It was a constant wearing a number's
            clothes, and since the breakdown replaced the abstract it was also measuring text
            this page no longer shows. Feed cards still render it (ArticleCard, RowCards),
            where it's equally meaningless and equally worth removing — left alone here only
            to keep this change to the page it's about. Wellness articles are unaffected
            either way: their readMins is hand-set, and they render from their own page. */}
        <div className="article-hero-datemeta">{article.dateLabelWithYear}</div>
      </div>

      <hr className="article-hero-divider" />

      {/* A research article's body is its breakdown — the abstract itself is deliberately
          not rendered here or anywhere else on the page (see lib/article-breakdown.ts).
          Authored seed articles still render their own paragraphs below, unchanged. */}
      <div className="article-prose">
        {hasBreakdown ? (
          <ArticleBreakdown articleId={article.id} initial={breakdown} />
        ) : article.body && article.body.length > 0 ? (
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
          {unpaywallResult?.isOpenAccess && unpaywallResult.bestOaLocation ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={unpaywallResult.bestOaLocation.urlForPdf ?? unpaywallResult.bestOaLocation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary article-actions-primary"
                style={{ background: "#16a34a" }}
              >
                {unpaywallResult.bestOaLocation.urlForPdf ? "Download Free PDF" : "Read Free Full Text"} —{" "}
                {getOaStatusLabel(unpaywallResult.oaStatus)}
              </a>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary article-actions-primary"
              >
                View on publisher site →
              </a>
              <p style={{ fontSize: "11px", color: "var(--color-neutral-700)", textAlign: "center", margin: 0 }}>
                Free version provided by Unpaywall — legal open access
              </p>
            </div>
          ) : unpaywallResult?.oaStatus === "bronze" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary article-actions-primary"
              >
                Read Free at Publisher →
              </a>
              <p style={{ fontSize: "11px", color: "var(--color-neutral-700)", textAlign: "center", margin: 0 }}>
                This article is free to read on the publisher site
              </p>
            </div>
          ) : (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary article-actions-primary"
            >
              Read the full story at {article.source} →
            </a>
          )}
          <div className="article-actions-secondary">
            <SaveButton articleId={article.id} saved={article.saved} article={article} label="Save Article" />
            <ShareButton />
          </div>
        </div>
      )}

      {hasResearchAccess && (article.doi || article.sourceUrl) && (
        <ArticleResearchPanel
          articleId={article.id}
          articleDoi={article.doi ?? null}
          articleSourceUrl={article.sourceUrl ?? null}
          articleTitle={article.title}
          articleSummary={article.summary}
        />
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
