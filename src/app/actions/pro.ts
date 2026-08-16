"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStripe, stripeEnabled, priceIdForPlan, getOrCreateStripeCustomerId, type BillablePlan } from "@/lib/stripe";
import { appOrigin } from "@/lib/url";

/** Starts a real Stripe Checkout session for `plan` and redirects the reader there — isPro/
 *  studentTier/isWellnessPlus itself is only ever set afterward, by the webhook confirming
 *  payment (see app/api/stripe/webhook/route.ts), not synchronously here.
 *  `subscription_data.metadata` (not just the Checkout Session's own metadata) carries
 *  which internal plan this is, since subscription-lifecycle events later reference the
 *  Subscription object, not the Checkout Session that created it. `returnPath` is whichever
 *  membership page started the checkout (/profile/membership or /wellness/membership), so the
 *  reader lands back where they clicked from rather than always on Pro's page. */
async function startCheckout(plan: BillablePlan, returnPath: string) {
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
    success_url: `${origin}${returnPath}?checkout=success`,
    cancel_url: `${origin}${returnPath}?checkout=canceled`,
  });

  if (session.url) redirect(session.url);
}

export async function subscribeToProAction() {
  await startCheckout("pro", "/profile/membership");
}

/** LimbicStudent — the single student plan (see /profile/membership); re-checks the .edu email
 *  itself rather than trusting the page that rendered the button, since a Server Action is
 *  its own callable endpoint (see app/actions/agent.ts requireProUser for the same
 *  reasoning). */
export async function subscribeToStudentTierAction() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return;
  await startCheckout("limbicStudent", "/profile/membership");
}

/** LimbicWellness+ — billing-only for now (see app/(app)/wellness/membership/page.tsx),
 *  offered as two separate plans (monthly/yearly) rather than one plan with an interval
 *  toggle, matching how the two Prices were set up in Stripe. */
export async function subscribeToWellnessPlusMonthlyAction() {
  await startCheckout("wellnessPlusMonthly", "/wellness/membership");
}

export async function subscribeToWellnessPlusYearlyAction() {
  await startCheckout("wellnessPlusYearly", "/wellness/membership");
}

/** Redirects to the Stripe-hosted Customer Portal, where a reader manages payment methods
 *  and cancels their own subscription(s) — Stripe's default portal cancellation is "at
 *  period end" (matches /terms' "Cancellation takes effect at the end of your current
 *  billing period"), and customer.subscription.deleted (see the webhook) is what actually
 *  flips isPro/studentTier/isWellnessPlus off, exactly when Stripe confirms the period has
 *  ended. Shared by every plan's cancel button — there's nothing plan-specific about the
 *  portal itself, it already knows which subscription(s) this customer has. */
async function openBillingPortal(returnPath: string) {
  const user = await getCurrentUser();
  if (!user || !stripeEnabled() || !user.stripeCustomerId) return;

  const stripe = getStripe();
  const origin = await appOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}${returnPath}`,
  });
  redirect(session.url);
}

export async function cancelProAction() {
  await openBillingPortal("/profile/membership");
}

export async function cancelStudentTierAction() {
  await openBillingPortal("/profile/membership");
}

export async function cancelWellnessPlusAction() {
  await openBillingPortal("/wellness/membership");
}
