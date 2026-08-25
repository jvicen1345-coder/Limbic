"use client";

/** The two clickable body diagrams for Limbic Atlas (see components/atlas/AtlasClient.tsx)
 *  — a simplified, front (anterior) and back (posterior) silhouette with real body curves
 *  (sloped shoulders, a tapered waist, limbs that bulge at the muscle belly and pinch at
 *  the joint, a hand with a thumb and grouped fingers, a foot with grouped toes) rather
 *  than boxy straight-edge segments, built from a shared 240×560 coordinate grid.
 *
 *  Every clickable region is a <path> described as a small list of draw commands (`Seg`)
 *  instead of a raw `d` string, so a paired left/right region can be authored once (the
 *  left-side shape) and mirrored across the vertical centerline (x=120) by `mirrorSegs`
 *  below — flipping every x-coordinate in the command list — rather than hand-duplicated
 *  and liable to drift out of symmetry on an edit.
 *
 *  The limb shapes are reused across views on purpose, not just for less authoring: an arm
 *  or leg's outer silhouette is the same cylinder whether it's being looked at from the
 *  front or the back, only the muscle-group name painted onto that segment changes (e.g.
 *  triceps-posterior sits on the exact same arm segment biceps-anterior does).
 *
 *  A zone's SVG `id` (required to be unique per the DOM) is `${contentKey}` for an unpaired
 *  region (e.g. "abdominals") or `${contentKey}-left`/`${contentKey}-right` for a paired
 *  one — but both sides of a pair share one `contentKey`, since the clinical content
 *  (lib/atlas-content.ts) doesn't differ by side: clicking either shoulder selects the same
 *  "shoulder-anterior" entry, and both shapes highlight together. */

type Seg = ["M" | "L", number, number] | ["Q", number, number, number, number] | ["Z"];

interface ZoneDef {
  contentKey: string;
  /** Left-side draw commands for a paired region, or the only commands for an unpaired one. */
  segs: Seg[];
  paired: boolean;
}

const CENTER_X = 120;

function mirrorSeg(seg: Seg): Seg {
  switch (seg[0]) {
    case "M":
    case "L":
      return [seg[0], 2 * CENTER_X - seg[1], seg[2]];
    case "Q":
      return ["Q", 2 * CENTER_X - seg[1], seg[2], 2 * CENTER_X - seg[3], seg[4]];
    case "Z":
      return seg;
  }
}

function segsToD(segs: Seg[]): string {
  return segs
    .map((seg) => {
      switch (seg[0]) {
        case "M":
          return `M${seg[1]},${seg[2]}`;
        case "L":
          return `L${seg[1]},${seg[2]}`;
        case "Q":
          return `Q${seg[1]},${seg[2]} ${seg[3]},${seg[4]}`;
        case "Z":
          return "Z";
      }
    })
    .join(" ");
}

// — Shared limb segments (see the file doc comment on why these are reused across views) —
// Bicep/thigh bellies bow out further than before and pinch in at the joint (elbow/knee
// narrower than the segments above and below it) rather than a near-constant-width tube,
// closer to how a real limb's muscle bulk actually reads.
const ARM_UPPER: Seg[] = [
  ["M", 35, 116],
  ["L", 64, 111],
  ["Q", 60, 138, 58, 158],
  ["Q", 57, 175, 59, 186],
  ["L", 34, 189],
  ["Q", 32, 172, 31, 155],
  ["Q", 30, 133, 35, 116],
  ["Z"],
];
const ARM_ELBOW: Seg[] = [
  ["M", 34, 189],
  ["L", 59, 186],
  ["Q", 58, 196, 54, 203],
  ["L", 37, 205],
  ["Q", 33, 197, 34, 189],
  ["Z"],
];
const ARM_FOREARM: Seg[] = [
  ["M", 37, 205],
  ["L", 54, 203],
  ["Q", 52, 222, 50, 236],
  ["Q", 48, 252, 46, 266],
  ["L", 25, 268],
  ["Q", 24, 252, 26, 236],
  ["Q", 28, 218, 37, 205],
  ["Z"],
];
const LEG_THIGH: Seg[] = [
  ["M", 75, 244],
  ["L", 103, 246],
  ["Q", 109, 272, 106, 298],
  ["Q", 104, 318, 100, 332],
  ["L", 71, 330],
  ["Q", 67, 312, 66, 292],
  ["Q", 64, 264, 75, 244],
  ["Z"],
];
const LEG_KNEE: Seg[] = [
  ["M", 71, 330],
  ["L", 100, 332],
  ["Q", 102, 341, 98, 350],
  ["L", 76, 348],
  ["Q", 72, 340, 71, 330],
  ["Z"],
];
const LEG_SHIN: Seg[] = [
  ["M", 76, 348],
  ["L", 98, 350],
  ["Q", 103, 375, 101, 400],
  ["Q", 99, 420, 95, 438],
  ["L", 69, 436],
  ["Q", 66, 414, 67, 390],
  ["Q", 68, 366, 76, 348],
  ["Z"],
];
// A hand and a foot, not a rounded mitt/wedge: a clear thumb notch and two shallow
// scallops suggesting grouped fingers on the hand; a heel-side taper and two shallow toe
// scallops on the foot. Kept shallow rather than five sharp individual digits each — at
// the size this renders (the whole figure caps out around 300px wide), sharp notches read
// as jagged noise rather than fingers/toes.
const HAND: Seg[] = [
  ["M", 25, 268],
  ["L", 46, 266],
  ["Q", 49, 272, 48, 280],
  ["Q", 53, 284, 50, 290],
  ["Q", 46, 292, 45, 286],
  ["L", 44, 292],
  ["Q", 46, 300, 42, 304],
  ["Q", 40, 308, 35, 306],
  ["Q", 31, 310, 27, 306],
  ["Q", 23, 300, 22, 290],
  ["Q", 21, 280, 25, 268],
  ["Z"],
];
const FOOT: Seg[] = [
  ["M", 69, 436],
  ["L", 95, 438],
  ["Q", 100, 448, 99, 459],
  ["Q", 100, 468, 96, 472],
  ["Q", 92, 477, 87, 474],
  ["Q", 82, 479, 77, 475],
  ["Q", 72, 479, 68, 474],
  ["Q", 62, 469, 61, 460],
  ["Q", 60, 448, 69, 436],
  ["Z"],
];

const NECK: Seg[] = [
  ["M", 108, 46],
  ["Q", 104, 56, 101, 68],
  ["L", 139, 68],
  ["Q", 136, 56, 132, 46],
  ["Z"],
];

const ANTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-anterior", paired: false, segs: NECK },
  {
    contentKey: "sternum-chest",
    paired: false,
    segs: [
      ["M", 101, 68],
      ["Q", 91, 92, 92, 118],
      ["Q", 93, 132, 98, 142],
      ["L", 142, 142],
      ["Q", 147, 132, 148, 118],
      ["Q", 149, 92, 139, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "abdominals",
    paired: false,
    segs: [
      ["M", 98, 142],
      ["Q", 90, 162, 92, 182],
      ["Q", 93, 196, 100, 209],
      ["L", 140, 209],
      ["Q", 147, 196, 148, 182],
      ["Q", 150, 162, 142, 142],
      ["Z"],
    ],
  },
  {
    contentKey: "shoulder-anterior",
    paired: true,
    segs: [
      ["M", 101, 68],
      ["Q", 74, 64, 52, 74],
      ["Q", 35, 82, 30, 100],
      ["Q", 28, 110, 35, 116],
      ["L", 64, 111],
      ["Q", 80, 100, 90, 85],
      ["Q", 96, 76, 101, 68],
      ["Z"],
    ],
  },
  { contentKey: "biceps-anterior", paired: true, segs: ARM_UPPER },
  { contentKey: "elbow-anterior", paired: true, segs: ARM_ELBOW },
  { contentKey: "forearm-anterior", paired: true, segs: ARM_FOREARM },
  { contentKey: "wrist-hand", paired: true, segs: HAND },
  {
    contentKey: "hip-flexors",
    paired: true,
    segs: [
      ["M", 100, 209],
      ["Q", 82, 210, 74, 221],
      ["Q", 70, 232, 75, 244],
      ["L", 103, 246],
      ["Q", 107, 225, 100, 209],
      ["Z"],
    ],
  },
  { contentKey: "quadriceps", paired: true, segs: LEG_THIGH },
  { contentKey: "knee-anterior", paired: true, segs: LEG_KNEE },
  { contentKey: "anterior-leg", paired: true, segs: LEG_SHIN },
  { contentKey: "ankle-foot-anterior", paired: true, segs: FOOT },
];

const POSTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-posterior", paired: false, segs: NECK },
  {
    contentKey: "thoracic-spine",
    paired: false,
    segs: [
      ["M", 112, 68],
      ["Q", 107, 100, 108, 135],
      ["Q", 109, 150, 112, 160],
      ["L", 128, 160],
      ["Q", 131, 150, 132, 135],
      ["Q", 133, 100, 128, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "lumbar-spine",
    paired: false,
    segs: [
      ["M", 112, 160],
      ["Q", 108, 180, 111, 196],
      ["Q", 112, 204, 115, 209],
      ["L", 125, 209],
      ["Q", 128, 204, 129, 196],
      ["Q", 132, 180, 128, 160],
      ["Z"],
    ],
  },
  {
    contentKey: "upper-trapezius",
    paired: true,
    segs: [
      ["M", 101, 68],
      ["Q", 76, 64, 58, 75],
      ["Q", 48, 82, 44, 96],
      ["L", 64, 102],
      ["Q", 86, 94, 97, 80],
      ["Q", 100, 74, 101, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "rotator-cuff-posterior",
    paired: true,
    segs: [
      ["M", 44, 96],
      ["Q", 38, 104, 35, 116],
      ["L", 64, 111],
      ["Q", 66, 106, 64, 102],
      ["L", 44, 96],
      ["Z"],
    ],
  },
  { contentKey: "triceps-posterior", paired: true, segs: ARM_UPPER },
  { contentKey: "elbow-posterior", paired: true, segs: ARM_ELBOW },
  { contentKey: "forearm-posterior", paired: true, segs: ARM_FOREARM },
  {
    contentKey: "gluteus-medius",
    paired: true,
    segs: [
      ["M", 115, 209],
      ["Q", 96, 209, 85, 218],
      ["Q", 80, 225, 83, 233],
      ["L", 105, 231],
      ["Q", 108, 218, 115, 209],
      ["Z"],
    ],
  },
  {
    contentKey: "gluteus-maximus",
    paired: true,
    segs: [
      ["M", 83, 233],
      ["L", 105, 231],
      ["Q", 108, 238, 103, 246],
      ["L", 75, 244],
      ["Q", 76, 237, 83, 233],
      ["Z"],
    ],
  },
  { contentKey: "hamstrings", paired: true, segs: LEG_THIGH },
  { contentKey: "knee-posterior", paired: true, segs: LEG_KNEE },
  { contentKey: "calf-gastrocnemius", paired: true, segs: LEG_SHIN },
  { contentKey: "achilles-posterior-ankle", paired: true, segs: FOOT },
];

function Zone({
  def,
  side,
  selectedZone,
  onSelectZone,
  getZoneName,
}: {
  def: ZoneDef;
  side: "left" | "right" | null;
  selectedZone: string | null;
  onSelectZone: (contentKey: string) => void;
  getZoneName: (contentKey: string) => string;
}) {
  const segs = side === "right" ? def.segs.map(mirrorSeg) : def.segs;
  const svgId = side ? `${def.contentKey}-${side}` : def.contentKey;
  const isSelected = selectedZone === def.contentKey;

  return (
    <path
      id={svgId}
      data-zone={def.contentKey}
      d={segsToD(segs)}
      className={`atlas-zone${isSelected ? " atlas-zone--selected" : ""}`}
      onClick={() => onSelectZone(def.contentKey)}
      role="button"
      tabIndex={0}
      aria-label={getZoneName(def.contentKey)}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectZone(def.contentKey);
        }
      }}
    >
      <title>{getZoneName(def.contentKey)}</title>
    </path>
  );
}

export function AtlasBodyMap({
  view,
  selectedZone,
  onSelectZone,
  getZoneName,
}: {
  view: "anterior" | "posterior";
  selectedZone: string | null;
  onSelectZone: (contentKey: string) => void;
  getZoneName: (contentKey: string) => string;
}) {
  const zones = view === "anterior" ? ANTERIOR_ZONES : POSTERIOR_ZONES;

  return (
    <svg viewBox="0 0 240 560" className="atlas-body-svg" role="img" aria-label={`${view === "anterior" ? "Front" : "Back"} view of the body — select a region`}>
      <circle cx={CENTER_X} cy={26} r={20} className="atlas-outline" aria-hidden="true" />
      {zones.map((def) =>
        def.paired ? (
          <g key={def.contentKey}>
            <Zone def={def} side="left" selectedZone={selectedZone} onSelectZone={onSelectZone} getZoneName={getZoneName} />
            <Zone def={def} side="right" selectedZone={selectedZone} onSelectZone={onSelectZone} getZoneName={getZoneName} />
          </g>
        ) : (
          <Zone key={def.contentKey} def={def} side={null} selectedZone={selectedZone} onSelectZone={onSelectZone} getZoneName={getZoneName} />
        )
      )}
    </svg>
  );
}
