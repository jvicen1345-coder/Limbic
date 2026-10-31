import type { SubTab } from "@/components/SubTabs";

// One list per multi-page section. The sidebar names the section; these tabs are the
// sub-pages, so a row and a tab cannot drift apart by being edited in two places.

export interface SectionAccess {
  isStudent: boolean;
  /** Paid Limbic Student (studentTier === "limbicStudent"), narrower than isStudent. */
  isVerifiedStudent: boolean;
  hasLicense: boolean;
  isPro: boolean;
}

/** Learn's pages. A non-student still gets the overview and the free NPTE links; the
 *  paid-tier pages stay off the bar entirely, the same collapse the old sidebar used.
 *  Boards stays for a licensed clinician, with the STUDENT+ lock until they are verified
 *  or licensed. */
export function learnTabs(access: SectionAccess): SubTab[] {
  const tabs: SubTab[] = [{ href: "/student", label: access.isStudent ? "Atrium" : "Overview" }];
  if (access.isStudent) {
    tabs.push(
      { href: "/student/study-guide", label: "Study Guide" },
      { href: "/student/playbooks", label: "Playbooks" },
    );
  }
  if (access.isStudent || access.hasLicense) {
    tabs.push({
      href: "/boards",
      label: "Boards",
      locked: !access.isVerifiedStudent && !access.hasLicense,
      lockLabel: "STUDENT+",
    });
  }
  if (access.isStudent) {
    tabs.push({ href: "/student/roundup", label: "Weekly Roundup" });
  }
  tabs.push({ href: "/student/resources", label: "NPTE Resources" });
  return tabs;
}

/** Clinical's pages. Dashboard, Limbic Agent, and Exercise Programs stay visible when
 *  locked so a reader can see what LimbicPRO contains. Clinical Reference stays on the
 *  student path into it; clinicians still reach it from the Toolbox. */
export function clinicalTabs(access: Pick<SectionAccess, "isPro" | "isStudent">): SubTab[] {
  const tabs: SubTab[] = [
    { href: "/pro/dashboard", label: "Dashboard", locked: !access.isPro, lockLabel: "PRO" },
    { href: "/pro/toolbox", label: "Toolbox" },
    { href: "/agent", label: "Limbic Agent", locked: !access.isPro, lockLabel: "PRO" },
    { href: "/hep", label: "Exercise Programs", locked: !access.isPro, lockLabel: "PRO" },
  ];
  if (access.isStudent) {
    tabs.push({ href: "/pro/lab-values", label: "Clinical Reference" });
  }
  return tabs;
}

export const SAVED_TABS: SubTab[] = [
  { href: "/saved/articles", label: "Articles" },
  { href: "/saved/guidelines", label: "Guidelines" },
  { href: "/saved/wellness", label: "Wellness" },
  { href: "/saved/clips", label: "Clips" },
];

export const WELLNESS_TABS: SubTab[] = [
  { href: "/wellness", label: "Overview" },
  { href: "/wellness/metrics", label: "Metrics" },
  { href: "/wellness/activity", label: "Activity" },
];

export const NEXUS_TABS: SubTab[] = [
  { href: "/nexus", label: "Feed" },
  { href: "/nexus/directory", label: "Directory" },
  { href: "/nexus/connections", label: "Connections" },
  { href: "/nexus/messages", label: "Messages" },
];

/** Protocol and Safety Score stay on the bar when locked, matching the old sidebar rows. */
export function connexionTabs(isPro: boolean): SubTab[] {
  return [
    { href: "/connexion", label: "Overview" },
    { href: "/connexion/afit", label: "AFIT Assessment" },
    { href: "/connexion/protocol", label: "What to Expect", locked: !isPro, lockLabel: "PRO" },
    { href: "/connexion/safety-score", label: "Safety Score", locked: !isPro, lockLabel: "PRO" },
    { href: "/connexion/caregiver", label: "Caregiver Education" },
    { href: "/connexion/delia", label: "About Delia" },
  ];
}

export const NEWS_TABS: SubTab[] = [
  { href: "/news", label: "APTA" },
  { href: "/news/general", label: "General" },
];

/** Retracted Articles joins the news bar only for a licensed reader. The route stays
 *  reachable either way; an unlicensed visit still renders the page's own gate. */
export function newsTabs(hasLicense: boolean): SubTab[] {
  return hasLicense ? [...NEWS_TABS, { href: "/under-review", label: "Retracted Articles" }] : NEWS_TABS;
}

export const PROFILE_TABS: SubTab[] = [
  { href: "/profile", label: "Profile" },
  { href: "/profile/credentials", label: "Credentials" },
  { href: "/profile/membership", label: "Membership" },
];
