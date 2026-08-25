"use client";

import { useState } from "react";

/** A real og:image can still fail to load client-side (hotlink protection, a since-
 *  removed asset, …). Keyed by the caller off article id so switching articles remounts
 *  this and naturally resets `failed`, instead of tracking that reset with an effect.
 *
 *  `fill`: absolutely fills a `position: relative` ancestor instead of the default fixed-
 *  height block — for HeroArticleCard's photo-background treatment (see
 *  .hero-card-media in globals.css), which needs the image to sit *behind* an overlay
 *  gradient and text rather than stack above them. Presentational only — the onError
 *  fallback behavior above is identical either way. */
export function ArticleImage({ src, height = 90, fill = false }: { src: string; height?: number; fill?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unconfigured domains
    <img
      src={src}
      alt=""
      // Hero cards render above the fold, so they load eager (the default) — everything
      // else is a list-card thumbnail further down the feed, worth deferring since these
      // come from arbitrary publisher domains next/image can't optimize (see the
      // eslint-disable above) and a feed can have dozens on one page.
      loading={fill ? undefined : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }
          : {
              width: "100%",
              height,
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "var(--radius-md)",
              display: "block",
            }
      }
    />
  );
}
