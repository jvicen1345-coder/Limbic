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

/** In-flight seed, shared by every concurrent caller in this process. app/programs/page.tsx
 *  reads through four different exports of app/actions/dpt-programs.ts in a single
 *  Promise.all, and every one of them calls this — so on an empty table all four used to
 *  clear the count guard below before any of them had inserted anything, all four ran
 *  createMany, and the three that lost the race threw P2002 straight out of the server
 *  component. That made the very first request to /programs after a deploy a 500 (the rows
 *  landed, so a reload then worked and the failure hid itself — but /programs is public and
 *  allow-listed in robots.ts/sitemap.ts, so the first request can be a crawler's). Holding
 *  the promise here collapses those four calls into one insert. */
let seedInFlight: Promise<void> | null = null;

/** Idempotent and concurrency-safe — populates DPTProgram from the 235-record national
 *  reference dataset on first call, and no-ops on every call after. Called lazily from
 *  app/actions/dpt-programs.ts rather than wired through a `prisma db seed` CLI step,
 *  matching this app's existing "reference data seeds itself the first time something reads
 *  it" idiom rather than requiring a separate deploy step a fresh environment could forget. */
export async function seedDPTPrograms(): Promise<void> {
  seedInFlight ??= runSeed().finally(() => {
    seedInFlight = null;
  });
  return seedInFlight;
}

async function runSeed(): Promise<void> {
  const existing = await prisma.dPTProgram.count();
  if (existing > 0) return;

  // No `skipDuplicates` — the SQLite provider doesn't support it (Postgres/MySQL-only). The
  // count guard above plus the shared promise handles concurrency inside one process; the
  // P2002 catch below covers the case the promise can't see — two server instances (or two
  // serverless invocations) racing the same cold database, where both legitimately read a
  // count of 0. Losing that race is not an error: the winner inserted exactly the rows this
  // call wanted, so there is nothing left to do.
  const data = programs.map((p) => ({
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
  }));

  try {
    const result = await prisma.dPTProgram.createMany({ data });
    console.log(`seedDPTPrograms: inserted ${result.count} DPT program records`);
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) throw error;
  }
}

/** Prisma's P2002 ("Unique constraint failed"), matched off the code rather than the error
 *  class so this doesn't have to import the client's error types just to narrow one case. */
function isUniqueConstraintViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
}
