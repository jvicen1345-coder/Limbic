"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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

/**
 * Student tiers only ever have one active subscription per reader — upgrading from
 * Student PRO to Student PRO+ Boards updates that existing subscription's price in place
 * (with proration) instead of starting a second, parallel one through Checkout. A reader
 * with no subscription yet goes through startCheckout exactly like subscribeToProAction.
 */
export async function subscribeToStudentTierAction(tier: "studentPro" | "studentProBoards") {
  const user = await getCurrentUser();
  if (!user || !isStudentEmail(user.email) || !stripeEnabled()) return;

  const priceId = priceIdForPlan(tier);
  if (!priceId) return;

  if (user.stripeSubscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const item = subscription.items.data[0];
    if (item) {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        items: [{ id: item.id, price: priceId }],
        proration_behavior: "create_prorations",
        metadata: { userId: user.id, plan: tier },
      });
      // The webhook's customer.subscription.updated handler also does this, but that
      // event can take a moment to arrive — updating here too means the reader sees their
      // new tier immediately on the page Stripe's API call already confirmed succeeded,
      // rather than briefly showing their old one until the webhook catches up.
      await prisma.user.update({ where: { id: user.id }, data: { studentTier: tier } });
      revalidatePath("/", "layout");
      return;
    }
  }

  await startCheckout(tier);
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
