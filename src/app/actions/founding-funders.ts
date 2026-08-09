"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { FOUNDING_FUNDERS_TOTAL_SLOTS } from "@/lib/founding-funders-config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FoundingFundersData {
  claimedCount: number;
  totalSlots: number;
  waitlistCount: number;
  /** Ordered by claim date, oldest (spot #1) first — see FoundingSlotsGrid. */
  funders: { displayName: string; credential: string | null }[];
}

/** Called from the /founding-funders page itself (server-rendered) and re-called by
 *  WaitlistForm after a successful join so the "X of 25 claimed" / waitlist counts on
 *  screen reflect the database without a full page reload. */
export async function getFoundingFundersData(): Promise<FoundingFundersData> {
  const [claimedCount, waitlistCount, funders] = await Promise.all([
    prisma.foundingFunder.count({ where: { confirmed: true } }),
    prisma.foundingFunderWaitlist.count(),
    prisma.foundingFunder.findMany({
      where: { confirmed: true },
      orderBy: { claimedAt: "asc" },
      select: { displayName: true, credential: true },
    }),
  ]);
  return { claimedCount, totalSlots: FOUNDING_FUNDERS_TOTAL_SLOTS, waitlistCount, funders };
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

/** Admin-only, triggered manually once a $40 Zelle payment is confirmed (see Section 5 of
 *  /founding-funders) — no self-serve payment flow exists yet. Looks the target reader up
 *  by their sign-in email or PT license number, since that's what an admin actually has on
 *  hand from the Zelle memo, not a raw user id. Also flips isPro so "Lifetime Access" (the
 *  first founding benefit) is real immediately, not just a listing in the grid. */
export async function claimFoundingSpotAction(input: {
  identifier: string;
  displayName: string;
  credential?: string;
}): Promise<ClaimSpotResult> {
  const currentCount = await prisma.foundingFunder.count({ where: { confirmed: true } });

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
  // lib/session.ts signInWithEmail), licenseEmail doesn't, hence the OR against both cases.
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
      },
    }),
    prisma.user.update({ where: { id: target.id }, data: { isPro: true } }),
  ]);

  revalidatePath("/founding-funders");
  return { ok: true, claimedCount: currentCount + 1 };
}
