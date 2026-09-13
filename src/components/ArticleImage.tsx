"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { isOptimizableImageSrc } from "@/lib/image-remote-hosts";

const COVER: CSSProperties = {
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

/**
 * Feed / reading-pane photo. Allowlisted CDN hosts and same-origin rasters use next/image
 * (srcset + the optimizer). Publisher og:images on unknown hosts stay on a raw <img> so a
 * closed remotePatterns list cannot 400 the card empty. `priority` maps to Next 16 `preload`
 * and is reserved for the Home hero LCP image.
 *
 * `fill`: absolutely fills a `position: relative` ancestor — HeroArticleCard's
 * `.hero-card-media` photo-background and related-article thumbs. Presentational only;
 * onError fallback is identical either way.
 */
export function ArticleImage({
  src,
  height = 90,
  fill = false,
  priority = false,
  sizes,
}: {
  src: string;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const resolvedSizes =
    sizes ?? (fill ? "(max-width: 799px) 100vw, 900px" : "(max-width: 799px) 100vw, 440px");
  const onError = () => setFailed(true);

  if (isOptimizableImageSrc(src)) {
    if (fill) {
      return (
        <Image
          src={src}
          alt=""
          fill
          sizes={resolvedSizes}
          preload={priority}
          style={COVER}
          onError={onError}
        />
      );
    }
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={resolvedSizes}
          preload={priority}
          style={COVER}
          onError={onError}
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- unconfigured publisher hosts; optimizer would 400
    <img
      src={src}
      alt=""
      loading={priority || fill ? undefined : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={onError}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...COVER,
            }
          : {
              width: "100%",
              height,
              borderRadius: "var(--radius-md)",
              ...COVER,
            }
      }
    />
  );
}
