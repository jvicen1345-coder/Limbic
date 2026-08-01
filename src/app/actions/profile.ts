"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, clearSessionForAddLicense } from "@/lib/session";
import { redirect } from "next/navigation";

export async function updateProfileFieldAction(
  field: "name" | "specialty" | "practiceState" | "headline" | "bio",
  value: string
) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { [field]: value } });
  revalidatePath("/", "layout");
}

export async function toggleTopicAction(topic: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const current = (user.followedTopics as unknown as string[]) ?? [];
  const next = current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic];
  await prisma.user.update({ where: { id: user.id }, data: { followedTopics: next } });
  revalidatePath("/", "layout");
}

/** "Add license" from the guest profile screen — matches the prototype's behavior of
 *  sending the user back to the license sign-in form. */
export async function goAddLicenseAction() {
  await clearSessionForAddLicense();
  redirect("/sign-in");
}
