import "server-only";
import { prisma } from "@/lib/db";
import type { WellnessProfile } from "@/lib/vitals";

/** The one place Health and Wellness reads a reader's VitalsProfile row and maps it to the
 *  client-safe WellnessProfile shape (see lib/vitals.ts). Every page under /wellness needs
 *  some part of this profile — the calculators on Metrics, Assess Yourself's score,
 *  Nutrition's macros, the Exercise Library's goal filter, the agent's opening context —
 *  and before this each of them ran its own findUnique and rebuilt the same seven-field
 *  literal by hand, three of them character-for-character identical.
 *
 *  Kept in its own module rather than in lib/vitals.ts because that file is deliberately
 *  free of server-only imports so client components can import from it (see its header);
 *  pulling prisma in there would break every "use client" calculator that reads
 *  WellnessProfile.
 *
 *  Returns the profile with every field null for an account that has never saved one, so
 *  callers never branch on the row's existence — an empty profile and a missing profile
 *  render identically everywhere in this section. */
export async function getWellnessProfile(userId: string): Promise<WellnessProfile> {
  const row = await prisma.vitalsProfile.findUnique({ where: { userId } });
  return {
    age: row?.age ?? null,
    heightFeet: row?.heightFeet ?? null,
    heightInches: row?.heightInches ?? null,
    weightLbs: row?.weightLbs ?? null,
    biologicalSex: row?.biologicalSex ?? null,
    activityLevel: row?.activityLevel ?? null,
    wellnessGoal: row?.wellnessGoal ?? null,
  };
}

/** Metrics' Body Metrics card labels where the current height/weight came from, so it needs
 *  the sync timestamp the profile shape itself doesn't carry. Its own call rather than a
 *  second return value on getWellnessProfile above, so the five callers that don't care
 *  aren't handed a field they have to ignore. */
export async function getWellnessProfileSyncedAt(userId: string): Promise<Date | null> {
  const row = await prisma.vitalsProfile.findUnique({ where: { userId }, select: { googleHealthSyncedAt: true } });
  return row?.googleHealthSyncedAt ?? null;
}
