"use client";

import { useState } from "react";
import { FilmIcon } from "@/components/icons";
import { getPathologyVideoAction } from "@/app/actions/pathologies";
import type { PathologyVideo as PathologyVideoResult } from "@/lib/pathology-videos";

type VideoLoadState = "idle" | "loading" | "loaded" | "not-found";

/** Explanation video for one Common Pathologies card — deliberately not prefetched for the
 *  whole list on page load, only searched on request (see getPathologyVideoAction), same
 *  "don't burn the free search quota on cards a reader never opens" reasoning as Special
 *  Tests Library's VideoDemonstration (components/pro/SpecialTestsLibrary.tsx), which this
 *  mirrors. A real search result, not a hardcoded video id — see lib/pathology-videos.ts. */
export function PathologyVideo({ slug, name }: { slug: string; name: string }) {
  const [state, setState] = useState<VideoLoadState>("idle");
  const [video, setVideo] = useState<PathologyVideoResult | null>(null);

  const handleLoad = async () => {
    setState("loading");
    const result = await getPathologyVideoAction(slug);
    if (!result) {
      setState("not-found");
      return;
    }
    setVideo(result);
    setState("loaded");
  };

  if (state === "idle") {
    return (
      <button type="button" className="btn btn-secondary" style={{ marginTop: 6 }} onClick={handleLoad}>
        <FilmIcon size={14} />
        Watch explanation video
      </button>
    );
  }

  if (state === "loading") {
    return <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 6 }}>Searching for a video…</p>;
  }

  if (state === "not-found") {
    return <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 6 }}>No explanation video available for {name} right now.</p>;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <iframe
          src={`https://www.youtube.com/embed/${video!.videoId}`}
          title={video!.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "6px 0 0" }}>
        {video!.title} — {video!.channelTitle}
      </p>
    </div>
  );
}
