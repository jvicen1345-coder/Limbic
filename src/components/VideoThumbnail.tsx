"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";

const placeholderStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "16/9",
  background: "var(--color-surface)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-accent)",
};

/** Shows the video's real thumbnail when one loads; falls back to the plain play-icon
 *  placeholder on a failed fetch (hotlink protection, a since-removed video, no thumbnail
 *  URL at all) rather than a broken image — same pattern as RevolvingNews's ArticleImage. */
export function VideoThumbnail({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The browser can start (and fail) loading an SSR'd <img>'s src before React hydrates
  // and attaches onError — a fast failure (like an immediate proxy rejection) can finish
  // before that listener exists, so onError alone would silently miss it. This catches
  // that case on mount: if the image already finished with no actual pixels, treat it as
  // failed even though the "error" event itself was never observed.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) {
    return (
      <div style={placeholderStyle}>
        <PlayIcon size={32} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domain */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        onError={() => setFailed(true)}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) setFailed(true);
        }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "color-mix(in srgb, #14213d 28%, transparent)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "color-mix(in srgb, #ffffff 92%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-accent)",
          }}
        >
          <PlayIcon size={20} />
        </div>
      </div>
    </div>
  );
}
