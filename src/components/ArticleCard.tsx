"use client";

import Link from "next/link";
import { SaveButton } from "@/components/SaveButton";
import { ArticleImage } from "@/components/ArticleImage";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { OpenAccessPill } from "@/components/OpenAccessPill";
import { CheckIcon } from "@/components/icons";
import type { DecoratedArticle } from "@/lib/feed";

/** Every source already tags an article with its specialty and type label as the first two
 *  entries (see lib/pubmed.ts, lib/news-live.ts) — both already shown elsewhere on the card
 *  (the specialty pill, the type in the kicker), so showing them again here would just be
 *  noise. What's left after excluding those is the genuinely new context: the specific
 *  matched keywords (e.g. "ACL", "Medicare", "FDA Clearance") that classify() found. Capped
 *  at 2 so a keyword-heavy article doesn't overrun the card. */
function extraContextTags(article: DecoratedArticle): string[] {
  const shown = new Set([article.specialtyLabel, article.typeLabel]);
  return article.tags.filter((t) => !shown.has(t)).slice(0, 2);
}

/**
 * Feed card. The title is a real <Link> (keyboard-reachable) stretched across the card so
 * Home can SSR card HTML without useRouter; SaveButton / OpenAccessPill sit above the
 * stretch. Remains a Client Component because SearchScreen imports it directly.
 */
export function ArticleCard({ article }: { article: DecoratedArticle }) {
  const extraTags = extraContextTags(article);
  const href = `/article/${article.id}`;
  return (
    <div className="card elev-sm card-hoverable article-card">
      {article.image && <ArticleImage key={article.id} src={article.image} height={120} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {article.isNew && <NewBadge />}
          {article.isRead && <ReadBadge />}
          {article.typeLabel} · {article.dateLabel}
        </div>
        <span className="article-card__interactive">
          <SaveButton articleId={article.id} saved={article.saved} size="sm" article={article} />
        </span>
      </div>
      <Link href={href} className="card-title article-card__title" style={{ marginTop: 6 }}>
        {article.title}
      </Link>
      <p className="card-body">{article.summary}</p>
      <div className="card-meta">
        <span className={article.typeTagClass}>{article.specialtyLabel}</span>
        {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
        <span className="article-card__interactive">
          <OpenAccessPill doi={article.doi} />
        </span>
        <span>{article.source}</span>
      </div>
      {extraTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {extraTags.map((t) => (
            <span key={t} className="tag tag-outline" style={{ fontSize: "var(--fs-10-5)" }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** The Home hero: HeroFeed only ever hands this an image-having article (see
 *  HomeFeed's heroPool). When there's an image, title/source/evidence sit on the photo
 *  itself; the space below stays to the summary. */
export function HeroArticleCard({ article }: { article: DecoratedArticle }) {
  const href = `/article/${article.id}`;
  if (!article.image) {
    return (
      <div className="card elev-md card-hoverable article-card" style={{ padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div className="card-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {article.isNew && <NewBadge />}
            {article.isRead && <ReadBadge />}
            {article.typeLabel} · {article.dateLabel}
          </div>
          <span className="article-card__interactive">
            <SaveButton articleId={article.id} saved={article.saved} size="md" article={article} />
          </span>
        </div>
        <Link href={href} className="card-title article-card__title" style={{ marginTop: 8, fontSize: 22 }}>
          {article.title}
        </Link>
        <p className="card-body" style={{ fontSize: 15 }}>
          {article.summary}
        </p>
        <div className="card-meta">
          <span className={article.typeTagClass}>{article.specialtyLabel}</span>
          {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
          <span>{article.source}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card elev-md card-hoverable article-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="hero-card-media">
        <ArticleImage key={article.id} src={article.image} fill />
        <div className="hero-card-topleft">
          <span className={article.typeTagClass}>{article.specialtyLabel}</span>
          {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
          <span className="article-card__interactive">
            <OpenAccessPill doi={article.doi} />
          </span>
        </div>
        <div className="hero-card-topright">
          <span className="hero-card-meta-pill">{article.dateLabel}</span>
          <span className="hero-card-save-wrap article-card__interactive">
            <SaveButton articleId={article.id} saved={article.saved} size="md" article={article} />
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
        <Link href={href} className="hero-card-title article-card__title">
          {article.title}
        </Link>
        <div className="hero-card-source" style={{ justifyContent: "center" }}>
          {article.source}
          {(article.isNew || article.isRead) && <span className="hero-card-source-sep">·</span>}
          {article.isNew && <NewBadge />}
          {article.isRead && <ReadBadge />}
        </div>
      </div>
      <div style={{ padding: "10px 20px 18px", textAlign: "center" }}>
        <p className="card-body" style={{ fontSize: 15, margin: "0 auto" }}>
          {article.summary}
        </p>
      </div>
    </div>
  );
}

/** `onImage`: swaps the accent-blue text (tuned for a light card background) for plain
 *  white — used only by HeroArticleCard's on-photo treatment above, where the badge sits
 *  directly on top of the article image rather than the card's own surface color. */
function NewBadge({ onImage = false }: { onImage?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        color: onImage ? "#fff" : "var(--color-accent-700)",
        fontWeight: 700,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: onImage ? "#fff" : "var(--color-accent)" }} />
      New
    </span>
  );
}

/** A quiet, neutral marker (unlike NewBadge's accent color, which calls attention to
 *  something worth noticing) — this is just a "you've already been here" note, not
 *  something the reader needs to act on. See NewBadge above for what `onImage` does. */
function ReadBadge({ onImage = false }: { onImage?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        color: onImage ? "rgba(255,255,255,0.85)" : "var(--color-neutral-700)",
      }}
      aria-label="Already read"
      title="You've already read this"
    >
      <CheckIcon size={11} />
      Read
    </span>
  );
}
