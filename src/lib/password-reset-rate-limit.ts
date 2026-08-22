import "server-only";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 3;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Per-email fixed-window password-reset-request limiter (see requestPasswordResetAction in
 * app/actions/auth.ts) — caps how many reset emails one address can trigger per hour,
 * regardless of whether that address actually has an account, so it can't be flooded with
 * reset emails by a script. Same shape as lib/sign-in-rate-limit.ts, but every request
 * counts (there's no separate "record a failure" step — requesting a reset always
 * increments, since even a request for a nonexistent address costs nothing to rate-limit
 * the same way).
 */
export async function isPasswordResetRateLimited(email: string): Promise<boolean> {
  const key = normalizeEmail(email);
  if (!key) return false;

  const existing = await prisma.passwordResetThrottle.findUnique({ where: { email: key } });
  if (!existing) return false;
  if (Date.now() - existing.windowStart.getTime() > WINDOW_MS) return false;
  return existing.count >= MAX_REQUESTS;
}

/** Records one password-reset request for `email` — starts a fresh window (count 1) if the
 *  previous one has expired, otherwise increments the current one. Call only after
 *  confirming isPasswordResetRateLimited above is false, so a request beyond the cap
 *  doesn't itself extend the window. */
export async function recordPasswordResetRequest(email: string): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;

  const now = new Date();
  const existing = await prisma.passwordResetThrottle.findUnique({ where: { email: key } });
  if (!existing || now.getTime() - existing.windowStart.getTime() > WINDOW_MS) {
    await prisma.passwordResetThrottle.upsert({
      where: { email: key },
      create: { email: key, windowStart: now, count: 1 },
      update: { windowStart: now, count: 1 },
    });
    return;
  }

  await prisma.passwordResetThrottle.update({ where: { email: key }, data: { count: { increment: 1 } } });
}
