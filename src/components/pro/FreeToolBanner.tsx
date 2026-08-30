import Link from "next/link";

/** Shown at the top of every clinical-reference tool that used to require LimbicPRO and no
 *  longer does (Outcome Measures, Screening & Decision Support, Special Tests, Clinical
 *  Reference, Documentation Templates, Guidelines — see each page's own gate, now just
 *  `if (!user) return null`). Hidden for a real LimbicPRO subscriber — there's nothing to
 *  upsell them on, and every one of these tools already reads as fully theirs. */
export function FreeToolBanner({ isPro }: { isPro: boolean }) {
  if (isPro) return null;

  return (
    <div className="free-tool-banner">
      Free clinical reference — no subscription required.{" "}
      <Link href="/profile/membership">Upgrade to LimbicPRO</Link> to unlock HEP Builder, Force Lab, Limbic
      Agent, and your clinical dashboard.
    </div>
  );
}
