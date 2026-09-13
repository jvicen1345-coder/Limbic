/**
 * Owner-protection for copyright suspend / unsuspend (issue #496).
 *
 * A copyright co-admin can work the DMCA queue, including suspending a repeat infringer.
 * That must not extend to allowlist owners: getCurrentUser() returns null while an account
 * is suspended, which locks the owner out of /admin/accounts so they cannot revoke the
 * grant without another owner or a database edit.
 *
 * Pure on purpose. Unit tests cover the policy without standing up
 * FOUNDING_FUNDERS_ADMIN_EMAILS in CI (see issue #500). Callers pass whether each side is
 * an owner — typically `isAdminEmail` on `email` / `licenseEmail` — rather than this file
 * reading the session or the env allowlist itself.
 */

export const OWNER_SUSPEND_BLOCKED = "Owner accounts cannot be suspended.";
export const OWNER_UNSUSPEND_BLOCKED = "Only a full admin can lift an owner suspension.";

export function copyrightOwnerTargetError(opts: {
  action: "suspend" | "unsuspend";
  targetIsOwner: boolean;
  actorIsOwner: boolean;
}): string | null {
  if (!opts.targetIsOwner) return null;
  if (opts.action === "suspend") return OWNER_SUSPEND_BLOCKED;
  if (!opts.actorIsOwner) return OWNER_UNSUSPEND_BLOCKED;
  return null;
}
