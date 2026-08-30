"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Ends the one-time "What's your name?" screen (see app/onboarding/name/page.tsx) — the
 *  very first gate a brand-new account hits (see app/(app)/layout.tsx), before the topic
 *  picker or the role modal. Both fields are required (unlike completeOnboardingAction
 *  below, which has a "Skip for now" path) — the whole point of this screen is that a new
 *  account can't reach Home without a real first and last name on file, so there's no skip
 *  branch to add here. A blank field redirects back with an error query param, same
 *  no-JS-required convention as guestSignInAction in app/actions/auth.ts. Stored as a
 *  single "First Last" string in User.name, same shape every other part of the app already
 *  reads (see lib/meta.ts firstName()). */
export async function completeNameOnboardingAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  if (!first || !last) redirect("/onboarding/name?error=name_required");

  await prisma.user.update({ where: { id: user.id }, data: { name: `${first} ${last}`, hasSetName: true } });
  revalidatePath("/", "layout");
  redirect("/home");
}

/** Ends the one-time onboarding screen (see app/onboarding/page.tsx) for both "Continue"
 *  and "Skip for now" — the topic chips shown there already persist themselves
 *  individually via toggleTopicAction on click, so this only needs to flip the gate and
 *  send the reader on to Home, whether or not they picked anything. */
export async function completeOnboardingAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  await prisma.user.update({ where: { id: user.id }, data: { hasOnboarded: true } });
  revalidatePath("/", "layout");
  redirect("/home");
}
