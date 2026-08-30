import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Overview",
};
import { CrownIcon, ChevronRightIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/** The LimbicPRO clinical toolbox — ten tool sections, each its own page under /pro/*
 *  (see app/(app)/pro/calculators, /decision-rules, etc. — Decision Rules and Red Flag
 *  Screening now share one page/tab bar, as do Lab Values and Medications, see
 *  ScreeningDecisionTabs.tsx/ClinicalReferenceTabs.tsx). Six of these also open up to a
 *  .edu Limbic Student account (see lib/session.ts hasClinicalReferenceAccess) — the
 *  remaining four (Documentation, CE Tracker, Home Exercise Programs, and the HEP Builder)
 *  stay isPro-only, since they're about running a real practice rather than learning the
 *  material. Either way this overview doesn't need to know which is which: each tool page
 *  decides its own gate (ProGate) once clicked through. Rendered as a 2-column card grid on
 *  desktop, single column on mobile (see .pro-tools-grid in globals.css). */
const PRO_TOOLS: { name: string; description: string; count: string; href: string }[] = [
  { name: "Outcome Measures", description: "12 validated outcome measures and functional assessments", count: "12 tools", href: "/pro/calculators" },
  { name: "Screening & Decision Support", description: "8 clinical decision rules plus red flag screening checklists for urgent referral", count: "8 rules + 6 categories", href: "/pro/decision-rules" },
  { name: "Special Tests", description: "Organized by body region with sensitivity and specificity", count: "7 regions", href: "/pro/special-tests" },
  { name: "Clinical Reference", description: "Lab values and medication classes with PT-specific clinical implications", count: "6 lab + 8 drug categories", href: "/pro/lab-values" },
  { name: "Therapeutic Exercises", description: "Condition-specific exercises with setup, technique, dosage, and cueing", count: "Growing library", href: "/pro/exercises" },
  { name: "Research & Statistics Literacy", description: "How to break down a research article, interpret the statistics inside it, and a generalizability checker", count: "2 guides + tool", href: "/pro/research-literacy" },
  { name: "Documentation", description: "Templates for evaluations, progress notes, and discharge", count: "7 templates", href: "/pro/documentation" },
  { name: "CE Tracker", description: "Track continuing education hours toward license renewal", count: "Track hours", href: "/pro/ce-tracker" },
  { name: "Guidelines", description: "APTA, AAOS, NICE, and other evidence-based clinical practice guidelines", count: "38 guidelines", href: "/pro/guidelines" },
  { name: "Home Exercise Programs", description: "Build and export patient HEP programs", count: "Build & save", href: "/hep" },
];

/**
 * The overview, decluttered to just answer "what does LimbicPro actually include" — the
 * pricing ladder (5 tiers, 3 of them not even built yet) and the LimbicStudent-vs-LimbicPro
 * roadmap comparison table used to live here too, which buried the real answer under
 * marketing/roadmap content having nothing to do with what this specific account gets.
 * LimbicStudent's own equivalent pitch lives on its own overview (see app/(app)/student/
 * page.tsx's !hasStudentAccess branch) rather than mixed in here.
 *
 * Once isPro is true, the overview goes away entirely — no pitch, no pricing, just the
 * toolbox — same "overview until you have access, the real thing once you do" shape as
 * the Student Atrium.
 */
export default async function ProOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CrownIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>LimbicPro</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {user.isPro
          ? "You're a Pro member, thanks for supporting Limbic."
          : "Clinician tools built for how you actually practice, all in the app, nothing emailed out."}
      </p>
      <SubTabs tabs={PRO_TABS} />

      {user.isPro ? (
        <div style={{ margin: "16px 0" }}>
          <Link href="/profile/membership" className="btn btn-secondary">
            Manage membership
          </Link>
        </div>
      ) : (
        <div className="card elev-sm" style={{ margin: "16px 0" }}>
          <div className="card-kicker">$15/month</div>
          <p className="card-body" style={{ marginTop: 6 }}>
            Cancel any time; takes effect at the end of your current billing period.
          </p>
          <Link href="/profile/membership" className="btn btn-primary" style={{ marginTop: 10 }}>
            Upgrade to LimbicPro
          </Link>
        </div>
      )}

      <h2 style={{ fontSize: 18, margin: "8px 0 4px" }}>The Clinical Toolbox</h2>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 4px" }}>
        Ten tool sections built for how you actually practice, all in the app, nothing emailed out.
      </p>
      <div className="pro-tools-grid">
        {PRO_TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="pro-tool-card">
            <div className="pro-tool-card-title">{tool.name}</div>
            <p className="pro-tool-card-desc">{tool.description}</p>
            <div className="pro-tool-card-footer">
              <span>{tool.count}</span>
              <span className="pro-tool-card-arrow">
                Open <ChevronRightIcon size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
