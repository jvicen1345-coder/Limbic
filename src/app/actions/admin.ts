"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser, signOutSession } from "@/lib/session";

// Excludes visually-ambiguous characters (0/O, 1/I/L) — this gets read off a screen and
// typed back in by hand, not copy-pasted through a script.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 10;

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return code;
}

export interface GenerateWipeCodeResult {
  ok: boolean;
  error?: string;
  code?: string;
}

/**
 * Admin-only — mints a fresh one-time wipe code, replacing whatever code (if any) existed
 * before (at most one is ever valid at a time). Returned in plaintext exactly once; nothing
 * else in this app ever displays or logs it again. See wipeAllUsersAction below for where
 * it's spent.
 */
export async function generateWipeCodeAction(): Promise<GenerateWipeCodeResult> {
  if (!(await isSiteAdmin())) return { ok: false, error: "Not authorized." };

  const code = generateCode();
  await prisma.$transaction([prisma.wipeCode.deleteMany({}), prisma.wipeCode.create({ data: { code } })]);
  return { ok: true, code };
}

export interface WipeAllUsersResult {
  ok: boolean;
  error?: string;
}

/**
 * Admin-only, permanent-slate reset — deletes every User row (and everything that
 * cascades off it: saved articles, reading/games/boards history, HEP programs, calendar
 * events, vitals, Nexus posts/likes/comments/connections/messages), every FoundingFunder
 * row, and the whole FoundingFunderWaitlist. Deliberately more total than a single
 * reader's own deleteAccountAction (app/actions/profile.ts) — that one preserves a
 * FoundingFunder listing on purpose (honoring the page's own "permanently" wording for a
 * reader who paid and is only deleting *their own* account); this one is for wiping test/
 * demo data before opening real signups, so there's no "someone already paid, keep their
 * listing" case to protect against — a genuine clean slate means clean.
 *
 * Gated on `code` matching the single live WipeCode row (see generateWipeCodeAction) —
 * being an admin and knowing the "WIPE ALL USERS" confirm phrase (checked client-side,
 * see components/founding-funders/WipeAllUsersPanel.tsx) isn't enough by itself. The code
 * is deleted the moment it's spent here, whether or not the wipe itself is what a caller
 * intended — there's no path back to a valid code without generating a new one.
 */
export async function wipeAllUsersAction(code: string): Promise<WipeAllUsersResult> {
  if (!(await isSiteAdmin())) {
    return { ok: false, error: "Not authorized." };
  }

  const trimmed = code.trim();
  const validCode = trimmed ? await prisma.wipeCode.findUnique({ where: { code: trimmed } }) : null;
  if (!validCode) {
    return { ok: false, error: "Invalid or already-used code. Generate a new one." };
  }

  await prisma.$transaction([
    prisma.wipeCode.delete({ where: { id: validCode.id } }),
    prisma.foundingFunderWaitlist.deleteMany({}),
    prisma.foundingFunder.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  await signOutSession();
  redirect("/sign-in?wiped=1");
}

export interface DeleteUserResult {
  ok: boolean;
  error?: string;
}

/**
 * Admin-only — deletes one account and everything that cascades off it in schema.prisma
 * (saved articles, reading/games/boards history, HEP programs, calendar events, vitals,
 * Nexus posts/likes/comments/connections/messages), same cascade wipeAllUsersAction relies
 * on for every account. Unlike that one, this leaves everyone else's data untouched — see
 * app/(app)/admin/accounts/page.tsx, the per-row "Delete" button this backs.
 *
 * Refuses to delete the admin's own account (redirects them to Profile's own
 * deleteAccountAction instead, which has its own "type DELETE" confirmation) — this list is
 * for cleaning up other accounts, and silently signing the admin themselves out mid-review
 * because they misclicked their own row would be a bad way to find that out.
 */
export async function deleteUserAction(userId: string): Promise<DeleteUserResult> {
  const admin = await getCurrentUser();
  if (!admin || !(await isSiteAdmin())) return { ok: false, error: "Not authorized." };
  if (userId === admin.id) return { ok: false, error: "Use Profile to delete your own account." };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  await prisma.$transaction([
    prisma.foundingFunderWaitlist.deleteMany({ where: { email: target.email ?? "" } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidatePath("/admin/accounts");
  return { ok: true };
}
