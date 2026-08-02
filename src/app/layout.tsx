import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const figtree = Figtree({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Limbic — PT News",
  description: "Up-to-date news, guidelines, and clinical tools for physical therapists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${figtree.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
