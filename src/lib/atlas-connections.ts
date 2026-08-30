/**
 * Broad-region grouping used to connect Limbic Atlas's 29 real zones (see lib/atlas-regions.ts)
 * to the coarser, single-word region vocabulary Force Lab already uses (lib/force-lab-muscles.ts's
 * `bodyRegions`: Hip, Knee, Ankle, Shoulder, Elbow, Wrist) and, separately, to power the
 * region-filter map for /pro/special-tests (see lib/atlas-special-test-regions.ts). Every one
 * of the 29 zone ids from ANTERIOR_GROUPS/POSTERIOR_GROUPS is assigned to exactly one bucket
 * below.
 */

export type BroadRegion =
  | "head-neck"
  | "shoulder-chest"
  | "arm-elbow"
  | "forearm-wrist"
  | "core-abdomen"
  | "hip-thigh"
  | "knee"
  | "lower-leg-ankle";

export const BROAD_REGION_ZONES: Record<BroadRegion, string[]> = {
  "head-neck": ["cervical-anterior", "cervical-posterior", "upper-trapezius"],
  "shoulder-chest": ["sternum-chest", "shoulder-anterior", "rotator-cuff-posterior"],
  "arm-elbow": ["biceps-anterior", "elbow-anterior", "triceps-posterior", "elbow-posterior"],
  "forearm-wrist": ["forearm-anterior", "wrist-hand", "forearm-posterior"],
  "core-abdomen": ["abdominals", "thoracic-spine", "lumbar-spine"],
  "hip-thigh": ["hip-flexors", "hip-adductors", "quadriceps", "gluteus-maximus", "gluteus-medius", "hamstrings"],
  knee: ["knee-anterior", "knee-posterior"],
  "lower-leg-ankle": ["anterior-leg", "ankle-foot-anterior", "calf-gastrocnemius", "achilles-posterior-ankle"],
};

const ZONE_TO_BROAD_REGION: Record<string, BroadRegion> = Object.entries(BROAD_REGION_ZONES).reduce(
  (acc, [broad, zones]) => {
    for (const zone of zones) acc[zone] = broad as BroadRegion;
    return acc;
  },
  {} as Record<string, BroadRegion>,
);

export function broadRegionForZone(zoneId: string): BroadRegion | null {
  return ZONE_TO_BROAD_REGION[zoneId] ?? null;
}

/** Force Lab's own single-word region tokens (lib/force-lab-muscles.ts's `bodyRegions`) for
 *  every broad region that has a testable muscle group in Force Lab — Head and Neck and
 *  Core and Abdomen have no Force Lab equivalent, so they're absent here. */
export const FORCE_LAB_TOKEN_BY_BROAD_REGION: Partial<Record<BroadRegion, string>> = {
  "shoulder-chest": "Shoulder",
  "arm-elbow": "Elbow",
  "forearm-wrist": "Wrist",
  "hip-thigh": "Hip",
  knee: "Knee",
  "lower-leg-ankle": "Ankle",
};

export function forceLabTokenForZone(zoneId: string): string | null {
  const broad = broadRegionForZone(zoneId);
  if (!broad) return null;
  return FORCE_LAB_TOKEN_BY_BROAD_REGION[broad] ?? null;
}
