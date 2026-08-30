export interface DPTTrimester {
  number: number;
  year: number;
  name: string;
  type: "didactic" | "clinical";
  clinicalNumber?: number;
  start: string; // ISO date YYYY-MM-DD
  end: string; // ISO date YYYY-MM-DD
  focusCourses: string[];
}

export const CHAPMAN_DPT_PROGRAM = {
  programStart: "2025-08-25",
  programGraduation: "2028-08-05",
  studentName: "Jonathan Vicencio",
  program: "Doctor of Physical Therapy",
  university: "Chapman University",
  classYear: 2028,

  trimesters: [
    {
      number: 1,
      year: 1,
      name: "Fall 2025",
      type: "didactic",
      start: "2025-08-25",
      end: "2025-12-06",
      focusCourses: [
        "Functional Human Anatomy I",
        "Biomechanics of Human Movement",
        "Clinical Pathology: General Medicine",
        "PT and the Healthcare System",
      ],
    },
    {
      number: 2,
      year: 1,
      name: "Spring 2026",
      type: "didactic",
      start: "2026-01-05",
      end: "2026-04-11",
      focusCourses: [
        "Kinesiological Motion Analysis",
        "Clinical Pathology: Orthopedic",
        "Physical Therapy Examination",
        "Neuroscience I",
        "Physical Agents",
        "Scientific Inquiry I",
      ],
    },
    {
      number: 3,
      year: 1,
      name: "Summer 2026",
      type: "didactic",
      start: "2026-05-04",
      end: "2026-08-08",
      focusCourses: [
        "Clinical Pathology: Neurology",
        "Musculoskeletal Practice Management I",
        "Neuroscience II",
        "Clinical Practicum I",
      ],
    },
    {
      number: 4,
      year: 2,
      name: "Fall 2026",
      type: "didactic",
      start: "2026-08-24",
      end: "2026-12-05",
      focusCourses: [
        "Musculoskeletal Practice Management II",
        "Neurological Practice Management",
        "Motor Control and Motor Learning",
        "Scientific Inquiry II",
        "Cultural Diversity and Psychology in Healthcare",
        "Clinical Practicum II",
      ],
    },
    {
      number: 5,
      year: 2,
      name: "Spring 2027",
      type: "clinical",
      clinicalNumber: 1,
      start: "2027-01-04",
      end: "2027-04-10",
      focusCourses: ["Clinical Experience I"],
    },
    {
      number: 6,
      year: 2,
      name: "Summer 2027",
      type: "didactic",
      start: "2027-05-03",
      end: "2027-08-07",
      focusCourses: [
        "Functional Human Anatomy II",
        "Rehabilitation Practice Management",
        "Cardiopulmonary Practice Management",
        "Pediatric Practice Management",
        "PT Ethics and Law",
        "Pharmacology",
      ],
    },
    {
      number: 7,
      year: 3,
      name: "Fall 2027",
      type: "clinical",
      clinicalNumber: 2,
      start: "2027-08-30",
      end: "2027-12-11",
      focusCourses: ["Clinical Experience II"],
    },
    {
      number: 8,
      year: 3,
      name: "Spring 2028",
      type: "didactic",
      start: "2028-01-03",
      end: "2028-04-08",
      focusCourses: [
        "Diagnostic Imaging",
        "Geriatric Practice Management",
        "Wellness and Complementary Medicine",
        "Leadership, Administration, Management and Policy",
        "Scientific Inquiry IV",
        "Electives",
      ],
    },
    {
      number: 9,
      year: 3,
      name: "Summer 2028",
      type: "clinical",
      clinicalNumber: 3,
      start: "2028-05-01",
      end: "2028-08-05",
      focusCourses: ["Clinical Experience III"],
    },
  ] as DPTTrimester[],
};

export interface ProgramPhase {
  type: "didactic" | "clinical" | "break" | "complete";
  trimester: DPTTrimester | null;
  year: number;
  trimesterNumber: number;
  weekInTrimester: number;
  totalWeeksInTrimester: number;
  daysUntilNextPhase: number;
  nextPhase: DPTTrimester | null;
  daysUntilGraduation: number;
  percentComplete: number;
}

export function getCurrentProgramPhase(today: Date = new Date()): ProgramPhase {
  const program = CHAPMAN_DPT_PROGRAM;
  const trimesters = program.trimesters;
  const graduationDate = new Date(program.programGraduation);
  const programStartDate = new Date(program.programStart);

  const totalProgramDays = Math.floor(
    (graduationDate.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysCompleted = Math.floor(
    (today.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const percentComplete = Math.min(100, Math.max(0, Math.round((daysCompleted / totalProgramDays) * 100)));
  const daysUntilGraduation = Math.max(0, Math.floor(
    (graduationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  ));

  if (today > graduationDate) {
    return {
      type: "complete",
      trimester: null,
      year: 3,
      trimesterNumber: 9,
      weekInTrimester: 0,
      totalWeeksInTrimester: 0,
      daysUntilNextPhase: 0,
      nextPhase: null,
      daysUntilGraduation: 0,
      percentComplete: 100,
    };
  }

  if (today < programStartDate) {
    return {
      type: "break",
      trimester: null,
      year: 1,
      trimesterNumber: 0,
      weekInTrimester: 0,
      totalWeeksInTrimester: 0,
      daysUntilNextPhase: Math.floor(
        (programStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
      nextPhase: trimesters[0],
      daysUntilGraduation,
      percentComplete: 0,
    };
  }

  for (let i = 0; i < trimesters.length; i++) {
    const trimester = trimesters[i];
    const start = new Date(trimester.start);
    const end = new Date(trimester.end);

    if (today >= start && today <= end) {
      const weekInTrimester = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
      ) + 1;
      const totalWeeksInTrimester = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      const nextPhase = trimesters[i + 1] ?? null;
      const daysUntilNextPhase = nextPhase
        ? Math.floor((new Date(nextPhase.start).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : daysUntilGraduation;

      return {
        type: trimester.type,
        trimester,
        year: trimester.year,
        trimesterNumber: trimester.number,
        weekInTrimester,
        totalWeeksInTrimester,
        daysUntilNextPhase,
        nextPhase,
        daysUntilGraduation,
        percentComplete,
      };
    }

    const nextTrimester = trimesters[i + 1];
    if (nextTrimester) {
      const nextStart = new Date(nextTrimester.start);
      if (today > end && today < nextStart) {
        const daysUntilNextPhase = Math.floor(
          (nextStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          type: "break",
          trimester: null,
          year: trimester.year,
          trimesterNumber: trimester.number,
          weekInTrimester: 0,
          totalWeeksInTrimester: 0,
          daysUntilNextPhase,
          nextPhase: nextTrimester,
          daysUntilGraduation,
          percentComplete,
        };
      }
    }
  }

  return {
    type: "didactic",
    trimester: trimesters[0],
    year: 1,
    trimesterNumber: 1,
    weekInTrimester: 1,
    totalWeeksInTrimester: 15,
    daysUntilNextPhase: daysUntilGraduation,
    nextPhase: null,
    daysUntilGraduation,
    percentComplete,
  };
}

// Display word for a generic-program phase label (see getGenericProgramPhase below) — the
// exact calendarType string stored on DPTProgram (see prisma/dpt-programs-data.json) doubles
// as the label word for the three values that actually appear as a term unit; anything else
// ("Hybrid", etc.) just prints as given rather than guessing a term-length noun for it.
const CALENDAR_LABEL_WORD: Record<string, string> = {
  Trimester: "Trimester",
  Semester: "Semester",
  Quarter: "Quarter",
};

export function getProgramPhaseLabel(phase: ProgramPhase, calendarType?: string | null): string {
  if (phase.type === "complete") {
    return calendarType ? "DPT Program — Complete" : "DPT — Chapman University — Class of 2028";
  }

  if (phase.type === "break") {
    const next = phase.nextPhase;
    if (!next) return calendarType ? "DPT Student" : "Program Break";
    if (next.type === "clinical") {
      return `Rotation ${next.clinicalNumber} begins in ${phase.daysUntilNextPhase} days`;
    }
    return `${next.name} begins in ${phase.daysUntilNextPhase} days`;
  }

  // Generic (non-Chapman) path — see getGenericProgramPhase, called with a real DPTProgram's
  // calendarType (Trimester/Semester/Quarter) but no per-term start/end calendar to name a
  // specific term ("Fall 2026") or a clinical rotation schedule to report a "Rotation N in X
  // days" clause from — this app only knows any other program's total program length and its
  // calendar type, not its actual term/rotation dates, so the label stops at the term count.
  if (calendarType && !phase.trimester) {
    const word = CALENDAR_LABEL_WORD[calendarType] ?? calendarType;
    return `Year ${phase.year} — ${word} ${phase.trimesterNumber}`;
  }

  if (phase.type === "clinical" && phase.trimester) {
    return `Clinical Rotation ${phase.trimester.clinicalNumber} — Week ${phase.weekInTrimester} of ${phase.totalWeeksInTrimester}`;
  }

  if (phase.type === "didactic" && phase.trimester) {
    const yearLabel = `Year ${phase.year}`;
    const nextClinical = phase.nextPhase?.type === "clinical"
      ? ` · Rotation ${phase.nextPhase.clinicalNumber} in ${phase.daysUntilNextPhase} days`
      : "";
    return `${yearLabel} — ${phase.trimester.name}${nextClinical}`;
  }

  return "DPT Student";
}

// Term length/count assumptions for a generic (non-Chapman) program — this app only knows a
// DPTProgram's calendarType and total program length, not its real per-term calendar, so
// "which term number is this" is a best-effort proportional estimate, not an authoritative
// one. Reasonable typical lengths for each calendar type; anything else falls back to the
// Trimester assumption (matches this app's own 3-year/9-trimester default shape).
const GENERIC_TERM_SHAPE: Record<string, { weeks: number; perYear: number }> = {
  Trimester: { weeks: 15, perYear: 3 },
  Semester: { weeks: 16, perYear: 2 },
  Quarter: { weeks: 11, perYear: 3 },
};
const DEFAULT_TERM_SHAPE = { weeks: 15, perYear: 3 };

/** The generic counterpart to getCurrentProgramPhase above — for any student who picked a
 *  real institution from the national DPT program directory (see app/actions/
 *  dpt-programs.ts getUserProgram) rather than being the app's own hardcoded Chapman
 *  account. Computed from just a start date, a graduation date, and a calendar type — no
 *  fixed per-trimester calendar exists for an arbitrary program, so phase.trimester and
 *  phase.nextPhase are always null here (no rotation-banner or break-transition-card detail
 *  is possible without that data — see app/(app)/student/page.tsx's own guards, which
 *  already require phase.trimester non-null before rendering either). Returns null when
 *  either date is missing — the caller shows an "add your start date" prompt instead. */
export function getGenericProgramPhase(
  programStart: Date | null | undefined,
  programGraduation: Date | null | undefined,
  calendarType: string | null | undefined,
  today: Date = new Date()
): ProgramPhase | null {
  if (!programStart || !programGraduation) return null;

  const totalProgramDays = Math.floor((programGraduation.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24));
  if (totalProgramDays <= 0) return null;

  const daysCompleted = Math.floor((today.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24));
  const percentComplete = Math.min(100, Math.max(0, Math.round((daysCompleted / totalProgramDays) * 100)));
  const daysUntilGraduation = Math.max(0, Math.floor((programGraduation.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  if (today > programGraduation) {
    return {
      type: "complete",
      trimester: null,
      year: Math.max(1, Math.ceil(totalProgramDays / 7 / DEFAULT_TERM_SHAPE.weeks / DEFAULT_TERM_SHAPE.perYear)),
      trimesterNumber: 0,
      weekInTrimester: 0,
      totalWeeksInTrimester: 0,
      daysUntilNextPhase: 0,
      nextPhase: null,
      daysUntilGraduation: 0,
      percentComplete: 100,
    };
  }

  if (today < programStart) {
    return {
      type: "break",
      trimester: null,
      year: 1,
      trimesterNumber: 0,
      weekInTrimester: 0,
      totalWeeksInTrimester: 0,
      daysUntilNextPhase: Math.floor((programStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      nextPhase: null,
      daysUntilGraduation,
      percentComplete: 0,
    };
  }

  const { weeks: termWeeks, perYear: termsPerYear } = (calendarType && GENERIC_TERM_SHAPE[calendarType]) || DEFAULT_TERM_SHAPE;
  const weeksElapsed = daysCompleted / 7;
  const termIndex = Math.floor(weeksElapsed / termWeeks);
  const weekInTrimester = Math.floor(weeksElapsed % termWeeks) + 1;

  return {
    type: "didactic",
    trimester: null,
    year: Math.floor(termIndex / termsPerYear) + 1,
    trimesterNumber: termIndex + 1,
    weekInTrimester,
    totalWeeksInTrimester: termWeeks,
    daysUntilNextPhase: 0,
    nextPhase: null,
    daysUntilGraduation,
    percentComplete,
  };
}
