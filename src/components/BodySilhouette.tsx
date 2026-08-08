/** A clean, simplified front-view human body outline built entirely from basic SVG shapes
 *  (no image files, no external libraries) — used by both the desktop and mobile layouts
 *  of Body Connections (see components/BodyConnectionsGame.tsx). Ten regions; a few (lungs,
 *  biceps, quadriceps, calves) are two separate shapes (left/right) sharing one region id.
 *  The click handler and state class live on each individual shape rather than a wrapping
 *  `<g>` — a `<g>`'s hit-testing bounding box for two disjoint shapes (e.g. both thighs)
 *  spans the empty gap between them, so a click aimed at that gap (or any bbox-center-based
 *  click, human or automated) would silently miss both shapes entirely. */

export const BODY_REGION_IDS = [
  "head",
  "shoulders",
  "lungs",
  "heart",
  "diaphragm",
  "core",
  "glutes",
  "biceps",
  "quadriceps",
  "calves",
] as const;

export type BodyRegionId = (typeof BODY_REGION_IDS)[number];

export function BodySilhouette({
  activeRegions,
  matchedRegions,
  selectedRegion,
  flashRegion,
  pulsingRegion,
  onRegionClick,
}: {
  /** Region ids that are part of today's round — everything else renders inert/muted. */
  activeRegions: string[];
  matchedRegions: string[];
  selectedRegion?: string | null;
  flashRegion?: string | null;
  /** Mobile only: the region the reader is currently being asked to find. */
  pulsingRegion?: string | null;
  onRegionClick?: (region: BodyRegionId) => void;
}) {
  function classFor(region: BodyRegionId): string {
    const isActive = activeRegions.includes(region);
    const classes = ["body-region"];
    if (!isActive) {
      classes.push("body-region-inactive");
    } else if (matchedRegions.includes(region)) {
      classes.push("body-region-matched");
    } else if (flashRegion === region) {
      classes.push("body-region-flash");
    } else if (selectedRegion === region) {
      classes.push("body-region-selected");
    } else if (pulsingRegion === region) {
      classes.push("body-region-pulsing");
    }
    return classes.join(" ");
  }

  function handleClick(region: BodyRegionId) {
    if (!onRegionClick) return;
    if (!activeRegions.includes(region)) return;
    if (matchedRegions.includes(region)) return;
    onRegionClick(region);
  }

  // Every shape for a region gets the same className + onClick — see file doc comment on
  // why this can't just live on a wrapping `<g>` for two-shape regions.
  function shapeProps(region: BodyRegionId) {
    return { className: classFor(region), onClick: () => handleClick(region) };
  }

  return (
    <svg viewBox="0 0 200 400" className="body-silhouette" role="img" aria-label="Human body silhouette">
      {/* Calves */}
      <rect x="68" y="282" width="26" height="72" rx="12" data-region="calves" {...shapeProps("calves")} />
      <rect x="106" y="282" width="26" height="72" rx="12" data-region="calves" {...shapeProps("calves")} />

      {/* Quadriceps */}
      <rect x="66" y="208" width="30" height="76" rx="13" data-region="quadriceps" {...shapeProps("quadriceps")} />
      <rect x="104" y="208" width="30" height="76" rx="13" data-region="quadriceps" {...shapeProps("quadriceps")} />

      {/* Glutes */}
      <rect x="62" y="180" width="76" height="28" rx="13" data-region="glutes" {...shapeProps("glutes")} />

      {/* Biceps / arms */}
      <rect x="28" y="70" width="24" height="64" rx="12" data-region="biceps" {...shapeProps("biceps")} />
      <rect x="148" y="70" width="24" height="64" rx="12" data-region="biceps" {...shapeProps("biceps")} />

      {/* Core / abdomen */}
      <rect x="64" y="130" width="72" height="48" rx="10" data-region="core" {...shapeProps("core")} />

      {/* Diaphragm */}
      <rect x="62" y="116" width="76" height="12" rx="5" data-region="diaphragm" {...shapeProps("diaphragm")} />

      {/* Lungs / chest */}
      <rect x="61" y="72" width="34" height="44" rx="7" data-region="lungs" {...shapeProps("lungs")} />
      <rect x="105" y="72" width="34" height="44" rx="7" data-region="lungs" {...shapeProps("lungs")} />

      {/* Shoulders */}
      <rect x="54" y="54" width="92" height="17" rx="8.5" data-region="shoulders" {...shapeProps("shoulders")} />

      {/* Heart — drawn after lungs so it sits on top and stays independently clickable */}
      <circle cx="92" cy="93" r="10" data-region="heart" {...shapeProps("heart")} />

      {/* Head / brain */}
      <circle cx="100" cy="30" r="20" data-region="head" {...shapeProps("head")} />
    </svg>
  );
}
