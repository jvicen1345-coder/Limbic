/** Everything under LimbicPRO, as one grouped list — the source for the Clinical Toolbox
 *  page (app/(app)/pro/toolbox/page.tsx).
 *
 *  The sidebar had grown to a dozen rows of equal weight, in the order they happened to be
 *  added: a caseload dashboard next to a lab-value lookup next to a CE log. That reads as a
 *  list of links rather than a set of tools, and gives no answer to "what is in here" short
 *  of clicking every row. Grouping them by *when you'd reach for them* does.
 *
 *  This list stays complete as the sidebar shrinks around it. The sidebar is now four rows
 *  (see the note in components/AppShell.tsx's LimbicPRO section) and everything else reaches
 *  the reader through here. Most of what left kept another way in — Special Tests and Outcome
 *  Measures from the dashboard's Quick Tools, Force Lab from each patient's Force Lab card,
 *  Screening from Quick Tools too, Documentation Templates from the clinical-notes form, CE
 *  Tracker from the /pro overview, and Movement Lab and Team Dashboard as tabs on the pages
 *  they belong to. Common Pathologies and Clinic Report did not: this page is their only
 *  entry point, so dropping either entry from this file orphans a real page, which is exactly
 *  how /pro/documentation and /pro/guidelines went unreachable before.
 *
 *  Descriptions are each page's own summary line where it has one, rather than freshly
 *  invented copy — a hub that describes a tool differently from the tool itself is a hub
 *  that goes stale.
 *
 *  Client-safe: the page renders these as links and needs no server data beyond the two
 *  access flags it passes in. */

/** The icon each card shows. A key rather than a component so this file stays plain data —
 *  components/pro/ToolboxBrowser.tsx maps these onto the real icons, and its map is typed
 *  Record<ToolboxIcon, ...> so adding a key here without drawing it fails to compile.
 *
 *  Where a tool also had a sidebar row before the trim, its key resolves to the icon that row
 *  used, so the two surfaces do not disagree about what a tool looks like. */
export type ToolboxIcon =
  | "dashboard"
  | "force"
  | "agent"
  | "team"
  | "report"
  | "tests"
  | "screening"
  | "outcomes"
  | "exercise"
  | "movement"
  | "reference"
  | "guidelines"
  | "documents"
  | "pathologies"
  | "ce";

export interface ToolboxEntry {
  name: string;
  href: string;
  description: string;
  icon: ToolboxIcon;
  /** Needs a LimbicPRO subscription. Everything else is free to any signed-in reader — see
   *  lib/session.ts hasClinicalReferenceAccess and each page's own gate. */
  pro?: boolean;
  /** Only for a clinic admin (see AppShell.tsx's clinicMembership?.isAdmin rows). */
  clinicAdmin?: boolean;
}

export interface ToolboxGroup {
  title: string;
  /** One line on what this group is for, so the grouping explains itself. */
  blurb: string;
  tools: ToolboxEntry[];
}

export const CLINICIAN_TOOLBOX: ToolboxGroup[] = [
  {
    title: "Your caseload",
    blurb: "The patients you are actually treating, and the data you collect on them.",
    tools: [
      {
        name: "Clinician Dashboard",
        icon: "dashboard",
        href: "/pro/dashboard",
        description:
          "Your whole caseload in one place — conditions, outcome measures, goals, home programs, session logs and clinical notes.",
        pro: true,
      },
      {
        name: "Force Lab",
        icon: "force",
        href: "/pro/force-lab",
        description: "Import and analyze handheld dynamometer data. Track patient strength over time.",
        pro: true,
      },
      {
        name: "Limbic Agent",
        icon: "agent",
        href: "/agent",
        description:
          "Clinical decision support at the point of care — evidence-based answers meant to support your judgment, not replace it.",
        pro: true,
      },
      {
        name: "Team Dashboard",
        icon: "team",
        href: "/pro/dashboard?tab=team",
        description: "Caseloads across everyone in your clinic.",
        clinicAdmin: true,
      },
      {
        name: "Clinic Report",
        icon: "report",
        href: "/pro/clinic-report",
        description: "Outcomes rolled up across the clinic, with CE compliance.",
        clinicAdmin: true,
      },
    ],
  },
  {
    title: "Examine and screen",
    blurb: "At the table, with a patient in front of you.",
    tools: [
      {
        name: "Special Tests",
        icon: "tests",
        href: "/pro/special-tests",
        description:
          "Organized by body region, with performance technique, positive finding, and diagnostic accuracy.",
      },
      {
        name: "Screening & Decision Support",
        icon: "screening",
        href: "/pro/decision-rules",
        description:
          "Evidence-based decision rules and red flag screening, to guide clinical reasoning and imaging decisions.",
      },
      {
        name: "Outcome Measures",
        icon: "outcomes",
        href: "/pro/calculators",
        description: "Validated outcome measures and functional assessments, scored and interpreted in real time.",
      },
    ],
  },
  {
    title: "Prescribe",
    blurb: "What the patient does between visits.",
    tools: [
      {
        name: "Exercise Programs",
        icon: "exercise",
        href: "/hep",
        description: "Build and assign home programs, and attach them to a patient record.",
        pro: true,
      },
      {
        name: "Movement Lab",
        icon: "movement",
        href: "/hep?tab=movement-lab",
        description: "The exercise bank and phased protocols the builder draws on — filterable by region and equipment.",
      },
    ],
  },
  {
    title: "Look it up",
    blurb: "Reference you reach for mid-session, and the paperwork after it.",
    tools: [
      {
        name: "Clinical Reference",
        icon: "reference",
        href: "/pro/lab-values",
        description: "Lab values and medications, with what each one means for what you had planned today.",
      },
      {
        name: "Clinical Practice Guidelines",
        icon: "guidelines",
        href: "/pro/guidelines",
        description: "Published CPGs, summarized to their recommendations and the strength of evidence behind them.",
      },
      {
        name: "Documentation Templates",
        icon: "documents",
        href: "/pro/documentation",
        description: "Evaluation, progress, discharge and prior-auth templates — copy, customize, and use.",
      },
      {
        name: "Common Pathologies",
        icon: "pathologies",
        href: "/wellness/pathologies",
        description: "Plain-language condition explanations, written to be read with a patient rather than about one.",
      },
    ],
  },
  {
    title: "Keep current",
    blurb: "The part of the job that isn't the patient in front of you.",
    tools: [
      {
        name: "CE Tracker",
        icon: "ce",
        href: "/pro/ce-tracker",
        description: "Log continuing education toward license renewal, with certificates and progress against your requirement.",
        pro: true,
      },
    ],
  },
];

/** The groups a given reader should actually see, with tools they can't reach at all removed
 *  — a clinic-admin tool shown to a solo clinician is a dead link, whereas a PRO tool shown
 *  to a free reader is a real offer and keeps its lock pill. */
export function toolboxFor({ isClinicAdmin }: { isClinicAdmin: boolean }): ToolboxGroup[] {
  return CLINICIAN_TOOLBOX.map((g) => ({
    ...g,
    tools: g.tools.filter((t) => !t.clinicAdmin || isClinicAdmin),
  })).filter((g) => g.tools.length > 0);
}
