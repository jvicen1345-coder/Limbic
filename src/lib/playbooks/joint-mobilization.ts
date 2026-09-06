/**
 * The joint mobilization playbook — the third Limbic Playbook, and the first that is a
 * technique rather than a region (see lib/playbook-content.ts for the block types, and
 * docs/playbook-authoring.md for the brief).
 *
 * The shoulder and hip playbooks each carry their own mobilization section, because that is
 * where a reader working through a region needs it. What neither can show is the decision
 * itself: whether a joint should be mobilized at all, which direction the glide goes and why,
 * which grade, and what dose — questions that are answered the same way at every joint and
 * are only illustrated by a region. This file is that decision, with the shoulder and the hip
 * as the two worked examples, and every technique in it also appears in its own region's
 * playbook.
 *
 * Ordered the way the decision is made: is this joint the problem, which way does it glide,
 * which grade, what dose, then the techniques, then the ways each of them goes wrong.
 */

import type { Playbook } from "@/lib/playbook-content";

export const JOINT_MOBILIZATION_PLAYBOOK: Playbook = {
  slug: "joint-mobilization",
  name: "Joint Mobilization",
  title: "Joint Mobilization Playbook",
  eyebrow: "Musculoskeletal practice · manual therapy",
  summary:
    "One decision, made the same way at every joint: whether to mobilize at all, which direction the glide goes, which grade, and what dose — with the shoulder and the hip as the worked examples. Bring a mobilization belt.",
  stamp: [
    { value: "13", label: "techniques" },
    { value: "5", label: "Maitland grades" },
    { value: "2", label: "regions worked" },
    { value: "0–6", label: "joint play scale" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "24 Items",
      title: "The decision, in the order you make it",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Twenty-four items. The first eight decide whether to mobilize at all and in which direction; the next six set the grade and the dose; the rest are the techniques themselves. The last column is the finding: the number, direction or observation that turns the step into a decision.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "prom-end-feel",
              name: "Take PROM and name the end feel",
              how: "Quantity, quality, symptom reproduction, and end feel, in every direction the joint has.",
              finding: "**Capsular → joint play, then mobilization. Muscular → length work, not mobilization.** This is the fork the whole page hangs on; get it wrong and every later decision is wasted",
            },
            {
              id: "empty-end-feel",
              name: "Rule out the end feel that stops you",
              how: "An empty end feel is pain stopping the movement before any resistance appears — no mechanical limit and no resistance felt.",
              finding: "**Empty means stop.** Fracture, abscess, bursitis, acute joint inflammation, psychogenic. Screen and refer; this is not a dosing decision",
            },
            {
              id: "direction-of-loss",
              name: "Read the direction of the loss, not just its size",
              how: "Compare against the uninvolved side, then ask whether one motion is short or all of them are.",
              finding: "A loss in **every** direction says capsule; an isolated loss says one structure. A capsular pattern is a mobilization presentation, a single-direction loss often is not",
            },
            {
              id: "open-pack",
              name: "Find the open (loose) packed position",
              how: "The position in the range where the joint is under least stress and the capsule has its greatest capacity. Assess and treat from here.",
              finding: "**Hip: 30° flexion, 30° abduction, slight ER. Glenohumeral: ~50° abduction with slight horizontal adduction and slight ER.** Assessing outside it reads soft tissue tension as joint stiffness",
            },
            {
              id: "joint-play",
              name: "Assess joint play",
              how: "Stabilize the proximal partner, broad contact, short lever, take up the soft tissue slack first, and move the distal partner. Traction is perpendicular to the treatment plane; glide is parallel to it.",
              finding: "Grade on the **0–6 scale: 0 ankylosis · 1–2 hypomobile · 3 normal · 4–5 hypermobile · 6 unstable**",
            },
            {
              id: "hypermobility-stop",
              name: "Check you are not about to mobilize a hypermobile joint",
              how: "A 4, 5 or 6 on that scale, generalized laxity, a history of the joint giving way, or an empty end feel with excessive range.",
              finding: "**4 and above is a stop, not a lighter dose.** Stability through exercise or taping; check ligament integrity. At the hip this pattern is the labral presentation, at the shoulder the anterior instability one",
            },
            {
              id: "convexity",
              name: "Name which partner is convex and which is moving",
              how: "Decide before you pick a direction: is the moving bone the convex one or the concave one?",
              finding: "**Convex moving on fixed concave → roll and glide go in opposite directions.** Both the hip and the glenohumeral joint are this case. Concave moving on fixed convex → same direction",
            },
            {
              id: "glide-direction",
              name: "Derive the glide direction from the restricted motion",
              how: "Take the motion that is limited, apply the rule, and say the direction out loud before you touch them.",
              finding: "Hip flexion/IR → **posterior** glide · hip extension/ER → **anterior** glide · GH IR and horizontal adduction → **posterior** glide · GH flexion and abduction → **inferior** glide",
            },
            {
              id: "irritability",
              name: "Grade irritability before you pick a grade",
              how: "Pain rating, night and rest pain, reported disability — then confirm against where symptoms arrive relative to the end feel.",
              finding: "[[pill:h|High]] symptoms before the end feel · [[pill:m|Moderate]] at the end feel · [[pill:l|Low]] only with overpressure. **The grade follows from this, not from the diagnosis**",
            },
            {
              id: "grade-choice",
              name: "Pick the grade from irritability and intent",
              how: "Two independent questions: how irritable is it, and are you treating pain or length?",
              finding: "**I–II treat pain** and move synovial fluid, before R1. **III–IV treat length** — plastic deformation of capsular tissue, past R1. V is a single thrust",
            },
            {
              id: "oscillation",
              name: "Set the oscillation rate",
              how: "Oscillate rather than push and hold, unless oscillating provokes.",
              finding: "**2–3 per second** — fast enough to move fluid, slow enough to stay in the intended part of the range. Static holds at a range chosen by irritability are the alternative",
            },
            {
              id: "bout-length",
              name: "Set the bout length from the grade",
              how: "Time it rather than counting.",
              finding: "**Grade I–II: 10–30 seconds. Grade III–IV: 60 seconds.** Standard dose is 3 bouts of 30 seconds to 1 minute with 30 seconds rest",
            },
            {
              id: "ease-out",
              name: "Ease out of a grade III or IV",
              how: "After the working bouts, drop back before you let go.",
              finding: "**5–10 seconds of grade I–II**, then a 30-second end-range stretch may follow each round",
            },
            {
              id: "use-the-range",
              name: "Make the patient use the range you just gained",
              how: "Immediately after the round, active movement in the new range.",
              finding: "**3 × 30 active reps in pain-free range.** Range restored passively and never loaded actively is range you will have to win again next visit",
            },
            {
              id: "reassess",
              name: "Reassess after every round of three bouts",
              how: "Return to the same measurement or the concordant task each time.",
              finding: "**ROM gained within the session means stiffness; no change means shortness** and a longer timeline. Do not run more than two or three treatments before reassessing or you will not know which one worked",
            },
            {
              id: "gh-posterior",
              name: "GH posterior glide",
              how: "Supine, open packed ~50° abduction with slight horizontal adduction and ER; forearm supported against your body; a wedge blocks the scapula and acromion but not the humeral head. Grade I traction first.",
              finding: "Force **posterolateral**, meat of the hand, lateral to the coracoid. For limited IR and horizontal adduction with a capsular end feel and limited AP joint play",
            },
            {
              id: "gh-inferior",
              name: "GH inferior glide",
              how: "Supine, open packed ~50° abduction; webspace on the humeral head; generate force through your hips.",
              finding: "Force **inferior with a slight lateral component**. For limited flexion and abduction with a capsular end feel; long-axis traction instead when more irritable",
            },
            {
              id: "humeral-traction",
              name: "Humeral traction",
              how: "Flex the arm to 90° in neutral IR; both hands close to the joint line.",
              finding: "AP force through the long axis to load the posterior capsule, then pull laterally into distraction. General capsular restriction; a belt can add force",
            },
            {
              id: "pa-humerus",
              name: "Posterior-to-anterior humerus",
              how: "Prone, towel under the shoulder; hand just off the posterior acromion. Long-axis distraction first, then P–A; add ER to wind up the capsule.",
              finding: "For limited ER, adhesive capsulitis, a capsular pattern. **Rarely indicated in a healthy classmate** — practise with caution",
            },
            {
              id: "scapulothoracic",
              name: "Scapulothoracic mobilization",
              how: "Sidelying; one hand on the superior angle with the patient's arm over your arm, webspace of the other on the inferior angle.",
              finding: "Into the hypomobile direction. **Normal PROM with limited AROM is a strength and motor control finding — train it, don't mobilize it**",
            },
            {
              id: "ac-sc",
              name: "AC and SC glides",
              how: "AC caudal glide and AC posterior glide supine at the distal clavicle; SC caudal glide thumb over thumb on the cephalad aspect of the joint.",
              finding: "AC caudal for elevation (**needs many repetitions**) · AC posterior for ER · SC caudad oscillation, which is the **convex rule** at that joint, for scapular elevation",
            },
            {
              id: "hip-ap",
              name: "Hip anterior-to-posterior glide",
              how: "Supine in open pack, standing on the opposite side; stabilize the contralateral hip, hand on the anterior femoral head. Low irritability: flex hip and knee and drive through the femur with your sternum behind your hands.",
              finding: "Force **posterolateral**, angled for the orientation of the acetabulum. For limited flexion and/or IR with a capsular end feel",
            },
            {
              id: "hip-pa",
              name: "Hip posterior-to-anterior glide",
              how: "Prone, standing on the same side; progressively pre-position toward end-range extension as irritability drops.",
              finding: "Force **anteromedial**, again following the acetabulum. For limited extension and/or ER with a capsular end feel",
            },
            {
              id: "hip-distraction",
              name: "Hip long axis traction and lateral distraction",
              how: "Traction: at the foot of the table, belt at the ankle, lean back. Lateral distraction: belt at the joint line with the other end at your own ischial tuberosities, lean your hips laterally and slightly inferiorly; hold it while adding passive IR or ER.",
              finding: "**Relief with long axis traction points at the joint surface itself.** Lateral distraction opens the joint in all directions at once — the choice when everything is restricted rather than one direction",
            },
          ],
        },
      ],
    },
    {
      id: "numbers",
      navLabel: "Numbers",
      title: "The numbers a mobilization is dosed by",
      blocks: [
        {
          kind: "lede",
          text: "Positions, grades, rates and durations. None of them depend on which joint you are working on.",
        },
        {
          kind: "numbers",
          cells: [
            { value: "30 / 30", label: "Hip open pack: 30° flexion, 30° abduction, slight ER" },
            { value: "~50°", label: "Glenohumeral open pack: abduction, with slight horizontal adduction and ER" },
            { value: "0 – 6", label: "Joint play scale; 3 is normal, 1–2 hypomobile, 4–5 hypermobile" },
            { value: "4 +", label: "The grade at which you stop mobilizing and start stabilizing" },
            { value: "I – II", label: "Grades that treat pain, before resistance begins" },
            { value: "III – IV", label: "Grades that treat length, past the point resistance begins" },
            { value: "V", label: "High velocity, low amplitude thrust — performed once, not in bouts" },
            { value: "2–3 / sec", label: "Oscillation rate" },
            { value: "10–30 s", label: "Grade I–II bout length" },
            { value: "60 s", label: "Grade III–IV bout length" },
            { value: "3 bouts", label: "Standard dose: 30 s to 1 min each, with 30 s rest between" },
            { value: "5–10 s", label: "Grade I–II easing out of a grade III or IV" },
            { value: "30 s", label: "End-range stretch that may follow each round" },
            { value: "3 × 30", label: "Active reps in pain-free range, to use the range you just gained" },
            { value: "2–3", label: "Treatments before you must reassess, or you won't know which one worked" },
            { value: "5–15 s", label: "End-range PROM holds at moderate irritability" },
          ],
        },
      ],
    },
    {
      id: "indication",
      navLabel: "Indication",
      title: "Does this joint want mobilizing at all?",
      blocks: [
        {
          kind: "lede",
          text: "Joint play is movement at the joint surface that is not under voluntary control — roll, spin and slide accompanying physiological motion. You assess it for one reason: **PROM limited with a capsular end feel**, or to confirm suspected hypermobility. Everything else on this page assumes you have answered this section first.",
        },
        {
          kind: "table",
          columns: ["End feel on PROM", "What it means", "Where it sends you", "What it is not"],
          rows: [
            [
              { text: "Capsular / firm", variant: "name" },
              "Connective tissue shortening — capsule, ligament, fascia — or increased muscle tone",
              "**Joint play, then mobilization** if hypomobile",
              "Not a length problem. Stretching the muscle over a stiff capsule moves the wrong tissue",
            ],
            [
              { text: "Muscular", variant: "name" },
              "The muscle-tendon unit is limiting the motion",
              "**Length testing, soft tissue mobilization, contract-relax** — not mobilization",
              "Not an accessory motion problem. Mobilizing here treats a joint that is not restricted",
            ],
            [
              { text: "Empty", variant: "name" },
              "Pain stops the movement before any resistance appears; no mechanical limit and no resistance felt",
              "**Stop and screen** — fracture, abscess, bursitis, acute joint inflammation, psychogenic",
              "Not the top of the irritability scale. It is a red-flag end feel, not a dose",
            ],
            [
              { text: "Hard", variant: "name" },
              "A bony grating or block earlier or later in the range than it should be",
              "Joint surface: osteoarthritis, chondromalacia, loose bodies, myositis ossificans",
              "Not capsular. **Mobilization will not lengthen bone** — confirm with distraction and manage load",
            ],
            [
              { text: "Soft / boggy", variant: "name" },
              "Soft tissue oedema or synovitis, occurring earlier than it should",
              "Treat the effusion and the irritability",
              "Not a reason for grade III–IV. Low grades for pain, not high grades for range",
            ],
          ],
        },
        { kind: "heading", text: "Grading what you feel: the 0–6 scale" },
        {
          kind: "table",
          columns: ["Grade", "Reads as", "What you do about it"],
          rows: [
            { group: "Hypomobility" },
            [{ text: "0", variant: "num" }, "No movement — ankylosis", "Nothing to mobilize; this is a structural end point"],
            [{ text: "1", variant: "num" }, "Considerable decreased movement", "Joint mobilization, grade matched to irritability"],
            [{ text: "2", variant: "num" }, "Slight decreased movement", "Joint mobilization, grade matched to irritability"],
            { group: "Normal" },
            [{ text: "3", variant: "num" }, "Normal", "Look elsewhere — the restriction is not accessory motion"],
            { group: "Hypermobility" },
            [
              { text: "4", variant: "num" },
              "Slight increased movement",
              "**Do not mobilize.** Stability through exercise or taping; check ligament integrity",
            ],
            [{ text: "5", variant: "num" }, "Considerable increased movement", "Stabilization, balance and motor control"],
            [{ text: "6", variant: "num" }, "Complete instability", "Refer; this is not a mobilization presentation"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "The scale is a decision, not a description.",
          body: "Everything from 4 up is a reason **not** to mobilize, and a hypermobile joint that is painful will often feel like it wants mobilizing. At the hip that pattern — excessive ER and extension, hypermobile or empty joint play, clicking in the history — is the labral presentation; at the shoulder it is the anterior instability one. Both are treated with stabilization and motor control.",
        },
      ],
    },
    {
      id: "arthro",
      navLabel: "Arthrokinematics",
      title: "Which way does it glide, and why",
      blocks: [
        {
          kind: "lede",
          text: "Two things fix the direction: what the surfaces are doing to each other, and which of the two partners is moving. Neither is a matter of preference, and both are decided before you put a hand on the patient.",
        },
        {
          kind: "table",
          columns: ["Term", "Definition", "Direction relative to the joint plane"],
          rows: [
            [
              { text: "Traction / distraction", variant: "name" },
              "Separation of the joint surfaces",
              "**At a right angle** to the joint plane",
            ],
            [{ text: "Glide", variant: "name" }, "Translation of one surface on the other", "**Parallel** to the joint plane"],
            [
              { text: "Roll", variant: "name" },
              "New points on one surface meeting new points on the other, as a tyre rolls on a road",
              "Follows the bone; it is the glide that has to accompany it",
            ],
            [
              { text: "Open (loose) packed position", variant: "name" },
              "The position in the range where the joint is under least stress and the capsule has its greatest capacity",
              "Hip: **30° flexion, 30° abduction, slight ER**. Glenohumeral: **~50° abduction** with slight horizontal adduction and ER",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "treatment-plane",
          title: "Traction and glide are defined against the plane, not against the room",
          caption:
            "**The treatment plane lies on the concave surface, so it moves when the concave partner moves and stays put when the convex one does.** Traction is perpendicular to it and separates the surfaces; a glide is parallel to it and slides one on the other. That is why the same hand position can be a traction at one joint angle and a shear at another, and why the forearm angle — not the wrist — is what sets the direction.",
        },
        { kind: "heading", text: "Concave and convex — the rule that sets the glide direction" },
        {
          kind: "table",
          columns: ["Rule", "Which partner moves", "Roll and glide", "Treatment plane", "Worked example"],
          rows: [
            [
              { text: "Concave rule", variant: "name" },
              "Convex partner fixed, **concave** partner moving",
              "**Same** direction",
              "Moves **with** the concave portion",
              "Think of these as 'little knees' — tibia on femur",
            ],
            [
              { text: "Convex rule", variant: "name" },
              "Concave partner fixed, **convex** partner moving",
              "**Opposite** directions",
              "**Does not change** with joint position",
              "Think of these as 'little shoulders'. Both joints on this page are this case: the femoral head on the acetabulum, and the humeral head on the glenoid",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "convex-hip-glide",
          title: "A convex-on-concave joint glides opposite to the bone",
          caption:
            "**The femoral head glides the opposite way to the shaft it is attached to.** Flex or internally rotate the hip and the head must glide posteriorly; extend or externally rotate it and the head must glide anteriorly. The glenohumeral joint answers the same way for the same reason, which is why limited IR there is treated with a posterior glide and not an anterior one.",
        },
        { kind: "heading", text: "Every restriction on this page, and the glide it implies" },
        {
          kind: "table",
          columns: ["Joint", "Restricted motion", "Glide direction", "Why that direction"],
          rows: [
            { group: "Hip — convex head on concave acetabulum" },
            [
              { text: "Hip", variant: "name" },
              "Flexion and/or internal rotation",
              "**Anterior to posterior**, angled posterolateral",
              "Convex rule: the shaft swings anteriorly, so the head must travel posteriorly. The angle follows the orientation of the acetabulum",
            ],
            [
              { text: "Hip", variant: "name" },
              "Extension and/or external rotation",
              "**Posterior to anterior**, angled anteromedial",
              "The same rule the other way round",
            ],
            [
              { text: "Hip", variant: "name" },
              "Everything, roughly equally",
              "**Lateral distraction**",
              "A capsular pattern is not a direction problem; distraction opens the joint in every direction at once",
            ],
            { group: "Glenohumeral — convex head on concave glenoid" },
            [
              { text: "GH", variant: "name" },
              "Internal rotation and horizontal adduction",
              "**Posterior**, directed posterolateral",
              "Convex rule, with limited AP joint play confirming it. This is the posterior capsule, the upstream driver of most shoulders",
            ],
            [
              { text: "GH", variant: "name" },
              "Flexion and abduction",
              "**Inferior**, with a slight lateral component",
              "The head has to descend in the glenoid for the shaft to rise; a capsule that stops it is what crowds the acromion",
            ],
            [
              { text: "GH", variant: "name" },
              "External rotation",
              "**Posterior to anterior**, with ER added to wind up the capsule",
              "Anterior capsule. Adhesive capsulitis and the capsular pattern present here",
            ],
            { group: "The other shoulder joints" },
            [
              { text: "AC", variant: "name" },
              "Shoulder elevation",
              "**Inferior / caudal** on the distal clavicle",
              "Inferior capsule mobility — and it needs many repetitions to change",
            ],
            [{ text: "AC", variant: "name" }, "External rotation", "**Posterior**", "Compare sides; the joint is small and its play is easily over-read"],
            [
              { text: "SC", variant: "name" },
              "Scapular elevation",
              "**Caudad**, oscillating",
              "The **convex rule** at that joint — the direction opposes the motion you are trying to gain",
            ],
            [
              { text: "Scapulothoracic", variant: "name" },
              "Upward rotation PROM",
              "Into the hypomobile direction — retraction, protraction or upward rotation",
              "Not a synovial joint, so there is no rule to apply: the direction is simply the one that is stiff",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "roll-without-slide",
          title: "Roll without slide drives the surfaces together",
          caption:
            "**A joint that rolls but cannot glide compresses instead of spinning in place.** The contact point runs off the end of the surface and the two bones are driven into each other — abnormal joint mechanics, and pain. It is the argument for restoring the glide rather than only stretching the muscle, and it is the same mechanism that produces impingement at the shoulder.",
        },
      ],
    },
    {
      id: "grades",
      navLabel: "Grades",
      title: "Which grade, and what it is for",
      blocks: [
        {
          kind: "lede",
          text: "The grade is a position in the range, not an amount of effort. What separates a grade II from a grade III is where in the range the oscillation happens — before or past the point where resistance begins.",
        },
        {
          kind: "table",
          columns: ["Grade", "Amplitude and position", "Resistance", "What it is for"],
          rows: [
            [
              { text: "I", variant: "num" },
              "Small amplitude at the **beginning** of available ROM",
              "No resistance",
              "Pain; stimulates biologic activity by moving synovial fluid",
            ],
            [
              { text: "II", variant: "num" },
              "Large amplitude **within** the available ROM (mid-range)",
              "No resistance",
              "Pain and synovial fluid movement",
            ],
            [
              { text: "III", variant: "num" },
              "Large amplitude that **reaches** the end of ROM",
              "Into resistance",
              "Plastic deformation of capsular tissue — lengthening",
            ],
            [
              { text: "IV", variant: "num" },
              "Small amplitude at the **very end** of ROM",
              "Into resistance",
              "Plastic deformation — lengthening",
            ],
            [
              { text: "V", variant: "num" },
              "High velocity, low amplitude thrust at the end of available ROM, still within normal ROM (HVLAT, manipulation)",
              "At the end range",
              "Performed **once**, not in bouts",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "maitland-grades",
          title: "The grades are positions in the range, not intensities of effort",
          caption:
            "**What separates grade II from grade III is where in the range it happens, not how hard you push.** Grades I and II live before R1 — the point where resistance begins — and treat pain. Grades III and IV cross R1 into resistance and treat length. This is an original redrawing of the movement-diagram concept, not a reproduction of a figure from the source deck.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Two independent questions.",
          body: "*Which grade* is answered by irritability and by what you are trying to change — pain or tissue length. *Which direction* is answered by the convex rule and the motion that is restricted. Getting one right and the other wrong is the common failure, and it fails quietly: a correctly graded mobilization in the wrong direction feels fine to both of you and changes nothing.",
        },
      ],
    },
    {
      id: "dose",
      navLabel: "Dose",
      title: "Irritability drives the dose",
      blocks: [
        {
          kind: "lede",
          text: "Name the irritability level before you pick anything. Start with the least irritable approach and progress: grade I–II before III–IV, soft tissue gentle before firm, stretching mid-range before end-range.",
        },
        {
          kind: "cards",
          cards: [
            {
              tone: "h",
              title: "High irritability",
              badge: "Gr I–II",
              subtitle: "End feel: empty, or symptoms before you reach it\nHistory: pain at rest or at night, easily provoked, slow to settle",
              points: [
                "Grade I or II joint mobilizations, 10–30 second bouts",
                "Soft tissue mobilization emphasized",
                "Pain-free PROM only",
                "Bolster into the open-packed position and stay there",
                "Patient-controlled AAROM, high reps, minimal discomfort",
              ],
            },
            {
              tone: "m",
              title: "Moderate irritability",
              badge: "Gr II–III",
              subtitle: "End feel: symptoms at the onset of the end feel\nHistory: pain with activity, settles within a reasonable time",
              points: [
                "Grade II to III joint mobilizations",
                "PROM with 5–15 second holds at end range",
                "Remove bolstering as able; begin pre-positioning toward end range",
                "Soft tissue mobilization progressed toward end range",
              ],
            },
            {
              tone: "l",
              title: "Low irritability",
              badge: "Gr III–IV",
              subtitle: "End feel: minimal pain even with overpressure\nHistory: symptoms only at end range or under load, settles quickly",
              points: [
                "Grade III–IV joint mobilizations, 60 second bouts",
                "Come out of open pack — mobilize pre-positioned near end range",
                "Sustained-hold PROM; maximize total end range time",
                "Long-lever techniques become appropriate",
              ],
            },
          ],
        },
        {
          kind: "figure",
          figureId: "irritability-dose",
          title: "One reading of irritability sets four different decisions",
          caption:
            "**Irritability is not a severity label — it is a dose parameter.** The same reading simultaneously fixes the mobilization grade, the bout length, where in the range you work, and how much load the exercise afterwards carries. That is why it is graded twice, from the interview and from the end feel, before anything else is chosen.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Standard mobilization dose:",
          body: "3 bouts of 30 seconds to 1 minute with 30 seconds rest. After grade III/IV, ease out with 5–10 seconds of grade I–II. A 30-second end-range stretch may follow each round. Then have the patient use the new range: 3 × 30 active reps in pain-free range. Reassess after every round of 3 bouts.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Range gained and not used is range you will win again next week.",
          body: "The active reps are not a cool-down. A capsule lengthened passively and never loaded actively has no reason to keep the length, and the patient leaves with a number that was true in the clinic. Reassess with the same measurement or the same functional task every time — gained within the session means stiffness, unchanged means shortness and a longer timeline.",
        },
      ],
    },
    {
      id: "shoulder",
      navLabel: "Shoulder",
      title: "The shoulder techniques",
      blocks: [
        {
          kind: "lede",
          text: "Four joints, not one: glenohumeral, acromioclavicular, sternoclavicular, and the scapulothoracic articulation that is not a joint at all. Every row here also appears in the shoulder playbook, in the section where a reader working that region would meet it.",
        },
        {
          kind: "table",
          columns: ["Mobilization", "Set-up", "Force direction", "Use when"],
          widths: ["18%", "34%", "22%", "26%"],
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
              "Limited scapular upward rotation PROM. Normal PROM with limited AROM → train strength and motor control instead.",
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
      ],
    },
    {
      id: "hip",
      navLabel: "Hip",
      title: "The hip techniques",
      blocks: [
        {
          kind: "lede",
          text: "One joint, deep, with a socket whose orientation angles every glide you make into it. Every row here also appears in the hip playbook.",
        },
        {
          kind: "table",
          columns: ["Technique", "Set-up", "Force direction", "Assess / treat when", "What fakes a result"],
          widths: ["16%", "30%", "18%", "20%", "16%"],
          rows: [
            [
              { text: "Anterior-to-posterior (AP) glide", variant: "name" },
              "Supine in open pack. Stand on the **opposite** side to the target hip; stabilize the contralateral hip; hand on the anterior femoral head. Low irritability: come out of open pack, flex hip and knee, place hands over the knee with your sternum against them and drive through the length of the femur",
              "**Posterolateral** — angled because of the orientation of the acetabulum, not straight back",
              "Hypomobility with a capsular end feel in **flexion and/or internal rotation**",
              "A straight posterior push misses the acetabular orientation. A long lever through the femur is powerful but only appropriate once irritability has dropped",
            ],
            [
              { text: "Posterior-to-anterior (PA) glide", variant: "name" },
              "Patient **prone**. Stand on the **same** side as the hip; stabilize the contralateral hip if needed. As irritability drops, progressively pre-position toward end-range extension",
              "**Anteromedial** — again following the acetabular orientation",
              "Hypomobility with a capsular end feel in **extension and/or external rotation**",
              "Treating from neutral forever. The gains come from progressively pre-positioning nearer end range as tolerance allows",
            ],
            [
              { text: "Long axis traction", variant: "name" },
              "Stand at the foot of the table; belt or towel around the ankle, table lowered so the foot rests at your thigh; other leg bent or straight; lean back and take up the slack, slight abduction optional",
              "Along the shaft of the femur",
              "Global pain relief, and as the **diagnostic** that separates joint-surface pain from soft tissue",
              "Pulling with the arms instead of leaning back with body weight — the force becomes inconsistent and small",
            ],
            [
              { text: "Lateral distraction with belt", variant: "name" },
              "Stand on the affected side at the greater trochanter. Belt at the joint (a towel reduces the pressure), the other end at **your** ischial tuberosities, table aligned with the belt; tighten until your body is close to the thigh; stabilize the contralateral anterior pelvis",
              "Lateral and slightly inferior, generated by leaning your hips",
              "General joint space in **all** hip directions — the choice when everything is restricted rather than one direction",
              "Belt placed distally on the thigh instead of at the joint line: the force becomes a long-lever pull rather than a distraction",
            ],
            [
              { text: "Lateral distraction with passive IR/ER", variant: "name" },
              "Same set-up, hip held at 90/90; maintain the distraction while passively rotating",
              "Even lateral distraction **held constant** while rotation is added",
              "Rotation restriction with irritability — the distraction is what lets you rotate with less joint compression",
              "Losing the distraction as you rotate, which turns it back into a plain passive rotation with all the compression you were trying to avoid",
            ],
          ],
        },
      ],
    },
    {
      id: "errors",
      navLabel: "Errors",
      title: "What fakes a result",
      blocks: [
        {
          kind: "lede",
          text: "A mobilization can fail in two directions: the assessment reads stiffness that is not there, or the treatment applies force the joint never receives. Both feel the same in the moment — competent, careful, and ineffective — which is why they belong in a table rather than in a warning.",
        },
        {
          kind: "table",
          columns: ["Error", "What it produces", "What it feels like at the time", "The correction"],
          rows: [
            { group: "Assessment" },
            [
              { text: "Assessing outside the open packed position", variant: "name" },
              "Capsular and ligamentous tension read as joint stiffness",
              "A firm, convincing end point",
              "Find the open pack first — 30/30 and slight ER at the hip, ~50° abduction at the shoulder",
            ],
            [
              { text: "Not taking up the soft tissue slack", variant: "name" },
              "Skin, fat and muscle travel before the joint does, so the first part of your movement is not joint play at all",
              "More movement than the joint has",
              "Sink through the soft tissue and start the assessment from where the bone begins to move",
            ],
            [
              { text: "A long lever arm", variant: "name" },
              "Torque at the joint rather than translation, and a reading dominated by everything between your hand and the joint",
              "Powerful and easy",
              "**Keep the contact as close to the joint surface as possible.** The lever is the single biggest source of a false grade",
            ],
            [
              { text: "Failing to stabilize the proximal partner", variant: "name" },
              "Both bones move together, so nothing translates on anything",
              "A generous, mobile joint",
              "Fix one side of the joint before you move the other",
            ],
            { group: "Treatment" },
            [
              { text: "Arm strength instead of body weight", variant: "name" },
              "Force that varies through the bout and fades as you tire",
              "Effortful, therefore effective",
              "Use your body and let gravity assist; your body and the mobilizing hand act as one unit",
            ],
            [
              { text: "A direction that ignores the socket", variant: "name" },
              "At the hip, a straight posterior push into the rim rather than a glide along the surface",
              "Solid resistance — which is the rim, not the capsule",
              "**Posterolateral** for the hip AP glide, **anteromedial** for the PA; the acetabulum is not facing straight out",
            ],
            [
              { text: "Mobilizing from neutral forever", variant: "name" },
              "Gains that stop early, because the tissue you need to lengthen is never loaded",
              "Comfortable and well tolerated",
              "As irritability drops, progressively pre-position toward the end range you are trying to gain",
            ],
            [
              { text: "Grade III–IV on a high-irritability joint", variant: "name" },
              "A flare that costs days and the patient's trust",
              "Justified by how stiff the numbers look",
              "**Irritability sets the dose, not the diagnosis.** When the history and the end feel disagree, treat to the more irritable of the two for the first session",
            ],
            [
              { text: "Mobilizing a hypermobile joint", variant: "name" },
              "More laxity in a joint whose problem was never stiffness",
              "The joint moves nicely under your hands",
              "Grade the joint play first; **4 and above is a stop**, not a gentler technique",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Technique, every time:",
          body: "use your body rather than arm strength and let gravity assist; your body and the mobilizing hand act as one unit; stabilize one side of the joint while mobilizing the other; broad contact; **keep the lever arm short — as close to the joint surface as possible**; the forearm angle determines the mobilization angle; take up the soft tissue slack first; and be able to say afterward what you felt.",
        },
      ],
    },
    {
      id: "contra",
      navLabel: "Contra",
      title: "When you do not mobilize at all",
      blocks: [
        {
          kind: "lede",
          text: "The absolute list is a stop. The relative list is a conversation — with the referring provider, with the patient, and with yourself about whether a lower grade in a different position would do.",
        },
        {
          kind: "table",
          columns: ["Absolute", "Relative"],
          rows: [
            [{ text: "Malignancy in the area of treatment", variant: "name" }, "Excessive pain or swelling"],
            [{ text: "Infectious arthritis", variant: "name" }, "Arthroplasty / joint replacement"],
            [{ text: "Metabolic bone disease", variant: "name" }, "Pregnancy"],
            [{ text: "Fusion or ankylosis", variant: "name" }, "Hypermobility"],
            [{ text: "Osteomyelitis", variant: "name" }, "Spondylolisthesis"],
            [{ text: "Fracture", variant: "name" }, "Rheumatoid arthritis"],
          ],
        },
        {
          kind: "footnote",
          text: "One further entry in the source deck's relative-contraindication list appears to be a typographical error rather than a clinical item, and is omitted here.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Two of these are already on the page.",
          body: "Hypermobility is the top half of the 0–6 scale, and an empty end feel — fracture, abscess, acute joint inflammation — is how several of the absolute entries first present in front of you. You are unlikely to be told a contraindication; you are likely to feel one.",
        },
      ],
    },
    {
      id: "drill",
      navLabel: "Drill",
      title: "Rapid drill",
      note: "answer before you open",
      blocks: [
        { kind: "heading", text: "Cases — pick the joint, the direction, the grade" },
        {
          kind: "lede",
          text: "For each, say whether this joint should be mobilized at all, in which direction and why, at which grade, and what dose.",
        },
        {
          kind: "cases",
          items: [
            {
              scenario:
                "Hip, 58 years old. Groin pain, morning stiffness under an hour. IR is the most limited motion at 20°, flexion and IR both about 15° short of the other side, and the end feel is firm in every direction. Long axis traction eases the pain. Pain 5/10, settles over an hour or two.",
              lines: [
                { label: "Mobilize?", body: "Yes — capsular end feel with a loss in every direction, and joint play hypomobile. This is the hip OA presentation, and relief with distraction confirms the joint surface is the source." },
                {
                  label: "Direction:",
                  body: "Loss in every direction is not a direction problem. **Lateral distraction with a belt** opens the joint in all directions at once; add the AP glide, posterolateral, for the flexion and IR specifically.",
                },
                { label: "Grade:", body: "Moderate irritability — symptoms at the end feel, settling in a reasonable time. Grade II–III, progressing as tolerance allows." },
                {
                  label: "Dose:",
                  body: "3 bouts of 30 seconds to 1 minute with 30 seconds rest, oscillating 2–3 per second. Ease out with 5–10 seconds of grade I–II, then 3 × 30 active reps into the range you gained.",
                },
                { label: "Reassess with:", body: "IR range and the flexion deficit against the other side, after every round of three bouts." },
              ],
            },
            {
              scenario:
                "Shoulder, 19-year-old volleyball hitter. Hypermobile elsewhere, more than a third of the humeral head sits forward of the acromion, ER 105° and IR 45° at 90° of abduction. Anterior pain in late cocking.",
              lines: [
                {
                  label: "Mobilize?",
                  body: "**Not the anterior capsule** — that is the lax side, and an anterior glide here makes the problem worse. The stiff structure is posterior: total arc 150° against a 165–180° normal, with IR down against a high ER.",
                },
                { label: "Direction:", body: "**Posterior glide**, posterolateral, with the hand lateral to the coracoid — the convex rule applied to the restricted IR." },
                { label: "Grade:", body: "Moderate irritability. Grade II–III, in about 50° of abduction with slight horizontal adduction and ER; take up slack by adding IR as mobility improves." },
                {
                  label: "The trap:",
                  body: "Reading generalized laxity as a reason not to mobilize anything. Joint play is graded per direction, not per patient — this shoulder is hypermobile anteriorly and hypomobile posteriorly at the same time.",
                },
                { label: "Then:", body: "Supine IR with the head blocked from translating forward, and subscapularis strengthening. The mobilization buys the range; the motor control keeps it." },
              ],
            },
            {
              scenario:
                "Shoulder, 52 years old. Three months of progressive stiffness with no injury, aching at rest, waking at night. PROM is barely more than AROM, worst into ER, then abduction, then IR. The end feel is empty before you reach end range.",
              lines: [
                { label: "Mobilize?", body: "Yes, but the end feel decides the dose before the pattern decides the direction. Empty before end range is the top of the irritability scale." },
                { label: "Direction:", body: "The capsular pattern with ER worst points at the anterior capsule — posterior-to-anterior humerus, prone, with ER added to wind up the capsule once it is tolerated." },
                {
                  label: "Grade:",
                  body: "**Grade I–II only**, 10–30 second bouts, bolstered in the open packed position. No end-range work and no grade III–IV, however tempting the numbers look.",
                },
                {
                  label: "Reassess with:",
                  body: "Pain at rest and the size of the pain-free range — not end range. If the range does not improve within the session you are dealing with shortness rather than stiffness, and the timeline is longer.",
                },
                { label: "The trap:", body: "Treating stiffness aggressively because the numbers are low. Irritability sets the dose, not the diagnosis." },
              ],
            },
          ],
        },
        { kind: "heading", text: "Single facts" },
        {
          kind: "drill",
          items: [
            {
              question: "PROM is limited with a muscular end feel. Which mobilization?",
              answer:
                "None. A muscular end feel routes you to length testing, soft tissue mobilization and contract-relax. Joint play is assessed for a capsular end feel or to confirm hypermobility — mobilizing here treats a joint that is not restricted.",
            },
            {
              question: "Why does the hip AP glide go posterolateral rather than straight posterior?",
              answer:
                "Because the acetabulum is not facing straight out. The glide has to run along the joint surface, and a straight posterior push meets the rim instead — solid resistance that reads like a capsule and is not one. The PA glide is anteromedial for the same reason.",
            },
            {
              question: "Which grade for pain, which for length, and what separates them?",
              answer:
                "I and II for pain — small amplitude at the beginning of range and large amplitude in mid-range, both before resistance begins, both moving synovial fluid. III and IV for length — large amplitude reaching the end and small amplitude at the very end, both into resistance, both producing plastic deformation of capsular tissue. What separates them is where in the range they happen, not how hard you push.",
            },
            {
              question: "Joint play grades 5 out of 6. What do you do?",
              answer:
                "Not mobilization. Four and above is hypermobility: stability through exercise or taping, and check ligament integrity. Six is a referral. At the hip this pattern with excessive ER and extension and clicking in the history is the labral presentation.",
            },
            {
              question: "What is the open packed position, and name it for both joints on this page.",
              answer:
                "The position in the range where the joint is under least stress and the capsule has its greatest capacity. Hip: 30° flexion, 30° abduction, slight external rotation. Glenohumeral: about 50° of abduction with slight horizontal adduction and slight ER. Assess and treat from here — assessing outside it reads soft tissue tension as joint stiffness.",
            },
            {
              question: "A shoulder is limited into flexion and abduction with a capsular end feel. Which glide, and why that one?",
              answer:
                "Inferior, with a slight lateral component. The convex humeral head has to descend in the glenoid for the shaft to rise; a capsule that stops it is what crowds the greater tuberosity against the acromion. Use long-axis traction instead if the shoulder is more irritable.",
            },
            {
              question: "Standard dose, start to finish.",
              answer:
                "Three bouts of 30 seconds to 1 minute with 30 seconds rest, oscillating 2–3 per second — 10–30 seconds per bout at grade I–II, 60 at III–IV. After a grade III or IV, ease out with 5–10 seconds of grade I–II. A 30-second end-range stretch may follow each round. Then 3 × 30 active reps in pain-free range, and reassess after every round of three bouts.",
            },
            {
              question: "Why is the SC caudal glide used to gain scapular elevation, when elevation goes up?",
              answer:
                "The convex rule. At the sternoclavicular joint the moving partner is convex in that plane, so roll and glide oppose each other: the bone rises while the surface must glide caudad. It is the clearest small-joint example of why you derive the direction from the rule rather than from the motion you want.",
            },
            {
              question: "Roll without slide — what actually happens, and why does it matter here?",
              answer:
                "The contact point runs off the end of the surface and the two bones are driven together instead of one spinning in place. That compression is abnormal joint mechanics and a source of pain, and it is the mechanism behind impingement at the shoulder. It is the argument for restoring the glide rather than only stretching the muscle.",
            },
            {
              question: "You gained 15° in the session. What do you do before the patient leaves, and what does the gain tell you?",
              answer:
                "Have them use it — 3 × 30 active reps in pain-free range — then reassess with the same measurement. Range gained within the session means you were dealing with stiffness; range that does not budge after a full round means genuine shortness and a longer timeline.",
            },
            {
              question: "Name three ways an assessment reads stiffness that is not there.",
              answer:
                "Assessing outside the open packed position, so capsular and ligamentous tension reads as joint stiffness; failing to take up the soft tissue slack, so skin and muscle travel before the bone does; and a long lever arm, which produces torque rather than translation and lets everything between your hand and the joint into the reading. Failing to stabilize the proximal partner does the opposite — it makes a stiff joint feel generous.",
            },
            {
              question: "The history says high irritability and the end feel says low. What do you do?",
              answer:
                "Treat to the more irritable of the two for the first session, then reassess. Under-dosing costs you one visit; over-dosing costs you their trust and can flare them for days.",
            },
          ],
        },
      ],
    },
  ],
  footer:
    "**About this guide.** Assembled from the joint mobilization material carried in the shoulder and hip playbooks, which in turn compile a joint mobilization lecture, the examination-and-treatment labs for both regions, and the examination-process framework.\n**Quoted from those sources:** the Maitland grade definitions, the oscillation rate and bout lengths, the standard dose and the easing-out sequence, the 0–6 joint play scale, the open packed positions for both joints, the concave and convex rules, every technique set-up and force direction, the contraindication lists, and the irritability framework that grades them.\n**Supplied here rather than quoted:** the ordering of the decision, the end-feel routing table in §03, the restriction-to-glide table in §04, and the errors table in §07, which collect into one place what the two regional playbooks state separately or in passing.\n**Every technique on this page also appears in its own region's playbook** — this one is the decision, not a replacement for either. Verify any number against current literature before using it to weight a clinical decision.",
};
