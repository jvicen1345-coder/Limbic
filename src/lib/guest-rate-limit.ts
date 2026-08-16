import "server-only";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * Fixed-window IP rate limit for "Continue as guest" (see guestSignInAction in
 * app/actions/auth.ts) — at most MAX_PER_WINDOW guest accounts per IP per WINDOW_MS, so a
 * script can't mint an unbounded number of throwaway accounts. Returns false (and leaves the
 * count untouched) once an IP is over the limit for its current window; otherwise records
 * the attempt and returns true. A stale window (last seen more than WINDOW_MS ago) resets
 * rather than accumulates.
 */
export async function consumeGuestSignupAllowance(ip: string): Promise<boolean> {
  const now = new Date();
  const existing = await prisma.guestSignupThrottle.findUnique({ where: { ip } });

  if (!existing || now.getTime() - existing.windowStart.getTime() > WINDOW_MS) {
    await prisma.guestSignupThrottle.upsert({
      where: { ip },
      create: { ip, windowStart: now, count: 1 },
      update: { windowStart: now, count: 1 },
    });
    return true;
  }

  if (existing.count >= MAX_PER_WINDOW) return false;

  await prisma.guestSignupThrottle.update({ where: { ip }, data: { count: { increment: 1 } } });
  return true;
}
