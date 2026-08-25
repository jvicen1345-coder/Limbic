"use client";

/** The two clickable body diagrams for Limbic Atlas (see components/atlas/AtlasClient.tsx)
 *  — a simplified, front (anterior) and back (posterior) silhouette with real body curves
 *  (sloped shoulders, a tapered waist, tapered/bulged limbs, rounded hands and feet)
 *  rather than boxy straight-edge segments, built from a shared 240×560 coordinate grid.
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
const ARM_UPPER: Seg[] = [
  ["M", 37, 114],
  ["L", 64, 111],
  ["Q", 61, 135, 60, 155],
  ["Q", 59, 172, 60, 186],
  ["L", 35, 188],
  ["Q", 34, 172, 33, 155],
  ["Q", 32, 135, 37, 114],
  ["Z"],
];
const ARM_ELBOW: Seg[] = [
  ["M", 35, 188],
  ["L", 60, 186],
  ["Q", 61, 196, 58, 205],
  ["L", 34, 207],
  ["Q", 33, 197, 35, 188],
  ["Z"],
];
const ARM_FOREARM: Seg[] = [
  ["M", 34, 207],
  ["L", 58, 205],
  ["Q", 55, 225, 53, 240],
  ["Q", 51, 255, 50, 268],
  ["L", 27, 270],
  ["Q", 26, 255, 27, 238],
  ["Q", 28, 222, 34, 207],
  ["Z"],
];
const LEG_THIGH: Seg[] = [
  ["M", 78, 242],
  ["L", 103, 244],
  ["Q", 107, 270, 105, 295],
  ["Q", 104, 315, 101, 330],
  ["L", 72, 328],
  ["Q", 69, 310, 68, 290],
  ["Q", 67, 265, 78, 242],
  ["Z"],
];
const LEG_KNEE: Seg[] = [
  ["M", 72, 328],
  ["L", 101, 330],
  ["Q", 103, 340, 101, 350],
  ["L", 74, 348],
  ["Q", 72, 339, 72, 328],
  ["Z"],
];
const LEG_SHIN: Seg[] = [
  ["M", 74, 348],
  ["L", 101, 350],
  ["Q", 105, 375, 103, 400],
  ["Q", 101, 420, 97, 438],
  ["L", 68, 436],
  ["Q", 65, 415, 66, 392],
  ["Q", 67, 368, 74, 348],
  ["Z"],
];
const LEG_ANKLE_FOOT: Seg[] = [
  ["M", 68, 436],
  ["L", 97, 438],
  ["Q", 101, 448, 100, 460],
  ["Q", 99, 474, 89, 481],
  ["Q", 78, 486, 67, 481],
  ["Q", 60, 474, 61, 462],
  ["Q", 62, 448, 68, 436],
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
      ["Q", 93, 95, 94, 122],
      ["Q", 95, 135, 99, 142],
      ["L", 141, 142],
      ["Q", 145, 135, 146, 122],
      ["Q", 147, 95, 139, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "abdominals",
    paired: false,
    segs: [
      ["M", 99, 142],
      ["Q", 93, 165, 95, 188],
      ["Q", 96, 200, 101, 209],
      ["L", 139, 209],
      ["Q", 144, 200, 145, 188],
      ["Q", 147, 165, 141, 142],
      ["Z"],
    ],
  },
  {
    contentKey: "shoulder-anterior",
    paired: true,
    segs: [
      ["M", 101, 68],
      ["Q", 76, 66, 56, 73],
      ["Q", 38, 80, 34, 98],
      ["Q", 31, 108, 37, 114],
      ["L", 64, 111],
      ["Q", 80, 100, 90, 85],
      ["Q", 96, 76, 101, 68],
      ["Z"],
    ],
  },
  { contentKey: "biceps-anterior", paired: true, segs: ARM_UPPER },
  { contentKey: "elbow-anterior", paired: true, segs: ARM_ELBOW },
  { contentKey: "forearm-anterior", paired: true, segs: ARM_FOREARM },
  {
    contentKey: "wrist-hand",
    paired: true,
    segs: [
      ["M", 27, 270],
      ["L", 50, 268],
      ["Q", 52, 278, 51, 290],
      ["Q", 50, 302, 43, 310],
      ["Q", 36, 316, 28, 312],
      ["Q", 21, 306, 21, 294],
      ["Q", 21, 280, 27, 270],
      ["Z"],
    ],
  },
  {
    contentKey: "hip-flexors",
    paired: true,
    segs: [
      ["M", 101, 209],
      ["Q", 85, 210, 78, 220],
      ["Q", 74, 230, 78, 242],
      ["L", 103, 244],
      ["Q", 106, 225, 101, 209],
      ["Z"],
    ],
  },
  { contentKey: "quadriceps", paired: true, segs: LEG_THIGH },
  { contentKey: "knee-anterior", paired: true, segs: LEG_KNEE },
  { contentKey: "anterior-leg", paired: true, segs: LEG_SHIN },
  { contentKey: "ankle-foot-anterior", paired: true, segs: LEG_ANKLE_FOOT },
];

const POSTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-posterior", paired: false, segs: NECK },
  {
    contentKey: "thoracic-spine",
    paired: false,
    segs: [
      ["M", 112, 68],
      ["Q", 108, 100, 109, 135],
      ["Q", 110, 150, 112, 160],
      ["L", 128, 160],
      ["Q", 130, 150, 131, 135],
      ["Q", 132, 100, 128, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "lumbar-spine",
    paired: false,
    segs: [
      ["M", 112, 160],
      ["Q", 109, 180, 111, 196],
      ["Q", 112, 204, 115, 209],
      ["L", 125, 209],
      ["Q", 128, 204, 129, 196],
      ["Q", 131, 180, 128, 160],
      ["Z"],
    ],
  },
  {
    contentKey: "upper-trapezius",
    paired: true,
    segs: [
      ["M", 101, 68],
      ["Q", 80, 66, 64, 73],
      ["Q", 56, 77, 52, 88],
      ["L", 68, 100],
      ["Q", 88, 95, 100, 82],
      ["Q", 104, 76, 101, 68],
      ["Z"],
    ],
  },
  {
    contentKey: "rotator-cuff-posterior",
    paired: true,
    segs: [
      ["M", 52, 88],
      ["L", 68, 100],
      ["Q", 64, 105, 64, 111],
      ["L", 37, 114],
      ["Q", 34, 105, 36, 95],
      ["Q", 39, 90, 52, 88],
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
      ["Q", 97, 209, 87, 217],
      ["Q", 82, 224, 84, 232],
      ["L", 105, 231],
      ["Q", 108, 218, 115, 209],
      ["Z"],
    ],
  },
  {
    contentKey: "gluteus-maximus",
    paired: true,
    segs: [
      ["M", 84, 232],
      ["L", 105, 231],
      ["Q", 107, 238, 103, 244],
      ["L", 78, 242],
      ["Q", 78, 236, 84, 232],
      ["Z"],
    ],
  },
  { contentKey: "hamstrings", paired: true, segs: LEG_THIGH },
  { contentKey: "knee-posterior", paired: true, segs: LEG_KNEE },
  { contentKey: "calf-gastrocnemius", paired: true, segs: LEG_SHIN },
  { contentKey: "achilles-posterior-ankle", paired: true, segs: LEG_ANKLE_FOOT },
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
