/**
 * Who may write User.isPro from claimFoundingSpotAction (issue #497).
 *
 * Delegating foundingFunders lets a co-admin confirm out-of-band payments and list a
 * founding spot. It must not also be a paid-tier grant. /admin/accounts pulled the reader
 * roster and grantAccessAction out of ADMIN_AREAS for that reason; this write was leftover
 * owner blast radius on the same page.
 *
 * Owners keep the existing claim-and-grant path so Lifetime Access is still immediate when
 * they confirm someone else's payment (rewriting that owner flow is a non-goal). Nobody —
 * owner or co-admin — can use this action to set isPro on themselves. Owners already get
 * Pro through the session overlay (see getCurrentUser in lib/session.ts). Comp a reader
 * from /admin/accounts if that is what you meant.
 *
 * Pure on purpose so unit tests cover the policy without Prisma or the owner allowlist
 * (same shape as copyright-owner-guard.ts / #496).
 */
export function shouldWriteIsProOnFoundingClaim(input: {
  callerIsOwner: boolean;
  targetIsCaller: boolean;
}): boolean {
  return input.callerIsOwner && !input.targetIsCaller;
}
