import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Nexus photo posts submit client-compressed images as data URLs in the server action
    // body (see lib/media-upload.ts) — the default 1mb limit isn't enough for a few photos.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
