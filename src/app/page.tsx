import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LandingPage } from "@/components/LandingPage";

const DESCRIPTION =
  "Limbic brings evidence-based physical therapy research, clinical tools, and a professional community into one place, built for PT students, clinicians, and the patients they serve.";

export const metadata: Metadata = {
  title: "Limbic, The Physical Therapy Platform",
  description: DESCRIPTION,
  openGraph: {
    title: "Limbic, The Physical Therapy Platform",
    description: "One platform. Every PT professional. Their entire career.",
    url: "https://limbic.center",
    siteName: "Limbic",
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
      name: "Limbic",
      url: "https://limbic.center",
      logo: "https://limbic.center/logo-icon.png",
      description: DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": "https://limbic.center/#website",
      name: "Limbic",
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
