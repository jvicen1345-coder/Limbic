import { isAdminEmail } from "@/lib/session";

/**
 * Whether Nexus exists at all for this reader.
 *
 * Nexus — the directory, feed, connections and messaging — is **admin-only while its future
 * is being decided.** For everyone else it is not "coming soon" and not waitlisted: it is
 * absent. No nav entry, no Home widget, no profile fields, no share affordance, and every
 * /nexus/* route 404s rather than redirecting somewhere that names it. That is deliberate:
 * a waitlist screen advertises a feature that may never ship, and promising something and
 * then withdrawing it is worse than never having mentioned it.
 *
 * The data model is untouched. NexusPost/NexusMessage/connection rows, and every reader's
 * `nexusOptIn` flag, all stay exactly as they are, so this is reversible in one line —
 * either by relaxing this predicate, or by deleting the feature outright once that call is
 * made.
 *
 * Every surface that could reveal Nexus routes through here rather than repeating the admin
 * check, so there is one place to change and no way for one surface to fall out of step.
 */
export function nexusVisibleTo(user: { email: string | null; licenseEmail: string | null }): boolean {
  return isAdminEmail(user.email) || isAdminEmail(user.licenseEmail);
}
