"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, isStudentEmail } from "@/lib/session";
import { getStripe, stripeEnabled, priceIdForPlan, getOrCreateStripeCustomerId, appOrigin, type BillablePlan } from "@/lib/stripe";

/** Starts a real Stripe Checkout session for `plan` and redirects the reader there — isPro/
 *  studentTier itself is only ever set afterward, by the webhook confirming payment (see
 *  app/api/stripe/webhook/route.ts), not synchronously here. `subscription_data.metadata`
 *  (not just the Checkout Session's own metadata) carries which internal plan this is,
 *  since subscription-lifecycle events later reference the Subscription object, not the
 *  Checkout Session that created it. */
async function startCheckout(plan: BillablePlan) {
  const user = await getCurrentUser();
  if (!user || !stripeEnabled()) return;

  const priceId = priceIdForPlan(plan);
  if (!priceId) return;

  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomerId(user);
  const origin = await appOrigin();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id, plan } },
    success_url: `${origin}/pro/membership?checkout=success`,
    cancel_url: `${origin}/pro/membership?checkout=canceled`,
  });

  if (session.url) redirect(session.url);
}

export async function subscribeToProAction() {
  await startCheckout("pro");
}

/** LimbicStudent — the single student plan (see /pro/membership); re-checks the .edu email
 *  itself rather than trusting the page that rendered the button, since a Server Action is
 *  its own callable endpoint (see app/actions/agent.ts requireProUser for the same
 *  reasoning). */
export async function subscribeToStudentTierAction() {
  const user = await getCurrentUser();
  if (!user || !isStudentEmail(user.email)) return;
  await startCheckout("limbicStudent");
}

/** Redirects to the Stripe-hosted Customer Portal, where a reader manages payment methods
 *  and cancels their own subscription — Stripe's default portal cancellation is "at period
 *  end" (matches /terms' "Cancellation takes effect at the end of your current billing
 *  period"), and customer.subscription.deleted (see the webhook) is what actually flips
 *  isPro/studentTier off, exactly when Stripe confirms the period has ended. Shared by both
 *  LimbicPro and student-tier cancellation — there's nothing plan-specific about the portal
 *  itself, it already knows which subscription(s) this customer has. */
async function openBillingPortal() {
  const user = await getCurrentUser();
  if (!user || !stripeEnabled() || !user.stripeCustomerId) return;

  const stripe = getStripe();
  const origin = await appOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/pro/membership`,
  });
  redirect(session.url);
}

export async function cancelProAction() {
  await openBillingPortal();
}

export async function cancelStudentTierAction() {
  await openBillingPortal();
}
