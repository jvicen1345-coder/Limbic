import type { Metadata } from "next";
import { Caprasimo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import "./globals.css";

// Self-hosted via next/font instead of the globals.css `@import` this replaced: that
// @import forced the browser through a 3-hop chain (page CSS -> fonts.googleapis.com CSS
// -> the actual font files) before any text could paint, which is exactly the kind of
// thing that shows up as a slow First/Largest Contentful Paint despite a fast
// Time-to-First-Byte. next/font fetches the font files at build time and serves them from
// the app's own origin, with the @font-face + preload wired up automatically.
const caprasimo = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo",
  display: "swap",
});

// The base body font used to be self-hosted Figtree — now the same native system-UI stack
// Facebook's web app renders with (no webfont download at all: San Francisco on macOS/iOS,
// Segoe UI on Windows, Roboto on Android/Chrome OS), set directly on --font-body in
// globals.css rather than loaded here.

export const metadata: Metadata = {
  // Resolves every relative URL in every page's metadata (openGraph.images, etc.) to an
  // absolute https://limbic.center/... one — required for those to work correctly once a
  // page is actually crawled or shared, rather than a same-origin-only relative path.
  metadataBase: new URL("https://limbic.center"),
  // Fallback only — every real, publicly indexable route (see sitemap.ts/robots.ts for the
  // full list: "/", /founding-funders, /sign-in, /terms, /privacy) sets its own metadata
  // below so Google never has to fall back to this generic one and improvise a snippet
  // from page content instead, which is what was happening on /founding-funders before it
  // got its own metadata export.
  title: "Limbic, PT News",
  description: "Up-to-date news, guidelines, and clinical tools for physical therapists.",
  // Google Search Console's HTML-tag ownership verification — additional to the domain's
  // existing DNS-based verification, not a replacement for it. Search Console's own
  // instructions warn not to remove this once added, even after verification succeeds.
  verification: {
    google: "3j5CTxNE7wiihYyR_Bdd1ior2PdZ60XenEqYqyaH19k",
  },
};

// Sets html[data-theme] before the first paint, so the page never flashes light and then
// swaps to dark a beat later. Deliberately not something React renders (a useEffect that
// set the attribute would run after that first paint, too late to prevent the flash) —
// see components/ThemeToggle.tsx, which reads/writes this same localStorage key and
// attribute for the actual toggle. suppressHydrationWarning on <html> below is required
// because of this: the server has no way to know the visitor's stored preference, so its
// markup never has data-theme at all, and React would otherwise warn about this script
// changing an attribute it didn't render.
//
// Every new visitor starts on light regardless of OS/browser color-scheme — deliberately
// not following prefers-color-scheme here, so light is the one guaranteed first
// impression for anyone who hasn't chosen otherwise. Dark is fully opt-in via the toggle,
// which is what actually writes "dark" into localStorage for this same read to pick up.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={caprasimo.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <TopLoadingBar />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
