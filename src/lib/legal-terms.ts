/**
 * The version of the Terms of Service / Privacy Policy pair that new accounts accept at
 * signup, recorded on User.termsAcceptedAt / User.termsVersion (see schema.prisma).
 *
 * This is the "Last updated" date the two documents share — app/terms/page.tsx and
 * app/privacy/page.tsx both render it via LegalPageLayout's `updated` prop. **When either
 * document is materially revised, bump both the `updated` prop there and this constant in
 * the same change**, so an account's stored termsVersion always names a specific,
 * retrievable version of the text rather than "whatever /terms says today". That is the
 * whole point of storing it: showing that a particular reader affirmatively accepted
 * particular language on a particular date.
 *
 * Deliberately a plain date string rather than a semver — it's the identifier already
 * printed on the documents themselves, so the two can't drift apart into separate
 * numbering schemes.
 */
export const TERMS_VERSION = "2026-08-31";

/** The form field name for the signup/guest clickwrap checkbox, shared between the form
 *  (components/SignInForm.tsx) and the server-side check every account-creating action
 *  runs on it (app/actions/auth.ts) — the client-side `required` attribute is a
 *  convenience, never the enforcement point. */
export const ACCEPT_TERMS_FIELD = "acceptTerms";

/** True only for the checkbox's checked value. A checkbox that isn't ticked submits no
 *  entry at all, so this reads as false for both "absent" and "present but not 'on'". */
export function hasAcceptedTerms(formData: FormData): boolean {
  return formData.get(ACCEPT_TERMS_FIELD) === "on";
}
