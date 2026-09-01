"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  estimateOneRepMax,
  classifyStrengthLevel,
  LIFTS,
  SEXES,
  MIN_AGE,
  MAX_AGE,
  type Lift,
  type Sex,
  type StrengthClassification,
} from "@/lib/three-rep-max-standards";

const THREE_RM_REPS = 3;

// Same conventions as app/actions/force-lab.ts: acting user always comes from the session,
// never a client-supplied userId, and ownership is a fetch-then-compare check.
async function requireProUser() {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return null;
  return user;
}

async function requireOwnedPatient(userId: string, patientId: string) {
  const patient = await prisma.clinicalPatient.findUnique({ where: { id: patientId } });
  if (!patient || patient.userId !== userId) return null;
  return patient;
}

type ActionError = { error: string };

export interface ThreeRepMaxEntry {
  id: string;
  lift: Lift;
  weightLbs: number;
  bodyweightLbs: number;
  sex: Sex;
  age: number;
  testedAt: Date;
  oneRepMaxLbs: number;
  classification: StrengthClassification;
}

/** The 3-Rep-Max card's sole data source (see ThreeRepMaxCard.tsx) — one entry per lift, the
 *  most recently logged test for each, each already carrying its estimated 1RM and strength
 *  classification so the card does no math of its own. A lift the patient hasn't tested yet
 *  is simply absent from the array — the card decides how to render that gap. */
export async function getThreeRepMaxCardData(patientId: string): Promise<ThreeRepMaxEntry[]> {
  const user = await requireProUser();
  if (!user) return [];
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return [];

  const tests = await prisma.threeRepMaxTest.findMany({ where: { userId: user.id, patientId }, orderBy: { testedAt: "desc" } });

  const seen = new Set<string>();
  const latestPerLift: ThreeRepMaxEntry[] = [];
  for (const t of tests) {
    if (seen.has(t.lift)) continue;
    seen.add(t.lift);
    const lift = t.lift as Lift;
    const sex = t.sex as Sex;
    const oneRepMaxLbs = estimateOneRepMax(t.weightLbs, THREE_RM_REPS);
    latestPerLift.push({
      id: t.id,
      lift,
      weightLbs: t.weightLbs,
      bodyweightLbs: t.bodyweightLbs,
      sex,
      age: t.age,
      testedAt: t.testedAt,
      oneRepMaxLbs,
      classification: classifyStrengthLevel(lift, sex, t.age, oneRepMaxLbs, t.bodyweightLbs),
    });
  }

  // Fixed LIFTS order (Squat, Bench, Deadlift) rather than most-recently-tested order, so the
  // card's layout doesn't reshuffle every time a different lift gets a new entry.
  const order = LIFTS.map((l) => l.value);
  return latestPerLift.sort((a, b) => order.indexOf(a.lift) - order.indexOf(b.lift));
}

/** Log a new 3-rep-max test (see ThreeRepMaxCard.tsx's inline add form) — weightLbs is the
 *  load actually lifted for 3 reps; bodyweightLbs/sex/age are captured with this entry
 *  rather than read off the patient record, which has none of those fields (see
 *  ThreeRepMaxTest's own comment in schema.prisma). */
export async function createThreeRepMaxTest(
  patientId: string,
  lift: string,
  weightLbs: number,
  bodyweightLbs: number,
  sex: string,
  age: number
): Promise<ActionError | { success: true }> {
  const user = await requireProUser();
  if (!user) return { error: "Unauthorized" };

  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { error: "Patient not found." };

  if (!LIFTS.some((l) => l.value === lift)) return { error: "Pick a lift." };
  if (!SEXES.some((s) => s.value === sex)) return { error: "Pick a sex for the strength standards comparison." };
  if (!(weightLbs > 0)) return { error: "Enter the weight lifted for 3 reps." };
  if (!(bodyweightLbs > 0)) return { error: "Enter the patient's bodyweight." };
  if (!Number.isFinite(age) || age < MIN_AGE || age > MAX_AGE) return { error: `Enter an age between ${MIN_AGE} and ${MAX_AGE}.` };

  await prisma.threeRepMaxTest.create({
    data: { userId: user.id, patientId, lift, weightLbs, bodyweightLbs, sex, age: Math.round(age) },
  });

  revalidatePath("/pro/dashboard");
  return { success: true };
}
