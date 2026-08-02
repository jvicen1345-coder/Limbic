"use client";

import { youtubeThumbnailUrl } from "@/lib/meta";
import { SPECIALTY_META } from "@/lib/meta";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { ClipSaveButton } from "@/components/ClipSaveButton";
import type { Clip } from "@/lib/types";

/** A grid card for a saved clip on /saved/clips — the full vertical swipe feed
 *  (components/ClipsFeed.tsx) doesn't fit a "list of saved items" view, so this reuses the
 *  same thumbnail-card shape as components/WellnessVideoCard.tsx instead. */
export function SavedClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="card elev-sm" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <a href={clip.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", display: "block" }}>
        <VideoThumbnail src={youtubeThumbnailUrl(clip.url)} />
        <div style={{ padding: "12px 14px" }}>
          <span className="tag tag-accent-2" style={{ marginBottom: 6 }}>
            {SPECIALTY_META[clip.specialty]}
          </span>
          <div className="card-title" style={{ fontSize: 14.5, margin: "6px 0 4px" }}>
            {clip.title}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>{clip.source}</div>
        </div>
      </a>
      <div style={{ position: "absolute", top: 8, right: 8, background: "var(--color-surface)", borderRadius: "50%" }}>
        <ClipSaveButton clip={clip} saved variant="ghost" />
      </div>
    </div>
  );
}
