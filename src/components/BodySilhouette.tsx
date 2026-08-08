/** A proper anatomical human body outline built entirely from SVG paths (no rects, no
 *  circles standing in for limbs) — used by both the desktop and mobile layouts of Body
 *  Connections (see components/BodyConnectionsGame.tsx). Regions that come in a bilateral
 *  pair (lungs, biceps, quadriceps, calves) are two independent path pieces sharing one
 *  region id, each with its own hover/selected/matched visual state and its own label —
 *  drawn as a separate piece (not a single two-lobe path) so a real hover/click always
 *  lands on painted geometry instead of a wrapping shape's hit-testing bounding box, which
 *  for two disjoint pieces spans the empty gap between them and would silently miss both.
 *  A handful of purely decorative pieces (neck, feet) round out the silhouette without
 *  being part of the game. */

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

interface BodyPart {
  region: BodyRegionId;
  label: string;
  d: string;
  labelPos: { x: number; y: number };
}

const REGION_LABELS: Record<BodyRegionId, string> = {
  head: "Head / Brain",
  shoulders: "Shoulders",
  lungs: "Lungs",
  heart: "Heart",
  diaphragm: "Diaphragm",
  core: "Core / Abdomen",
  glutes: "Glutes",
  biceps: "Biceps",
  quadriceps: "Quadriceps",
  calves: "Calves",
} as const;

// Every clickable/labeled piece of the figure, in paint order (later pieces sit on top of
// earlier ones — this is how the chest pieces "cut into" the shoulder band beneath them to
// read as a natural shoulder line rather than a hard rectangle).
const BODY_PARTS: BodyPart[] = [
  {
    region: "shoulders",
    label: REGION_LABELS.shoulders,
    d: "M58 152 Q60 108 100 98 L140 98 Q180 108 182 152 L182 168 L58 168 Z",
    labelPos: { x: 70, y: 155 },
  },
  {
    region: "lungs",
    label: REGION_LABELS.lungs,
    d: "M78 118 Q76 116 80 114 Q98 110 112 119 L112 168 Q98 172 82 166 Q76 160 76 145 Z",
    labelPos: { x: 94, y: 142 },
  },
  {
    region: "lungs",
    label: REGION_LABELS.lungs,
    d: "M162 118 Q164 116 160 114 Q142 110 128 119 L128 168 Q142 172 158 166 Q164 160 164 145 Z",
    labelPos: { x: 146, y: 142 },
  },
  {
    region: "heart",
    label: REGION_LABELS.heart,
    d: "M120 146 Q112 137 104 143 Q98 151 104 159 Q110 167 120 175 Q130 167 136 159 Q142 151 136 143 Q128 137 120 146 Z",
    labelPos: { x: 120, y: 158 },
  },
  {
    region: "diaphragm",
    label: REGION_LABELS.diaphragm,
    d: "M80 170 Q120 178 160 170 L158 186 Q120 194 82 186 Z",
    labelPos: { x: 120, y: 181 },
  },
  {
    region: "core",
    label: REGION_LABELS.core,
    d: "M82 188 Q120 196 158 188 L155 235 Q120 244 85 235 Z",
    labelPos: { x: 120, y: 213 },
  },
  {
    region: "glutes",
    label: REGION_LABELS.glutes,
    d: "M85 237 Q120 246 155 237 L160 268 Q120 280 80 268 Z",
    labelPos: { x: 120, y: 256 },
  },
  {
    region: "biceps",
    label: REGION_LABELS.biceps,
    d: "M62 150 Q54 150 50 160 L40 250 Q38 262 46 268 Q56 273 62 264 L72 172 Q72 155 62 150 Z",
    labelPos: { x: 55, y: 205 },
  },
  {
    region: "biceps",
    label: REGION_LABELS.biceps,
    d: "M178 150 Q186 150 190 160 L200 250 Q202 262 194 268 Q184 273 178 264 L168 172 Q168 155 178 150 Z",
    labelPos: { x: 185, y: 205 },
  },
  {
    region: "quadriceps",
    label: REGION_LABELS.quadriceps,
    d: "M85 270 Q80 270 78 280 L76 355 Q76 366 86 368 Q98 370 104 362 L106 280 Q104 270 95 270 Z",
    labelPos: { x: 91, y: 318 },
  },
  {
    region: "quadriceps",
    label: REGION_LABELS.quadriceps,
    d: "M155 270 Q160 270 162 280 L164 355 Q164 366 154 368 Q142 370 136 362 L134 280 Q136 270 145 270 Z",
    labelPos: { x: 149, y: 318 },
  },
  {
    region: "calves",
    label: REGION_LABELS.calves,
    d: "M86 372 Q80 372 79 384 L80 445 Q81 456 90 458 Q99 460 102 450 L100 384 Q99 372 90 372 Z",
    labelPos: { x: 90, y: 415 },
  },
  {
    region: "calves",
    label: REGION_LABELS.calves,
    d: "M154 372 Q160 372 161 384 L160 445 Q159 456 150 458 Q141 460 138 450 L140 384 Q141 372 150 372 Z",
    labelPos: { x: 150, y: 415 },
  },
  {
    region: "head",
    label: REGION_LABELS.head,
    d: "M120 12 C 138 12 147 27 147 46 C 147 65 138 80 120 80 C 102 80 93 65 93 46 C 93 27 102 12 120 12 Z",
    labelPos: { x: 120, y: 46 },
  },
];

// Purely decorative, non-interactive pieces that fill out the silhouette — same resting
// fill as an inactive region, never clickable, never hoverable.
const DECORATIVE_PARTS: string[] = [
  // Neck
  "M106 70 Q106 90 100 98 L140 98 Q134 90 134 70 Z",
  // Feet
  "M76 460 Q76 470 92 471 Q106 471 104 462 L102 450 L80 450 Z",
  "M164 460 Q164 470 148 471 Q134 471 136 462 L138 450 L160 450 Z",
];

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
    const classes = ["body-region-part"];
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

  return (
    <svg viewBox="0 0 240 500" className="body-silhouette" role="img" aria-label="Human body silhouette">
      {DECORATIVE_PARTS.map((d, i) => (
        <path key={`decorative-${i}`} d={d} className="body-region-decorative" />
      ))}
      {BODY_PARTS.map((part, i) => (
        <g key={`${part.region}-${i}`} className="body-region-group" data-region={part.region}>
          <path d={part.d} className={classFor(part.region)} onClick={() => handleClick(part.region)} />
          <text x={part.labelPos.x} y={part.labelPos.y} className="body-region-label">
            {part.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
