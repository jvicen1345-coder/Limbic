import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import { subscribeToProAction } from "@/app/actions/pro";

export const metadata: Metadata = {
  title: "Overview",
};
import { CrownIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/** The six tools that still require a LimbicPRO subscription — everything else in the old
 *  ten-tool toolbox (Outcome Measures, Screening & Decision Support, Special Tests,
 *  Clinical Reference, Documentation, Guidelines) is free to any signed-in user now (see
 *  lib/session.ts hasClinicalReferenceAccess and each /pro/* page's own gate), so this
 *  overview no longer needs to pitch them — see FREE_REFERENCE_TOOLS below for the plain
 *  list of what's already included free. Patient Brief has no standalone page of its own
 *  (it's generated per-patient from the Clinician Dashboard, see
 *  app/pro/patient-brief/[patientId]/page.tsx — a standalone print route outside the (app)
 *  group, not something to link to directly without a patientId), so this card links to
 *  /pro/dashboard, the real entry point for generating one. */
const PRO_FEATURES: { name: string; description: string; href: string }[] = [
  {
    name: "Limbic Agent",
    description: "Clinical decision support powered by AI. Evidence-based answers at the point of care — not a replacement for your judgment, a support for it.",
    href: "/agent",
  },
  {
    name: "Force Lab",
    description: "Import handheld dynamometer data directly from ActiveForce. Track LSI, compare to normative values, and generate patient-friendly strength reports.",
    href: "/pro/force-lab",
  },
  {
    name: "Clinician Dashboard",
    description: "Your complete patient caseload in one place. Condition tracking, outcome measures, HEP assignments, pre-visit briefs, and clinical notes.",
    href: "/pro/dashboard",
  },
  {
    name: "HEP Builder",
    description: "Build and assign home exercise programs. Connect programs to patient records and include them in downloadable patient briefs.",
    href: "/hep",
  },
  {
    name: "CE Tracker",
    description: "Track continuing education hours toward your license renewal. Log courses, upload certificates, and monitor your progress.",
    href: "/pro/ce-tracker",
  },
  {
    name: "Patient Brief",
    description: "Generate professional patient-friendly documents combining their progress summary, strength data, and home exercise program — ready to download and send.",
    href: "/pro/dashboard",
  },
];

const FREE_REFERENCE_TOOLS = [
  "Outcome Measures",
  "Decision Rules",
  "Red Flag Screening",
  "Special Tests",
  "Lab Values",
  "Medications",
  "Documentation Templates",
  "Guidelines",
];

/**
 * The overview, decluttered to just answer "what does LimbicPro actually include" — the
 * pricing ladder (5 tiers, 3 of them not even built yet) and the LimbicStudent-vs-LimbicPro
 * roadmap comparison table used to live here too, which buried the real answer under
 * marketing/roadmap content having nothing to do with what this specific account gets.
 * LimbicStudent's own equivalent pitch lives on its own overview (see app/(app)/student/
 * page.tsx's !hasStudentAccess branch) rather than mixed in here.
 *
 * The pricing/CTA card only renders for a non-Pro reader — a real Pro subscriber gets a
 * "Manage membership" link in its place instead, same "no pitch once you already have it"
 * shape as before. The free-reference callout and the six PRO_FEATURES cards render either
 * way, since they're just describing what the product includes, not selling anything.
 */
export default async function ProOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const billingEnabled = stripeEnabled();

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CrownIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>The clinical tools that make you a better PT</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px", maxWidth: 640 }}>
        Free clinical reference for every PT. LimbicPRO adds the tools that save you time, track your patients, and
        support your clinical decisions.
      </p>
      <SubTabs tabs={PRO_TABS} />

      <div className="card elev-sm" style={{ margin: "16px 0" }}>
        <div className="card-kicker">Already included free for all clinicians</div>
        <p className="card-body" style={{ marginTop: 6 }}>
          {FREE_REFERENCE_TOOLS.join(" · ")}
        </p>
      </div>

      <h2 style={{ fontSize: 18, margin: "8px 0 4px" }}>LimbicPRO — Clinical Tools</h2>
      <div className="pro-tools-grid">
        {PRO_FEATURES.map((tool) => (
          <Link key={tool.name} href={tool.href} className="pro-tool-card">
            <div className="pro-tool-card-title">{tool.name}</div>
            <p className="pro-tool-card-desc">{tool.description}</p>
          </Link>
        ))}
      </div>

      {user.isPro ? (
        <div style={{ margin: "20px 0 0" }}>
          <Link href="/profile/membership" className="btn btn-secondary">
            Manage membership
          </Link>
        </div>
      ) : (
        <div className="card elev-sm" style={{ margin: "20px 0 0" }}>
          <div className="card-kicker">$15 per month — cancel anytime</div>
          <form action={subscribeToProAction} style={{ marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={!billingEnabled}>
              Upgrade to LimbicPRO
            </button>
          </form>
          <p className="card-body" style={{ marginTop: 10, marginBottom: 0 }}>
            Free clinical reference tools are always included — no subscription required.
          </p>
        </div>
      )}
    </div>
  );
}
