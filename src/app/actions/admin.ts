"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { signOutSession } from "@/lib/session";

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
 * No "type a phrase to confirm" check here — that's components/founding-funders/
 * WipeAllUsersPanel.tsx's job; this trusts it's only ever called after that confirmation,
 * same as every other action in this app trusting its caller did its own client-side
 * gating. The admin's own account is deleted too (it's a User row like any other), so this
 * always signs out and redirects — there's no session left to return to.
 */
export async function wipeAllUsersAction(): Promise<WipeAllUsersResult> {
  if (!(await isSiteAdmin())) {
    return { ok: false, error: "Not authorized." };
  }

  await prisma.$transaction([
    prisma.foundingFunderWaitlist.deleteMany({}),
    prisma.foundingFunder.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  await signOutSession();
  redirect("/sign-in?wiped=1");
}
