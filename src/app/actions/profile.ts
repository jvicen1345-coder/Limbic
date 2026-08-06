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

// Same runtime-whitelist reasoning as EDITABLE_FIELDS above — see components/
// ProfessionalDatesForm.tsx (the Profile "Professional Dates" section) and
// components/LimbicCalendarWidget.tsx (reads these back out for the orange dots).
const PROFESSIONAL_DATE_FIELDS = [
  "npteExamDate",
  "ceuDeadline",
  "licenseExpiration",
  "certificationExpiry",
  "rotationStartDate",
  "rotationEndDate",
  "graduationDate",
  "practiceStartDate",
] as const;
type ProfessionalDateField = (typeof PROFESSIONAL_DATE_FIELDS)[number];

/** `value` is whatever an `<input type="date">` hands back onChange: "YYYY-MM-DD", or ""
 *  when the reader clears the field — which this treats as "unset" (null) rather than
 *  rejecting the change. */
export async function updateProfessionalDates(field: ProfessionalDateField, value: string) {
  const user = await getCurrentUser();
  if (!user || !PROFESSIONAL_DATE_FIELDS.includes(field)) return;
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  await prisma.user.update({ where: { id: user.id }, data: { [field]: parsed } });
  revalidatePath("/", "layout");
}
