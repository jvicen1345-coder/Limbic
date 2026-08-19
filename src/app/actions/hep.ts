"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { sanitizeMediaUrl } from "@/lib/media-url";
import { HEP_TEMPLATE_BODY_PARTS, isHepTemplateBodyPart, type HepTemplateBodyPart, type HepTemplateExercise } from "@/lib/hep-templates";

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

export interface HepTemplateSummary {
  id: string;
  name: string;
  exerciseCount: number;
}

/** Grouped by body part, in HEP_TEMPLATE_BODY_PARTS order — every category is present
 *  (possibly empty) so the template library panel can always render all nine sections. Kept
 *  lightweight (no exercises payload) since the panel only needs full exercise data once a
 *  specific template is loaded — see loadHepTemplateAction below. Deliberately takes no
 *  userId parameter (unlike the spec's literal signature) — like every other action in this
 *  file, the user comes from the session, not a client-supplied id that could be spoofed. */
export async function getHepTemplatesAction(): Promise<Record<HepTemplateBodyPart, HepTemplateSummary[]>> {
  const grouped = {} as Record<HepTemplateBodyPart, HepTemplateSummary[]>;
  for (const bp of HEP_TEMPLATE_BODY_PARTS) grouped[bp] = [];
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return grouped;

  const templates = await prisma.hEPTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, bodyPart: true, exercises: true },
  });
  for (const t of templates) {
    if (!isHepTemplateBodyPart(t.bodyPart)) continue;
    const exercises = Array.isArray(t.exercises) ? t.exercises : [];
    grouped[t.bodyPart].push({ id: t.id, name: t.name, exerciseCount: exercises.length });
  }
  return grouped;
}

/** Saves the builder's current draft as a reusable template. imageUrl/videoUrl are stripped
 *  for non-pro accounts, same LimbicPRO-gating reasoning as createHepAction above. */
export async function saveHepTemplateAction(name: string, bodyPart: string, exercises: HepTemplateExercise[]) {
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return;
  const trimmedName = name.trim();
  if (!trimmedName || exercises.length === 0 || !isHepTemplateBodyPart(bodyPart)) return;

  await prisma.hEPTemplate.create({
    data: {
      userId: user.id,
      name: trimmedName,
      bodyPart,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        notes: ex.notes,
        imageUrl: user.isPro ? sanitizeMediaUrl(ex.imageUrl) : null,
        videoUrl: user.isPro ? sanitizeMediaUrl(ex.videoUrl) : null,
      })),
    },
  });
  revalidatePath("/hep");
}

export async function deleteHepTemplateAction(templateId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.hEPTemplate.deleteMany({ where: { id: templateId, userId: user.id } });
  revalidatePath("/hep");
}

/** Returns the full draft (name + exercises) for populating the builder, or null if the
 *  template doesn't exist or belongs to someone else. */
export async function loadHepTemplateAction(
  templateId: string,
): Promise<{ name: string; exercises: HepTemplateExercise[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const template = await prisma.hEPTemplate.findFirst({
    where: { id: templateId, userId: user.id },
    select: { name: true, exercises: true },
  });
  if (!template) return null;

  const raw = Array.isArray(template.exercises) ? template.exercises : [];
  const exercises: HepTemplateExercise[] = raw.map((ex) => {
    const e = ex as Partial<HepTemplateExercise>;
    return {
      name: e.name ?? "",
      sets: e.sets ?? "",
      reps: e.reps ?? "",
      notes: e.notes ?? "",
      imageUrl: e.imageUrl ?? "",
      videoUrl: e.videoUrl ?? "",
    };
  });
  return { name: template.name, exercises };
}
