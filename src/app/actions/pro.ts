"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * Demo "purchase" — flips isPro on immediately, no real payment involved. This is the
 * intended seam for real billing later: swap this body for creating a Stripe Checkout
 * session (or similar) and let a webhook set isPro true on confirmed payment, instead of
 * doing it synchronously here. Nothing else in the app needs to change — every Pro gate
 * already reads user.isPro.
 */
export async function subscribeToProAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { isPro: true } });
  revalidatePath("/", "layout");
}

/** Demo cancellation — a real integration would instead cancel the subscription with the
 *  payment provider and let a webhook flip isPro off at the end of the billing period. */
export async function cancelProAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { isPro: false } });
  revalidatePath("/", "layout");
}
