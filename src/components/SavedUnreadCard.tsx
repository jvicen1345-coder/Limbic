import Link from "next/link";
import type { DecoratedArticle } from "@/lib/feed";

export function SavedUnreadCard({ articles }: { articles: DecoratedArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div className="card-kicker" style={{ marginBottom: 8 }}>
        Saved, still unread
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/article/${a.id}`}
            style={{
              display: "block",
              padding: "8px 10px",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-neutral-100)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: "var(--fs-10)", color: "var(--color-accent-700)", marginBottom: 3 }}>
              {a.typeLabel} · {a.dateLabel}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 12.5, lineHeight: 1.3 }}>{a.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
