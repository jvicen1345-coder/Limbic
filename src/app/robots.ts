import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/sign-in", "/terms", "/privacy", "/founding-funders"],
      disallow: ["/"],
    },
    sitemap: "https://limbic.center/sitemap.xml",
  };
}
