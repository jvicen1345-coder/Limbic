"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { sanitizeMediaUrl } from "@/lib/media-url";

export interface HepExerciseInput {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  imageUrl?: string;
  videoUrl?: string;
}

export async function createHepAction(input: { programName: string; exercises: HepExerciseInput[] }) {
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return;
  const programName = input.programName.trim();
  if (!programName || input.exercises.length === 0) return;

  // imageUrl/videoUrl are a LimbicPRO perk (see HepBuilder, which only renders those fields
  // for isPro) — stripped here too so a non-pro account can't sneak them in via a crafted
  // request past the UI.
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
          imageUrl: user.isPro ? sanitizeMediaUrl(ex.imageUrl) : null,
          videoUrl: user.isPro ? sanitizeMediaUrl(ex.videoUrl) : null,
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
