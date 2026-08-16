"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getStripe, stripeEnabled, paymentIntentIdFromSession } from "@/lib/stripe";
import { FOUNDING_FUNDERS_TOTAL_SLOTS } from "@/lib/founding-funders-config";
import { nextFoundingFunderNumber } from "@/lib/founding-funders";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FoundingFundersData {
  /** confirmedCount + pendingCount — "X of 25 claimed" counts a spot the moment a Checkout
   *  Session is created, not just once payment is confirmed, so the page can't undersell
   *  relative to the cap createFoundingFunderCheckout enforces below. */
  claimedCount: number;
  confirmedCount: number;
  pendingCount: number;
  totalSlots: number;
  waitlistCount: number;
  /** Ordered by claim date, oldest (spot #1) first — see the grid in founding-funders/page.tsx. */
  funders: { displayName: string; credential: string | null; paymentStatus: string }[];
}

/** Called from the /founding-funders page itself (server-rendered) and re-called by
 *  WaitlistForm after a successful join so the "X of 25 claimed" / waitlist counts on
 *  screen reflect the database without a full page reload. */
export async function getFoundingFundersData(): Promise<FoundingFundersData> {
  const [confirmedCount, pendingCount, waitlistCount, funders] = await Promise.all([
    prisma.foundingFunder.count({ where: { paymentStatus: "confirmed" } }),
    prisma.foundingFunder.count({ where: { paymentStatus: "pending" } }),
    prisma.foundingFunderWaitlist.count(),
    prisma.foundingFunder.findMany({
      where: { paymentStatus: { in: ["confirmed", "pending"] } },
      orderBy: { claimedAt: "asc" },
      select: { displayName: true, credential: true, paymentStatus: true },
    }),
  ]);
  return {
    claimedCount: confirmedCount + pendingCount,
    confirmedCount,
    pendingCount,
    totalSlots: FOUNDING_FUNDERS_TOTAL_SLOTS,
    waitlistCount,
    funders,
  };
}

export interface JoinWaitlistResult {
  ok: boolean;
  error?: string;
  waitlistCount: number;
}

export async function joinWaitlistAction(email: string): Promise<JoinWaitlistResult> {
  const trimmed = email.trim().toLowerCase();
  const currentCount = await prisma.foundingFunderWaitlist.count();

  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address.", waitlistCount: currentCount };
  }

  const existing = await prisma.foundingFunderWaitlist.findUnique({ where: { email: trimmed } });
  if (existing) {
    return { ok: false, error: "You're already on the list.", waitlistCount: currentCount };
  }

  await prisma.foundingFunderWaitlist.create({ data: { email: trimmed } });
  revalidatePath("/founding-funders");
  return { ok: true, waitlistCount: currentCount + 1 };
}

export interface ClaimSpotResult {
  ok: boolean;
  error?: string;
  claimedCount: number;
}

/** Admin-only, triggered manually once an out-of-band (e.g. Zelle) payment is confirmed —
 *  the manual counterpart to the self-serve Stripe flow below. Looks the target reader up by
 *  their sign-in email or PT license number, since that's what an admin actually has on hand
 *  from a payment memo, not a raw user id. Also flips isPro so "Lifetime Access" (the first
 *  founding benefit) is real immediately, not just a listing in the grid. */
export async function claimFoundingSpotAction(input: {
  identifier: string;
  displayName: string;
  credential?: string;
}): Promise<ClaimSpotResult> {
  const currentCount = await prisma.foundingFunder.count({ where: { paymentStatus: { in: ["confirmed", "pending"] } } });

  if (!(await isSiteAdmin())) {
    return { ok: false, error: "Not authorized.", claimedCount: currentCount };
  }

  const identifier = input.identifier.trim();
  const displayName = input.displayName.trim();
  if (!identifier || !displayName) {
    return { ok: false, error: "Enter both the reader's email/license # and a display name.", claimedCount: currentCount };
  }
  if (currentCount >= FOUNDING_FUNDERS_TOTAL_SLOTS) {
    return { ok: false, error: "All 25 spots are already claimed.", claimedCount: currentCount };
  }

  // SQLite's Prisma provider has no `mode: "insensitive"` filter (Postgres/Mongo-only), so
  // this lowercases the email side itself — sign-in already stores email lowercased (see
  // lib/session.ts signInWithPassword), licenseEmail doesn't, hence the OR against both cases.
  const lower = identifier.toLowerCase();
  const target = await prisma.user.findFirst({
    where: {
      OR: [{ email: lower }, { licenseEmail: identifier }, { licenseEmail: lower }, { licenseNumber: identifier }],
    },
  });
  if (!target) {
    return { ok: false, error: "No account found for that email or license number.", claimedCount: currentCount };
  }

  const existing = await prisma.foundingFunder.findUnique({ where: { userId: target.id } });
  if (existing) {
    return { ok: false, error: "That reader already has a founding spot.", claimedCount: currentCount };
  }

  await prisma.$transaction([
    prisma.foundingFunder.create({
      data: {
        userId: target.id,
        displayName,
        credential: input.credential?.trim() || null,
        confirmed: true,
        paymentStatus: "confirmed",
        confirmedAt: new Date(),
        foundingFunderNumber: await nextFoundingFunderNumber(),
      },
    }),
    prisma.user.update({ where: { id: target.id }, data: { isPro: true } }),
  ]);

  revalidatePath("/founding-funders");
  return { ok: true, claimedCount: currentCount + 1 };
}

export interface CreateFoundingFunderCheckoutResult {
  ok: boolean;
  url?: string;
  error?: string;
}

/** The self-serve $40 one-time Founding Funder purchase — triggered from the "Pay $40 with
 *  Stripe" button in ClaimSpotModal (see components/founding-funders/ClaimSpotButton.tsx).
 *  Unlike subscribeToProAction/etc. in app/actions/pro.ts, this doesn't redirect() itself:
 *  the caller is a Client Component that needs to show its own "Processing..." loading state
 *  before navigating, so this just returns the Checkout Session URL for the caller to send
 *  the browser to. No Limbic account is required — the FoundingFunder row this creates has
 *  no userId, matching the page's own "a signed-out visitor can claim a spot" model. */
export async function createFoundingFunderCheckout(input: {
  displayName: string;
  credential?: string;
}): Promise<CreateFoundingFunderCheckoutResult> {
  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "Enter your display name." };
  }

  if (!stripeEnabled()) {
    console.error("[founding-funders] checkout blocked: STRIPE_SECRET_KEY is not set in this environment.");
    return { ok: false, error: "Payments aren't set up yet, check back soon." };
  }

  // TODO: Create one-time $40 Founding Funder product in Stripe dashboard
  // Product name: Limbic Founding Funder
  // Price: $40 one-time
  // Add price ID to STRIPE_FOUNDING_FUNDER_PRICE_ID in .env and Vercel
  const priceId = process.env.STRIPE_FOUNDING_FUNDER_PRICE_ID;
  if (!priceId) {
    console.error("[founding-funders] checkout blocked: STRIPE_FOUNDING_FUNDER_PRICE_ID is not set in this environment.");
    return { ok: false, error: "Payments aren't set up yet, check back soon." };
  }

  const [confirmedCount, pendingCount] = await Promise.all([
    prisma.foundingFunder.count({ where: { paymentStatus: "confirmed" } }),
    prisma.foundingFunder.count({ where: { paymentStatus: "pending" } }),
  ]);
  if (confirmedCount + pendingCount >= FOUNDING_FUNDERS_TOTAL_SLOTS) {
    return { ok: false, error: "No spots remaining." };
  }

  const credential = input.credential?.trim() || null;
  const record = await prisma.foundingFunder.create({
    data: { displayName, credential, paymentStatus: "pending" },
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Fixed production URLs (not derived from the request's own origin like
      // app/actions/pro.ts's appOrigin() helper) — checkout should always land back on the
      // real domain regardless of where it was started from. cancel_url additionally carries
      // session_id, beyond what the spec's plain "?canceled=true" describes, since without it
      // the success/cancel page below would have no way to know *which* pending record to
      // clean up.
      success_url: "https://limbic.center/founding-funders?success=true&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://limbic.center/founding-funders?canceled=true&session_id={CHECKOUT_SESSION_ID}",
      metadata: { foundingFunderId: record.id, displayName, round: "1" },
      customer_creation: "if_required",
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    await prisma.foundingFunder.update({ where: { id: record.id }, data: { stripeSessionId: session.id } });
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[founding-funders] checkout creation failed:", err);
    await prisma.foundingFunder.delete({ where: { id: record.id } }).catch(() => {});
    return { ok: false, error: "Something went wrong starting checkout. Try again." };
  }
}

/** Backup confirmation for the success banner (see founding-funders/page.tsx) — the
 *  checkout.session.completed webhook (app/api/stripe/webhook/route.ts) is the primary path
 *  that flips paymentStatus to "confirmed", but webhook delivery can lag behind the browser
 *  redirect back from Stripe, so the success page itself re-checks the session directly and
 *  confirms right away if the webhook hasn't landed yet. A no-op if the record is already
 *  confirmed (whichever path got there first wins; this never un-confirms anything). */
export async function confirmFoundingFunderPaymentIfNeeded(sessionId: string): Promise<void> {
  if (!stripeEnabled() || !sessionId) return;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const foundingFunderId = session.metadata?.foundingFunderId;
    if (!foundingFunderId || session.payment_status !== "paid") return;

    const record = await prisma.foundingFunder.findUnique({ where: { id: foundingFunderId } });
    if (!record || record.paymentStatus === "confirmed") return;

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
  } catch (err) {
    console.error("[founding-funders] backup session confirmation failed:", err);
  }
}

/** Cleans up the pending FoundingFunder row for a checkout the visitor backed out of (the
 *  cancel banner on founding-funders/page.tsx) — otherwise an abandoned checkout would sit
 *  around as "pending" forever, counting against the 25-spot cap for no reason. Deliberately
 *  scoped to `paymentStatus: "pending"` in the delete filter: if payment somehow already
 *  went through (a slow browser redirect after a fast webhook, say), this is a no-op rather
 *  than deleting a real confirmed spot. */
export async function cleanupCanceledFoundingFunderCheckout(sessionId: string): Promise<void> {
  if (!stripeEnabled() || !sessionId) return;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const foundingFunderId = session.metadata?.foundingFunderId;
    if (!foundingFunderId) return;
    await prisma.foundingFunder.deleteMany({ where: { id: foundingFunderId, paymentStatus: "pending" } });
  } catch (err) {
    console.error("[founding-funders] cleanup of canceled checkout failed:", err);
  }
}

/** Admin-only manual override for FoundingFundersRoster (see /founding-funders' admin
 *  section) — for when a payment actually went through but the webhook never fired (or fired
 *  before STRIPE_WEBHOOK_SECRET was configured, etc). Same effect as the webhook/backup-check
 *  paths, just admin-triggered instead of Stripe-triggered. */
export async function confirmFoundingFunderPaymentAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const record = await prisma.foundingFunder.findUnique({ where: { id } });
  if (!record) return { ok: false, error: "That claim no longer exists." };
  // Already confirmed — a no-op (rather than re-confirming) is what keeps a repeated click
  // from handing out a second foundingFunderNumber for the same row.
  if (record.paymentStatus === "confirmed") return { ok: true };

  await prisma.foundingFunder.update({
    where: { id },
    data: {
      paymentStatus: "confirmed",
      confirmed: true,
      confirmedAt: new Date(),
      foundingFunderNumber: await nextFoundingFunderNumber(),
    },
  });
  revalidatePath("/founding-funders");
  return { ok: true };
}

/** Admin-only — deletes a FoundingFunder row outright (typically a stale pending claim that
 *  never completed payment), reopening that spot for someone else. */
export async function removeFoundingFunderAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  await prisma.foundingFunder.delete({ where: { id } });
  revalidatePath("/founding-funders");
  return { ok: true };
}
