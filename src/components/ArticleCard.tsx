"use client";

import { useRouter } from "next/navigation";
import { SaveButton } from "@/components/SaveButton";
import { ArticleImage } from "@/components/ArticleImage";
import { EvidenceBadge } from "@/components/EvidenceBadge";
import { CheckIcon, NetworkIcon, ChevronRightIcon } from "@/components/icons";
import type { DecoratedArticle } from "@/lib/feed";

/** A direct link into the article's real Threads web (see components/ThreadsWeb.tsx) —
 *  no preview of what it contains, since computing the full web for every card in a feed
 *  grid would mean a Nexus query and article-pool scan per card. */
function ThreadsTeaser({ articleId }: { articleId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="card-threads-teaser"
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/article/${articleId}?threads=1`);
      }}
    >
      <NetworkIcon size={12} />
      Explore Connections
      <ChevronRightIcon size={11} />
    </button>
  );
}

export function ArticleCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      className="card elev-sm card-hoverable"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      {article.image && <ArticleImage key={article.id} src={article.image} height={120} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {article.isNew && <NewBadge />}
          {article.isRead && <ReadBadge />}
          {article.typeLabel} · {article.dateLabel}
        </div>
        <SaveButton articleId={article.id} saved={article.saved} size="sm" article={article} />
      </div>
      <div className="card-title" style={{ marginTop: 6 }}>
        {article.title}
      </div>
      <p className="card-body">{article.summary}</p>
      <div className="card-meta">
        <span className={article.typeTagClass}>{article.specialtyLabel}</span>
        {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
        <span>
          {article.source} · {article.readMins} min
        </span>
      </div>
      <ThreadsTeaser articleId={article.id} />
    </div>
  );
}

/** The Home hero: HeroFeed only ever hands this an image-having article (see
 *  HomeFeed.tsx's heroPool, filtered off withImage) — the plain-layout fallback below is
 *  defensive for any future/other caller, not something a reader can hit today. When
 *  there's an image, title/source/evidence/read-time/date all sit on the photo itself
 *  (above a bottom gradient — see .hero-card-* in globals.css) and the space below the
 *  photo is kept to just the summary, so the card reads as one clean photo-led moment
 *  rather than a second copy of the same meta row ArticleCard already shows in the grid. */
export function HeroArticleCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();

  if (!article.image) {
    return (
      <div
        className="card elev-md card-hoverable"
        style={{ cursor: "pointer", padding: 26 }}
        onClick={() => router.push(`/article/${article.id}`)}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div className="card-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {article.isNew && <NewBadge />}
            {article.isRead && <ReadBadge />}
            {article.typeLabel} · {article.dateLabel}
          </div>
          <SaveButton articleId={article.id} saved={article.saved} size="md" article={article} />
        </div>
        <div className="card-title" style={{ marginTop: 8, fontSize: 22 }}>
          {article.title}
        </div>
        <p className="card-body" style={{ fontSize: 15 }}>
          {article.summary}
        </p>
        <div className="card-meta">
          <span className={article.typeTagClass}>{article.specialtyLabel}</span>
          {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
          <span>
            {article.source} · {article.readMins} min
          </span>
        </div>
        <ThreadsTeaser articleId={article.id} />
      </div>
    );
  }

  return (
    <div
      className="card elev-md card-hoverable"
      style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      <div className="hero-card-media">
        <ArticleImage key={article.id} src={article.image} fill />
        <div className="hero-card-gradient" />
        <div className="hero-card-topleft">
          {article.evidenceLevel && <EvidenceBadge level={article.evidenceLevel} size="sm" />}
        </div>
        <div className="hero-card-topright">
          <span className="hero-card-meta-pill">
            {article.dateLabel} · {article.readMins} min
          </span>
          <span className="hero-card-save-wrap" onClick={(e) => e.stopPropagation()}>
            <SaveButton articleId={article.id} saved={article.saved} size="md" article={article} />
          </span>
        </div>
        <div className="hero-card-bottom">
          <div className="hero-card-title">{article.title}</div>
          <div className="hero-card-source">
            {article.source}
            {(article.isNew || article.isRead) && <span className="hero-card-source-sep">·</span>}
            {article.isNew && <NewBadge onImage />}
            {article.isRead && <ReadBadge onImage />}
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 20px 18px" }}>
        <p className="card-body" style={{ fontSize: 15, margin: 0 }}>
          {article.summary}
        </p>
        <div style={{ marginTop: 8 }}>
          <ThreadsTeaser articleId={article.id} />
        </div>
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
