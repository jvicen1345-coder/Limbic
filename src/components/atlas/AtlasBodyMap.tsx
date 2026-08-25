"use client";

/** The two clickable body diagrams for Limbic Atlas (see components/atlas/AtlasClient.tsx)
 *  — a simplified, front (anterior) and back (posterior) line-art silhouette, each built
 *  from a shared 240×560 coordinate grid. Every clickable region is a <polygon>; left/right
 *  pairs are authored once (as `points`, the left-side shape) and mirrored across the
 *  vertical centerline (x=120) by `mirror` below, so the two sides stay exactly symmetric
 *  rather than hand-duplicated and liable to drift apart on an edit.
 *
 *  A zone's SVG `id` (required to be unique per the DOM) is `${contentKey}` for an unpaired
 *  region (e.g. "abdominals") or `${contentKey}-left`/`${contentKey}-right` for a paired
 *  one — but both sides of a pair share one `contentKey`, since the clinical content
 *  (lib/atlas-content.ts) doesn't differ by side: clicking either shoulder selects the same
 *  "shoulder-anterior" entry, and both shapes highlight together. */

type Point = [number, number];

interface ZoneDef {
  contentKey: string;
  /** Left-side points for a paired region, or the only points for an unpaired one. */
  points: Point[];
  paired: boolean;
}

const CENTER_X = 120;

function mirror(points: Point[]): Point[] {
  return points.map(([x, y]) => [2 * CENTER_X - x, y]);
}

function toAttr(points: Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

const ANTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-anterior", paired: false, points: [[104, 50], [136, 50], [140, 74], [100, 74]] },
  { contentKey: "sternum-chest", paired: false, points: [[93, 76], [147, 76], [151, 136], [89, 136]] },
  { contentKey: "abdominals", paired: false, points: [[91, 138], [149, 138], [145, 206], [95, 206]] },
  { contentKey: "shoulder-anterior", paired: true, points: [[55, 76], [93, 76], [93, 112], [58, 110], [44, 96]] },
  { contentKey: "biceps-anterior", paired: true, points: [[40, 114], [61, 111], [59, 190], [35, 188]] },
  { contentKey: "elbow-anterior", paired: true, points: [[35, 188], [59, 190], [57, 209], [33, 207]] },
  { contentKey: "forearm-anterior", paired: true, points: [[33, 207], [57, 209], [51, 272], [28, 270]] },
  { contentKey: "wrist-hand", paired: true, points: [[28, 270], [51, 272], [47, 306], [24, 300]] },
  { contentKey: "hip-flexors", paired: true, points: [[78, 208], [120, 208], [120, 249], [82, 249]] },
  { contentKey: "quadriceps", paired: true, points: [[80, 251], [120, 251], [116, 340], [78, 338]] },
  { contentKey: "knee-anterior", paired: true, points: [[78, 340], [116, 342], [114, 362], [76, 360]] },
  { contentKey: "anterior-leg", paired: true, points: [[76, 362], [114, 364], [108, 448], [70, 446]] },
  { contentKey: "ankle-foot-anterior", paired: true, points: [[70, 448], [108, 450], [113, 486], [64, 483]] },
];

const POSTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-posterior", paired: false, points: [[104, 50], [136, 50], [140, 74], [100, 74]] },
  { contentKey: "thoracic-spine", paired: false, points: [[111, 76], [129, 76], [127, 160], [113, 160]] },
  { contentKey: "lumbar-spine", paired: false, points: [[109, 160], [131, 160], [129, 208], [111, 208]] },
  { contentKey: "upper-trapezius", paired: true, points: [[58, 74], [109, 76], [107, 100], [62, 103], [47, 90]] },
  { contentKey: "rotator-cuff-posterior", paired: true, points: [[40, 101], [63, 103], [65, 140], [38, 138]] },
  { contentKey: "triceps-posterior", paired: true, points: [[38, 140], [65, 140], [61, 190], [35, 188]] },
  { contentKey: "elbow-posterior", paired: true, points: [[35, 188], [61, 190], [59, 209], [33, 207]] },
  { contentKey: "forearm-posterior", paired: true, points: [[33, 207], [59, 209], [53, 272], [28, 270]] },
  { contentKey: "gluteus-medius", paired: true, points: [[66, 208], [90, 208], [88, 236], [64, 234]] },
  { contentKey: "gluteus-maximus", paired: true, points: [[80, 210], [121, 210], [121, 246], [85, 246]] },
  { contentKey: "hamstrings", paired: true, points: [[80, 248], [120, 248], [116, 338], [78, 336]] },
  { contentKey: "knee-posterior", paired: true, points: [[78, 338], [116, 340], [114, 359], [76, 357]] },
  { contentKey: "calf-gastrocnemius", paired: true, points: [[76, 359], [114, 361], [108, 436], [70, 434]] },
  { contentKey: "achilles-posterior-ankle", paired: true, points: [[70, 434], [108, 436], [111, 471], [66, 469]] },
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
  const points = side === "right" ? mirror(def.points) : def.points;
  const svgId = side ? `${def.contentKey}-${side}` : def.contentKey;
  const isSelected = selectedZone === def.contentKey;

  return (
    <polygon
      id={svgId}
      data-zone={def.contentKey}
      points={toAttr(points)}
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
    </polygon>
  );
}

/** The static (non-interactive) figure outline — head, torso, and limb silhouette lines
 *  the clickable zones sit on top of. Deliberately simple line art, not an anatomical
 *  illustration: a few smooth shapes rather than photorealistic musculature. */
function FigureOutline({ view }: { view: "anterior" | "posterior" }) {
  return (
    <g className="atlas-outline" aria-hidden="true">
      <circle cx={CENTER_X} cy={28} r={22} />
      <path d="M100,74 L93,76 L55,76 L44,96 L40,114 L35,188 L33,207 L28,270 L24,300" />
      <path d="M140,74 L147,76 L185,76 L196,96 L200,114 L205,188 L207,207 L212,270 L216,300" />
      <path
        d={
          view === "anterior"
            ? "M100,74 L91,138 L95,206 L78,208 L80,251 L78,340 L76,362 L70,448 L64,483"
            : "M100,74 L111,76 L109,160 L111,208 L66,208 L80,210 L78,338 L76,359 L70,434 L66,469"
        }
      />
      <path
        d={
          view === "anterior"
            ? "M140,74 L149,138 L145,206 L162,208 L160,251 L162,340 L164,362 L170,448 L176,483"
            : "M140,74 L129,76 L131,160 L129,208 L174,208 L160,210 L162,338 L164,359 L170,434 L174,469"
        }
      />
    </g>
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
      <FigureOutline view={view} />
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
