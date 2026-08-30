import type { Metadata } from "next";
import Link from "next/link";
import { LogoIcon, ChevronRightIcon } from "@/components/icons";

// A personal QR-code/business-card landing page, not a marketing surface — kept out of
// search results (unlike the publicly indexable routes in sitemap.ts/robots.ts) rather
// than given real SEO metadata, since nobody should be finding this by searching for it.
export const metadata: Metadata = {
  title: "Jonathan Vicencio",
  description: "Jonathan Vicencio — Limbic Center.",
  robots: { index: false, follow: false },
};

const LINKS: { label: string; description: string; href: string; icon: "limbic" | "linkedin" }[] = [
  { label: "Limbic", description: "Limbic Center | Landing page", href: "/", icon: "limbic" },
  { label: "LinkedIn", description: "Visit Profile", href: "https://www.linkedin.com/in/jonathan-vicencio", icon: "linkedin" },
];

function LinkIcon({ kind }: { kind: "limbic" | "linkedin" }) {
  if (kind === "limbic") {
    return (
      <span className="card-link-icon card-link-icon-limbic">
        <LogoIcon size={26} />
      </span>
    );
  }
  return (
    <span className="card-link-icon card-link-icon-linkedin" aria-hidden>
      in
    </span>
  );
}

export default function JVCardPage() {
  return (
    <div className="card-link-page">
      <div className="card-link-hero">
        <h1 className="card-link-hero-name">Jonathan Vicencio</h1>
        <p className="card-link-hero-title">Doctor of Physical Therapy, Class of 2028</p>
        <p className="card-link-hero-school">Chapman University</p>
      </div>

      <div className="card-link-body">
        <div className="card-link-list">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="card-link-row"
            >
              <LinkIcon kind={link.icon} />
              <span className="card-link-row-text">
                <span className="card-link-row-title">{link.label}</span>
                <span className="card-link-row-desc">{link.description}</span>
              </span>
              <ChevronRightIcon size={18} className="card-link-row-arrow" />
            </Link>
          ))}
        </div>

        <div className="card-link-footer">
          <p className="card-link-footer-name">Jonathan Vicencio, SPT</p>
          <p className="card-link-footer-email">Jvicencio1@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
