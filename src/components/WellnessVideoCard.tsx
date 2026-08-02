"use client";

import { markWellnessOpenedAction } from "@/app/actions/wellness";
import { youtubeThumbnailUrl } from "@/lib/meta";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { WellnessSaveButton } from "@/components/WellnessSaveButton";
import type { WellnessVideo } from "@/lib/types";

/** Fires markWellnessOpenedAction on click, fire-and-forget — same reasoning as the
 *  external-link branch of components/RowCards.tsx WellnessListItem, since a video always
 *  opens on YouTube rather than a page of ours. */
export function WellnessVideoCard({ video, saved }: { video: WellnessVideo; saved: boolean }) {
  return (
    <div className="card elev-sm" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "none", display: "block" }}
        onClick={() => markWellnessOpenedAction(video.id)}
      >
        <VideoThumbnail src={youtubeThumbnailUrl(video.url)} />
        <div style={{ padding: "12px 14px" }}>
          <div className="card-title" style={{ fontSize: 14.5, margin: "0 0 4px" }}>
            {video.title}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-neutral-700)" }}>
            {video.source}
            {video.duration ? ` · ${video.duration}` : ""}
          </div>
        </div>
      </a>
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <WellnessSaveButton
          itemId={video.id}
          kind="video"
          saved={saved}
          size="sm"
          snapshot={{ title: video.title, source: video.source, sourceUrl: video.url, duration: video.duration }}
        />
      </div>
    </div>
  );
}
