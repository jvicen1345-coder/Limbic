import "server-only";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

/** Derived from the incoming request rather than hardcoded (unlike
 *  lib/google-oauth.ts's GOOGLE_REDIRECT_URI) — Stripe Checkout's success_url/cancel_url
 *  aren't pre-registered anywhere in the Stripe Dashboard the way an OAuth redirect URI
 *  is, so there's no exact-match requirement forcing a fixed production domain here. This
 *  keeps local dev and preview deploys working too. */
export async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "limbic.center";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

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

export type BillablePlan = "pro" | "studentPro" | "studentProBoards";

/** Real Price ids created in the Stripe Dashboard (Products & Prices) — see
 *  .env.example/README for the setup steps. Dollar amounts themselves ($25/mo, $5/mo,
 *  $15/mo) live only as display copy in app/(app)/pro/membership/page.tsx; this file never
 *  hardcodes a price, only which env var holds each plan's Price id. */
export function priceIdForPlan(plan: BillablePlan): string | undefined {
  switch (plan) {
    case "pro":
      return process.env.STRIPE_PRICE_PRO;
    case "studentPro":
      return process.env.STRIPE_PRICE_STUDENT_PRO;
    case "studentProBoards":
      return process.env.STRIPE_PRICE_STUDENT_PRO_BOARDS;
  }
}

/** The reverse lookup (webhook events carry a Price id, not a plan name) — see
 *  app/api/stripe/webhook/route.ts. Falls back to the event's own metadata.plan when set
 *  (see subscribeToProAction/subscribeToStudentTierAction, which stamp it on checkout) so
 *  this still works even before all three env vars are filled in during setup. */
export function planForPriceId(priceId: string | undefined): BillablePlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_STUDENT_PRO) return "studentPro";
  if (priceId === process.env.STRIPE_PRICE_STUDENT_PRO_BOARDS) return "studentProBoards";
  return null;
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
