import type { MetadataRoute } from "next";

/** Almost the entire app lives behind sign-in (app/(app)/layout.tsx redirects every signed-
 *  out visitor to /sign-in), so this disallows everything by default and allow-lists only
 *  the handful of pages a signed-out visitor can actually see — the sign-in screen and the
 *  two static legal pages. Safer than an allow-everything-except-a-list approach, which
 *  would silently under-block every gated route added under (app) after this file was
 *  written (Wellness, Boards, Games, Nexus, and whatever comes next). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
      allow: ["/sign-in", "/terms", "/privacy"],
    },
    sitemap: "https://limbic.center/sitemap.xml",
  };
}
