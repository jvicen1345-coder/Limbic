import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getArticles, getArticleById } from "@/lib/articles";
import { decorateArticle } from "@/lib/feed";
import { recordArticleRead } from "@/lib/reading";
import { SaveButton } from "@/components/SaveButton";
import { BackButton } from "@/components/BackButton";
import { ReadingProgressTracker } from "@/components/ReadingProgressTracker";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const [raw, allArticles, savedRows] = await Promise.all([
    getArticleById(id),
    getArticles(),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
  ]);
  if (!raw) notFound();

  await recordArticleRead(user.id, raw.id);

  const savedIds = savedRows.map((r) => r.articleId);
  const article = decorateArticle(raw, savedIds);
  const related = allArticles
    .filter((a) => a.id !== raw.id && (a.type === raw.type || a.specialty === raw.specialty))
    .slice(0, 3)
    .map((a) => decorateArticle(a, savedIds));

  return (
    <div className="screen-pad">
      <ReadingProgressTracker articleId={article.id} />
      <BackButton />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className={article.typeTagClass}>{article.typeLabel}</span>
        <span className="tag tag-neutral">{article.specialtyLabel}</span>
      </div>
      <h1 style={{ fontSize: 27, margin: "0 0 10px", lineHeight: 1.18 }}>{article.title}</h1>
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
