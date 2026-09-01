export type UserRole = "pt" | "pts" | "general";

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "pt", label: "Physical Therapist", description: "Licensed clinician" },
  { value: "pts", label: "PT Student", description: "Currently enrolled in a DPT program" },
  { value: "general", label: "General", description: "Patient, caregiver, or general public" },
];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.some((r) => r.value === value);
}

/** The sidebar's seven reorderable sections (see components/AppShell.tsx) — every key
 *  always renders for every account regardless of role; only the order changes. */
export type ZoneTwoKey = "connexion" | "student" | "pro" | "wellness" | "nexus" | "saved" | "articles";

const ZONE_TWO_ORDER: Record<UserRole, ZoneTwoKey[]> = {
  pt: ["pro", "nexus", "articles", "connexion", "wellness", "student", "saved"],
  pts: ["student", "pro", "articles", "nexus", "wellness", "connexion", "saved"],
  general: ["wellness", "connexion", "articles", "saved", "nexus", "student", "pro"],
};

/** Falls back to the "general" order for an account with no role set yet (a legacy account
 *  from before this shipped, or one mid-way through the onboarding gate) — keeps the
 *  sidebar rendering something sensible rather than needing a null case at the call site. */
export function zoneTwoOrder(role: string | null): ZoneTwoKey[] {
  return ZONE_TWO_ORDER[isUserRole(role ?? "") ? (role as UserRole) : "general"];
}

/** The Health and Wellness hub's six Explore cards (see app/(app)/wellness/page.tsx) —
 *  two large "primary" cards followed by four smaller ones. Every key always renders for
 *  every account; like ZONE_TWO_ORDER above, role only changes the order, which in turn
 *  decides which two get the large treatment. The card each key maps to (title, copy,
 *  route) lives with the page itself. */
export type WellnessCardKey = "metrics" | "activity" | "nutrition" | "assess" | "exercises" | "connexion";

const WELLNESS_CARD_ORDER: Record<UserRole, WellnessCardKey[]> = {
  // A licensed clinician tracking their own numbers: the two logging surfaces lead.
  pt: ["metrics", "activity", "assess", "exercises", "nutrition", "connexion"],
  // A student is likeliest here for the self-screens, so those get the second large slot.
  pts: ["metrics", "assess", "activity", "exercises", "nutrition", "connexion"],
  // General public: nutrition is the most-asked-for surface after the numbers themselves.
  general: ["metrics", "nutrition", "activity", "exercises", "assess", "connexion"],
};

/** Same "general" fallback for a role-less account as zoneTwoOrder above, and for the same
 *  reason — the call site gets a usable order rather than a null case to handle. */
export function wellnessCardOrder(role: string | null): WellnessCardKey[] {
  return WELLNESS_CARD_ORDER[isUserRole(role ?? "") ? (role as UserRole) : "general"];
}
