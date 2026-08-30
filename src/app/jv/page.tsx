import type { Metadata } from "next";
import Link from "next/link";
import { LogoIcon } from "@/components/icons";

// A personal QR-code/business-card landing page, not a marketing surface — kept out of
// search results (unlike the publicly indexable routes in sitemap.ts/robots.ts) rather
// than given real SEO metadata, since nobody should be finding this by searching for it.
export const metadata: Metadata = {
  title: "Jonathan Vicen",
  description: "Jonathan Vicen — Limbic Center.",
  robots: { index: false, follow: false },
};

const LINKS: { label: string; description: string; href: string }[] = [
  { label: "LinkedIn", description: "Connect with me", href: "https://www.linkedin.com/in/jonathanvicen" },
  { label: "Limbic", description: "The physical therapy platform", href: "/" },
];

export default function JVCardPage() {
  return (
    <div className="card-link-page">
      <div className="card-link-container">
        <LogoIcon size={48} />
        <h1 className="card-link-name">Jonathan Vicen</h1>
        <p className="card-link-tagline">Limbic Center</p>

        <div className="card-link-list">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="card-link-item"
            >
              <span className="card-link-item-label">{link.label}</span>
              <span className="card-link-item-desc">{link.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
