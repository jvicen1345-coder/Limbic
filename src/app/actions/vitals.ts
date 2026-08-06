"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { VITALS_CATEGORIES, type VitalsCategory } from "@/lib/vitals";

function isVitalsCategory(value: string): value is VitalsCategory {
  return (VITALS_CATEGORIES as readonly string[]).includes(value);
}

/** Body Metrics card's Save button (see components/vitals/BodyMetricsCard.tsx) — one row
 *  per user, upserted whole rather than field-by-field like Profile's professional dates,
 *  since every Vitals field saves together from one form rather than independently
 *  on-blur. All fields are optional (self-reported, general wellness only). */
export async function saveVitalsProfile(input: {
  age: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  weightLbs: number | null;
  biologicalSex: string | null;
  activityLevel: string | null;
  wellnessGoal: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.vitalsProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...input },
    update: input,
  });
  revalidatePath("/wellness/vitals");
  revalidatePath("/wellness");
  revalidatePath("/wellness/nutrition");
}

/** Log Activity form's submit (see components/vitals/LogActivityForm.tsx). `date` is an
 *  `<input type="date">` value ("YYYY-MM-DD"). */
export async function logVitalsActivity(input: {
  date: string;
  category: string;
  minutes: number;
  activity: string;
  notes: string;
}) {
  const user = await getCurrentUser();
  const activity = input.activity.trim();
  if (!user || !activity || !input.date || !isVitalsCategory(input.category) || input.minutes <= 0) return;

  await prisma.vitalsLog.create({
    data: {
      userId: user.id,
      date: new Date(`${input.date}T00:00:00`),
      category: input.category,
      minutes: Math.round(input.minutes),
      activity,
      notes: input.notes.trim() || null,
    },
  });
  revalidatePath("/wellness/vitals");
  revalidatePath("/wellness");
}

/** Delete button on a recent-log-entries row. */
export async function deleteVitalsLog(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.vitalsLog.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/wellness/vitals");
  revalidatePath("/wellness");
}
