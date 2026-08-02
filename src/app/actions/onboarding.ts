"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Ends the one-time onboarding screen (see app/onboarding/page.tsx) for both "Continue"
 *  and "Skip for now" — the topic chips shown there already persist themselves
 *  individually via toggleTopicAction on click, so this only needs to flip the gate and
 *  send the reader on to Home, whether or not they picked anything. */
export async function completeOnboardingAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  await prisma.user.update({ where: { id: user.id }, data: { hasOnboarded: true } });
  revalidatePath("/", "layout");
  redirect("/");
}
