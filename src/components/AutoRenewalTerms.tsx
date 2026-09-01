/**
 * The automatic-renewal disclosure that sits directly above a subscribe button.
 *
 * California's Automatic Renewal Law applies to Limbic (a California business selling
 * recurring subscriptions) and requires the renewal terms be presented clearly and
 * conspicuously *in visual proximity to* the request for consent — not only on the payment
 * page that follows, and not only buried in the Terms. The FTC's negative-option rule
 * points the same way. Non-compliance in California can make the charges unconditional
 * gifts, and ARL is a favourite of consumer class-action firms precisely because so many
 * products disclose late.
 *
 * Terms §9 already sets all of this out correctly; what was missing was showing it at the
 * moment of consent. This is deliberately a plain sentence rather than fine print — the
 * disclosure has to be conspicuous to do its job, so don't shrink it below the surrounding
 * body copy or grey it out to near-invisibility.
 *
 * The cancellation half is not a promise the UI can't keep: cancelProAction /
 * cancelWellnessPlusAction back the Cancel buttons on Profile → Membership, so a reader can
 * always cancel online in the place this names.
 *
 * `price` is the amount as displayed elsewhere on the surface (e.g. "$15"); omit it where
 * one statement covers several plans whose prices are already shown beside their own
 * buttons, as on the plan comparison table. `cadence` is the billing period it recurs on.
 * Pass `inverted` on the dark surfaces (the /pro upsell, Atlas) so the text keeps its
 * contrast.
 */
export function AutoRenewalTerms({
  price,
  cadence,
  inverted = false,
}: {
  price?: string;
  cadence: "month" | "year";
  inverted?: boolean;
}) {
  return (
    <p className={inverted ? "auto-renewal-terms auto-renewal-terms--inverted" : "auto-renewal-terms"}>
      {price ? `${price} per ${cadence}, charged` : "Paid plans are charged"} today and automatically renewed every{" "}
      {cadence} until you cancel. Cancel any time from Profile &rarr; Membership; cancellation takes effect at the
      end of the current billing period and partial periods are not refunded.
    </p>
  );
}
