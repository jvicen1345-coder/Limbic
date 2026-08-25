import { getCurrentUser, hasStudentAccess, hasFreeAccess } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import {
  subscribeToProAction,
  cancelProAction,
  subscribeToStudentTierAction,
  subscribeToWellnessPlusFromProfileAction,
  subscribeToClinicAction,
} from "@/app/actions/pro";
import { PROFILE_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";

type Cell = boolean | "soon";

interface FeatureRow {
  label: string;
  free: Cell;
  wellness: Cell;
  student: Cell;
  pro: Cell;
  clinic: Cell;
}

/** Every row of the tier-comparison table below, in display order. Kept as one flat list
 *  (rather than grouped sub-tables) so the sticky feature-label column (see
 *  .plan-compare-table in globals.css) has one continuous set of rows to stay aligned
 *  against while scrolling horizontally. */
const FEATURES: FeatureRow[] = [
  { label: "Daily PT News Feed", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Limbic Clips", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Limbic Calendar", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Limbic Games", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Health and Wellness Tools", free: false, wellness: true, student: false, pro: true, clinic: true },
  { label: "Wellness Metrics Tracking", free: false, wellness: true, student: false, pro: true, clinic: true },
  { label: "Specialty Tracks", free: false, wellness: false, student: true, pro: true, clinic: true },
  { label: "Limbic Boards — NPTE Prep", free: false, wellness: false, student: true, pro: true, clinic: true },
  { label: "Daily Sharpening Sessions", free: false, wellness: false, student: true, pro: true, clinic: true },
  { label: "Flashcard Decks", free: false, wellness: false, student: true, pro: true, clinic: true },
  { label: "Clinical Calculators", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Decision Rules and Red Flag Screening", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Special Tests Library", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Lab Values and Medication Reference", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Documentation Templates", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "CE Tracker", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Limbic Agent — Clinical Decision Support", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Home Exercise Program Builder", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Clinic Admin Dashboard", free: false, wellness: false, student: false, pro: false, clinic: true },
  { label: "Up to 6 Team Seats", free: false, wellness: false, student: false, pro: false, clinic: true },
  { label: "Patient HEP Management", free: false, wellness: false, student: false, pro: false, clinic: true },
];

const COMING_SOON: FeatureRow[] = [
  { label: "Limbic Jobs — PT Career Marketplace", free: false, wellness: false, student: "soon", pro: "soon", clinic: "soon" },
  { label: "Institutional Access — Program Licensing", free: "soon", wellness: "soon", student: "soon", pro: "soon", clinic: "soon" },
  { label: "CE Credits Through Limbic", free: false, wellness: false, student: "soon", pro: "soon", clinic: "soon" },
];

/** Maps a BillablePlan (see lib/stripe.ts) to the display name shown in the success banner
 *  ("Welcome to [tier name]") — startCheckout (app/actions/pro.ts) stamps `plan` onto the
 *  success URL for exactly this purpose. */
const PLAN_DISPLAY_NAME: Record<string, string> = {
  pro: "LimbicPRO",
  limbicStudent: "Limbic Student",
  wellnessPlusMonthly: "Limbic Wellness+",
  wellnessPlusYearly: "Limbic Wellness+",
  clinic: "Clinic PRO",
};

function CellMark({ value }: { value: Cell }) {
  if (value === "soon") return <span className="plan-compare-soon">Soon</span>;
  return value ? <span className="plan-compare-check">✓</span> : <span className="plan-compare-dash">—</span>;
}

/** Moved here from /pro/membership (see that route, now a redirect) — subscribing/
 *  managing billing is an account-settings action, so it lives alongside the rest of
 *  Profile's own tabs rather than under the LimbicPro feature-comparison section.
 *
 *  Redesigned as a single full-width comparison table across all five tiers (Free,
 *  Limbic Wellness+, Limbic Student, LimbicPro, Clinic Pro) rather than one card per
 *  purchasable tier — see FEATURES/COMING_SOON above for the row data. Each tier's column
 *  header is its purchase entry point: the tier name is a Server Action-backed form
 *  submit button styled as a plain text link (see .plan-compare-name in globals.css),
 *  swapped for a non-clickable name + "Current Plan" pill once the reader already has
 *  that tier. Free never has a link (nothing to purchase); Clinic Pro is a new tier (see
 *  User.isClinicPro/clinicProSubscriptionId in schema.prisma) with the same additive
 *  billing shape as Wellness+ — billing-only for now, no team-seat/clinic-admin feature
 *  gate actually wired up yet (see "Clinic Admin Dashboard"/"Up to 6 Team Seats" rows,
 *  which describe what Clinic Pro will unlock, not something built elsewhere in this PR). */
export default async function ProfileMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; plan?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = hasStudentAccess(user);
  const billingEnabled = stripeEnabled();
  const { checkout, plan } = await searchParams;

  // A site admin's, or a comped account's, isPro/studentTier/isWellnessPlus reads as fully
  // active (see lib/session.ts getCurrentUser()) without a real Stripe subscription behind
  // it — "Manage billing" would just open a portal session for a customer that doesn't
  // exist, so it's hidden rather than shown as a dead link. Clinic Pro has no comp
  // mechanism yet (not part of GrantArea), so isClinicPro always implies a real
  // subscription.
  const proFree = hasFreeAccess(user, "pro");
  const studentFree = hasFreeAccess(user, "limbicStudent");
  const wellnessFree = hasFreeAccess(user, "wellnessPlus");
  const hasBillableSubscription =
    (user.isPro && !proFree) ||
    (user.studentTier === "limbicStudent" && !studentFree) ||
    (user.isWellnessPlus && !wellnessFree) ||
    user.isClinicPro;

  const onWellness = user.isWellnessPlus;
  const onStudent = user.studentTier === "limbicStudent";
  const onPro = user.isPro;
  const onClinic = user.isClinicPro;
  const onFree = !onWellness && !onStudent && !onPro && !onClinic;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Profile</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        {onFree ? "Compare Limbic's membership tiers and upgrade any time." : "You're a member, thanks for supporting Limbic."}
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
          Your membership has been upgraded. Welcome to {PLAN_DISPLAY_NAME[plan ?? ""] ?? "Limbic"}.
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
          Checkout canceled. Your plan has not changed.
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
          Payments aren&rsquo;t set up yet, check back soon.
        </p>
      )}

      <div className="plan-compare-wrap">
        <table className="plan-compare-table">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">
                <div className="plan-compare-name" data-current={onFree ? "true" : undefined}>
                  Free
                </div>
                <div className="plan-compare-price">$0</div>
                {onFree && <span className="plan-compare-current-pill">Current Plan</span>}
              </th>
              <th scope="col">
                {onWellness ? (
                  <span className="plan-compare-name" data-current="true">
                    Limbic Wellness+
                  </span>
                ) : (
                  <form action={subscribeToWellnessPlusFromProfileAction}>
                    <button type="submit" className="plan-compare-name" disabled={!billingEnabled}>
                      Limbic Wellness+
                    </button>
                  </form>
                )}
                <div className="plan-compare-price">$3/mo</div>
                {onWellness && <span className="plan-compare-current-pill">Current Plan</span>}
              </th>
              <th scope="col">
                {onStudent ? (
                  <span className="plan-compare-name" data-current="true">
                    Limbic Student
                  </span>
                ) : student ? (
                  <form action={subscribeToStudentTierAction}>
                    <button type="submit" className="plan-compare-name" disabled={!billingEnabled}>
                      Limbic Student
                    </button>
                  </form>
                ) : (
                  <span className="plan-compare-name" data-current="true" title="Sign in with a .edu email to purchase Limbic Student">
                    Limbic Student
                  </span>
                )}
                <div className="plan-compare-price">$5/mo</div>
                {onStudent && <span className="plan-compare-current-pill">Current Plan</span>}
              </th>
              <th scope="col">
                {onPro ? (
                  <span className="plan-compare-name" data-current="true">
                    LimbicPRO
                  </span>
                ) : (
                  <form action={subscribeToProAction}>
                    <button type="submit" className="plan-compare-name" disabled={!billingEnabled}>
                      LimbicPRO
                    </button>
                  </form>
                )}
                <div className="plan-compare-price">$25/mo</div>
                {onPro && <span className="plan-compare-current-pill">Current Plan</span>}
              </th>
              <th scope="col">
                {onClinic ? (
                  <span className="plan-compare-name" data-current="true">
                    Clinic PRO
                  </span>
                ) : (
                  <form action={subscribeToClinicAction}>
                    <button type="submit" className="plan-compare-name" disabled={!billingEnabled}>
                      Clinic PRO
                    </button>
                  </form>
                )}
                <div className="plan-compare-price">$100/mo</div>
                {onClinic && <span className="plan-compare-current-pill">Current Plan</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  <CellMark value={row.free} />
                </td>
                <td>
                  <CellMark value={row.wellness} />
                </td>
                <td>
                  <CellMark value={row.student} />
                </td>
                <td>
                  <CellMark value={row.pro} />
                </td>
                <td>
                  <CellMark value={row.clinic} />
                </td>
              </tr>
            ))}
            <tr className="plan-compare-divider-row">
              <td colSpan={6}>Coming Soon</td>
            </tr>
            {COMING_SOON.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  <CellMark value={row.free} />
                </td>
                <td>
                  <CellMark value={row.wellness} />
                </td>
                <td>
                  <CellMark value={row.student} />
                </td>
                <td>
                  <CellMark value={row.pro} />
                </td>
                <td>
                  <CellMark value={row.clinic} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasBillableSubscription && (
        <form action={cancelProAction}>
          <button type="submit" className="btn btn-secondary" style={{ marginTop: 4 }} disabled={!billingEnabled}>
            Manage billing
          </button>
        </form>
      )}
    </div>
  );
}
