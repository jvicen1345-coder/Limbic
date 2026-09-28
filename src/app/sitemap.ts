import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { EVIDENCE_TOPICS } from "@/lib/evidence-topics";

const baseUrl = "https://limbic.center";

/** Limbic is mostly an authenticated product — every route under the (app) group redirects
 *  a signed-out visitor straight to /sign-in (see app/(app)/layout.tsx). This only lists
 *  the pages a signed-out visitor (and therefore a crawler) can actually reach and see real
 *  content on: the public marketing page at "/" (see components/LandingPage.tsx), sign-in,
 *  Founding Funders, and the three static legal pages. Listing anything under (app) would
 *  just point crawlers at login redirects.
 *
 *  The public evidence library (app/evidence) is the exception to "mostly authenticated":
 *  its hub, every condition page, and every study page that has a written summary are
 *  listed. Studies without a summary are left out — their pages are noindex until one
 *  exists (see app/evidence/[id]/page.tsx). */
export const revalidate = 86400;

const MAX_STUDY_URLS = 5000;

async function evidenceStudyUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await prisma.articleBreakdownCache.findMany({
      where: { articleId: { startsWith: "pubmed-" } },
      select: { articleId: true, generatedAt: true },
      orderBy: { generatedAt: "desc" },
      take: MAX_STUDY_URLS,
    });
    return rows.map((r) => ({
      url: `${baseUrl}/evidence/${r.articleId}`,
      lastModified: r.generatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // No database reachable (e.g. a build without one): list the static pages only.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studies = await evidenceStudyUrls();
  return [
    {
      url: `${baseUrl}/evidence`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...EVIDENCE_TOPICS.map((t) => ({
      url: `${baseUrl}/evidence/topics/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...studies,
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
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
