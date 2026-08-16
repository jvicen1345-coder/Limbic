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
