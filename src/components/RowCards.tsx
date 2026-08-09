"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { SaveButton } from "@/components/SaveButton";
import { WellnessSaveButton } from "@/components/WellnessSaveButton";
import { markWellnessOpenedAction } from "@/app/actions/wellness";
import { CheckIcon } from "@/components/icons";
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
      <SaveButton articleId={article.id} saved article={article} />
    </div>
  );
}

/** Shared row for the News section (see app/(app)/news/page.tsx's APTA tab and
 *  app/(app)/news/general/page.tsx's General tab) — the APTA tab always passes its own
 *  fixed badge (matches the original AptaNewsRow's copy exactly, unchanged); the General
 *  tab leaves it unset, falling back to each article's own type tag/label (Guideline,
 *  Industry & Policy, Equipment, …) since that list mixes several types together. */
export function NewsRow({
  article,
  badgeLabel,
  badgeClassName,
}: {
  article: DecoratedArticle;
  badgeLabel?: string;
  badgeClassName?: string;
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
          <span className={badgeClassName ?? article.typeTagClass}>{badgeLabel ?? article.typeLabel}</span>
          <span style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
            {article.source} · {article.dateLabel}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.28 }}>{article.title}</div>
      </div>
      <SaveButton articleId={article.id} saved={article.saved} article={article} />
    </div>
  );
}

export function ReviewCard({ article }: { article: DecoratedArticle }) {
  const router = useRouter();
  return (
    <div
      className="card elev-sm card-hoverable"
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

export function WellnessListItem({
  w,
  saved = false,
  opened = false,
}: {
  w: WellnessArticle;
  saved?: boolean;
  /** True when this reader has already opened this article (see
   *  app/actions/wellness.ts markWellnessOpenedAction / app/(app)/wellness/[id]/page.tsx)
   *  — the same "already been here" tracking that drives the refresh rotation, reused here
   *  purely as a display marker. */
  opened?: boolean;
}) {
  // Live-sourced wellness articles always carry a sourceUrl and link straight out to the
  // real story; seed/fallback ones have no external story to link to, so they open our
  // own detail page (with authored body text) instead — every article gets a working link.
  // The external case fires markWellnessOpenedAction on click (fire-and-forget — it doesn't
  // block the new-tab navigation) since there's no page of ours involved to record it
  // server-side; the internal case is recorded by app/(app)/wellness/[id]/page.tsx instead.
  const titleNode = w.sourceUrl ? (
    <a
      href={w.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "inherit" }}
      onClick={() => markWellnessOpenedAction(w.id)}
    >
      {w.title}
    </a>
  ) : (
    <Link href={`/wellness/${w.id}`} style={{ color: "inherit" }}>
      {w.title}
    </Link>
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--color-neutral-200)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
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
          {opened && (
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--color-neutral-700)" }}
              aria-label="Already read"
              title="You've already read this"
            >
              <CheckIcon size={11} />
              Read
            </span>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, lineHeight: 1.28, marginBottom: 5 }}>
          {titleNode}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-700)", margin: 0 }}>{w.summary}</p>
      </div>
      <WellnessSaveButton
        itemId={w.id}
        kind="article"
        saved={saved}
        size="sm"
        snapshot={{
          title: w.title,
          source: w.source,
          sourceUrl: w.sourceUrl,
          date: w.date,
          readMins: w.readMins,
          summary: w.summary,
        }}
      />
    </div>
  );
}
