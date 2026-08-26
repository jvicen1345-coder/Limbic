"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { calculateDifference, calculateLSI, calculatePercentDiff } from "@/lib/force-lab-units";
import { parseForceLabScreenshot, type ParsedForceLabScreenshot } from "@/lib/force-lab-import";
import { seedForceLabNorms } from "@/lib/force-lab-norms";
import { bodyRegionForMuscle } from "@/lib/force-lab-muscles";
import type { ClinicianDashboardResult } from "./clinician-dashboard";
import type { ForceLabSession } from "@/generated/prisma/client";

/**
 * Limbic Force Lab (/pro/force-lab) server actions.
 *
 * Same conventions as app/actions/clinician-dashboard.ts and app/actions/clinic-pro.ts:
 * every action re-derives the acting user from the session (getCurrentUser), never from a
 * client-supplied userId — the spec's example signatures (createForceLabSession(userId,
 * data), getForceLabSessions(userId, patientId?), etc.) are written as if the caller
 * supplies its own id; here that id always comes from the session instead. Fetch-then-
 * compare ownership checks (requireOwnedPatient/requireOwnedSession below) mirror
 * requireOwnedPatient in clinician-dashboard.ts.
 */

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

async function requireOwnedSession(userId: string, sessionId: string) {
  const session = await prisma.forceLabSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) return null;
  return session;
}

export interface CreateForceLabSessionInput {
  muscleGroup: string;
  bodyRegion: string;
  patientId?: string;
  sessionDate?: string; // "YYYY-MM-DD"
  rightPeak?: number;
  leftPeak?: number;
  rightTimeToPeak?: number;
  leftTimeToPeak?: number;
  unit: string;
  notes?: string;
  importedFrom?: string;
}

/** Save button on both the Manual Entry and (post-review) Import Screenshot tabs —
 *  difference/percentDiff/LSI are always recomputed here from rightPeak/leftPeak rather
 *  than trusting whatever the client last displayed (the import tab's parsed
 *  difference/percentDiff fields are for the clinician's own sanity-check against the
 *  screenshot, never written to the row). LSI treats the *weaker* side as the numerator
 *  (min/max, not "right" specifically) — the schema has no concept of which side is
 *  clinically "involved", and every LSI status threshold (90/80) only reads sensibly for a
 *  ratio capped at 100%. */
export async function createForceLabSession(data: CreateForceLabSessionInput): Promise<ClinicianDashboardResult<{ session: ForceLabSession }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  if (!data.muscleGroup.trim() || !data.bodyRegion.trim()) return { ok: false, error: "Muscle group is required." };
  if (!["lbs", "kg"].includes(data.unit)) return { ok: false, error: "Invalid unit." };

  let patientCode: string | null = null;
  if (data.patientId) {
    const patient = await requireOwnedPatient(user.id, data.patientId);
    if (!patient) return { ok: false, error: "Patient not found." };
    patientCode = patient.patientCode;
  }

  let difference: number | null = null;
  let percentDiff: number | null = null;
  let lsi: number | null = null;
  if (data.rightPeak != null && data.leftPeak != null) {
    difference = calculateDifference(data.rightPeak, data.leftPeak);
    percentDiff = calculatePercentDiff(data.rightPeak, data.leftPeak);
    lsi = calculateLSI(Math.min(data.rightPeak, data.leftPeak), Math.max(data.rightPeak, data.leftPeak));
  }

  const session = await prisma.forceLabSession.create({
    data: {
      userId: user.id,
      patientId: data.patientId ?? null,
      patientCode,
      muscleGroup: data.muscleGroup,
      bodyRegion: data.bodyRegion,
      rightPeak: data.rightPeak ?? null,
      leftPeak: data.leftPeak ?? null,
      rightTimeToPeak: data.rightTimeToPeak ?? null,
      leftTimeToPeak: data.leftTimeToPeak ?? null,
      difference,
      percentDiff,
      lsi,
      unit: data.unit,
      notes: data.notes?.trim() || null,
      importedFrom: data.importedFrom ?? null,
      sessionDate: data.sessionDate ? new Date(`${data.sessionDate}T00:00:00`) : new Date(),
    },
  });

  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  if (patientCode) revalidatePath(`/pro/force-lab/patient/${patientCode}`);
  return { ok: true, session };
}

/** Left column's Session History list — most recent first, optionally scoped to one
 *  patient (see the patient session page, /pro/force-lab/patient/[patientCode]). */
export async function getForceLabSessions(patientId?: string): Promise<ForceLabSession[]> {
  const user = await requireProUser();
  if (!user) return [];

  return prisma.forceLabSession.findMany({
    where: { userId: user.id, ...(patientId ? { patientId } : {}) },
    orderBy: { sessionDate: "desc" },
  });
}

/** Same as getForceLabSessions but scoped by the denormalized patientCode rather than a
 *  live patientId — what the /pro/force-lab/patient/[patientCode] page actually has from
 *  its URL param, without needing a second round trip to resolve code -> id first. */
export async function getForceLabSessionsByPatientCode(patientCode: string): Promise<ForceLabSession[]> {
  const user = await requireProUser();
  if (!user) return [];

  return prisma.forceLabSession.findMany({
    where: { userId: user.id, patientCode },
    orderBy: { sessionDate: "desc" },
  });
}

export async function getForceLabSession(sessionId: string): Promise<ForceLabSession | null> {
  const user = await requireProUser();
  if (!user) return null;
  return requireOwnedSession(user.id, sessionId);
}

export async function deleteForceLabSession(sessionId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const session = await requireOwnedSession(user.id, sessionId);
  if (!session) return { ok: false, error: "Session not found." };

  await prisma.forceLabSession.delete({ where: { id: sessionId } });
  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  if (session.patientCode) revalidatePath(`/pro/force-lab/patient/${session.patientCode}`);
  return { ok: true };
}

/** "Link to Patient" / "Change Patient" on a loaded session — keeps patientCode in sync
 *  with the newly-linked patient's current code (see ForceLabSession.patientCode's own
 *  schema comment on why the column is denormalized rather than always joined live). */
export async function linkSessionToPatient(sessionId: string, patientId: string): Promise<ClinicianDashboardResult<{ session: ForceLabSession }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const session = await requireOwnedSession(user.id, sessionId);
  if (!session) return { ok: false, error: "Session not found." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const updated = await prisma.forceLabSession.update({
    where: { id: sessionId },
    data: { patientId, patientCode: patient.patientCode },
  });

  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  revalidatePath(`/pro/force-lab/patient/${patient.patientCode}`);
  return { ok: true, session: updated };
}

/** Import Screenshot tab's extraction step — parses only, never saves (the clinician
 *  reviews/edits the pre-populated form and calls createForceLabSession separately, same
 *  two-step "generate then confirm" shape as the pre-visit brief's patient-facing draft). */
export async function parseScreenshot(imageBase64: string, mediaType: string): Promise<ParsedForceLabScreenshot | null> {
  const user = await requireProUser();
  if (!user) return null;
  return parseForceLabScreenshot(imageBase64, mediaType);
}

export interface ForceLabNormMatch {
  meanLbs: number;
  sdLbs: number;
  source: string;
  ageMin: number;
  ageMax: number;
}

/** Section 3's normative-comparison lookup — takes a single `age` (what the form actually
 *  collects) rather than the spec's literal (ageMin, ageMax) pair, which would require the
 *  caller to already know which decade bucket a norm falls in — the whole point of a
 *  lookup. `side` only matters for a side-specific norm (Grip Strength's rows are "right"/
 *  "left"; everything else is seeded "bilateral" and applies regardless of which side was
 *  tested) — tries the muscle group's real side first, falls back to "bilateral". Lazily
 *  seeds ForceLabNorm on first call (see seedForceLabNorms) so a fresh environment never
 *  needs a separate deploy step to populate reference data. */
export async function getNormativeData(muscleGroup: string, age: number, sex: string, side?: string): Promise<ForceLabNormMatch | null> {
  const user = await requireProUser();
  if (!user) return null;

  await seedForceLabNorms();

  const baseWhere = { muscleGroup, sex, ageMin: { lte: age }, ageMax: { gte: age } };
  const norm =
    (side && side !== "bilateral" ? await prisma.forceLabNorm.findFirst({ where: { ...baseWhere, side } }) : null) ??
    (await prisma.forceLabNorm.findFirst({ where: { ...baseWhere, side: "bilateral" } }));
  if (!norm) return null;

  return { meanLbs: norm.meanLbs, sdLbs: norm.sdLbs, source: norm.source, ageMin: norm.ageMin, ageMax: norm.ageMax };
}

export interface StrengthProfileEntry {
  muscleGroup: string;
  bodyRegion: string;
  rightPeak: number | null;
  leftPeak: number | null;
  lsi: number | null;
  unit: string;
  sessionDate: Date;
}

/** Right column's Strength Profile (and the full-width version on the patient session
 *  page) — the single most recent session per muscle group for this patient, across every
 *  muscle group ever tested for them. */
export async function getStrengthProfile(patientId: string): Promise<StrengthProfileEntry[]> {
  const user = await requireProUser();
  if (!user) return [];
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return [];

  const sessions = await prisma.forceLabSession.findMany({
    where: { userId: user.id, patientId },
    orderBy: { sessionDate: "desc" },
  });

  const seen = new Set<string>();
  const profile: StrengthProfileEntry[] = [];
  for (const s of sessions) {
    if (seen.has(s.muscleGroup)) continue;
    seen.add(s.muscleGroup);
    profile.push({
      muscleGroup: s.muscleGroup,
      bodyRegion: s.bodyRegion || bodyRegionForMuscle(s.muscleGroup) || "General",
      rightPeak: s.rightPeak,
      leftPeak: s.leftPeak,
      lsi: s.lsi,
      unit: s.unit,
      sessionDate: s.sessionDate,
    });
  }
  return profile;
}

/** Trend chart data — every session for one muscle group, oldest first (a trend chart
 *  reads left-to-right as time passing), optionally scoped to one patient. Unscoped
 *  (patientId omitted) is used for a session that was never linked to a patient — its own
 *  history is still every prior *unlinked* reading of that same muscle group for this
 *  clinician, not every clinician-wide reading regardless of patient. */
export async function getForceLabHistory(muscleGroup: string, patientId?: string): Promise<ForceLabSession[]> {
  const user = await requireProUser();
  if (!user) return [];

  return prisma.forceLabSession.findMany({
    where: { userId: user.id, muscleGroup, patientId: patientId ?? null },
    orderBy: { sessionDate: "asc" },
  });
}

export async function getUserForceUnit(): Promise<string> {
  const user = await getCurrentUser();
  return user?.forceUnit ?? "lbs";
}
