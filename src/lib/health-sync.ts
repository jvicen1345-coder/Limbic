import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const TOKEN_BYTES = 32;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Mints a fresh Apple Health sync key for `userId`, replacing any existing one — see
 *  schema.prisma HealthSyncToken. Only this return value ever sees the plaintext key; the
 *  row itself stores just its SHA-256 hash, same pattern as lib/password-reset.ts. */
export async function createOrRotateHealthSyncToken(userId: string): Promise<string> {
  const rawToken = randomBytes(TOKEN_BYTES).toString("hex");
  await prisma.healthSyncToken.upsert({
    where: { userId },
    create: { userId, tokenHash: hashToken(rawToken) },
    update: { tokenHash: hashToken(rawToken), lastUsedAt: null },
  });
  return rawToken;
}

export async function revokeHealthSyncToken(userId: string): Promise<void> {
  await prisma.healthSyncToken.deleteMany({ where: { userId } });
}

/** Looks up the account a raw Apple Health sync key belongs to (see
 *  app/api/health-sync/route.ts), touching `lastUsedAt` so the settings page can show a
 *  real "last synced" time rather than just "a key exists". */
export async function verifyHealthSyncToken(rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.healthSyncToken.findUnique({ where: { tokenHash } });
  if (!record) return null;
  await prisma.healthSyncToken.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } });
  return record.userId;
}
