import { ADMIN_AREAS, parseAdminAreas, type AdminArea } from "@/lib/admin-areas";

/**
 * Owner-allowlist and admin-area decision helpers.
 *
 * These used to live in lib/session.ts next to getCurrentUser(). They are here — and this
 * file has no `server-only` — so node:test can exercise the grant/revoke and area-resolution
 * rules without pulling in cookies, Prisma, or Next headers (see admin-authz.test.ts and
 * issue #500). Behavior is unchanged: session.ts and lib/admin.ts re-export or wrap the
 * same functions they always did.
 *
 * Nothing here reads the session or the database. The allowlist is env
 * (FOUNDING_FUNDERS_ADMIN_EMAILS); everything else is the already-loaded user row.
 */

/** Comma-separated sign-in emails allowed into every admin-only surface. Empty when the
 *  env var is unset — CI leaves it unset on purpose, so there are no owners in the test
 *  environment and every admin surface stays closed unless a test sets the var itself. */
function adminAllowlist(): string[] {
  return (process.env.FOUNDING_FUNDERS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether `email` is on the site-admin allowlist. Matched case-insensitively against
 *  either a General sign-in email or a PT license sign-in's email (see isSiteAdmin /
 *  hasStudentAccess in lib/session.ts and lib/admin.ts). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminAllowlist();
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase());
}

export type AdminAreaUser = {
  email: string | null;
  licenseEmail: string | null;
  adminAreas: unknown;
};

/** Every admin area `user` can open — the whole list for an account on the allowlist above,
 *  whatever an owner has delegated to it otherwise (see User.adminAreas), and an empty list
 *  for everyone else.
 *
 *  Note what is deliberately absent: unlike the allowlist, a co-admin grant does NOT feed
 *  getCurrentUser()'s paid-tier overlay. Delegating the license queue to someone is not a
 *  decision to hand them LimbicPro. */
export function adminAreasForUser(user: AdminAreaUser): AdminArea[] {
  if (isAdminEmail(user.email) || isAdminEmail(user.licenseEmail)) return [...ADMIN_AREAS];
  return parseAdminAreas(user.adminAreas);
}

/** Sync core of hasAdminArea() in lib/admin.ts — same answer, given the already-loaded user
 *  (or null for a guest / signed-out visitor) instead of reading the session. */
export function hasAdminAreaForUser(user: AdminAreaUser | null, area: AdminArea): boolean {
  if (!user) return false;
  return adminAreasForUser(user).includes(area);
}

export type OwnerAdminAreaTarget = {
  adminAreas: unknown;
  isGuest: boolean;
  email: string | null;
  licenseEmail: string | null;
};

/** Decision table for requireOwnerForTarget in app/actions/admin.ts.
 *
 *  The action still owns the I/O (isSiteAdmin + the Prisma load). This is the part that
 *  decides: only an allowlist owner may change co-admin access; guests cannot be granted;
 *  an allowlist owner is already a full admin and is not written as a row of chips. */
export function evaluateOwnerAdminAreaTarget(input: {
  callerIsOwner: boolean;
  target: OwnerAdminAreaTarget | null;
}): { error?: string; current?: AdminArea[] } {
  if (!input.callerIsOwner) return { error: "Only a full admin can change co-admin access." };
  if (!input.target) return { error: "That account no longer exists." };
  if (input.target.isGuest) return { error: "Guest accounts can't be given admin access." };
  if (isAdminEmail(input.target.email) || isAdminEmail(input.target.licenseEmail)) {
    return { error: "That account is already a full admin through the environment allowlist." };
  }
  return { current: parseAdminAreas(input.target.adminAreas) };
}

/** `area` arrives from a client component, so it is only AdminArea by declaration until
 *  this checks it. Used by grantAdminAreaAction / revokeAdminAreaAction. */
export function unknownAdminAreaError(area: string): string | undefined {
  if (!(ADMIN_AREAS as readonly string[]).includes(area)) return "Unknown admin area.";
  return undefined;
}
