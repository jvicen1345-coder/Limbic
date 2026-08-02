"use client";

import { useRouter } from "next/navigation";
import { SaveButton } from "@/components/SaveButton";
import { ArticleImage } from "@/components/ArticleImage";
import { CheckIcon } from "@/components/icons";
import type { DecoratedArticle } from "@/lib/feed";

export function ArticleCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      className="card elev-sm"
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
        <span>
          {article.source} · {article.readMins} min
        </span>
      </div>
    </div>
  );
}

export function HeroArticleCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      className="card elev-md"
      style={{ cursor: "pointer", padding: 26, background: "var(--color-accent-300)" }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      {article.image && <ArticleImage key={article.id} src={article.image} height={200} />}
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
        <span>
          {article.source} · {article.readMins} min
        </span>
      </div>
    </div>
  );
}

function NewBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-accent-700)", fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--color-accent)" }} />
      New
    </span>
  );
}

/** A quiet, neutral marker (unlike NewBadge's accent color, which calls attention to
 *  something worth noticing) — this is just a "you've already been here" note, not
 *  something the reader needs to act on. */
function ReadBadge() {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--color-neutral-700)" }}
      aria-label="Already read"
      title="You've already read this"
    >
      <CheckIcon size={11} />
      Read
    </span>
  );
}
