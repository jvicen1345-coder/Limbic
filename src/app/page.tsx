import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LandingPage } from "@/components/LandingPage";

// "Limbic Center" throughout this file (title, openGraph, structured data), not just
// "Limbic" — the trailing "Center" is what actually shows up in Google's search result
// title/site-name chip once re-crawled, which is the whole point: a plain "Limbic" search
// result was indistinguishable from any other product/company using that name.
const DESCRIPTION =
  "The research, the profession, and the public. Finally in one place. Limbic Center is built for PT students, clinicians, and the people they serve.";

export const metadata: Metadata = {
  // No `title` of its own — falls back to the root layout's `title.default` ("Limbic
  // Center | The Physical Therapy Platform" — see app/layout.tsx), which says the same
  // thing this used to say directly (kept "Limbic Center," not just "Limbic," for the same
  // Google-branding reason described above). openGraph.title below is untouched — that's a
  // separate metadata channel `title.template` never applies to.
  description: DESCRIPTION,
  openGraph: {
    title: "Limbic Center — The Physical Therapy Platform",
    description: "One platform. Every PT professional. Their entire career.",
    url: "https://limbic.center",
    siteName: "Limbic Center",
  },
};

// Organization + WebSite structured data (schema.org, via JSON-LD) — the main lever
// available to steer how Google treats a plain brand-name search ("Limbic"): an unambiguous
// machine-readable name/url/logo/description gives Google a high-confidence source to draw
// on instead of improvising a title/snippet from whatever page text happens to rank highest
// (see /founding-funders' own metadata export for the other half of that fix — it had no
// metadata at all before, so Google was pulling its title and description straight from
// Jonathan's letter on the page). `logo` deliberately points at the PNG (public/logo-icon.png),
// not icon.svg — Google's own structured-data guidelines don't support SVG for this field.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://limbic.center/#organization",
      name: "Limbic Center",
      url: "https://limbic.center",
      logo: "https://limbic.center/logo-icon.png",
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": "https://limbic.center/#website",
      name: "Limbic Center",
      url: "https://limbic.center",
      publisher: { "@id": "https://limbic.center/#organization" },
      description: DESCRIPTION,
    },
  ],
};

/** The public root — deliberately outside the (app) route group, so it renders with no
 *  session, no AppShell/sidebar, and no auth-gated data fetch (see app/(app)/layout.tsx,
 *  which is what every other route in this app sits under). A signed-in visitor never sees
 *  this: they're sent straight to /home, which is where the authenticated Home feed lives
 *  now (moved from "/" to make room for this page — see components/AppShell.tsx and every
 *  post-sign-in redirect for the other half of that move). */
export default async function RootPage() {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      <LandingPage />
    </>
  );
}
