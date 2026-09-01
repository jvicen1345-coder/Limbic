"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import {
  generateClinicalBrief,
  generatePatientBrief,
  generateTreatmentIdeas as generateTreatmentIdeasBrief,
  generateDischargeSummary as generateDischargeSummaryBrief,
} from "@/lib/pre-visit-brief";
import { REASSESSMENT_INTERVAL_VISITS, REASSESSMENT_STALE_DAYS } from "@/lib/clinician-dashboard-types";
import { todayLocalDateStr } from "@/lib/today";
import { conditionIntelligenceMap } from "@/lib/condition-intelligence";
import { mcidValues } from "@/lib/outcome-benchmarks";
import { detectRedFlags } from "@/lib/red-flag-detector";
import { goalBank } from "@/lib/goal-bank";
import { getWeeklyResearchDigest as getWeeklyResearchDigestFeed, type WeeklyResearchDigest } from "@/lib/dashboard-research";
import type { ClinicalPatient, OutcomeMeasureEntry, PatientHEPAssignment, ClinicalNote, RedFlagAlert, SessionExerciseLog } from "@/generated/prisma/client";
import { parseHepExercises, type HepTemplateExercise } from "@/lib/hep-templates";

// Type-only re-export so callers (ResearchFeedPanel.tsx, ClinicianDashboard.tsx) can import
// WeeklyResearchDigest from this action file instead of reaching into lib/dashboard-research
// directly — erased at compile time, so it doesn't violate "use server"'s runtime-exports-only rule.
export type { WeeklyResearchDigest };

/**
 * LimbicPRO Clinician Dashboard (/pro/dashboard) server actions.
 *
 * Every action re-derives the signed-in user from the session itself (getCurrentUser) —
 * it deliberately does NOT accept a `userId` argument from the caller, even though the
 * feature spec this shipped from wrote each signature that way. A Server Action is its
 * own callable HTTP endpoint independent of which component invoked it (see
 * app/actions/pro-toolbox.ts's own comment on this same point) — accepting a
 * client-supplied userId would let a tampered request read or mutate another clinician's
 * caseload just by passing a different id, which defeats the entire point of the
 * ownership checks below. Every other action in this app (pro-toolbox.ts, hep.ts, and
 * every action file in between) follows this same "derive it from the session, never
 * trust the argument" rule; this file keeps that rule rather than introducing the one
 * exception.
 *
 * Mutating actions return a discriminated `{ ok: true, ... } | { ok: false, error }`
 * union carrying whatever data the caller needs back (same shape as lib/agent.ts's
 * AgentWebResult/AgentWebError) rather than the plainer ok/error-only shape
 * pro-toolbox.ts uses for its simpler mutations — these need to hand real data back to a
 * client component that never navigates away (see app/pro/dashboard/page.tsx), not just a
 * success flag.
 */

async function requireProUser() {
  const user = await getCurrentUser();
  if (!user || !user.isPro) return null;
  return user;
}

/** Fetch-then-compare ownership check, same explicit pattern as deleteCELog in
 *  pro-toolbox.ts and deleteHepAction in hep.ts — a patient record that doesn't exist or
 *  belongs to someone else returns null, never distinguishing the two (so a probing
 *  request can't tell "not found" from "not yours"). */
async function requireOwnedPatient(userId: string, patientId: string) {
  const patient = await prisma.clinicalPatient.findUnique({ where: { id: patientId } });
  if (!patient || patient.userId !== userId) return null;
  return patient;
}

function isReassessmentDue(patient: Pick<ClinicalPatient, "visitCount" | "lastSeen">): boolean {
  const visitDue = patient.visitCount > 0 && patient.visitCount % REASSESSMENT_INTERVAL_VISITS === 0;
  const staleDue = patient.lastSeen != null && Date.now() - patient.lastSeen.getTime() > REASSESSMENT_STALE_DAYS * 86400000;
  return visitDue || staleDue;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface DashboardSummary {
  activePatients: number;
  seenThisWeek: number;
  dueForReassessment: number;
  ceHours: { completed: number; total: number };
  outstandingNotes: number;
}

/** The Daily Brief bar's four stat tiles (see app/pro/dashboard/page.tsx). "Outstanding
 *  notes" — active patients whose most recent visit (their current visitCount) has no
 *  matching ClinicalNote yet, i.e. documentation hasn't caught up with the visit count. */
export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const user = await requireProUser();
  if (!user) return null;

  const weekStart = startOfWeek(new Date());

  const [patients, ceLogs] = await Promise.all([
    prisma.clinicalPatient.findMany({
      where: { userId: user.id, status: "active" },
      select: { visitCount: true, lastSeen: true, clinicalNotes: { select: { visitNumber: true } } },
    }),
    prisma.cELog.findMany({ where: { userId: user.id }, select: { hours: true } }),
  ]);

  const activePatients = patients.length;
  const seenThisWeek = patients.filter((p) => p.lastSeen != null && p.lastSeen >= weekStart).length;
  const dueForReassessment = patients.filter(isReassessmentDue).length;
  const outstandingNotes = patients.filter(
    (p) => p.visitCount > 0 && !p.clinicalNotes.some((n) => n.visitNumber === p.visitCount)
  ).length;
  const ceHoursCompleted = ceLogs.reduce((sum, l) => sum + l.hours, 0);

  return {
    activePatients,
    seenThisWeek,
    dueForReassessment,
    ceHours: { completed: ceHoursCompleted, total: user.ceTotalRequired ?? 30 },
    outstandingNotes,
  };
}

export interface PatientListEntry {
  id: string;
  patientCode: string;
  condition: string;
  bodyRegion: string;
  specialty: string;
  visitCount: number;
  totalVisits: number;
  lastSeen: Date | null;
  nextVisit: Date | null;
  status: string;
  dueForReassessment: boolean;
  /** One entry per distinct measure, whichever score was recorded most recently for it —
   *  what the patient list card and (once selected) the workspace header need without
   *  pulling full history; getPatientDetail is the one that returns everything. */
  recentOutcomes: { measureName: string; score: number; maxScore: number; recordedAt: Date }[];
}

/** The left-column Patient Panel's list (see components/pro/PatientPanel.tsx) — active
 *  patients only, most recently seen first. Patients with no lastSeen yet (never had a
 *  visit logged) sort last, not first, since a Date-vs-null comparison would otherwise
 *  put them ahead of everyone in an arbitrary order. */
export async function getActivePatients(): Promise<PatientListEntry[]> {
  const user = await requireProUser();
  if (!user) return [];

  const patients = await prisma.clinicalPatient.findMany({
    where: { userId: user.id, status: "active" },
    include: { outcomes: { orderBy: { recordedAt: "desc" } } },
  });

  const sorted = patients.slice().sort((a, b) => {
    if (a.lastSeen && b.lastSeen) return b.lastSeen.getTime() - a.lastSeen.getTime();
    if (a.lastSeen) return -1;
    if (b.lastSeen) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return sorted.map((p) => {
    const seenMeasures = new Set<string>();
    const recentOutcomes: PatientListEntry["recentOutcomes"] = [];
    for (const o of p.outcomes) {
      if (seenMeasures.has(o.measureName)) continue;
      seenMeasures.add(o.measureName);
      recentOutcomes.push({ measureName: o.measureName, score: o.score, maxScore: o.maxScore, recordedAt: o.recordedAt });
    }
    return {
      id: p.id,
      patientCode: p.patientCode,
      condition: p.condition,
      bodyRegion: p.bodyRegion,
      specialty: p.specialty,
      visitCount: p.visitCount,
      totalVisits: p.totalVisits,
      lastSeen: p.lastSeen,
      nextVisit: p.nextVisit,
      status: p.status,
      dueForReassessment: isReassessmentDue(p),
      recentOutcomes,
    };
  });
}

export interface CreatePatientInput {
  patientCode: string;
  condition: string;
  bodyRegion: string;
  specialty: string;
  totalVisits: number;
  nextVisit?: string; // "YYYY-MM-DD"
  /** Optional free-text referral source (e.g. "Dr. Smith — Orthopedics", "Self-referral")
   *  — saved as a ReferralSource row alongside the patient, not a field on ClinicalPatient
   *  itself. Read by the Clinic Report's own referral-sources breakdown (see clinic-pro.ts);
   *  the dashboard's own "Referral Sources" card that used to read it was removed. */
  referralSource?: string;
}

export type ClinicianDashboardResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

export async function createPatient(data: CreatePatientInput): Promise<ClinicianDashboardResult<{ patient: PatientListEntry }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const patientCode = data.patientCode.trim();
  const condition = data.condition.trim();
  if (!patientCode || !condition || !Number.isFinite(data.totalVisits) || data.totalVisits <= 0) {
    return { ok: false, error: "Patient code, condition, and a valid total visit count are required." };
  }

  const existing = await prisma.clinicalPatient.findUnique({
    where: { userId_patientCode: { userId: user.id, patientCode } },
    select: { id: true },
  });
  if (existing) return { ok: false, error: `Patient code "${patientCode}" is already in use.` };

  const created = await prisma.clinicalPatient.create({
    data: {
      userId: user.id,
      patientCode,
      condition,
      bodyRegion: data.bodyRegion,
      specialty: data.specialty,
      totalVisits: Math.round(data.totalVisits),
      nextVisit: data.nextVisit ? new Date(`${data.nextVisit}T00:00:00`) : null,
    },
  });

  const referralSource = data.referralSource?.trim();
  if (referralSource) {
    await prisma.referralSource.create({ data: { userId: user.id, patientId: created.id, source: referralSource } });
  }

  revalidatePath("/pro/dashboard");
  return {
    ok: true,
    patient: {
      id: created.id,
      patientCode: created.patientCode,
      condition: created.condition,
      bodyRegion: created.bodyRegion,
      specialty: created.specialty,
      visitCount: created.visitCount,
      totalVisits: created.totalVisits,
      lastSeen: created.lastSeen,
      nextVisit: created.nextVisit,
      status: created.status,
      dueForReassessment: false,
      recentOutcomes: [],
    },
  };
}

export interface UpdatePatientInput {
  condition?: string;
  bodyRegion?: string;
  specialty?: string;
  totalVisits?: number;
  visitCount?: number;
  lastSeen?: string | null; // "YYYY-MM-DD" or null to clear
  nextVisit?: string | null;
  notes?: string;
}

export async function updatePatient(patientId: string, data: UpdatePatientInput): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  await prisma.clinicalPatient.update({
    where: { id: patientId },
    data: {
      ...(data.condition !== undefined ? { condition: data.condition.trim() } : {}),
      ...(data.bodyRegion !== undefined ? { bodyRegion: data.bodyRegion } : {}),
      ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
      ...(data.totalVisits !== undefined ? { totalVisits: Math.round(data.totalVisits) } : {}),
      ...(data.visitCount !== undefined ? { visitCount: Math.round(data.visitCount) } : {}),
      ...(data.lastSeen !== undefined ? { lastSeen: data.lastSeen ? new Date(`${data.lastSeen}T00:00:00`) : null } : {}),
      ...(data.nextVisit !== undefined ? { nextVisit: data.nextVisit ? new Date(`${data.nextVisit}T00:00:00`) : null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export async function dischargePatient(patientId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  await prisma.clinicalPatient.update({ where: { id: patientId }, data: { status: "discharged" } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface AddOutcomeInput {
  measureName: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export async function addOutcomeEntry(
  patientId: string,
  data: AddOutcomeInput
): Promise<ClinicianDashboardResult<{ outcomes: OutcomeMeasureEntry[] }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  if (!data.measureName || !Number.isFinite(data.score) || !Number.isFinite(data.maxScore) || data.maxScore <= 0) {
    return { ok: false, error: "A measure, a numeric score, and a positive max score are required." };
  }

  await prisma.outcomeMeasureEntry.create({
    data: {
      patientId,
      measureName: data.measureName,
      score: data.score,
      maxScore: data.maxScore,
      notes: data.notes?.trim() || null,
    },
  });

  const outcomes = await prisma.outcomeMeasureEntry.findMany({ where: { patientId }, orderBy: { recordedAt: "asc" } });
  revalidatePath("/pro/dashboard");
  return { ok: true, outcomes };
}

export interface PatientDetail extends PatientListEntry {
  notes: string | null;
  startDate: Date;
  outcomes: OutcomeMeasureEntry[];
  hepAssignments: PatientHEPAssignment[];
  clinicalNotes: ClinicalNote[];
  sessionExerciseLogs: SessionExerciseLog[];
  /** Every generated brief for this patient, most recent first — the client finds
   *  "today's" clinical brief (patientFacing: false) by filtering on generatedAt itself
   *  rather than a second round-trip, since this is already loaded. */
  preBriefs: { id: string; brief: string; patientFacing: boolean; confirmedAt: Date | null; generatedAt: Date }[];
  /** Published MCID/MDC benchmark per distinct measure this patient has a score for (see
   *  getOutcomeBenchmarks) — computed here rather than as a separate client round-trip per
   *  measure, since lib/outcome-benchmarks.ts is server-only and the set of measures is
   *  already known from `outcomes` above. Missing a key means no published benchmark exists
   *  for that measure. */
  benchmarks: Record<string, OutcomeBenchmark>;
  goals: PatientGoalRecord[];
  /** The most recently confirmed discharge summary, if any — same data
   *  getConfirmedDischargeSummary returns, included here too so the read-only "Discharge
   *  Summary" section on a discharged patient's record doesn't need its own round trip. */
  confirmedDischargeSummary: ConfirmedDischargeSummary | null;
}

export async function getPatientDetail(patientId: string): Promise<PatientDetail | null> {
  const user = await requireProUser();
  if (!user) return null;
  const patient = await prisma.clinicalPatient.findUnique({
    where: { id: patientId },
    include: {
      outcomes: { orderBy: { recordedAt: "asc" } },
      hepAssignments: { orderBy: { assignedAt: "desc" } },
      clinicalNotes: { orderBy: { visitNumber: "desc" } },
      sessionExerciseLogs: { orderBy: { loggedAt: "desc" } },
      preBriefs: { orderBy: { generatedAt: "desc" } },
      goals: { orderBy: { createdAt: "desc" } },
      dischargeSummary: { where: { confirmed: true }, orderBy: { confirmedAt: "desc" }, take: 1 },
    },
  });
  if (!patient || patient.userId !== user.id) return null;

  const measureNames = Array.from(new Set(patient.outcomes.map((o) => o.measureName)));
  const benchmarks: Record<string, OutcomeBenchmark> = {};
  for (const name of measureNames) {
    const benchmark = lookupBenchmark(patient.condition, name);
    if (benchmark) benchmarks[name] = benchmark;
  }

  return {
    id: patient.id,
    patientCode: patient.patientCode,
    condition: patient.condition,
    bodyRegion: patient.bodyRegion,
    specialty: patient.specialty,
    visitCount: patient.visitCount,
    totalVisits: patient.totalVisits,
    lastSeen: patient.lastSeen,
    nextVisit: patient.nextVisit,
    status: patient.status,
    notes: patient.notes,
    startDate: patient.startDate,
    dueForReassessment: isReassessmentDue(patient),
    recentOutcomes: [],
    outcomes: patient.outcomes,
    hepAssignments: patient.hepAssignments,
    clinicalNotes: patient.clinicalNotes,
    sessionExerciseLogs: patient.sessionExerciseLogs,
    preBriefs: patient.preBriefs,
    benchmarks,
    goals: patient.goals,
    confirmedDischargeSummary: patient.dischargeSummary[0]
      ? { summary: patient.dischargeSummary[0].summary, confirmedAt: patient.dischargeSummary[0].confirmedAt! }
      : null,
  };
}

export interface AddClinicalNoteInput {
  visitNumber: number;
  noteType: string;
  content: string;
}

export async function addClinicalNote(
  patientId: string,
  data: AddClinicalNoteInput
): Promise<ClinicianDashboardResult<{ note: ClinicalNote }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const content = data.content.trim();
  if (!content || !Number.isFinite(data.visitNumber) || data.visitNumber <= 0) {
    return { ok: false, error: "A visit number and note content are required." };
  }

  const note = await prisma.clinicalNote.create({
    data: { userId: user.id, patientId, visitNumber: Math.round(data.visitNumber), noteType: data.noteType, content },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true, note };
}

export async function assignHEP(
  patientId: string,
  hepId: string | null,
  hepName: string,
  exercises: unknown
): Promise<ClinicianDashboardResult<{ assignment: PatientHEPAssignment }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const trimmedName = hepName.trim();
  if (!trimmedName) return { ok: false, error: "A HEP name is required." };

  // A picked hepId must belong to this clinician too — otherwise a tampered request could
  // link a patient to another clinician's private template (see this file's top comment on
  // never trusting a client-supplied id without checking it against the session).
  if (hepId) {
    const template = await prisma.hEPTemplate.findUnique({ where: { id: hepId }, select: { userId: true } });
    if (!template || template.userId !== user.id) return { ok: false, error: "HEP template not found." };
  }

  const assignment = await prisma.patientHEPAssignment.create({
    data: {
      patientId,
      hepId: hepId || null,
      hepName: trimmedName,
      exercises: exercises == null ? undefined : (exercises as object),
    },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true, assignment };
}

/** Log what was actually done with the patient in one clinic visit (see
 *  SessionExerciseSection.tsx) — separate from assignHEP above, which is what the patient
 *  does on their own between visits. Same visitNumber convention as addClinicalNote. */
export async function addSessionExerciseLog(
  patientId: string,
  visitNumber: number,
  exercises: HepTemplateExercise[]
): Promise<ClinicianDashboardResult<{ log: SessionExerciseLog }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  if (!Number.isFinite(visitNumber) || visitNumber <= 0) return { ok: false, error: "A visit number is required." };
  const cleaned = exercises.filter((ex) => ex.name.trim().length > 0);
  if (cleaned.length === 0) return { ok: false, error: "Add at least one exercise." };

  const log = await prisma.sessionExerciseLog.create({
    data: { userId: user.id, patientId, visitNumber: Math.round(visitNumber), exercises: cleaned as object },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true, log };
}

/** Correct a session that was already logged — a clinician writing up a visit from memory
 *  gets the weight or the rep count wrong often enough that append-only history was the
 *  wrong shape here. Overwrites the row in place rather than superseding it with a new one:
 *  computeExerciseProgression reads every log for a patient, so a correction kept as a
 *  second row for the same visit would show up as a phantom progression step between the
 *  wrong numbers and the right ones. Same ownership check as addSessionExerciseLog. */
export async function updateSessionExerciseLog(
  logId: string,
  visitNumber: number,
  exercises: HepTemplateExercise[]
): Promise<ClinicianDashboardResult<{ log: SessionExerciseLog }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const existing = await prisma.sessionExerciseLog.findUnique({ where: { id: logId } });
  if (!existing || existing.userId !== user.id) return { ok: false, error: "Session not found." };

  if (!Number.isFinite(visitNumber) || visitNumber <= 0) return { ok: false, error: "A visit number is required." };
  const cleaned = exercises.filter((ex) => ex.name.trim().length > 0);
  if (cleaned.length === 0) return { ok: false, error: "Add at least one exercise." };

  // loggedAt is deliberately left as it was — it records when the visit happened, not when
  // the write did, so a later correction shouldn't move a past session to today.
  const log = await prisma.sessionExerciseLog.update({
    where: { id: logId },
    data: { visitNumber: Math.round(visitNumber), exercises: cleaned as object },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true, log };
}

/** Remove a session logged in error — e.g. logged against the wrong patient. */
export async function deleteSessionExerciseLog(logId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const existing = await prisma.sessionExerciseLog.findUnique({ where: { id: logId } });
  if (!existing || existing.userId !== user.id) return { ok: false, error: "Session not found." };

  await prisma.sessionExerciseLog.delete({ where: { id: logId } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** Active patients where visitCount is a multiple of REASSESSMENT_INTERVAL_VISITS (and
 *  not zero — a brand-new patient with no visits yet isn't "due"), or it's been more than
 *  REASSESSMENT_STALE_DAYS since they were last seen. Same isReassessmentDue check the
 *  Daily Brief tile and the patient-panel badge already use — this is the one place that
 *  returns the actual patient rows behind that count, for a future dedicated view. */
export async function getPatientsNeedingReassessment(): Promise<PatientListEntry[]> {
  const patients = await getActivePatients();
  return patients.filter((p) => p.dueForReassessment);
}

async function loadBriefContext(userId: string, patientId: string) {
  const patient = await prisma.clinicalPatient.findUnique({
    where: { id: patientId },
    include: {
      outcomes: { orderBy: { recordedAt: "asc" } },
      hepAssignments: { orderBy: { assignedAt: "desc" }, take: 1 },
    },
  });
  if (!patient || patient.userId !== userId) return null;
  return {
    patientCode: patient.patientCode,
    condition: patient.condition,
    bodyRegion: patient.bodyRegion,
    visitCount: patient.visitCount,
    totalVisits: patient.totalVisits,
    outcomes: patient.outcomes.map((o) => ({
      measureName: o.measureName,
      score: o.score,
      maxScore: o.maxScore,
      recordedAt: o.recordedAt,
    })),
    lastHEP: patient.hepAssignments[0]?.hepName,
  };
}

/** Step behind "Generate Pre-Visit Brief" / its "Regenerate" button on the active-patient
 *  workspace (see app/pro/dashboard/page.tsx) — always generates a fresh brief and saves
 *  it (patientFacing: false), whether this is the first brief for today or a regenerate.
 *  getPatientDetail's preBriefs list is what lets the workspace show an already-generated
 *  today's brief without calling this again on every render. */
export async function generatePreVisitBriefAction(patientId: string): Promise<ClinicianDashboardResult<{ brief: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const context = await loadBriefContext(user.id, patientId);
  if (!context) return { ok: false, error: "Patient not found." };

  const brief = await generateClinicalBrief(context);
  if (!brief) return { ok: false, error: "Limbic Agent isn't available right now. Try again in a moment." };

  await prisma.preVisitBrief.create({ data: { userId: user.id, patientId, brief, patientFacing: false } });
  revalidatePath("/pro/dashboard");
  return { ok: true, brief };
}

/** Step 1 of the "Prepare for Patient" modal (see components/pro/PreparePatientModal.tsx)
 *  — generates without saving, since the clinician reviews and can edit the text before
 *  confirmPatientBrief actually persists it. */
export async function generatePatientFacingBriefAction(patientId: string): Promise<ClinicianDashboardResult<{ brief: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const context = await loadBriefContext(user.id, patientId);
  if (!context) return { ok: false, error: "Patient not found." };

  const brief = await generatePatientBrief(context);
  if (!brief) return { ok: false, error: "Limbic Agent isn't available right now. Try again in a moment." };

  return { ok: true, brief };
}

/** Saves the clinician-reviewed (and possibly edited) patient-facing brief from Step 1 of
 *  the "Prepare for Patient" modal — confirmedAt marks it as the version actually shown to
 *  the patient, distinct from generatePatientFacingBriefAction's unsaved draft. */
export async function confirmPatientBrief(patientId: string, briefText: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const brief = briefText.trim();
  if (!brief) return { ok: false, error: "Brief text can't be empty." };

  await prisma.preVisitBrief.create({
    data: { userId: user.id, patientId, brief, patientFacing: true, confirmedAt: new Date() },
  });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface AvailableHEP {
  id: string;
  name: string;
  bodyPart: string;
  // The template's saved exercises (see HEPTemplate.exercises in schema.prisma) — carried
  // along so HEPSection can snapshot them straight into the PatientHEPAssignment it creates
  // (see assignHEP below) rather than assigning a name with no exercise content, which is
  // what the picker used to do.
  exercises: HepTemplateExercise[];
}

/** The "Assign HEP" form's searchable dropdown (see components/pro/AssignHEPForm.tsx) —
 *  every saved template belonging to this clinician, for the "assign from a saved
 *  program" path (the form's "Enter manually" option bypasses this entirely). */
export async function getAvailableHEPs(): Promise<AvailableHEP[]> {
  const user = await requireProUser();
  if (!user) return [];
  const templates = await prisma.hEPTemplate.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, bodyPart: true, exercises: true },
    orderBy: { name: "asc" },
  });
  return templates.map((t) => ({ id: t.id, name: t.name, bodyPart: t.bodyPart, exercises: parseHepExercises(t.exercises) }));
}

/* ============================================================================
   Daily habit features (Morning Rounds view, visit logging, outcome reminders, End of
   Day summary) — see components/pro/dashboard/MorningRounds.tsx and the visit-log banner
   in ClinicianDashboard.tsx. Same conventions as the rest of this file: every action
   re-derives the user from the session, never a client-supplied id.
   ============================================================================ */

/** Active patients whose nextVisit falls on today's local date, earliest first — the
 *  Morning Rounds view's "Today's Patients" list. nextVisit is stored at local midnight
 *  (see createPatient/updatePatient), so a plain date-string comparison is enough — no
 *  need for a day-boundary range query. */
export async function getTodaysPatients(): Promise<PatientListEntry[]> {
  const patients = await getActivePatients();
  const today = todayLocalDateStr();
  return patients
    .filter((p) => p.nextVisit != null && todayLocalDateStr(p.nextVisit) === today)
    .sort((a, b) => a.nextVisit!.getTime() - b.nextVisit!.getTime());
}

/** Whether this patient already has a VisitLog entry within the last 24 hours — the
 *  visit-confirmation banner (see ClinicianDashboard.tsx) checks this before showing "Did
 *  you see [code] today?" so a clinician who already logged the visit isn't asked again on
 *  every reselect. A rolling 24-hour window rather than a calendar-day (midnight-to-
 *  midnight) one — logging a visit at 11pm and having the banner able to reappear an hour
 *  later, once it's technically "a new day," defeated the point of suppressing it. */
export async function hasLoggedVisitRecently(patientId: string): Promise<boolean> {
  const user = await requireProUser();
  if (!user) return false;
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return false;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.visitLog.count({ where: { patientId, loggedAt: { gte: oneDayAgo } } });
  return count > 0;
}

/** "Yes — Log Visit" on the visit-confirmation banner — bumps visitCount and lastSeen on
 *  the patient record and writes a VisitLog row in one transaction, so the two can never
 *  drift out of sync (a visitCount bump with no corresponding log, or vice versa). */
export async function logVisit(patientId: string): Promise<ClinicianDashboardResult<{ visitCount: number }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const now = new Date();
  const [updated] = await prisma.$transaction([
    prisma.clinicalPatient.update({ where: { id: patientId }, data: { visitCount: { increment: 1 }, lastSeen: now } }),
    prisma.visitLog.create({ data: { userId: user.id, patientId, visitNumber: patient.visitCount + 1 } }),
  ]);

  revalidatePath("/pro/dashboard");
  return { ok: true, visitCount: updated.visitCount };
}

/** Active patients at a REASSESSMENT_INTERVAL_VISITS milestone (visitCount a nonzero
 *  multiple of 6) who don't already have an outcome entry recorded today — distinct from
 *  getPatientsNeedingReassessment's dueForReassessment flag (which also fires on staleness
 *  and doesn't clear itself the moment a score is logged): this is specifically "flagged
 *  today, and still needs today's score," for the Morning Rounds reminders section and the
 *  workspace's milestone banner. */
export async function getPatientsWithOutcomeReminders(): Promise<PatientListEntry[]> {
  const patients = await getActivePatients();
  const milestonePatients = patients.filter((p) => p.visitCount > 0 && p.visitCount % REASSESSMENT_INTERVAL_VISITS === 0);
  if (milestonePatients.length === 0) return [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysOutcomes = await prisma.outcomeMeasureEntry.findMany({
    where: { patientId: { in: milestonePatients.map((p) => p.id) }, recordedAt: { gte: startOfToday } },
    select: { patientId: true },
  });
  const recordedTodayIds = new Set(todaysOutcomes.map((o) => o.patientId));
  return milestonePatients.filter((p) => !recordedTodayIds.has(p.id));
}

export interface EndOfDaySummaryData {
  patientsSeen: number;
  notesCompleted: number;
  notesOutstanding: number;
  ceHoursThisWeek: number;
  dismissed: boolean;
}

/** Computes today's End of Day stats and upserts them onto EndOfDaySummary, refreshing the
 *  counts on every call (a clinician could still log a visit or a note after first opening
 *  the card) without touching `dismissed` — only dismissEndOfDaySummary sets that. Safe to
 *  call repeatedly; the client only calls it once local time is past 4pm (see
 *  components/pro/dashboard/MorningRounds.tsx), but nothing here depends on that. */
export async function getEndOfDaySummary(): Promise<EndOfDaySummaryData | null> {
  const user = await requireProUser();
  if (!user) return null;

  const dateKey = todayLocalDateStr();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(new Date());

  const [visitLogsToday, notesToday, activePatients, ceLogsThisWeek] = await Promise.all([
    prisma.visitLog.findMany({ where: { userId: user.id, loggedAt: { gte: startOfToday } }, select: { patientId: true } }),
    prisma.clinicalNote.count({ where: { userId: user.id, createdAt: { gte: startOfToday } } }),
    prisma.clinicalPatient.findMany({
      where: { userId: user.id, status: "active" },
      select: { id: true, visitCount: true, clinicalNotes: { select: { visitNumber: true } } },
    }),
    prisma.cELog.findMany({ where: { userId: user.id, completedAt: { gte: weekStart } }, select: { hours: true } }),
  ]);

  const seenTodayIds = new Set(visitLogsToday.map((v) => v.patientId));
  const notesOutstanding = activePatients.filter(
    (p) => seenTodayIds.has(p.id) && p.visitCount > 0 && !p.clinicalNotes.some((n) => n.visitNumber === p.visitCount)
  ).length;
  const ceHoursThisWeek = ceLogsThisWeek.reduce((sum, l) => sum + l.hours, 0);

  const data = {
    patientsSeen: seenTodayIds.size,
    notesCompleted: notesToday,
    notesOutstanding,
    ceHoursThisWeek,
  };

  const summary = await prisma.endOfDaySummary.upsert({
    where: { userId_dateKey: { userId: user.id, dateKey } },
    update: data,
    create: { userId: user.id, dateKey, ...data },
  });

  return {
    patientsSeen: summary.patientsSeen,
    notesCompleted: summary.notesCompleted,
    notesOutstanding: summary.notesOutstanding,
    ceHoursThisWeek: summary.ceHoursThisWeek,
    dismissed: summary.dismissed,
  };
}

/** "Dismiss" on the End of Day card — hides it for the rest of today without deleting the
 *  underlying stats. Upserts rather than a plain update since a clinician could theoretically
 *  dismiss before getEndOfDaySummary has ever created today's row (defensive only — the UI
 *  always calls getEndOfDaySummary first to render the card's numbers). */
export async function dismissEndOfDaySummary(): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };

  const dateKey = todayLocalDateStr();
  await prisma.endOfDaySummary.upsert({
    where: { userId_dateKey: { userId: user.id, dateKey } },
    update: { dismissed: true },
    create: { userId: user.id, dateKey, patientsSeen: 0, notesCompleted: 0, notesOutstanding: 0, ceHoursThisWeek: 0, dismissed: true },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/* ============================================================================
   Clinical intelligence features (Condition Intelligence card, outcome benchmarking,
   treatment idea generator, red flag monitor). Same conventions as the rest of this file.
   ============================================================================ */

export interface ConditionIntelligenceData {
  topMeasures: string[];
  episodeLength: string;
  guideline: string;
  boardPearl: string;
}

/** Static lookup only (see lib/condition-intelligence.ts's own comment on why) — gated
 *  behind requireProUser for consistency with every other action here, not because the
 *  data itself is sensitive. */
export async function getConditionIntelligence(condition: string): Promise<ConditionIntelligenceData | null> {
  const user = await requireProUser();
  if (!user) return null;
  return conditionIntelligenceMap[condition] ?? null;
}

/** "What should I try next?" on the active patient workspace — generates without
 *  overwriting: every call creates a fresh TreatmentIdea row (see
 *  components/pro/dashboard/TreatmentIdeasCard.tsx, which shows today's most recent row if
 *  one exists before offering to generate, same "don't call the model again for nothing"
 *  reasoning as the pre-visit brief). */
export async function generateTreatmentIdeas(patientId: string): Promise<ClinicianDashboardResult<{ ideas: string[] }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const context = await loadBriefContext(user.id, patientId);
  if (!context) return { ok: false, error: "Patient not found." };

  const ideas = await generateTreatmentIdeasBrief(context);
  if (!ideas) return { ok: false, error: "Limbic Agent isn't available right now. Try again in a moment." };

  await prisma.treatmentIdea.create({ data: { userId: user.id, patientId, ideas } });
  revalidatePath("/pro/dashboard");
  return { ok: true, ideas };
}

export interface TreatmentIdeaRecord {
  id: string;
  ideas: string[];
  generatedAt: Date;
}

/** Today's most recently generated treatment ideas for this patient, if any — lets
 *  TreatmentIdeasCard show a saved result instead of an empty "generate" prompt on
 *  reopen, same pattern as PreVisitBriefSection's savedToday lookup. */
export async function getTodaysTreatmentIdeas(patientId: string): Promise<TreatmentIdeaRecord | null> {
  const user = await requireProUser();
  if (!user) return null;
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const row = await prisma.treatmentIdea.findFirst({
    where: { patientId, generatedAt: { gte: startOfToday } },
    orderBy: { generatedAt: "desc" },
  });
  if (!row) return null;
  return { id: row.id, ideas: row.ideas as unknown as string[], generatedAt: row.generatedAt };
}

/** Runs lib/red-flag-detector.ts's checks against this patient's current outcome/visit
 *  data and persists any newly-detected pattern as a RedFlagAlert — "newly-detected" means
 *  no existing row (dismissed or not) already carries that exact (flagType, description)
 *  pair for this patient, so re-running this on every outcome save or patient open doesn't
 *  spam duplicate rows, and a dismissed alert only comes back once the underlying
 *  situation has actually changed (a different description — e.g. a new decline event, a
 *  higher day count crossing a new threshold), not just because the same still-true
 *  condition was checked again. Returns every currently-undismissed alert for the patient,
 *  which is what the workspace's Clinical Alert banner renders. */
export async function checkRedFlags(patientId: string): Promise<ClinicianDashboardResult<{ alerts: RedFlagAlert[] }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const [outcomes, existingAlerts] = await Promise.all([
    prisma.outcomeMeasureEntry.findMany({ where: { patientId } }),
    prisma.redFlagAlert.findMany({ where: { patientId } }),
  ]);

  const detected = detectRedFlags({ outcomes, visitCount: patient.visitCount, lastSeen: patient.lastSeen });
  const existingSignatures = new Set(existingAlerts.map((a) => `${a.flagType}::${a.description}`));
  const newOnes = detected.filter((d) => !existingSignatures.has(`${d.type}::${d.description}`));

  if (newOnes.length > 0) {
    await prisma.redFlagAlert.createMany({
      data: newOnes.map((d) => ({ userId: user.id, patientId, flagType: d.type, description: d.description })),
    });
  }

  const activeAlerts = await prisma.redFlagAlert.findMany({
    where: { patientId, dismissed: false },
    orderBy: { createdAt: "desc" },
  });
  return { ok: true, alerts: activeAlerts };
}

/** "Dismiss" on one bullet of the Clinical Alert banner — per-alert, not per-patient, so
 *  dismissing one detected pattern never hides a different one still active. */
export async function dismissRedFlagAlert(alertId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const alert = await prisma.redFlagAlert.findUnique({ where: { id: alertId } });
  if (!alert || alert.userId !== user.id) return { ok: false, error: "Alert not found." };

  await prisma.redFlagAlert.update({ where: { id: alertId }, data: { dismissed: true } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface OutcomeBenchmark {
  mcid: number;
  mdc: number;
  description: string;
  source: string;
  higherIsBetter: boolean;
}

function lookupBenchmark(condition: string, measureName: string): OutcomeBenchmark | null {
  const entry = mcidValues[measureName];
  if (!entry) return null;
  return entry[condition] ?? entry.default ?? null;
}

/** Published MCID/MDC lookup (lib/outcome-benchmarks.ts) — `condition` is checked first
 *  for a future condition-specific entry, falling back to each measure's "default" row,
 *  which is all the static data has today. Takes only the two fields the lookup actually
 *  needs — a single score/maxScore pair can't tell you an "improvement" on its own; the
 *  improvement-vs-MCID comparison the workspace shows is computed by the caller from the
 *  patient's own score *history* (first recorded vs. latest — see
 *  OutcomeMeasuresSection.tsx and PracticeMetrics.tsx's peer-comparison cards), not from a
 *  single point this action would otherwise have to ignore. */
export async function getOutcomeBenchmarks(condition: string, measureName: string): Promise<OutcomeBenchmark | null> {
  const user = await requireProUser();
  if (!user) return null;
  return lookupBenchmark(condition, measureName);
}

/* ============================================================================
   Practice building features (Episode Length Tracker, Discharge Summary Generator, Goal
   Bank Integration, Referral Tracker). Same conventions as the rest of this file.
   ============================================================================ */

/** Static goal-text lookup (lib/goal-bank.ts) for the "Suggested Goals" panel —
 *  `bodyRegion` isn't needed for the lookup itself (goalBank is keyed on the
 *  "Region — Function" category label alone, which already encodes the region), but is
 *  kept in the signature to match how PatientGoalsSection.tsx calls this alongside the
 *  patient's own bodyRegion for a future region-aware ranking of suggestions. */
export async function getGoalBankSuggestions(_bodyRegion: string, category: string): Promise<string[]> {
  const user = await requireProUser();
  if (!user) return [];
  return goalBank[category] ?? [];
}

export interface PatientGoalRecord {
  id: string;
  goalText: string;
  category: string;
  timeframe: string;
  status: string;
  createdAt: Date;
}

export async function addPatientGoal(
  patientId: string,
  goalText: string,
  category: string,
  timeframe: string
): Promise<ClinicianDashboardResult<{ goal: PatientGoalRecord }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const trimmedText = goalText.trim();
  if (!trimmedText) return { ok: false, error: "Goal text is required." };

  const goal = await prisma.patientGoal.create({
    data: { userId: user.id, patientId, goalText: trimmedText, category, timeframe: timeframe.trim() },
  });

  revalidatePath("/pro/dashboard");
  return { ok: true, goal };
}

/** Status dropdown on each goal row — active | met | partially-met | not-met (see
 *  GOAL_STATUSES in lib/clinician-dashboard-types.ts). */
export async function updateGoalStatus(goalId: string, status: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const goal = await prisma.patientGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) return { ok: false, error: "Goal not found." };

  await prisma.patientGoal.update({ where: { id: goalId }, data: { status } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

async function loadDischargeContext(userId: string, patientId: string) {
  const patient = await prisma.clinicalPatient.findUnique({
    where: { id: patientId },
    include: {
      outcomes: { orderBy: { recordedAt: "asc" } },
      goals: { orderBy: { createdAt: "asc" } },
      hepAssignments: { orderBy: { assignedAt: "desc" }, take: 1 },
    },
  });
  if (!patient || patient.userId !== userId) return null;
  return {
    patientCode: patient.patientCode,
    condition: patient.condition,
    bodyRegion: patient.bodyRegion,
    visitCount: patient.visitCount,
    totalVisits: patient.totalVisits,
    outcomes: patient.outcomes.map((o) => ({
      measureName: o.measureName,
      score: o.score,
      maxScore: o.maxScore,
      recordedAt: o.recordedAt,
    })),
    goals: patient.goals.map((g) => ({ goalText: g.goalText, status: g.status })),
    lastHEP: patient.hepAssignments[0]?.hepName,
  };
}

/** Step 1 of the "Before You Discharge" modal — generates and saves a draft (confirmed:
 *  false) DischargeSummary, which confirmDischargeSummary later finalizes. Every call
 *  creates a fresh row (same "Regenerate creates, doesn't overwrite" reasoning as
 *  generateTreatmentIdeas) — the modal only ever shows the most recent one. */
export async function generateDischargeSummaryAction(patientId: string): Promise<ClinicianDashboardResult<{ summary: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const context = await loadDischargeContext(user.id, patientId);
  if (!context) return { ok: false, error: "Patient not found." };

  const summary = await generateDischargeSummaryBrief(context);
  if (!summary) return { ok: false, error: "Limbic Agent isn't available right now. Try again in a moment." };

  await prisma.dischargeSummary.create({ data: { userId: user.id, patientId, summary, confirmed: false } });
  revalidatePath("/pro/dashboard");
  return { ok: true, summary };
}

/** "Confirm and Discharge" — finalizes the most recent draft summary (or, if the clinician
 *  somehow reaches this with no prior generate call, creates one directly as confirmed) with
 *  whatever text is currently in the modal's editable textarea, which may differ from what
 *  was generated if the clinician edited it. Does not itself call dischargePatient — the
 *  modal calls both in sequence, same "compose two small actions" shape as everywhere else
 *  a UI flow needs more than one mutation. */
export async function confirmDischargeSummary(patientId: string, summaryText: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const summary = summaryText.trim();
  if (!summary) return { ok: false, error: "Summary text can't be empty." };

  const draft = await prisma.dischargeSummary.findFirst({ where: { patientId, confirmed: false }, orderBy: { createdAt: "desc" } });
  if (draft) {
    await prisma.dischargeSummary.update({
      where: { id: draft.id },
      data: { summary, confirmed: true, confirmedAt: new Date() },
    });
  } else {
    await prisma.dischargeSummary.create({
      data: { userId: user.id, patientId, summary, confirmed: true, confirmedAt: new Date() },
    });
  }

  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface ConfirmedDischargeSummary {
  summary: string;
  confirmedAt: Date;
}

/** The read-only "Discharge Summary" section on a discharged patient's record — the most
 *  recently confirmed summary, if any (a patient discharged via "Discharge Without
 *  Summary" simply has none). */
export async function getConfirmedDischargeSummary(patientId: string): Promise<ConfirmedDischargeSummary | null> {
  const user = await requireProUser();
  if (!user) return null;
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return null;

  const row = await prisma.dischargeSummary.findFirst({
    where: { patientId, confirmed: true },
    orderBy: { confirmedAt: "desc" },
  });
  if (!row || !row.confirmedAt) return null;
  return { summary: row.summary, confirmedAt: row.confirmedAt };
}

export async function addReferralSource(patientId: string, source: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const patient = await requireOwnedPatient(user.id, patientId);
  if (!patient) return { ok: false, error: "Patient not found." };

  const trimmedSource = source.trim();
  if (!trimmedSource) return { ok: false, error: "A referral source is required." };

  await prisma.referralSource.create({ data: { userId: user.id, patientId, source: trimmedSource } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

export interface EpisodeLengthStats {
  overallAverageVisits: number | null;
  totalDischarged: number;
  byRegion: { bodyRegion: string; averageVisits: number; patientCount: number }[];
}

/** Practice Metrics zone's Episode Length card — averages visitCount (visits actually
 *  completed by the time of discharge), not totalVisits (the originally *planned* count
 *  the active-caseload Episode Length card in PracticeMetrics.tsx uses) — a discharged
 *  patient's real episode length is what they actually needed, which may differ from plan. */
export async function getEpisodeLengthStats(): Promise<EpisodeLengthStats> {
  const user = await requireProUser();
  if (!user) return { overallAverageVisits: null, totalDischarged: 0, byRegion: [] };

  const discharged = await prisma.clinicalPatient.findMany({
    where: { userId: user.id, status: "discharged" },
    select: { visitCount: true, bodyRegion: true },
  });

  if (discharged.length === 0) return { overallAverageVisits: null, totalDischarged: 0, byRegion: [] };

  const overallAverageVisits = discharged.reduce((sum, p) => sum + p.visitCount, 0) / discharged.length;

  const byRegionMap = new Map<string, number[]>();
  for (const p of discharged) {
    const list = byRegionMap.get(p.bodyRegion) ?? [];
    list.push(p.visitCount);
    byRegionMap.set(p.bodyRegion, list);
  }
  const byRegion = Array.from(byRegionMap.entries()).map(([bodyRegion, visits]) => ({
    bodyRegion,
    averageVisits: visits.reduce((sum, v) => sum + v, 0) / visits.length,
    patientCount: visits.length,
  }));

  return { overallAverageVisits, totalDischarged: discharged.length, byRegion };
}

/* ============================================================================
   Professional connection features (Specialty Research Digest, Clinical Question Log,
   Peer Comparison via MCID Benchmarks). Same conventions as the rest of this file. The CE
   Due Date Countdown card that used to live here was removed from the dashboard — CE
   Tracker (/pro/ce-tracker) is the one place renewal date/progress is shown.
   ============================================================================ */

/** Thin wrapper around lib/dashboard-research.ts's own getWeeklyResearchDigest — kept here
 *  too (re-exported under the same name) so every dashboard data-fetch this feature spec
 *  asked for lives in this one actions file, matching where the rest of them live. */
export async function getWeeklyResearchDigest(specialty: string): Promise<WeeklyResearchDigest> {
  const user = await requireProUser();
  if (!user) return { specialtyLabel: "Your Specialty", articles: [], rangeStart: "", rangeEnd: "" };
  return getWeeklyResearchDigestFeed(specialty);
}

export interface ClinicalQuestionRecord {
  id: string;
  question: string;
  answered: boolean;
  createdAt: Date;
}

const UNANSWERED_QUESTIONS_LIMIT = 10;

/** "Add Question" on the Clinical Question Log (right column, default workspace state). */
export async function logClinicalQuestion(question: string): Promise<ClinicianDashboardResult<{ question: ClinicalQuestionRecord }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const trimmed = question.trim();
  if (!trimmed) return { ok: false, error: "A question is required." };

  const created = await prisma.clinicalQuestion.create({ data: { userId: user.id, question: trimmed } });
  revalidatePath("/pro/dashboard");
  return { ok: true, question: created };
}

/** "Ask Limbic Agent" on a logged question — marks it answered and hands back the question
 *  text so the client can open /agent?topic=... in a new tab (the real Limbic Agent route
 *  in this app — the feature spec this shipped from said "/pro/agent", which doesn't
 *  exist; see AppShell.tsx's own nav link for the real one). This action only marks the
 *  question answered — it doesn't record what the agent actually said, since Limbic Agent
 *  itself isn't wired to report back into this dashboard. */
export async function answerClinicalQuestion(questionId: string): Promise<ClinicianDashboardResult<{ question: string }>> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const record = await prisma.clinicalQuestion.findUnique({ where: { id: questionId } });
  if (!record || record.userId !== user.id) return { ok: false, error: "Question not found." };

  await prisma.clinicalQuestion.update({ where: { id: questionId }, data: { answered: true, answeredAt: new Date() } });
  revalidatePath("/pro/dashboard");
  return { ok: true, question: record.question };
}

export async function deleteClinicalQuestion(questionId: string): Promise<ClinicianDashboardResult> {
  const user = await requireProUser();
  if (!user) return { ok: false, error: "Not authorized." };
  const record = await prisma.clinicalQuestion.findUnique({ where: { id: questionId } });
  if (!record || record.userId !== user.id) return { ok: false, error: "Question not found." };

  await prisma.clinicalQuestion.delete({ where: { id: questionId } });
  revalidatePath("/pro/dashboard");
  return { ok: true };
}

/** Up to UNANSWERED_QUESTIONS_LIMIT unanswered questions, most recent first — the Question
 *  Log's own "maximum 10 unanswered questions shown" cap. Answered questions are a
 *  separate, collapsed-by-default list the client already has via the same fetch (see
 *  getAllQuestions below) rather than a second round trip. */
export async function getUnansweredQuestions(): Promise<ClinicalQuestionRecord[]> {
  const user = await requireProUser();
  if (!user) return [];
  return prisma.clinicalQuestion.findMany({
    where: { userId: user.id, answered: false },
    orderBy: { createdAt: "desc" },
    take: UNANSWERED_QUESTIONS_LIMIT,
  });
}

export interface ClinicalQuestionLogView {
  unanswered: ClinicalQuestionRecord[];
  unansweredTotalCount: number;
  answered: ClinicalQuestionRecord[];
}

/** Everything the Clinical Question Log section needs in one call — the unanswered list
 *  (capped, plus the true total so the UI can show a "See all" link only when there's more
 *  than the cap), and answered questions for the collapsed "Answered" rows. */
export async function getAllQuestions(): Promise<ClinicalQuestionLogView> {
  const user = await requireProUser();
  if (!user) return { unanswered: [], unansweredTotalCount: 0, answered: [] };

  const [unanswered, unansweredTotalCount, answered] = await Promise.all([
    prisma.clinicalQuestion.findMany({
      where: { userId: user.id, answered: false },
      orderBy: { createdAt: "desc" },
      take: UNANSWERED_QUESTIONS_LIMIT,
    }),
    prisma.clinicalQuestion.count({ where: { userId: user.id, answered: false } }),
    prisma.clinicalQuestion.findMany({ where: { userId: user.id, answered: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return { unanswered, unansweredTotalCount, answered };
}

export interface PeerComparisonBenchmark {
  measureName: string;
  averageImprovement: number;
  patientCount: number;
  benchmark: OutcomeBenchmark;
}

/** Practice Metrics zone's "How Your Patients Compare" section — for every outcome measure
 *  where at least 2 of this clinician's patients each have 2+ recorded scores, averages
 *  each patient's own (latest minus first) improvement, sign-adjusted per
 *  benchmark.higherIsBetter so a "lower is better" measure like NPRS still reads as a
 *  positive number when pain went down. All patients (active and discharged) count here —
 *  unlike the Episode Length cards, this isn't scoped to one status. */
export async function getPeerComparisonBenchmarks(): Promise<PeerComparisonBenchmark[]> {
  const user = await requireProUser();
  if (!user) return [];

  const patients = await prisma.clinicalPatient.findMany({
    where: { userId: user.id },
    select: { condition: true, outcomes: { orderBy: { recordedAt: "asc" }, select: { measureName: true, score: true, maxScore: true } } },
  });

  const perMeasure = new Map<string, { improvements: number[]; benchmark: OutcomeBenchmark }>();
  for (const patient of patients) {
    const byMeasure = new Map<string, { score: number; maxScore: number }[]>();
    for (const o of patient.outcomes) {
      const list = byMeasure.get(o.measureName) ?? [];
      list.push({ score: o.score, maxScore: o.maxScore });
      byMeasure.set(o.measureName, list);
    }
    for (const [measureName, entries] of byMeasure) {
      if (entries.length < 2) continue;
      const benchmark = lookupBenchmark(patient.condition, measureName);
      if (!benchmark) continue;
      const rawChange = entries[entries.length - 1].score - entries[0].score;
      const improvement = benchmark.higherIsBetter ? rawChange : -rawChange;
      const bucket = perMeasure.get(measureName) ?? { improvements: [], benchmark };
      bucket.improvements.push(improvement);
      perMeasure.set(measureName, bucket);
    }
  }

  const results: PeerComparisonBenchmark[] = [];
  for (const [measureName, bucket] of perMeasure) {
    if (bucket.improvements.length < 2) continue;
    const averageImprovement = bucket.improvements.reduce((sum, v) => sum + v, 0) / bucket.improvements.length;
    results.push({ measureName, averageImprovement, patientCount: bucket.improvements.length, benchmark: bucket.benchmark });
  }
  return results.sort((a, b) => b.patientCount - a.patientCount);
}
