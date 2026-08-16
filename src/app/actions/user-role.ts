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

/** Profile's Role section (see components/UserRoleSection.tsx) — updates userRole alone.
 *  hasCompletedOnboarding is already true by the time this is reachable, since Profile
 *  itself sits behind the same onboarding gate as everything else in the app. */
export async function updateUserRoleAction(role: string) {
  const user = await getCurrentUser();
  if (!user || !isUserRole(role)) return;
  await prisma.user.update({ where: { id: user.id }, data: { userRole: role } });
  revalidatePath("/", "layout");
}
