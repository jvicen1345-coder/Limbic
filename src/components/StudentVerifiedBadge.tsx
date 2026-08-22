/** A small pill marking a paid LimbicStudent account — reuses the same `.license-badge`
 *  styling a verified license already uses elsewhere (ProfessionalCredentialsCard.tsx), same
 *  "verified, trustworthy" green look, rather than inventing a new visual language for one
 *  more badge. Pass `compact` for the shorter "Verified" version used inline next to a name
 *  (the sidebar nameplate, see AppShell.tsx); omit it for the full "Verified Student" version
 *  (Profile page, next to the h1). */
export function StudentVerifiedBadge({ compact }: { compact?: boolean }) {
  return <span className="license-badge license-badge--verified">{compact ? "Verified" : "Verified Student"}</span>;
}
