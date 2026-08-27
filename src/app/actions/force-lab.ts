"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { calculateDifference, calculateLSI, calculatePercentDiff } from "@/lib/force-lab-units";
import { parseForceLabScreenshot, type ParsedForceLabScreenshot } from "@/lib/force-lab-import";
import { parseActiveForcePaste, type ParsedAssessment, type ParsedMuscleGroup } from "@/lib/force-lab-parser";
import { generateAssessmentComparison, generatePatientStrengthSummary, type AssessmentComparisonInput } from "@/lib/pre-visit-brief";
import { seedForceLabNorms } from "@/lib/force-lab-norms";
import { bodyRegionForMuscle } from "@/lib/force-lab-muscles";
import type { ClinicianDashboardResult } from "./clinician-dashboard";
import type { ForceLabAssessment, ForceLabComparison, ForceLabSession } from "@/generated/prisma/client";

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

async function requireOwnedAssessment(userId: string, assessmentId: string) {
  const assessment = await prisma.forceLabAssessment.findUnique({ where: { id: assessmentId } });
  if (!assessment || assessment.userId !== userId) return null;
  return assessment;
}

/** Best-effort parse of the ActiveForce export's own date line ("Sunday, May 10, 2026 at
 *  11:10 AM", see parseActiveForcePaste) or a clinician's inline edit to the Assessment
 *  Date field in the paste preview (which submits a plain date-input value instead) — tries
 *  the raw string directly first (covers ISO/date-input values), then strips the leading
 *  weekday and swaps " at " for a space to get something Date can parse. Falls back to now
 *  rather than rejecting the save outright, since assessmentDate is never absent in
 *  practice but a hostile or truncated paste shouldn't block saving the rest of the data. */
function parseAssessmentDateInput(raw: string | undefined): Date {
  if (!raw) return new Date();
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;
  const normalized = raw.replace(/^[A-Za-z]+,\s*/, "").replace(" at ", " ");
  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
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

// ============================================================================
// Full-assessment import (Paste Assessment tab + Past Results) — see
// lib/force-lab-parser.ts for the text-parsing side. A ForceLabAssessment is the parent
// record for one ActiveForce paste; each of its muscle groups is persisted as its own
// ForceLabSession row (assessmentId set) so the strength profile / trend / session-history
// code above keeps working unmodified on assessment-imported data exactly as it does on
// manual or screenshot-imported sessions.
// ============================================================================

export type ForceLabAssessmentWithSessions = ForceLabAssessment & {
  sessions: ForceLabSession[];
  patient: { patientCode: string } | null;
};

export interface ForceLabAssessmentSummary {
  id: string;
  identifier: string | null;
  patientId: string | null;
  patientCode: string | null;
  assessmentDate: Date;
  musclesTested: number;
  sessionCount: number;
}

/** Parse-only step behind the Paste Assessment tab's "Parse Assessment" button — never
 *  saves, same two-step "generate then confirm" shape as parseScreenshot above, so the
 *  clinician can review/edit the metadata and muscle-group table before anything is
 *  persisted. */
export async function parseAssessmentText(rawText: string): Promise<ParsedAssessment | null> {
  const user = await requireProUser();
  if (!user) return null;
  if (!rawText.trim()) return null;
  return parseActiveForcePaste(rawText);
}

export interface CreateForceLabAssessmentInput {
  rawText: string;
  identifier?: string;
  assessmentDate?: string;
  patientWeight?: number;
  patientWeightUnit?: string;
  patientAge?: number;
  patientSex?: string;
  dominantSide?: string;
  /** Explicit link the clinician confirmed in the preview (auto-matched or manually
   *  picked). When omitted, falls back to auto-matching `identifier` against this
   *  clinician's own patient codes, same "auto-links patient by identifier if a matching
   *  patientCode exists" behavior the paste preview already showed inline. */
  patientId?: string;
  notes?: string;
  muscleGroups: ParsedMuscleGroup[];
}

/** "Save Assessment" — creates the parent ForceLabAssessment plus one ForceLabSession per
 *  muscle group in a single nested write. Like createForceLabSession above, difference/
 *  percentDiff/lsi are always recomputed here from peak values rather than trusting the
 *  parser's own preview numbers — same never-trust-a-precalculated-value boundary. */
export async function createForceLabAssessment(
  input: CreateForceLabAssessmentInput
): Promise<ClinicianDashboardResult<{ assessment: ForceLabAssessmentWithSessions }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  if (input.muscleGroups.length === 0) {
    return { ok: false, error: "Could not find muscle group data in this text. Make sure you copied the full export from ActiveForce." };
  }
  if (!input.rawText.trim()) return { ok: false, error: "No assessment text to save." };

  let patientId: string | null = null;
  if (input.patientId) {
    const patient = await requireOwnedPatient(user.id, input.patientId);
    if (!patient) return { ok: false, error: "Patient not found." };
    patientId = patient.id;
  } else if (input.identifier) {
    const patient = await prisma.clinicalPatient.findUnique({
      where: { userId_patientCode: { userId: user.id, patientCode: input.identifier } },
    });
    if (patient) patientId = patient.id;
  }

  const assessmentDate = parseAssessmentDateInput(input.assessmentDate);

  const assessment = await prisma.forceLabAssessment.create({
    data: {
      userId: user.id,
      patientId,
      identifier: input.identifier?.trim() || null,
      assessmentDate,
      patientWeight: input.patientWeight ?? null,
      patientWeightUnit: input.patientWeightUnit || "kg",
      patientAge: input.patientAge ?? null,
      patientSex: input.patientSex?.trim() || null,
      dominantSide: input.dominantSide?.trim() || null,
      musclesTested: input.muscleGroups.length,
      rawText: input.rawText,
      notes: input.notes?.trim() || null,
      sessions: {
        create: input.muscleGroups.map((m) => {
          let difference: number | null = null;
          let percentDiff: number | null = null;
          let lsi: number | null = null;
          if (m.peakForceLeft != null && m.peakForceRight != null) {
            difference = calculateDifference(m.peakForceRight, m.peakForceLeft);
            percentDiff = calculatePercentDiff(m.peakForceRight, m.peakForceLeft);
            lsi = calculateLSI(Math.min(m.peakForceLeft, m.peakForceRight), Math.max(m.peakForceLeft, m.peakForceRight));
          }
          return {
            userId: user.id,
            patientId,
            patientCode: null, // backfilled below once the patient's code is known
            muscleGroup: m.muscleGroup,
            bodyRegion: m.bodyRegion,
            rightPeak: m.peakForceRight ?? null,
            leftPeak: m.peakForceLeft ?? null,
            rightTimeToPeak: m.timeToPeakRight ?? null,
            leftTimeToPeak: m.timeToPeakLeft ?? null,
            difference,
            percentDiff,
            lsi,
            unit: m.unit,
            importedFrom: "activeforce_paste",
            sessionDate: assessmentDate,
            averageForceLeft: m.averageForceLeft ?? null,
            averageForceRight: m.averageForceRight ?? null,
            forceWeightRatioLeft: m.forceWeightRatioLeft ?? null,
            forceWeightRatioRight: m.forceWeightRatioRight ?? null,
            rep1Left: m.rep1Left ?? null,
            rep1Right: m.rep1Right ?? null,
            rep2Left: m.rep2Left ?? null,
            rep2Right: m.rep2Right ?? null,
            rep3Left: m.rep3Left ?? null,
            rep3Right: m.rep3Right ?? null,
            timeToPeakAvgLeft: m.timeToPeakAvgLeft ?? null,
            timeToPeakAvgRight: m.timeToPeakAvgRight ?? null,
          };
        }),
      },
    },
    include: { sessions: true, patient: { select: { patientCode: true } } },
  });

  // Nested create above can't reference the patient's own patientCode (it isn't known until
  // the patient lookup above resolves), so backfill the denormalized column on every session
  // it just created in one pass — same field every other ForceLabSession write keeps in
  // sync with its patient link.
  if (assessment.patient) {
    await prisma.forceLabSession.updateMany({
      where: { assessmentId: assessment.id },
      data: { patientCode: assessment.patient.patientCode },
    });
  }

  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  if (assessment.patient) revalidatePath(`/pro/force-lab/patient/${assessment.patient.patientCode}`);

  const sessions = assessment.patient
    ? assessment.sessions.map((s) => ({ ...s, patientCode: assessment.patient!.patientCode }))
    : assessment.sessions;
  return { ok: true, assessment: { ...assessment, sessions } };
}

/** Past Results' assessment history list — lightweight summaries (no session rows), most
 *  recent first, optionally scoped to one patient. */
export async function getForceLabAssessments(patientId?: string): Promise<ForceLabAssessmentSummary[]> {
  const user = await requireProUser();
  if (!user) return [];

  const assessments = await prisma.forceLabAssessment.findMany({
    where: { userId: user.id, ...(patientId ? { patientId } : {}) },
    orderBy: { assessmentDate: "desc" },
    include: { patient: { select: { patientCode: true } }, _count: { select: { sessions: true } } },
  });

  return assessments.map((a) => ({
    id: a.id,
    identifier: a.identifier,
    patientId: a.patientId,
    patientCode: a.patient?.patientCode ?? null,
    assessmentDate: a.assessmentDate,
    musclesTested: a.musclesTested,
    sessionCount: a._count.sessions,
  }));
}

/** Past Results' expanded row / print page — full assessment with every muscle group's
 *  full session data. */
export async function getForceLabAssessment(assessmentId: string): Promise<ForceLabAssessmentWithSessions | null> {
  const user = await requireProUser();
  if (!user) return null;

  const assessment = await prisma.forceLabAssessment.findUnique({
    where: { id: assessmentId },
    include: { sessions: { orderBy: { muscleGroup: "asc" } }, patient: { select: { patientCode: true } } },
  });
  if (!assessment || assessment.userId !== user.id) return null;
  return assessment;
}

/** Deletes the assessment and every muscle-group session it owns (see
 *  ForceLabSession.assessment's onDelete: Cascade — these rows only exist as this one
 *  paste's per-muscle breakdown, not independent readings). */
export async function deleteForceLabAssessment(assessmentId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const assessment = await requireOwnedAssessment(user.id, assessmentId);
  if (!assessment) return { ok: false, error: "Assessment not found." };

  let patientCode: string | null = null;
  if (assessment.patientId) {
    const patient = await prisma.clinicalPatient.findUnique({ where: { id: assessment.patientId }, select: { patientCode: true } });
    patientCode = patient?.patientCode ?? null;
  }

  await prisma.forceLabAssessment.delete({ where: { id: assessmentId } });

  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  if (patientCode) revalidatePath(`/pro/force-lab/patient/${patientCode}`);
  return { ok: true };
}

/** "Link to Patient" on an unlinked assessment row — updates patientId on the assessment
 *  and, to keep every child session's denormalized patientCode in sync (same reasoning as
 *  linkSessionToPatient above), on all of its linked sessions too. */
export async function linkAssessmentToPatient(
  assessmentId: string,
  patientId: string
): Promise<ClinicianDashboardResult<{ assessment: ForceLabAssessment }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const assessment = await requireOwnedAssessment(user.id, assessmentId);
  if (!assessment) return { ok: false, error: "Assessment not found." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const [updated] = await prisma.$transaction([
    prisma.forceLabAssessment.update({ where: { id: assessmentId }, data: { patientId } }),
    prisma.forceLabSession.updateMany({ where: { assessmentId }, data: { patientId, patientCode: patient.patientCode } }),
  ]);

  revalidatePath("/pro/force-lab");
  revalidatePath("/pro/dashboard");
  revalidatePath(`/pro/force-lab/patient/${patient.patientCode}`);
  return { ok: true, assessment: updated };
}

/** All assessments for one patient, oldest first — the patient session page's Full
 *  Assessments section and its per-muscle-group trend charts (each session carries its own
 *  assessmentDate via `sessions`, so a chart can plot across assessments without a second
 *  fetch). */
export async function getAssessmentHistory(patientId: string): Promise<ForceLabAssessmentWithSessions[]> {
  const user = await requireProUser();
  if (!user) return [];
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return [];

  return prisma.forceLabAssessment.findMany({
    where: { userId: user.id, patientId },
    orderBy: { assessmentDate: "asc" },
    include: { sessions: { orderBy: { muscleGroup: "asc" } }, patient: { select: { patientCode: true } } },
  });
}

export type ForceLabComparisonResult = {
  comparison: ForceLabComparison;
  assessmentA: ForceLabAssessmentWithSessions;
  assessmentB: ForceLabAssessmentWithSessions;
};

/** Comparison view's read-only lookup on load — "if interpretation already exists for this
 *  pair, show it immediately" without hitting the AI. Matches either click order (a
 *  clinician re-picking the same two assessments in the opposite order should still find a
 *  prior interpretation), returning the most recently generated one. */
export async function getExistingComparison(assessmentAId: string, assessmentBId: string): Promise<ForceLabComparison | null> {
  const user = await requireProUser();
  if (!user) return null;

  return prisma.forceLabComparison.findFirst({
    where: {
      userId: user.id,
      OR: [
        { assessmentAId, assessmentBId },
        { assessmentAId: assessmentBId, assessmentBId: assessmentAId },
      ],
    },
    orderBy: { generatedAt: "desc" },
  });
}

/** "Generate Interpretation" (first run) and "Regenerate" (every run after) both call this
 *  — always creates a fresh ForceLabComparison row rather than overwriting a prior one, same
 *  reasoning as TreatmentIdea/DischargeSummary keeping every generation instead of updating
 *  in place. */
export async function compareAssessments(assessmentAId: string, assessmentBId: string): Promise<ClinicianDashboardResult<ForceLabComparisonResult>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const [assessmentA, assessmentB] = await Promise.all([getForceLabAssessment(assessmentAId), getForceLabAssessment(assessmentBId)]);
  if (!assessmentA || !assessmentB) return { ok: false, error: "Assessment not found." };

  const toComparisonInput = (a: ForceLabAssessmentWithSessions): AssessmentComparisonInput => ({
    date: a.assessmentDate.toLocaleDateString(),
    identifier: a.identifier ?? undefined,
    muscleGroups: a.sessions.map((s) => ({
      muscleGroup: s.muscleGroup,
      peakForceLeft: s.leftPeak ?? undefined,
      peakForceRight: s.rightPeak ?? undefined,
      lsi: s.lsi ?? undefined,
      forceWeightRatioLeft: s.forceWeightRatioLeft ?? undefined,
      forceWeightRatioRight: s.forceWeightRatioRight ?? undefined,
    })),
  });

  const interpretation = await generateAssessmentComparison(toComparisonInput(assessmentA), toComparisonInput(assessmentB));

  const comparison = await prisma.forceLabComparison.create({
    data: { userId: user.id, assessmentAId, assessmentBId, interpretation },
  });

  return { ok: true, comparison, assessmentA, assessmentB };
}

// ============================================================================
// Dashboard card (components/pro/dashboard/ForceLabSummary.tsx) — a single consolidated
// fetch for the active patient workspace's Force Lab section, replacing that component's
// old separate getForceLabSessions/getAssessmentHistory calls.
// ============================================================================

export type ForceLabTrend = "improving" | "declining" | "stable" | "insufficient_data";

// Below this, two consecutive LSI readings for the same muscle group read as "the same"
// rather than a real change — same spirit as PracticeMetrics.tsx's HIGH_REASSESSMENT_RATE
// constant: a named, documented threshold rather than a bare number inline.
const LSI_TREND_STABLE_THRESHOLD = 2;

// A muscle group surfaces in "Needs Attention" below this LSI — matches getLSIStatus's own
// "caution"/"deficit" boundary in lib/force-lab-units.ts.
const NEEDS_ATTENTION_LSI_THRESHOLD = 85;
const NEEDS_ATTENTION_COUNT = 2;

/** Compares the two most recent sessions for one muscle group (by sessionDate) — same
 *  "last two readings" comparison for both the Most Recent section's own trend and each
 *  Needs Attention row's trend, so this is the only place that logic is written. */
function computeMuscleGroupTrend(allSessions: ForceLabSession[], muscleGroup: string): ForceLabTrend {
  const forGroup = allSessions
    .filter((s) => s.muscleGroup === muscleGroup && s.lsi != null)
    .slice()
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  if (forGroup.length < 2) return "insufficient_data";

  const [latest, previous] = forGroup;
  const change = latest.lsi! - previous.lsi!;
  if (Math.abs(change) < LSI_TREND_STABLE_THRESHOLD) return "stable";
  return change > 0 ? "improving" : "declining";
}

export interface ForceLabCardData {
  sessionCount: number;
  mostRecent: {
    muscleGroup: string;
    sessionDate: Date;
    rightPeak: number | null;
    leftPeak: number | null;
    lsi: number | null;
    unit: string;
  } | null;
  mostRecentTrend: ForceLabTrend;
  needsAttention: { muscleGroup: string; lsi: number; trend: ForceLabTrend }[];
  latestAssessmentDate: Date | null;
}

/** The redesigned Force Lab dashboard card's sole data source (see ForceLabSummary.tsx) —
 *  everything the card needs in one round trip instead of the old component's separate
 *  session-list and assessment-history fetches. Like every other action in this file, the
 *  acting user comes from the session rather than a `userId` parameter (see this file's own
 *  top-of-file comment on why that departs from the literal spec signature). */
export async function getForceLabCardData(patientId: string): Promise<ForceLabCardData> {
  const empty: ForceLabCardData = { sessionCount: 0, mostRecent: null, mostRecentTrend: "insufficient_data", needsAttention: [], latestAssessmentDate: null };

  const user = await requireProUser();
  if (!user) return empty;
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return empty;

  const [sessions, latestAssessment] = await Promise.all([
    prisma.forceLabSession.findMany({ where: { userId: user.id, patientId }, orderBy: { sessionDate: "desc" } }),
    prisma.forceLabAssessment.findFirst({ where: { userId: user.id, patientId }, orderBy: { assessmentDate: "desc" }, select: { assessmentDate: true } }),
  ]);

  if (sessions.length === 0) return { ...empty, latestAssessmentDate: latestAssessment?.assessmentDate ?? null };

  const mostRecentSession = sessions[0];
  const mostRecent = {
    muscleGroup: mostRecentSession.muscleGroup,
    sessionDate: mostRecentSession.sessionDate,
    rightPeak: mostRecentSession.rightPeak,
    leftPeak: mostRecentSession.leftPeak,
    lsi: mostRecentSession.lsi,
    unit: mostRecentSession.unit,
  };
  const mostRecentTrend = computeMuscleGroupTrend(sessions, mostRecentSession.muscleGroup);

  // One entry per muscle group — its own most recent LSI reading — same dedup pattern as
  // getStrengthProfile above, since "lowest LSI muscle groups" needs each group's current
  // standing, not every historical reading of it.
  const seen = new Set<string>();
  const latestPerMuscleGroup: { muscleGroup: string; lsi: number }[] = [];
  for (const s of sessions) {
    if (seen.has(s.muscleGroup) || s.lsi == null) continue;
    seen.add(s.muscleGroup);
    latestPerMuscleGroup.push({ muscleGroup: s.muscleGroup, lsi: s.lsi });
  }

  const needsAttention = latestPerMuscleGroup
    .filter((m) => m.lsi < NEEDS_ATTENTION_LSI_THRESHOLD)
    .sort((a, b) => a.lsi - b.lsi)
    .slice(0, NEEDS_ATTENTION_COUNT)
    .map((m) => ({ muscleGroup: m.muscleGroup, lsi: m.lsi, trend: computeMuscleGroupTrend(sessions, m.muscleGroup) }));

  return { sessionCount: sessions.length, mostRecent, mostRecentTrend, needsAttention, latestAssessmentDate: latestAssessment?.assessmentDate ?? null };
}

// ============================================================================
// Patient-friendly report (print page toggle) — see lib/force-lab-plain-language.ts for
// the plain-English translation helpers and lib/pre-visit-brief.ts's
// generatePatientStrengthSummary for the AI call itself.
// ============================================================================

/** "Generate Patient Summary" / "Regenerate Summary" on the print page's Patient Report
 *  tab. Saves to ForceLabAssessment.patientSummary — a field of its own rather than reusing
 *  `notes` (the spec's literal storage suggestion): `notes` is the clinician's own free-text
 *  field, already rendered verbatim in the unchanged Clinical Report, and overwriting it here
 *  would both destroy whatever the clinician wrote there and leak into a document this
 *  feature is explicitly not supposed to touch. */
export async function generatePatientReportSummary(assessmentId: string): Promise<ClinicianDashboardResult<{ summary: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const assessment = await requireOwnedAssessment(user.id, assessmentId);
  if (!assessment) return { ok: false, error: "Assessment not found." };

  const sessions = await prisma.forceLabSession.findMany({ where: { assessmentId }, orderBy: { muscleGroup: "asc" } });

  const summary = await generatePatientStrengthSummary({
    patientAge: assessment.patientAge ?? undefined,
    patientSex: assessment.patientSex ?? undefined,
    dominantSide: assessment.dominantSide ?? undefined,
    muscleGroups: sessions.map((s) => ({
      muscleGroup: s.muscleGroup,
      peakForceLeft: s.leftPeak ?? undefined,
      peakForceRight: s.rightPeak ?? undefined,
      lsi: s.lsi ?? undefined,
    })),
  });
  if (!summary) return { ok: false, error: "Could not generate a patient summary. Please try again." };

  await prisma.forceLabAssessment.update({ where: { id: assessmentId }, data: { patientSummary: summary } });

  return { ok: true, summary };
}
