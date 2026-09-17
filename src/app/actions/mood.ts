"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { todayKeyInZone } from "@/lib/day";
import { getTimeZone } from "@/lib/user-time-zone";
import { recordWellnessActivity } from "@/lib/wellness-activity";
import { todayLocalDateStr } from "@/lib/today";

/** MoodPickerCard's 5-point picker (see components/vitals/MoodPickerCard.tsx) — always
 *  writes with source "manual", which lib/mood-sync.ts's Google Health sync then treats as
 *  authoritative and never overwrites for that same day (see MoodLog.source's precedence
 *  rule in prisma/schema.prisma). Today only, unlike logVitalsActivity — mood is a same-day
 *  self-report, not something backdated onto a past date. */
export async function saveMoodLogAction(mood: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !Number.isInteger(mood) || mood < 1 || mood > 5) return;

  const today = todayLocalDateStr();
  await prisma.moodLog.upsert({
    where: { userId_date: { userId: user.id, date: new Date(`${today}T00:00:00`) } },
    create: { userId: user.id, date: new Date(`${today}T00:00:00`), mood, source: "manual" },
    update: { mood, source: "manual" },
  });
  // Any one wellness action a day keeps the streak alive (see lib/wellness-activity.ts).
  const timeZone = await getTimeZone(user);
  await recordWellnessActivity(user.id, todayKeyInZone(timeZone), timeZone);
  revalidatePath("/wellness/activity");
  revalidatePath("/wellness");
}
