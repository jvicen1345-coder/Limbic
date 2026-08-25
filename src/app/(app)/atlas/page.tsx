import type { Metadata } from "next";
import { getCurrentUser, hasClinicalReferenceAccess } from "@/lib/session";
import { AtlasClient } from "@/components/atlas/AtlasClient";

export const metadata: Metadata = {
  title: "Limbic Atlas",
};

/** Interactive 2D body map — click a region on the anterior/posterior SVG (or pick one from
 *  the region list) to pull up its clinical detail: key muscles, common conditions, special
 *  tests, outcome measures, and board pearls (see lib/atlas-content.ts). Free readers can
 *  click through every zone but only see a preview of each (see AtlasClient's paywall);
 *  full content opens up to the same tiers as the rest of the LimbicPRO clinical reference
 *  toolbox — hasClinicalReferenceAccess covers both LimbicPRO and Limbic Student, same as
 *  Clinical Reference, Special Tests, Decision Support, etc. Authentication itself is
 *  handled once for every (app) route by layout.tsx, not re-checked here. */
export default async function AtlasPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="atlas-page">
      <h1 className="atlas-page-title">Limbic Atlas</h1>
      <p className="atlas-page-subtitle">
        Interactive clinical anatomy — click any region to explore muscles, conditions, special tests, and board
        pearls.
      </p>
      <p className="atlas-page-note">Free users see preview content. Full access with Limbic Student or LimbicPRO.</p>

      <AtlasClient hasFullAccess={hasClinicalReferenceAccess(user)} />
    </div>
  );
}
