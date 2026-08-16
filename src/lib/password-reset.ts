import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Mints a fresh reset token for `userId` and returns the *raw* value to embed in the
 *  emailed link — only this return value ever sees the plaintext token; the row itself
 *  stores just its SHA-256 hash (see schema.prisma PasswordResetToken). Old unused tokens
 *  for this account are left alone rather than revoked: each is single-use and expires on
 *  its own, so a reader who clicks "resend" twice doesn't invalidate a link they already
 *  have open in another tab. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(TOKEN_BYTES).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return rawToken;
}

/** Spends `rawToken` if it's valid (exists, unused, unexpired) and returns the account it
 *  belongs to, or null otherwise — the caller (resetPasswordAction in app/actions/auth.ts)
 *  treats null as "that link is invalid or expired" without distinguishing which, so an
 *  attacker probing tokens learns nothing more than "no". Marking it used happens here,
 *  atomically with the validity check, so the same token can't be raced into two successful
 *  resets. */
export async function consumePasswordResetToken(rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) return null;

  const { count } = await prisma.passwordResetToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (count === 0) return null; // Lost a race with a concurrent consume of the same token.

  return record.userId;
}
