import Link from "next/link";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { CrownIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/**
 * The Pro roadmap: two tiers sharing the same six feature areas, each scoped to what
 * that audience actually needs — LimbicStudent for coursework/boards prep, LimbicPro for
 * practicing clinicians. LimbicStudent and LimbicPro are real, billable tiers now (see
 * lib/stripe.ts), gated to .edu sign-ins (see the membership card below and
 * lib/session.ts isStudentEmail) — Limbic Boards (/boards) and Limbic Agent (/agent,
 * currently in demo mode) are the built rows; HEP Builder/Verified Badge/Certified
 * Clips/Weekly Roundup differentiation below is still just the plan. Limbic Games
 * (/wordle) is open to everyone and isn't part of this tier comparison.
 */
const TIER_COMPARISON: { feature: string; student: string; pro: string }[] = [
  {
    feature: "Limbic Boards",
    student: "Daily pre-boards sharpening, case-based practice.",
    pro: "Not included — Boards is a student-only product.",
  },
  {
    feature: "Limbic Agent",
    student: "Demo mode live now — full clinical decision support launching in a future phase.",
    pro: "Demo mode live now — full clinical decision support launching in a future phase.",
  },
  {
    feature: "HEP Builder",
    student: "Create and save HEP templates for coursework.",
    pro: "Send HEPs directly to real patients, with images.",
  },
  {
    feature: "Verified Badge",
    student: "Student verified badge.",
    pro: "Licensed PT gold badge.",
  },
  {
    feature: "Certified Clips",
    student: "Cannot post certified clips.",
    pro: "Full certified clip posting.",
  },
  {
    feature: "Weekly Roundup",
    student: "Curated to coursework and upcoming boards prep.",
    pro: "Curated to clinical specialty and CE events.",
  },
  {
    feature: "Nexus",
    student: "Can follow and learn from clinicians.",
    pro: "Full peer-to-peer clinical networking.",
  },
];

/** The tier ladder — order reflects a clinician's career stage (free -> student ->
 *  new grad -> full LimbicPro -> clinic/team), not sorted by price. LimbicPro and
 *  LimbicStudent are purchasable today (see the membership card below); New Grad PRO and
 *  Clinic PRO are priced but not yet built or billable. */
const PURCHASABLE_TIERS = new Set(["LimbicPro", "LimbicStudent"]);

const PRICING_TIERS: { name: string; price: string; who: string }[] = [
  { name: "Free", price: "$0", who: "General public" },
  { name: "LimbicStudent", price: "$5/mo", who: "PT students" },
  { name: "New Grad PRO", price: "$12/mo", who: "First year post-graduation" },
  { name: "LimbicPro", price: "$25/mo", who: "Practicing PTs" },
  { name: "Clinic PRO", price: "$100/mo", who: "Up to 6 clinicians · $15/seat above that" },
];

export default async function ProOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = isStudentEmail(user.email);
  const studentTierLabel = user.studentTier === "limbicStudent" ? "LimbicStudent" : null;

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CrownIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>LimbicPro</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {user.isPro
          ? "You're a Pro member — thanks for supporting Limbic."
          : studentTierLabel
            ? `You're a ${studentTierLabel} member — thanks for supporting Limbic.`
            : student
              ? "PT student? LimbicStudent is available for your .edu account below."
              : "Clinician tools built for how you actually practice — all in the app, nothing emailed out."}
      </p>
      <SubTabs tabs={PRO_TABS} />

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div className="card elev-sm" style={{ flex: 1 }}>
          <div className="card-kicker">LimbicStudent</div>
          <p className="card-body" style={{ marginTop: 4 }}>
            Built around learning and preparation.
          </p>
        </div>
        <div className="card elev-sm" style={{ flex: 1 }}>
          <div className="card-kicker">LimbicPro</div>
          <p className="card-body" style={{ marginTop: 4 }}>
            Built around practice and efficiency.
          </p>
        </div>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 12 }}>
        <div className="card-kicker" style={{ marginBottom: 8 }}>
          Planned tiers
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "8px 14px",
                borderRadius: "var(--radius-lg)",
                background: PURCHASABLE_TIERS.has(tier.name) ? "var(--color-accent-100)" : "var(--color-neutral-100)",
                color: PURCHASABLE_TIERS.has(tier.name) ? "var(--color-accent-800)" : "var(--color-neutral-800)",
              }}
            >
              <span style={{ fontSize: 12 }}>{tier.name}</span>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{tier.price}</span>
              <span style={{ fontSize: 11, opacity: 0.85, maxWidth: 150 }}>{tier.who}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "10px 0 0" }}>
          LimbicPro and LimbicStudent are available to purchase today — LimbicStudent
          requires a .edu sign-in. New Grad PRO and Clinic PRO are priced but not yet built.
        </p>
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div className="card-kicker" style={{ margin: 0 }}>
            What&rsquo;s coming
          </div>
          <span className="tag tag-neutral">Coming soon</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 560, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(110px, 1fr) minmax(200px, 1.6fr) minmax(200px, 1.6fr)",
                gap: 12,
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-neutral-700)",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-divider)",
              }}
            >
              <div>Feature</div>
              <div>LimbicStudent</div>
              <div>LimbicPro</div>
            </div>
            {TIER_COMPARISON.map((row) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(110px, 1fr) minmax(200px, 1.6fr) minmax(200px, 1.6fr)",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 14 }}>{row.feature}</div>
                <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>{row.student}</p>
                <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: 0 }}>{row.pro}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card elev-sm" style={{ marginBottom: student ? 12 : 0 }}>
        {user.isPro ? (
          <>
            <div className="card-kicker">Membership</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              You have full access to LimbicPro.
            </p>
            <Link href="/pro/membership" className="btn btn-secondary" style={{ marginTop: 10 }}>
              Manage membership
            </Link>
          </>
        ) : (
          <>
            <div className="card-kicker">$25/month</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              Cancel any time — takes effect at the end of your current billing period.
            </p>
            <Link href="/pro/membership" className="btn btn-primary" style={{ marginTop: 10 }}>
              Upgrade to LimbicPro
            </Link>
          </>
        )}
      </div>

      {student && (
        <div className="card elev-sm">
          {studentTierLabel ? (
            <>
              <div className="card-kicker">Student membership</div>
              <p className="card-body" style={{ marginTop: 6 }}>
                You have {studentTierLabel} access.
              </p>
              <Link href="/pro/membership" className="btn btn-secondary" style={{ marginTop: 10 }}>
                Manage membership
              </Link>
            </>
          ) : (
            <>
              <div className="card-kicker">LimbicStudent · $5/month</div>
              <p className="card-body" style={{ marginTop: 6 }}>
                Cancel any time — takes effect at the end of your current billing period.
              </p>
              <Link href="/pro/membership" className="btn btn-primary" style={{ marginTop: 10 }}>
                See LimbicStudent
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
