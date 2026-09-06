/** The diagrams a playbook's `figure` blocks name (see lib/playbook-content.ts). Kept as
 *  components rather than data because a drawing is markup, not a record — the content
 *  files stay serializable and reference these by id.
 *
 *  Every colour here is a --pb-* variable defined in globals.css, mapped onto Limbic's own
 *  palette tokens, so the figures follow the reader's light/dark theme instead of carrying
 *  their own. Uncoloured strokes use currentColor, which the .playbook-figure svg rule
 *  sets — don't hard-code a hex in here. Marker ids are prefixed `pbm-` since SVG ids are
 *  document-global. */

const A = "var(--pb-accent)";
const D2 = "var(--pb-d2)";
const D3 = "var(--pb-d3)";
const HI = "var(--pb-hi)";
const MOD = "var(--pb-mod)";
const LOW = "var(--pb-low)";

/** Where 180° of elevation comes from — a stacked bar, then its scapular half broken into
 *  the SC and AC contributions. */
function ElevationArithmetic() {
  return (
    <svg
      viewBox="0 0 620 200"
      role="img"
      aria-label="Bar diagram: 180 degrees of shoulder elevation is 120 degrees of glenohumeral abduction plus 60 degrees of scapular upward rotation, and that 60 degrees is produced by 25 degrees of sternoclavicular elevation plus 30 degrees of acromioclavicular upward rotation."
    >
      <line x1="130" y1="48" x2="130" y2="108" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity=".55" />
      <text className="mono" x="134" y="42">first 30° — mostly humeral</text>

      <rect x="40" y="56" width="360" height="44" fill={A} fillOpacity=".14" stroke={A} strokeWidth="1.5" />
      <rect x="400" y="56" width="180" height="44" fill={D2} fillOpacity=".16" stroke={D2} strokeWidth="1.5" />
      <text x="220" y="83" textAnchor="middle">GH abduction 120°</text>
      <text x="490" y="83" textAnchor="middle">scapular UR 60°</text>

      <text className="mono" x="40" y="118">0°</text>
      <text className="mono" x="580" y="118" textAnchor="end">180° total elevation</text>
      <text className="mono" x="40" y="140" opacity=".8">2° of GH motion for every 1° of scapular motion</text>

      <line x1="400" y1="102" x2="400" y2="144" stroke={D2} strokeWidth="1" strokeDasharray="2 3" />
      <line x1="580" y1="102" x2="580" y2="144" stroke={D2} strokeWidth="1" strokeDasharray="2 3" />
      <rect x="400" y="146" width="82" height="34" fill={D2} fillOpacity=".28" stroke={D2} strokeWidth="1.5" />
      <rect x="482" y="146" width="98" height="34" fill={D3} fillOpacity=".22" stroke={D3} strokeWidth="1.5" />
      <text className="mono" x="441" y="167" textAnchor="middle">SC 25°</text>
      <text className="mono" x="531" y="167" textAnchor="middle">AC 30°</text>
    </svg>
  );
}

/** A quarter arc of abduction banded by which restraint is loaded across it. */
function RestraintByAngle() {
  return (
    <svg
      viewBox="0 0 620 300"
      role="img"
      aria-label="Quarter arc of shoulder abduction divided into three bands: 0 to 30 degrees restrained by the superior glenohumeral, coracohumeral and subscapularis pulley; 30 to 60 degrees by the middle glenohumeral ligament; 60 to 90 degrees by the inferior glenohumeral ligament complex."
    >
      <rect x="44" y="46" width="52" height="124" rx="7" fill="currentColor" opacity=".07" />
      <text className="mono" x="70" y="188" textAnchor="middle" opacity=".5">trunk</text>
      <line x1="110" y1="60" x2="110" y2="200" stroke="currentColor" strokeWidth="3" opacity=".45" strokeLinecap="round" />
      <text className="mono" x="102" y="216" textAnchor="end" opacity=".6">arm at side</text>
      <line x1="110" y1="60" x2="180" y2="171" stroke="currentColor" strokeWidth="1" opacity=".35" />
      <line x1="110" y1="60" x2="231" y2="120" stroke="currentColor" strokeWidth="1" opacity=".35" />
      <line x1="110" y1="60" x2="250" y2="60" stroke="currentColor" strokeWidth="3" opacity=".45" strokeLinecap="round" />
      <text className="mono" x="190" y="50" textAnchor="middle" opacity=".6">90° abduction</text>
      <line x1="62" y1="32" x2="102" y2="54" stroke="currentColor" strokeWidth="1" opacity=".45" />
      <text className="mono" x="20" y="28" opacity=".7">humeral head</text>

      <path d="M 110 200 A 140 140 0 0 0 180 171" fill="none" stroke={A} strokeWidth="9" strokeLinecap="round" />
      <path d="M 180 171 A 140 140 0 0 0 231 120" fill="none" stroke={D2} strokeWidth="9" strokeLinecap="round" />
      <path d="M 231 120 A 140 140 0 0 0 250 60" fill="none" stroke={D3} strokeWidth="9" strokeLinecap="round" />

      <circle cx="110" cy="60" r="10" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="150" y="221" fill={A}>0–30°</text>
      <text className="mono" x="222" y="180" fill={D2}>30–60°</text>
      <text className="mono" x="262" y="104" fill={D3}>60–90°</text>

      <line x1="320" y1="58" x2="344" y2="58" stroke={D3} strokeWidth="6" strokeLinecap="round" />
      <text className="mono" x="354" y="54" fill={D3}>60–90° ABDUCTION</text>
      <text x="354" y="72">Inferior GHL complex — the main</text>
      <text x="354" y="88">glenohumeral stabilizer; restrains</text>
      <text x="354" y="104">anterior translation</text>

      <line x1="320" y1="140" x2="344" y2="140" stroke={D2} strokeWidth="6" strokeLinecap="round" />
      <text className="mono" x="354" y="136" fill={D2}>30–60° ABDUCTION</text>
      <text x="354" y="154">Middle GHL — restrains anterior</text>
      <text x="354" y="170">translation; contributes most at</text>
      <text x="354" y="186">45° of abduction with external rotation</text>

      <line x1="320" y1="222" x2="344" y2="222" stroke={A} strokeWidth="6" strokeLinecap="round" />
      <text className="mono" x="354" y="218" fill={A}>0–30° ABDUCTION</text>
      <text x="354" y="236">Superior GHL + coracohumeral +</text>
      <text x="354" y="252">distal subscapularis — the biceps pulley;</text>
      <text x="354" y="268">restrains inferior and anterior translation</text>
    </svg>
  );
}

/** Three dials — sagittal, frontal, and the transverse plane at 90° of abduction. */
function RangeByPlane() {
  return (
    <svg
      viewBox="0 0 620 258"
      role="img"
      aria-label="Three dials showing normal shoulder range. Sagittal plane: flexion 0 to 180 degrees, extension 0 to 60. Frontal plane: abduction 0 to 180 degrees, adduction 0 to 75. Transverse plane at 90 degrees of abduction: external rotation 0 to 90 degrees, internal rotation 0 to 70, for a total arc of 165 to 180 degrees."
    >
      <text className="mono" x="110" y="32" textAnchor="middle" fill={A}>SAGITTAL</text>
      <circle cx="110" cy="120" r="62" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 110 182 A 62 62 0 0 1 110 58" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 110 182 A 62 62 0 0 0 164 151" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="110" y1="120" x2="110" y2="182" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="110" cy="120" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="110" y="212" textAnchor="middle" fill={A}>flexion 0–180°</text>
      <text className="mono" x="110" y="228" textAnchor="middle" fill={D3}>extension 0–60°</text>
      <text className="mono" x="110" y="246" textAnchor="middle" opacity=".55">anterior ←</text>

      <text className="mono" x="310" y="32" textAnchor="middle" fill={A}>FRONTAL</text>
      <circle cx="310" cy="120" r="62" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 310 182 A 62 62 0 0 1 310 58" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 310 182 A 62 62 0 0 0 370 136" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="310" y1="120" x2="310" y2="182" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="310" cy="120" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="310" y="212" textAnchor="middle" fill={A}>abduction 0–180°</text>
      <text className="mono" x="310" y="228" textAnchor="middle" fill={D3}>adduction 0–75°</text>
      <text className="mono" x="310" y="246" textAnchor="middle" opacity=".55">lateral ←</text>

      <text className="mono" x="510" y="32" textAnchor="middle" fill={A}>TRANSVERSE · 90° ABD</text>
      <circle cx="510" cy="120" r="62" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 510 58 A 62 62 0 0 0 448 120" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 510 58 A 62 62 0 0 1 568 99" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="510" y1="120" x2="510" y2="58" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="510" cy="120" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="510" y="212" textAnchor="middle" fill={A}>ER 0–90°</text>
      <text className="mono" x="510" y="228" textAnchor="middle" fill={D3}>IR 0–70°</text>
      <text className="mono" x="510" y="246" textAnchor="middle" opacity=".55">total arc 165–180°</text>
    </svg>
  );
}

/** Pec minor, pec major and teres major — each read against a fixed landmark. */
function MuscleLengths() {
  return (
    <svg
      viewBox="0 0 620 240"
      role="img"
      aria-label="Three schematics. Pectoralis minor is measured as the gap from the posterior acromion down to the table, normal one inch or less. Pectoralis major is measured by whether the abducted arm falls to the plane of the table. Teres major is measured by how far the lateral border of the scapula translates away from the spine during passive flexion, normal one inch or less."
    >
      <defs>
        <marker id="pbm-len" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={A} />
        </marker>
        <marker id="pbm-len-hi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={HI} />
        </marker>
      </defs>

      {/* panel 1: pec minor */}
      <rect x="20" y="150" width="170" height="14" fill="currentColor" opacity=".06" />
      <line x1="20" y1="150" x2="190" y2="150" stroke="currentColor" strokeWidth="2.5" opacity=".55" />
      <rect x="30" y="110" width="76" height="40" rx="7" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="126" cy="118" r="14" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="126" y1="132" x2="154" y2="132" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity=".5" />
      <line x1="154" y1="133" x2="154" y2="149" stroke={A} strokeWidth="1.6" markerStart="url(#pbm-len)" markerEnd="url(#pbm-len)" />
      <text className="mono" x="162" y="145" fill={A}>≤ 1 in</text>
      <text className="mono" x="105" y="196" textAnchor="middle" fill={A}>PEC MINOR</text>
      <text x="105" y="212" textAnchor="middle" fontSize="11">posterior acromion to table</text>
      <text x="105" y="226" textAnchor="middle" fontSize="11">2.54 cm, both sides</text>

      {/* panel 2: pec major */}
      <rect x="235" y="150" width="85" height="14" fill="currentColor" opacity=".06" />
      <line x1="235" y1="150" x2="320" y2="150" stroke="currentColor" strokeWidth="2.5" opacity=".55" />
      <line x1="320" y1="150" x2="320" y2="164" stroke="currentColor" strokeWidth="2.5" opacity=".55" />
      <line x1="320" y1="150" x2="392" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity=".45" />
      <text className="mono" x="332" y="98" fill={HI}>short</text>
      <line x1="300" y1="136" x2="378" y2="106" stroke={HI} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#pbm-len-hi)" />
      <line x1="300" y1="136" x2="384" y2="149" stroke={A} strokeWidth="2.4" markerEnd="url(#pbm-len)" />
      <circle cx="300" cy="136" r="13" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="305" y="178" textAnchor="middle" opacity=".75">120° abd + ER · 90° abd</text>
      <text className="mono" x="305" y="196" textAnchor="middle" fill={A}>PEC MAJOR</text>
      <text x="305" y="212" textAnchor="middle" fontSize="11">sternal: touches table</text>
      <text x="305" y="226" textAnchor="middle" fontSize="11">clavicular: level with table</text>

      {/* panel 3: teres major */}
      <line x1="440" y1="92" x2="440" y2="172" stroke="currentColor" strokeWidth="1.6" opacity=".45" />
      <text className="mono" x="434" y="88" textAnchor="end" opacity=".7">spine</text>
      <path d="M 466 104 L 506 110 L 480 160 Z" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 492 104 L 532 110 L 506 160 Z" fill="none" stroke={HI} strokeWidth="1.5" strokeDasharray="5 4" />
      <line x1="507" y1="134" x2="533" y2="134" stroke={HI} strokeWidth="1.6" markerStart="url(#pbm-len-hi)" markerEnd="url(#pbm-len-hi)" />
      <text className="mono" x="546" y="138" fill={HI}>&gt;1 in</text>
      <text className="mono" x="505" y="196" textAnchor="middle" fill={A}>TERES MAJOR</text>
      <text x="505" y="212" textAnchor="middle" fontSize="11">lateral border shifts out</text>
      <text x="505" y="226" textAnchor="middle" fontSize="11">during passive flexion</text>
    </svg>
  );
}

/** The coracoacromial arch and the soft tissue caught under it. */
function CoracoacromialArch() {
  return (
    <svg
      viewBox="0 0 620 330"
      role="img"
      aria-label="Schematic of the coracoacromial arch. The acromion and the coracoacromial ligament running to the coracoid form a roof; the subacromial bursa and the supraspinatus tendon lie underneath it; the greater tuberosity of the humerus rises toward the roof as the arm elevates."
    >
      <path d="M 214 222 L 288 222 L 280 326 L 224 326 Z" fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="250" cy="190" r="56" fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="206" cy="146" r="24" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeWidth="1.5" />

      <path d="M 188 100 L 352 80 L 350 104 Q 290 90 196 122 Z" fill={HI} fillOpacity=".09" />
      <path d="M 352 64 L 188 84 L 188 100 L 352 80 Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.4" />
      <line x1="352" y1="74" x2="414" y2="118" stroke={D3} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 410 112 L 452 100 L 458 116 L 418 130 Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M 344 96 Q 280 86 198 116" fill="none" stroke={HI} strokeWidth="5" strokeOpacity=".55" strokeLinecap="round" />
      <path d="M 350 112 Q 290 98 202 126" fill="none" stroke={A} strokeWidth="10" strokeOpacity=".5" strokeLinecap="round" />

      <line x1="300" y1="58" x2="292" y2="72" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="300" y="50" textAnchor="middle">acromion</text>
      <line x1="426" y1="84" x2="392" y2="100" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="430" y="80" fill={D3}>coracoacromial ligament</text>
      <line x1="466" y1="130" x2="450" y2="120" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="470" y="136">coracoid</text>
      <line x1="130" y1="88" x2="196" y2="112" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="24" y="86" fill={HI}>subacromial bursa</text>
      <line x1="150" y1="124" x2="252" y2="114" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="24" y="128" fill={A}>supraspinatus tendon</text>
      <line x1="152" y1="178" x2="190" y2="160" stroke="currentColor" strokeWidth="1" opacity=".5" />
      <text x="24" y="182">greater tuberosity</text>
      <text className="mono" x="250" y="290" textAnchor="middle" opacity=".75">humerus</text>
    </svg>
  );
}

/** Normal, anterior glide and superior glide, read against a line dropped from the
 *  anterior tip of the acromion. */
function HeadAlignment() {
  return (
    <svg
      viewBox="0 0 620 260"
      role="img"
      aria-label="Three side views of the humeral head relative to the acromion: normal with about one third of the head anterior to the acromion, anterior glide with more than one third anterior, and superior glide with reduced space between the head and the acromion."
    >
      <text className="mono" x="20" y="20" opacity=".7">← anterior</text>

      {/* panel 1: normal */}
      <line x1="70" y1="52" x2="70" y2="214" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".55" />
      <line x1="77" y1="151" x2="70" y2="216" stroke="currentColor" strokeWidth="13" strokeLinecap="round" opacity=".2" />
      <path d="M 70 93.8 A 34 34 0 0 0 70 158.2 Z" fill={A} fillOpacity=".2" />
      <circle cx="81" cy="126" r="34" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="70" y="64" width="90" height="12" rx="5" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="132" y1="76" x2="132" y2="92" stroke={A} strokeWidth="1.5" />
      <line x1="128" y1="76" x2="136" y2="76" stroke={A} strokeWidth="1.5" />
      <line x1="128" y1="92" x2="136" y2="92" stroke={A} strokeWidth="1.5" />
      <text className="mono" x="140" y="88" fill={A}>space</text>
      <text x="58" y="130" textAnchor="middle" fill={A}>⅓</text>
      <text className="mono" x="110" y="238" textAnchor="middle" fill={A}>NORMAL</text>
      <text x="110" y="253" textAnchor="middle" fontSize="11">≤ ⅓ of head anterior</text>

      {/* panel 2: anterior glide */}
      <line x1="270" y1="52" x2="270" y2="214" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".55" />
      <line x1="255" y1="151" x2="248" y2="216" stroke="currentColor" strokeWidth="13" strokeLinecap="round" opacity=".2" />
      <path d="M 270 93.8 A 34 34 0 1 0 270 158.2 Z" fill={HI} fillOpacity=".2" />
      <circle cx="259" cy="126" r="34" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="270" y="64" width="90" height="12" rx="5" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
      <text x="232" y="130" textAnchor="middle" fill={HI}>&gt;⅓</text>
      <text className="mono" x="310" y="238" textAnchor="middle" fill={HI}>ANTERIOR GLIDE</text>
      <text x="310" y="253" textAnchor="middle" fontSize="11">lax anterior capsule, weak subscap</text>

      {/* panel 3: superior glide */}
      <line x1="470" y1="52" x2="470" y2="214" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".55" />
      <line x1="477" y1="137" x2="470" y2="216" stroke="currentColor" strokeWidth="13" strokeLinecap="round" opacity=".2" />
      <path d="M 470 79.8 A 34 34 0 0 0 470 144.2 Z" fill={A} fillOpacity=".2" />
      <circle cx="481" cy="112" r="34" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="452" y="72" width="60" height="7" rx="3" fill={HI} fillOpacity=".45" />
      <rect x="470" y="64" width="90" height="12" rx="5" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
      <text className="mono" x="524" y="94" fill={HI}>space ↓</text>
      <text className="mono" x="510" y="238" textAnchor="middle" fill={HI}>SUPERIOR GLIDE</text>
      <text x="510" y="253" textAnchor="middle" fontSize="11">head crowds the acromion</text>
    </svg>
  );
}

/** The deltoid–cuff force couple, intact and deficient. */
function ForceCouple() {
  return (
    <svg
      viewBox="0 0 620 280"
      role="img"
      aria-label="Two side-by-side schematics of the glenohumeral joint. With the cuff intact, the deltoid's upward pull is balanced by the cuff's medial compression and the head stays centered in the glenoid. With the cuff deficient, the unopposed deltoid migrates the head superiorly until the greater tuberosity meets the acromion."
    >
      <defs>
        <marker id="pbm-delt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={D3} />
        </marker>
        <marker id="pbm-cuff" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={A} />
        </marker>
        <marker id="pbm-fade" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" fillOpacity=".3" />
        </marker>
        <marker id="pbm-hi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={HI} />
        </marker>
      </defs>

      {/* panel A: intact */}
      <text className="mono" x="150" y="22" textAnchor="middle" fill={A}>CUFF INTACT</text>
      <rect x="60" y="52" width="100" height="13" rx="6" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 238 86 Q 212 140 238 194" fill="none" stroke="currentColor" strokeWidth="4" opacity=".6" />
      <text x="244" y="144" fontSize="11" opacity=".7">glenoid</text>
      <line x1="156" y1="172" x2="132" y2="252" stroke="currentColor" strokeWidth="16" strokeLinecap="round" opacity=".2" />
      <circle cx="176" cy="140" r="38" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.8" />
      <line x1="138" y1="200" x2="124" y2="92" stroke={D3} strokeWidth="2.4" markerEnd="url(#pbm-delt)" />
      <text className="mono" x="78" y="88" fill={D3}>deltoid ↑</text>
      <line x1="112" y1="118" x2="200" y2="136" stroke={A} strokeWidth="2.4" markerEnd="url(#pbm-cuff)" />
      <text className="mono" x="86" y="112" fill={A}>cuff →</text>
      <text x="150" y="270" textAnchor="middle" fontSize="11.5">head stays centered; it rolls and glides</text>

      {/* panel B: deficient */}
      <text className="mono" x="460" y="22" textAnchor="middle" fill={HI}>CUFF DEFICIENT</text>
      <rect x="370" y="52" width="100" height="13" rx="6" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M 548 86 Q 522 140 548 194" fill="none" stroke="currentColor" strokeWidth="4" opacity=".6" />
      <line x1="466" y1="146" x2="442" y2="252" stroke="currentColor" strokeWidth="16" strokeLinecap="round" opacity=".2" />
      <rect x="452" y="60" width="66" height="8" rx="4" fill={HI} fillOpacity=".45" />
      <circle cx="486" cy="106" r="38" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.8" />
      <line x1="448" y1="200" x2="434" y2="92" stroke={D3} strokeWidth="2.4" markerEnd="url(#pbm-delt)" />
      <text className="mono" x="388" y="88" fill={D3}>deltoid ↑</text>
      <line x1="422" y1="150" x2="500" y2="166" stroke="currentColor" strokeWidth="2.4" strokeOpacity=".3" strokeDasharray="4 4" markerEnd="url(#pbm-fade)" />
      <text className="mono" x="396" y="176" opacity=".55">no counterforce</text>
      <line x1="560" y1="140" x2="560" y2="96" stroke={HI} strokeWidth="2" markerEnd="url(#pbm-hi)" />
      <text className="mono" x="566" y="128" fill={HI}>migrates</text>
      <text x="460" y="270" textAnchor="middle" fontSize="11.5" fill={HI}>greater tuberosity meets the acromion</text>
    </svg>
  );
}

/** Axial view of the proximal humerus in the three palpation rotations. */
function HumerusRotation() {
  return (
    <svg
      viewBox="0 0 620 235"
      role="img"
      aria-label="Axial view of the proximal humerus in three rotations. At 20 degrees of internal rotation the bicipital groove and long head of biceps face anteriorly. External rotation from there brings the lesser tubercle and subscapularis under the finger. Further internal rotation brings the greater tubercle and supraspinatus under the finger."
    >
      <defs>
        <marker id="pbm-rot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={A} />
        </marker>
        <g id="pb-humerus">
          <circle cx="0" cy="0" r="40" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="-23" cy="-33" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="23" cy="-33" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M -7 -47 L 0 -34 L 7 -47" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="0" cy="-40" r="4.5" fill={D2} />
        </g>
      </defs>

      <text className="mono" x="310" y="26" textAnchor="middle" opacity=".75">anterior — your palpating finger</text>
      <path d="M 103 40 L 117 40 L 110 54 Z" fill={A} />
      <path d="M 303 40 L 317 40 L 310 54 Z" fill={A} />
      <path d="M 503 40 L 517 40 L 510 54 Z" fill={A} />

      <use href="#pb-humerus" transform="translate(310,110)" />
      <use href="#pb-humerus" transform="translate(110,110) rotate(35)" />
      <use href="#pb-humerus" transform="translate(510,110) rotate(-35)" />

      <path d="M 258 146 Q 210 168 168 150" fill="none" stroke={A} strokeWidth="1.8" markerEnd="url(#pbm-rot)" />
      <text className="mono" x="212" y="182" textAnchor="middle" fill={A}>then ER</text>
      <path d="M 362 146 Q 410 168 452 150" fill="none" stroke={A} strokeWidth="1.8" markerEnd="url(#pbm-rot)" />
      <text className="mono" x="410" y="182" textAnchor="middle" fill={A}>then more IR</text>

      <text className="mono" x="310" y="202" textAnchor="middle">① 20° IR</text>
      <text x="310" y="218" textAnchor="middle" fontSize="11">bicipital groove faces anterior</text>
      <text x="310" y="232" textAnchor="middle" fontSize="11" fill={D2}>long head of biceps</text>

      <text className="mono" x="110" y="202" textAnchor="middle">②</text>
      <text x="110" y="218" textAnchor="middle" fontSize="11">lesser tubercle presents</text>
      <text x="110" y="232" textAnchor="middle" fontSize="11" fill={A}>subscapularis</text>

      <text className="mono" x="510" y="202" textAnchor="middle">③</text>
      <text x="510" y="218" textAnchor="middle" fontSize="11">greater tubercle presents</text>
      <text x="510" y="232" textAnchor="middle" fontSize="11" fill={A}>supraspinatus</text>
    </svg>
  );
}

/* ---------- hip ---------- */

/** Five pain zones on a schematic hip, each with the test that opens it. */
function HipPainMap() {
  return (
    <svg
      viewBox="0 0 620 300"
      role="img"
      aria-label="Schematic hip with five numbered pain zones — lateral thigh, buttock, groin and inner thigh, local trochanteric, and anterior hip and groin — each listed with the test that separates its causes. A bar across the foot of the figure notes that long axis distraction relieving symptoms points to hip osteoarthritis in all five zones."
    >
      <path
        d="M 66 104 Q 110 74 152 84 Q 172 128 156 150 Q 140 168 106 156 Q 74 140 66 104 Z"
        fill="currentColor"
        fillOpacity=".07"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity=".7"
      />
      <path d="M 106 156 Q 118 188 136 192 Q 152 188 152 168" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
      <circle cx="166" cy="140" r="14" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" opacity=".8" />
      <path d="M 178 148 L 190 156" stroke="currentColor" strokeWidth="4" opacity=".45" strokeLinecap="round" />
      <path d="M 192 158 L 204 236" stroke="currentColor" strokeWidth="9" opacity=".3" strokeLinecap="round" />
      <text className="mono" x="66" y="250" opacity=".5">anterior view · right hip</text>

      <circle cx="206" cy="196" r="7" fill={A} />
      <text className="mono" x="218" y="200" fill={A}>1</text>
      <circle cx="86" cy="124" r="7" fill={D2} />
      <text className="mono" x="70" y="128" textAnchor="end" fill={D2}>2</text>
      <circle cx="124" cy="206" r="7" fill={D3} />
      <text className="mono" x="112" y="224" textAnchor="end" fill={D3}>3</text>
      <circle cx="196" cy="144" r="7" fill={A} />
      <text className="mono" x="208" y="140" fill={A}>4</text>
      <circle cx="146" cy="112" r="7" fill={D2} />
      <text className="mono" x="146" y="98" textAnchor="middle" fill={D2}>5</text>

      <text className="mono" x="276" y="44" fill={A}>1 LATERAL THIGH</text>
      <text x="276" y="62">glute med static test · palpation · single leg stance</text>
      <text className="mono" x="276" y="92" fill={D2}>2 BUTTOCK</text>
      <text x="276" y="110">resisted knee flexion · hamstring stretch · palpation</text>
      <text className="mono" x="276" y="140" fill={D3}>3 GROIN &amp; INNER THIGH</text>
      <text x="276" y="158">resisted adduction · FADIR · log roll</text>
      <text className="mono" x="276" y="188" fill={A}>4 LOCAL TROCHANTERIC</text>
      <text x="276" y="206">posterolateral trochanter palpation · Trendelenburg</text>
      <text className="mono" x="276" y="236" fill={D2}>5 ANTERIOR HIP &amp; GROIN</text>
      <text x="276" y="254">resisted flexion · FADIR · AIIS / ASIS palpation</text>

      <rect x="66" y="272" width="514" height="24" rx="5" fill={A} fillOpacity=".12" stroke={A} strokeWidth="1.2" />
      <text className="mono" x="323" y="288" textAnchor="middle" fill={A}>
        LONG AXIS DISTRACTION RELIEVES → HIP OA — IN ALL FIVE ZONES
      </text>
    </svg>
  );
}

/** Femoral version seen down the shaft: neck angle against the condylar axis. */
function FemoralVersion() {
  return (
    <svg
      viewBox="0 0 620 240"
      role="img"
      aria-label="Three femurs viewed down the shaft from above. Normal anteversion is about 15 degrees between the femoral neck and the condylar axis. Excessive anteversion is a larger angle, turning the limb inward and giving more available internal rotation. Retroversion is a smaller or negative angle, turning the limb outward and giving more external rotation."
    >
      <text className="mono" x="310" y="26" textAnchor="middle" opacity=".6">VIEWED DOWN THE SHAFT — NECK ANGLE AGAINST THE FEMORAL CONDYLES</text>

      <g>
        <line x1="58" y1="150" x2="162" y2="150" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
        <line x1="110" y1="150" x2="50" y2="134" stroke={A} strokeWidth="6" strokeLinecap="round" />
        <circle cx="46" cy="133" r="8" fill={A} fillOpacity=".3" stroke={A} strokeWidth="1.5" />
        <path d="M 84 150 A 26 26 0 0 0 82 143" fill="none" stroke={A} strokeWidth="1.4" />
        <text className="mono" x="110" y="176" textAnchor="middle" fill={A}>≈15°</text>
        <text x="110" y="196" textAnchor="middle">Normal</text>
        <text className="mono" x="110" y="216" textAnchor="middle" opacity=".7">toe-out 4–7°</text>
      </g>

      <g>
        <line x1="258" y1="150" x2="362" y2="150" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
        <line x1="310" y1="150" x2="258" y2="118" stroke={D2} strokeWidth="6" strokeLinecap="round" />
        <circle cx="254" cy="116" r="8" fill={D2} fillOpacity=".3" stroke={D2} strokeWidth="1.5" />
        <path d="M 284 150 A 26 26 0 0 0 278 136" fill="none" stroke={D2} strokeWidth="1.4" />
        <text className="mono" x="310" y="176" textAnchor="middle" fill={D2}>&gt; 15°</text>
        <text x="310" y="196" textAnchor="middle">Anteversion</text>
        <text className="mono" x="310" y="216" textAnchor="middle" opacity=".7">toe-in · more IR available</text>
      </g>

      <g>
        <line x1="458" y1="150" x2="562" y2="150" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
        <line x1="510" y1="150" x2="450" y2="154" stroke={D3} strokeWidth="6" strokeLinecap="round" />
        <circle cx="446" cy="154" r="8" fill={D3} fillOpacity=".3" stroke={D3} strokeWidth="1.5" />
        <path d="M 484 150 A 26 26 0 0 0 484 152" fill="none" stroke={D3} strokeWidth="1.4" />
        <text className="mono" x="510" y="176" textAnchor="middle" fill={D3}>&lt; 15°</text>
        <text x="510" y="196" textAnchor="middle">Retroversion</text>
        <text className="mono" x="510" y="216" textAnchor="middle" opacity=".7">toe-out · more ER available</text>
      </g>
    </svg>
  );
}

/** Three pelvises in single leg stance: neutral, Trendelenburg, compensated. */
function TrendelenburgDrop() {
  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-label="Three figures in single leg stance seen from behind. Neutral: the pelvis stays level. Trendelenburg: the unloaded pelvis drops more than two centimetres. Compensated Trendelenburg: the pelvis is nearly level but the trunk leans toward the stance leg, which shortens the abductor moment arm."
    >
      <g>
        <line x1="110" y1="66" x2="110" y2="126" stroke="currentColor" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <line x1="66" y1="126" x2="154" y2="126" stroke={A} strokeWidth="7" strokeLinecap="round" />
        <line x1="82" y1="130" x2="82" y2="204" stroke="currentColor" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <path d="M 138 130 L 148 168 L 132 186" fill="none" stroke="currentColor" strokeWidth="2" opacity=".35" strokeLinecap="round" />
        <line x1="60" y1="126" x2="60" y2="126" stroke={A} strokeWidth="1" />
        <text className="mono" x="110" y="226" textAnchor="middle" fill={A}>NEUTRAL</text>
        <text className="mono" x="110" y="243" textAnchor="middle" opacity=".65">pelvis level</text>
      </g>

      <g>
        <line x1="310" y1="62" x2="310" y2="122" stroke="currentColor" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <line x1="266" y1="114" x2="354" y2="140" stroke={HI} strokeWidth="7" strokeLinecap="round" />
        <line x1="282" y1="120" x2="282" y2="204" stroke="currentColor" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <path d="M 340 146 L 350 182 L 334 198" fill="none" stroke="currentColor" strokeWidth="2" opacity=".35" strokeLinecap="round" />
        <line x1="266" y1="114" x2="366" y2="114" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity=".4" />
        <line x1="362" y1="114" x2="362" y2="140" stroke={HI} strokeWidth="1.4" />
        <path d="M 358 118 L 362 114 L 366 118" fill="none" stroke={HI} strokeWidth="1.4" />
        <path d="M 358 136 L 362 140 L 366 136" fill="none" stroke={HI} strokeWidth="1.4" />
        <text className="mono" x="372" y="132" fill={HI}>&gt; 2 cm</text>
        <text className="mono" x="310" y="226" textAnchor="middle" fill={HI}>TRENDELENBURG</text>
        <text className="mono" x="310" y="243" textAnchor="middle" opacity=".65">unloaded side drops</text>
      </g>

      <g>
        <line x1="510" y1="124" x2="482" y2="66" stroke={D2} strokeWidth="3" strokeLinecap="round" />
        <line x1="466" y1="124" x2="554" y2="130" stroke={D2} strokeWidth="7" strokeLinecap="round" />
        <line x1="482" y1="128" x2="482" y2="204" stroke="currentColor" strokeWidth="3" opacity=".5" strokeLinecap="round" />
        <path d="M 538 136 L 548 174 L 532 192" fill="none" stroke="currentColor" strokeWidth="2" opacity=".35" strokeLinecap="round" />
        <path d="M 508 84 Q 492 78 486 72" fill="none" stroke={D2} strokeWidth="1.4" />
        <path d="M 490 68 L 484 71 L 489 76" fill="none" stroke={D2} strokeWidth="1.4" />
        <text className="mono" x="516" y="88" fill={D2}>trunk leans</text>
        <text className="mono" x="510" y="226" textAnchor="middle" fill={D2}>COMPENSATED</text>
        <text className="mono" x="510" y="243" textAnchor="middle" opacity=".65">same muscle, hidden</text>
      </g>
    </svg>
  );
}

/** Quad-dominant and hip-dominant squat, compared by shin and trunk angle. */
function SquatStrategy() {
  return (
    <svg
      viewBox="0 0 620 236"
      role="img"
      aria-label="Two squat strategies compared. Quad dominant: the torso stays more upright and the shin angles further forward, loading the knee extensors. Hip dominant: the torso comes forward and the shin stays closer to vertical, loading the hip extensors."
    >
      <line x1="40" y1="196" x2="580" y2="196" stroke="currentColor" strokeWidth="1" opacity=".3" />

      <g>
        <line x1="150" y1="196" x2="150" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".28" />
        <line x1="150" y1="194" x2="198" y2="140" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <line x1="198" y1="140" x2="140" y2="116" stroke="currentColor" strokeWidth="4" opacity=".55" strokeLinecap="round" />
        <line x1="140" y1="116" x2="156" y2="58" stroke={A} strokeWidth="4" strokeLinecap="round" />
        <circle cx="158" cy="48" r="9" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="1.4" />
        <path d="M 150 168 A 28 28 0 0 0 166 162" fill="none" stroke={A} strokeWidth="1.4" />
        <text className="mono" x="208" y="190" fill={A}>greater shin angle</text>
        <text className="mono" x="150" y="216" textAnchor="middle" fill={A}>QUAD DOMINANT</text>
        <text className="mono" x="150" y="232" textAnchor="middle" opacity=".65">torso upright · knee pays</text>
      </g>

      <g>
        <line x1="430" y1="196" x2="430" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".28" />
        <line x1="430" y1="194" x2="446" y2="140" stroke={D3} strokeWidth="4" strokeLinecap="round" />
        <line x1="446" y1="140" x2="392" y2="126" stroke="currentColor" strokeWidth="4" opacity=".55" strokeLinecap="round" />
        <line x1="392" y1="126" x2="438" y2="70" stroke={D3} strokeWidth="4" strokeLinecap="round" />
        <circle cx="444" cy="62" r="9" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="1.4" />
        <path d="M 430 168 A 28 28 0 0 0 436 166" fill="none" stroke={D3} strokeWidth="1.4" />
        <text className="mono" x="462" y="190" fill={D3}>lesser shin angle</text>
        <text className="mono" x="430" y="216" textAnchor="middle" fill={D3}>HIP DOMINANT</text>
        <text className="mono" x="430" y="232" textAnchor="middle" opacity=".65">torso forward · hip pays</text>
      </g>
    </svg>
  );
}

/** Three dials — sagittal, frontal, and rotation measured at 90° of hip and knee flexion. */
function HipRomDial() {
  return (
    <svg
      viewBox="0 0 620 262"
      role="img"
      aria-label="Three dials showing normal hip range. Sagittal plane: flexion 0 to 120 degrees, extension 0 to 30. Frontal plane: abduction 0 to 45 degrees, adduction 0 to 30. Rotation measured at 90 degrees of hip and knee flexion: internal rotation 0 to 45 degrees and external rotation 0 to 45 degrees."
    >
      <text className="mono" x="110" y="30" textAnchor="middle" fill={A}>SAGITTAL</text>
      <circle cx="110" cy="118" r="58" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 110 176 A 58 58 0 0 1 60 89" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 110 176 A 58 58 0 0 0 139 168" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="110" y1="118" x2="110" y2="176" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="110" cy="118" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="110" y="206" textAnchor="middle" fill={A}>flexion 0–120°</text>
      <text className="mono" x="110" y="222" textAnchor="middle" fill={D3}>extension 0–30°</text>
      <text className="mono" x="110" y="242" textAnchor="middle" opacity=".55">anterior ←</text>

      <text className="mono" x="310" y="30" textAnchor="middle" fill={A}>FRONTAL</text>
      <circle cx="310" cy="118" r="58" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 310 176 A 58 58 0 0 1 269 159" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 310 176 A 58 58 0 0 0 339 168" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="310" y1="118" x2="310" y2="176" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="310" cy="118" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="310" y="206" textAnchor="middle" fill={A}>abduction 0–45°</text>
      <text className="mono" x="310" y="222" textAnchor="middle" fill={D3}>adduction 0–30°</text>
      <text className="mono" x="310" y="242" textAnchor="middle" opacity=".55">lateral ←</text>

      <text className="mono" x="510" y="30" textAnchor="middle" fill={A}>ROTATION @ 90/90</text>
      <circle cx="510" cy="118" r="58" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity=".22" />
      <path d="M 510 176 A 58 58 0 0 1 469 159" fill="none" stroke={A} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <path d="M 510 176 A 58 58 0 0 0 551 159" fill="none" stroke={D3} strokeWidth="8" strokeLinecap="round" opacity=".85" />
      <line x1="510" y1="118" x2="510" y2="176" stroke="currentColor" strokeWidth="2.5" opacity=".5" strokeLinecap="round" />
      <circle cx="510" cy="118" r="4" fill="currentColor" opacity=".6" />
      <text className="mono" x="510" y="206" textAnchor="middle" fill={A}>ER 0–45°</text>
      <text className="mono" x="510" y="222" textAnchor="middle" fill={D3}>IR 0–45°</text>
      <text className="mono" x="510" y="242" textAnchor="middle" opacity=".55">tibia vertical at start</text>
    </svg>
  );
}

/** Which correction brings the leg down decides which hip flexor is short. */
function ThomasSort() {
  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-label="Decision chain for the second Thomas test attempt with the pelvis stabilized. If the thigh reaches the table the test is normal. If not, abducting the leg and having it come down implicates the tensor fasciae latae; extending the knee and having it come down implicates rectus femoris; if neither brings it down, the iliopsoas is short."
    >
      <rect x="40" y="24" width="252" height="38" rx="6" fill={A} fillOpacity=".12" stroke={A} strokeWidth="1.3" />
      <text className="mono" x="166" y="42" textAnchor="middle" fill={A}>PELVIS STABILIZED · POSTERIOR TILT</text>
      <text x="166" y="57" textAnchor="middle">lower the test leg</text>

      <line x1="166" y1="62" x2="166" y2="88" stroke="currentColor" strokeWidth="1.3" opacity=".45" />

      <rect x="40" y="88" width="252" height="34" rx="6" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1" opacity=".8" />
      <text x="166" y="109" textAnchor="middle">Does the thigh reach the table?</text>
      <line x1="292" y1="105" x2="352" y2="105" stroke={D3} strokeWidth="1.3" />
      <text className="mono" x="358" y="102" fill={D3}>YES — NORMAL</text>
      <text className="mono" x="358" y="118" opacity=".7">knee 80–90° · hip ≥ 0°</text>

      <line x1="166" y1="122" x2="166" y2="148" stroke="currentColor" strokeWidth="1.3" opacity=".45" />
      <rect x="40" y="148" width="252" height="30" rx="6" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1" opacity=".8" />
      <text x="166" y="167" textAnchor="middle">Now abduct the leg — does it come down?</text>
      <line x1="292" y1="163" x2="352" y2="163" stroke={A} strokeWidth="1.3" />
      <text className="mono" x="358" y="167" fill={A}>YES → TFL IS SHORT</text>

      <line x1="166" y1="178" x2="166" y2="200" stroke="currentColor" strokeWidth="1.3" opacity=".45" />
      <rect x="40" y="200" width="252" height="30" rx="6" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1" opacity=".8" />
      <text x="166" y="219" textAnchor="middle">Now extend the knee — does it come down?</text>
      <line x1="292" y1="215" x2="352" y2="215" stroke={D2} strokeWidth="1.3" />
      <text className="mono" x="358" y="211" fill={D2}>YES → RECTUS FEMORIS</text>
      <text className="mono" x="358" y="227" fill={HI}>NO → ILIOPSOAS</text>
    </svg>
  );
}

/** Convex head on concave socket: the glide opposes the shaft.
 *
 *  Both panels used to draw the femur in the same position, so "swings anteriorly" against
 *  "swings posteriorly" lived only in the labels and the two pictures looked identical. The
 *  shaft is now drawn where the motion actually puts it — forward of neutral in flexion,
 *  behind it in extension — against a faded neutral limb, so the opposition between the
 *  shaft and the head is something you can see rather than read. */
function ConvexHipGlide() {
  return (
    <svg
      viewBox="0 0 620 288"
      role="img"
      aria-label="Two panels of the femoral head in the acetabulum, each with the femur drawn against a faded neutral limb. In hip flexion or internal rotation the shaft swings forward, anteriorly, while the convex head glides the other way, posteriorly — treated with an anterior-to-posterior glide directed posterolaterally. In extension or external rotation the shaft swings backward and the head glides anteriorly, treated with a posterior-to-anterior glide directed anteromedially."
    >
      <text className="mono" x="170" y="28" textAnchor="middle" fill={A}>FLEXION / INTERNAL ROTATION</text>
      <text className="mono" x="170" y="74" textAnchor="middle" fill={A}>head glides posteriorly →</text>
      <path d="M 130 140 A 40 40 0 0 1 210 140" fill="none" stroke="currentColor" strokeWidth="8" opacity=".32" strokeLinecap="round" />
      <circle cx="170" cy="140" r="27" fill={A} fillOpacity=".12" stroke={A} strokeWidth="1.6" />
      <line x1="170" y1="140" x2="170" y2="216" stroke="currentColor" strokeWidth="3" opacity=".3" strokeDasharray="4 6" strokeLinecap="round" />
      <line x1="170" y1="140" x2="112" y2="189" stroke="currentColor" strokeWidth="8" opacity=".45" strokeLinecap="round" />
      <line x1="153" y1="140" x2="183" y2="140" stroke={A} strokeWidth="2.6" />
      <path d="M 177 134 L 184 140 L 177 146" fill="none" stroke={A} strokeWidth="2.6" />
      <path d="M 172 226 Q 140 236 108 202" fill="none" stroke={D2} strokeWidth="1.8" />
      <path d="M 116 208 L 105 199 L 114 192" fill="none" stroke={D2} strokeWidth="1.8" />
      <text className="mono" x="182" y="230" opacity=".5">neutral</text>
      <text className="mono" x="170" y="256" textAnchor="middle" fill={D2}>shaft swings anteriorly</text>
      <text className="mono" x="170" y="278" textAnchor="middle">AP glide · posterolateral</text>

      <text className="mono" x="450" y="28" textAnchor="middle" fill={D3}>EXTENSION / EXTERNAL ROTATION</text>
      <text className="mono" x="450" y="74" textAnchor="middle" fill={D3}>← head glides anteriorly</text>
      <path d="M 410 140 A 40 40 0 0 1 490 140" fill="none" stroke="currentColor" strokeWidth="8" opacity=".32" strokeLinecap="round" />
      <circle cx="450" cy="140" r="27" fill={D3} fillOpacity=".12" stroke={D3} strokeWidth="1.6" />
      <line x1="450" y1="140" x2="450" y2="216" stroke="currentColor" strokeWidth="3" opacity=".3" strokeDasharray="4 6" strokeLinecap="round" />
      <line x1="450" y1="140" x2="492" y2="204" stroke="currentColor" strokeWidth="8" opacity=".45" strokeLinecap="round" />
      <line x1="467" y1="140" x2="437" y2="140" stroke={D3} strokeWidth="2.6" />
      <path d="M 443 134 L 436 140 L 443 146" fill="none" stroke={D3} strokeWidth="2.6" />
      <path d="M 448 226 Q 476 234 500 216" fill="none" stroke={D2} strokeWidth="1.8" />
      <path d="M 492 210 L 503 214 L 495 223" fill="none" stroke={D2} strokeWidth="1.8" />
      <text className="mono" x="416" y="230" textAnchor="end" opacity=".5">neutral</text>
      <text className="mono" x="450" y="256" textAnchor="middle" fill={D2}>shaft swings posteriorly</text>
      <text className="mono" x="450" y="278" textAnchor="middle">PA glide · anteromedial</text>

      <text className="mono" x="24" y="140" opacity=".5">anterior ←</text>
    </svg>
  );
}

/** The grades placed along the range, against the point where resistance begins. */
function MaitlandGrades() {
  return (
    <svg
      viewBox="0 0 620 282"
      role="img"
      aria-label="The Maitland mobilization grades drawn as amplitudes along the range of motion. Grades one and two sit before R1, the point where resistance begins, and treat pain. Grades three and four cross R1 into resistance and treat tissue length. Grade five is a single high velocity thrust at the end of the available range."
    >
      <rect x="70" y="46" width="290" height="118" fill={A} fillOpacity=".07" />
      <rect x="360" y="46" width="150" height="118" fill={D2} fillOpacity=".1" />
      <text className="mono" x="80" y="62" fill={A}>NO RESISTANCE — TREATS PAIN</text>
      <text className="mono" x="370" y="62" fill={D2}>INTO RESISTANCE — TREATS LENGTH</text>

      <line x1="70" y1="176" x2="546" y2="176" stroke="currentColor" strokeWidth="1.6" opacity=".55" />
      <line x1="70" y1="170" x2="70" y2="182" stroke="currentColor" strokeWidth="1.6" opacity=".55" />
      <line x1="360" y1="46" x2="360" y2="188" stroke={D2} strokeWidth="1.4" strokeDasharray="4 3" />
      <line x1="510" y1="46" x2="510" y2="188" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 3" opacity=".5" />
      <line x1="546" y1="170" x2="546" y2="182" stroke="currentColor" strokeWidth="1.6" opacity=".55" />

      <text className="mono" x="70" y="200" opacity=".7">beginning</text>
      <text className="mono" x="360" y="200" textAnchor="middle" fill={D2}>R1 — resistance begins</text>
      <text className="mono" x="510" y="220" textAnchor="end" opacity=".7">end of available ROM</text>
      <text className="mono" x="546" y="240" textAnchor="end" opacity=".7">end of normal ROM</text>

      <line x1="80" y1="150" x2="124" y2="150" stroke={A} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="132" y="154" fill={A}>I — small, beginning of range</text>
      <line x1="80" y1="126" x2="330" y2="126" stroke={A} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="338" y="130" fill={A}>II — large, mid-range</text>
      <line x1="250" y1="102" x2="508" y2="102" stroke={D2} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="242" y="106" textAnchor="end" fill={D2}>III — large, reaches end</text>
      <line x1="466" y1="80" x2="508" y2="80" stroke={D2} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="458" y="84" textAnchor="end" fill={D2}>IV — small, very end</text>

      <path d="M 480 268 L 540 268" stroke={HI} strokeWidth="3" strokeLinecap="round" />
      <path d="M 534 263 L 541 268 L 534 273" fill="none" stroke={HI} strokeWidth="3" />
      <text className="mono" x="472" y="272" textAnchor="end" fill={HI}>V — thrust, performed once</text>
    </svg>
  );
}

/** One irritability reading, four decisions. */
function IrritabilityDose() {
  return (
    <svg
      viewBox="0 0 620 264"
      role="img"
      aria-label="A matrix showing that one irritability reading fixes four separate decisions. High irritability: grades one to two, ten to thirty second bouts, work before R1, isometric exercise. Moderate: grades two to three, work to the end feel, weight-bearing exercise. Low: grades three to four, sixty second bouts, work past R1 at end range, single leg exercise."
    >
      <text className="mono" x="40" y="30" opacity=".65">ONE READING OF IRRITABILITY SETS ALL FOUR ROWS</text>

      <rect x="176" y="44" width="140" height="30" rx="5" fill={HI} fillOpacity=".14" stroke={HI} strokeWidth="1.2" />
      <text className="mono" x="246" y="63" textAnchor="middle" fill={HI}>HIGH</text>
      <rect x="324" y="44" width="140" height="30" rx="5" fill={MOD} fillOpacity=".16" stroke={MOD} strokeWidth="1.2" />
      <text className="mono" x="394" y="63" textAnchor="middle" fill={MOD}>MODERATE</text>
      <rect x="472" y="44" width="140" height="30" rx="5" fill={LOW} fillOpacity=".14" stroke={LOW} strokeWidth="1.2" />
      <text className="mono" x="542" y="63" textAnchor="middle" fill={LOW}>LOW</text>

      <text className="mono" x="164" y="102" textAnchor="end" opacity=".7">MOB GRADE</text>
      <text x="246" y="102" textAnchor="middle">I–II</text>
      <text x="394" y="102" textAnchor="middle">II–III</text>
      <text x="542" y="102" textAnchor="middle">III–IV</text>
      <line x1="176" y1="114" x2="612" y2="114" stroke="currentColor" strokeWidth="1" opacity=".18" />

      <text className="mono" x="164" y="142" textAnchor="end" opacity=".7">BOUT LENGTH</text>
      <text x="246" y="142" textAnchor="middle">10–30 s</text>
      <text x="394" y="142" textAnchor="middle">10–60 s</text>
      <text x="542" y="142" textAnchor="middle">60 s</text>
      <line x1="176" y1="154" x2="612" y2="154" stroke="currentColor" strokeWidth="1" opacity=".18" />

      <text className="mono" x="164" y="182" textAnchor="end" opacity=".7">WHERE IN RANGE</text>
      <text x="246" y="182" textAnchor="middle">before R1</text>
      <text x="394" y="182" textAnchor="middle">to the end feel</text>
      <text x="542" y="182" textAnchor="middle">past R1, end range</text>
      <line x1="176" y1="194" x2="612" y2="194" stroke="currentColor" strokeWidth="1" opacity=".18" />

      <text className="mono" x="164" y="222" textAnchor="end" opacity=".7">EXERCISE</text>
      <text x="246" y="222" textAnchor="middle">isometric</text>
      <text x="394" y="222" textAnchor="middle">weight bearing</text>
      <text x="542" y="222" textAnchor="middle">single leg</text>

      <text className="mono" x="40" y="252" opacity=".6">graded twice — from the interview, and from where symptoms arrive relative to the end feel</text>
    </svg>
  );
}

/* ---------- joint mobilization ---------- */

/** Traction is perpendicular to the treatment plane, a glide is parallel to it. */
function TreatmentPlane() {
  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-label="A convex head sitting in a concave socket. A dashed line along the concave surface marks the treatment plane. One arrow runs at a right angle to that line, labelled traction, and separates the surfaces; a second arrow runs parallel to it, labelled glide, and translates one surface on the other."
    >
      <path d="M 126 134 A 76 76 0 0 0 274 134" fill="none" stroke="currentColor" strokeWidth="9" opacity=".3" strokeLinecap="round" />
      <circle cx="200" cy="128" r="56" fill={A} fillOpacity=".1" stroke={A} strokeWidth="1.6" />
      <line x1="108" y1="134" x2="300" y2="134" stroke={D2} strokeWidth="1.6" strokeDasharray="6 4" />
      <text className="mono" x="108" y="120" fill={D2}>treatment plane</text>

      <line x1="200" y1="118" x2="200" y2="56" stroke={D3} strokeWidth="2.6" />
      <path d="M 193 64 L 200 54 L 207 64" fill="none" stroke={D3} strokeWidth="2.6" />
      <path d="M 212 134 L 212 122 L 200 122" fill="none" stroke={D3} strokeWidth="1.3" opacity=".7" />
      <text className="mono" x="212" y="70" fill={D3}>traction</text>

      <line x1="200" y1="164" x2="292" y2="164" stroke={A} strokeWidth="2.6" />
      <path d="M 284 157 L 294 164 L 284 171" fill="none" stroke={A} strokeWidth="2.6" />
      <text className="mono" x="200" y="204" textAnchor="middle" fill={A}>glide</text>

      <text className="mono" x="352" y="66" fill={D2}>THE PLANE SITS ON THE</text>
      <text className="mono" x="352" y="82" fill={D2}>CONCAVE SURFACE</text>
      <text x="352" y="104">so it moves when the concave partner</text>
      <text x="352" y="122">moves, and stays put when the convex</text>
      <text x="352" y="140">one does.</text>
      <text className="mono" x="352" y="170" fill={D3}>TRACTION</text>
      <text x="352" y="188">perpendicular — separates the surfaces</text>
      <text className="mono" x="352" y="214" fill={A}>GLIDE</text>
      <text x="352" y="232">parallel — translates one on the other</text>
    </svg>
  );
}

/** The same roll, with and without the glide that has to accompany it. */
function RollWithoutSlide() {
  return (
    <svg
      viewBox="0 0 620 258"
      role="img"
      aria-label="Two panels. With roll and slide together, the convex surface spins in place and the contact point stays in the middle of the socket. With roll and no slide, the contact point runs to the rim and the two surfaces are driven together, which is compression."
    >
      <text className="mono" x="160" y="24" textAnchor="middle" fill={A}>ROLL + SLIDE</text>
      <path d="M 76 172 A 130 130 0 0 0 244 172" fill="none" stroke="currentColor" strokeWidth="8" opacity=".3" strokeLinecap="round" />
      <circle cx="160" cy="150" r="50" fill={A} fillOpacity=".1" stroke={A} strokeWidth="1.6" />
      <path d="M 113 103 A 66 66 0 0 1 207 103" fill="none" stroke={D2} strokeWidth="2" />
      <path d="M 200 95 L 209 104 L 198 108" fill="none" stroke={D2} strokeWidth="2" />
      <text className="mono" x="160" y="76" textAnchor="middle" fill={D2}>roll →</text>
      <line x1="178" y1="170" x2="132" y2="170" stroke={A} strokeWidth="2.4" />
      <path d="M 140 163 L 130 170 L 140 177" fill="none" stroke={A} strokeWidth="2.4" />
      <text className="mono" x="216" y="174" fill={A}>← slide</text>
      <circle cx="160" cy="201" r="5" fill={A} />
      <text className="mono" x="160" y="228" textAnchor="middle">contact stays centred</text>
      <text x="160" y="248" textAnchor="middle" fontSize="11">the head spins in place</text>

      <text className="mono" x="450" y="24" textAnchor="middle" fill={HI}>ROLL, NO SLIDE</text>
      <path d="M 366 172 A 130 130 0 0 0 534 172" fill="none" stroke="currentColor" strokeWidth="8" opacity=".3" strokeLinecap="round" />
      <circle cx="450" cy="150" r="50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity=".3" />
      <circle cx="492" cy="144" r="50" fill={HI} fillOpacity=".1" stroke={HI} strokeWidth="1.6" />
      <path d="M 445 97 A 66 66 0 0 1 539 97" fill="none" stroke={D2} strokeWidth="2" />
      <path d="M 532 89 L 541 98 L 530 102" fill="none" stroke={D2} strokeWidth="2" />
      <text className="mono" x="492" y="70" textAnchor="middle" fill={D2}>roll →</text>
      <circle cx="518" cy="187" r="5" fill={HI} />
      <path d="M 532 174 L 544 166 M 536 190 L 550 190 M 532 202 L 544 210" stroke={HI} strokeWidth="2" strokeLinecap="round" />
      <text className="mono" x="440" y="228" textAnchor="middle" fill={HI}>contact runs to the rim</text>
      <text x="440" y="248" textAnchor="middle" fontSize="11">the surfaces are driven together</text>
    </svg>
  );
}

/* ---------- knee ---------- */

/** Four pain zones on a schematic knee, each with what it opens. */
function KneePainMap() {
  return (
    <svg
      viewBox="0 0 620 268"
      role="img"
      aria-label="Schematic knee from the front with four numbered pain zones — anterior, medial, lateral and posterior — each listed with the tests that separate its candidate sources."
    >
      <path d="M 96 40 L 96 96 Q 96 112 112 116 L 172 116 Q 188 112 188 96 L 188 40" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.3" opacity=".7" />
      <ellipse cx="142" cy="124" rx="52" ry="12" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
      <path d="M 100 132 L 104 216 M 184 132 L 180 216" stroke="currentColor" strokeWidth="1.3" opacity=".55" />
      <ellipse cx="142" cy="98" rx="19" ry="25" fill={A} fillOpacity=".1" stroke={A} strokeWidth="1.5" />
      <text className="mono" x="40" y="254" opacity=".5">anterior view · right knee</text>

      <circle cx="142" cy="98" r="6" fill={A} />
      <text className="mono" x="142" y="72" textAnchor="middle" fill={A}>1</text>
      <circle cx="98" cy="126" r="6" fill={D2} />
      <text className="mono" x="82" y="130" textAnchor="end" fill={D2}>2</text>
      <circle cx="186" cy="126" r="6" fill={D3} />
      <text className="mono" x="200" y="130" fill={D3}>3</text>
      <circle cx="142" cy="150" r="6" fill={HI} />
      <text className="mono" x="142" y="172" textAnchor="middle" fill={HI}>4 (behind)</text>

      <text className="mono" x="250" y="40" fill={A}>1 ANTERIOR</text>
      <text x="250" y="58">patellofemoral pain · patellar tendinopathy ·</text>
      <text x="250" y="76">Osgood-Schlatter · dislocation that reduced</text>
      <text className="mono" x="250" y="106" fill={D2}>2 MEDIAL</text>
      <text x="250" y="124">on the joint line: meniscus · above it: MCL ·</text>
      <text x="250" y="142">below it: pes anserine</text>
      <text className="mono" x="250" y="172" fill={D3}>3 LATERAL</text>
      <text x="250" y="190">meniscus · IT band at the epicondyle ·</text>
      <text x="250" y="208">LCL and the posterolateral corner</text>
      <text className="mono" x="250" y="238" fill={HI}>4 POSTERIOR</text>
      <text x="250" y="256">Baker&rsquo;s cyst · PCL sag · and the calf that ends the exam</text>
    </svg>
  );
}

/** The Q angle as two constructed lines, and what moves each end. */
function QAngle() {
  return (
    <svg
      viewBox="0 0 620 258"
      role="img"
      aria-label="The Q angle constructed from two lines: one from the anterior superior iliac spine to the centre of the patella, and one from the patella to the tibial tubercle. The angle between them is about 13 to 14 degrees in men and 17 to 18 in women."
    >
      <circle cx="120" cy="44" r="7" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="120" y="30" textAnchor="middle" opacity=".7">ASIS</text>
      <ellipse cx="196" cy="152" rx="17" ry="22" fill={A} fillOpacity=".12" stroke={A} strokeWidth="1.5" />
      <text className="mono" x="222" y="150" fill={A}>patella</text>
      <circle cx="208" cy="220" r="6" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="208" y="244" textAnchor="middle" opacity=".7">tibial tubercle</text>

      <line x1="120" y1="44" x2="196" y2="152" stroke={D2} strokeWidth="2.2" />
      <line x1="196" y1="152" x2="208" y2="220" stroke={D3} strokeWidth="2.2" />
      <line x1="196" y1="152" x2="184" y2="84" stroke={D3} strokeWidth="1.4" strokeDasharray="5 4" opacity=".8" />
      <path d="M 168 113 A 48 48 0 0 0 188 105" fill="none" stroke={A} strokeWidth="2.2" />
      <text className="mono" x="166" y="88" textAnchor="middle" fill={A}>Q</text>

      <text className="mono" x="330" y="52" fill={A}>13–14° MEN · 17–18° WOMEN</text>
      <text x="330" y="74">over 20° is usually called abnormal</text>
      <text className="mono" x="330" y="108" fill={D2}>WHAT OPENS IT FROM ABOVE</text>
      <text x="330" y="128">a wider pelvis · femoral anteversion</text>
      <text className="mono" x="330" y="160" fill={D3}>WHAT OPENS IT FROM BELOW</text>
      <text x="330" y="180">tibial external torsion · a pronated foot</text>
      <text className="mono" x="330" y="216" opacity=".65">so the measurement obligates a version test</text>
      <text className="mono" x="330" y="234" opacity=".65">and a foot assessment — not a knee treatment</text>
    </svg>
  );
}

/** The tibia rotates externally through the last of extension. */
function ScrewHome() {
  return (
    <svg
      viewBox="0 0 620 248"
      role="img"
      aria-label="Two top-down views of the tibial plateau. In flexion the tibial tubercle points straight forward. Through the last thirty degrees of extension the tibia rotates externally about ten degrees, because the medial femoral condyle is longer and keeps travelling after the lateral side has run out."
    >
      <text className="mono" x="150" y="28" textAnchor="middle" fill={D2}>FLEXED</text>
      <ellipse cx="150" cy="120" rx="66" ry="44" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.5" />
      <line x1="150" y1="120" x2="150" y2="66" stroke={D2} strokeWidth="3" />
      <circle cx="150" cy="62" r="6" fill={D2} />
      <text className="mono" x="150" y="46" textAnchor="middle" fill={D2}>tubercle</text>
      <text className="mono" x="150" y="186" textAnchor="middle" opacity=".6">neutral rotation</text>

      <path d="M 236 118 L 292 118" stroke="currentColor" strokeWidth="1.6" opacity=".5" />
      <path d="M 284 111 L 294 118 L 284 125" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".5" />
      <text className="mono" x="264" y="106" textAnchor="middle" opacity=".6">extend</text>

      <text className="mono" x="400" y="28" textAnchor="middle" fill={A}>EXTENDED — LOCKED</text>
      <ellipse cx="400" cy="120" rx="66" ry="44" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.5" />
      <line x1="400" y1="120" x2="400" y2="66" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity=".35" />
      <line x1="400" y1="120" x2="418" y2="69" stroke={A} strokeWidth="3" />
      <circle cx="419" cy="66" r="6" fill={A} />
      <path d="M 400 78 A 42 42 0 0 1 412 74" fill="none" stroke={A} strokeWidth="1.8" />
      <text className="mono" x="432" y="52" fill={A}>≈10° ER</text>
      <text className="mono" x="400" y="186" textAnchor="middle" fill={A}>screwed home</text>

      <text className="mono" x="40" y="216" opacity=".7">THE MEDIAL FEMORAL CONDYLE IS LONGER</text>
      <text x="40" y="236">so the tibia keeps travelling on that side after the lateral side has run out — and the joint locks without quadriceps work</text>
    </svg>
  );
}

/** The sweep test moves fluid from one gutter to the other. */
function EffusionSweep() {
  return (
    <svg
      viewBox="0 0 620 268"
      role="img"
      aria-label="Three steps of the effusion sweep test. First an upward sweep empties the medial gutter, then a downward stroke on the lateral side drives fluid across, then the wave returning to the medial hollow is graded."
    >
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx={110 + i * 200} cy="122" rx="46" ry="60" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx={110 + i * 200} cy="112" rx="17" ry="22" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.2" />
        </g>
      ))}

      <path d="M 74 158 L 74 88" stroke={A} strokeWidth="2.6" />
      <path d="M 67 96 L 74 84 L 81 96" fill="none" stroke={A} strokeWidth="2.6" />
      <text className="mono" x="110" y="28" textAnchor="middle" fill={A}>1 · SWEEP UP, MEDIAL</text>
      <text x="110" y="206" textAnchor="middle" fontSize="11">empties the medial gutter</text>

      <path d="M 346 88 L 346 158" stroke={D2} strokeWidth="2.6" />
      <path d="M 339 150 L 346 162 L 353 150" fill="none" stroke={D2} strokeWidth="2.6" />
      <text className="mono" x="310" y="28" textAnchor="middle" fill={D2}>2 · STROKE DOWN, LATERAL</text>
      <text x="310" y="206" textAnchor="middle" fontSize="11">drives fluid across</text>

      <path d="M 476 132 Q 494 118 476 104" fill="none" stroke={D3} strokeWidth="2.6" />
      <path d="M 483 108 L 474 100 L 471 112" fill="none" stroke={D3} strokeWidth="2.6" />
      <text className="mono" x="510" y="28" textAnchor="middle" fill={D3}>3 · WATCH THE MEDIAL HOLLOW</text>
      <text x="510" y="206" textAnchor="middle" fontSize="11">the wave that returns is the grade</text>

      <text className="mono" x="40" y="236" opacity=".75">0 none · TRACE a small wave · 1+ a larger bulge</text>
      <text className="mono" x="40" y="256" opacity=".75">2+ it returns with no stroke · 3+ it cannot be swept out at all</text>
    </svg>
  );
}

/** Knee angle decides which restraint a test isolates. */
function LigamentAngle() {
  return (
    <svg
      viewBox="0 0 620 250"
      role="img"
      aria-label="Two knee positions. At twenty to thirty degrees of flexion the hamstrings are slack and an anterior force loads the anterior cruciate ligament cleanly, which is the Lachman test. At ninety degrees the hamstrings can resist the same force, which is why the anterior drawer performs worse, especially in an acutely swollen knee."
    >
      <text className="mono" x="150" y="26" textAnchor="middle" fill={A}>20–30° · LACHMAN</text>
      <line x1="90" y1="80" x2="158" y2="126" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <line x1="158" y1="126" x2="222" y2="180" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <circle cx="158" cy="126" r="9" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />
      <line x1="176" y1="158" x2="224" y2="140" stroke={A} strokeWidth="2.6" />
      <path d="M 216 134 L 227 139 L 219 148" fill="none" stroke={A} strokeWidth="2.6" />
      <text className="mono" x="150" y="212" textAnchor="middle" fill={A}>hamstrings slack</text>
      <text x="150" y="232" textAnchor="middle" fontSize="11">the ACL takes the force alone</text>

      <text className="mono" x="440" y="26" textAnchor="middle" fill={HI}>90° · ANTERIOR DRAWER</text>
      <line x1="378" y1="118" x2="452" y2="118" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <line x1="452" y1="118" x2="452" y2="194" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <circle cx="452" cy="118" r="9" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />
      <line x1="452" y1="160" x2="504" y2="160" stroke={A} strokeWidth="2.6" />
      <path d="M 496 153 L 506 160 L 496 167" fill="none" stroke={A} strokeWidth="2.6" />
      <path d="M 392 126 Q 420 168 444 192" fill="none" stroke={HI} strokeWidth="3" opacity=".8" />
      <text className="mono" x="360" y="140" textAnchor="end" fill={HI}>hamstrings</text>
      <text className="mono" x="360" y="156" textAnchor="end" fill={HI}>can defend</text>
      <text className="mono" x="440" y="212" textAnchor="middle" fill={HI}>and the swollen knee</text>
      <text x="440" y="232" textAnchor="middle" fontSize="11">will not reach the position at all</text>
    </svg>
  );
}

/** Blood supply decides whether a meniscal tear can heal. */
function MeniscusZones() {
  return (
    <svg
      viewBox="0 0 620 236"
      role="img"
      aria-label="A meniscus seen from above, divided into three concentric zones. The outer third, red-red, is vascular and can heal or be repaired. The middle red-white zone is marginal. The inner third, white-white, is avascular and will not heal, so tears there are trimmed rather than repaired."
    >
      <path d="M 176 60 A 74 74 0 1 0 176 184" fill="none" stroke={HI} strokeWidth="17" opacity=".55" strokeLinecap="round" />
      <path d="M 176 76 A 56 56 0 1 0 176 168" fill="none" stroke={MOD} strokeWidth="14" opacity=".5" strokeLinecap="round" />
      <path d="M 176 90 A 40 40 0 1 0 176 154" fill="none" stroke="currentColor" strokeWidth="12" opacity=".22" strokeLinecap="round" />

      <line x1="200" y1="52" x2="266" y2="52" stroke={HI} strokeWidth="7" strokeLinecap="round" opacity=".55" />
      <text className="mono" x="276" y="48" fill={HI}>RED-RED · OUTER THIRD</text>
      <text x="276" y="68">vascular — heals, and can be repaired</text>
      <line x1="200" y1="108" x2="266" y2="108" stroke={MOD} strokeWidth="7" strokeLinecap="round" opacity=".5" />
      <text className="mono" x="276" y="104" fill={MOD}>RED-WHITE · MIDDLE</text>
      <text x="276" y="124">marginal supply — repair is a judgement call</text>
      <line x1="200" y1="164" x2="266" y2="164" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity=".22" />
      <text className="mono" x="276" y="160" opacity=".7">WHITE-WHITE · INNER THIRD</text>
      <text x="276" y="180">avascular — will not heal, so it is trimmed</text>
      <text className="mono" x="40" y="212" opacity=".65">the same tear shape carries a different prognosis</text>
      <text className="mono" x="40" y="230" opacity=".65">depending only on how far from the rim it sits</text>
    </svg>
  );
}

/** The knee is concave-on-convex, so the glide follows the bone. */
function ConcaveKneeGlide() {
  return (
    <svg
      viewBox="0 0 620 312"
      role="img"
      aria-label="Two panels of the tibia on the femoral condyle, seen from the side of a right knee. The tibia is the concave partner and it is the bone that moves, so roll and glide travel the same way: in extension the plateau and the shaft both travel anteriorly, in flexion both travel posteriorly. This is the opposite arrangement to the hip and the shoulder, where the moving surface is convex and the glide opposes the shaft."
    >
      <text className="mono" x="170" y="26" textAnchor="middle" fill={A}>EXTENSION</text>
      <circle cx="170" cy="96" r="36" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="170" y="50" textAnchor="middle" opacity=".5">femur</text>
      <line x1="170" y1="136" x2="132" y2="136" stroke={A} strokeWidth="2.6" />
      <path d="M 140 129 L 130 136 L 140 143" fill="none" stroke={A} strokeWidth="2.6" />
      <line x1="116" y1="148" x2="224" y2="148" stroke={A} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="232" y="152" opacity=".55">plateau</text>
      <line x1="170" y1="152" x2="170" y2="226" stroke="currentColor" strokeWidth="6" opacity=".26" strokeDasharray="5 6" strokeLinecap="round" />
      <line x1="170" y1="152" x2="134" y2="224" stroke="currentColor" strokeWidth="8" opacity=".38" strokeLinecap="round" />
      <text className="mono" x="126" y="212" textAnchor="end" opacity=".55">tibia</text>
      <text className="mono" x="170" y="254" textAnchor="middle" fill={A}>plateau glides anteriorly</text>
      <text className="mono" x="170" y="274" textAnchor="middle" fill={D2}>shaft swings anteriorly too</text>
      <text className="mono" x="170" y="298" textAnchor="middle">same direction — anterior glide</text>

      <text className="mono" x="450" y="26" textAnchor="middle" fill={D3}>FLEXION</text>
      <circle cx="450" cy="96" r="36" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="450" y="50" textAnchor="middle" opacity=".5">femur</text>
      <line x1="450" y1="136" x2="488" y2="136" stroke={D3} strokeWidth="2.6" />
      <path d="M 480 129 L 490 136 L 480 143" fill="none" stroke={D3} strokeWidth="2.6" />
      <line x1="396" y1="148" x2="504" y2="148" stroke={D3} strokeWidth="7" strokeLinecap="round" />
      <text className="mono" x="388" y="152" textAnchor="end" opacity=".55">plateau</text>
      <line x1="450" y1="152" x2="450" y2="226" stroke="currentColor" strokeWidth="6" opacity=".26" strokeDasharray="5 6" strokeLinecap="round" />
      <line x1="450" y1="152" x2="486" y2="224" stroke="currentColor" strokeWidth="8" opacity=".38" strokeLinecap="round" />
      <text className="mono" x="494" y="212" opacity=".55">tibia</text>
      <text className="mono" x="450" y="254" textAnchor="middle" fill={D3}>plateau glides posteriorly</text>
      <text className="mono" x="450" y="274" textAnchor="middle" fill={D2}>shaft swings posteriorly too</text>
      <text className="mono" x="450" y="298" textAnchor="middle">same direction — posterior glide</text>

      <text className="mono" x="24" y="140" opacity=".5">anterior ←</text>
      <text className="mono" x="170" y="242" textAnchor="middle" opacity=".4">faded = start</text>
    </svg>
  );
}

/** The two Ottawa zones on an anterior view, with the four bony points that decide. */
function OttawaZones() {
  return (
    <svg
      viewBox="0 0 620 306"
      role="img"
      aria-label="Anterior view of an ankle and foot showing the malleolar zone and the midfoot zone. Four bony points decide: the posterior edge or tip of the lateral malleolus, the same on the medial malleolus, the navicular, and the base of the fifth metatarsal. In either zone, an inability to bear weight for four steps is an alternative criterion."
    >
      <rect x="96" y="98" width="68" height="64" rx="4" fill={A} fillOpacity=".07" stroke={A} strokeWidth="1.4" strokeDasharray="5 4" />
      <rect x="86" y="176" width="104" height="46" rx="4" fill={D3} fillOpacity=".07" stroke={D3} strokeWidth="1.4" strokeDasharray="5 4" />
      <text className="mono" x="80" y="134" textAnchor="end" fill={A}>MALLEOLAR</text>
      <text className="mono" x="80" y="204" textAnchor="end" fill={D3}>MIDFOOT</text>

      <text className="mono" x="106" y="58" textAnchor="end" opacity=".45">tibia</text>
      <text className="mono" x="164" y="58" opacity=".45">fibula</text>
      <line x1="120" y1="36" x2="120" y2="146" stroke="currentColor" strokeWidth="16" opacity=".22" strokeLinecap="round" />
      <line x1="150" y1="40" x2="150" y2="152" stroke="currentColor" strokeWidth="9" opacity=".22" strokeLinecap="round" />
      <path
        d="M 112 160 C 92 190, 90 230, 104 250 C 118 264, 168 262, 178 244 C 188 224, 182 190, 166 162 Z"
        fill="currentColor"
        fillOpacity=".05"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".55"
      />

      <circle cx="150" cy="156" r="6" fill={A} fillOpacity=".3" stroke={A} strokeWidth="1.6" />
      <text className="mono" x="172" y="152" fill={A}>1</text>
      <circle cx="118" cy="150" r="6" fill={A} fillOpacity=".3" stroke={A} strokeWidth="1.6" />
      <text className="mono" x="90" y="142" textAnchor="end" fill={A}>2</text>
      <circle cx="102" cy="194" r="6" fill={D3} fillOpacity=".3" stroke={D3} strokeWidth="1.6" />
      <text className="mono" x="78" y="192" textAnchor="end" fill={D3}>3</text>
      <circle cx="176" cy="200" r="6" fill={D3} fillOpacity=".3" stroke={D3} strokeWidth="1.6" />
      <text className="mono" x="198" y="200" fill={D3}>4</text>

      <text className="mono" x="310" y="62" fill={A}>ANKLE FILM — MALLEOLAR ZONE</text>
      <text x="310" y="86">1 posterior edge or tip, lateral malleolus</text>
      <text x="310" y="106">2 the same on the medial malleolus</text>
      <text className="mono" x="310" y="126" opacity=".6">the distal 6 cm of each</text>

      <text className="mono" x="310" y="164" fill={D3}>FOOT FILM — MIDFOOT ZONE</text>
      <text x="310" y="188">3 navicular</text>
      <text x="310" y="208">4 base of the fifth metatarsal</text>

      <text className="mono" x="310" y="246" fill={D2}>OR, IN EITHER ZONE</text>
      <text x="310" y="270">unable to bear weight four steps — then and now</text>

      <text className="mono" x="40" y="292" opacity=".5">bone tenderness only — soft tissue over a ligament does not count</text>
    </svg>
  );
}

/** Five pain zones around the ankle and foot, and the short list each one opens. */
function AnklePainMap() {
  return (
    <svg
      viewBox="0 0 620 306"
      role="img"
      aria-label="Side view of an ankle and foot with five numbered pain zones: lateral, medial on the far side, anterior and above the joint line, posterior and plantar heel, and forefoot. Each zone lists the structures it opens."
    >
      <path
        d="M 100 44 L 100 128 C 100 146, 90 152, 88 164 C 86 176, 96 184, 110 184 L 232 184 C 248 184, 254 176, 248 168 C 242 160, 214 154, 186 148 C 152 140, 128 132, 124 118 L 124 44 Z"
        fill="currentColor"
        fillOpacity=".05"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".55"
      />

      <circle cx="132" cy="140" r="7" fill={A} fillOpacity=".35" stroke={A} strokeWidth="1.5" />
      <text className="mono" x="146" y="136" fill={A}>1</text>
      <circle cx="106" cy="158" r="7" fill={D2} fillOpacity=".35" stroke={D2} strokeWidth="1.5" />
      <text className="mono" x="92" y="154" textAnchor="end" fill={D2}>2</text>
      <circle cx="118" cy="110" r="7" fill={D3} fillOpacity=".35" stroke={D3} strokeWidth="1.5" />
      <text className="mono" x="134" y="106" fill={D3}>3</text>
      <circle cx="96" cy="96" r="7" fill={HI} fillOpacity=".35" stroke={HI} strokeWidth="1.5" />
      <circle cx="112" cy="180" r="7" fill={HI} fillOpacity=".35" stroke={HI} strokeWidth="1.5" />
      <text className="mono" x="80" y="92" textAnchor="end" fill={HI}>4</text>
      <circle cx="208" cy="172" r="7" fill={MOD} fillOpacity=".35" stroke={MOD} strokeWidth="1.5" />
      <text className="mono" x="214" y="158" fill={MOD}>5</text>

      <text className="mono" x="300" y="48" fill={A}>1 LATERAL</text>
      <text x="300" y="70">ATFL and CFL · peroneals · fifth metatarsal</text>
      <text className="mono" x="300" y="100" fill={D2}>2 MEDIAL (far side)</text>
      <text x="300" y="122">posterior tibialis · deltoid · tarsal tunnel</text>
      <text className="mono" x="300" y="152" fill={D3}>3 ANTERIOR, ABOVE THE JOINT LINE</text>
      <text x="300" y="174">syndesmosis · anterior impingement</text>
      <text className="mono" x="300" y="204" fill={HI}>4 POSTERIOR AND PLANTAR HEEL</text>
      <text x="300" y="226">Achilles · plantar fascia · bone stress</text>
      <text className="mono" x="300" y="256" fill={MOD}>5 FOREFOOT</text>
      <text x="300" y="278">metatarsal stress · neuroma · first MTP</text>

      <text className="mono" x="40" y="292" opacity=".5">side view · schematic</text>
    </svg>
  );
}

/** The windlass: extending the great toe winds the fascia round the metatarsal head and
 *  raises the arch. */
function ArchWindlass() {
  return (
    <svg
      viewBox="0 0 620 296"
      role="img"
      aria-label="Two panels of a foot in side view. With the great toe flat the arch sits at its resting height. Extending the great toe winds the plantar fascia around the first metatarsal head, shortens it, and raises the arch, making the foot rigid for push-off."
    >
      <text className="mono" x="170" y="30" textAnchor="middle" opacity=".65">TOE FLAT</text>
      <line x1="80" y1="200" x2="280" y2="200" stroke="currentColor" strokeWidth="1.2" opacity=".3" />
      <circle cx="110" cy="184" r="11" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="226" cy="182" r="13" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M 110 172 Q 168 140 226 169" fill="none" stroke="currentColor" strokeWidth="6" opacity=".3" strokeLinecap="round" />
      <path d="M 110 194 Q 168 190 226 192" fill="none" stroke={A} strokeWidth="3" />
      <line x1="238" y1="186" x2="268" y2="190" stroke="currentColor" strokeWidth="7" opacity=".3" strokeLinecap="round" />
      <line x1="80" y1="152" x2="280" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity=".35" />
      <text className="mono" x="170" y="228" textAnchor="middle" opacity=".7">fascia lies along the sole</text>
      <text className="mono" x="170" y="250" textAnchor="middle">arch at resting height</text>

      <text className="mono" x="450" y="30" textAnchor="middle" fill={A}>GREAT TOE EXTENDED</text>
      <line x1="360" y1="200" x2="560" y2="200" stroke="currentColor" strokeWidth="1.2" opacity=".3" />
      <circle cx="390" cy="184" r="11" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="506" cy="182" r="13" fill={A} fillOpacity=".14" stroke={A} strokeWidth="1.6" />
      <path d="M 390 172 Q 448 118 506 169" fill="none" stroke="currentColor" strokeWidth="6" opacity=".3" strokeLinecap="round" />
      <path d="M 390 194 Q 448 186 500 190 A 13 13 0 0 0 514 176" fill="none" stroke={A} strokeWidth="3" />
      <line x1="514" y1="174" x2="538" y2="150" stroke="currentColor" strokeWidth="7" opacity=".35" strokeLinecap="round" />
      <line x1="360" y1="152" x2="560" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity=".35" />
      <line x1="448" y1="150" x2="448" y2="122" stroke={A} strokeWidth="2.4" />
      <path d="M 441 130 L 448 119 L 455 130" fill="none" stroke={A} strokeWidth="2.4" />
      <text className="mono" x="450" y="228" textAnchor="middle" fill={A}>fascia winds round the head</text>
      <text className="mono" x="450" y="250" textAnchor="middle">arch rises · the foot goes rigid</text>

      <text className="mono" x="40" y="278" opacity=".55">the dashed line is the same height in both panels</text>
    </svg>
  );
}

/** The weight-bearing lunge test, and the two ways it is read. */
function LungeTest() {
  return (
    <svg
      viewBox="0 0 620 282"
      role="img"
      aria-label="The weight-bearing lunge test: the foot square to a wall, the knee driven forward to touch it with the heel staying down. It is read either as a toe-to-wall distance of about nine to ten centimetres or as a tibial angle of thirty-five to forty degrees, and the side-to-side difference is the finding."
    >
      <text className="mono" x="40" y="60" fill={A}>9–10 cm</text>
      <text x="40" y="84">toe to wall, heel flat</text>
      <text className="mono" x="40" y="120" fill={D2}>35–40°</text>
      <text x="40" y="144">the same test as a tibial angle</text>
      <text className="mono" x="40" y="180" fill={D3}>&gt; 1.5 cm</text>
      <text x="40" y="204">side-to-side difference</text>
      <text className="mono" x="40" y="240" opacity=".6">heel down · knee over the second toe</text>
      <text className="mono" x="40" y="262" opacity=".45">same wall, same foot placement, every time</text>

      <line x1="470" y1="36" x2="470" y2="240" stroke="currentColor" strokeWidth="4" opacity=".45" />
      <path d="M 470 52 L 484 38 M 470 82 L 484 68 M 470 112 L 484 98 M 470 142 L 484 128 M 470 172 L 484 158 M 470 202 L 484 188" stroke="currentColor" strokeWidth="1.4" opacity=".3" />
      <line x1="330" y1="240" x2="470" y2="240" stroke="currentColor" strokeWidth="1.2" opacity=".3" />

      <line x1="352" y1="232" x2="444" y2="232" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <line x1="397" y1="228" x2="458" y2="150" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <line x1="458" y1="150" x2="420" y2="66" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <circle cx="458" cy="150" r="9" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />

      <line x1="397" y1="228" x2="397" y2="146" stroke={D2} strokeWidth="1.2" strokeDasharray="4 5" opacity=".7" />
      <path d="M 397 178 A 50 50 0 0 1 428 189" fill="none" stroke={D2} strokeWidth="2.2" />
      <text className="mono" x="414" y="156" textAnchor="middle" fill={D2}>35–40°</text>

      <line x1="444" y1="256" x2="470" y2="256" stroke={A} strokeWidth="2.2" />
      <path d="M 452 250 L 442 256 L 452 262" fill="none" stroke={A} strokeWidth="2.2" />
      <path d="M 462 250 L 472 256 L 462 262" fill="none" stroke={A} strokeWidth="2.2" />
      <text className="mono" x="450" y="274" textAnchor="middle" fill={A}>9–10 cm</text>

      <text className="mono" x="344" y="220" textAnchor="end" opacity=".6">heel</text>
      <text className="mono" x="344" y="236" textAnchor="end" opacity=".6">down</text>
    </svg>
  );
}

/** The talus is the convex partner in the mortise, so roll and glide oppose each other —
 *  the counterpart to the knee figure, where the moving surface is concave. */
function ConvexAnkleGlide() {
  return (
    <svg
      viewBox="0 0 620 268"
      role="img"
      aria-label="Two panels of the talus in the ankle mortise. The talus is the convex partner and it is the bone that moves, so roll and glide oppose each other: into dorsiflexion the talus rolls anteriorly and must glide posteriorly, and into plantarflexion the reverse. This is the same arrangement as the hip and the opposite of the knee."
    >
      <text className="mono" x="170" y="26" textAnchor="middle" fill={A}>DORSIFLEXION</text>
      <text className="mono" x="170" y="72" textAnchor="middle" opacity=".5">mortise</text>
      <line x1="114" y1="86" x2="226" y2="86" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <line x1="114" y1="86" x2="114" y2="120" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <line x1="226" y1="86" x2="226" y2="126" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <circle cx="170" cy="122" r="31" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="170" y="128" textAnchor="middle" opacity=".45">talus</text>
      <line x1="170" y1="102" x2="132" y2="102" stroke={A} strokeWidth="2.6" />
      <path d="M 140 95 L 130 102 L 140 109" fill="none" stroke={A} strokeWidth="2.6" />
      <line x1="176" y1="140" x2="244" y2="140" stroke="currentColor" strokeWidth="7" opacity=".2" strokeDasharray="5 6" strokeLinecap="round" />
      <line x1="176" y1="138" x2="242" y2="112" stroke="currentColor" strokeWidth="8" opacity=".4" strokeLinecap="round" />
      <text className="mono" x="248" y="108" opacity=".5">foot</text>
      <text className="mono" x="170" y="182" textAnchor="middle" fill={A}>rolls anteriorly</text>
      <text className="mono" x="170" y="204" textAnchor="middle" fill={D2}>glides posteriorly</text>
      <text className="mono" x="170" y="228" textAnchor="middle">opposite — posterior glide</text>

      <text className="mono" x="450" y="26" textAnchor="middle" fill={D3}>PLANTARFLEXION</text>
      <text className="mono" x="450" y="72" textAnchor="middle" opacity=".5">mortise</text>
      <line x1="394" y1="86" x2="506" y2="86" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <line x1="394" y1="86" x2="394" y2="120" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <line x1="506" y1="86" x2="506" y2="126" stroke="currentColor" strokeWidth="7" opacity=".4" strokeLinecap="round" />
      <circle cx="450" cy="122" r="31" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.5" />
      <text className="mono" x="450" y="128" textAnchor="middle" opacity=".45">talus</text>
      <line x1="450" y1="102" x2="488" y2="102" stroke={D3} strokeWidth="2.6" />
      <path d="M 480 95 L 490 102 L 480 109" fill="none" stroke={D3} strokeWidth="2.6" />
      <line x1="456" y1="140" x2="524" y2="140" stroke="currentColor" strokeWidth="7" opacity=".2" strokeDasharray="5 6" strokeLinecap="round" />
      <line x1="456" y1="142" x2="522" y2="168" stroke="currentColor" strokeWidth="8" opacity=".4" strokeLinecap="round" />
      <text className="mono" x="528" y="172" opacity=".5">foot</text>
      <text className="mono" x="450" y="182" textAnchor="middle" fill={D3}>rolls posteriorly</text>
      <text className="mono" x="450" y="204" textAnchor="middle" fill={D2}>glides anteriorly</text>
      <text className="mono" x="450" y="228" textAnchor="middle">opposite — anterior glide</text>

      <text className="mono" x="24" y="140" opacity=".5">→ anterior</text>
      <text className="mono" x="24" y="252" opacity=".45">faded foot = starting position</text>
    </svg>
  );
}

/** Why the drawer and the tilt are done at different ankle positions. */
function AtflPosition() {
  return (
    <svg
      viewBox="0 0 620 274"
      role="img"
      aria-label="Two panels of the lateral ankle ligaments. The anterior talofibular ligament runs forward from the fibula and becomes vertical in plantarflexion, which is where the anterior drawer is done. The calcaneofibular ligament runs downward and becomes vertical in dorsiflexion, which is where the talar tilt is done. In each position the other ligament is out of the line of test."
    >
      <text className="mono" x="170" y="26" textAnchor="middle" fill={A}>10–20° PLANTARFLEXION</text>
      <text className="mono" x="154" y="38" textAnchor="middle" opacity=".5">fibula</text>
      <line x1="154" y1="48" x2="154" y2="106" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <circle cx="154" cy="112" r="5" fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="186" cy="118" r="22" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="214" y="126" opacity=".5">talus</text>
      <ellipse cx="166" cy="164" rx="34" ry="18" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="124" y="180" textAnchor="end" opacity=".5">calcaneus</text>
      <line x1="154" y1="112" x2="206" y2="106" stroke={A} strokeWidth="4.5" />
      <text className="mono" x="212" y="100" fill={A}>ATFL</text>
      <line x1="154" y1="112" x2="148" y2="148" stroke="currentColor" strokeWidth="2" opacity=".28" />
      <text className="mono" x="140" y="144" textAnchor="end" opacity=".3">CFL</text>
      <line x1="192" y1="158" x2="238" y2="188" stroke="currentColor" strokeWidth="8" opacity=".3" strokeLinecap="round" />
      <text className="mono" x="244" y="192" opacity=".45">foot</text>
      <line x1="142" y1="206" x2="202" y2="206" stroke={A} strokeWidth="2.6" />
      <path d="M 194 199 L 204 206 L 194 213" fill="none" stroke={A} strokeWidth="2.6" />
      <text className="mono" x="170" y="228" textAnchor="middle" fill={A}>anterior drawer</text>
      <text className="mono" x="170" y="250" textAnchor="middle">ATFL vertical — CFL is not</text>

      <text className="mono" x="450" y="26" textAnchor="middle" fill={D3}>NEUTRAL → DORSIFLEXION</text>
      <text className="mono" x="434" y="38" textAnchor="middle" opacity=".5">fibula</text>
      <line x1="434" y1="48" x2="434" y2="106" stroke="currentColor" strokeWidth="9" opacity=".35" strokeLinecap="round" />
      <circle cx="434" cy="112" r="5" fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="466" cy="118" r="22" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="494" y="126" opacity=".5">talus</text>
      <ellipse cx="446" cy="164" rx="34" ry="18" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="404" y="180" textAnchor="end" opacity=".5">calcaneus</text>
      <line x1="434" y1="112" x2="486" y2="106" stroke="currentColor" strokeWidth="2" opacity=".28" />
      <text className="mono" x="492" y="100" opacity=".3">ATFL</text>
      <line x1="434" y1="112" x2="428" y2="148" stroke={D3} strokeWidth="4.5" />
      <text className="mono" x="420" y="144" textAnchor="end" fill={D3}>CFL</text>
      <line x1="472" y1="158" x2="518" y2="130" stroke="currentColor" strokeWidth="8" opacity=".3" strokeLinecap="round" />
      <text className="mono" x="526" y="136" opacity=".45">foot</text>
      <path d="M 480 196 A 44 44 0 0 1 424 200" fill="none" stroke={D3} strokeWidth="2.6" />
      <path d="M 432 192 L 421 201 L 433 206" fill="none" stroke={D3} strokeWidth="2.6" />
      <text className="mono" x="450" y="228" textAnchor="middle" fill={D3}>talar tilt</text>
      <text className="mono" x="450" y="250" textAnchor="middle">CFL vertical — ATFL is not</text>
    </svg>
  );
}

/** Mid-portion and insertional Achilles pain are two different prescriptions. */
function AchillesZones() {
  return (
    <svg
      viewBox="0 0 620 272"
      role="img"
      aria-label="The Achilles tendon in side view. Mid-portion tendinopathy sits two to six centimetres above the insertion and tolerates full-range loading. Insertional tendinopathy sits at the calcaneus, where dorsiflexion compresses the tendon against the bone, so loading is kept to neutral and stretching into the compressed position is avoided."
    >
      <path d="M 118 44 C 104 74, 106 102, 122 116 L 158 116 C 172 102, 172 74, 158 44 Z" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="1.4" opacity=".7" />
      <text className="mono" x="138" y="34" textAnchor="middle" opacity=".5">calf</text>
      <line x1="140" y1="116" x2="140" y2="196" stroke="currentColor" strokeWidth="13" opacity=".3" strokeLinecap="round" />
      <ellipse cx="152" cy="212" rx="36" ry="18" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.4" />
      <text className="mono" x="152" y="246" textAnchor="middle" opacity=".5">calcaneus</text>

      <rect x="131" y="140" width="18" height="38" rx="4" fill={MOD} fillOpacity=".3" stroke={MOD} strokeWidth="1.6" />
      <line x1="162" y1="140" x2="162" y2="178" stroke={MOD} strokeWidth="1.6" />
      <line x1="158" y1="140" x2="166" y2="140" stroke={MOD} strokeWidth="1.6" />
      <line x1="158" y1="178" x2="166" y2="178" stroke={MOD} strokeWidth="1.6" />
      <text className="mono" x="172" y="163" fill={MOD}>2–6 cm</text>

      <circle cx="140" cy="196" r="8" fill={HI} fillOpacity=".3" stroke={HI} strokeWidth="1.8" />
      <text className="mono" x="122" y="200" textAnchor="end" fill={HI}>insertion</text>

      <text className="mono" x="290" y="58" fill={MOD}>MID-PORTION · 2–6 cm ABOVE THE BONE</text>
      <text x="290" y="82">tolerates loading through full range</text>
      <text x="290" y="102">heel drops off a step are fine here</text>

      <text className="mono" x="290" y="146" fill={HI}>INSERTIONAL · AT THE CALCANEUS</text>
      <text x="290" y="170">dorsiflexion compresses it against the bone</text>
      <text x="290" y="190">so the loading stops at neutral</text>
      <text x="290" y="210">and the stretch that looks helpful is not</text>

      <text className="mono" x="290" y="250" opacity=".55">same tendon · same word · different exercise</text>
    </svg>
  );
}

const FIGURES: Record<string, () => React.ReactElement> = {
  "elevation-arithmetic": ElevationArithmetic,
  "restraint-by-angle": RestraintByAngle,
  "range-by-plane": RangeByPlane,
  "muscle-lengths": MuscleLengths,
  "coracoacromial-arch": CoracoacromialArch,
  "head-alignment": HeadAlignment,
  "force-couple": ForceCouple,
  "humerus-rotation": HumerusRotation,
  "hip-pain-map": HipPainMap,
  "femoral-version": FemoralVersion,
  "trendelenburg-drop": TrendelenburgDrop,
  "squat-strategy": SquatStrategy,
  "hip-rom-dial": HipRomDial,
  "thomas-sort": ThomasSort,
  "convex-hip-glide": ConvexHipGlide,
  "maitland-grades": MaitlandGrades,
  "irritability-dose": IrritabilityDose,
  "treatment-plane": TreatmentPlane,
  "roll-without-slide": RollWithoutSlide,
  "knee-pain-map": KneePainMap,
  "q-angle": QAngle,
  "screw-home": ScrewHome,
  "effusion-sweep": EffusionSweep,
  "ligament-angle": LigamentAngle,
  "meniscus-zones": MeniscusZones,
  "concave-knee-glide": ConcaveKneeGlide,
  "ottawa-zones": OttawaZones,
  "ankle-pain-map": AnklePainMap,
  "arch-windlass": ArchWindlass,
  "lunge-test": LungeTest,
  "convex-ankle-glide": ConvexAnkleGlide,
  "atfl-position": AtflPosition,
  "achilles-zones": AchillesZones,
};

/** Renders the figure a `figure` block names, or nothing if the id is unknown — a content
 *  file naming a figure that doesn't exist yet drops the drawing rather than the page. */
export function PlaybookFigure({ figureId }: { figureId: string }) {
  const Figure = FIGURES[figureId];
  return Figure ? <Figure /> : null;
}
