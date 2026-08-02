import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { CrownIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/**
 * The Pro roadmap: two tiers sharing the same six feature areas, each scoped to what
 * that audience actually needs — Student PRO for coursework/boards prep, LimbicPro for
 * practicing clinicians. Nothing here is built yet — this is the plan, not a live
 * comparison of two purchasable products. Today's checkout flow further down is still
 * the single LimbicPro $9/month demo toggle; Student PRO isn't a purchasable tier yet.
 */
const TIER_COMPARISON: { feature: string; student: string; pro: string }[] = [
  {
    feature: "Limbic Agent",
    student: "Study and exam support, case-based learning.",
    pro: "Clinical decision support for real patients.",
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
          ? "You're a Pro member — thanks for supporting Limbic."
          : "Clinician tools built for how you actually practice — all in the app, nothing emailed out."}
      </p>
      <SubTabs tabs={PRO_TABS} />

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div className="card elev-sm" style={{ flex: 1 }}>
          <div className="card-kicker">Student PRO</div>
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
              <div>Student PRO</div>
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

      <div className="card elev-sm">
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
            <div className="card-kicker">$9/month</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              Demo only — this doesn&rsquo;t charge a real card.
            </p>
            <Link href="/pro/membership" className="btn btn-primary" style={{ marginTop: 10 }}>
              Upgrade to LimbicPro
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
