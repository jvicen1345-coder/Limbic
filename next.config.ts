import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Nexus photo posts submit client-compressed images as data URLs in the server action
    // body (see lib/media-upload.ts) — the default 1mb limit isn't enough for a few photos.
    serverActions: { bodySizeLimit: "10mb" },
  },
  // The shoulder guide is a committed HTML file read at runtime by
  // app/(app)/student/guides/shoulder-examination/route.ts. Nothing imports it, so the
  // tracer cannot see it and would leave it out of the serverless bundle.
  outputFileTracingIncludes: {
    "/student/guides/shoulder-examination": ["content/playbooks/*.html"],
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
