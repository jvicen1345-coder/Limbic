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

/** Success line after claimFoundingSpotAction. Spot count alone hid that a co-admin
 *  (or an owner self-claim) did not grant Lifetime Access. */
export function foundingClaimSuccessCopy(input: {
  claimedCount: number;
  totalSlots: number;
  grantedPro: boolean;
}): string {
  const filled = `Claimed, ${input.claimedCount} of ${input.totalSlots} spots filled.`;
  if (input.grantedPro) {
    return `${filled} Lifetime Access granted.`;
  }
  return `${filled} Lifetime Access was not granted. An owner can comp Pro from /admin/accounts.`;
}

/** Shown on the claim form for a foundingFunders co-admin. Owners already grant Pro
 *  when claiming someone else, so they do not need this. */
export const FOUNDING_CLAIM_COADMIN_NOTE =
  "This records the payment roster spot. An owner comps Pro / Lifetime Access from /admin/accounts.";
