import "server-only";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";


/** Whether real Stripe billing is configured at all — gates the LimbicPro/student-tier
 *  purchase and cancel buttons on /pro/membership (see app/(app)/pro/membership/page.tsx)
 *  and the webhook route, same graceful-degradation pattern as googleSignInEnabled()/
 *  YOUTUBE_API_KEY elsewhere in this app. Unlike those, there's no silent fallback here —
 *  showing a fake "purchase" as if it charged a real card would be actively misleading,
 *  so an unconfigured Stripe just disables the buttons with an explanatory message. */
export function stripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

let _stripe: Stripe | null = null;

/** Throws if called while !stripeEnabled() — every caller is expected to check that first
 *  (see stripeEnabled() above), same as googleSignInEnabled() gating lib/google-oauth.ts's
 *  functions. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY is unset).");
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

// LimbicWellness+ is two plans, not one — same product/feature (billing-only for now, see
// app/(app)/wellness/membership/page.tsx), just monthly vs. annual pricing. Kept as
// separate BillablePlan values (rather than a plan + interval pair) so the rest of this
// file's one-price-per-plan shape doesn't need to change.
export type BillablePlan = "pro" | "limbicStudent" | "wellnessPlusMonthly" | "wellnessPlusYearly" | "clinic";

/** Real Price ids created in the Stripe Dashboard (Products & Prices) — see
 *  .env.example/README for the setup steps. Dollar amounts themselves ($15/mo, $5/mo,
 *  $3/mo, $18/yr, $100/mo) live only as display copy in app/(app)/profile/membership/page.tsx
 *  and app/(app)/wellness/membership/page.tsx; this file never hardcodes a price, only
 *  which env var holds each plan's Price id. */
export function priceIdForPlan(plan: BillablePlan): string | undefined {
  switch (plan) {
    case "pro":
      return process.env.STRIPE_PRICE_PRO;
    case "limbicStudent":
      return process.env.STRIPE_PRICE_LIMBIC_STUDENT;
    case "wellnessPlusMonthly":
      return process.env.STRIPE_PRICE_WELLNESS_PLUS_MONTHLY;
    case "wellnessPlusYearly":
      return process.env.STRIPE_PRICE_WELLNESS_PLUS_YEARLY;
    case "clinic":
      return process.env.STRIPE_PRICE_CLINIC;
  }
}

/** The reverse lookup (webhook events carry a Price id, not a plan name) — see
 *  app/api/stripe/webhook/route.ts. Falls back to the event's own metadata.plan when set
 *  (see subscribeToProAction/subscribeToStudentTierAction/subscribeToWellnessPlus*Action,
 *  which stamp it on checkout) so this still works even before every env var is filled in
 *  during setup. */
export function planForPriceId(priceId: string | undefined): BillablePlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_LIMBIC_STUDENT) return "limbicStudent";
  if (priceId === process.env.STRIPE_PRICE_WELLNESS_PLUS_MONTHLY) return "wellnessPlusMonthly";
  if (priceId === process.env.STRIPE_PRICE_WELLNESS_PLUS_YEARLY) return "wellnessPlusYearly";
  if (priceId === process.env.STRIPE_PRICE_CLINIC) return "clinic";
  return null;
}

/** A Checkout Session's `payment_intent` is a plain string id unless the session was
 *  fetched with that field expanded, in which case it's the full PaymentIntent object —
 *  used by both the checkout.session.completed webhook handler
 *  (app/api/stripe/webhook/route.ts) and the /founding-funders success-page backup
 *  confirmation (createFoundingFunderCheckout's companions in app/actions/founding-funders.ts). */
export function paymentIntentIdFromSession(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
}

/** Looks up (or creates, on a reader's first-ever checkout) this user's Stripe Customer,
 *  reusing it on every later checkout/portal session rather than minting a new one each
 *  time — see User.stripeCustomerId in schema.prisma. */
export async function getOrCreateStripeCustomerId(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email ?? user.licenseEmail ?? undefined,
    name: user.name,
    metadata: { userId: user.id },
  });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}
