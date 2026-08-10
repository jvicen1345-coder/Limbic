import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import { isSiteAdmin } from "@/lib/admin";
import {
  subscribeToProAction,
  cancelProAction,
  subscribeToStudentTierAction,
  cancelStudentTierAction,
} from "@/app/actions/pro";
import { CrownIcon, GraduationCapIcon } from "@/components/icons";
import { PROFILE_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

/** Moved here from /pro/membership (see that route, now a redirect) — subscribing/
 *  managing billing is an account-settings action, so it lives alongside the rest of
 *  Profile's own tabs rather than under the LimbicPro feature-comparison section. */
export default async function ProfileMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = hasStudentAccess(user);
  const billingEnabled = stripeEnabled();
  // A site admin's isPro/studentTier read as fully active (see lib/session.ts
  // getCurrentUser()) without a real Stripe subscription behind them, so "Manage
  // membership" would just be a dead button — swap in a plain "you have full access as a
  // site admin" line instead of trying to open a Customer Portal session that doesn't exist.
  const adminAccess = await isSiteAdmin();
  const { checkout } = await searchParams;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Profile</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {user.isPro || user.studentTier === "limbicStudent"
          ? "You're a member — thanks for supporting Limbic."
          : "Manage your LimbicPro or LimbicStudent membership."}
      </p>
      <SubTabs tabs={PROFILE_TABS} />

      {checkout === "success" && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-success)",
            background: "color-mix(in srgb, var(--color-success) 12%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, var(--color-success) 35%, transparent)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            margin: "16px 0 0",
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
            margin: "16px 0 0",
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
            margin: "16px 0 0",
          }}
        >
          Payments aren&rsquo;t set up yet — check back soon.
        </p>
      )}

      <div className="card elev-sm" style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <CrownIcon size={18} style={{ color: "var(--color-accent)" }} />
          <div className="card-kicker" style={{ margin: 0 }}>
            LimbicPro
          </div>
        </div>
        {user.isPro ? (
          <>
            <p className="card-body" style={{ marginTop: 6 }}>
              {adminAccess
                ? "You have full access to LimbicPro as a site admin."
                : "You have full access to LimbicPro. Manage your payment method or cancel below — cancellation takes effect at the end of your current billing period."}
            </p>
            {!adminAccess && (
              <form action={cancelProAction}>
                <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                  Manage membership
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, marginTop: 6 }}>$25/month</div>
            <p className="card-body" style={{ marginTop: 4 }}>
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
              {adminAccess
                ? "You have full access to LimbicStudent as a site admin."
                : "You’re on LimbicStudent. Manage your payment method or cancel below — cancellation takes effect at the end of your current billing period."}
            </p>
            {!adminAccess && (
              <form action={cancelStudentTierAction}>
                <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                  Manage membership
                </button>
              </form>
            )}
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
