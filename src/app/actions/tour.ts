"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findTour } from "@/lib/tours";

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

/** Records that a section tour was finished or skipped (see components/TourHost.tsx). Only
 *  ever a label in the picker — a section tour never starts on its own, so unlike
 *  hasCompletedTour above this gates nothing. The id is checked against the registry rather
 *  than stored as given: this is a client-callable endpoint, and an unbounded string array
 *  on a user row is not something to let anyone write to. */
export async function markTourSeen(tourId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  if (!findTour(tourId)) return { error: "Unknown tour" };

  const seen = Array.isArray(user.toursSeen) ? (user.toursSeen as unknown[]).filter((t): t is string => typeof t === "string") : [];
  if (seen.includes(tourId)) return { success: true };

  await prisma.user.update({
    where: { id: user.id },
    data: { toursSeen: [...seen, tourId] },
  });
  revalidatePath("/", "layout");
  return { success: true };
}
