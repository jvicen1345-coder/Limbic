import type { Metadata, Viewport } from "next";
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
  title: "Limbic Center, PT News",
  description: "Up-to-date news, guidelines, and clinical tools for physical therapists.",
  // Google Search Console's HTML-tag ownership verification — additional to the domain's
  // existing DNS-based verification, not a replacement for it. Search Console's own
  // instructions warn not to remove this once added, even after verification succeeds.
  verification: {
    google: "3j5CTxNE7wiihYyR_Bdd1ior2PdZ60XenEqYqyaH19k",
  },
  // Without this, iOS Safari's "Add to Home Screen" still creates a working icon (see
  // apple-icon.png) but opens it inside ordinary Safari chrome (address bar, tab strip)
  // rather than as a standalone, chromeless window — capable: true is what makes it launch
  // like a real app. Paired with app/manifest.ts, which does the equivalent for Android/
  // desktop Chrome's own install prompt. See components/GetTheAppCard.tsx for the
  // reader-facing instructions.
  appleWebApp: {
    capable: true,
    title: "Limbic",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#092744",
};

// Sets html[data-theme] before the first paint, so the page never flashes one theme and
// then swaps to another a beat later. Deliberately not something React renders (a
// useEffect that set the attribute would run after that first paint, too late to prevent
// the flash) — see components/ThemeToggle.tsx and components/ThemeSection.tsx, which
// read/write this same localStorage key for the actual controls. suppressHydrationWarning
// on <html> below is required because of this: the server has no way to know the
// visitor's stored preference, so its markup never has data-theme at all, and React would
// otherwise warn about this script changing an attribute it didn't render.
//
// localStorage holds the raw preference itself — "light", "dark", or "system" — not a
// pre-resolved value, so "system" can still be told apart from "never chosen" if that ever
// matters later. A stored "light"/"dark" is applied directly; "system" (or nothing stored
// yet, matching every visitor before this preference existed) resolves off the OS/browser's
// prefers-color-scheme instead of always defaulting to light. Persisted to the database too
// (User.themePreference) for cross-device sync, but that round trip is exactly what this
// script exists to avoid waiting on — see lib/theme-client.ts applyThemePreferenceLocally,
// which every control that changes this value calls to keep this device in sync immediately.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark")}else if(t==="light"){document.documentElement.setAttribute("data-theme","light")}else{var d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",d?"dark":"light")}}catch(e){}})();`;

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
