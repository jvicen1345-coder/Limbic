import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Nexus photo posts submit client-compressed images as data URLs in the server action
    // body (see lib/media-upload.ts) — the default 1mb limit isn't enough for a few photos.
    serverActions: { bodySizeLimit: "10mb" },
  },
  // The guides are committed HTML files read at runtime by the route handlers under
  // app/(app)/student/guides. Nothing imports them, so the tracer cannot see them and would
  // leave them out of the serverless bundle — which fails in production and never locally.
  outputFileTracingIncludes: {
    "/student/guides/shoulder-examination": ["content/playbooks/*.html"],
    "/student/guides/[guide]": ["content/playbooks/*.html"],
  },
  images: {
    // Only YouTube's own thumbnail CDN — a single fixed, known hostname (see
    // lib/meta.ts youtubeThumbnailUrl), safe to optimize via next/image. Article/exercise
    // images (ArticleImage.tsx, app/(app)/hep/page.tsx) come from arbitrary publisher/
    // clinician-pasted URLs with no fixed set of hostnames, so they deliberately stay plain
    // <img> tags rather than widening this to a wildcard pattern that would reopen next/image's
    // optimizer as an SSRF vector for any URL a caller feeds it.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
