"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasLicenseAccess } from "@/lib/session";

export interface HepExerciseInput {
  name: string;
  sets: string;
  reps: string;
  notes: string;
}

export async function createHepAction(input: { programName: string; exercises: HepExerciseInput[] }) {
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return;
  const programName = input.programName.trim();
  if (!programName || input.exercises.length === 0) return;

  await prisma.hepProgram.create({
    data: {
      userId: user.id,
      programName,
      exercises: {
        create: input.exercises.map((ex, i) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
          order: i,
        })),
      },
    },
  });
  revalidatePath("/", "layout");
}

export async function deleteHepAction(programId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.hepProgram.deleteMany({ where: { id: programId, userId: user.id } });
  revalidatePath("/", "layout");
}
