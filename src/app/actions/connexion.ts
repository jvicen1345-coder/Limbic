"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The Connexion Method certification waitlist count — read on /connexion and
 *  /connexion/safety-score (see ConnexionWaitlistForm) before any join happens, so both
 *  pages can show "X people are already waiting" without duplicating this query. */
export async function getConnexionWaitlistCount(): Promise<number> {
  return prisma.connexionWaitlist.count();
}

export interface JoinConnexionWaitlistResult {
  ok: boolean;
  error?: string;
  waitlistCount: number;
}

/** Same shape as joinWaitlistAction in app/actions/founding-funders.ts — collects an email
 *  into ConnexionWaitlist for the (not-yet-launched) Connexion Certified Provider program.
 *  Called from ConnexionWaitlistForm on both /connexion and /connexion/safety-score. */
export async function joinConnexionWaitlistAction(email: string): Promise<JoinConnexionWaitlistResult> {
  const trimmed = email.trim().toLowerCase();
  const currentCount = await prisma.connexionWaitlist.count();

  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address.", waitlistCount: currentCount };
  }

  const existing = await prisma.connexionWaitlist.findUnique({ where: { email: trimmed } });
  if (existing) {
    return { ok: false, error: "You're already on the list.", waitlistCount: currentCount };
  }

  await prisma.connexionWaitlist.create({ data: { email: trimmed } });
  revalidatePath("/connexion");
  revalidatePath("/connexion/safety-score");
  return { ok: true, waitlistCount: currentCount + 1 };
}
