"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Ends the one-time guided tour (see components/LimbicTour.tsx) for both finishing the
 *  last step and clicking "Skip tour" — same "either way, don't show it again" shape as
 *  completeOnboardingAction's Continue/Skip for the topic picker. */
export async function completeTour() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: user.id },
    data: { hasCompletedTour: true, tourCompletedAt: new Date() },
  });
  revalidatePath("/", "layout");
  return { success: true };
}

/** "Replay Tour" on Profile (see components/ReplayTourButton.tsx) — clears the gate so
 *  Home renders the tour again on the next load. */
export async function resetTour() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: user.id },
    data: { hasCompletedTour: false, tourCompletedAt: null },
  });
  revalidatePath("/", "layout");
  return { success: true };
}
