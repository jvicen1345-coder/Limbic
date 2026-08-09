import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import {
  subscribeToProAction,
  cancelProAction,
  subscribeToStudentTierAction,
  cancelStudentTierAction,
} from "@/app/actions/pro";
import { CrownIcon, GraduationCapIcon } from "@/components/icons";
import { PRO_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

export default async function ProMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = isStudentEmail(user.email);
  const billingEnabled = stripeEnabled();
  const { checkout } = await searchParams;

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

      {checkout === "success" && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-success)",
            background: "color-mix(in srgb, var(--color-success) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-success) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            margin: "0 0 16px",
          }}
        >
          Payment confirmed — thanks for subscribing.
        </p>
      )}
      {checkout === "canceled" && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-neutral-700)",
            background: "var(--color-neutral-100)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            margin: "0 0 16px",
          }}
        >
          Checkout was canceled — you weren&rsquo;t charged.
        </p>
      )}
      {!billingEnabled && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-danger)",
            background: "color-mix(in srgb, var(--color-danger) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-danger) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            margin: "0 0 16px",
          }}
        >
          Payments aren&rsquo;t set up yet — check back soon.
        </p>
      )}

      <div className="card elev-sm" style={{ marginBottom: 16 }}>
        {user.isPro ? (
          <>
            <div className="card-kicker">Membership</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              You have full access to LimbicPro. Manage your payment method or cancel below —
              cancellation takes effect at the end of your current billing period.
            </p>
            <form action={cancelProAction}>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                Manage membership
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="card-kicker">$25/month</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              Cancel any time — takes effect at the end of your current billing period.
            </p>
            <form action={subscribeToProAction}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                Upgrade to LimbicPro
              </button>
            </form>
          </>
        )}
      </div>

      <div className="card elev-sm">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <GraduationCapIcon size={18} style={{ color: "var(--color-accent)" }} />
          <div className="card-kicker" style={{ margin: 0 }}>
            LimbicStudent
          </div>
        </div>

        {!student ? (
          <p className="card-body" style={{ marginTop: 6 }}>
            LimbicStudent is only available with a student email — sign in on the General
            tab with an address ending in <strong>.edu</strong> to unlock it.
          </p>
        ) : user.studentTier === "limbicStudent" ? (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              You&rsquo;re on LimbicStudent. Manage your payment method or cancel below —
              cancellation takes effect at the end of your current billing period.
            </p>
            <form action={cancelStudentTierAction}>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                Manage membership
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, marginTop: 6 }}>$5/month</div>
            <p className="card-body" style={{ marginTop: 4 }}>
              HEP templates for coursework, the student verified badge, a coursework-curated
              weekly roundup, and full access to Limbic Boards — Daily Term and Daily
              Sharpening. Cancel any time.
            </p>
            <form action={subscribeToStudentTierAction}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                Upgrade to LimbicStudent
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
