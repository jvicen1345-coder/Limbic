/**
 * The admin surface, split into areas that can be delegated one at a time.
 *
 * Site admin used to be all-or-nothing: an account was on FOUNDING_FUNDERS_ADMIN_EMAILS
 * (see lib/session.ts isAdminEmail) and could open every admin page, or it was not and
 * could open none. That is the right shape for the owner and the wrong shape for everyone
 * else — someone brought in to work the license queue has no business deleting accounts.
 * These areas are the unit a co-admin is granted (see User.adminAreas in schema.prisma,
 * lib/admin.ts hasAdminArea, and the Co-Admin controls on /admin/accounts).
 *
 * No "server-only" here on purpose: the labels below are rendered by the client component
 * that toggles grants (components/AccountsAdminTable.tsx), and the parser is called from
 * lib/session.ts on the server. Nothing in this file reads the session or the database, so
 * both sides can import it without dragging server code into the browser bundle.
 *
 * One area per admin page, matched to the page rather than to the underlying feature: the
 * question an owner is answering is "which of these screens should this person see," and a
 * list that mirrors the Admin nav is the list they can answer it from. `connexion` is the
 * one exception, covering both Connexion screens (visits and safety scores) because they
 * are one job — the same person triages a visit request and scores the home it is for.
 */
export const ADMIN_AREAS = [
  "accounts",
  "licenses",
  "suggestions",
  "copyright",
  "appraisals",
  "boardsTagging",
  "programs",
  "movementLab",
  "connexion",
  "foundingFunders",
] as const;

export type AdminArea = (typeof ADMIN_AREAS)[number];

/** Short names for the grant chips on /admin/accounts. These read as the Admin nav reads
 *  (see components/shell/NavContent.tsx), so an owner picking areas and a co-admin reading
 *  their sidebar are looking at the same words. */
export const ADMIN_AREA_LABELS: Record<AdminArea, string> = {
  accounts: "Accounts",
  licenses: "License Queue",
  suggestions: "Suggestions",
  copyright: "Copyright Notices",
  appraisals: "Appraisals",
  boardsTagging: "Boards Tagging",
  programs: "Programs",
  movementLab: "Movement Lab Requests",
  connexion: "Connexion",
  foundingFunders: "Founding Funders",
};

/** What each area actually lets someone do — shown under the chips, because "Accounts"
 *  sounds harmless and means "can delete any account and comp any paid tier." An owner
 *  should be able to see the blast radius of a grant without reading the source. */
export const ADMIN_AREA_DESCRIPTIONS: Record<AdminArea, string> = {
  accounts:
    "View every account, delete accounts, and comp paid tiers. Does not include granting co-admin access.",
  licenses: "Verify or reject PT license submissions.",
  suggestions: "Read and clear reader suggestions.",
  copyright: "Work the DMCA queue: record notices, take content down, restore it, suspend repeat infringers.",
  appraisals: "Write, publish, and unpublish Limbic research appraisals.",
  boardsTagging: "Tag Limbic Boards questions with Atlas body regions.",
  programs: "Maintain the DPT program directory and institutional outreach tracking.",
  movementLab: "Work the Movement Lab request queue.",
  connexion: "Triage Connexion home-visit requests and administer Safety Score assessments.",
  foundingFunders: "See the registered-user roster and manually confirm Founding Funder payments.",
};

/** Parses User.adminAreas (a JSON column, so untyped at the DB layer) back into a clean
 *  AdminArea[], silently dropping anything that isn't a known area — same defensive parsing
 *  as this app's other JSON columns (see compedAreas in lib/session.ts, followedTopics).
 *  Dropping unknown values matters more here than elsewhere: an area removed from the list
 *  above must stop granting anything, not fall through as an unrecognized-but-truthy
 *  string. */
export function parseAdminAreas(value: unknown): AdminArea[] {
  if (!Array.isArray(value)) return [];
  return ADMIN_AREAS.filter((area) => value.includes(area));
}
