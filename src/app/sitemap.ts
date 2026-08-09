import type { MetadataRoute } from "next";

const baseUrl = "https://limbic.center";

/** Limbic is an authenticated product, not a content marketing site — every route under
 *  the (app) group redirects a signed-out visitor straight to /sign-in (see
 *  app/(app)/layout.tsx), and /founding-funders does the same (redirects to "/", which then
 *  redirects again). Listing those URLs here would just point crawlers at login redirects —
 *  this only includes pages a signed-out visitor (and therefore a crawler) can actually
 *  reach and see real content on. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
