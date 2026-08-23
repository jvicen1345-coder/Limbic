import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { nameFromEmail } from "@/lib/meta";
import { hashPassword, verifyPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
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

/** The three paid tiers a site admin can comp for a specific account without that account
 *  paying — see User.compedAccess in schema.prisma, the "Granted Access" controls on
 *  /admin/accounts (grantAccessAction/revokeAccessAction in app/actions/admin.ts), and the
 *  overlay in getCurrentUser() below. */
export type GrantArea = "pro" | "limbicStudent" | "wellnessPlus";
const GRANT_AREAS: GrantArea[] = ["pro", "limbicStudent", "wellnessPlus"];

/** Parses User.compedAccess (a JSON column, so untyped at the DB layer) back into a clean
 *  GrantArea[], silently dropping anything that isn't one of the three known areas — same
 *  defensive parsing as this app's other JSON columns (e.g. followedTopics). */
export function compedAreas(user: { compedAccess: unknown }): GrantArea[] {
  const raw = user.compedAccess;
  if (!Array.isArray(raw)) return [];
  return raw.filter((a): a is GrantArea => GRANT_AREAS.includes(a as GrantArea));
}

/** Whether `user` has this specific area for free — as a site admin (every area, always) or
 *  because another admin comped just this one area for their account (see compedAreas
 *  above) — rather than through real billing. Membership pages (see /profile/membership,
 *  /wellness/membership) use this to swap the normal "manage/cancel" card for a plain
 *  "granted, nothing to cancel" message, since there's no real Stripe subscription behind
 *  either kind of free access for openBillingPortal (app/actions/pro.ts) to manage. */
export function hasFreeAccess(user: { email: string | null; licenseEmail: string | null; compedAccess: unknown }, area: GrantArea): boolean {
  return isAdminEmail(user.email) || isAdminEmail(user.licenseEmail) || compedAreas(user).includes(area);
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
 *  An admin's own per-user grant (see User.compedAccess, compedAreas above) gets the same
 *  overlay treatment for the same reason: a comped reader's real isPro/studentTier/
 *  isWellnessPlus columns, and anything the Stripe webhook does with them, should stay
 *  exactly what they'd be without the grant. The parallel identity-based gates (Boards, the
 *  Student Atrium, etc. — see hasStudentAccess below) aren't fields on this object, so
 *  they're handled separately. */
export async function getCurrentUser(): Promise<User | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const admin = isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
  const comped = compedAreas(user);
  if (!admin && comped.length === 0) return user;

  return {
    ...user,
    isPro: user.isPro || admin || comped.includes("pro"),
    studentTier: admin || comped.includes("limbicStudent") ? "limbicStudent" : user.studentTier,
    isWellnessPlus: user.isWellnessPlus || admin || comped.includes("wellnessPlus"),
  };
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
 *  account" (see isStudentEmail above), an admin account — or an account an admin comped
 *  "limbicStudent" for (see compedAreas above) — should get through too — same "gets every
 *  feature" reasoning as the isPro/studentTier/isWellnessPlus overlay in getCurrentUser()
 *  above, just handled explicitly here since email-suffix identity isn't a field
 *  getCurrentUser() can quietly override without corrupting the account's real sign-in
 *  email. */
export function hasStudentAccess(user: { email: string | null; licenseEmail: string | null; compedAccess: unknown }): boolean {
  return (
    isStudentEmail(user.email) ||
    isAdminEmail(user.email) ||
    isAdminEmail(user.licenseEmail) ||
    compedAreas(user).includes("limbicStudent")
  );
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

/** Clinical Calculators, Decision Rules, Red Flag Screening, Special Tests, Lab Values,
 *  Medications, and Guidelines are useful clinical-knowledge references for a PT student to
 *  learn from too, not just a paying PRO clinician — so these seven specifically (not the
 *  rest of the LimbicPRO toolbox: Documentation, CE Tracker, the HEP Builder, which are
 *  about running a real practice rather than learning the material) also open up to any
 *  hasStudentAccess() account. Real LimbicPRO members are unaffected — this only widens who
 *  else gets through, never narrows the existing isPro check. */
export function hasClinicalReferenceAccess(user: { isPro: boolean; email: string | null; licenseEmail: string | null; compedAccess: unknown }): boolean {
  return user.isPro || hasStudentAccess(user);
}

/** Signs the caller directly into `userId` with no credential check — used only right after
 *  a password reset actually succeeds (see resetPasswordAction in app/actions/auth.ts),
 *  where possessing the emailed single-use token already proved ownership of the account. */
export async function signInAsUserId(userId: string) {
  await issueSessionCookie(userId);
}

/** Shared by signInWithPassword/signUpWithPassword/signInWithGoogle below: issues the
 *  session cookie, and — when the match was via backupEmail rather than the primary email —
 *  sets the one-time "signed in with backup email" flag the Home banner reads. */
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

export type SignInResult =
  | { ok: true }
  | {
      ok: false;
      /** "needsPassword": a real account exists but predates User.passwordHash (every
       *  account created under the old "type any email, you're in" flow) — the sign-in
       *  form routes this to the same password-reset request as "Forgot password?" rather
       *  than a separate migration flow. "invalid": wrong password, OR no account at all —
       *  folded into one reason (not "no account found") so a failed attempt can't be used
       *  to enumerate which emails are registered. */
      reason: "needsPassword" | "invalid";
    };

/**
 * Real password sign-in — replaces the old signInWithEmail, which signed into (or silently
 * created) an account for *any* typed email with no password at all; "Demo sign-in, any
 * email works" was the literal sign-in page copy. Matches against email, backupEmail (see
 * the "Account Security" section on Profile — lets a graduated student whose .edu address
 * stopped working sign back in with the personal email they added ahead of time), and
 * licenseEmail (a pre-existing account created back when sign-in collected a license
 * number/email — its `email` column was never set, only `licenseEmail`).
 */
export async function signInWithPassword(input: { email: string; password: string }): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();
  const existing = email
    ? await prisma.user.findFirst({ where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] } })
    : null;
  if (!existing) return { ok: false, reason: "invalid" };
  if (!existing.passwordHash) return { ok: false, reason: "needsPassword" };

  const valid = await verifyPassword(input.password, existing.passwordHash);
  if (!valid) return { ok: false, reason: "invalid" };

  await signInToUserRecord(existing, existing.email !== email && existing.backupEmail === email);
  return { ok: true };
}

/** "Continue as guest" — creates a fresh, empty account (isGuest: true, no email or
 *  password) and signs straight into it. Rate-limited by IP at the call site (see
 *  guestSignInAction in app/actions/auth.ts, lib/guest-rate-limit.ts), not here, so this
 *  stays a plain "mint one and sign in" helper. `name` is required by that same caller (the
 *  Guest tab's input won't submit blank — see SignInForm.tsx) so every guest is
 *  identifiable on the admin Accounts page; the "Guest" fallback here is just a last-resort
 *  safety net against User.name's schema default (a placeholder clinician name meant for
 *  onboarding's "who am I" copy, not something that should show up unexplained), not a
 *  sanctioned way to skip naming a guest. */
export async function signInAsGuest(name: string) {
  const user = await prisma.user.create({
    data: { isGuest: true, hasOnboarded: false, hasCompletedOnboarding: false, name: name.trim() || "Guest" },
  });
  await issueSessionCookie(user.id);
}

export type SignUpResult = { ok: true } | { ok: false; reason: "exists" | "weakPassword" };

/** Creates a brand-new account with a real password — the only way to get a new Limbic
 *  account now that the old passwordless flow is gone. Rejects a duplicate against the same
 *  email/backupEmail/licenseEmail set signInWithPassword matches, so this can't create a
 *  second account for an address that already has one. */
export async function signUpWithPassword(input: { email: string; password: string }): Promise<SignUpResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, reason: "weakPassword" };
  if (input.password.length < MIN_PASSWORD_LENGTH) return { ok: false, reason: "weakPassword" };

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] } });
  if (existing) return { ok: false, reason: "exists" };

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email, name: nameFromEmail(email), hasOnboarded: false, hasCompletedOnboarding: false, passwordHash },
  });
  await signInToUserRecord(user, false);
  return { ok: true };
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
 * `sub` is Google's stable per-account ID — stamped onto User.googleId every time (not just
 * on first sign-in), so an account created another way that later links Google, or an
 * already-linked account signing in again, both end up with it recorded (see
 * app/(app)/admin/accounts, which reads it to show how an account actually authenticates).
 */
export async function signInWithGoogle(input: { email: string; name?: string | null; sub: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] } });
  if (existing) {
    if (existing.googleId !== input.sub) {
      await prisma.user.update({ where: { id: existing.id }, data: { googleId: input.sub } });
    }
    await signInToUserRecord(existing, existing.email !== email && existing.backupEmail === email);
    return;
  }
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || nameFromEmail(email),
      hasOnboarded: false,
      hasCompletedOnboarding: false,
      googleId: input.sub,
    },
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
