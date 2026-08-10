import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/profile/",
        "/nexus/messages",
        "/nexus/connections",
        "/calendar",
        "/wellness/metrics",
        "/wellness/assess",
        "/saved/",
        "/student/",
        "/boards/",
      ],
    },
    sitemap: "https://limbic.center/sitemap.xml",
  };
}
