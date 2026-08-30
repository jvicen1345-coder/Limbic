import type { MetadataRoute } from "next";

const baseUrl = "https://limbic.center";

/** Limbic is mostly an authenticated product — every route under the (app) group redirects
 *  a signed-out visitor straight to /sign-in (see app/(app)/layout.tsx). This only lists
 *  the pages a signed-out visitor (and therefore a crawler) can actually reach and see real
 *  content on: the public marketing page at "/" (see components/LandingPage.tsx), sign-in,
 *  Founding Funders, and the two static legal pages. Listing anything under (app) would
 *  just point crawlers at login redirects. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/founding-funders`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
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
