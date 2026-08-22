import "server-only";
import { prisma } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Per-email fixed-window failed-sign-in-attempt limiter (see signInAction in
 * app/actions/auth.ts) — same shape as lib/guest-rate-limit.ts's per-IP one, keyed by email
 * instead so a locked-out address stays locked out even from a different network. Checked
 * before signInWithPassword runs at all, so a maxed-out email doesn't even reach the
 * password comparison. A stale window (last failure more than WINDOW_MS ago) doesn't count
 * against a fresh attempt — recordFailedSignIn below is what actually starts a new window.
 */
export async function isSignInRateLimited(email: string): Promise<boolean> {
  const key = normalizeEmail(email);
  if (!key) return false;

  const existing = await prisma.signInThrottle.findUnique({ where: { email: key } });
  if (!existing) return false;
  if (Date.now() - existing.windowStart.getTime() > WINDOW_MS) return false;
  return existing.count >= MAX_ATTEMPTS;
}

/** Records one failed sign-in attempt for `email` — starts a fresh window (count 1) if the
 *  previous one has expired, otherwise increments the current one. Called on every
 *  signInWithPassword failure, whether the reason was a wrong password or no account at
 *  all, so this can't be used to tell the two apart by how the counter behaves. */
export async function recordFailedSignIn(email: string): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;

  const now = new Date();
  const existing = await prisma.signInThrottle.findUnique({ where: { email: key } });
  if (!existing || now.getTime() - existing.windowStart.getTime() > WINDOW_MS) {
    await prisma.signInThrottle.upsert({
      where: { email: key },
      create: { email: key, windowStart: now, count: 1 },
      update: { windowStart: now, count: 1 },
    });
    return;
  }

  await prisma.signInThrottle.update({ where: { email: key }, data: { count: { increment: 1 } } });
}

/** Clears `email`'s failed-attempt count on a successful sign-in, so a reader who mistyped
 *  their password a few times before getting it right isn't left sitting near the limit. */
export async function clearSignInAttempts(email: string): Promise<void> {
  const key = normalizeEmail(email);
  if (!key) return;
  await prisma.signInThrottle.deleteMany({ where: { email: key } });
}
