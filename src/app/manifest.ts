import type { MetadataRoute } from "next";

// Auto-served by Next at /manifest.webmanifest, with the <link rel="manifest"> tag wired up
// automatically — same file-convention pattern as icon.svg/apple-icon.png elsewhere in this
// directory. display: "standalone" is what makes Android's "Install app" prompt (and a
// desktop Chrome/Edge install) open Limbic in its own chromeless window instead of just
// bookmarking a browser tab — see components/GetTheAppCard.tsx for the reader-facing
// instructions this supports.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Limbic, PT News",
    short_name: "Limbic",
    description: "Up-to-date news, guidelines, and clinical tools for physical therapists.",
    start_url: "/",
    display: "standalone",
    background_color: "#092744",
    theme_color: "#092744",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
