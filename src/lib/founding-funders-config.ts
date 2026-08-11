// Config surface for /founding-funders — flip the one flag below on launch day, nothing
// else on the page needs to change.

/** Section 5 shows the "coming soon" waitlist form while this is false, and the "Claim a
 *  Spot" button (self-serve $40 Stripe Checkout — see ClaimSpotButton.tsx,
 *  createFoundingFunderCheckout) once it's true. Flip to true on launch day, after
 *  completing the "Founding Funders payments" setup steps in README.md (creating the $40
 *  Stripe product/price and setting STRIPE_FOUNDING_FUNDER_PRICE_ID). */
export const FOUNDING_FUNDERS_OPEN = false;

/** The Founding 25 — fixed, not configurable per round (see FoundingFunder.round in
 *  schema.prisma for how a hypothetical future second cohort would be modeled instead). */
export const FOUNDING_FUNDERS_TOTAL_SLOTS = 25;

export const FOUNDING_FUNDERS_PRICE_USD = 40;

/** TODO: add the real Zelle recipient (phone number or email) before flipping
 *  FOUNDING_FUNDERS_OPEN to true — shown verbatim in Section 5's payment instructions. */
export const FOUNDING_FUNDERS_ZELLE_CONTACT = "[Add your Zelle phone number or email here]";
