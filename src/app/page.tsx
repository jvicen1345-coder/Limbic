import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LandingPage } from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Limbic, The Physical Therapy Platform",
  description:
    "Limbic Center is the physical therapy platform built for DPT students, clinicians, and the public they serve. Evidence-based research, clinical tools, and professional community, all in one place.",
  openGraph: {
    title: "Limbic, The Physical Therapy Platform",
    description: "One platform. Every PT professional. Their entire career.",
    url: "https://limbic.center",
    siteName: "Limbic",
  },
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

  return <LandingPage />;
}
