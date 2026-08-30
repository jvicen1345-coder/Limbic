import { getCurrentUser, hasStudentAccess, hasFreeAccess } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import {
  subscribeToProAction,
  cancelProAction,
  subscribeToStudentTierAction,
  subscribeToWellnessPlusFromProfileAction,
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

/** The core cross-tier rows — everything above the two clinical-tool groups below, in
 *  display order. */
const BASE_FEATURES: FeatureRow[] = [
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
];

/** The clinical-reference toolbox — no longer LimbicPRO-exclusive (see
 *  lib/session.ts hasClinicalReferenceAccess and each /pro/* tool page's own gate), so
 *  every tier gets a checkmark here now, Free included. Rendered under its own
 *  "Free Clinical Reference" divider row (see FeatureDividerRow below) on desktop. */
const FREE_CLINICAL_FEATURES: FeatureRow[] = [
  { label: "Outcome Measures", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Decision Rules and Red Flag Screening", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Special Tests Library", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Lab Values and Medication Reference", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Documentation Templates", free: true, wellness: true, student: true, pro: true, clinic: true },
  { label: "Clinical Guidelines", free: true, wellness: true, student: true, pro: true, clinic: true },
];

/** What's still LimbicPRO-exclusive — the practice-running tools, not the reference
 *  material above. Rendered under its own "LimbicPRO — Clinical Tools" divider row on
 *  desktop. Patient Outcome Tracking/Pre-Visit Clinical Briefs/Patient Brief Download are
 *  Clinician Dashboard sub-features (see app/actions/clinician-dashboard.ts's
 *  requireProUser gate) called out as their own rows rather than folded into the single
 *  "Clinician Dashboard" line. */
const PRO_CLINICAL_FEATURES: FeatureRow[] = [
  { label: "Limbic Agent — Clinical Decision Support", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Force Lab — Dynamometer Data", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Clinician Dashboard", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Home Exercise Program Builder", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "CE Tracker", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Patient Outcome Tracking", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Pre-Visit Clinical Briefs", free: false, wellness: false, student: false, pro: true, clinic: true },
  { label: "Patient Brief Download", free: false, wellness: false, student: false, pro: true, clinic: true },
];

/** Clinic Pro-only rows — unrelated to the LimbicPRO free/paid split above, kept at the
 *  tail end same as before. */
const CLINIC_ONLY_FEATURES: FeatureRow[] = [
  { label: "Clinic Admin Dashboard", free: false, wellness: false, student: false, pro: false, clinic: true },
  { label: "Up to 6 Team Seats", free: false, wellness: false, student: false, pro: false, clinic: true },
  { label: "Patient HEP Management", free: false, wellness: false, student: false, pro: false, clinic: true },
];

/** Flat concatenation of every real (non-divider) row, in display order — the desktop
 *  table renders each group separately (with divider rows between them, see
 *  FeatureDividerRow below); the mobile per-tier cards just need one continuous list to
 *  filter each tier's included rows out of, same as before this was split into groups. */
const FEATURES: FeatureRow[] = [...BASE_FEATURES, ...FREE_CLINICAL_FEATURES, ...PRO_CLINICAL_FEATURES, ...CLINIC_ONLY_FEATURES];

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

/** A muted, uppercase, full-width section label row — same shell as the existing
 *  "Coming Soon" divider row (see .plan-compare-divider-row in globals.css), reused here to
 *  split the desktop table into "Free Clinical Reference" and "LimbicPRO — Clinical Tools"
 *  sections instead of one continuous list. */
function FeatureDividerRow({ label }: { label: string }) {
  return (
    <tr className="plan-compare-divider-row">
      <td colSpan={6}>{label}</td>
    </tr>
  );
}

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
   *  now: Free (nothing to buy, so TierHeader renders no button at all), Limbic Student
   *  without a .edu email (TierHeader renders a disabled "Subscribe" button with
   *  nonClickableReason as its title instead — the action itself already re-checks
   *  hasStudentAccess and silently no-ops regardless, but a disabled button reads clearer
   *  than a dead click), or a tier marked comingSoon. */
  action: (() => Promise<void>) | null;
  nonClickableReason?: string;
  /** No Stripe Price exists for this tier yet (see priceIdForPlan in lib/stripe.ts) — a
   *  Subscribe button would just silently no-op mid-checkout (startCheckout's own
   *  `if (!priceId) return`), so TierHeader shows a plain "Coming Soon" pill in its place
   *  instead of a dead button. Remove once the tier's env var (e.g. STRIPE_PRICE_CLINIC) is
   *  actually set. */
  comingSoon?: boolean;
}

/** Renders one tier's name/price/subscribe-button-or-current-pill — shared between the
 *  desktop table's <th> header cells and the mobile per-tier cards below, so the two
 *  layouts can never drift out of sync on which tier is purchasable/current. The name
 *  itself used to be the purchase link (a plain-text button); it's now inert display text,
 *  with a real "Subscribe" button underneath as its own, more obvious entry point. */
function TierHeader({ tier, billingEnabled }: { tier: TierConfig; billingEnabled: boolean }) {
  return (
    <div className="plan-compare-header">
      <div className="plan-compare-name">{tier.label}</div>
      <div className="plan-compare-price">{tier.price}</div>
      {tier.current ? (
        <span className="plan-compare-current-pill">Current Plan</span>
      ) : tier.comingSoon ? (
        <span className="plan-compare-coming-soon-pill">Coming Soon</span>
      ) : tier.action ? (
        <form action={tier.action} className="plan-compare-cta-form">
          <button type="submit" className="btn btn-primary plan-compare-cta" disabled={!billingEnabled}>
            Subscribe
          </button>
        </form>
      ) : (
        tier.nonClickableReason && (
          <button type="button" className="btn btn-secondary plan-compare-cta" disabled title={tier.nonClickableReason}>
            Subscribe
          </button>
        )
      )}
    </div>
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
 *  one column at a time. Each purchasable tier gets a real "Subscribe" button (a Server
 *  Action-backed form submit) under its name/price — see TierHeader — swapped for a
 *  "Current Plan" pill once the reader already has that tier. Free never has a button
 *  (nothing to purchase); Clinic Pro is a new
 *  tier (see User.isClinicPro/clinicProSubscriptionId in schema.prisma) with the same
 *  additive billing shape as Wellness+, but no Stripe Price exists for it yet — its
 *  TierConfig sets comingSoon instead of a real action, so TierHeader shows a "Coming
 *  Soon" pill rather than a Subscribe button that would silently fail mid-checkout. Flip
 *  that back to a real action once STRIPE_PRICE_CLINIC is set. No team-seat/clinic-admin
 *  feature gate actually wired up yet either (see "Clinic Admin Dashboard"/"Up to 6 Team
 *  Seats" rows, which describe what Clinic Pro will unlock, not something built
 *  elsewhere in this PR). */
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
    { key: "pro", label: "LimbicPRO", price: "$15/mo", current: onPro, action: onPro ? null : subscribeToProAction },
    { key: "clinic", label: "Clinic PRO", price: "$100/mo", current: onClinic, action: null, comingSoon: !onClinic },
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
            {BASE_FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
            <FeatureDividerRow label="Free Clinical Reference" />
            {FREE_CLINICAL_FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
            <FeatureDividerRow label="LimbicPRO — Clinical Tools" />
            {PRO_CLINICAL_FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
            {CLINIC_ONLY_FEATURES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>
                    <CellMark value={cellFor(row, tier.key)} />
                  </td>
                ))}
              </tr>
            ))}
            <FeatureDividerRow label="Coming Soon" />
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

      {/* Mobile: one full-width card per tier, stacked — listing only what that tier
          includes (plus its own upcoming items), not every row with a dash for what it
          lacks. Much shorter to scroll through than the full parity grid, and comparing
          tiers is a normal vertical scroll rather than horizontally scrolling the table one
          column at a time. Only shown below 799px (see .plan-compare-cards in globals.css). */}
      <div className="plan-compare-cards">
        {TIERS.map((tier) => {
          const included = FEATURES.filter((row) => cellFor(row, tier.key) === true);
          const soon = COMING_SOON.filter((row) => cellFor(row, tier.key) === "soon");
          return (
            <div className={tier.current ? "plan-compare-card plan-compare-card--current" : "plan-compare-card"} key={tier.key}>
              <div className="plan-compare-card-header">
                <TierHeader tier={tier} billingEnabled={billingEnabled} />
              </div>
              <ul className="plan-compare-card-features">
                {included.map((row) => (
                  <li key={row.label}>
                    <span className="plan-compare-check">✓</span>
                    {row.label}
                  </li>
                ))}
              </ul>
              {soon.length > 0 && (
                <>
                  <div className="plan-compare-card-soon">Coming Soon</div>
                  <ul className="plan-compare-card-features">
                    {soon.map((row) => (
                      <li key={row.label}>
                        <span className="plan-compare-soon">Soon</span>
                        {row.label}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
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
