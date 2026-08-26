"use client";

/** The two clickable body diagrams for Limbic Atlas (see components/atlas/AtlasClient.tsx)
 *  — a real anatomical muscular-system illustration (anterior and posterior views) with an
 *  invisible clickable hit-zone overlaid on each region, rather than a hand-built shape
 *  standing in for a body.
 *
 *  The illustrations themselves are Termininja's "Muscular system" / "Muscular system-back"
 *  (Wikimedia Commons, CC BY-SA 3.0 — see public/atlas/*.svg and the credit line rendered
 *  by AtlasClient below the map) — served as plain static <img> files, not inlined, since
 *  each is several MB of vector path data and inlining that into this component would bloat
 *  the JS bundle for no benefit; the browser fetches and caches them like any other image.
 *
 *  Every clickable region is a <path> hit-zone in an absolutely-positioned overlay <svg>
 *  sharing the same 1000×1400 viewBox as the underlying illustration, so the two line up
 *  regardless of the rendered size. Left/right pairs are authored once (the left-side
 *  shape) and mirrored across the vertical centerline (x=500) by `mirrorSeg` below, so the
 *  two sides stay exactly symmetric rather than hand-duplicated and liable to drift apart.
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

const CENTER_X = 500;

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

/** A plain axis-aligned rectangle, expressed as draw commands — used for every hit-zone
 *  below instead of a contour hugging the muscle shape. Precision here doesn't need to
 *  match the hand-built version's: these zones are invisible until hovered/selected, so a
 *  rectangle that's a few pixels off the muscle's true outline (or slightly overlapping the
 *  zone next to it) never reads as a visible seam or gap the way it would if the zone
 *  itself were the visible shape (see the git history for that version, and lib/atlas-*
 *  for how those two selection concerns — visible shape vs. clickable area — used to be the
 *  same problem and now aren't). Coordinates below were read directly off the real
 *  illustration with a coordinate-grid overlay (see the file's original PR/commit for how),
 *  not estimated by eye against the old hand-built figure. */
function rectSegs(x1: number, y1: number, x2: number, y2: number): Seg[] {
  return [
    ["M", x1, y1],
    ["L", x2, y1],
    ["L", x2, y2],
    ["L", x1, y2],
    ["Z"],
  ];
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

const ANTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-anterior", paired: false, segs: rectSegs(440, 195, 560, 268) },
  { contentKey: "sternum-chest", paired: false, segs: rectSegs(355, 268, 645, 440) },
  { contentKey: "abdominals", paired: false, segs: rectSegs(395, 440, 605, 580) },
  { contentKey: "shoulder-anterior", paired: true, segs: rectSegs(270, 265, 355, 350) },
  { contentKey: "biceps-anterior", paired: true, segs: rectSegs(195, 350, 340, 605) },
  { contentKey: "elbow-anterior", paired: true, segs: rectSegs(180, 605, 310, 645) },
  { contentKey: "forearm-anterior", paired: true, segs: rectSegs(175, 645, 300, 770) },
  { contentKey: "wrist-hand", paired: true, segs: rectSegs(135, 770, 270, 865) },
  { contentKey: "hip-flexors", paired: true, segs: rectSegs(360, 580, 500, 660) },
  { contentKey: "quadriceps", paired: true, segs: rectSegs(355, 660, 430, 950) },
  { contentKey: "hip-adductors", paired: true, segs: rectSegs(430, 660, 500, 950) },
  { contentKey: "knee-anterior", paired: true, segs: rectSegs(355, 950, 500, 1015) },
  { contentKey: "anterior-leg", paired: true, segs: rectSegs(360, 1015, 500, 1200) },
  { contentKey: "ankle-foot-anterior", paired: true, segs: rectSegs(350, 1200, 500, 1295) },
];

const POSTERIOR_ZONES: ZoneDef[] = [
  { contentKey: "cervical-posterior", paired: false, segs: rectSegs(440, 170, 560, 232) },
  { contentKey: "thoracic-spine", paired: false, segs: rectSegs(450, 232, 550, 480) },
  { contentKey: "lumbar-spine", paired: false, segs: rectSegs(450, 480, 550, 600) },
  { contentKey: "upper-trapezius", paired: true, segs: rectSegs(280, 230, 450, 320) },
  { contentKey: "rotator-cuff-posterior", paired: true, segs: rectSegs(280, 320, 390, 395) },
  { contentKey: "triceps-posterior", paired: true, segs: rectSegs(210, 350, 330, 590) },
  { contentKey: "elbow-posterior", paired: true, segs: rectSegs(200, 590, 320, 630) },
  { contentKey: "forearm-posterior", paired: true, segs: rectSegs(190, 630, 310, 770) },
  { contentKey: "gluteus-medius", paired: true, segs: rectSegs(360, 600, 455, 660) },
  { contentKey: "gluteus-maximus", paired: true, segs: rectSegs(380, 660, 500, 700) },
  { contentKey: "hamstrings", paired: true, segs: rectSegs(370, 700, 500, 950) },
  { contentKey: "knee-posterior", paired: true, segs: rectSegs(370, 950, 500, 1010) },
  { contentKey: "calf-gastrocnemius", paired: true, segs: rectSegs(375, 1010, 500, 1180) },
  { contentKey: "achilles-posterior-ankle", paired: true, segs: rectSegs(370, 1180, 500, 1290) },
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
  const src = view === "anterior" ? "/atlas/muscular-system-anterior.svg" : "/atlas/muscular-system-posterior.svg";
  const maskId = `atlas-silhouette-${view}`;

  return (
    <div className="atlas-body-stage">
      {/* eslint-disable-next-line @next/next/no-img-element -- a static local asset, but a
          multi-MB hand-authored vector illustration next/image's optimizer has no reason to
          touch (nothing to resize/reformat that benefits a same-origin SVG) */}
      <img src={src} alt={`${view === "anterior" ? "Anterior" : "Posterior"} muscular system illustration`} className="atlas-body-image" />
      <svg
        viewBox="0 0 1000 1400"
        className="atlas-hitzone-svg"
        role="img"
        aria-label={`${view === "anterior" ? "Front" : "Back"} view of the body — select a region`}
      >
        {/* Each zone's clickable <path> is still a plain rectangle (generous, forgiving hit
         *  target — masking below doesn't change what registers a click). But its hover/
         *  selected fill is clipped to the illustration's own silhouette via this alpha mask,
         *  so the highlight hugs the muscle's outline instead of showing as a floating box
         *  with visible corners over blank background. The illustration's linework has plenty
         *  of thin unpainted seams and pinholes within the silhouette itself (gaps between
         *  adjacent drawn muscle shapes, hairline strokes) — dilating the mask's alpha a few
         *  units closes those over so the highlight doesn't look speckled with background. */}
        <defs>
          <filter id={`${maskId}-dilate`} x="-5%" y="-5%" width="110%" height="110%">
            <feMorphology in="SourceGraphic" operator="dilate" radius="3" />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1400" style={{ maskType: "alpha" }}>
            <image href={src} x="0" y="0" width="1000" height="1400" filter={`url(#${maskId}-dilate)`} />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
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
        </g>
      </svg>
    </div>
  );
}
