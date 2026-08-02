"use client";

import { useState } from "react";

/** A real og:image can still fail to load client-side (hotlink protection, a since-
 *  removed asset, …). Keyed by the caller off article id so switching articles remounts
 *  this and naturally resets `failed`, instead of tracking that reset with an effect. */
export function ArticleImage({ src, height = 90 }: { src: string; height?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domains
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        borderRadius: "var(--radius-md)",
        marginBottom: 8,
        display: "block",
      }}
    />
  );
}
