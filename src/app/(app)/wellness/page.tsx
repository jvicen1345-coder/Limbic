import { getWellnessArticles, WELLNESS_VIDEOS } from "@/lib/articles";
import { WellnessListItem } from "@/components/RowCards";
import { PlayIcon } from "@/components/icons";

export default async function WellnessPage() {
  const wellnessArticles = await getWellnessArticles();

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Health & Wellness</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 22px" }}>
        Everyday wellness reading and movement videos for patients and clinicians alike.
      </p>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
        Articles
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
        {wellnessArticles.map((w) => (
          <WellnessListItem key={w.id} w={w} />
        ))}
      </div>

      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-700)", marginBottom: 10 }}>
        Video recommendations
      </div>
      <div className="video-grid">
        {WELLNESS_VIDEOS.map((v) => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card elev-sm"
            style={{ padding: 0, overflow: "hidden", color: "inherit", textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <PlayIcon size={32} />
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div className="card-title" style={{ fontSize: 14.5, margin: "0 0 4px" }}>
                {v.title}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>
                {v.source}
                {v.duration ? ` · ${v.duration}` : ""}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
