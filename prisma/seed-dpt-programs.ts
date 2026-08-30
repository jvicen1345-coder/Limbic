import "server-only";
import { prisma } from "../src/lib/db";
import rawPrograms from "./dpt-programs-data.json";

/** The exact 235 records from the national DPT-programs reference dataset (see
 *  prisma/dpt-programs-data.json, sourced from PTCAS directory entries and CAPTE
 *  documentation) — snake_case field names as shipped in that file, not modified or
 *  re-derived here. */
interface RawDPTProgram {
  id: number;
  state_code: string;
  state_name: string;
  region: string;
  institution: string;
  calendar_type: string | null;
  program_length: string | null;
  start_term: string | null;
  total_credits_raw: string | null;
  credits_min: number | null;
  credits_max: number | null;
  clinical_weeks_raw: string | null;
  clinical_weeks_min: number | null;
  clinical_weeks_max: number | null;
  accredited_since: number | null;
  notes: string | null;
  source_domain: string | null;
}

const programs = rawPrograms as RawDPTProgram[];

/** Idempotent (a count check, not an upsert loop — same shape as lib/force-lab-norms.ts's
 *  seedForceLabNorms) — populates DPTProgram from the 235-record national reference dataset
 *  on first call, and no-ops on every call after. Called lazily from app/actions/
 *  dpt-programs.ts rather than wired through a `prisma db seed` CLI step, matching this
 *  app's existing "reference data seeds itself the first time something reads it" idiom
 *  rather than requiring a separate deploy step a fresh environment could forget. */
export async function seedDPTPrograms(): Promise<void> {
  const existing = await prisma.dPTProgram.count();
  if (existing > 0) return;

  // No `skipDuplicates` — the SQLite provider doesn't support it (Postgres/MySQL-only); the
  // count guard above is what actually makes this idempotent/safe to call repeatedly, same
  // as lib/force-lab-norms.ts's seedForceLabNorms.
  const result = await prisma.dPTProgram.createMany({
    data: programs.map((p) => ({
      id: p.id,
      stateCode: p.state_code,
      stateName: p.state_name,
      region: p.region,
      institution: p.institution,
      calendarType: p.calendar_type,
      programLength: p.program_length,
      startTerm: p.start_term,
      totalCreditsRaw: p.total_credits_raw,
      creditsMin: p.credits_min,
      creditsMax: p.credits_max,
      clinicalWeeksRaw: p.clinical_weeks_raw,
      clinicalWeeksMin: p.clinical_weeks_min,
      clinicalWeeksMax: p.clinical_weeks_max,
      accreditedSince: p.accredited_since,
      notes: p.notes,
      sourceDomain: p.source_domain,
    })),
  });

  console.log(`seedDPTPrograms: inserted ${result.count} DPT program records`);
}
