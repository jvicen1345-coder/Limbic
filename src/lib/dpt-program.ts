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

export function getProgramPhaseLabel(phase: ProgramPhase): string {
  if (phase.type === "complete") {
    return "DPT — Chapman University — Class of 2028";
  }

  if (phase.type === "break") {
    const next = phase.nextPhase;
    if (!next) return "Program Break";
    if (next.type === "clinical") {
      return `Rotation ${next.clinicalNumber} begins in ${phase.daysUntilNextPhase} days`;
    }
    return `${next.name} begins in ${phase.daysUntilNextPhase} days`;
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
