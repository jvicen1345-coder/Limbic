"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasLicenseAccess } from "@/lib/session";
import { sanitizeMediaUrl } from "@/lib/media-url";
import {
  HEP_TEMPLATE_BODY_PARTS,
  HEP_TEMPLATE_KINDS,
  isHepTemplateBodyPart,
  isHepTemplateKind,
  parseHepExercises,
  type HepTemplateBodyPart,
  type HepTemplateExercise,
  type HepTemplateKind,
} from "@/lib/hep-templates";

export interface HepExerciseInput {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface HepActionResult {
  ok: boolean;
  error?: string;
}

export async function createHepAction(input: { programName: string; exercises: HepExerciseInput[] }): Promise<HepActionResult> {
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return { ok: false, error: "Not authorized." };
  const programName = input.programName.trim();
  if (!programName || input.exercises.length === 0) return { ok: false, error: "A program name and at least one exercise are required." };

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
  return { ok: true };
}

/** Confirms the program belongs to the signed-in user before deleting it, rather than
 *  relying solely on the deleteMany's own userId-scoped where clause — an explicit check
 *  that returns a real error result (never throws) for a program that doesn't exist or
 *  belongs to someone else, so a caller can't mistake a no-op for a success. */
export async function deleteHepAction(programId: string): Promise<HepActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const program = await prisma.hepProgram.findUnique({ where: { id: programId }, select: { userId: true } });
  if (!program || program.userId !== user.id) return { ok: false, error: "Not authorized." };

  await prisma.hepProgram.delete({ where: { id: programId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface HepTemplateSummary {
  id: string;
  name: string;
  exerciseCount: number;
}

/** Grouped by kind first (HEP_TEMPLATE_KINDS order), then body part within each
 *  (HEP_TEMPLATE_BODY_PARTS order) — every kind/body-part combination is present (possibly
 *  empty) so the template library panel can always render all sections regardless of which
 *  kind tab is selected. Kept lightweight (no exercises payload) since the panel only needs
 *  full exercise data once a specific template is loaded — see loadHepTemplateAction below.
 *  Deliberately takes no userId parameter (unlike the spec's literal signature) — like every
 *  other action in this file, the user comes from the session, not a client-supplied id that
 *  could be spoofed. */
export async function getHepTemplatesAction(): Promise<Record<HepTemplateKind, Record<HepTemplateBodyPart, HepTemplateSummary[]>>> {
  const grouped = {} as Record<HepTemplateKind, Record<HepTemplateBodyPart, HepTemplateSummary[]>>;
  for (const k of HEP_TEMPLATE_KINDS) {
    grouped[k] = {} as Record<HepTemplateBodyPart, HepTemplateSummary[]>;
    for (const bp of HEP_TEMPLATE_BODY_PARTS) grouped[k][bp] = [];
  }
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return grouped;

  const templates = await prisma.hEPTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, bodyPart: true, kind: true, exercises: true },
  });
  for (const t of templates) {
    if (!isHepTemplateBodyPart(t.bodyPart) || !isHepTemplateKind(t.kind)) continue;
    const exercises = Array.isArray(t.exercises) ? t.exercises : [];
    grouped[t.kind][t.bodyPart].push({ id: t.id, name: t.name, exerciseCount: exercises.length });
  }
  return grouped;
}

/** Saves the builder's current draft as a reusable template. imageUrl/videoUrl are stripped
 *  for non-pro accounts, same LimbicPRO-gating reasoning as createHepAction above. Confirms
 *  the caller is a signed-in, license-holding clinician before writing anything — a Server
 *  Action is its own callable endpoint regardless of which page's UI happens to call it. */
export async function saveHepTemplateAction(
  name: string,
  bodyPart: string,
  exercises: HepTemplateExercise[],
  kind: string,
): Promise<HepActionResult> {
  const user = await getCurrentUser();
  if (!user || !hasLicenseAccess(user)) return { ok: false, error: "Not authorized." };
  const trimmedName = name.trim();
  if (!trimmedName || exercises.length === 0 || !isHepTemplateBodyPart(bodyPart) || !isHepTemplateKind(kind)) {
    return { ok: false, error: "A template name, body part, and at least one exercise are required." };
  }

  await prisma.hEPTemplate.create({
    data: {
      userId: user.id,
      name: trimmedName,
      bodyPart,
      kind,
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
  return { ok: true };
}

/** Confirms the template belongs to the signed-in user before deleting it — same explicit
 *  fetch-then-compare pattern as deleteHepAction above, rather than relying solely on the
 *  delete's own userId-scoped where clause, so a template that doesn't exist or belongs to
 *  someone else returns a real error result instead of a silent no-op. */
export async function deleteHepTemplateAction(templateId: string): Promise<HepActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const template = await prisma.hEPTemplate.findUnique({ where: { id: templateId }, select: { userId: true } });
  if (!template || template.userId !== user.id) return { ok: false, error: "Not authorized." };

  await prisma.hEPTemplate.delete({ where: { id: templateId } });
  revalidatePath("/hep");
  return { ok: true };
}

/** Returns the full draft (name + exercises + kind) for populating the builder, or null if
 *  the template doesn't exist or belongs to someone else. Falls back to "home" for a stored
 *  kind that somehow isn't one of HEP_TEMPLATE_KINDS (shouldn't happen post-migration, but
 *  the builder's toggle needs a valid value regardless). */
export async function loadHepTemplateAction(
  templateId: string,
): Promise<{ name: string; exercises: HepTemplateExercise[]; kind: HepTemplateKind } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const template = await prisma.hEPTemplate.findFirst({
    where: { id: templateId, userId: user.id },
    select: { name: true, exercises: true, kind: true },
  });
  if (!template) return null;

  return {
    name: template.name,
    exercises: parseHepExercises(template.exercises),
    kind: isHepTemplateKind(template.kind) ? template.kind : "home",
  };
}
