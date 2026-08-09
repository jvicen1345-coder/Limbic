"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, clearBackupSigninFlag } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Session-only — cleared on browser close, never touches the database, matching the spec's
// "session flag... not the database" for the migration-reminder banner (see
// app/(app)/page.tsx, components/HomeFeed.tsx). The backup-signin banner's own one-time
// flag is a separate cookie owned by lib/session.ts (issued at sign-in, not here).
const MIGRATION_BANNER_DISMISSED_COOKIE = "pt_news_migration_banner_dismissed";

/** Adds or replaces the signed-in reader's backup email (see the "Account Security" section
 *  on Profile) — a personal address they can still sign in with after their .edu email stops
 *  working post-graduation. */
export async function updateBackupEmail(rawEmail: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (user.email && email === user.email.toLowerCase()) {
    return { ok: false, error: "Your backup email must be different from your sign-in email." };
  }

  const inUse = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
      OR: [{ email }, { backupEmail: email }],
    },
    select: { id: true },
  });
  if (inUse) return { ok: false, error: "That email is already in use on another account." };

  await prisma.user.update({
    where: { id: user.id },
    data: { backupEmail: email, backupEmailAddedAt: new Date() },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** "Yes" on the "signed in with your backup email — make this your primary?" banner —
 *  swaps primary and backup email and marks the account migrated. */
export async function makePrimaryEmail(): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!user.backupEmail) return { ok: false, error: "No backup email on file." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.backupEmail,
      backupEmail: user.email,
      accountMigrated: true,
      migrationDate: new Date(),
    },
  });
  await clearBackupSigninFlag();
  revalidatePath("/", "layout");
  return { ok: true };
}

/** "Dismiss" on the "signed in with your backup email" banner — same one-time flag as Yes,
 *  just without the email swap. */
export async function dismissBackupSigninBanner() {
  await clearBackupSigninFlag();
  revalidatePath("/", "layout");
}

/** Dismisses the amber "add a backup email" migration-reminder banner for this session only
 *  — a cookie, not a database write, so it reappears next session per the spec. */
export async function dismissMigrationBanner() {
  const store = await cookies();
  store.set(MIGRATION_BANNER_DISMISSED_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // No maxAge — a session cookie, cleared when the browser closes.
  });
  revalidatePath("/", "layout");
}

/** Read-only check for the migration-reminder banner (see app/(app)/page.tsx). */
export async function hasMigrationBannerDismissed(): Promise<boolean> {
  const store = await cookies();
  return store.get(MIGRATION_BANNER_DISMISSED_COOKIE)?.value === "1";
}

/** "Maybe later" on the graduation-transition card — snoozes it for 7 days (see
 *  app/(app)/page.tsx, which re-shows it once graduationTransitionShownAt is more than 7
 *  days old). "Upgrade to New Grad PRO" is a plain link to /pro and has no server action of
 *  its own. */
export async function snoozeGraduationTransition() {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { graduationTransitionShownAt: new Date() } });
  revalidatePath("/", "layout");
}
