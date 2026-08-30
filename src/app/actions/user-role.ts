"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isUserRole } from "@/lib/user-role";

/** The onboarding role gate's Continue button (see components/OnboardingRoleModal.tsx,
 *  gated in app/(app)/layout.tsx) — the one-time "How are you using Limbic?" prompt every
 *  new account must resolve before reaching anything else in the app. Saves the role and
 *  flips the gate together, since there's no reason to ever set one without the other here. */
export async function completeRoleOnboardingAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const role = String(formData.get("role") ?? "");
  if (!isUserRole(role)) return;

  await prisma.user.update({ where: { id: user.id }, data: { userRole: role, hasCompletedOnboarding: true } });
  revalidatePath("/", "layout");
  redirect("/home");
}

/** Same save as completeRoleOnboardingAction above, minus the redirect — called from
 *  Step 2's "Continue to Limbic"/"Skip for now" (see components/OnboardingRoleModal.tsx),
 *  not Step 1's Continue, and deliberately not until then: this is what actually flips
 *  hasCompletedOnboarding, the flag app/(app)/layout.tsx branches the whole modal on, so
 *  setting it any earlier (while Step 2 still has its own selection UI to show) would have
 *  the very next revalidating action — setUserProgram, called when a search result is
 *  picked — auto-refresh straight past this modal to the real app before the reader ever
 *  sees "Continue to Limbic." The modal then does its own client-side router.push("/home")
 *  once this resolves, same as completeRoleOnboardingAction's redirect. */
export async function saveRoleWithoutRedirect(role: string): Promise<{ error: string } | { success: true }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  if (!isUserRole(role)) return { error: "Invalid role." };

  await prisma.user.update({ where: { id: user.id }, data: { userRole: role, hasCompletedOnboarding: true } });
  revalidatePath("/", "layout");
  return { success: true };
}

/** Profile's Role section (see components/UserRoleSection.tsx) — updates userRole alone.
 *  hasCompletedOnboarding is already true by the time this is reachable, since Profile
 *  itself sits behind the same onboarding gate as everything else in the app. */
export async function updateUserRoleAction(role: string) {
  const user = await getCurrentUser();
  if (!user || !isUserRole(role)) return;
  await prisma.user.update({ where: { id: user.id }, data: { userRole: role } });
  revalidatePath("/", "layout");
}
