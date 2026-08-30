"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import { seedDPTPrograms } from "../../../prisma/seed-dpt-programs";
import type { DPTProgram, InstitutionalOutreach } from "@/generated/prisma/client";

type ActionError = { error: string };

/** The full 235-row table, seeded lazily on first read (see prisma/seed-dpt-programs.ts —
 *  same "reference data seeds itself" idiom as lib/force-lab-norms.ts). Every export below
 *  reads through this rather than building a Prisma `where` clause with `contains`/`mode:
 *  "insensitive"` filters, which the SQLite provider doesn't support (see
 *  app/actions/founding-funders.ts's own comment on the same limitation) — at 235 rows,
 *  filtering/sorting in JS is both correct and effectively free. */
async function allPrograms(): Promise<DPTProgram[]> {
  await seedDPTPrograms();
  return prisma.dPTProgram.findMany();
}

/** Nulls always sort last regardless of direction — "Not published" has no defensible
 *  position in a High-Low or Low-High ordering, so it never gets to look like the smallest
 *  or largest real value on the page. */
function compareNullable(a: number | null, b: number | null, dir: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * dir;
}

export interface ProgramFilters {
  stateCode?: string;
  region?: string;
  calendarType?: string;
  searchQuery?: string;
  sortBy?: "credits" | "clinicalWeeks" | "accreditedSince" | "institution";
  sortOrder?: "asc" | "desc";
}

export async function getAllPrograms(filters: ProgramFilters = {}): Promise<DPTProgram[]> {
  const { stateCode, region, calendarType, searchQuery, sortBy = "institution", sortOrder = "asc" } = filters;
  let rows = await allPrograms();

  if (stateCode) rows = rows.filter((p) => p.stateCode === stateCode);
  if (region) rows = rows.filter((p) => p.region === region);
  if (calendarType) rows = rows.filter((p) => p.calendarType === calendarType);
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    rows = rows.filter((p) => p.institution.toLowerCase().includes(q) || p.stateName.toLowerCase().includes(q));
  }

  const dir: 1 | -1 = sortOrder === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    switch (sortBy) {
      case "credits":
        return compareNullable(a.creditsMin, b.creditsMin, dir);
      case "clinicalWeeks":
        return compareNullable(a.clinicalWeeksMin, b.clinicalWeeksMin, dir);
      case "accreditedSince":
        return compareNullable(a.accreditedSince, b.accreditedSince, dir);
      case "institution":
      default:
        return a.institution.localeCompare(b.institution) * dir;
    }
  });
}

export async function getProgramById(id: number): Promise<DPTProgram | null> {
  await seedDPTPrograms();
  return prisma.dPTProgram.findUnique({ where: { id } });
}

/** Onboarding's Step 2 autocomplete and Profile's "Change Program" search (see
 *  components/student/ProgramSearch.tsx) — up to 20 matches, institution name first. */
export async function searchPrograms(query: string): Promise<DPTProgram[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const rows = await allPrograms();
  return rows
    .filter((p) => p.institution.toLowerCase().includes(q) || p.stateName.toLowerCase().includes(q))
    .sort((a, b) => a.institution.localeCompare(b.institution))
    .slice(0, 20);
}

export async function getStates(): Promise<{ stateCode: string; stateName: string }[]> {
  const rows = await allPrograms();
  const seen = new Map<string, string>();
  for (const p of rows) if (!seen.has(p.stateCode)) seen.set(p.stateCode, p.stateName);
  return [...seen.entries()].map(([stateCode, stateName]) => ({ stateCode, stateName })).sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export async function getRegions(): Promise<string[]> {
  const rows = await allPrograms();
  return [...new Set(rows.map((p) => p.region))].sort();
}

export async function getCalendarTypes(): Promise<string[]> {
  const rows = await allPrograms();
  return [...new Set(rows.map((p) => p.calendarType).filter((c): c is string => c !== null))].sort();
}

/** Derives the account from the session cookie, not a client-passed userId — same reasoning
 *  as every other server action in this app (see app/actions/syllabus.ts's own doc comment):
 *  a userId argument would just be something a client could spoof, so "ownership check" here
 *  means "this session picks its own program," not "verify a passed id matches." */
export async function setUserProgram(programId: number): Promise<ActionError | { success: true }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const program = await prisma.dPTProgram.findUnique({ where: { id: programId } });
  if (!program) return { error: "Program not found." };

  await prisma.user.update({ where: { id: user.id }, data: { dptProgramId: programId } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getUserProgram(): Promise<DPTProgram | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!user.dptProgramId) return null;
  return prisma.dPTProgram.findUnique({ where: { id: user.dptProgramId } });
}

export interface OutreachRow {
  program: DPTProgram;
  outreach: InstitutionalOutreach | null;
}

export async function getOutreachRecords(): Promise<OutreachRow[]> {
  if (!(await isSiteAdmin())) return [];
  await seedDPTPrograms();

  const programs = await prisma.dPTProgram.findMany({
    include: { outreachRecords: true },
    orderBy: { institution: "asc" },
  });

  return programs.map((p) => {
    const { outreachRecords, ...program } = p;
    return { program, outreach: outreachRecords[0] ?? null };
  });
}

export interface OutreachInput {
  status: string;
  contactName: string;
  contactEmail: string;
  notes: string;
  lastContactedAt: string;
}

export async function upsertOutreachRecord(programId: number, data: OutreachInput): Promise<ActionError | { success: true }> {
  if (!(await isSiteAdmin())) return { error: "Unauthorized" };

  const program = await prisma.dPTProgram.findUnique({ where: { id: programId } });
  if (!program) return { error: "Program not found." };

  const payload = {
    status: data.status,
    contactName: data.contactName.trim() || null,
    contactEmail: data.contactEmail.trim() || null,
    notes: data.notes.trim() || null,
    lastContactedAt: data.lastContactedAt ? new Date(`${data.lastContactedAt}T00:00:00`) : null,
  };

  const existing = await prisma.institutionalOutreach.findFirst({ where: { programId } });
  if (existing) {
    await prisma.institutionalOutreach.update({ where: { id: existing.id }, data: payload });
  } else {
    await prisma.institutionalOutreach.create({ data: { programId, ...payload } });
  }

  revalidatePath("/admin/programs");
  return { success: true };
}
