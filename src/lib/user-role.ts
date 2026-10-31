export type UserRole = "pt" | "pts" | "general";

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "pt", label: "Physical Therapist", description: "Licensed clinician" },
  { value: "pts", label: "PT Student", description: "Currently enrolled in a DPT program" },
  { value: "general", label: "General", description: "Patient, caregiver, or general public" },
];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.some((r) => r.value === value);
}

/** The Health and Wellness hub's six Explore cards (see app/(app)/wellness/page.tsx) —
 *  two large "primary" cards followed by four smaller ones. Every key always renders for
 *  every account; role only changes the order, which in turn decides which two get the
 *  large treatment. The card each key maps to (title, copy, route) lives with the page. */
export type WellnessCardKey = "metrics" | "activity" | "nutrition" | "assess" | "exercises" | "connexion";

const WELLNESS_CARD_ORDER: Record<UserRole, WellnessCardKey[]> = {
  // A licensed clinician tracking their own numbers: the two logging surfaces lead.
  pt: ["metrics", "activity", "assess", "exercises", "nutrition", "connexion"],
  // A student is likeliest here for the self-screens, so those get the second large slot.
  pts: ["metrics", "assess", "activity", "exercises", "nutrition", "connexion"],
  // General public: nutrition is the most-asked-for surface after the numbers themselves.
  general: ["metrics", "nutrition", "activity", "exercises", "assess", "connexion"],
};

/** Falls back to the "general" order for an account with no role set yet (a legacy account
 *  or one mid-way through the onboarding gate) so the call site gets a usable order. */
export function wellnessCardOrder(role: string | null): WellnessCardKey[] {
  return WELLNESS_CARD_ORDER[isUserRole(role ?? "") ? (role as UserRole) : "general"];
}
