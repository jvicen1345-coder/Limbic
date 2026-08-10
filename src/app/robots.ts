import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // "/$" (not "/") — robots.txt matching is prefix-based, so a bare "/" is a prefix of
      // every URL on the site and would allow everything, undoing disallow: ["/"] below.
      // The "$" end-anchor limits this to the exact root path — the new public landing page
      // — while every other route still falls through to the default-deny.
      allow: ["/$", "/sign-in", "/terms", "/privacy", "/founding-funders"],
      disallow: ["/"],
    },
    sitemap: "https://limbic.center/sitemap.xml",
  };
}
