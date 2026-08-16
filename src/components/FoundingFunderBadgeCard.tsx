import { FoundingFunderBadgeToggle } from "@/components/FoundingFunderBadgeToggle";

/** Profile — only rendered for an actual confirmed funder (see app/(app)/profile/page.tsx).
 *  Lets a funder hide their badge everywhere it would otherwise show (this page, Nexus, the
 *  number next to their name on Home) without touching their underlying FoundingFunder row. */
export function FoundingFunderBadgeCard({ hidden, number }: { hidden: boolean; number: number | null }) {
  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker">Founding Funder badge</div>
        <FoundingFunderBadgeToggle hidden={hidden} />
      </div>
      <p className="card-body" style={{ marginTop: 2 }}>
        {`Your Founding Funder${number != null ? ` No. ${number}` : ""} badge appears here on your profile, next to your name in Nexus, and next to your name on Home. Turn it off if you’d rather keep it private.`}
      </p>
    </div>
  );
}
