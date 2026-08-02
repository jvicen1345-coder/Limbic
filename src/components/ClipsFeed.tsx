"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SaveButton } from "@/components/SaveButton";
import { VolumeIcon, VolumeMuteIcon, ExternalLinkIcon } from "@/components/icons";
import { SPECIALTY_META, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/meta";
import type { Clip } from "@/lib/types";

/** Clip ids are saved under a "clip-" prefixed key in the same SavedArticle table as
 *  everything else — cheap, and lays the groundwork for a future "Saved Clips" view. */
function savedKey(clip: Clip): string {
  return `clip-${clip.id}`;
}

// The curated clip list is small and finite, so a continuous ("for you"-style) feed loops
// it rather than dead-ending — each time the reader scrolls within this many slides of the
// end, another lap of the same clips is appended, same content each time around.
const APPEND_WHEN_WITHIN = 2;

interface ClipSlot {
  clip: Clip;
  /** Unique per physical slide (clip id + lap number) — the clip can repeat across laps,
   *  but each rendered slide still needs an identity of its own for the intersection
   *  observer and autoplay targeting. */
  slotId: string;
}

function ClipSlide({
  clip,
  slotId,
  active,
  muted,
  onToggleMute,
  saved,
}: {
  clip: Clip;
  slotId: string;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
  saved: boolean;
}) {
  const embedUrl = active ? youtubeEmbedUrl(clip.url, { autoplay: true, muted }) : null;
  const thumbUrl = youtubeThumbnailUrl(clip.url);

  return (
    <section className="clip-slide" data-slot-id={slotId}>
      <div className="clip-media" onClick={onToggleMute}>
        {embedUrl ? (
          <iframe
            key={`${slotId}-${muted}`}
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
  const [laps, setLaps] = useState(1);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(clips[0] ? `${clips[0].id}__0` : null);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const slots = useMemo(() => {
    const out: ClipSlot[] = [];
    for (let lap = 0; lap < laps; lap++) {
      for (const clip of clips) out.push({ clip, slotId: `${clip.id}__${lap}` });
    }
    return out;
  }, [clips, laps]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || slots.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;
        const slotId = mostVisible.target.getAttribute("data-slot-id");
        if (!slotId) return;
        setActiveSlotId(slotId);

        const index = slots.findIndex((s) => s.slotId === slotId);
        if (index !== -1 && index >= slots.length - APPEND_WHEN_WITHIN) {
          setLaps((l) => l + 1);
        }
      },
      { root: container, threshold: [0.6] }
    );

    const slides = container.querySelectorAll("[data-slot-id]");
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [slots]);

  return (
    <div className="clips-feed" ref={containerRef}>
      {slots.map((slot) => (
        <ClipSlide
          key={slot.slotId}
          clip={slot.clip}
          slotId={slot.slotId}
          active={slot.slotId === activeSlotId}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          saved={savedIds.includes(savedKey(slot.clip))}
        />
      ))}
    </div>
  );
}
