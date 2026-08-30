import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getAllPrograms, getStates, getRegions, getCalendarTypes, getUserProgram } from "@/app/actions/dpt-programs";
import { ArrowLeftIcon, LogoIcon } from "@/components/icons";
import { ProgramsDirectory } from "@/components/programs/ProgramsDirectory";

export const metadata: Metadata = {
  title: "DPT Program Directory — Limbic Center",
  description:
    "Search and compare all 235 CAPTE-accredited Doctor of Physical Therapy programs across the United States. Filter by state, region, calendar type, and clinical hours.",
  alternates: { canonical: "https://limbic.center/programs" },
};

/** Fully public — no sign-in required (see robots.ts/sitemap.ts, both allow-list this path).
 *  Deliberately outside the (app) route group, same reasoning as app/founding-funders/
 *  page.tsx: no AppShell, no session-gated layout redirect, so a signed-out visitor (and a
 *  crawler) reaches real content instead of a login wall. The "Select This Program" button
 *  (see components/programs/ProgramsDirectory.tsx) is the only piece that needs a session,
 *  and it degrades to nothing for a signed-out reader rather than gating the page itself. */
export default async function ProgramsPage() {
  const [programs, states, regions, calendarTypes, user] = await Promise.all([
    getAllPrograms(),
    getStates(),
    getRegions(),
    getCalendarTypes(),
    getCurrentUser(),
  ]);

  // Only a PT student can attach a program to their own account (see Part 5's onboarding
  // Step 2 and Profile's "Your Program" section) — a licensed PT or a general reader
  // browsing the directory sees the same table with no selection affordance.
  const canSelectProgram = Boolean(user && user.userRole === "pts");
  const userProgram = canSelectProgram ? await getUserProgram() : null;

  return (
    <div className="programs-page">
      <header className="programs-page-header">
        <Link href="/" className="programs-page-logo">
          <LogoIcon size={24} />
          <span>Limbic</span>
        </Link>
        <Link href="/" className="programs-page-home-link">
          <ArrowLeftIcon size={15} />
          Back to Limbic
        </Link>
      </header>

      <div className="programs-page-content">
        <h1 className="programs-title">DPT Program Directory</h1>
        <p className="programs-subtitle">235 CAPTE-accredited programs across 49 states and territories</p>
        <p className="programs-data-note">
          Data sourced from PTCAS directory entries and CAPTE documentation. NULL fields indicate information not
          confirmed at time of collection.
        </p>

        <ProgramsDirectory
          programs={programs.map((p) => ({
            id: p.id,
            stateCode: p.stateCode,
            stateName: p.stateName,
            region: p.region,
            institution: p.institution,
            calendarType: p.calendarType,
            programLength: p.programLength,
            startTerm: p.startTerm,
            totalCreditsRaw: p.totalCreditsRaw,
            creditsMin: p.creditsMin,
            creditsMax: p.creditsMax,
            clinicalWeeksRaw: p.clinicalWeeksRaw,
            clinicalWeeksMin: p.clinicalWeeksMin,
            clinicalWeeksMax: p.clinicalWeeksMax,
            accreditedSince: p.accreditedSince,
            notes: p.notes,
            sourceDomain: p.sourceDomain,
          }))}
          states={states}
          regions={regions}
          calendarTypes={calendarTypes}
          canSelectProgram={canSelectProgram}
          currentProgramId={userProgram?.id ?? null}
        />
      </div>
    </div>
  );
}
