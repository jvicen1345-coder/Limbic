import { getCurrentUser } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import { subscribeToWellnessPlusMonthlyAction, subscribeToWellnessPlusYearlyAction, cancelWellnessPlusAction } from "@/app/actions/pro";
import { WellnessIcon } from "@/components/icons";

export default async function WellnessMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const billingEnabled = stripeEnabled();
  const { checkout } = await searchParams;

  return (
    <div className="screen-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <WellnessIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>LimbicWellness+</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {user.isWellnessPlus
          ? "You're a LimbicWellness+ member — thanks for supporting Limbic."
          : "Support Limbic's Health & Wellness content, with early access to what's next as it ships."}
      </p>

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

      <div className="card elev-sm">
        {user.isWellnessPlus ? (
          <>
            <div className="card-kicker">Membership</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              You&rsquo;re on the {user.wellnessPlusInterval === "year" ? "yearly" : "monthly"} plan.
              Manage your payment method or cancel below — cancellation takes effect at the
              end of your current billing period.
            </p>
            <form action={cancelWellnessPlusAction}>
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 10 }} disabled={!billingEnabled}>
                Manage membership
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="card-kicker">Billing only, for now</div>
            <p className="card-body" style={{ marginTop: 6 }}>
              LimbicWellness+ doesn&rsquo;t unlock anything new in the app yet — it&rsquo;s a
              way to support Limbic&rsquo;s Health &amp; Wellness content today, with early
              access to whatever we build here next. Cancel any time.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <form action={subscribeToWellnessPlusMonthlyAction}>
                <button type="submit" className="btn btn-primary" disabled={!billingEnabled}>
                  $3/month
                </button>
              </form>
              <form action={subscribeToWellnessPlusYearlyAction}>
                <button type="submit" className="btn btn-secondary" disabled={!billingEnabled}>
                  $18/year
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
