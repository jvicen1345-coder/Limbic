import "server-only";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { nameFromEmail } from "@/lib/meta";
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
 * Any .edu email counts as a student account — matches how most PT programs actually issue
 * student addresses (school-specific subdomains included), rather than hardcoding a single
 * literal domain. Only the General (email) sign-in flow sets `email` at all — a PT license
 * sign-in leaves it null, so licensed PTs never qualify here regardless of licenseEmail.
 */
export function isStudentEmail(email: string | null | undefined): boolean {
  return !!email && /\.edu$/i.test(email.trim());
}

/**
 * Demo sign-in: any license number works, matching the prototype. Signing in again with the
 * same license number returns to the same persisted profile/saved data instead of creating a
 * new account each time. A blank submission gets its own fresh, unique account rather than a
 * shared fallback — otherwise every visitor who skips the field would land in the same row
 * and see each other's saved articles, HEP programs, and messages.
 */
export async function signInWithLicense(input: { number: string; state: string; email: string }) {
  const licenseNumber = input.number.trim() || `guest-pt-${randomUUID()}`;
  const user = await prisma.user.upsert({
    where: { licenseNumber },
    update: { licenseState: input.state, licenseEmail: input.email },
    create: {
      licenseNumber,
      licenseState: input.state,
      licenseEmail: input.email,
      licenseExpiration: new Date("2027-03-31"),
      ceCategories: DEFAULT_CE_CATEGORIES,
      hasOnboarded: false,
    },
  });
  await issueSessionCookie(user.id);
}

export async function signInAsGuest() {
  const user = await prisma.user.create({ data: { isGuest: true, hasOnboarded: false } });
  await issueSessionCookie(user.id);
}

/**
 * General (non-PT) sign-in: no license required, just an email. Signing in again with the
 * same email returns to the same persisted profile/saved data, same pattern as
 * signInWithLicense above — this is what makes it distinct from the anonymous, one-off
 * "Continue as guest" flow.
 */
export async function signInWithEmail(input: { email: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    await signInAsGuest();
    return;
  }
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: nameFromEmail(email), hasOnboarded: false },
  });
  await issueSessionCookie(user.id);
}

/**
 * Google sign-in: upserts by the verified email from the Google ID token (see
 * app/auth/google/callback/route.ts, which does the OAuth exchange and token verification
 * before calling this). Same upsert-by-email pattern as signInWithEmail above — deliberately
 * so, since it means a reader who previously signed in with the General email flow using the
 * same address lands back on that exact account via Google instead of getting a duplicate
 * one. `name` comes from Google's own `name` claim when present; falls back to deriving one
 * from the email address the same way signInWithEmail does when it's missing.
 */
export async function signInWithGoogle(input: { email: string; name?: string | null }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: input.name?.trim() || nameFromEmail(email), hasOnboarded: false },
  });
  await issueSessionCookie(user.id);
}

/** Stamps "now" as the user's latest home-feed visit and returns the *previous* value —
 *  the cutoff the feed uses to badge articles published "since you were last here",
 *  captured before it's overwritten. */
export async function recordHomeVisit(user: User): Promise<Date | null> {
  const previous = user.lastVisitedAt;
  await prisma.user.update({ where: { id: user.id }, data: { lastVisitedAt: new Date() } });
  return previous;
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
