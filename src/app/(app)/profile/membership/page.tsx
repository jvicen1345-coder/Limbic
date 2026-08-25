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
type TierKey = "free" | "wellness" | "student" | "pro" | "clinic";

interface FeatureRow {
  label: string;
  free: Cell;
  wellness: Cell;
  student: Cell;
  pro: Cell;
  clinic: Cell;
}

/** Every row of the tier-comparison table/cards below, in display order. Kept as one flat
 *  list (rather than grouped sub-tables) so the sticky feature-label column on desktop
 *  (see .plan-compare-table in globals.css) has one continuous set of rows to stay aligned
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

function cellFor(row: FeatureRow, key: TierKey): Cell {
  return row[key];
}

interface TierConfig {
  key: TierKey;
  label: string;
  price: string;
  current: boolean;
  /** Server Action to submit for checkout — null when this tier can't be purchased right
   *  now: Free (nothing to buy) or Limbic Student without a .edu email (the action itself
   *  already re-checks hasStudentAccess and silently no-ops, but showing a plain
   *  non-clickable name avoids a confusing dead click). */
  action: (() => Promise<void>) | null;
  nonClickableReason?: string;
}

/** Renders one tier's name/price/current-plan-pill — shared between the desktop table's
 *  <th> header cells and the mobile per-tier cards below, so the two layouts can never
 *  drift out of sync on which tier is purchasable/current. */
function TierHeader({ tier, billingEnabled }: { tier: TierConfig; billingEnabled: boolean }) {
  return (
    <>
      {tier.current || !tier.action ? (
        <span className="plan-compare-name" data-current={tier.current ? "true" : undefined} title={tier.nonClickableReason}>
          {tier.label}
        </span>
      ) : (
        <form action={tier.action}>
          <button type="submit" className="plan-compare-name" disabled={!billingEnabled}>
            {tier.label}
          </button>
        </form>
      )}
      <div className="plan-compare-price">{tier.price}</div>
      {tier.current && <span className="plan-compare-current-pill">Current Plan</span>}
    </>
  );
}

/** Moved here from /pro/membership (see that route, now a redirect) — subscribing/
 *  managing billing is an account-settings action, so it lives alongside the rest of
 *  Profile's own tabs rather than under the LimbicPro feature-comparison section.
 *
 *  Redesigned as a full comparison across all five tiers (Free, Limbic Wellness+, Limbic
 *  Student, LimbicPro, Clinic Pro) rather than one card per purchasable tier — see
 *  FEATURES/COMING_SOON above for the row data, shared by both layouts below. Desktop keeps
 *  a single scannable table (.plan-compare-table); below 799px (see globals.css) it swaps
 *  for one full-width card per tier, each listing every feature row top to bottom, so
 *  comparing tiers on a phone is a normal vertical scroll rather than horizontal scrolling
 *  one column at a time. Each tier's name is its purchase entry point: a Server
 *  Action-backed form submit button styled as a plain text link (see .plan-compare-name in
 *  globals.css), swapped for a non-clickable name + "Current Plan" pill once the reader
 *  already has that tier. Free never has a link (nothing to purchase); Clinic Pro is a new
 *  tier (see User.isClinicPro/clinicProSubscriptionId in schema.prisma) with the same
 *  additive billing shape as Wellness+ — billing-only for now, no team-seat/clinic-admin
 *  feature gate actually wired up yet (see "Clinic Admin Dashboard"/"Up to 6 Team Seats"
 *  rows, which describe what Clinic Pro will unlock, not something built elsewhere in this
 *  PR). */
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

  const TIERS: TierConfig[] = [
    { key: "free", label: "Free", price: "$0", current: onFree, action: null },
    { key: "wellness", label: "Limbic Wellness+", price: "$3/mo", current: onWellness, action: onWellness ? null : subscribeToWellnessPlusFromProfileAction },
    {
      key: "student",
      label: "Limbic Student",
      price: "$5/mo",
      current: onStudent,
      action: onStudent || !student ? null : subscribeToStudentTierAction,
      nonClickableReason: !onStudent && !student ? "Sign in with a .edu email to purchase Limbic Student" : undefined,
    },
    { key: "pro", label: "LimbicPRO", price: "$25/mo", current: onPro, action: onPro ? null : subscribeToProAction },
    { key: "clinic", label: "Clinic PRO", price: "$100/mo", current: onClinic, action: onClinic ? null : subscribeToClinicAction },
  ];

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

      {/* Desktop/tablet: one scannable table. Hidden below 799px in favor of the per-tier
          card stack below (see .plan-compare-wrap in globals.css). */}
      <div className="plan-compare-wrap">
        <table className="plan-compare-table">
          <thead>
            <tr>
              <th scope="col">Feature</th>
              {TIERS.map((tier) => (
                <th scope="col" key={tier.key}>
                  <TierHeader tier={tier} billingEnabled={billingEnabled} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="plan-compare-divider-row">
              <td colSpan={6}>Coming Soon</td>
            </tr>
            {COMING_SOON.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one full-width card per tier, stacked — a normal vertical scroll through
          each tier's complete feature list instead of horizontally scrolling the table one
          column at a time. Only shown below 799px (see .plan-compare-cards in globals.css). */}
      <div className="plan-compare-cards">
        {TIERS.map((tier) => (
          <div className={tier.current ? "plan-compare-card plan-compare-card--current" : "plan-compare-card"} key={tier.key}>
            <div className="plan-compare-card-header">
              <TierHeader tier={tier} billingEnabled={billingEnabled} />
            </div>
            <ul className="plan-compare-card-features">
              {FEATURES.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <CellMark value={cellFor(row, tier.key)} />
                </li>
              ))}
            </ul>
            <div className="plan-compare-card-soon">Coming Soon</div>
            <ul className="plan-compare-card-features">
              {COMING_SOON.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <CellMark value={cellFor(row, tier.key)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
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
