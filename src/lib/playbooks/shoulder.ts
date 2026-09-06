/**
 * The shoulder examination playbook — the first Limbic Playbook (see
 * lib/playbook-content.ts for the block types every field here uses, and
 * components/playbook/PlaybookFigures.tsx for the diagrams the `figure` blocks name).
 *
 * Ordered the way the examination is actually performed: posture and AROM, then PROM and
 * muscle length, then strength, then special tests, then palpation and treatment. Content
 * is standard musculoskeletal curriculum material — normative ranges, movement system
 * syndromes, and published test statistics — with the sourcing caveat in `footer` below.
 */

import type { Playbook } from "@/lib/playbook-content";

export const SHOULDER_PLAYBOOK: Playbook = {
  slug: "shoulder",
  name: "Shoulder Examination",
  title: "Shoulder Examination Playbook",
  eyebrow: "Musculoskeletal practice · examination & treatment",
  summary:
    "A full shoulder screen in the order you'd perform it: what each test is looking for, the number that separates normal from a finding, and the treatment that finding points to. Bring a goniometer.",
  stamp: [
    { value: "28", label: "exam items" },
    { value: "5", label: "movement syndromes" },
    { value: "3", label: "irritability levels" },
    { value: "1", label: "goniometer required" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "28 Items",
      title: "The examination sequence",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Twenty-eight items, in the order they're performed — posture and AROM first, then PROM and length, then strength, then special tests, then treatment. The last column is the finding itself: the number or observation that turns the test into information.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "flexion-arom",
              name: "Shoulder flexion AROM + critical events",
              how: "Stand behind/quadrant. Call the 4 critical events out loud as they happen.",
              finding: "Humeral head depression · GH ER · scapular upward rotation · scapular posterior tilt (+ thoracic ext)",
            },
            {
              id: "scapular-assist",
              name: "Scapular assist test",
              how: "Manually add upward rotation / adduction / posterior tilt during painful AROM.",
              finding: "Change in *quantity, quality, or symptoms* = positive",
            },
            {
              id: "arom-er-90",
              name: "AROM ER @ 90°",
              how: "Abduct to 90° with the elbow at 90° and take into external rotation. Watch *where the range comes from*: scapular posterior tilt, thoracic extension and rotation, scapular retraction, humeral head anterior translation.",
              finding:
                "**Normal:** ~90° of ER, equal to the other side, with the humeral head staying centred and the scapula posteriorly tilting.\n**Faulty:** the head translates anteriorly (distal humerus drops back) or the scapula retracts and anteriorly tilts to supply the range.\n**Throwers:** add IR to get the total arc — arc loss >5° or IR loss 10–25° vs the other side is GIRD, then screen proximally (single-leg stance, hip IR/ER, core, glute med).",
            },
            {
              // One checkable item covering both manoeuvres, as the source has it — a single
              // checkbox spanning two rows — rather than two items, which would change the
              // count the progress bar reads against.
              id: "hbh-hbb",
              name: "Functional AROM: hand behind head / hand behind back",
              how:
                "**Hand behind head** *(flexion + ER)*: stand behind the patient, palm to the back of the head. Measure the middle finger against the spinous process, both sides, then add overpressure at end range.\n**Hand behind back** *(IR + extension + adduction)*: the hand climbs from the lumbar spine as high up the back as it reaches. Overpressure: one hand on the scapula, the other on the forearm, body driving the elbow in.",
              finding:
                "**HBH:** symmetric side to side. Positive is clearly less reach, or symptoms with the overpressure — follow up with flexion and ER ROM.\n**HBB:** compare the level reached; follow up with extension and IR ROM — the back-pocket motion.",
            },
            {
              id: "prom-flexion",
              name: "PROM flexion — total & pure GH",
              how: "Supine. Total = let scapula move; pure = fixate scapula. Goni: axis greater tuberosity, stationary arm midline of trunk, moving arm lateral epicondyle.",
              finding: "Pure GH < 120° = limited → capsular EF = inferior capsule; muscular EF = teres major",
            },
            {
              id: "scapular-ur",
              name: "Scapular upward rotation PROM + treatment",
              how: "Sidelying. Cranial hand: thumb on coracoid, fingers on posterior scapula, blocks superior migration and anterior tilt. Caudal hand: catches inferior angle, drives upward rotation.",
              finding: "Normal 60° upward rotation",
            },
            {
              id: "prom-rotation",
              name: "PROM IR / ER + anterior glide comment",
              how: "ER: block anterior shoulder with your forearm. IR: 90° abd (45° if unable), stabilize scapula from anterior tilt, watch for scapular compensation.",
              finding: "Total arc 165–180°; GIRD = arc loss >5° or IR loss 10–25° vs opposite",
            },
            {
              id: "horizontal-adduction",
              name: "Horizontal adduction for posterior capsule",
              how: "Supine, 90/90. Stabilize scapula from passing the mid-axillary line, take to end feel, measure with goni.",
              finding: "Should *at least* reach elbow to nose/midline; less = tight",
            },
            {
              id: "pec-length",
              name: "Muscle length: pec minor & pec major",
              how: "Pec minor: measure posterior acromion to table. Pec major sternal: 120° abd + full ER; clavicular: 90° abd.",
              finding: "Pec minor ≤ 2.54 cm (1 in) · Sternal: arm touches table · Clavicular: arm even with table",
            },
            {
              id: "static-resisted",
              name: "Static resisted: IR, ER, abduction",
              how: "Seated, arm at side, you stabilize distal humerus. Abduction tested at 15°.",
              finding: "(+) decreased resistance from pain and/or weakness",
            },
            {
              id: "mmt-supra-infra",
              name: "MMT supraspinatus & infraspinatus",
              how: "Supra: 90° elevation in scapular plane. Infra: 0° scaption with 45° IR, push into IR.",
              finding: "Supra in IR = more EMG but more irritating; ER = less EMG, less irritating",
            },
            {
              id: "mmt-subscap",
              name: "Prone MMT subscapularis",
              how: "Hand behind back, lifted off spine, palm facing posterior; force into palm toward the spine.",
              finding: "Watch activation pattern and scapular compensation. Can be irritating — caution.",
            },
            {
              id: "mmt-traps",
              name: "MMT lower & middle trapezius",
              how: "Both: watch for excessive humeral head anterior translation; maintain retraction (lower trap adds posterior tilt).",
              finding: "Lower trap = retraction + upward rotation + posterior tilt + thoracic extension",
            },
            {
              id: "lat-length",
              name: "Muscle length latissimus dorsi",
              how: "End-range total GH flexion.",
              finding: "(+) muscular end feel with rib cage flaring / lumbar extension",
            },
            {
              id: "mmt-serratus",
              name: "MMT serratus anterior",
              how: "Sitting ~130° flexion, lead with thumb, press forward to encourage upward rotation + abduction.",
              finding: "75% force into shoulder extension + 25% into downward rotation at inferior angle; ends when scapula downwardly rotates",
            },
            {
              id: "sps-cluster",
              name: "Subacromial pain syndrome cluster — all 3",
              how: "Hawkins-Kennedy + painful arc + painful/weak resisted ER.",
              finding: "All 3 (+) → +LR 10.56 · all 3 (−) → −LR 0.17",
            },
            {
              id: "drop-arm",
              name: "Full-thickness supraspinatus tear",
              how: "Drop arm test: passive 90° abd + IR, hold, then lower slowly.",
              finding: "Sp 88, +LR 2.25 · (+) arm drops or no smooth eccentric control",
            },
            {
              id: "ir-lag",
              name: "Full-thickness subscapularis tear",
              how: "Internal rotation lag sign: hand behind back, you lift it off, patient holds.",
              finding: "Sp 96, Sn 97 · (+) can't keep hand off the back",
            },
            {
              id: "er-lag",
              name: "Full-thickness infraspinatus tear",
              how: "ER lag sign: elbow 90°, shoulder abducted 20°, max ER, patient holds.",
              finding: "(+) arm falls into internal rotation",
            },
            {
              id: "apprehension",
              name: "Anterior instability — apprehension / relocation",
              how: "Supine 90/90 on your thigh, palpate anterior shoulder, take into ER; back off, add posterior glide, re-enter ER.",
              finding: "(+) apprehension or fear (not pain) that eases with the posterior glide",
            },
            {
              id: "biceps-load",
              name: "SLAP tear",
              how: "Biceps Load II: 120° abd, elbow 90°, forearm supinated, end-range ER, resist elbow flexion.",
              finding: "Sn 90, Sp 97, +LR 26.38, −LR 0.11 · (+) deep shoulder pain",
            },
            {
              id: "palpation",
              name: "Palpation of the RTC tendons",
              how: "Deltopectoral triangle → bicipital groove at 20° IR → ER to lesser tubercle (subscap) → more IR to greater tubercle (supra) → infraspinatus in flexion/adduction/IR.",
              finding: "Use active rotation to bring each tendon under your finger",
            },
            {
              id: "posterior-glide",
              name: "GH posterior glide — assess & treat by irritability",
              how: "Open packed ~50° abd, slight horizontal adduction + ER; hand lateral to coracoid; force **posterolateral**.",
              finding: "For limited IR / horizontal adduction with capsular end feel",
            },
            {
              id: "inferior-glide",
              name: "GH inferior glide — assess & treat by irritability",
              how: "Wedge/towel blocks scapula & acromion but not the humeral head; hand lateral to acromion; force inferior with slight lateral component; drive from hips.",
              finding: "For limited flexion / abduction with capsular end feel",
            },
            {
              id: "ex-flexion",
              name: "Exercise: flexion ROM, high vs low irritability",
              how: "High: supported/pain-free AAROM, high reps, patient-controlled. Low: sustained end-range, maximize total end-range time.",
              finding: "Reassess after each round of 3 bouts",
            },
            {
              id: "ex-ir",
              name: "Exercise: IR ROM, high vs low irritability",
              how: `Supine IR keeping the humeral head from popping up — cue "swivel around an axis." Low: add horizontal adduction stretch for posterior capsule.`,
              finding: "Motion must be spin, not anterior glide",
            },
            {
              id: "ex-er",
              name: "Exercise: ER ROM, high vs low irritability",
              how: "Prone ER: synchronize finger extension → wrist extension as the arm swivels laterally. Avoid lat and deltoid compensation.",
              finding: "High: pain-free AAROM only. Low: end-range holds.",
            },
            {
              id: "ex-posterior-tilt",
              name: "Exercise: scapular posterior tilt + thoracic extension",
              how: "Load lower trap / serratus with the thorax extended; keep elbow in front of the mid-axillary line during functional retraining.",
              finding: "Scapular upward rotation is what keeps the cuff out of impingement",
            },
          ],
        },
      ],
    },
    {
      id: "numbers",
      navLabel: "Numbers",
      title: "Numbers worth knowing cold",
      blocks: [
        { kind: "lede", text: "The arthrokinematics and normative values the rest of the examination is measured against." },
        {
          kind: "numbers",
          cells: [
            { value: "2 : 1", label: "Scapulohumeral rhythm — 2° GH for every 1° scapular" },
            { value: "120° + 60°", label: "GH abduction + scapular upward rotation = 180° elevation" },
            { value: "first 30°", label: "Of elevation is mostly humeral (setting phase)" },
            { value: "35–40°", label: "GH external rotation during full elevation" },
            { value: "25° / 25° / 20°", label: "SC joint elevation / posterior rotation / retraction" },
            { value: "30° & 20°", label: "AC joint upward rotation & posterior tilt (0–5° ER)" },
            { value: "6° → 22–23°", label: "Scapular posterior tilt: 6° in first 90°, +16° after" },
            { value: "5°", label: "Superior tilt of the glenoid (passive stability)" },
            { value: "T2 – T7", label: "Scapula on the thorax: superior angle T2, root of the *scapular* spine T3, inferior angle T7" },
            { value: "2.5–3 in", label: "Vertebral border to the spine, borders parallel to it or slightly upwardly rotated" },
            { value: "30° & 9°", label: "At rest the scapula sits 30° anterior to the frontal plane — the scapular plane — with 9° of anterior tilt" },
            { value: "> 15–20°", label: "Scapular internal rotation beyond this is excessive — medial border lifts; palpate the triangle below the scapular spine" },
            { value: "> ⅓", label: "Of humeral head anterior to acromion = anterior glide" },
            { value: "≤ ½ in", label: "Inferior angle protrusion past posterolateral thorax in full elevation" },
            { value: "165–180°", label: "Normal total arc of IR + ER" },
            { value: "2.54 cm", label: "Pec minor length — acromion to table" },
            { value: "> 1 in", label: "Lateral translation of scapular border in passive flexion = short teres major" },
            { value: "2%", label: "Of shoulder dislocations are posterior" },
            { value: "60–120°", label: "Where a painful arc lives during abduction" },
            { value: "~50°", label: "Abduction for the open-packed position used in mobilization" },
          ],
        },
        {
          kind: "figure",
          figureId: "elevation-arithmetic",
          title: "Where 180° of elevation comes from",
          caption:
            "**The scapular 60° is not a single joint.** Sternoclavicular elevation (25°) and acromioclavicular upward rotation (30°) add up to the scapulothoracic contribution. The SC joint also retracts 20° and posteriorly rotates 25°; the scapula posteriorly tilts a total of 22–23° and externally rotates. Say the arithmetic, not just the ratio.",
        },
        {
          kind: "figure",
          figureId: "restraint-by-angle",
          title: "Which restraint is loaded at which angle",
          caption:
            "**Read the arc as the arm rising.** The restraint that matters changes with the angle, which is why an apprehension test is done at 90° and why a patient can feel stable at their side and unstable overhead. The posterior capsule is thinner than the anterior capsule throughout — stiffness there shows up as lost internal rotation.",
        },
      ],
    },
    {
      id: "posture",
      navLabel: "Posture",
      title: "Posture → the measurement it obligates",
      blocks: [
        {
          kind: "lede",
          text: "Ask about resting pain first. Every postural fault you name commits you to a follow-up test — that link is what turns an observation into a hypothesis.",
        },
        {
          kind: "table",
          columns: ["View", "Normal", "Faulty"],
          rows: [
            [
              { text: "Front", variant: "name" },
              "Level iliac crests & shoulder height; clavicle with slight upward slope in men; antecubital creases face anteriorly, palms face the body",
              "Medially rotated humerus — differentiate humeral from scapular fault by re-checking humeral alignment *with the scapula corrected*",
            ],
            [
              { text: "Side", variant: "name" },
              "Plumbline bisects acromion; scapula flat on thorax, 30° medial rotation, 9° anterior tilt; distal humerus in line with proximal; ≤ ⅓ of humeral head in front of acromion",
              "Distal humerus posterior → anterior translation of head; superior (head too close to acromion); inferior (subluxation)",
            ],
            [
              { text: "Back", variant: "name" },
              "Scapula between T2 and T7, borders 2½–3 in from spine and parallel, held flat on thorax",
              "Anterior tilt · abducted/winging · downwardly rotated · depressed",
            ],
          ],
        },
        { kind: "heading", text: "The obligated follow-up" },
        {
          kind: "table",
          columns: ["Postural finding", "Then you must measure"],
          rows: [
            [{ text: "Thoracic kyphosis", variant: "name" }, "Thoracic extension AROM · pec minor length · lower trap strength"],
            [{ text: "Scapular protraction / IR", variant: "name" }, "Pec major length · shoulder IR PROM · middle and lower trap strength"],
            [{ text: "Scapular anterior tilt", variant: "name" }, "Pec minor length · lower trap strength · serratus anterior strength"],
            [{ text: "Clavicular depression", variant: "name" }, "Latissimus dorsi length · serratus anterior strength · upper trap strength"],
            [{ text: "Scapular winging", variant: "name" }, "Serratus anterior strength"],
          ],
        },
      ],
    },
    {
      id: "arom",
      navLabel: "AROM",
      title: "The four critical events of elevation",
      blocks: [
        {
          kind: "lede",
          text: "Baseline, quality, quantity, symptom reproduction. Name each event as you see it fail, then name the tissue it implicates — that pairing is the whole assessment.",
        },
        {
          kind: "table",
          columns: ["Event", "What you watch", "If it fails, consider"],
          rows: [
            [
              { text: "1 · Humeral head depression", variant: "name" },
              "Divot at the superior shoulder; skin creases and head-to-neck distance",
              "Rotator cuff integrity, inferior capsule mobility. Without the cuff, the deltoid migrates the head superiorly and the greater tuberosity meets the acromial undersurface.",
            ],
            [
              { text: "2 · Glenohumeral ER", variant: "name" },
              "Does the arm stay in the sagittal plane and in ER?",
              "Latissimus dorsi and teres major length",
            ],
            [
              { text: "3 · Scapular upward rotation", variant: "name" },
              "60° available; inferior angle should reach the mid-axillary line at end range",
              "PROM limited by levator scap, rhomboids, pec minor; strength of lower trap and **serratus anterior**",
            ],
            [
              { text: "4 · Scapular posterior tilt", variant: "name" },
              "Posterior tilt + adduction at end range of humeral elevation",
              "Pec minor length; serratus anterior and lower trap strength",
            ],
            [
              { text: "+ Thoracic extension", variant: "name" },
              `"The flatter the better"`,
              "T-spine extension AROM, lower trap / thoracic extensor strength",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Other normals during AROM:",
          body: "minimal scapular abduction, no winging, no excessive elevation, no excessive medial rotation during flexion, and the humeral axis of rotation stays relatively constant.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Scapular assist test",
          body: "— if symptoms appear with AROM, manually supply upward rotation, adduction, and posterior tilt. You are looking for a change in *quantity, quality, or symptoms*. A positive test is also your treatment direction.",
        },
      ],
    },
    {
      id: "prom",
      navLabel: "PROM & Length",
      title: "PROM, end feel, and muscle length",
      blocks: [
        {
          kind: "lede",
          text: "Quality, quantity, symptom reproduction, *end feel*. End feel is what routes you: capsular → joint mobilization; muscular → length work.",
        },
        { kind: "heading", text: "Every motion, and what limits it" },
        {
          kind: "table",
          columns: ["Motion", "Normal", "Position & goniometer", "End feel", "First suspects when it's short"],
          rows: [
            [
              { text: "Flexion", variant: "name" },
              { text: "0–180°", variant: "num" },
              "Supine. Axis greater tuberosity · stationary arm midline of trunk · moving arm lateral epicondyle",
              "Firm",
              "Inferior capsule, teres major, latissimus, or scapular upward rotation — see the flexion sort below",
            ],
            [
              { text: "Extension", variant: "name" },
              { text: "0–60°", variant: "num" },
              "Prone or standing. Axis greater tuberosity · stationary arm mid-axillary line of the trunk · moving arm lateral epicondyle",
              "Firm",
              "Anterior capsule, clavicular pec major, anterior deltoid. This is the motion behind hand-behind-back, a back pocket, and reaching into the back seat.",
            ],
            [
              { text: "Abduction", variant: "name" },
              { text: "0–180°", variant: "num" },
              "Supine, stay in plane. Axis head of humerus · stationary arm parallel to the sternum · moving arm parallel to the humeral midshaft",
              "Firm",
              "Inferior capsule (inferior glide), scapular upward rotation; mid-range pain is subacromial, not a mobility loss",
            ],
            [
              { text: "Adduction", variant: "name" },
              { text: "0–75°", variant: "num" },
              "Across the front of the body, with slight flexion to clear the trunk",
              "Soft or firm",
              "Rarely the problem in isolation — check the posterior deltoid",
            ],
            [
              { text: "ER at 90° abduction", variant: "name" },
              { text: "0–90°", variant: "num" },
              "Supine, block the anterior shoulder with your forearm. Axis olecranon · stationary arm vertical · moving arm ulnar styloid",
              "Firm",
              "Subscapularis, pec major, anterior capsule. Watch that the range is not coming from an anterior glide of the head.",
            ],
            [
              { text: "IR at 90° abduction", variant: "name" },
              { text: "0–70°", variant: "num" },
              "Same set-up (45° abduction if 90 is unavailable). Stabilize the scapula against anterior tilt",
              "Firm",
              "Posterior capsule (capsular EF) or posterior cuff (muscular EF) — this is where GIRD shows up",
            ],
            [
              { text: "ER at the side", variant: "name" },
              { text: "0–60–70°", variant: "num" },
              "Arm adducted, elbow 90°",
              "Firm",
              "Subscapularis if it opens up at 90° abduction; otherwise anterior capsule",
            ],
            [
              { text: "IR behind the back", variant: "name" },
              "Hand climbs from the lumbar spine as high as it can reach; compare the level side to side",
              "Standing. Measure the thumb tip against the spinous process it reaches, both sides",
              "Firm",
              "Internal rotation with extension and adduction — a stiff posterior or inferior capsule, a short subscapularis, or pain shutting it down. Add overpressure to confirm.",
            ],
            [
              { text: "Horizontal adduction", variant: "name" },
              { text: "0–130°", variant: "num" },
              "Supine 90/90; scapula stabilized from crossing the mid-axillary line. Elbow should at least reach the midline.",
              "Firm",
              "Posterior capsule and posterior cuff — the single best window on the tissue that drives most shoulders",
            ],
            [
              { text: "Horizontal abduction", variant: "name" },
              { text: "0–45°", variant: "num" },
              "Supine at 90° abduction, arm off the table edge",
              "Firm",
              "Pec major and the anterior capsule — this is the pec major length test in disguise",
            ],
            [
              { text: "Total rotation arc", variant: "name" },
              { text: "165–180°", variant: "num" },
              "IR + ER measured at 90° abduction, added",
              "—",
              "Arc loss >5° vs the other side, or IR loss of 10–25°, defines GIRD",
            ],
            [
              { text: "Scapular upward rotation", variant: "name" },
              { text: "60°", variant: "num" },
              "Sidelying PROM, scapula neutral",
              "Firm",
              "Pec minor, levator scapulae, rhomboids — or, if PROM is full, serratus and lower trap strength",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Norms are a starting point, not the finding.",
          body: "Published values differ between sources by 10–15°, and shoulders differ more than that between people. The comparison that carries weight is the uninvolved side, and after that the direction of the loss: an isolated IR and horizontal adduction loss says something specific, while a loss in every direction says capsule.",
        },
        {
          kind: "figure",
          figureId: "range-by-plane",
          title: "The full range, by plane",
          caption:
            "**Each dial starts from anatomical neutral.** The thick spoke is the starting position — arm at the side for the first two, forearm vertical for the third. Only the transverse dial is measured with the shoulder already at 90° of abduction, which is why its two arcs get added together into the total arc that GIRD is defined against.",
        },
        { kind: "heading", text: "The measures this examination takes" },
        {
          kind: "table",
          columns: ["Measure", "Set-up & goniometer", "Interpretation"],
          rows: [
            [
              { text: "Total flexion", variant: "name" },
              "Supine. Axis greater tuberosity · stationary arm midline of trunk · moving arm lateral epicondyle. Watch thorax and lumbar compensation.",
              "Limited → reassess posterior capsule, teres major/lat length, scapular upward rotation",
            ],
            [
              { text: "Pure GH flexion", variant: "name" },
              "Scapula fixated",
              {
                text: "<120° + capsular EF → inferior capsule · <120° + muscular EF → teres major. Normal total with excessive GH motion → suspect scapular upward rotation deficit.",
                variant: "num",
              },
            ],
            [
              { text: "Abduction", variant: "name" },
              "Supine, stay in plane. Axis head of humerus · stationary arm parallel to sternal midline · moving arm parallel to humeral midshaft.",
              "Treat with inferior glide",
            ],
            [
              { text: "External rotation", variant: "name" },
              "Supine, block the anterior shoulder with your forearm to prevent anterior glide; hand under the elbow.",
              "Pairs with apprehension test; anterior glide mob if limited",
            ],
            [
              { text: "Internal rotation", variant: "name" },
              "90° abd (45° if unavailable). Axis olecranon · stationary arm vertical · moving arm to ulnar styloid. Stabilize scapula from anterior tilt.",
              "Capsular EF → AP glide joint play. Muscular EF → posterior cuff. Treat with posterior glide.",
            ],
            [
              { text: "Horizontal adduction", variant: "name" },
              "Supine 90/90; stop the scapula from crossing the mid-axillary line; measure to end feel.",
              "Tightness = posterior capsule, which drives the IR and flexion loss",
            ],
            [
              { text: "Scapular upward rotation PROM", variant: "name" },
              "Sidelying, scapula neutral, watch excessive protraction",
              { text: "60° normal. Limited AROM with normal PROM → strength / motor control, not mobility.", variant: "num" },
            ],
          ],
        },
        { kind: "heading", text: "Muscle length — read against a landmark, not a feeling" },
        {
          kind: "lede",
          text: "Every one of these tests fails the same way: the thorax or scapula moves and hands you range the muscle does not have. Fix the proximal segment first, then read the distal one against something that cannot move — the table, the spine, the acromion.",
        },
        {
          kind: "table",
          columns: ["Muscle", "Position & what you stabilize", "Normal", "Short means", "What fakes a result"],
          rows: [
            [
              { text: "Pectoralis minor", variant: "name" },
              "Supine, arms at sides. Your palm on the coracoid pushing posterolateral, feeling for stiffness. Measure **posterior** acromion to table.",
              { text: "≤ 2.54 cm (1 in)\ncompare sides", variant: "num" },
              "Scapular anterior tilt and internal rotation; blocks posterior tilt and upward rotation, narrowing the subacromial space",
              "Thorax rotating away from you; measuring the lateral tip of the acromion instead of the posterior aspect",
            ],
            [
              { text: "Pec major — sternal fibers", variant: "name" },
              "Supine. Uninvolved arm across the chest as a barrier; your forearm over the patient's arm to stabilize the thorax. Passive 120° abduction with full ER, let the arm fall.",
              "Arm touches the table",
              "Limits horizontal abduction and ER in elevation; travels with a protracted, internally rotated scapula",
              "Lumbar extension or the thorax lifting off the table — that is the range you would be measuring",
            ],
            [
              { text: "Pec major — clavicular fibers", variant: "name" },
              "Same set-up, passive 90° abduction, let the arm fall.",
              "Arm even with the height of the table",
              "Shoulder rests protracted and anterior; limits horizontal abduction at 90°",
              "Same as above; also letting the shoulder shrug into elevation",
            ],
            [
              { text: "Latissimus dorsi", variant: "name" },
              "End-range total GH flexion. Watch the rib cage and lumbar spine, not the arm.",
              "Full flexion without the trunk giving way",
              "Limits flexion; depresses and downwardly rotates the scapula — the muscle behind a depressed clavicle",
              "An uncontrolled lumbar spine. Bend the knees and keep a hand on the ribs, or you are measuring lumbar extension.",
            ],
            [
              { text: "Teres major", variant: "name" },
              "Passive flexion while you watch the lateral border of the scapula; then pure GH flexion with the scapula fixed.",
              { text: "Lateral translation ≤ 1 in\npure GH flexion ≥ 120°", variant: "num" },
              "Early scapular abduction with elevation; the scapula gets dragged along by the humerus",
              "Confusing it with latissimus — lat flares the ribs, teres major translates the scapula laterally",
            ],
            [
              { text: "Subscapularis", variant: "name" },
              "Measure passive ER with the arm at the side, then again at 90° abduction.",
              "Comparable range in both positions",
              "Limits ER at the side; travels with the anterior glide pattern",
              "An anterior glide of the humeral head buying you false ER — block the anterior shoulder with your forearm",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Reading the subscapularis test:",
          body: "limited at the side but full at 90° abduction is the positive. Limited in *both* positions, or full in both, is negative — that pattern is capsular or nothing at all.",
        },
        {
          kind: "figure",
          figureId: "muscle-lengths",
          title: "Three lengths measured against the table and the spine",
          caption: `**All three are distances, not sensations.** Pec minor is a gap you measure with a ruler; pec major is a yes/no against the plane of the table; teres major is how far the scapula gets dragged sideways before the humerus finishes moving. Anything you have to describe as "feels tight" has not been tested yet.`,
        },
        { kind: "heading", text: "Limited flexion — which structure is it?" },
        {
          kind: "lede",
          text: "Four different tissues produce the same complaint. Two findings separate them: whether the restriction survives fixing the scapula, and what the end feel is.",
        },
        {
          kind: "table",
          columns: ["Pure GH flexion (scapula fixed)", "End feel", "Other finding", "Structure", "Treat with"],
          rows: [
            [
              { text: "< 120°", variant: "num" },
              "Capsular",
              "Limited inferior glide joint play",
              { text: "Inferior capsule", variant: "name" },
              "Inferior glide mobilization, graded to irritability",
            ],
            [
              { text: "< 120°", variant: "num" },
              "Muscular",
              "Lateral scapular translation > 1 in",
              { text: "Teres major", variant: "name" },
              "Soft tissue mobilization, tack and stretch, sidelying",
            ],
            [
              { text: "≥ 120°", variant: "num" },
              "Muscular at end range of *total* flexion",
              "Rib flaring, lumbar extension",
              { text: "Latissimus dorsi", variant: "name" },
              "Length work with the lumbar spine controlled",
            ],
            [
              { text: "Normal", variant: "num" },
              "—",
              "Scapula fails to reach 60° upward rotation; inferior angle short of the mid-axillary line",
              { text: "Scapular upward rotation", variant: "name" },
              "PROM limited → scapulothoracic mobilization. PROM normal → serratus and lower trap strength.",
            ],
          ],
        },
        {
          kind: "table",
          columns: ["Also limited?", "Capsular end feel", "Muscular end feel"],
          rows: [
            [
              { text: "Internal rotation", variant: "name" },
              "Posterior capsule → posterior glide, then active IR in the new range",
              "Posterior rotator cuff → soft tissue work and horizontal adduction stretch",
            ],
            [
              { text: "Horizontal adduction", variant: "name" },
              "Posterior capsule → posterior glide; confirm with AP joint play",
              "Posterior cuff and teres major → tack and stretch in sidelying",
            ],
            [
              { text: "External rotation at the side", variant: "name" },
              "Anterior capsule → anterior glide in ER",
              "Subscapularis if full at 90° abduction; pec major if the arm will not fall to the table",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Stiffness or shortness?",
          body: "If the range improves within the session, you were dealing with relative stiffness and the fix is mobility plus motor control. If it does not budge after a full round of mobilization and reassessment, genuine shortness is the issue and the timeline is longer.",
        },
      ],
    },
    {
      id: "mmt",
      navLabel: "MMT",
      title: "MMT positions — max EMG, per Kelly et al.",
      blocks: [
        {
          kind: "table",
          columns: ["Muscle", "Position", "Resistance", "Watch"],
          rows: [
            [
              { text: "Supraspinatus", variant: "name" },
              "90° elevation in the scapular plane",
              "Into adduction",
              "[[pill:h|Irritating]] IR = more EMG but more irritating; ER = less EMG, gentler",
            ],
            [{ text: "Teres minor", variant: "name" }, "90° scaption with 90° ER", "Push into IR", "—"],
            [{ text: "Infraspinatus", variant: "name" }, "0° scaption with 45° IR", "Push into IR", "—"],
            [
              { text: "Subscapularis", variant: "name" },
              "Hand behind back, lifted off the spine, palm facing posterior",
              "Into the palm, toward the spine",
              "[[pill:h|Irritating]] Assess activation pattern and scapular compensation",
            ],
            [
              { text: "Lower trapezius", variant: "name" },
              "Retraction with posterior tilt maintained",
              "—",
              "Excessive humeral head anterior translation. Best muscle for retraction + upward rotation + posterior tilt + T-spine extension.",
            ],
            [{ text: "Middle trapezius", variant: "name" }, "Maintain retraction", "—", "Excessive humeral head anterior translation"],
            [
              { text: "Serratus anterior", variant: "name" },
              "Sitting ~130° flexion, leading with the thumb, pressing forward",
              "75% into shoulder extension + 25% into scapular downward rotation at the inferior angle",
              "Test ends when the scapula downwardly rotates",
            ],
          ],
        },
        { kind: "heading", text: "Static resisted tests (seated, arm at side, you stabilize the distal humerus)" },
        {
          kind: "table",
          columns: ["Direction", "Tests", "Note"],
          rows: [
            [{ text: "External rotation", variant: "name" }, "Infraspinatus & teres minor", "Resist into IR; part of the SPS cluster"],
            [
              { text: "Internal rotation", variant: "name" },
              "Subscapularis",
              "Resist outward into ER. Highly specific, moderately sensitive for impingement.",
            ],
            [
              { text: "Abduction", variant: "name" },
              "Supraspinatus",
              "Abduct 15°, stabilize the top of the shoulder, apply adduction force",
            ],
          ],
        },
      ],
    },
    {
      id: "special",
      navLabel: "Special Tests",
      title: "Special tests, grouped by the question they answer",
      blocks: [
        {
          kind: "statkey",
          entries: [
            {
              abbr: "Sn",
              term: "Sensitivity.",
              body: "How often the test comes up positive in people who do have the condition. A very sensitive test that comes back negative helps rule the condition out.",
            },
            {
              abbr: "Sp",
              term: "Specificity.",
              body: "How often it comes back negative in people who do not have it. A very specific test that comes back positive helps rule the condition in.",
            },
            {
              abbr: "+LR",
              term: "Positive likelihood ratio.",
              body: "How far a positive result should shift your suspicion. Over 10 is a large shift, 5–10 moderate, 2–5 small, around 1 changes nothing.",
            },
            {
              abbr: "−LR",
              term: "Negative likelihood ratio.",
              body: "How far a negative result argues against it. Under 0.1 is a large shift, 0.1–0.2 moderate, 0.2–0.5 small, around 1 changes nothing.",
            },
          ],
          note: "Both ratios come from the same two numbers: +LR is Sn ÷ (1 − Sp), and −LR is (1 − Sn) ÷ Sp. Most single tests land in the small range, which is the whole argument for using clusters.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Subacromial pain syndrome.",
          body: "Any 3 of 5 positives suggests SPS: painful arc, Neer's, Hawkins-Kennedy, pain/weakness with resisted ER, empty can. The *most predictive* cluster is Hawkins-Kennedy + painful arc + painful/weak resisted ER — all three positive gives +LR 10.56, all three negative gives −LR 0.17. Run all three before you commit to the diagnosis.",
        },
        {
          kind: "table",
          columns: ["Test", "What it compresses or contracts", "Set-up", "Positive", "Stats"],
          rows: [
            { group: "Compression under the coracoacromial arch" },
            [
              { text: "Painful arc", variant: "name" },
              {
                text: "**Supraspinatus tendon + subacromial bursa**, pinched between the rising greater tuberosity and the undersurface of the acromion",
                variant: "tissue",
              },
              "Active abduction; note *where* in the range, not just that it hurts",
              "Pain through the middle of the arc — roughly 60–120° — easing above and below it",
              { text: "cluster", variant: "num" },
            ],
            [
              { text: "Neer's", variant: "name" },
              {
                text: "**Supraspinatus tendon + bursa** driven under the *anterolateral* acromion; long head of biceps often shares the space",
                variant: "tissue",
              },
              "Passive full flexion held in IR; add OP with one hand on the scapula and the other in the axilla",
              "Reproduction of symptoms",
              { text: "—", variant: "num" },
            ],
            [
              { text: "Hawkins-Kennedy", variant: "name" },
              {
                text: "**Supraspinatus tendon** pressed against the *coracoacromial ligament* and the coracoid — the medial corner of the same roof",
                variant: "tissue",
              },
              "Flexion to 90° + horizontal adduction, stabilize the top of the shoulder, internally rotate",
              "Limited range or shoulder pain",
              { text: "cluster", variant: "num" },
            ],
            [
              { text: "Full can / empty can", variant: "name" },
              {
                text: "**Supraspinatus** as a contractile unit — empty can adds IR, which also tucks the tuberosity under the acromion",
                variant: "tissue",
              },
              "90° scaption thumbs up, resist; then thumbs down, retest",
              "Weaker or more painful in the empty can position",
              { text: "Not specific alone", variant: "num" },
            ],
            [
              { text: "Resisted ER", variant: "name" },
              { text: "**Infraspinatus + teres minor**, contractile", variant: "tissue" },
              "Seated, arm at side, you stabilize the distal humerus; resist into IR",
              "Pain or give-way weakness",
              { text: "cluster", variant: "num" },
            ],
            [
              { text: "Resisted IR", variant: "name" },
              { text: "**Subscapularis**, contractile", variant: "tissue" },
              "Same position; resist outward into ER",
              "Pain or weakness",
              { text: "Highly Sp, moderately Sn", variant: "num" },
            ],
            [
              { text: "Resisted abduction", variant: "name" },
              { text: "**Supraspinatus**, contractile, at the angle where the tendon is least shortened", variant: "tissue" },
              "Abduct 15°, stabilize the top of the shoulder, apply an adduction force",
              "Pain or weakness",
              { text: "—", variant: "num" },
            ],
            { group: "Full-thickness tear — which tendon is gone" },
            [
              { text: "Drop arm", variant: "name" },
              { text: "**Supraspinatus** under eccentric load, with infraspinatus assisting the lower", variant: "tissue" },
              "Passive 90° abduction + IR, patient holds, then lowers slowly",
              "Arm drops, or loses smooth eccentric control",
              { text: "Sp 88 · +LR 2.25", variant: "num" },
            ],
            [
              { text: "ER lag sign", variant: "name" },
              { text: "**Infraspinatus** (posterior supraspinatus contributes at this angle)", variant: "tissue" },
              "Elbow 90°, shoulder abducted 20°, maximal ER, patient holds",
              "Arm falls back into internal rotation",
              { text: "—", variant: "num" },
            ],
            [
              { text: "Hornblower's sign", variant: "name" },
              { text: "**Teres minor**, with infraspinatus — the ER pair that fails last", variant: "tissue" },
              "90° scaption, elbow 90°, ER against resistance",
              "Cannot externally rotate; may abduct to compensate",
              { text: "Sp 95 · Sn 92", variant: "num" },
            ],
            [
              { text: "IR lag sign", variant: "name" },
              { text: "**Subscapularis** — the only cuff muscle that can hold the hand off the back", variant: "tissue" },
              "Hand behind back, examiner lifts it off, patient holds",
              "Cannot keep the hand off the back; pain",
              { text: "Sp 96 · Sn 97", variant: "num" },
            ],
            { group: "Biceps and labrum" },
            [
              { text: "Speed's", variant: "name" },
              {
                text: "**Long head of biceps tendon** in the intertubercular groove, and the pulley that holds it there",
                variant: "tissue",
              },
              "90° flexion, elbow extended, forearm supinated; resist while palpating the tendon",
              "Pain, popping or crepitus at the groove",
              { text: "Sn 90", variant: "num" },
            ],
            [
              { text: "Biceps Load II", variant: "name" },
              { text: "**Superior labrum at the biceps anchor** — the long head pulls directly on the lesion", variant: "tissue" },
              "120° abduction, elbow 90°, forearm supinated, end-range ER; resist elbow flexion",
              "Deep shoulder pain with the resisted flexion",
              { text: "Sn 90 · Sp 97 · +LR 26.38 · −LR 0.11", variant: "num" },
            ],
            [
              { text: "Sulcus sign", variant: "name" },
              {
                text: "**Superior capsule and rotator interval** resisting inferior translation; a resting sulcus also suggests a torn superior labrum",
                variant: "tissue",
              },
              "Seated, grasp the elbow, inferior traction; measure acromion to humeral head in cm; repeat supine at 20° abduction",
              "Visible sulcus / inferior laxity",
              { text: "Sp 93 · +LR 2.43", variant: "num" },
            ],
            { group: "Instability and internal impingement" },
            [
              { text: "Anterior apprehension + relocation", variant: "name" },
              {
                text: "**Anterior capsulolabral complex** — anterior band of the inferior GHL and the anterior labrum, the restraints that matter at 90°",
                variant: "tissue",
              },
              "Supine 90/90 resting on your thigh; palpate anteriorly, take into ER; back off, add a posterior glide, re-enter ER",
              "Apprehension or fear — not pain — that settles with the posterior glide",
              { text: "—", variant: "num" },
            ],
            [
              { text: "Posterior impingement [[pill:a|same manoeuvre]]", variant: "name" },
              {
                text: "**Undersurface of the posterior cuff** pinched against the posterosuperior glenoid labrum — internal impingement, the throwing shoulder's version",
                variant: "tissue",
              },
              "As above, but you are listening for where the pain is",
              "Posterior pain, relieved by the posterior glide",
              { text: "—", variant: "num" },
            ],
            [
              { text: "Posterior apprehension", variant: "name" },
              { text: "**Posterior capsule and labrum**", variant: "tissue" },
              "Supine, 90° flexion, elbow 90°, IR; axial compressive force through the GH joint",
              "Pain and apprehension",
              { text: "—", variant: "num" },
            ],
            { group: "Acromioclavicular joint" },
            [
              { text: "AC shear", variant: "name" },
              { text: "**AC joint capsule and intra-articular disc**", variant: "tissue" },
              "Cupped hands over the clavicle and the spine of the scapula, squeeze",
              "Local pain at the joint line, not referred",
              { text: "—", variant: "num" },
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "coracoacromial-arch",
          title: "What is actually being pinched",
          caption:
            "**One roof, two corners.** The acromion and the coracoacromial ligament running down to the coracoid form the arch; the bursa and the supraspinatus tendon are the soft tissue caught underneath as the greater tuberosity rises. **Neer's** drives the tuberosity under the anterolateral acromion. **Hawkins-Kennedy** adds horizontal adduction, pressing the same tendon against the coracoacromial ligament and coracoid instead — same tissue, different corner, which is why the two tests do not always agree. Anything that lets the head migrate superiorly (a failing cuff) or lets the scapula stop rotating upward (a weak serratus or lower trap) shrinks this space before any tendon is torn.",
        },
        {
          kind: "footnote",
          text: "Tissue attributions are standard shoulder anatomy rather than quotations from any one protocol; the set-ups, positives and statistics are as given in the source material.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Raise your suspicion of a full-thickness cuff tear",
          body: "when three things line up: age over 65, pain at night, and weakness with ER.",
        },
      ],
    },
    {
      id: "syndromes",
      navLabel: "Syndromes",
      title: "Movement system diagnoses",
      blocks: [
        {
          kind: "lede",
          text: "Kinesiopathology: suboptimal alignment and movement *induce* pathology. The syndrome is named for the movement fault, the body takes the path of least resistance, and relative stiffness — not true shortness — is usually the culprit.",
        },
        {
          kind: "table",
          columns: ["Syndrome", "What you see", "Why it happens", "Where you start"],
          rows: [
            [
              { text: "Decreased scapular upward rotation", variant: "name" },
              "Scapula fails to reach 60° upward rotation with elevation; inferior angle never reaches the mid-axillary line",
              "Weak serratus anterior / lower trap; length restriction in levator scap, rhomboids, pec minor",
              "Scapular assist → upward rotation PROM/mobilization if hypomobile; strength & motor control if PROM is normal",
            ],
            [
              { text: `Increased scapular internal rotation [[pill:a|was "winging"]]`, variant: "name" },
              "Medial border lifted; palpate the triangle inferior to the scapular spine",
              "Excessive scapulohumeral activation (posterior deltoid, hypertrophied teres major pulling the scapula toward the humerus — think lat pull-downs); weak serratus; deltoid or capsule stiffer than serratus",
              "Train serratus; reduce the scapulohumeral dominance",
            ],
            [
              { text: "Increased scapular anterior tilt", variant: "name" },
              "Insufficient scapular ER and posterior tilt when lifting the arm; excessive IR with anterior tilt on the way down. IR + anterior tilt = winging.",
              "Stiff deltoid, stiff pec major, weak lower trap / serratus",
              "Posterior tilt and thoracic extension work; pec minor length",
            ],
            [
              { text: "Humeral anterior glide", variant: "name" },
              "More than ⅓ of the humeral head anterior to the acromion; shoulder may sit in extension",
              "Lax anterior capsule, weak subscapularis, stiff posterior capsule / external rotators. Typical in racquet, throwing, volleyball, swimming athletes with general laxity.",
              "1 · supine IR with a correct movement pattern, lengthening the ERs · 2 · horizontal adduction stretch for the posterior capsule · 3 · subscapularis strengthening",
            ],
            [
              { text: "Humeral superior glide", variant: "name" },
              "Decreased space between the humeral head and the acromion",
              "Loss of the deltoid–cuff force couple; the deltoid migrates the head superiorly",
              "Restore humeral head depression; cuff work below the impingement range",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "head-alignment",
          title: "Resting humeral head alignment, viewed from the side",
          caption:
            "**The dotted line drops from the anterior tip of the acromion.** Shade in how much of the head sits in front of it — more than a third is the anterior glide finding, and the same patient often stands with the shoulder in slight extension. Superior glide is the vertical version of the same problem: the head has lost its inferior seat under the acromion.",
        },
        { kind: "heading", text: "The relative-stiffness cascade" },
        {
          kind: "callout",
          tone: "note",
          body: "Rotator cuff overuse → posterior shoulder extensibility loss → loss of posterior humeral glide → excessive anterior tissue stress → anterior microinstability → **SLAP tear**. This is why posterior capsule tightness is treated as an upstream problem, not a side finding.",
        },
        { kind: "heading", text: "Force couples worth reciting" },
        {
          kind: "table",
          columns: ["Couple", "Function"],
          rows: [
            [
              { text: "Deltoid ↔ rotator cuff", variant: "name" },
              "The deltoid's vertical force is offset by the cuff's horizontal force on the other side of the center of rotation. Without the cuff, the head migrates superiorly and the greater tuberosity meets the acromion. A tight capsule prevents the head from moving inferiorly in the glenoid.",
            ],
            [
              { text: "Upper trap ↔ serratus anterior (+ lower trap)", variant: "name" },
              "Produces scapular upward rotation: positions the glenoid, maintains the deltoid's length-tension, prevents subacromial impingement, gives a stable scapular base. Lower trap and serratus dominate near and above 90°. Serratus anterior has the most efficient lever arm.",
            ],
            [
              { text: "Subscapularis ↔ infraspinatus + teres minor", variant: "name" },
              "Concavity-compression: anterior and posterior cuff compress the head into the fossa and give inferior dynamic stability.",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "force-couple",
          title: "The deltoid–cuff force couple, and what happens without it",
          caption:
            "**The vertical force needs a horizontal partner.** The deltoid pulls up and out; the cuff pulls in and down on the other side of the centre of rotation, and the two together spin the head in place instead of shoving it upward. A tight capsule causes the same picture from the other direction — it stops the head from moving inferiorly in the glenoid.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Impingement EMG pattern:",
          body: "decreased serratus anterior activity, delayed middle and lower trap firing, and dominance of upper trap and levator scapulae → faulty scapulohumeral rhythm.",
        },
      ],
    },
    {
      id: "palpation",
      navLabel: "Palpation",
      title: "RTC tendon palpation — one continuous sequence",
      blocks: [
        {
          kind: "lede",
          text: "Seated, arm in neutral abduction with the elbow flexed to 90°. Rotate the humerus to bring each tendon under your finger rather than moving your hand around the shoulder.",
        },
        {
          kind: "table",
          columns: ["Step", "Position", "What is under your finger"],
          rows: [
            [
              { text: "1", variant: "num" },
              "Palpate in the deltopectoral triangle, using ER and IR of the UE",
              "Locate the intertubercular groove",
            ],
            [
              { text: "2", variant: "num" },
              "20° of shoulder IR orients the groove directly anterior",
              "Long head of biceps, running in the groove",
            ],
            [{ text: "3", variant: "num" }, "From 20° IR, externally rotate until the lesser tubercle presents", "Subscapularis"],
            [
              { text: "4", variant: "num" },
              "From 20° IR, internally rotate further until the greater tubercle presents",
              "Supraspinatus",
            ],
            [
              { text: "5", variant: "num" },
              "Flex to 90°, adduct and internally rotate; palpate caudally from the posterior acromion; resist ER to confirm",
              "Infraspinatus, posterior aspect of the greater tubercle",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "humerus-rotation",
          title: "Proximal humerus from above — rotate the bone, not your hand",
          caption:
            "**Your finger stays put in the deltopectoral triangle; the humerus turns underneath it.** Twenty degrees of internal rotation squares the bicipital groove to the front — that is the reference position. From there, external rotation walks the lesser tubercle into your finger, and more internal rotation brings the greater tubercle. Infraspinatus is the exception: flex to 90°, adduct and internally rotate, then palpate caudally from the posterior acromion.",
        },
      ],
    },
    {
      id: "treatment",
      navLabel: "Mobs & Exercise",
      title: "Irritability drives the dose",
      blocks: [
        {
          kind: "lede",
          text: "End feel during PROM tells you which column you are in. Name the irritability level before you pick a grade; the grade follows from it, not from the diagnosis.",
        },
        {
          kind: "cards",
          cards: [
            {
              tone: "h",
              title: "High irritability",
              badge: "Gr I–II",
              subtitle: "Empty end feel with PROM",
              points: [
                "Soft tissue mobilization emphasized",
                "Grade I or II joint mobilizations",
                "Pain-free PROM only",
                "Patient-controlled AAROM, high reps, minimal discomfort",
                "Bolster into the open-packed position",
              ],
            },
            {
              tone: "m",
              title: "Moderate irritability",
              badge: "Gr II–III",
              subtitle: "Pain at the onset of an end feel",
              points: [
                "Soft tissue mobilization emphasized",
                "Grade II to III joint mobilizations",
                "PROM with 5–15 second holds at end range",
                "Remove bolstering as able; progress STM to end range",
                "Tack and stretch posterior cuff and teres major",
              ],
            },
            {
              tone: "l",
              title: "Low irritability",
              badge: "Gr III–IV",
              subtitle: "Minimal pain with overpressure at end feel",
              points: ["Grade III–IV joint mobilizations", "Sustained-hold PROM", "Maximize total end range time (TERT)"],
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Standard mobilization dose:",
          body: "3 bouts of 30 seconds to 1 minute with 30 seconds rest. After grade III/IV, ease out with 5–10 seconds of grade I–II. A 30-second end-range stretch may follow each round. Then have the patient use the new range: 3 × 30 active reps in pain-free range. Reassess after every round of 3 bouts.",
        },
        { kind: "heading", text: "Joint mobilizations" },
        {
          kind: "table",
          columns: ["Mobilization", "Set-up", "Force direction", "Use when"],
          rows: [
            [
              { text: "GH posterior glide", variant: "name" },
              "Supine, open packed ~50° abd with slight horizontal adduction and slight ER; forearm supported against your body; wedge blocks scapula and acromion, not the humeral head. Grade I traction first.",
              "**Posterolateral**, using the meat of your hand, lateral to the coracoid",
              "Limited IR and horizontal adduction with capsular end feel and limited AP joint play. Tack up slack by adding IR as mobility improves.",
            ],
            [
              { text: "GH inferior glide", variant: "name" },
              "Supine, open packed ~50° abd; webspace on the humeral head; generate force through your hips",
              "Inferior with a slight lateral component",
              "Limited flexion and abduction with capsular end feel. Use long-axis traction for more irritable patients; scapula can be stabilized in the axilla.",
            ],
            [
              { text: "Humeral traction", variant: "name" },
              "Flex UE to 90° in neutral IR; both hands close to the joint line",
              "AP force through the long axis to load the posterior capsule, then pull laterally into distraction",
              "General capsular restriction; a mobilization belt can add force",
            ],
            [
              { text: "Posterior-to-anterior humerus", variant: "name" },
              "Prone, towel under the shoulder; hand just off the posterior acromion",
              "Long-axis distraction then P–A; add ER to wind up the capsule",
              "Limited ER, adhesive capsulitis, capsular pattern. Rarely indicated in healthy classmates — practice with caution.",
            ],
            [
              { text: "Scapulothoracic upward rotation", variant: "name" },
              "Sidelying; one hand on the superior angle with the patient's arm over your arm; webspace of the other hand on the inferior angle",
              "Into the hypomobile direction — retraction, protraction, or upward rotation",
              "Limited scapular upward rotation PROM. Consider pec minor and levator restriction, and lat depressing the scapula. Normal PROM with limited AROM → train strength and motor control instead.",
            ],
            [
              { text: "AC inferior / caudal glide", variant: "name" },
              "Supine, therapist behind the head; palpate the clavicle distally to the AC joint",
              "Inferior on the distal clavicle",
              "Inferior capsule mobility for shoulder elevation; needs many repetitions",
            ],
            [
              { text: "AC posterior glide", variant: "name" },
              "Supine, therapist beside the patient facing cephalad; both thumb tips on the anterior surface of the distal clavicle, elbows bent, wrists neutral",
              "Posterior",
              "Mobility for shoulder ER; compare sides",
            ],
            [
              { text: "SC inferior / caudal glide", variant: "name" },
              "Supine, therapist behind the head; thumb over thumb on the cephalad aspect of the joint",
              "Oscillating caudad (convex rule)",
              "SC pain reproduction or hypomobility limiting scapular elevation",
            ],
          ],
        },
        { kind: "heading", text: "Soft tissue mobilization & PROM by position" },
        {
          kind: "table",
          columns: ["Position", "High irritability", "Moderate → low"],
          rows: [
            [
              { text: "Sidelying", variant: "name" },
              "Bolster into open pack; scapular upward rotation PROM; STM to posterior cuff, upper trap, teres major, latissimus",
              "Remove bolstering; STM to latissimus, teres major, posterior cuff; progress STM to end range; tack and stretch posterior cuff and teres major",
            ],
            [
              { text: "Supine", variant: "name" },
              "Bolster into open pack; STM to pec minor, pec major, biceps, posterior cuff, upper trap; PROM into ER, flexion, ER at 90° flexion",
              "Remove bolstering; pec minor tack and stretch, subscapularis; joint mobs AP glide and inferior glide; PROM ER@0, ER@90 abd, IR, ER in flexion, flexion",
            ],
          ],
        },
        { kind: "heading", text: "Exercise by direction and irritability" },
        {
          kind: "table",
          columns: ["Target", "High irritability", "Low irritability", "Cue that earns the point"],
          rows: [
            [
              { text: "Flexion ROM", variant: "name" },
              "Supported, patient-controlled AAROM in pain-free range, high reps, minimal discomfort; pair with grade I–II mobs and STM",
              "Sustained end-range holds after grade III–IV mobs; maximize TERT; 3 × 30 active reps to own the new range",
              "Reassess after every round of 3 bouts — ROM should be gained *within* the session",
            ],
            [
              { text: "IR ROM", variant: "name" },
              "Supine IR in pain-free range with the humeral head blocked from translating anteriorly",
              "Add horizontal adduction stretch for the posterior capsule; posterior glide mobilization first, then active IR",
              `"Swivel around an axis" — keep the head of the humerus from popping up`,
            ],
            [
              { text: "ER ROM", variant: "name" },
              "Pain-free AAROM; bolstered, low load",
              "Prone ER with synchronized finger extension then wrist extension as the arm swivels laterally",
              "Avoid compensation from the lats and deltoid",
            ],
            [
              { text: "Posterior tilt + thoracic extension", variant: "name" },
              "Positioning and awareness first — correct resting alignment and sleeping posture",
              "Lower trap and serratus loading with the thorax extended; functional retraining on a ball",
              "Keep the elbow in front of the mid-axillary line; use thoracic motion",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Take-aways for MSI treatment:",
          body: "make the patient aware of the movement change needed to stop provoking symptoms; have them examine their own motion with visual cues; correct sleeping posture; the spinning of the humeral head in the glenoid is a higher priority than scapular control; ROM gained immediately in-session means stiffness, not shortness — if it doesn't improve, shortness is the issue; scapular upward rotation is what avoids impingement.",
        },
      ],
    },
    {
      id: "drill",
      navLabel: "Drill",
      title: "Rapid drill",
      note: "answer before you open",
      blocks: [
        {
          kind: "drill",
          items: [
            {
              question: "Patient has 175° of total flexion but only 100° of pure GH flexion with a muscular end feel. What are you testing next?",
              answer:
                "Teres major length — lateral translation of the lateral scapular border greater than one inch with passive flexion. A capsular end feel at the same range would send you to the inferior capsule instead. Also check whether the extra total range is coming from excessive scapular upward rotation.",
            },
            {
              question: "Empty end feel with PROM. Grade of mobilization, and what else changes?",
              answer:
                "High irritability: grade I–II only, emphasis on soft tissue mobilization, pain-free PROM, patient-controlled AAROM with high reps and minimal discomfort. Bolster into the open-packed position.",
            },
            {
              question: "Which ligament is the main GH stabilizer, and where does it work?",
              answer:
                "The inferior glenohumeral ligament complex, restraining anterior translation at 60–90° of abduction. Middle GHL covers 30–60°; the superior GHL/coracohumeral/subscap pulley covers 0–30°.",
            },
            {
              question: "Three tests, all positive. Which cluster, and what does that buy you?",
              answer:
                "Hawkins-Kennedy + painful arc + painful or weak resisted ER: +LR 10.56 for subacromial pain syndrome. All three negative gives −LR 0.17. The broader rule is any 3 of the 5 SPS tests.",
            },
            {
              question: "Scapular upward rotation is limited during AROM but full on PROM. Do you mobilize?",
              answer:
                "No — that pattern points to strength and motor control, not mobility. Train serratus anterior and lower trapezius. Mobilize only when the PROM itself is restricted.",
            },
            {
              question: "Where does the goniometer go for shoulder IR?",
              answer:
                "Axis on the olecranon process, stationary arm vertical, moving arm to the ulnar styloid, shoulder at 90° abduction (45° if 90 isn't available). Stabilize the scapula against anterior tilt and watch for scapular compensation.",
            },
            {
              question: "Swimmer with general laxity, anterior shoulder pain, humeral head sitting forward. Diagnosis and first three treatments?",
              answer:
                "Humeral anterior glide syndrome — more than a third of the head anterior to the acromion, lax anterior capsule with a stiff posterior capsule and weak subscapularis. Treatment: supine IR with the correct movement pattern to lengthen the external rotators; horizontal adduction stretch for the posterior capsule; subscapularis strengthening. Correct resting and sleeping alignment first.",
            },
            {
              question: "Why does losing the rotator cuff cause impingement?",
              answer:
                "The deltoid–cuff force couple: the deltoid's upward-outward pull needs the cuff's opposing horizontal force across the center of rotation. Without it the head migrates superiorly and the greater tuberosity contacts the acromial undersurface. A tight capsule compounds it by preventing the head from gliding inferiorly.",
            },
            {
              question: "Which direction do you push for a GH posterior glide, and what is it for?",
              answer:
                "Posterolateral, with the hand lateral to the coracoid, in about 50° abduction with slight horizontal adduction and ER. It is for limited IR and horizontal adduction with a capsular end feel and limited AP joint play.",
            },
            {
              question: "Which muscle has the most efficient lever arm for scapular upward rotation?",
              answer:
                "Serratus anterior — followed by upper and lower trapezius. Lower trap and serratus dominate near and above 90° of elevation.",
            },
          ],
        },
      ],
    },
  ],
  footer:
    "**About this guide.** Compiled from a shoulder examination and treatment sequence covering functional tasks and biomechanics, movement system syndromes, posture through manual muscle testing, special tests, and palpation through soft tissue mobilization. Normative values, sensitivity/specificity and likelihood ratios are reproduced as stated in those source materials — verify against current literature before using them to weight a clinical decision. Items 25–28, the irritability-graded exercise progressions, are assembled from the irritability framework and treatment principles rather than quoted as a fixed exercise list.",
};
