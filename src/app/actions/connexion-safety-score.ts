"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isSiteAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import {
  allSafetyScoreItems,
  computeSafetyScoreTotals,
  type EquipmentRecommendation,
  type CaregiverSkillStatus,
} from "@/lib/connexion-safety-score";

async function requireSiteAdminUser() {
  if (!(await isSiteAdmin())) return null;
  return getCurrentUser();
}

/** Clamps every known rubric item to an integer 0-4, defaulting anything missing/invalid to
 *  0 — the form always submits a complete map, but this is the write path's own guarantee
 *  that a stored assessment can never carry a score outside the rubric's own scale, whatever
 *  the client sent. */
function sanitizeItemScores(input: Record<string, number>): Record<string, number> {
  const clean: Record<string, number> = {};
  for (const item of allSafetyScoreItems()) {
    const raw = input[item.key];
    clean[item.key] = Number.isFinite(raw) ? Math.min(4, Math.max(0, Math.round(raw))) : 0;
  }
  return clean;
}

export interface SafetyAssessmentInput {
  clientName: string;
  clientAddress?: string;
  assessmentDate: string; // yyyy-mm-dd
  visitRequestId?: string | null;
  itemScores: Record<string, number>;
  criticalFindings: string[];
  criticalFindingsOther?: string;
  equipment: EquipmentRecommendation[];
  caregiverSkills: Record<string, CaregiverSkillStatus>;
  priorityActionsUrgent?: string;
  priorityActionsSoon?: string;
  priorityActionsMonitor?: string;
  biggestRisk?: string;
  mostImportantChange?: string;
  equipmentRecommendedNote?: string;
  caregiverTrainingNote?: string;
  followUp?: string;
  followUpOther?: string;
  ptRecommendation?: string;
}

export interface SafetyAssessmentActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function toWriteData(input: SafetyAssessmentInput) {
  const scores = sanitizeItemScores(input.itemScores);
  const totals = computeSafetyScoreTotals(scores);
  return {
    clientName: input.clientName.trim(),
    clientAddress: input.clientAddress?.trim() || null,
    assessmentDate: new Date(`${input.assessmentDate}T00:00:00`),
    visitRequestId: input.visitRequestId || null,
    itemScores: JSON.stringify(scores),
    environmentalScore: totals.environmental,
    mobilityScore: totals.mobility,
    fallRiskScore: totals.fallRisk,
    totalScore: totals.total,
    riskLevel: totals.riskLevel,
    criticalFindings: JSON.stringify(input.criticalFindings ?? []),
    criticalFindingsOther: input.criticalFindingsOther?.trim() || null,
    equipment: JSON.stringify(input.equipment ?? []),
    caregiverSkills: JSON.stringify(input.caregiverSkills ?? {}),
    priorityActionsUrgent: input.priorityActionsUrgent?.trim() || null,
    priorityActionsSoon: input.priorityActionsSoon?.trim() || null,
    priorityActionsMonitor: input.priorityActionsMonitor?.trim() || null,
    biggestRisk: input.biggestRisk?.trim() || null,
    mostImportantChange: input.mostImportantChange?.trim() || null,
    equipmentRecommendedNote: input.equipmentRecommendedNote?.trim() || null,
    caregiverTrainingNote: input.caregiverTrainingNote?.trim() || null,
    followUp: input.followUp || null,
    followUpOther: input.followUpOther?.trim() || null,
    ptRecommendation: input.ptRecommendation?.trim() || null,
  };
}

/** Creates a new Connexion Safety Score assessment — see SafetyAssessmentForm.tsx (mode
 *  "create") on /admin/connexion-safety-score/new. Any site admin can administer one, not
 *  just whoever eventually opens/edits it — same shared-admin-tool model as
 *  updateVisitRequestStatusAction in app/actions/connexion.ts, not a per-user private record
 *  like ClinicalPatient. */
export async function createSafetyAssessment(input: SafetyAssessmentInput): Promise<SafetyAssessmentActionResult> {
  const user = await requireSiteAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };
  if (!input.clientName.trim()) return { ok: false, error: "Client name is required." };

  const created = await prisma.connexionSafetyAssessment.create({
    data: { administeredById: user.id, ...toWriteData(input) },
  });

  if (input.visitRequestId) {
    await prisma.connexionVisitRequest.update({ where: { id: input.visitRequestId }, data: { status: "completed" } }).catch(() => {});
  }

  revalidatePath("/admin/connexion-safety-score");
  revalidatePath("/admin/connexion-visits");
  return { ok: true, id: created.id };
}

/** Edits an existing assessment (see SafetyAssessmentForm.tsx mode "edit"). */
export async function updateSafetyAssessment(id: string, input: SafetyAssessmentInput): Promise<SafetyAssessmentActionResult> {
  const user = await requireSiteAdminUser();
  if (!user) return { ok: false, error: "Not authorized." };
  if (!input.clientName.trim()) return { ok: false, error: "Client name is required." };

  const existing = await prisma.connexionSafetyAssessment.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Assessment not found." };

  await prisma.connexionSafetyAssessment.update({ where: { id }, data: toWriteData(input) });

  revalidatePath("/admin/connexion-safety-score");
  revalidatePath(`/admin/connexion-safety-score/${id}`);
  return { ok: true, id };
}

export interface SafetyAssessmentListItem {
  id: string;
  clientName: string;
  assessmentDate: string;
  totalScore: number;
  riskLevel: string;
  administeredByName: string;
}

export async function listSafetyAssessments(): Promise<SafetyAssessmentListItem[]> {
  if (!(await isSiteAdmin())) return [];

  const rows = await prisma.connexionSafetyAssessment.findMany({
    orderBy: { assessmentDate: "desc" },
    include: { administeredBy: { select: { name: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    clientName: r.clientName,
    assessmentDate: r.assessmentDate.toISOString(),
    totalScore: r.totalScore,
    riskLevel: r.riskLevel,
    administeredByName: r.administeredBy.name,
  }));
}

export interface SafetyAssessmentDetail extends SafetyAssessmentInput {
  id: string;
  administeredByName: string;
  environmentalScore: number;
  mobilityScore: number;
  fallRiskScore: number;
  totalScore: number;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** Fetches one assessment with its JSON columns parsed back into the shapes
 *  SafetyAssessmentForm/print pages consume — used by both the edit page and the print page. */
export async function getSafetyAssessment(id: string): Promise<SafetyAssessmentDetail | null> {
  if (!(await isSiteAdmin())) return null;

  const r = await prisma.connexionSafetyAssessment.findUnique({ where: { id }, include: { administeredBy: { select: { name: true } } } });
  if (!r) return null;

  return {
    id: r.id,
    clientName: r.clientName,
    clientAddress: r.clientAddress ?? undefined,
    assessmentDate: r.assessmentDate.toISOString().slice(0, 10),
    visitRequestId: r.visitRequestId,
    itemScores: safeParse(r.itemScores, {}),
    criticalFindings: safeParse(r.criticalFindings, []),
    criticalFindingsOther: r.criticalFindingsOther ?? undefined,
    equipment: safeParse(r.equipment, []),
    caregiverSkills: safeParse(r.caregiverSkills, {}),
    priorityActionsUrgent: r.priorityActionsUrgent ?? undefined,
    priorityActionsSoon: r.priorityActionsSoon ?? undefined,
    priorityActionsMonitor: r.priorityActionsMonitor ?? undefined,
    biggestRisk: r.biggestRisk ?? undefined,
    mostImportantChange: r.mostImportantChange ?? undefined,
    equipmentRecommendedNote: r.equipmentRecommendedNote ?? undefined,
    caregiverTrainingNote: r.caregiverTrainingNote ?? undefined,
    followUp: r.followUp ?? undefined,
    followUpOther: r.followUpOther ?? undefined,
    ptRecommendation: r.ptRecommendation ?? undefined,
    administeredByName: r.administeredBy.name,
    environmentalScore: r.environmentalScore,
    mobilityScore: r.mobilityScore,
    fallRiskScore: r.fallRiskScore,
    totalScore: r.totalScore,
    riskLevel: r.riskLevel,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
