import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { nameFromEmail } from "@/lib/meta";
import type { User } from "@/generated/prisma/client";

const COOKIE_NAME = "pt_news_session";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Set for one sign-in only, when the match was via backupEmail rather than the primary
// email — drives the one-time "you signed in with your backup email" banner on Home (see
// app/(app)/page.tsx, app/actions/account-migration.ts). Read-only from a Server
// Component (cookies() can't be mutated during render); the banner's own Yes/Dismiss
// actions clear it explicitly, with this short maxAge as a natural fallback.
const BACKUP_SIGNIN_COOKIE = "pt_news_backup_signin";
const BACKUP_SIGNIN_COOKIE_MAX_AGE = 60 * 10;

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

/** Comma-separated sign-in emails allowed into every admin-only surface and, with the
 *  overlay below, every gated feature in the app — see lib/admin.ts isSiteAdmin, which
 *  delegates to isAdminEmail here rather than re-parsing this env var itself. Kept in this
 *  file (not lib/admin.ts) so getCurrentUser() can check it without importing lib/admin.ts,
 *  which itself imports getCurrentUser — that would be a circular import. */
function adminAllowlist(): string[] {
  return (process.env.FOUNDING_FUNDERS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether `email` is on the site-admin allowlist. Matched case-insensitively against
 *  either a General sign-in email or a PT license sign-in's email (see isSiteAdmin/
 *  hasStudentAccess below, and lib/admin.ts, which call this once per candidate email). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminAllowlist();
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase());
}

/** Reads the signed-in user (guest or licensed) from the session cookie, or null if signed
 *  out. Admin accounts (see isAdminEmail above) get every paid tier's access overlaid onto
 *  the object this returns — isPro/studentTier/isWellnessPlus — WITHOUT writing any of that
 *  to the database: the underlying row (and everything Stripe's webhook keeps in sync, see
 *  app/api/stripe/webhook/route.ts) stays whatever it really is, since real billing state
 *  should never quietly depend on who happens to be signed in as an admin at the time. This
 *  is why it lives here rather than as a scattered `|| isSiteAdmin` check at each of the
 *  dozen or so call sites that read these three fields — one overlay, applied once, that
 *  every existing and future isPro/studentTier/isWellnessPlus check benefits from for free.
 *  The parallel identity-based gates (Boards, the Student Atrium, etc. — see
 *  hasStudentAccess below) aren't fields on this object, so they're handled separately. */
export async function getCurrentUser(): Promise<User | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  if (isAdminEmail(user.email) || isAdminEmail(user.licenseEmail)) {
    return { ...user, isPro: true, studentTier: "limbicStudent", isWellnessPlus: true };
  }
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

/** Everywhere Limbic Boards/Daily Sharpening/the Student Atrium gate on "is this a student
 *  account" (see isStudentEmail above), an admin account should get through too — same
 *  "admin logins get every feature" reasoning as the isPro/studentTier/isWellnessPlus
 *  overlay in getCurrentUser() above, just handled explicitly here since email-suffix
 *  identity isn't a field getCurrentUser() can quietly override without corrupting the
 *  account's real sign-in email. */
export function hasStudentAccess(user: { email: string | null; licenseEmail: string | null }): boolean {
  return isStudentEmail(user.email) || isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
}

/** Everywhere clinician-only surfaces (HEP Builder, Retracted Articles, the sidebar's
 *  "Clinician tools" section) gate on "does this account have a real PT license on file"
 *  (see user.licenseNumber), an admin account should get through too — same reasoning as
 *  hasStudentAccess above, just for the clinician identity gate instead of the student one. */
export function hasLicenseAccess(user: {
  licenseNumber: string | null;
  email: string | null;
  licenseEmail: string | null;
}): boolean {
  return user.licenseNumber != null || isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
}

export async function signInAsGuest() {
  const user = await prisma.user.create({ data: { isGuest: true, hasOnboarded: false } });
  await issueSessionCookie(user.id);
}

/** Shared by signInWithEmail/signInWithGoogle below: issues the session cookie, and — when
 *  the match was via backupEmail rather than the primary email — sets the one-time
 *  "signed in with backup email" flag the Home banner reads. */
async function signInToUserRecord(user: User, viaBackupEmail: boolean) {
  await issueSessionCookie(user.id);
  const store = await cookies();
  if (viaBackupEmail) {
    store.set(BACKUP_SIGNIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: BACKUP_SIGNIN_COOKIE_MAX_AGE,
    });
  } else {
    store.delete(BACKUP_SIGNIN_COOKIE);
  }
}

/**
 * Sign-in: just an email, no license required — the only sign-in path now that license
 * number has moved to a post-signup verification flow (see app/actions/license.ts,
 * components/AddLicenseModal.tsx). Signing in again with the same email returns to the same
 * persisted profile/saved data, which is what makes this distinct from the anonymous,
 * one-off "Continue as guest" flow. Matches against backupEmail (see the "Account Security"
 * section on Profile — lets a graduated student whose .edu address stopped working sign
 * back in with the personal email they added ahead of time) and licenseEmail (a pre-
 * existing account created back when sign-in collected a license number/email — its `email`
 * column was never set, only `licenseEmail`, so without this an old PT account would get a
 * duplicate created instead of signing back into its real one).
 */
export async function signInWithEmail(input: { email: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    await signInAsGuest();
    return;
  }
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] } });
  if (existing) {
    await signInToUserRecord(existing, existing.email !== email && existing.backupEmail === email);
    return;
  }
  const user = await prisma.user.create({
    data: { email, name: nameFromEmail(email), hasOnboarded: false },
  });
  await signInToUserRecord(user, false);
}

/**
 * Google sign-in: matches by the verified email from the Google ID token (see
 * app/auth/google/callback/route.ts, which does the OAuth exchange and token verification
 * before calling this) against `email`, `backupEmail`, and `licenseEmail`, same reasoning
 * and pattern as signInWithEmail above — deliberately so, since it means a reader who
 * previously signed in with the email flow (or the old license flow, or added this address
 * as a backup email) lands back on that exact account via Google instead of getting a
 * duplicate one. `name` comes from Google's own `name` claim when present; falls back to
 * deriving one from the email address the same way signInWithEmail does when it's missing.
 */
export async function signInWithGoogle(input: { email: string; name?: string | null }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] } });
  if (existing) {
    await signInToUserRecord(existing, existing.email !== email && existing.backupEmail === email);
    return;
  }
  const user = await prisma.user.create({
    data: { email, name: input.name?.trim() || nameFromEmail(email), hasOnboarded: false },
  });
  await signInToUserRecord(user, false);
}

/** Read-only check for the one-time "signed in with backup email" banner (see
 *  app/(app)/page.tsx) — Server Components can't mutate cookies during render, so clearing
 *  this is left to clearBackupSigninFlag below, called from the banner's own Yes/Dismiss
 *  actions (see app/actions/account-migration.ts). */
export async function hasBackupSigninFlag(): Promise<boolean> {
  const store = await cookies();
  return store.get(BACKUP_SIGNIN_COOKIE)?.value === "1";
}

/** Clears the one-time "signed in with backup email" flag — called from a Server Action
 *  (Yes or Dismiss on the Home banner), never from a Server Component render. */
export async function clearBackupSigninFlag() {
  const store = await cookies();
  store.delete(BACKUP_SIGNIN_COOKIE);
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
