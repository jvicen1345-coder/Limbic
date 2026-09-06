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

const FIGURES: Record<string, () => React.ReactElement> = {
  "elevation-arithmetic": ElevationArithmetic,
  "restraint-by-angle": RestraintByAngle,
  "range-by-plane": RangeByPlane,
  "muscle-lengths": MuscleLengths,
  "coracoacromial-arch": CoracoacromialArch,
  "head-alignment": HeadAlignment,
  "force-couple": ForceCouple,
  "humerus-rotation": HumerusRotation,
};

/** Renders the figure a `figure` block names, or nothing if the id is unknown — a content
 *  file naming a figure that doesn't exist yet drops the drawing rather than the page. */
export function PlaybookFigure({ figureId }: { figureId: string }) {
  const Figure = FIGURES[figureId];
  return Figure ? <Figure /> : null;
}
