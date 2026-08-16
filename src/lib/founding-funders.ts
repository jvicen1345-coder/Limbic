import "server-only";
import { prisma } from "@/lib/db";

/**
 * The next Founding Funder number — the count of already-confirmed funders, plus one. Call
 * this only once per row, at the moment its paymentStatus first flips to "confirmed" (every
 * call site guards against re-confirming an already-confirmed row first — see the four
 * confirm paths in app/actions/founding-funders.ts and app/api/stripe/webhook/route.ts — so
 * this never double-counts a redelivered webhook or a repeated admin click). Not perfectly
 * atomic under two concurrent confirms racing each other, same trade-off as
 * lib/guest-rate-limit.ts — acceptable given the 25-spot cap this app enforces elsewhere.
 */
export async function nextFoundingFunderNumber(): Promise<number> {
  const count = await prisma.foundingFunder.count({ where: { paymentStatus: "confirmed" } });
  return count + 1;
}

export interface FoundingFunderStatus {
  isFunder: boolean;
  number: number | null;
}

/**
 * Confirmed Founding Funder status for `userId` — a still-pending Stripe Checkout doesn't
 * count. Matched via FoundingFunder.userId, the only link between a Limbic account and its
 * purchase (a self-serve claim made before creating an account has no userId at all — see
 * createFoundingFunderCheckout in app/actions/founding-funders.ts).
 */
export async function getFoundingFunderStatus(userId: string): Promise<FoundingFunderStatus> {
  const record = await prisma.foundingFunder.findUnique({
    where: { userId },
    select: { paymentStatus: true, foundingFunderNumber: true },
  });
  if (!record || record.paymentStatus !== "confirmed") return { isFunder: false, number: null };
  return { isFunder: true, number: record.foundingFunderNumber };
}
