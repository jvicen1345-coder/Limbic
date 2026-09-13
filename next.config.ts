import type { NextConfig } from "next";
import { IMAGE_REMOTE_PATTERNS } from "./src/lib/image-remote-hosts";

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
    // Closed allowlist of known CDNs (YouTube thumbs, Wikimedia Commons topic photos,
    // Pexels). Exact hostnames only — never `*` / `**` on hostname, which would reopen
    // the optimizer as an SSRF vector. ArticleImage still falls back to a raw <img> for
    // publisher og:images on hosts that are not in this list. HEP clinician-pasted
    // exercise URLs stay on raw <img> (see app/(app)/hep/page.tsx).
    remotePatterns: [...IMAGE_REMOTE_PATTERNS],
  },
};

export default nextConfig;
