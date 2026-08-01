"use client";

import { useEffect, useRef, useState } from "react";
import { SaveButton } from "@/components/SaveButton";
import { VolumeIcon, VolumeMuteIcon, ExternalLinkIcon } from "@/components/icons";
import { SPECIALTY_META, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/meta";
import type { Clip } from "@/lib/types";

/** Clip ids are saved under a "clip-" prefixed key in the same SavedArticle table as
 *  everything else — cheap, and lays the groundwork for a future "Saved Clips" view. */
function savedKey(clip: Clip): string {
  return `clip-${clip.id}`;
}

function ClipSlide({
  clip,
  active,
  muted,
  onToggleMute,
  saved,
}: {
  clip: Clip;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
  saved: boolean;
}) {
  const embedUrl = active ? youtubeEmbedUrl(clip.url, { autoplay: true, muted }) : null;
  const thumbUrl = youtubeThumbnailUrl(clip.url);

  return (
    <section className="clip-slide" data-clip-id={clip.id}>
      <div className="clip-media" onClick={onToggleMute}>
        {embedUrl ? (
          <iframe
            key={`${clip.id}-${muted}`}
            src={embedUrl}
            title={clip.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domain
          <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#000" }} />
        )}
      </div>

      <div className="clip-overlay">
        <div className="clip-info">
          <span className="tag tag-accent-2" style={{ marginBottom: 8 }}>
            {SPECIALTY_META[clip.specialty]}
          </span>
          <div className="clip-title">{clip.title}</div>
          <div className="clip-source">{clip.source}</div>
        </div>

        <div className="clip-actions">
          <button type="button" className="clip-action-btn" onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeMuteIcon size={20} /> : <VolumeIcon size={20} />}
          </button>
          <div className="clip-action-btn" style={{ padding: 0 }}>
            <SaveButton articleId={savedKey(clip)} saved={saved} />
          </div>
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="clip-action-btn"
            aria-label="Open in YouTube"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function ClipsFeed({ clips, savedIds }: { clips: Clip[]; savedIds: string[] }) {
  const [activeId, setActiveId] = useState<string | null>(clips[0]?.id ?? null);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) {
          setActiveId(mostVisible.target.getAttribute("data-clip-id"));
        }
      },
      { root: container, threshold: [0.6] }
    );

    const slides = container.querySelectorAll("[data-clip-id]");
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [clips]);

  return (
    <div className="clips-feed" ref={containerRef}>
      {clips.map((clip) => (
        <ClipSlide
          key={clip.id}
          clip={clip}
          active={clip.id === activeId}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          saved={savedIds.includes(savedKey(clip))}
        />
      ))}
    </div>
  );
}
