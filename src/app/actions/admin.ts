"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin, hasAdminArea } from "@/lib/admin";
import { getCurrentUser, compedAreas, isAdminEmail, type GrantArea } from "@/lib/session";
import { ADMIN_AREAS, parseAdminAreas, type AdminArea } from "@/lib/admin-areas";

export interface DeleteUserResult {
  ok: boolean;
  error?: string;
}

/**
 * Accounts-area admins only (see lib/admin.ts hasAdminArea) — deletes one account and everything
 * that cascades off it in schema.prisma (saved articles, reading/games/boards history, HEP
 * programs, calendar events, vitals, Nexus posts/likes/comments/connections/messages), leaving
 * everyone else's data untouched — see app/(app)/admin/accounts/page.tsx, the per-row "Delete"
 * button this backs.
 *
 * Refuses to delete the admin's own account (redirects them to Profile's own
 * deleteAccountAction instead, which has its own "type DELETE" confirmation) — this list is
 * for cleaning up other accounts, and silently signing the admin themselves out mid-review
 * because they misclicked their own row would be a bad way to find that out.
 */
export async function deleteUserAction(userId: string): Promise<DeleteUserResult> {
  const admin = await getCurrentUser();
  if (!admin || !(await hasAdminArea("accounts"))) return { ok: false, error: "Not authorized." };
  if (userId === admin.id) return { ok: false, error: "Use Profile to delete your own account." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "That account no longer exists." };
  // A co-admin holding the Accounts area can delete accounts — but not the accounts that
  // hand out admin access in the first place. Deleting an owner's row wouldn't promote
  // anyone (the allowlist is an env var, and that email can just sign up again), but it
  // would lock the person who appointed them out of their own history, and no delegated
  // area should reach that far. Owners can still delete each other.
  const targetIsOwner = isAdminEmail(target.email) || isAdminEmail(target.licenseEmail);
  if (targetIsOwner && !(await isSiteAdmin())) {
    return { ok: false, error: "Only a full admin can delete a full admin's account." };
  }

  await prisma.$transaction([
    prisma.foundingFunderWaitlist.deleteMany({ where: { email: target.email ?? "" } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidatePath("/admin/accounts");
  return { ok: true };
}

export interface GrantAccessResult {
  ok: boolean;
  error?: string;
}

/**
 * Accounts-area admins only (see lib/admin.ts hasAdminArea) — comps `area` (LimbicPro,
 * LimbicStudent, or LimbicWellness+) for one account for free, without touching that account's real
 * isPro/studentTier/isWellnessPlus columns or anything Stripe's webhook keeps in sync with them
 * (see User.compedAccess in schema.prisma and the overlay in lib/session.ts getCurrentUser()) — see
 * the "Granted Access" controls on /admin/accounts (AccountsAdminTable.tsx), the button this backs.
 */
export async function grantAccessAction(userId: string, area: GrantArea): Promise<GrantAccessResult> {
  if (!(await hasAdminArea("accounts"))) return { ok: false, error: "Not authorized." };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { compedAccess: true } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  const current = compedAreas(target);
  if (!current.includes(area)) {
    await prisma.user.update({ where: { id: userId }, data: { compedAccess: [...current, area] } });
  }

  revalidatePath("/admin/accounts");
  return { ok: true };
}

/** The revoke half of grantAccessAction above — removes just `area` from this account's
 *  grants, leaving any other comped areas (and its real billing state) untouched. */
export async function revokeAccessAction(userId: string, area: GrantArea): Promise<GrantAccessResult> {
  if (!(await hasAdminArea("accounts"))) return { ok: false, error: "Not authorized." };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { compedAccess: true } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  const current = compedAreas(target);
  if (current.includes(area)) {
    await prisma.user.update({ where: { id: userId }, data: { compedAccess: current.filter((a) => a !== area) } });
  }

  revalidatePath("/admin/accounts");
  return { ok: true };
}

export interface AdminAreaResult {
  ok: boolean;
  error?: string;
  /** The account's areas after the change, so the caller can render from the server's answer
   *  rather than from its own optimistic guess (see the Co-Admin cell in
   *  components/AccountsAdminTable.tsx). Present only when ok. */
  areas?: AdminArea[];
}

/**
 * Owner-only — the two functions below are what make co-admins possible, and the only two
 * places in the app that write User.adminAreas.
 *
 * They gate on isSiteAdmin() (the FOUNDING_FUNDERS_ADMIN_EMAILS allowlist) rather than on
 * hasAdminArea("accounts") like everything else in this file, and that difference is the
 * whole security model: an admin area is data an admin could otherwise grant themselves, so
 * the ability to hand one out has to live with an identity that no amount of database access
 * can forge. A co-admin with the Accounts area can delete accounts and comp subscriptions —
 * but they cannot appoint another admin, and they cannot widen their own access.
 *
 * That also means an owner can always take access back: revoking is the same allowlist
 * identity acting on the same column, and it takes effect on the co-admin's very next
 * request, since every gate reads adminAreas fresh through getCurrentUser() (request-cached
 * only, see lib/session.ts) rather than from anything baked into their session cookie.
 */
async function requireOwnerForTarget(userId: string): Promise<{ error?: string; current?: AdminArea[] }> {
  if (!(await isSiteAdmin())) return { error: "Only a full admin can change co-admin access." };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { adminAreas: true, isGuest: true, email: true, licenseEmail: true },
  });
  if (!target) return { error: "That account no longer exists." };
  // A guest is an unauthenticated throwaway session (see User.isGuest in schema.prisma), not
  // a person who can be held responsible for an admin area — and the row is liable to be
  // cleaned up out from under the grant besides.
  if (target.isGuest) return { error: "Guest accounts can't be given admin access." };
  // Nothing to store for an owner: they hold every area through the env allowlist already,
  // and a row of half-checked chips next to that would read like the allowlist had been
  // narrowed when it hadn't. Refusing says so out loud instead.
  if (isAdminEmail(target.email) || isAdminEmail(target.licenseEmail)) {
    return { error: "That account is already a full admin through the environment allowlist." };
  }

  return { current: parseAdminAreas(target.adminAreas) };
}

/** Owner-only — gives one account one admin area (see requireOwnerForTarget above for why
 *  this is owner-only rather than accounts-admin-only). Idempotent: granting an area the
 *  account already holds is a no-op that still reports the current set. */
export async function grantAdminAreaAction(userId: string, area: AdminArea): Promise<AdminAreaResult> {
  // `area` arrives from a client component, so it is only AdminArea by declaration until
  // this line checks it (see lib/admin-areas.ts).
  if (!ADMIN_AREAS.includes(area)) return { ok: false, error: "Unknown admin area." };

  const { error, current } = await requireOwnerForTarget(userId);
  if (error || !current) return { ok: false, error };

  const next = current.includes(area) ? current : [...current, area];
  if (!current.includes(area)) {
    await prisma.user.update({ where: { id: userId }, data: { adminAreas: next } });
  }

  revalidatePath("/admin/accounts");
  return { ok: true, areas: next };
}

/** The revoke half of grantAdminAreaAction — takes back just `area`, leaving the account's
 *  other areas (and everything else about it) alone. Removing the last area leaves an
 *  ordinary account with no admin surface at all, which is the intended way to un-appoint
 *  someone; there is no separate "delete co-admin" concept to get out of sync. */
export async function revokeAdminAreaAction(userId: string, area: AdminArea): Promise<AdminAreaResult> {
  // `area` arrives from a client component, so it is only AdminArea by declaration until
  // this line checks it (see lib/admin-areas.ts).
  if (!ADMIN_AREAS.includes(area)) return { ok: false, error: "Unknown admin area." };

  const { error, current } = await requireOwnerForTarget(userId);
  if (error || !current) return { ok: false, error };

  const next = current.filter((a) => a !== area);
  if (next.length !== current.length) {
    await prisma.user.update({ where: { id: userId }, data: { adminAreas: next } });
  }

  revalidatePath("/admin/accounts");
  return { ok: true, areas: next };
}
