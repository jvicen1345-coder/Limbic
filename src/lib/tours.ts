/**
 * Every guided tour in the app, as data (see components/LimbicTour.tsx for the player,
 * components/TourHost.tsx for what starts one, components/TourMenu.tsx for the picker on
 * Profile).
 *
 * Two things shape this file.
 *
 * A tour can move between pages. A step may name a `route`, and the player navigates there
 * and waits for the step's target before measuring it — so a section tour can show a tool
 * rather than only pointing at the link to it. The player keeps its position in
 * sessionStorage precisely because navigation unmounts everything else.
 *
 * Every route here is one any signed-in reader can load. Several tools in these sections are
 * PRO- or student-gated, and a tour that walked someone into a page they get redirected out
 * of would end mid-sentence — so the gated tools are *described* from a page that renders
 * for everyone (LimbicPRO's Toolbox shows locked cards with their descriptions intact,
 * deliberately, see app/(app)/pro/toolbox/page.tsx) rather than visited.
 *
 * Anchor a step on something that FITS THE VIEWPORT. The player scrolls a target to the
 * centre of the screen and draws a ring around it, so an element taller than the viewport
 * gives a ring running off every edge and a reader looking at the middle of a page while the
 * card describes the top of it. Measured against a 720px viewport: the toolbox's stack of
 * groups is 1274px and the Home feed grid 1603px. Point at a heading, a card, or one group
 * — never at a container of everything.
 *
 * A step whose target never appears is skipped rather than shown against a blank screen:
 * sidebar items are hidden below 800px, and several targets are role-gated. That is handled
 * in the player, but it is why every tour below opens with a step the reader can always see.
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** A CSS selector, or "center" for a step with no anchor — a welcome or sign-off card. */
  target: string;
  position: "top" | "bottom" | "left" | "right";
  /** Route this step needs. The player navigates before measuring; omit to stay put. */
  route?: string;
  /** Label for the final button. Only read on the last step. */
  action?: string;
}

export interface Tour {
  id: string;
  /** Shown in the picker and in the player's header. */
  name: string;
  /** One line in the picker saying what the tour covers. */
  blurb: string;
  /** Where the tour begins. The player navigates here before the first step. */
  route: string;
  /** Route prefix this tour belongs to. The player ends the tour when the reader navigates
   *  outside it — because a tour that walks between pages also follows a reader who leaves
   *  on their own, and a card anchored to Home does not belong on top of an unrelated page.
   *  Every step's route must sit inside this prefix; e2e/tours.spec.ts checks that. */
  scope: string;
  steps: TourStep[];
}

export const WELCOME_TOUR_ID = "welcome";

/** The original post-onboarding tour, unchanged in content — it still runs automatically for
 *  an account that has not seen it, and still describes Home and the sidebar. */
const WELCOME_TOUR: Tour = {
  id: WELCOME_TOUR_ID,
  name: "Welcome to Limbic",
  blurb: "The sixty-second version: what Home shows you and how the sidebar is organised.",
  route: "/home",
  scope: "/home",
  steps: [
    {
      id: "welcome",
      title: "Welcome to Limbic",
      description: "This is your home on Limbic. Let us take 60 seconds to show you around.",
      target: "center",
      position: "bottom",
    },
    {
      id: "sidebar",
      title: "Your Navigation",
      description:
        "Everything on Limbic lives here. The sidebar reorders based on your role — student, clinician, or general user.",
      target: '[data-tour="sidebar"]',
      position: "right",
    },
    {
      id: "daily-dashboard",
      title: "Your Daily Dashboard",
      description: "New studies and guidelines today, your reading streak, CE hours, and what's still unread — at a glance.",
      target: '[data-tour="daily-dashboard"]',
      position: "bottom",
    },
    {
      id: "limbic-agent",
      title: "Limbic Agent",
      description: "A personalized read on your week — what you've covered and the topics you haven't touched yet.",
      target: '[data-tour="limbic-agent"]',
      position: "bottom",
    },
    {
      id: "home-feed",
      title: "The Research Feed",
      description: "Fresh PT research, clinical guidelines, and industry news — curated daily. Filtered by type with the tabs above it.",
      target: '[data-tour="home-feed"]',
      position: "top",
    },
    {
      id: "limbic-student",
      title: "Limbic Student",
      description: "Your DPT academic hub. Specialty Tracks, Boards prep, Daily Sharpening, and your program timeline — all in one place.",
      target: '[data-tour="limbic-student"]',
      position: "right",
    },
    {
      id: "limbic-pro",
      title: "LimbicPRO",
      description: "Clinical tools for licensed PTs. Calculators, decision rules, red flag screening, Limbic Agent, Force Lab, and your patient dashboard.",
      target: '[data-tour="limbic-pro"]',
      position: "right",
    },
    {
      id: "atlas",
      title: "Limbic Atlas",
      description: "Interactive clinical anatomy. Click any region on the body map to see muscles, conditions, special tests, and board pearls.",
      target: '[data-tour="atlas"]',
      position: "right",
    },
    {
      id: "founding-funders",
      title: "Founding Funders",
      description: "Limbic is new. The people who back it early get lifetime access at a founding price. 50 spots total.",
      target: '[data-tour="founding-funders"]',
      position: "right",
    },
    {
      id: "complete",
      title: "You're ready",
      description:
        "That is Limbic. Start with the home feed, or take one of the section tours from your profile when you want the detail on a particular part.",
      target: "center",
      position: "bottom",
      action: "Start exploring",
    },
  ],
};

const PRO_TOUR: Tour = {
  id: "pro",
  name: "LimbicPRO",
  blurb: "The clinical tools, what each is for, and which of them you already have.",
  route: "/pro/toolbox",
  scope: "/pro",
  steps: [
    {
      id: "intro",
      title: "LimbicPRO",
      description:
        "The clinician side of Limbic. Some of it is free with any account, some needs a subscription — this tour says which is which as it goes.",
      target: "center",
      position: "bottom",
      route: "/pro/toolbox",
    },
    {
      id: "toolbox",
      title: "Start at the Toolbox",
      description:
        "Every PRO tool on one page, grouped by when you'd reach for it rather than by what it costs. A locked card still tells you what the tool does.",
      target: '[data-tour="toolbox-intro"]',
      position: "bottom",
      route: "/pro/toolbox",
    },
    {
      id: "caseload",
      title: "Your caseload",
      description:
        "The tools you work in rather than look things up in — the patient dashboard, visit notes, and the end-of-day summary. These need a PRO subscription.",
      target: '[data-tour="toolbox-group-your-caseload"]',
      position: "bottom",
      route: "/pro/toolbox",
    },
    {
      id: "lookup",
      title: "Look it up",
      description:
        "Lab values, practice guidelines, documentation templates and plain-language pathologies. Reference you open mid-session and close again — the screening rules live one group up.",
      target: '[data-tour="toolbox-group-look-it-up"]',
      position: "bottom",
      route: "/pro/toolbox",
    },
    {
      id: "outcome-measures",
      title: "Outcome Measures",
      description:
        "Score entry for the standard measures, with the interpretation bands and published MDC and MCID figures beside each one. Free with any account.",
      target: '[data-tour="pro-calculators"]',
      position: "top",
      route: "/pro/calculators",
    },
    {
      id: "special-tests",
      title: "Special Tests",
      description:
        "The orthopaedic special tests with their sensitivity and specificity, so you can see what a positive result is actually worth. Also free.",
      target: '[data-tour="pro-special-tests"]',
      position: "top",
      route: "/pro/special-tests",
    },
    {
      id: "done",
      title: "That's LimbicPRO",
      description:
        "The Toolbox is the page to come back to — it is the only place that lists everything. Outcome Measures and Special Tests sit in the sidebar because you open those with a patient in front of you.",
      target: "center",
      position: "bottom",
      route: "/pro/toolbox",
      action: "Done",
    },
  ],
};

const STUDENT_TOUR: Tour = {
  id: "student",
  name: "Limbic Student",
  blurb: "The DPT side: Boards prep, the playbooks, and the free NPTE references.",
  route: "/student",
  scope: "/student",
  steps: [
    {
      id: "intro",
      title: "Limbic Student",
      description:
        "Everything built for the DPT years. Some of it needs a verified student subscription; the NPTE references below are free to anyone signed in.",
      target: "center",
      position: "bottom",
      route: "/student",
    },
    {
      id: "atrium",
      title: "Your Atrium",
      description:
        "The student home — what you have been studying, what is due, and where you are in your program.",
      target: '[data-tour="student-main"]',
      position: "top",
      route: "/student",
    },
    {
      id: "resources",
      title: "NPTE Resources",
      description:
        "Real FSBPT and NPTE reference links, gated on nothing but being signed in. Worth knowing about before you decide whether the paid tier is for you.",
      target: '[data-tour="student-resources"]',
      position: "top",
      route: "/student/resources",
    },
    {
      id: "sidebar",
      title: "The rest of the section",
      description:
        "Boards, Clinical Reference, the Study Guide and the examination Playbooks all live under Limbic Student in the sidebar. Boards is open to licensed clinicians too, not only students.",
      target: '[data-tour="limbic-student"]',
      position: "right",
      route: "/student",
    },
    {
      id: "done",
      title: "That's Limbic Student",
      description:
        "The Atrium is the page to come back to. If you are studying for the NPTE, the Playbooks are the place to start — they are the examination sequences written out in order.",
      target: "center",
      position: "bottom",
      route: "/student",
      action: "Done",
    },
  ],
};

const WELLNESS_TOUR: Tour = {
  id: "wellness",
  name: "Health & Wellness",
  blurb: "The personal side: your metrics, your activity log, and what the hub links out to.",
  route: "/wellness",
  scope: "/wellness",
  steps: [
    {
      id: "intro",
      title: "Health & Wellness",
      description:
        "This part of Limbic is about you rather than your patients — your own metrics, activity, and the general-audience health content.",
      target: "center",
      position: "bottom",
      route: "/wellness",
    },
    {
      id: "quick-actions",
      title: "Log something quickly",
      description: "The two things you do most often — record activity, or update your metrics — one tap from the hub.",
      target: '[data-tour="wellness-quick-actions"]',
      position: "bottom",
      route: "/wellness",
    },
    {
      id: "explore",
      title: "The rest of the hub",
      description:
        "Nutrition, self-assessment and the exercise library are all one click from here. They are not duplicated in the sidebar, which is why this page is worth knowing.",
      target: '[data-tour="wellness-explore"]',
      position: "top",
      route: "/wellness",
    },
    {
      id: "metrics",
      title: "Metrics",
      description: "Where your own numbers live, and where the hub's snapshot reads from.",
      target: '[data-tour="wellness-metrics"]',
      position: "top",
      route: "/wellness/metrics",
    },
    {
      id: "done",
      title: "That's Health & Wellness",
      description:
        "Nothing here is clinical advice, and nothing you enter is shared with anyone. It is a personal log that happens to sit next to the professional tools.",
      target: "center",
      position: "bottom",
      route: "/wellness",
      action: "Done",
    },
  ],
};

const CONNEXION_TOUR: Tour = {
  id: "connexion",
  name: "Connexion Method",
  blurb: "What the method is, who it serves, and where the AFIT assessment fits.",
  route: "/connexion",
  scope: "/connexion",
  steps: [
    {
      id: "intro",
      title: "The Connexion Method",
      description:
        "A fall-prevention and caregiver-support approach with its own section in Limbic. This tour covers what is here and who it is for.",
      target: "center",
      position: "bottom",
      route: "/connexion",
    },
    {
      id: "mission",
      title: "The idea",
      description: "What the method sets out to do, in its own words.",
      target: '[data-tour="connexion-mission"]',
      position: "bottom",
      route: "/connexion",
    },
    {
      id: "features",
      title: "What's in the section",
      description:
        "Caregiver Education, the Connexion Protocol, and the Safety Score. Two of the three need a subscription; the cards say which.",
      target: '[data-tour="connexion-features"]',
      position: "top",
      route: "/connexion",
    },
    {
      id: "afit",
      title: "The AFIT assessment",
      description:
        "The assessment itself, open to anyone signed in. It screens for change that is already present rather than predicting a future fall.",
      target: '[data-tour="connexion-afit"]',
      position: "top",
      route: "/connexion/afit",
    },
    {
      id: "caregiver",
      title: "Caregiver Education",
      description: "Written for the person doing the caring rather than for a clinician. Also open to anyone signed in.",
      target: '[data-tour="connexion-caregiver"]',
      position: "top",
      route: "/connexion/caregiver",
    },
    {
      id: "done",
      title: "That's the Connexion Method",
      description:
        "The Overview is the page to come back to. Delia Vicencio's own page in the sidebar covers who developed the method and their background.",
      target: "center",
      position: "bottom",
      route: "/connexion",
      action: "Done",
    },
  ],
};

export const TOURS: readonly Tour[] = [WELCOME_TOUR, PRO_TOUR, STUDENT_TOUR, WELLNESS_TOUR, CONNEXION_TOUR];

/** Tours offered in the picker, in the order they are listed. The welcome tour leads because
 *  it is the one that explains where everything else is. */
export const SECTION_TOURS: readonly Tour[] = TOURS.filter((t) => t.id !== WELCOME_TOUR_ID);

export function findTour(id: string | null | undefined): Tour | null {
  if (!id) return null;
  return TOURS.find((t) => t.id === id) ?? null;
}
