/** Shared types/helpers for the post-signup license verification flow (see
 *  components/AddLicenseModal.tsx, components/ProfessionalCredentialsCard.tsx,
 *  app/actions/license.ts, app/(app)/admin/licenses/page.tsx). Kept free of server-only
 *  imports so client components can import from here too, same convention as
 *  lib/vitals.ts/lib/metrics.ts. */

export const LICENSE_STATUSES = ["pending", "verified", "rejected"] as const;
export type LicenseStatus = (typeof LICENSE_STATUSES)[number];

/** Shows just enough of a license number to be recognizable without displaying the whole
 *  thing — deliberately doesn't reveal the real length either (always the same number of
 *  mask characters) so a partial screenshot can't be used to guess the rest. */
export function maskLicenseNumber(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 2) return "*".repeat(Math.max(trimmed.length, 4));
  return `${trimmed.slice(0, 2)}${"*".repeat(6)}`;
}

/** Loose, case/whitespace-insensitive comparison for the Add License modal's soft "this
 *  doesn't match your account name" nudge (see AddLicenseModal Step 3) — not a blocker,
 *  people's account display names are often stylized ("Dr. Amara Chen, PT") while a license
 *  name is plain, so this only needs to catch genuinely different names, not punctuation. */
export function namesLooselyMatch(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ");
  return normalize(a) === normalize(b);
}
