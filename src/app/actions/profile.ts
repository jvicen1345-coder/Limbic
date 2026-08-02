"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, clearSessionForAddLicense } from "@/lib/session";
import { redirect } from "next/navigation";

// A Server Action is callable as its own HTTP endpoint independent of which component
// imported it — the parameter's union type only constrains callers going through the
// compiled client wrapper, not a request built directly against the deployed action. This
// runtime whitelist is what actually stops `field` from being an arbitrary User column.
const EDITABLE_FIELDS = ["name", "specialty", "practiceState", "headline", "bio"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

export async function updateProfileFieldAction(field: EditableField, value: string) {
  const user = await getCurrentUser();
  if (!user || !EDITABLE_FIELDS.includes(field)) return;
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

/** Toggles one Home sidebar widget's visibility (see components/HomeFeed.tsx
 *  HOME_WIDGETS) — stored as which ones are *hidden*, not which are shown, so the default
 *  empty array means "show everything", matching every account's behavior before this
 *  preference existed. */
export async function toggleHomeWidgetAction(widgetId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  const current = (user.hiddenHomeWidgets as unknown as string[]) ?? [];
  const next = current.includes(widgetId) ? current.filter((w) => w !== widgetId) : [...current, widgetId];
  await prisma.user.update({ where: { id: user.id }, data: { hiddenHomeWidgets: next } });
  revalidatePath("/", "layout");
}

/** "Add license" from the guest profile screen — matches the prototype's behavior of
 *  sending the user back to the license sign-in form. */
export async function goAddLicenseAction() {
  await clearSessionForAddLicense();
  redirect("/sign-in");
}
