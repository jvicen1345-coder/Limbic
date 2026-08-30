import Link from "next/link";
import { LogoIcon } from "@/components/icons";

const AUDIENCE_CARDS = [
  {
    title: "Built for the DPT journey",
    body: "From orientation to boards prep to your first clinical rotation, Limbic keeps you sharp every step of the way.",
    label: "Limbic Student",
  },
  {
    title: "Stay current. Stay connected.",
    body: "Current evidence, clinical decision support, and the professional network the PT world has never had.",
    label: "LimbicPRO",
  },
  {
    title: "Health guidance that actually makes sense",
    body: "Evidence-based tools and education backed by the same research your physical therapist uses.",
    label: "Limbic Wellness+",
  },
];

const FEATURES = [
  {
    name: "Limbic Agent",
    body: "Clinical decision support grounded in current evidence. Never a diagnosis. Always a starting point.",
  },
  {
    name: "Limbic Boards",
    body: "Daily NPTE sharpening. Term of the day. Board question. Case of the day.",
  },
  {
    name: "Limbic Threads",
    body: "Every article connected to the research it came from. Follow the evidence anywhere.",
  },
  {
    name: "Limbic Nexus",
    body: "The professional network built for physical therapy. Not adapted from somewhere else.",
  },
  {
    name: "Limbic Games",
    body: "Daily habit-building games that make staying current feel less like studying.",
  },
];

const FOOTER_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/founding-funders", label: "Founding Funders" },
];

/** The public marketing page at "/" — see app/page.tsx, which only renders this for a
 *  signed-out visitor. Deliberately outside the (app) route group: no AppShell, no
 *  sidebar, no session-dependent data, every color routes through the same tokens the
 *  rest of the app already uses (see globals.css's "Landing page" section) so this reads
 *  as the front door of the same product instead of a bolted-on template. */
export function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <LogoIcon size={26} />
          <span className="landing-nav-wordmark">Limbic</span>
        </div>
        <div className="landing-nav-actions">
          <Link href="/sign-in" className="landing-btn landing-btn-outline">
            Sign In
          </Link>
          <Link href="/founding-funders" className="landing-btn landing-btn-gold">
            Founding Funders
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <h1 className="landing-hero-headline">The research, the profession, and the public. Finally in one place.</h1>
        <p className="landing-hero-subheadline">
          The only platform that keeps physical therapy professionals current and connected, while making that
          same knowledge accessible to the patients and public they serve.
        </p>
        <div className="landing-hero-ctas">
          <Link href="/sign-in" className="landing-btn landing-btn-primary landing-btn-lg">
            Get Started
          </Link>
          <Link href="/founding-funders" className="landing-btn landing-btn-gold landing-btn-lg">
            Founding Funders
          </Link>
        </div>
      </section>

      <section className="landing-audience">
        <div className="landing-audience-grid">
          {AUDIENCE_CARDS.map((c) => (
            <div className="landing-audience-card" key={c.title}>
              <div className="landing-audience-card-label">{c.label}</div>
              <h3 className="landing-audience-card-title">{c.title}</h3>
              <p className="landing-audience-card-body">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-features">
        <h2 className="landing-section-heading">Everything in one place</h2>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.name}>
              <h3 className="landing-feature-card-name">{f.name}</h3>
              <p className="landing-feature-card-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-demo">
        <p className="landing-demo-eyebrow">See It In Action</p>
        <h2 className="landing-section-heading">Watch a 4-minute walkthrough</h2>
        <p className="landing-demo-body">
          See how Limbic works for students, clinicians, and the public — all in one platform.
        </p>
        {/* Placeholder until the Loom demo is recorded — swap for the real embed iframe,
            same wrapper div, once it exists. */}
        <div className="landing-demo-video-placeholder">
          <p>Video coming soon</p>
        </div>
      </section>

      <section className="landing-founding">
        <h2 className="landing-founding-heading">The people who believed first</h2>
        <p className="landing-founding-body">
          Limbic is launching August 17th, 2026. Twenty-five founding spots are available, lifetime access for the
          people who back Limbic from day one. This is not equity. This is recognition.
        </p>
        <Link href="/founding-funders" className="landing-btn landing-btn-gold landing-btn-lg">
          See Founding Funders
        </Link>
        <p className="landing-founding-legal">
          Founding Funder membership is not equity or ownership in Limbic. See Terms of Service for full details.
        </p>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-copyright">© 2026 Limbic Center, limbic.center</div>
        <div className="landing-footer-links">
          {FOOTER_LINKS.map((l, i) => (
            <span key={l.href}>
              {i > 0 && <span className="landing-footer-dot">·</span>}
              <Link href={l.href} className="landing-footer-link">
                {l.label}
              </Link>
            </span>
          ))}
        </div>
        <p className="landing-footer-disclaimer">
          Limbic provides clinical decision support, not medical advice. Always consult a licensed physician or
          physical therapist.
        </p>
      </footer>
    </div>
  );
}
