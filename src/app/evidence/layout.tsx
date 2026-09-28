import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { LogoIcon } from "@/components/icons";
import "@/styles/article.css";
import "@/styles/plain-terms.css";
import "@/styles/evidence.css";

/** The public evidence library — deliberately outside the (app) route group, like
 *  app/programs and app/founding-funders: no AppShell, no sign-in redirect, so a patient
 *  from Google, a student sharing a link, or a crawler reaches real content.
 *
 *  Nothing under here ever calls the model (see components/ArticleBreakdown.tsx's "public"
 *  mode). Breakdowns shown here are the cached ones — written for a signed-in reader, or by
 *  the daily warmer (app/api/cron/warm-evidence-breakdowns). */
export default async function EvidenceLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="evidence-page">
      <header className="evidence-header">
        <Link href="/" className="evidence-header-logo">
          <LogoIcon size={24} />
          <span>Limbic</span>
        </Link>
        <nav className="evidence-header-nav" aria-label="Evidence library">
          <Link href="/evidence">Evidence library</Link>
          {user ? (
            <Link href="/home" className="btn btn-primary evidence-header-cta">
              Open Limbic
            </Link>
          ) : (
            <Link href="/sign-in" className="btn btn-primary evidence-header-cta">
              Sign in
            </Link>
          )}
        </nav>
      </header>
      <main className="evidence-main">{children}</main>
      <footer className="evidence-footer">
        <p>
          Limbic summarizes published research to make it easier to read. It is education, not medical advice: talk
          with a licensed physical therapist or physician about your own care.
        </p>
        <p>
          Summaries are written by Limbic from each study&rsquo;s published abstract, with a link to the original.{" "}
          <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/dmca">Copyright</Link>
        </p>
      </footer>
    </div>
  );
}
