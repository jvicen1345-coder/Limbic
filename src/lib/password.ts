import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export const MIN_PASSWORD_LENGTH = 8;

/** Node's built-in scrypt rather than a new dependency (bcrypt needs native bindings that
 *  can be a headache in serverless; bcryptjs/argon2 would just be one more package for
 *  something node:crypto already does well) — scrypt is deliberately slow/memory-hard,
 *  which is the actual point for password hashing (a fast hash like SHA-256 makes brute-
 *  forcing a leaked hash cheap). Stored as "saltHex:hashHex" in User.passwordHash so the
 *  salt travels with its own hash — never reused across accounts, never stored separately. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/** Constant-time comparison (timingSafeEqual) — a naive `===` on the derived key would leak
 *  how many leading bytes matched via response-time differences, in theory letting an
 *  attacker recover a hash (not the password itself, but enough to brute-force offline)
 *  byte by byte across enough attempts. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derivedKey = (await scryptAsync(password, salt, expected.length)) as Buffer;
  if (derivedKey.length !== expected.length) return false;
  return timingSafeEqual(derivedKey, expected);
}
