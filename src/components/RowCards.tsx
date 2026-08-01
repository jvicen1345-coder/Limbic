"use client";

import { useRouter } from "next/navigation";
import { SaveButton } from "@/components/SaveButton";
import type { DecoratedArticle } from "@/lib/feed";
import type { WellnessArticle } from "@/lib/types";
import { formatDate } from "@/lib/meta";

export function SavedListRow({
  article,
  badge,
}: {
  article: DecoratedArticle;
  badge: "type" | "specialty";
}) {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--color-neutral-200)",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <span className={article.typeTagClass}>
            {badge === "type" ? article.typeLabel : article.specialtyLabel}
          </span>
          <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{article.dateLabel}</span>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.28 }}>{article.title}</div>
      </div>
      <SaveButton articleId={article.id} saved />
    </div>
  );
}

export function AptaNewsRow({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--color-neutral-200)",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <span className="tag tag-accent">APTA News</span>
          <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
            {article.source} · {article.dateLabel}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.28 }}>{article.title}</div>
      </div>
      <SaveButton articleId={article.id} saved={article.saved} />
    </div>
  );
}

export function ReviewCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      className="card elev-sm"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/article/${article.id}`)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span className="tag tag-neutral">{article.reviewStatus || "Under review"}</span>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{article.dateLabel}</span>
      </div>
      <div className="card-title" style={{ marginTop: 6 }}>
        {article.title}
      </div>
      <p className="card-body" style={{ fontStyle: "italic" }}>
        {article.underReview}
      </p>
    </div>
  );
}

export function WellnessListItem({ w }: { w: WellnessArticle }) {
  const titleNode = w.sourceUrl ? (
    <a href={w.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
      {w.title}
    </a>
  ) : (
    w.title
  );
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid var(--color-neutral-200)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{w.source}</span>
        <span
          style={{
            width: 3,
            height: 3,
            borderRadius: 999,
            background: "var(--color-neutral-700)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{formatDate(w.date)}</span>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.28, marginBottom: 5 }}>
        {titleNode}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-700)", margin: 0 }}>{w.summary}</p>
    </div>
  );
}
