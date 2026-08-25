import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeEnabled, planForPriceId, paymentIntentIdFromSession, type BillablePlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { nextFoundingFunderNumber } from "@/lib/founding-funders";

/**
 * The single source of truth for isPro/studentTier/isWellnessPlus — app/actions/pro.ts
 * only ever starts checkout/portal sessions, never flips any of those fields itself. Also
 * the primary path (see confirmFoundingFunderCheckoutSession below) for confirming the
 * one-time $40 Founding Funder purchase started by createFoundingFunderCheckout
 * (app/actions/founding-funders.ts) — the /founding-funders success page does its own
 * backup check of the Checkout Session directly, in case this webhook is delayed.
 * Verifies the raw request body against STRIPE_WEBHOOK_SECRET before trusting anything in
 * it — an unverified POST to this URL is just attacker-controlled JSON, same reasoning as
 * lib/google-oauth.ts's ID token verification.
 *
 * Configure this route's URL (https://<your-domain>/api/stripe/webhook) as a webhook
 * endpoint in the Stripe Dashboard, subscribed to at least: customer.subscription.created,
 * customer.subscription.updated, customer.subscription.deleted, checkout.session.completed.
 */
export async function POST(request: NextRequest) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });

  // Raw bytes, not a parsed body — Stripe's signature covers the exact bytes it sent, and
  // Next.js Route Handlers don't parse the body for you unless you ask (unlike the old
  // Pages API, which needed its bodyParser explicitly disabled for this same reason).
  const rawBody = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await clearSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed":
        await confirmFoundingFunderCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        // Every other event type is intentionally ignored — this app only needs to know
        // whether a subscription is active and which plan it's for.
        break;
    }
  } catch (err) {
    // Non-2xx tells Stripe to retry (with backoff) — better than silently dropping an
    // event this handler failed to process partway through.
    console.error(`[stripe webhook] failed handling ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function resolveUserId(subscription: Stripe.Subscription): Promise<string | null> {
  const metaUserId = subscription.metadata?.userId;
  if (metaUserId) return metaUserId;

  // Fallback for a subscription whose metadata is missing for some reason (e.g. one
  // created directly in the Stripe Dashboard rather than through this app's checkout) —
  // match by Stripe Customer id instead.
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
  return user?.id ?? null;
}

function resolvePlan(subscription: Stripe.Subscription): BillablePlan | null {
  return (subscription.metadata?.plan as BillablePlan | undefined) ?? planForPriceId(subscription.items.data[0]?.price.id);
}

const WELLNESS_PLUS_PLANS = new Set<BillablePlan>(["wellnessPlusMonthly", "wellnessPlusYearly"]);
const CLINIC_PLANS = new Set<BillablePlan>(["clinic"]);

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) {
    console.error("[stripe webhook] no user found for subscription", subscription.id);
    return;
  }

  const plan = resolvePlan(subscription);
  if (!plan) {
    console.error("[stripe webhook] could not resolve plan for subscription", subscription.id);
    return;
  }

  const active = subscription.status === "active" || subscription.status === "trialing";

  // LimbicWellness+ is additive (a reader can also be LimbicPro/LimbicStudent at the same
  // time), so it gets its own subscription-id column rather than sharing
  // stripeSubscriptionId, which only ever tracks one of the two mutually-exclusive
  // clinician tiers.
  if (WELLNESS_PLUS_PLANS.has(plan)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        wellnessPlusSubscriptionId: subscription.id,
        isWellnessPlus: active,
        wellnessPlusInterval: active ? (plan === "wellnessPlusMonthly" ? "month" : "year") : null,
      },
    });
    return;
  }

  // Clinic PRO is additive too (a clinic subscription can coexist with an individual
  // isPro/studentTier one), same reasoning as LimbicWellness+ above.
  if (CLINIC_PLANS.has(plan)) {
    await prisma.user.update({
      where: { id: userId },
      data: { clinicProSubscriptionId: subscription.id, isClinicPro: active },
    });
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      ...(plan === "pro" ? { isPro: active } : { studentTier: active ? plan : "none" }),
    },
  });
}

async function clearSubscription(subscription: Stripe.Subscription) {
  const userId = await resolveUserId(subscription);
  if (!userId) return;

  const plan = resolvePlan(subscription);
  if (!plan) {
    console.error("[stripe webhook] could not resolve plan for canceled subscription", subscription.id);
    return;
  }

  if (WELLNESS_PLUS_PLANS.has(plan)) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { wellnessPlusSubscriptionId: true } });
    // Only clear if this is still the subscription on file — an older, already-superseded
    // subscription's belated "deleted" event shouldn't cancel a newer, still-active one.
    if (user?.wellnessPlusSubscriptionId !== subscription.id) return;
    await prisma.user.update({
      where: { id: userId },
      data: { wellnessPlusSubscriptionId: null, isWellnessPlus: false, wellnessPlusInterval: null },
    });
    return;
  }

  if (CLINIC_PLANS.has(plan)) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { clinicProSubscriptionId: true } });
    if (user?.clinicProSubscriptionId !== subscription.id) return;
    await prisma.user.update({
      where: { id: userId },
      data: { clinicProSubscriptionId: null, isClinicPro: false },
    });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeSubscriptionId: true } });
  if (user?.stripeSubscriptionId !== subscription.id) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: null,
      ...(plan === "pro" ? { isPro: false } : { studentTier: "none" }),
    },
  });
}

/** checkout.session.completed fires for every completed Checkout Session this app creates —
 *  subscription-mode (LimbicPro/Student/Wellness+, handled above by
 *  customer.subscription.created/.updated instead) and payment-mode (the one-time $40
 *  Founding Funder purchase) alike. Purely additive: a subscription checkout's Session has
 *  no metadata.foundingFunderId, so this returns immediately and never touches subscription
 *  state — see createFoundingFunderCheckout in app/actions/founding-funders.ts for where
 *  that metadata gets stamped. */
async function confirmFoundingFunderCheckoutSession(session: Stripe.Checkout.Session) {
  const foundingFunderId = session.metadata?.foundingFunderId;
  if (!foundingFunderId) return;

  const record = await prisma.foundingFunder.findUnique({ where: { id: foundingFunderId } });
  if (!record) {
    console.error("[stripe webhook] no FoundingFunder record for id", foundingFunderId);
    return;
  }
  // Stripe can redeliver the same event — a no-op here (rather than re-confirming) is what
  // keeps nextFoundingFunderNumber() below from handing out a second number for one funder.
  if (record.paymentStatus === "confirmed") return;

  await prisma.foundingFunder.update({
    where: { id: foundingFunderId },
    data: {
      paymentStatus: "confirmed",
      confirmed: true,
      stripeSessionId: session.id,
      stripePaymentId: paymentIntentIdFromSession(session),
      confirmedAt: new Date(),
      foundingFunderNumber: await nextFoundingFunderNumber(),
    },
  });
}
