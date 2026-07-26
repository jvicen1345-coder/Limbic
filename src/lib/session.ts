import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

const COOKIE_NAME = "pt_news_session";
const ONE_YEAR = 60 * 60 * 24 * 365;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

async function issueSessionCookie(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

async function readUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

const DEFAULT_CE_CATEGORIES = [
  { name: "Ethics & Jurisprudence", required: 3, completed: 3 },
  { name: "Direct Access", required: 2, completed: 2 },
  { name: "General / Elective", required: 19, completed: 9 },
];

/** Reads the signed-in user (guest or licensed) from the session cookie, or null if signed out. */
export async function getCurrentUser(): Promise<User | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

/**
 * Demo sign-in: any license number works, matching the prototype. Signing in again with the
 * same license number returns to the same persisted profile/saved data instead of creating a
 * new account each time.
 */
export async function signInWithLicense(input: { number: string; state: string; email: string }) {
  const licenseNumber = input.number.trim() || "PT-48213";
  const user = await prisma.user.upsert({
    where: { licenseNumber },
    update: { licenseState: input.state, licenseEmail: input.email },
    create: {
      licenseNumber,
      licenseState: input.state,
      licenseEmail: input.email,
      licenseExpiration: new Date("2027-03-31"),
      ceCategories: DEFAULT_CE_CATEGORIES,
    },
  });
  await issueSessionCookie(user.id);
}

export async function signInAsGuest() {
  const user = await prisma.user.create({ data: { isGuest: true } });
  await issueSessionCookie(user.id);
}

export async function signOutSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Guests can "add a license" from the profile screen, which is equivalent to signing back out
 *  to the license sign-in form (matches the prototype's `goAddLicense: () => this.signOut()`). */
export async function clearSessionForAddLicense() {
  await signOutSession();
}
