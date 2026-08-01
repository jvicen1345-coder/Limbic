import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getWellnessArticleById } from "@/lib/articles";
import { formatDate } from "@/lib/meta";
import { BackButton } from "@/components/BackButton";

export default async function WellnessArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const article = await getWellnessArticleById(id);
  if (!article) notFound();

  return (
    <div className="screen-pad">
      <BackButton />
      <h1 style={{ fontSize: 27, margin: "0 0 10px", lineHeight: 1.18 }}>{article.title}</h1>
      <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 22 }}>
        {article.source} · {formatDate(article.date)} · {article.readMins} min read
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.5, color: "var(--color-text)", fontWeight: 600, margin: "0 0 18px" }}>
        {article.summary}
      </p>

      {article.body?.map((para, i) => (
        <p key={i} style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text)", margin: "0 0 14px" }}>
          {para}
        </p>
      ))}

      {article.tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 0" }}>
          {article.tags.map((tag) => (
            <span key={tag} className="tag tag-outline">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
