/**
 * The hip examination playbook — the second Limbic Playbook (see lib/playbook-content.ts
 * for the block types every field here uses, docs/playbook-authoring.md for the brief it
 * is written against, and components/playbook/PlaybookFigures.tsx for the diagrams the
 * `figure` blocks name).
 *
 * Ordered the way the examination is actually performed: interview and irritability, then
 * posture, then the functional task, then AROM and PROM with end feel, then muscle length,
 * then muscle performance, then special tests, then joint play — and the mobilization,
 * soft tissue work and exercise that the end feel and irritability route you to. The
 * differential section is the matrix the whole sequence feeds.
 *
 * Content is standard musculoskeletal curriculum material. Normative hip ranges and the
 * goniometer set-ups are supplied from standard goniometry references rather than quoted
 * from the course material, which does not list them — the `footer` says which is which.
 */

import type { Playbook } from "@/lib/playbook-content";

export const HIP_PLAYBOOK: Playbook = {
  slug: "hip",
  name: "Hip Examination",
  title: "Hip Examination Playbook",
  eyebrow: "Musculoskeletal practice · examination & treatment",
  summary:
    "A full hip screen in the order you'd perform it: the question that narrows the list, the number that separates normal from a finding, and the mobilization, soft tissue technique or exercise that finding points to. Bring a goniometer and a mobilization belt.",
  stamp: [
    { value: "34", label: "exam items" },
    { value: "12", label: "differential entries" },
    { value: "5", label: "pain locations" },
    { value: "3", label: "irritability levels" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "34 Items",
      title: "The examination sequence",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Thirty-four items in the order they're performed. Two things drive the order: position — standing, then sitting, then supine, then sidelying, then prone — and irritability, which keeps the provocative tests until the end. The last column is the finding itself: the number or observation that turns the item into information.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "intake-form",
              name: "Read the intake form before you speak",
              how: "Date and mechanism of injury, chief complaint, easing and aggravating positions, body diagram, best/worst pain rating, whether symptoms are constant or activity-dependent.",
              finding: "The aggravating activity named here is your **concordant sign** — the functional task you will test and the one you re-assess against",
            },
            {
              id: "moi",
              name: "Mechanism and nature of injury",
              how: "How did you hurt it, how long ago? Traumatic, insidious, idiopathic, or iatrogenic?",
              finding: "MOI names the phase of healing and the tissue. **No MOI in an older adult with weight-bearing pain is a fracture screen**, not a strain",
            },
            {
              id: "pain-location",
              name: "Point to it with one finger",
              how: "Where exactly, how long does it last, does it stay there or travel below?",
              finding: "One of five zones — lateral thigh · buttock · groin and inner thigh · local trochanteric · anterior hip and groin. Pain travelling distally raises lumbar referral",
            },
            {
              id: "hip-specific-qs",
              name: "Hip-specific ortho questions",
              how: "Pinching? Catching? Clicking? Can you weight bear through it?",
              finding: "Pinching or catching → impingement or FAI · clicking → labrum · cannot weight bear → refer before you test further",
            },
            {
              id: "red-flags",
              name: "Red flag and systemic screen",
              how: "Unexplained weight loss, fever, night pain that doesn't match the MOI, neurological change, cardiac / respiratory / GI / GU history.",
              finding: "Any positive: this region takes referred pain from sepsis, tumour, RA variants, appendicitis, endometriosis, UTI and testicular torsion. Refer at any point in the cycle",
            },
            {
              id: "irritability",
              name: "Grade irritability out loud",
              how: "Pain rating, night and rest pain, and reported disability on the outcome tool, taken together — then confirm it against the end feel during PROM.",
              finding: "[[pill:h|High]] ≥7/10, consistent night or rest pain · [[pill:m|Moderate]] 4–6/10, intermittent · [[pill:l|Low]] ≤3/10, none. **This sets the mobilization grade before you have a diagnosis**",
            },
            {
              id: "outcome-tool",
              name: "Standardized self-report tool",
              how: "HAGOS for young-to-middle-aged, active patients with longstanding hip or groin pain; WOMAC for hip OA.",
              finding: "HAGOS: 6 dimensions, **100 is optimal**, smallest detectable change 17.7–33.8 points. WOMAC: 24 items, 96 is the worst score, converted to a percentage",
            },
            {
              id: "posture-front",
              name: "Posture — front view",
              how: "Standing, dominant eye aligned midline between the two parts you're comparing. Base of support, genu valgum/varum, iliac crest height, foot and toe direction.",
              finding: "Toe-out suggests retroversion, toe-in suggests anteversion beyond the normal **≈15°** — or a rotated tibia. Confirm prone; never call version from the feet",
            },
            {
              id: "posture-side",
              name: "Posture — side view, against the plumb line",
              how: "Plumb line slightly anterior to the lateral malleolus, slightly anterior to the knee axis, through the greater trochanter, the shoulder axis, and the auditory meatus.",
              finding: "Normal pelvic tilt is **15° anterior**. A segment that moves forward of the line usually has a partner that moves back — read the whole chain, not one joint",
            },
            {
              id: "posture-back",
              name: "Posture — back view, then feet apart",
              how: "Base of support, femoral IR/ER, greater trochanter symmetry, iliac crest height. Then widen the stance and look again.",
              finding: "One trochanter more forward = medial rotation of that femur. **The lower pelvis is on the side of the short muscles**; if the pelvis levels with the feet apart, abductor (glute med / TFL) stiffness caused it, not a bony asymmetry",
            },
            {
              id: "task-baseline",
              name: "Functional task — take the baseline first",
              how: "Ask about symptoms before they start the aggravating activity.",
              finding: "Without a pre-task baseline you cannot attribute anything that appears during the task to the task",
            },
            {
              id: "gait-sagittal",
              name: "Gait — sagittal plane",
              how: "Watch pelvic and femoral position in terminal stance, and hip flexion at initial contact and terminal swing.",
              finding: "**20–25° hip flexion** at terminal swing / initial contact and **10–20° hip extension** in terminal stance — the two course sources give different figures (see §07)",
            },
            {
              id: "gait-frontal",
              name: "Gait — frontal plane at loading response",
              how: "Watch the contralateral (unloaded) pelvis from behind through loading response into midstance.",
              finding: "**Contralateral pelvis drops 4–7°**, controlled eccentrically by the stance-side abductors, whose demand peaks here. More drop, or a trunk lean toward the stance leg, is a gluteus medius limp",
            },
            {
              id: "gait-transverse",
              name: "Gait — transverse plane",
              how: "Counter-rotation of pelvis against shoulders; foot progression angle.",
              finding: "Total pelvic rotation **8–10°** (5° forward at IC, 5° back at terminal stance); foot progression **4–7° toe-out** is normal",
            },
            {
              id: "single-leg-stance",
              name: "Single leg stance",
              how: "From behind, watch the pelvis in the frontal plane. Neutral, Trendelenburg, or compensated Trendelenburg. Hold it for at least 30 seconds.",
              finding: "**Pelvis should not drop more than 2 cm** relative to the other side. Pain within **30 seconds** of single-leg standing is highly specific for greater trochanteric pain syndrome",
            },
            {
              id: "squat",
              name: "Double leg squat",
              how: "Watch depth, knee alignment, trunk angle, and which joint initiates.",
              finding: "Quad-dominant (upright torso, greater forward shin angle) vs hip-dominant (forward torso, lesser shin angle). **The strategy is the finding, not the depth**",
            },
            {
              id: "task-specific",
              name: "The patient's own task",
              how: "In and out of a car, on and off an e-bike, sleeping on one side, lunges, landing from a jump — whatever they named on the intake form.",
              finding: "Quantity, quality, symptom reproduction, and *whether modifying it reduces the symptom* — a modifiable task is your first treatment and your patient education",
            },
            {
              id: "arom-supine",
              name: "AROM supine — flexion, IR, ER, abduction, adduction",
              how: "Supine. Estimate; if you cannot estimate within **5°**, use the goniometer.",
              finding: "Compare with the uninvolved side and note symptom reproduction. Full AROM with a failed functional task sends you to PROM; limited AROM keeps you here asking why",
            },
            {
              id: "arom-extension",
              name: "AROM extension in prone",
              how: "Prone, knee extended, pelvis stabilized so the lumbar spine doesn't supply the range.",
              finding: "Lumbar extension or anterior pelvic tilt substituting for hip extension is the fake — block it and re-read the number",
            },
            {
              id: "prom-flexion",
              name: "PROM hip flexion + end feel",
              how: "Supine, knee flexed, to end range. Name the end feel, and note when the symptom arrives relative to it.",
              finding: "Normal end feel is **soft tissue approximation**. Symptoms *before* the end feel = high irritability · *at* the end feel = moderate · only with overpressure, or not at all = low",
            },
            {
              id: "prom-rotation",
              name: "PROM hip IR and ER + end feel",
              how: "Supine 90/90, pelvis stabilized. Report the range and the end feel for each.",
              finding: "Capsular end feel with **IR the most limited motion** is the hip OA pattern. **Hip IR < 24°**, or IR and flexion 15° less than the other hip, is one of the four OA cluster criteria",
            },
            {
              id: "prom-abd",
              name: "PROM abduction and adduction",
              how: "Supine, stabilize the opposite ASIS; keep the leg in the frontal plane and in neutral rotation.",
              finding: "Lateral pelvic tilt is the fake — the range ends when the pelvis starts to move, not when the leg stops",
            },
            {
              id: "log-roll",
              name: "Log roll",
              how: "Supine, leg relaxed in neutral; roll the whole limb into IR and ER without loading the joint.",
              finding: "Pain on passive rotation with **no other structure moved** is the most intra-articular of the screens — it moves only the femoral head in the acetabulum",
            },
            {
              id: "prone-version",
              name: "Prone anteversion / retroversion test",
              how: "Prone, **hip in 15° abduction** to reduce the influence of the TFL, knee at 90°. Measure ER and IR and compare them.",
              finding: "**ER more than 20° greater than IR → retroversion. IR 15–20° greater than ER → excessive anteversion.** This is the structural explanation for the rotation asymmetry you saw standing",
            },
            {
              id: "thomas-1",
              name: "Thomas test, attempt 1 — relative flexibility",
              how: "Supine at the table edge, contralateral hip held so the lumbar spine is flat. Palpate the anterior lip of the ASIS only, and lower the test leg.",
              finding: "**If the pelvis moves before the thigh is parallel, the hip flexors are stiffer than the abdominals** — that is relative stiffness, not shortness. Then abduct the leg: coming down on abduction implicates the TFL",
            },
            {
              id: "thomas-2",
              name: "Thomas test, attempt 2 — true shortness",
              how: "Now stabilize the pelvis toward a posterior tilt and lower the leg again. If it doesn't reach, abduct; if it still doesn't, extend the knee.",
              finding: "Thigh should rest horizontal or slightly below with the knee at **80–90°** and the hip extending to at least **0°**. Reaches on abduction → TFL short · reaches on knee extension → rectus femoris short · neither → iliopsoas",
            },
            {
              id: "hamstring-90-90",
              name: "90/90 hamstring length, then contract-relax",
              how: "Supine, hip at 90°, knee passively extended to end range. Measure the knee-extension deficit, apply contract-relax, re-measure.",
              finding: "The deficit in degrees **and the change after one round**. A gain within the session means stiffness; no gain means true shortness",
            },
            {
              id: "piriformis-length",
              name: "Piriformis length, then stretch or PIR",
              how: "Hip flexed to 90°, then **external rotation and adduction**; gentle compression only if it isn't painful.",
              finding: "Reproduction of *their* buttock pain plus a side-to-side difference. Buttock pain alone also fits hamstring origin, SIJ and lumbar referral — the side-to-side range is what separates them",
            },
            {
              id: "static-tests",
              name: "Static resisted tests in open pack",
              how: "Open pack is **30° flexion, 30° abduction, slight ER**. Establish a baseline pain level first, then resist hip flexors, adductors, abductors and hamstrings without letting the joint move.",
              finding: "Report all four Cyriax outcomes: **strong and painless · strong and painful · weak and painless · weak and painful.** Open pack is what keeps the load on contractile tissue instead of the capsule",
            },
            {
              id: "movement-faults",
              name: "Muscle performance — movement fault before MMT",
              how: "Watch the movement first, palpating the muscles you expect to fire; correct the pattern; only then grade the traditional MMT.",
              finding: "TFL-dominant abduction · hamstring-dominant prone extension · excessive seated hip flexion. **A muscle that grades strong in isolation can still be the wrong one firing first**",
            },
            {
              id: "mmt",
              name: "Traditional MMT, in the corrected position",
              how: "Abduction in abduction with slight extension and slight ER; glute max prone with the knee flexed; hip flexion with slight ER; IR and ER through full active range against the inside and outside of the knee.",
              finding: "The grade, paired with whether the correction changed it — a grade that improves after cueing is a motor control finding, not a strength one",
            },
            {
              id: "special-fadir",
              name: "FADIR",
              how: "Flex hip and knee to 90°, internally rotate to end range, then adduct. If negative, flex to end range, IR to end range, then adduct.",
              finding: "Stiffness or pain — deep pinching at end-range flexion with IR is the FAI presentation. Positive FADIR also fits a labral tear; it does not separate them",
            },
            {
              id: "special-scour",
              name: "Scour / quadrant",
              how: "Supine, hip flexed and adducted; compress through the femur while sweeping the hip through an arc from adduction to abduction.",
              finding: "A non-specific intra-articular provocation — a positive result means joint, not which tissue in it",
            },
            {
              id: "long-axis-distraction",
              name: "Long axis distraction as a diagnostic",
              how: "Supine, belt or towel around the ankle, stand at the foot of the table and lean back to take up the slack; slight abduction may be added.",
              finding: "**Relief with distraction points at the joint surface itself** — it is the hip OA differentiator in every one of the five pain-location patterns",
            },
            {
              id: "joint-play",
              name: "Joint play from open pack",
              how: "Only when PROM is limited **with a capsular end feel**, or to confirm hypermobility. Open pack = 30° flexion, 30° abduction, slight ER. Stabilize the proximal partner, broad contact, short lever, take up soft tissue slack first.",
              finding: "Grade on the **0–6 scale: 0 ankylosis · 1–2 hypomobile · 3 normal · 4–5 hypermobile · 6 unstable.** Traction is perpendicular to the treatment plane, glide is parallel to it",
            },
            {
              id: "palpation",
              name: "Palpation — last, and only where you already have a hypothesis",
              how: "Palpate within the area of pain and the muscles that limited PROM with a muscular end feel. Named landmarks: AIIS 2 cm distal and 1 cm medial to the ASIS, ischial tuberosity, posterolateral greater trochanter, pectineus and adductor longus around the femoral pulse.",
              finding: "**Point tenderness over the posterolateral greater trochanter is ~80% sensitive for GTPS** — its absence largely rules GTPS out. Tenderness elsewhere refers and misleads; only pair it with a positive test in the same direction",
            },
          ],
        },
      ],
    },
    {
      id: "numbers",
      navLabel: "Numbers",
      title: "The numbers this examination is measured against",
      blocks: [
        {
          kind: "lede",
          text: "Structural norms, gait kinematics, the thresholds that define a positive test, and the doses. Everything below is a number you should be able to produce without looking it up.",
        },
        {
          kind: "numbers",
          cells: [
            { value: "≈15°", label: "Normal femoral anteversion" },
            { value: "15°", label: "Normal standing anterior pelvic tilt" },
            { value: "4–7°", label: "Normal foot progression angle, toe-out" },
            { value: "8–10°", label: "Total pelvic rotation in gait, transverse plane" },
            { value: "4–7°", label: "Contralateral pelvic drop in loading response" },
            { value: "2 cm", label: "Maximum pelvic drop in single leg stance" },
            { value: "20°", label: "Hip hyperextension, trailing limb at terminal stance" },
            { value: "20°", label: "Hip flexion, reaching limb at terminal swing" },
            { value: "10° DF", label: "Trailing-limb ankle at terminal stance" },
            { value: "5°", label: "Pelvic rotation each way — forward at IC, back at TSt" },
            { value: "< 24°", label: "Hip IR that meets the OA cluster criterion" },
            { value: "15°", label: "IR + flexion deficit vs the other hip — OA cluster" },
            { value: "< 1 hr", label: "Morning stiffness that fits OA rather than inflammatory arthritis" },
            { value: "> 20°", label: "ER exceeding IR prone → femoral retroversion" },
            { value: "15–20°", label: "IR exceeding ER prone → excessive anteversion" },
            { value: "80–90°", label: "Knee flexion held in a normal Thomas test" },
            { value: "0°", label: "Hip extension a normal Thomas test must reach" },
            { value: "30 / 30", label: "Open pack: 30° flexion, 30° abduction, slight ER" },
            { value: "0 – 6", label: "Joint play scale; 3 is normal, 1–2 hypo, 4–5 hyper" },
            { value: "2–3 / sec", label: "Mobilization oscillation rate" },
            { value: "10–30 s", label: "Grade I–II bout length" },
            { value: "60 s", label: "Grade III–IV bout length" },
            { value: "3–6 s", label: "Isometric hold for contract-relax and PIR" },
            { value: "20–75%", label: "MVIC for the contract-relax hold (ACSM)" },
            { value: "13.3° @ 64.3%", label: "Modelled peak ROM gain and the intensity that produces it" },
            { value: "10–30 s", label: "Stretch phase after the contraction" },
            { value: "≥ 60 s", label: "Total stretching time per muscle per session (ACSM)" },
            { value: "2–4 × 8–12", label: "Sets × reps for resistance exercise (ACSM)" },
            { value: "2–3 / wk", label: "Frequency for both strengthening and stretching" },
            { value: "30 s", label: "Single leg stance time within which GTPS pain is specific" },
            { value: "≈80%", label: "Sensitivity of posterolateral trochanteric tenderness for GTPS" },
            { value: "17.7–33.8", label: "HAGOS points — smallest detectable change" },
          ],
        },
        {
          kind: "footnote",
          text: "Gait figures come from the Perry-based gait review; the ROM norms in §08 are supplied from standard goniometry references, not from the course material. See the footer.",
        },
      ],
    },
    {
      id: "subjective",
      navLabel: "Subjective",
      title: "The interview, and what it commits you to",
      blocks: [
        {
          kind: "lede",
          text: "The subjective is not history-taking for the chart. Every answer either raises a structure you must test later or a system you must refer for now.",
        },
        {
          kind: "table",
          columns: ["Question", "Why you ask it", "The answer that changes what you do"],
          rows: [
            [
              { text: "How did you hurt it, how long ago?", variant: "name" },
              "Names the cause as traumatic, insidious, idiopathic or iatrogenic, and fixes the phase of healing",
              "Trauma with difficulty weight bearing, especially in an older adult with osteoporosis → femoral neck or pelvic ring fracture; **immediate medical attention**, not an examination",
            ],
            [
              { text: "Point to it — where exactly, how long does it last?", variant: "name" },
              "Sorts the patient into one of five pain-location patterns before you touch them",
              "Pain that moves distally, or doesn't stay in the zone, means the lumbar spine and SIJ are on the list — **both commonly refer to the hip**",
            ],
            [
              { text: "Pinching or catching? Clicking?", variant: "name" },
              "The hip's region-specific ortho question",
              "Pinching/catching → impingement or FAI. Clicking → labrum. Both send you to FADIR, log roll and a hypermobility screen",
            ],
            [
              { text: "Can you weight bear through it?", variant: "name" },
              "Separates an examination from a referral",
              "Inability to bear weight, ambulate, flex or rotate → fracture or avascular necrosis pathway",
            ],
            [
              { text: "Any fever, weight loss, night pain that doesn't fit?", variant: "name" },
              "Non-musculoskeletal screen",
              "Positive → refer. The hip region receives referred pain from sepsis, psoas or pelvic abscess, tumour, osteomyelitis, RA variants, endometriosis, appendicitis, testicular torsion, UTI and GI disorders",
            ],
            [
              { text: "What is difficult or painful to do, and how painful?", variant: "name" },
              "Identifies the structures involved, sets the functional task, and gives the irritability",
              "The activity named becomes the concordant sign — the task you test, modify, and re-assess against",
            ],
          ],
        },
        { kind: "heading", text: "Irritability — two ways to grade it, and they must agree" },
        {
          kind: "table",
          columns: ["Level", "From the interview", "From the end feel during PROM", "What it buys you"],
          rows: [
            [
              { text: "High", variant: "name" },
              "≥ 7/10, consistent night or rest pain, high reported disability",
              "**Symptoms arrive before you reach an end feel**",
              "Grade I–II mobilizations, STM emphasis, pain-free PROM only",
            ],
            [
              { text: "Moderate", variant: "name" },
              "4–6/10, intermittent night or rest pain, moderate disability",
              "Symptoms present **at** the end feel",
              "Grade II–III, end-range holds of 5–15 seconds, STM progressed toward end range",
            ],
            [
              { text: "Low", variant: "name" },
              "≤ 3/10, no night or rest pain, minimal disability",
              "Symptoms only with **overpressure** at the end feel, or none at all",
              "Grade III–IV, sustained holds, maximize total end range time",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Grade irritability twice.",
          body: "The interview version and the end-feel version are different measurements of the same thing. When they disagree — a 7/10 report with symptoms only on overpressure, or a 2/10 report with pain well before end feel — the disagreement is itself the finding, and the end feel is the one your hands can defend.",
        },
        { kind: "heading", text: "Age changes the list before you examine anything" },
        {
          kind: "table",
          columns: ["Presentation", "Age range", "Sex distribution", "Mechanism"],
          rows: [
            [
              { text: "Developmental hip dysplasia", variant: "name" },
              { text: "variable", variant: "num" },
              "Females > males",
              "Acetabulum and femoral head develop with an inadequate containing relationship",
            ],
            [
              { text: "Legg-Calvé-Perthes disease", variant: "name" },
              { text: "4–10 yrs", variant: "num" },
              "Males > females",
              "Temporary interruption of blood supply to the femoral head → transient necrosis, and a head that may not reossify spherically",
            ],
            [
              { text: "Slipped capital femoral epiphysis", variant: "name" },
              { text: "8–15 yrs", variant: "num" },
              "Males > females",
              "The epiphysis displaces on the femoral neck through the physis; risk rises with obesity",
            ],
            [
              { text: "Avulsion injury", variant: "name" },
              { text: "open growth plates", variant: "num" },
              "—",
              "The apophysis fails before the tendon does — AIIS (rectus femoris) or ASIS (sartorius)",
            ],
            [
              { text: "Stress fracture", variant: "name" },
              { text: "athletes", variant: "num" },
              "Female athlete triad",
              "Low energy availability, menstrual dysfunction and low bone mineral density; a prior stress fracture is the strongest single flag",
            ],
            [
              { text: "Hip osteoarthritis", variant: "name" },
              { text: "50 yrs +", variant: "num" },
              "—",
              "Cartilage and joint-surface change; presents with morning stiffness under an hour and an IR-dominant capsular restriction",
            ],
          ],
        },
      ],
    },
    {
      id: "patterns",
      navLabel: "Pain Map",
      title: "Where it hurts → what to test",
      blocks: [
        {
          kind: "lede",
          text: "Five zones. Each one carries its own short list of candidate structures and the specific test that separates them. This is the table that turns the interview into an examination plan.",
        },
        {
          kind: "table",
          columns: ["Pain location", "Candidate source", "The test that addresses it", "The finding that confirms it"],
          rows: [
            { group: "Lateral hip / thigh" },
            [
              { text: "Lateral thigh", variant: "name" },
              "Greater trochanteric pain syndrome",
              "Single leg stance · static test glute med · palpation",
              "Pain within **30 s** of single-leg standing, weak or painful abduction, tenderness at the distal glute med insertion",
            ],
            [
              { text: "Lateral thigh", variant: "name" },
              "Hip osteoarthritis",
              "Long axis distraction",
              "**Distraction relieves** — separating the surfaces unloads the tissue at fault",
            ],
            [
              { text: "Lateral thigh", variant: "name" },
              "Hip flexor strain",
              "Static test hip flexion · palpation",
              "Pain and/or weakness on resisted flexion, tenderness over the iliopsoas tendon or pectineus",
            ],
            [
              { text: "Lateral thigh", variant: "name" },
              "Labral tear",
              "FADIR · log roll · Beighton scale",
              "Positive FADIR with a positive log roll, on a background of generalized hypermobility",
            ],
            { group: "Buttock" },
            [
              { text: "Buttock", variant: "name" },
              "Hamstring strain",
              "Static test knee flexion · passive hamstring stretch · palpation",
              "Pain on resisted knee flexion or hip extension, tenderness at the proximal hamstring insertion on the ischial tuberosity",
            ],
            [
              { text: "Buttock", variant: "name" },
              "Hip osteoarthritis",
              "Long axis distraction",
              "Distraction relieves",
            ],
            [
              { text: "Buttock", variant: "name" },
              "Piriformis · SIJ · lumbar referral",
              "Piriformis length test · lumbar and SIJ screen",
              "Side-to-side length difference **with reproduction of their pain** — buttock pain by itself does not distinguish these three",
            ],
            { group: "Groin and inner thigh" },
            [
              { text: "Groin / inner thigh", variant: "name" },
              "Hip osteoarthritis",
              "Long axis distraction",
              "Distraction relieves; IR is the most limited motion",
            ],
            [
              { text: "Groin / inner thigh", variant: "name" },
              "Adductor strain",
              "Static test hip adduction and flexion · palpation",
              "Pain on resisted adduction, tenderness at adductor longus / pectineus",
            ],
            [
              { text: "Groin / inner thigh", variant: "name" },
              "Femoroacetabular impingement",
              "FADIR",
              "Deep pinching at end-range flexion with IR",
            ],
            [
              { text: "Groin / inner thigh", variant: "name" },
              "Labral tear",
              "FADIR · log roll · Beighton scale",
              "Clicking in the history, hypermobility on examination, excessive ER or extension PROM",
            ],
            { group: "Local trochanteric" },
            [
              { text: "Over the trochanter", variant: "name" },
              "Greater trochanteric pain syndrome",
              "Single leg stance · static test glute med · palpation",
              "Posterolateral trochanteric tenderness (**~80% sensitive**), positive Trendelenburg or derotation test",
            ],
            [
              { text: "Over the trochanter", variant: "name" },
              "Hip osteoarthritis",
              "Long axis distraction",
              "Distraction relieves",
            ],
            { group: "Anterior hip and groin" },
            [
              { text: "Anterior hip", variant: "name" },
              "Hip flexor strain",
              "Static test hip flexion · palpation",
              "Pain and/or weakness with resisted flexion; superficial rather than deep groin pain",
            ],
            [
              { text: "Anterior hip", variant: "name" },
              "FAI or labral tear",
              "FADIR · log roll",
              "Deep pinching end-range flexion/IR (FAI) vs clicking and hypermobility (labrum)",
            ],
            [
              { text: "Anterior hip", variant: "name" },
              "Avulsion injury",
              "Static test rectus femoris and sartorius · palpation",
              "Pain on resisted hip flexion **with the knee extended**, tenderness at the AIIS or ASIS, in a patient with open growth plates",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "hip-pain-map",
          title: "Five zones, and the test that opens each one",
          caption:
            "**Where the finger lands narrows the list before you touch the patient.** Every zone shares hip OA, which is why long axis distraction — the one test that unloads the joint surface rather than provoking a tissue — appears in all five columns. What separates the zones is the second and third entry on each list.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "The lumbar spine and SIJ commonly refer into all of these zones.",
          body: "None of the tests above rules them out. If the pattern doesn't fit, or the pain travels below the zone it started in, screen the spine before you keep testing the hip.",
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
          text: "Ask about resting pain first. Start with gross asymmetry and work toward small differences. Nobody is symmetrical — the question is only whether a given asymmetry explains *this* patient's complaint and *this* functional task.",
        },
        {
          kind: "table",
          columns: ["View", "What you look at", "Normal", "The finding, and what fakes it"],
          rows: [
            [
              { text: "Front", variant: "name" },
              "Base of support · genu valgum/varum · iliac crest height · foot and toe direction",
              "Level crests, feet in **4–7° of toe-out**",
              "Toe-out beyond that suggests retroversion, toe-in suggests anteversion. **Faked by tibial rotation** — the foot tells you nothing about the femur until the prone version test agrees",
            ],
            [
              { text: "Side", variant: "name" },
              "Relation to the plumb line · ankle DF/PF · knee flexion/extension · pelvic tilt · femoral position",
              "Plumb line slightly anterior to the lateral malleolus and knee axis, through the greater trochanter, shoulder axis and auditory meatus; **15° anterior pelvic tilt**",
              "A segment forward of the line with a partner segment back is a balance strategy, not two faults. Always compare with the contralateral side",
            ],
            [
              { text: "Back", variant: "name" },
              "Base of support · femoral IR/ER · greater trochanter symmetry · iliac crest height",
              "Level crests, trochanters level in the frontal and transverse planes",
              "**One trochanter more forward = medial rotation of that femur.** A pelvic asymmetry that levels when the feet are placed apart was abductor stiffness, not a leg length or bony difference",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "The lower pelvis is on the side of the short muscles.",
          body: "This is the rule that turns a pelvic obliquity into a testable hypothesis: stiffness of the abductors — gluteus medius or TFL — on the low side. Scoliotic curvature produces the same picture, which is why the feet-apart re-check matters; a pelvis that levels was muscular.",
        },
        { kind: "heading", text: "The obligated follow-up" },
        {
          kind: "table",
          columns: ["Postural finding", "Then you must measure"],
          rows: [
            [
              { text: "Excessive anterior pelvic tilt", variant: "name" },
              "Hip flexor length (Thomas test, both attempts) · abdominal control · hip extension AROM in prone",
            ],
            [
              { text: "Pelvic obliquity", variant: "name" },
              "Abductor length and stiffness (glute med, TFL) on the low side · re-check with feet apart · leg length if it persists",
            ],
            [
              { text: "Femoral medial rotation / one trochanter forward", variant: "name" },
              "Prone version test in 15° abduction · IR and ER PROM · glute med and deep external rotator performance",
            ],
            [
              { text: "Toe-in or toe-out beyond 4–7°", variant: "name" },
              "Prone version test **and** tibial torsion — the foot cannot tell you which segment is rotated",
            ],
            [
              { text: "Wide or narrow base of support", variant: "name" },
              "Adductor and abductor length; hip position in the frontal plane during single leg stance",
            ],
            [
              { text: "Genu valgum", variant: "name" },
              "Frontal-plane control in single leg stance and squat · hip abductor and external rotator strength",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "femoral-version",
          title: "Version is measured at the femur, not at the foot",
          caption:
            "**Anteversion turns the whole limb inward and trades external rotation for internal.** The neck's angle relative to the femoral condyles is ≈15° normally; more turns the foot in and gives more available IR, less (or negative) turns it out and gives more ER. Prone in 15° of abduction, ER exceeding IR by more than 20° reads as retroversion, and IR exceeding ER by 15–20° as excessive anteversion.",
        },
      ],
    },
    {
      id: "function",
      navLabel: "Function",
      title: "The functional task is the test",
      blocks: [
        {
          kind: "lede",
          text: "Four things, every time: baseline before they move, quantity, quality, and symptom reproduction. Then the fifth — can you modify the task and reduce the symptom? A task you can modify is your first treatment and your patient education in one.",
        },
        { kind: "heading", text: "Gait — critical events at the hip" },
        {
          kind: "table",
          columns: ["Phase", "Plane", "What the hip and pelvis do", "The finding"],
          rows: [
            [
              { text: "Initial contact", variant: "name" },
              "Frontal / transverse",
              "Pelvis level, hip neutral; pelvis rotated **5° forward**",
              "A pelvis already dropped at initial contact has failed before loading even starts",
            ],
            [
              { text: "Loading response", variant: "name" },
              "Frontal",
              "Contralateral pelvis drops **4–7°**, controlled **eccentrically** by the stance-side abductors; abductor demand peaks here",
              "Drop beyond 4–7° = gluteus medius limp. The torque demand here is an *adduction* torque — that is what the abductors are resisting",
            ],
            [
              { text: "Midstance", variant: "name" },
              "Frontal",
              "Abductors work **concentrically** to raise the contralateral pelvis; lateral pelvic movement over the stance limb",
              "No lift, or a trunk lean over the stance leg, is compensation — leaning moves the centre of mass over the hip and reduces the abductor demand",
            ],
            [
              { text: "Terminal stance", variant: "name" },
              "Sagittal / transverse",
              "Trailing hip at **20° hyperextension**, pelvis rotated **5° back**, ankle in **10° DF**; contralateral pelvis stays elevated for swing",
              "Lost hip extension here is the most common source of a shortened step length — and is taken from the lumbar spine instead",
            ],
            [
              { text: "Terminal swing", variant: "name" },
              "Sagittal",
              "Reaching hip at **20° flexion**, knee near extension (5° flex), ankle neutral, pelvis **5° forward**",
              "Step length is the sum of trailing and reaching components — name which one is missing rather than calling the step short",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Two of your sources disagree on the sagittal numbers.",
          body: "The hip lab lists 25° of hip flexion at terminal swing and initial contact and 10° of hip extension in terminal stance; the Perry-based gait review lists 20° of flexion in the reaching limb and 20° of hyperextension in the trailing limb. Neither is a typo. Use them as a range — 20–25° flexion, 10–20° extension — and say which you're quoting.",
        },
        { kind: "heading", text: "Single leg stance" },
        {
          kind: "table",
          columns: ["Presentation", "What you see", "Mechanism", "The finding"],
          rows: [
            [
              { text: "Neutral pelvis", variant: "name" },
              "Pelvis stays level for the duration of the hold",
              "Stance-side abductors generating enough frontal-plane torque to hold the unloaded side up",
              "Negative — and it stays negative for the full 30 seconds, not the first two",
            ],
            [
              { text: "Trendelenburg", variant: "name" },
              "Contralateral (unloaded) pelvis drops",
              "Stance-side hip abductor insufficiency — the primary function of the abductors is preventing the drop of the *unloaded* limb",
              "**Drop of more than 2 cm** compared with the other side",
            ],
            [
              { text: "Compensated Trendelenburg", variant: "name" },
              "Pelvis stays closer to level but the trunk leans **toward** the stance leg",
              "Leaning shifts the centre of mass over the stance hip, shortening the moment arm and reducing the abductor demand",
              "The same abductor failure as a Trendelenburg, hidden by a trunk strategy — watch the trunk, not only the pelvis",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "trendelenburg-drop",
          title: "Three pelvises, one failing muscle",
          caption:
            "**The compensated Trendelenburg is the same abductor failure as an uncompensated one — the trunk has simply moved the load.** Leaning the trunk over the stance hip shortens the moment arm the abductors have to resist, so the pelvis looks better while the muscle is doing less. Grade on the 2 cm drop *and* on where the trunk went.",
        },
        { kind: "heading", text: "Double leg squat" },
        {
          kind: "table",
          columns: ["Strategy", "What it looks like", "What it loads", "The finding"],
          rows: [
            [
              { text: "Quad dominant", variant: "name" },
              "Torso more upright, **greater** forward shin angle",
              "Knee extensors and patellofemoral joint carry more of the descent",
              "Depth achieved with an upright trunk and the knees travelling forward — the hip extensors are contributing less than they should",
            ],
            [
              { text: "Hip dominant", variant: "name" },
              "Torso more forward, **lesser** forward shin angle",
              "Hip extensors and posterior chain carry more of the descent",
              "Not a fault by itself — it becomes one when it is the only strategy available, or when it reproduces anterior hip pain at depth",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "squat-strategy",
          title: "Shin angle and trunk angle trade off against each other",
          caption:
            "**The squat's depth tells you almost nothing; the shin and trunk angles tell you which joint is paying for it.** A more vertical shin moves the demand back to the hip, a more inclined shin moves it forward to the knee. Record the strategy, then see whether the strategy — not the depth — is what reproduces the symptom.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "The question that ends this section:",
          body: "*Do they have the adequate ROM to complete the task better?* If they demonstrate full AROM, move to PROM. If they do not, AROM is the next measurement, and you have already narrowed which motion to take.",
        },
      ],
    },
    {
      id: "rom",
      navLabel: "Range",
      title: "Range, end feel, and what limits it",
      blocks: [
        {
          kind: "lede",
          text: "PROM is packed: physiological range, accessory motion and muscle length all arrive in the same measurement. Quantity, quality, symptom reproduction — and *end feel*, which is what routes you. Capsular sends you to joint play and mobilization; muscular sends you to length work and soft tissue mobilization.",
        },
        {
          kind: "table",
          columns: ["Motion", "Normal", "Position & goniometer", "Normal end feel", "First suspects when it's short"],
          rows: [
            [
              { text: "Flexion", variant: "name" },
              { text: "0–120°", variant: "num" },
              "Supine, knee flexed. Axis greater trochanter · stationary arm lateral midline of the trunk · moving arm lateral midline of the femur toward the lateral epicondyle",
              "Soft tissue approximation",
              "Posterior capsule, glute max; a firm or hard end feel here is capsule or joint surface, not muscle",
            ],
            [
              { text: "Extension", variant: "name" },
              { text: "0–30°", variant: "num" },
              "Prone, knee extended, pelvis stabilized. Same landmarks as flexion",
              "Firm",
              "Iliopsoas, rectus femoris, TFL, anterior capsule — sort them with the two-attempt Thomas test",
            ],
            [
              { text: "Abduction", variant: "name" },
              { text: "0–45°", variant: "num" },
              "Supine. Axis at the ASIS of the tested side · stationary arm along the line joining the two ASISs · moving arm along the anterior femur toward the midline of the patella",
              "Firm",
              "Adductors (longus, brevis, magnus, gracilis), inferior capsule",
            ],
            [
              { text: "Adduction", variant: "name" },
              { text: "0–30°", variant: "num" },
              "Supine, opposite leg abducted out of the way; same landmarks as abduction",
              "Firm",
              "Glute med, TFL/ITB, lateral capsule",
            ],
            [
              { text: "Internal rotation", variant: "name" },
              { text: "0–45°", variant: "num" },
              "Seated with the knee over the edge, or supine 90/90. Axis on the anterior patella · stationary arm vertical · moving arm along the anterior tibial crest. Stabilize the pelvis",
              "Firm",
              "Posterior capsule, deep external rotators, piriformis. **The motion that leads the hip OA capsular pattern**",
            ],
            [
              { text: "External rotation", variant: "name" },
              { text: "0–45°", variant: "num" },
              "Same set-up as IR, rotating the other way",
              "Firm",
              "Anterior capsule, adductors, TFL. Excessive ER with excessive extension is a hypermobility finding, not a good result",
            ],
            [
              { text: "Prone IR / ER in 15° abduction", variant: "name" },
              "Compare the two directly",
              "Prone, hip abducted **15°** to reduce TFL influence, knee at 90°",
              "Firm",
              "This is the version test, not a range test — read the *difference* between the two, not either number alone",
            ],
          ],
        },
        {
          kind: "footnote",
          text: "Ranges and goniometer alignments here are supplied from standard goniometry references (Norkin & White). The course material specifies the positions — supine for flexion, IR, ER, abduction, adduction; prone for extension — and the 5° estimation rule, but does not list normative degrees.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Published hip norms disagree by 10–15°.",
          body: "Hip extension is given as 0–30° by AAOS and as 0–20° elsewhere; abduction appears as both 0–45° and 0–40°. Nothing turns on which you quote as long as you say which — the comparison that carries weight is the uninvolved side, and after that the *direction* of loss. An IR-dominant loss says one thing; a loss in every direction says capsule.",
        },
        { kind: "heading", text: "End feel — normal" },
        {
          kind: "table",
          columns: ["End feel", "What you feel", "Structure meeting", "Hip example"],
          rows: [
            [
              { text: "Bony", variant: "name" },
              "Hard, unyielding, abrupt, painless",
              "Bone on bone",
              "Not normal anywhere in the hip — a hard end feel here reads as OA, loose body or myositis ossificans",
            ],
            [
              { text: "Soft tissue approximation", variant: "name" },
              "Soft compression, painless; tissue meets tissue",
              "Muscle bulk against muscle bulk",
              "**Hip flexion** — the thigh meeting the abdominal region",
            ],
            [
              { text: "Tissue stretch", variant: "name" },
              "Firm, springy, slight give at the end; normal elastic resistance",
              "Capsule, ligament, muscle-tendon unit",
              "Hip extension, abduction, IR and ER",
            ],
          ],
        },
        { kind: "heading", text: "End feel — abnormal, and where it sends you" },
        {
          kind: "table",
          columns: ["End feel", "What you feel", "Causes", "What you do next"],
          rows: [
            [
              { text: "Empty", variant: "name" },
              "No real end feel and no mechanical limit — pain stops the movement before resistance appears; **no resistance is felt**",
              "Fracture · abscess · bursitis · acute joint inflammation · psychogenic",
              "**Stop.** This is a red-flag end feel and a high-irritability presentation. Screen and refer rather than mobilize",
            ],
            [
              { text: "Soft", variant: "name" },
              "Boggy, mushy; occurs earlier or later in the range than it should, in a joint that normally ends firm or hard",
              "Soft tissue oedema · synovitis",
              "Treat the effusion and the irritability; grade I–II for pain, not grade III–IV for range",
            ],
            [
              { text: "Firm", variant: "name" },
              "Occurs earlier or later than usual, in a joint that normally ends soft or hard",
              "Increased muscle tone · connective tissue shortening — capsule, muscle, ligament, fascia",
              "Separate capsular from muscular: **capsular → joint play then mobilization; muscular → length testing, STM, contract-relax**",
            ],
            [
              { text: "Hard", variant: "name" },
              "A bony grating or block, earlier or later than it should be",
              "Fracture · osteoarthritis · chondromalacia · myositis ossificans · loose bodies",
              "Joint surface, not capsule. Long axis distraction to confirm relief, then load management — mobilization will not lengthen bone",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "The capsular pattern of the hip is contested.",
          body: "Your course material lists internal rotation as the most limited motion, then flexion and abduction, with extension behind them. Cyriax's classic description is marked limitation of flexion, abduction and IR with only slight limitation of extension and little of ER, and Kaltenborn orders it differently again. What all of them agree on, and what the OA cluster uses, is that **IR leads** — which is why hip IR below 24° is a criterion and ER is not.",
        },
        {
          kind: "figure",
          figureId: "hip-rom-dial",
          title: "Normal hip range, by plane",
          caption:
            "**Each dial starts from anatomical neutral, with the thick spoke as the starting position.** Rotation is drawn as it is measured — hip and knee at 90°, looking down the femur — which is why its two arcs are equal and the sagittal ones are not. The number you act on is the difference from the other side, not the arc itself.",
        },
      ],
    },
    {
      id: "length",
      navLabel: "Length",
      title: "Length tests read against a landmark, not a feeling",
      blocks: [
        {
          kind: "lede",
          text: "PROM limited by a muscular end feel is a length question. Two things separate a good length test from a stretch: a landmark you watch to know when the next segment starts moving, and a second attempt with that segment stabilized. Relative stiffness and true shortness look identical until you stabilize.",
        },
        {
          kind: "table",
          columns: ["Test", "Position", "What you watch", "The finding", "What fakes a result"],
          rows: [
            [
              { text: "Thomas — attempt 1", variant: "name" },
              "Supine at the table edge, contralateral hip held so the lumbar spine is flat on the table; lower the test leg slowly, fully relaxed",
              "**Palpate only** — the anterior lip of the ASIS, to feel when the pelvis begins to move",
              "Pelvis moving before the thigh is parallel = **the hip flexors are stiffer than the abdominals**. That is relative stiffness, not shortness. Then abduct the leg — coming down with abduction implicates the TFL",
              "Letting the lumbar spine extend, or the patient holding their own leg too loosely, gives you range that came from the pelvis",
            ],
            [
              { text: "Thomas — attempt 2", variant: "name" },
              "Same, but you now stabilize the pelvis toward a **posterior tilt**, then lower the leg again",
              "Whether the thigh reaches the table; then abduct; then extend the knee",
              "Normal: thigh horizontal or slightly below, knee flexed **80–90°**, hip extending to at least **0°**. Reaches on abduction → **TFL** short · reaches on knee extension → **rectus femoris** short · neither → **iliopsoas**",
              "Not stabilizing the pelvis, which converts a true-shortness test back into a relative-stiffness test",
            ],
            [
              { text: "90/90 hamstring", variant: "name" },
              "Supine, hip held at 90°, knee passively extended to end range",
              "The knee-extension deficit from full extension, measured, both sides",
              "The deficit in degrees — **and the change after one contract-relax round.** A gain within the session means stiffness; no gain means true shortness",
              "Letting the test hip drift out of 90°, or letting the pelvis posteriorly tilt, both inflate the range",
            ],
            [
              { text: "Piriformis length", variant: "name" },
              "Hip flexed to **90°**, then external rotation and adduction; gentle compression only if it isn't painful",
              "Side-to-side range and whether their buttock pain reproduces",
              "Reproduction of *their* symptom with a side-to-side difference. Treatment is to stay in position for a prolonged stretch, or PIR",
              "Buttock pain alone — hamstring origin, SIJ and lumbar referral all produce it. Only the side-to-side length difference is specific to length",
            ],
            [
              { text: "Prone version test", variant: "name" },
              "Prone, hip in **15° abduction** to reduce TFL influence, knee at 90°",
              "ER and IR measured and compared with each other, not with a norm",
              "**ER > IR by more than 20° → retroversion · IR > ER by 15–20° → excessive anteversion**",
              "Testing without the 15° of abduction lets TFL tension bias the rotation and shifts the comparison",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "thomas-sort",
          title: "One test position, three muscles, sorted by which correction brings the leg down",
          caption:
            "**The Thomas test doesn't measure hip flexor length — it sorts which hip flexor.** With the pelvis stabilized, the leg that comes down only when you abduct is held by the TFL; the leg that comes down only when you extend the knee is held by the rectus femoris; the leg that does neither is held by the iliopsoas. Attempt 1, palpating the ASIS without stabilizing, answers a different question: whether the hip flexors are simply stiffer than the abdominals.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Relative stiffness is not a weaker version of shortness.",
          body: "It is a different finding with a different treatment. Relative stiffness — the pelvis moving first because the hip flexors resist less than the trunk allows — is treated by teaching the patient to stabilize the abdominals while you work the hip flexors. True shortness is treated with contract-relax in the Thomas position, in two variations: neutral, and with a TFL bias in adduction.",
        },
      ],
    },
    {
      id: "muscle",
      navLabel: "Muscle",
      title: "Static tests, movement faults, then MMT",
      blocks: [
        {
          kind: "lede",
          text: "Static testing differentiates contractile from inert tissue: muscle, tendon, and the tendon–bone junction. It is done in open pack — **30° flexion, 30° abduction, slight external rotation** — precisely so the capsule and ligaments are slack and the load falls on the contractile unit.",
        },
        {
          kind: "table",
          columns: ["Result", "Reads as", "What it points to"],
          rows: [
            [{ text: "Strong and painless", variant: "name" }, "Normal contractile unit", "Look elsewhere — this direction is not the source"],
            [
              { text: "Strong and painful", variant: "name" },
              "Minor lesion of the contractile unit",
              "Strain or tendinopathy of the muscle tested — pair it with palpation of that insertion",
            ],
            [
              { text: "Weak and painless", variant: "name" },
              "Complete rupture, or a neurological cause",
              "Full-thickness tear, or nerve root / peripheral nerve involvement — go to the neuro screen",
            ],
            [
              { text: "Weak and painful", variant: "name" },
              "Serious pathology, or pain inhibition",
              "Fracture, neoplasm, or a substantial lesion. Also the pattern pain inhibition produces, which is why you establish a **baseline pain level first**",
            ],
          ],
        },
        { kind: "heading", text: "Movement fault first, MMT second" },
        {
          kind: "table",
          columns: ["Direction", "The fault to look for", "Mechanism", "The corrected MMT position", "The finding"],
          rows: [
            [
              { text: "Abduction", variant: "name" },
              "**TFL dominant** — the leg drifts into flexion and internal rotation as it abducts",
              "TFL substitutes for gluteus medius; palpate glute med, TFL and the pelvis simultaneously to catch it",
              "Abduction with slight **extension and slight ER**",
              "Whether the grade changes once the pattern is corrected — a grade that improves after cueing is motor control, not strength",
            ],
            [
              { text: "Extension", variant: "name" },
              "**Hamstring dominant** — the hamstrings fire ahead of glute max on 'lift your leg up'",
              "Palpate glute max and hamstrings at the same time; if hamstrings lead, retrain with a quick stretch or palpation cue",
              "Prone hip extension with the **knee flexed**, which shortens the hamstrings out of the way",
              "Glute max grade taken only after the firing order is corrected",
            ],
            [
              { text: "Flexion", variant: "name" },
              "Excessive flexion in sitting — more range than the task needs",
              "The hip flexors are being used past the point where the pattern is efficient",
              "Traditional MMT with **slight hip ER** added",
              "Grades 3–5 in the corrected position",
            ],
            [
              { text: "Internal rotation", variant: "name" },
              "Pelvic rotation supplying the range",
              "Palpate glute med and TFL through the motion; stabilize the pelvis first",
              "PROM first, then AROM into IR, then resistance at the **inside** of the knee pushing toward midline",
              "Full active range against resistance, with the pelvis staying still",
            ],
            [
              { text: "External rotation", variant: "name" },
              "Pelvic rotation supplying the range",
              "Same — stabilize the pelvis before you resist",
              "PROM, then AROM into ER, then resistance at the **outside** of the knee pushing laterally",
              "Full active range against resistance",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Isolation strength and functional strength are different measurements.",
          body: "A muscle that grades 5/5 on the table can still be the wrong muscle firing first during the task. That is why the movement fault is observed before the MMT and not after it — once you have cued the correction, you can no longer see the habit.",
        },
      ],
    },
    {
      id: "special",
      navLabel: "Special",
      title: "Special tests, and how much they actually buy",
      blocks: [
        {
          kind: "callout",
          tone: "warn",
          lead: "Special tests are pain-provocation tests.",
          body: "Their sensitivity and specificity are frequently low. If the patient has already reproduced their symptoms during a physiological movement or the functional task, a special test that reproduces the same symptom adds no information. Use them to *rule structures in* when the pattern is ambiguous, not to confirm what the task already told you.",
        },
        { kind: "heading", text: "Intra-articular" },
        {
          kind: "table",
          columns: ["Test", "How", "What it stresses", "The finding", "What fakes a result"],
          rows: [
            [
              { text: "Hip OA cluster", variant: "name" },
              "Four findings taken together, not a single manoeuvre",
              "Joint surface and capsule",
              "**1.** Moderate anterior or lateral hip pain with weight bearing · **2.** morning stiffness lasting **< 1 hour** · **3.** hip **IR < 24°**, or IR and flexion **15° less** than the contralateral hip · **4.** increased pain with passive IR",
              "Morning stiffness beyond an hour points at inflammatory arthritis instead — the duration is doing real work in this cluster",
            ],
            [
              { text: "FADIR", variant: "name" },
              "Flex hip and knee to 90°, IR to end range, then adduct. If negative, flex to **end range**, IR to end range, then adduct",
              "Anterior femoral neck against the acetabular rim, and the anterosuperior labrum",
              "Stiffness or pain; **deep pinching at end-range flexion with IR** is the FAI presentation",
              "Stopping at 90° when the test is negative there — the end-range repetition is part of the test, not an optional extra. A positive FADIR does not separate FAI from a labral tear",
            ],
            [
              { text: "Log roll", variant: "name" },
              "Supine, limb relaxed in neutral; roll the whole leg into IR and ER without loading the joint",
              "Only the femoral head rotating within the acetabulum",
              "Pain on passive rotation with **nothing else moved** — the most specifically intra-articular of the screens",
              "Any muscle guarding turns this into a rotation-range test; the limb has to be genuinely relaxed",
            ],
            [
              { text: "Scour / quadrant", variant: "name" },
              "Supine, hip flexed and adducted; compress through the femur while sweeping through an arc toward abduction",
              "Compresses the joint surfaces through an arc of the acetabulum",
              "Reproduction of symptoms — non-specific: it says *joint*, not which tissue in it",
              "Provocative and poorly tolerated in an irritable hip; it belongs late in the sequence",
            ],
            [
              { text: "Long axis distraction", variant: "name" },
              "Supine, belt or towel around the ankle, therapist at the foot of the table leaning back to take up slack; slight abduction may be added",
              "Separates the joint surfaces rather than compressing them",
              "**Relief** — the only test in this table where the positive result is symptoms getting better, which is what makes it the OA differentiator",
              "Gripping too far distally in an irritable hip loads the knee; move the grip to the distal femur",
            ],
          ],
        },
        { kind: "heading", text: "Extra-articular" },
        {
          kind: "table",
          columns: ["Test", "How", "The finding", "What fakes a result"],
          rows: [
            [
              { text: "Palpation, posterolateral greater trochanter", variant: "name" },
              "Sidelying, palpate the posterolateral facet of the greater trochanter and the distal glute med insertion",
              "Point tenderness is **~80% sensitive** for greater trochanteric pain syndrome — **its absence effectively rules GTPS out**",
              "A sensitive test used as a confirming one. Tenderness here is common; its diagnostic weight is in the negative",
            ],
            [
              { text: "Single leg stance, 30 seconds", variant: "name" },
              "Stand on the affected leg and hold; watch the pelvis and time it",
              "Pain reported **within 30 seconds** is highly *specific* for GTPS. Pelvic drop > 2 cm is the abductor finding",
              "Stopping the test at a few seconds — the specificity is attached to the time window, not to the position",
            ],
            [
              { text: "Derotation test", variant: "name" },
              "Passively rotate the hip and then have the patient actively de-rotate against resistance",
              "Positive when it reproduces lateral hip pain — a gluteal tendinopathy provocation",
              "Reproducing groin rather than lateral pain, which points intra-articular instead",
            ],
            [
              { text: "Beighton scale", variant: "name" },
              "Nine-point generalized hypermobility screen",
              "Used as background, not a hip test — it raises labral tear and hypermobility as an explanation for excessive ER and extension PROM",
              "Treating a hypermobile hip's excessive range as a good result. Excessive ER and extension with a hypermobile or empty joint play is the labral pattern",
            ],
          ],
        },
      ],
    },
    {
      id: "jointplay",
      navLabel: "Joint Play",
      title: "Arthrokinematics, joint play, and the grading scale",
      blocks: [
        {
          kind: "lede",
          text: "Joint play is movement at the joint surface that is not under voluntary control — roll, spin and slide accompanying physiological motion. You assess it for one reason: **PROM limited with a capsular end feel**, or to confirm suspected hypermobility.",
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
            [
              { text: "Glide", variant: "name" },
              "Translation of one surface on the other",
              "**Parallel** to the joint plane",
            ],
            [
              { text: "Open (loose) packed position", variant: "name" },
              "The position in the range where the joint is under least stress and the capsule has its greatest capacity",
              "At the hip: **30° flexion, 30° abduction, slight ER** — assess and treat from here",
            ],
          ],
        },
        { kind: "heading", text: "Concave and convex — the rule that sets the glide direction" },
        {
          kind: "table",
          columns: ["Rule", "Which partner moves", "Roll and glide", "Treatment plane", "Example"],
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
              "Think of these as 'little shoulders' — and the hip is one of them: the convex femoral head moves on the fixed concave acetabulum",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "convex-hip-glide",
          title: "The hip is a convex-on-concave joint, so the glide opposes the bone",
          caption:
            "**The femoral head glides the opposite way to the shaft it is attached to.** Flex or internally rotate the hip and the head must glide posteriorly; extend or externally rotate it and the head must glide anteriorly. That single fact is why the treatment for limited flexion and IR is an anterior-to-posterior glide, and the treatment for limited extension and ER is a posterior-to-anterior one.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Why the glide matters mechanically:",
          body: "roll without sufficient slide causes compression. If the head rolls but cannot glide, the surfaces are driven together instead of spinning in place — abnormal joint mechanics, and pain. This is the same mechanism that produces impingement at the shoulder, and it is the argument for restoring the glide rather than only stretching the muscle.",
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
              "**Do not mobilize.** Stability via exercise or taping; check ligament integrity",
            ],
            [{ text: "5", variant: "num" }, "Considerable increased movement", "Stabilization, balance and motor control; screen for labral involvement"],
            [{ text: "6", variant: "num" }, "Complete instability", "Refer; this is not a mobilization presentation"],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Technique errors that produce a false grade:",
          body: "assessing outside the open packed position, using arm strength rather than body weight, a long lever arm far from the joint surface, or failing to take up the soft tissue slack first. Each of them adds tissue resistance you will read as joint stiffness. Stabilize the proximal partner, use broad contact, keep the lever short, and let the forearm angle set the direction.",
        },
      ],
    },
    {
      id: "mobs",
      navLabel: "Mobs",
      title: "Grades, dose, and direction",
      blocks: [
        {
          kind: "lede",
          text: "Two independent questions. *Which grade* is answered by irritability and by what you are trying to change — pain or tissue length. *Which direction* is answered by the convex rule and the motion that is restricted. Getting one right and the other wrong is the common failure.",
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
        { kind: "heading", text: "Dose" },
        {
          kind: "table",
          columns: ["Parameter", "Value", "Why"],
          rows: [
            [{ text: "Oscillation rate", variant: "name" }, { text: "2–3 per second", variant: "num" }, "Fast enough to move fluid, slow enough to stay in the intended part of the range"],
            [{ text: "Grade I–II bout", variant: "name" }, { text: "10–30 seconds", variant: "num" }, "Treating pain — the target is neuromodulation and fluid movement, not tissue creep"],
            [{ text: "Grade III–IV bout", variant: "name" }, { text: "60 seconds", variant: "num" }, "Treating length — plastic deformation of capsular tissue needs sustained loading"],
            [{ text: "Grade V", variant: "name" }, { text: "once", variant: "num" }, "A thrust is a single event by definition"],
            [
              { text: "Static holds", variant: "name" },
              "At a range chosen by irritability",
              "An alternative to oscillation when oscillating provokes; the position is graded the same way",
            ],
          ],
        },
        { kind: "heading", text: "Mobilization directions for the hip" },
        {
          kind: "table",
          columns: ["Technique", "Set-up", "Force direction", "Assess / treat when", "What fakes a result"],
          rows: [
            [
              { text: "Anterior-to-posterior (AP) glide", variant: "name" },
              "Supine in open pack. Stand on the **opposite** side to the target hip; stabilize the contralateral hip; hand on the anterior femoral head. Low irritability: come out of open pack, flex hip and knee, place hands over the knee with your sternum against them and drive through the length of the femur",
              "**Posterolateral** — angled because of the orientation of the acetabulum, not straight back",
              "Hypomobility with a capsular end feel in **flexion and/or internal rotation** — the FAI and hip OA restriction",
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
              "General joint space in **all** hip directions — the technique of choice when everything is restricted rather than one direction",
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
        { kind: "heading", text: "Contraindications" },
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
          tone: "warn",
          lead: "Technique, every time:",
          body: "use your body rather than arm strength and let gravity assist; your body and the mobilizing hand act as one unit; stabilize one side of the joint while mobilizing the other; broad contact; **keep the lever arm short — as close to the joint surface as possible**; the forearm angle determines the mobilization angle; take up the soft tissue slack first; and be able to say afterward what you felt.",
        },
      ],
    },
    {
      id: "differential",
      navLabel: "Diagnosis",
      title: "Finding → qualifier → cause → do this",
      blocks: [
        {
          kind: "lede",
          text: "The matrix the whole examination feeds. Read a row left to right: the history that raises it, the examination finding that confirms it, and the intervention that follows. Blank cells mean that column is not the discriminator for that condition — not that the test is normal.",
        },
        {
          kind: "table",
          columns: ["Condition", "History", "The examination finding", "Where it shows up", "Intervention"],
          rows: [
            { group: "Intra-articular" },
            [
              { text: "Hip osteoarthritis", variant: "name" },
              "Morning stiffness **< 1 hour** · groin pain · **50 years +**",
              "**IR < 24°**, or IR and flexion 15° less than the contralateral hip; increased pain with passive IR; capsular end feel",
              "PROM · joint play **hypomobile** · long axis distraction **alleviates**",
              "Joint play and mobilization · muscle length and stretch · strength and balance",
            ],
            [
              { text: "Femoroacetabular impingement", variant: "name" },
              "Groin pain · end-range flexion pain · younger age",
              "**Deep pinching at end-range flexion with IR**; positive FADIR / quadrant",
              "End feel · PROM",
              "ROM and joint mobilization — **inferior and posterior glide** · gluteus maximus strengthening",
            ],
            [
              { text: "Labral tear", variant: "name" },
              "Groin pain · **clicking** · younger age",
              "Positive log roll; hypermobility on examination",
              "PROM shows **excessive ER and extension** (unless guarded, or an empty end feel); joint play **hypermobile or empty**",
              "Stabilization and balance — **not** mobilization",
            ],
            [
              { text: "AVN / hip fracture", variant: "name" },
              "Trauma, or chronic degenerative joint disease · groin pain",
              "**Capsular pattern**; often an empty end feel; inability to weight bear",
              "PROM · end feel",
              "**Refer.** AVN or fracture may require surgery",
            ],
            { group: "Extra-articular — lateral" },
            [
              { text: "Greater trochanteric pain syndrome", variant: "name" },
              "Lateral hip pain · pain lying on that side",
              "Positive derotation test; painful and/or weak gluteus medius; positive Trendelenburg",
              "Movement: **lying on side, single leg stance** · static test: pain and/or weakness in abduction · palpation: **distal glute med insertion**",
              "Progressive gluteus medius strengthening · STM · taping",
            ],
            [
              { text: "Anterior glide ± femoral IR", variant: "name" },
              "**Runners**",
              "Postural finding, with flexion limited by the posterior capsule",
              "Posture · PROM",
              "Address the posterior capsule; glute max inhibition and hamstring dominance are the drivers to retrain",
            ],
            { group: "Contractile" },
            [
              { text: "Hip flexor strain", variant: "name" },
              "**Superficial** groin pain",
              "Pain on resisted flexion and/or adduction; pain on stretch",
              "AROM: pain with hip flexion and/or adduction · static: pain and/or weakness · palpation: **pectineus, adductor longus**",
              "STM · progressive strengthening · gradual reintroduction of exercise",
            ],
            [
              { text: "Hip adductor strain", variant: "name" },
              "Superficial groin pain",
              "Pain on **resisted adduction**",
              "Static test",
              "STM · progressive strengthening / Copenhagen protocol · gradual reintroduction",
            ],
            [
              { text: "Hamstring strain", variant: "name" },
              "Pain location — buttock, proximal posterior thigh",
              "Pain on resisted hip extension **or** knee flexion",
              "Static test · palpation: **proximal hamstring tendon at the ischial tuberosity**",
              "STM · progressive strengthening, including gluteus maximus · gradual reintroduction",
            ],
            [
              { text: "Piriformis", variant: "name" },
              "Pain location — buttock",
              "Pain on resisting the muscle and on stretching it",
              "Length test at 90° flexion with ER and adduction",
              "STM · **PIR if there are trigger points** · gradual reintroduction",
            ],
            [
              { text: "Avulsion injury", variant: "name" },
              "Young, **open growth plates**",
              "Pain with passive hip extension and with active hip flexion / knee extension",
              "Movement: hip flexion and knee extension from a position of extension · static: pain on resisted hip flexion **with the knee extended** · palpation: **AIIS or ASIS**",
              "**Refer**, then progressive strengthening",
            ],
            { group: "Other" },
            [
              { text: "Snapping hip", variant: "name" },
              "**Running**",
              "Symptomatic arc of hip motion — the snap occurs at a repeatable point in the range",
              "Hip arcs of motion",
              "Movement retraining · treat the impairments found",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "The lumbar spine and SIJ commonly refer pain to the hip.",
          body: "Every row above assumes you have already made that screen. A hip examination that produces no coherent row is more often a spine that has not been screened than a hip whose diagnosis is unusual.",
        },
      ],
    },
    {
      id: "treatment",
      navLabel: "Treatment",
      title: "Irritability drives the dose",
      blocks: [
        {
          kind: "lede",
          text: "Start with the least irritable approach and progress: joint mobilizations grade I–II before III–IV, soft tissue mobilization gentle before firm, stretching passive at mid-range before end-range. Name the irritability level before you pick anything; the grade follows from it, not from the diagnosis.",
        },
        {
          kind: "cards",
          cards: [
            {
              tone: "h",
              title: "High irritability",
              badge: "Gr I–II",
              subtitle: "Symptoms arrive before you reach an end feel",
              points: [
                "Grade I–II joint mobilizations, 10–30 second bouts",
                "Soft tissue mobilization emphasized, gentle",
                "Pain-free PROM only; stay in the open packed position",
                "Isometric loading — wall press abduction, supine isometric abduction, bridge holds",
                "Educate and unload: the position that compresses the tissue is the first thing to change",
              ],
            },
            {
              tone: "m",
              title: "Moderate irritability",
              badge: "Gr II–III",
              subtitle: "Symptoms present at the end feel",
              points: [
                "Grade II–III mobilizations; begin pre-positioning toward end range",
                "STM progressed from gentle to firm, and toward end range",
                "Stretching progressed from mid-range to end-range",
                "Weight-bearing strength: sit-to-stand, partial squat, forward step-ups",
                "Contract-relax and PIR for the muscles limiting PROM",
              ],
            },
            {
              tone: "l",
              title: "Low irritability",
              badge: "Gr III–IV",
              subtitle: "Symptoms only with overpressure, or not at all",
              points: [
                "Grade III–IV mobilizations, 60 second bouts",
                "Come out of open pack — mobilize through range, pre-positioned near end range",
                "Single leg stance and weight shifts, lateral band walks, single leg squat",
                "Sustained end-range holds; maximize total end range time",
                "Progress back to the functional task that started the episode",
              ],
            },
          ],
        },
        {
          kind: "figure",
          figureId: "irritability-dose",
          title: "One reading of irritability sets four different decisions",
          caption:
            "**Irritability is not a severity label — it is a dose parameter.** The same reading simultaneously fixes the mobilization grade, the bout length, where in the range you work, and how much load the exercise carries. That is why it is graded twice, from the interview and from the end feel, before anything else is chosen.",
        },
        { kind: "heading", text: "Soft tissue mobilization — pick the technique for the restriction" },
        {
          kind: "table",
          columns: ["Technique", "Direction relative to the fibres", "What it is for"],
          rows: [
            [
              { text: "Elongation / longitudinal", variant: "name" },
              "**With** the grain of the muscle",
              "Lengthening the muscle",
            ],
            [
              { text: "Accessory / horizontal", variant: "name" },
              "**Against** the grain",
              "Improving lateral expansion of the muscle",
            ],
            [
              { text: "J stroke", variant: "name" },
              "Shear across a focal point",
              "Focal restrictions — a small area of palpable tissue tension",
            ],
            [
              { text: "Tack and stretch", variant: "name" },
              "Fix the point, then lengthen through it",
              "Localizing a stretch to a focal adhesion rather than the whole muscle",
            ],
            [
              { text: "IASTM / transverse friction", variant: "name" },
              "Across the fibres, instrumented or manual",
              "May stimulate fibroblast proliferation, increase blood flow, and provide temporary analgesia",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "STM rules that apply to all of them:",
          body: "create barriers · use body weight to generate force rather than fingers · back up your fingers · **travel at the speed of the tissue** · operate before the point where the patient squirms or pushes back · and if a technique hurts *you*, don't do it — find another way.",
        },
        { kind: "heading", text: "Palpation reference — landmark, then what is under it" },
        {
          kind: "table",
          columns: ["Position", "Landmark", "What is under your finger"],
          rows: [
            { group: "Supine, open pack" },
            [{ text: "ASIS", variant: "name" }, "Anterior superior iliac spine", "Sartorius insertion"],
            [
              { text: "AIIS", variant: "name" },
              "**2 cm distal and 1 cm medial to the ASIS**",
              "Rectus femoris insertion — a common site of apophysitis in youth",
            ],
            [
              { text: "Iliopsoas tendon", variant: "name" },
              "Fall into hip ER, then just medial to the AIIS — below the inguinal ligament, **lateral** to the femoral pulse",
              "Iliopsoas tendon",
            ],
            [
              { text: "Adductor group", variant: "name" },
              "**Medial** to the femoral pulse, working medially",
              "Pectineus, then adductor longus, then gracilis",
            ],
            [
              { text: "Iliacus", variant: "name" },
              "Hook the ASIS and come medial along the internal aspect of the ilium",
              "Iliacus",
            ],
            [
              { text: "Iliopsoas belly", variant: "name" },
              "Hip in neutral; from the ASIS move medially and cranially at **45°**, sinking through the abdominal soft tissue",
              "Iliopsoas — confirm by having them flex the hip under your fingers",
            ],
            { group: "Prone" },
            [
              { text: "Ischial tuberosity", variant: "name" },
              "Caudal to the tuberosity",
              "Hamstring tendons — **long head more lateral, semitendinosus more medial, semimembranosus deep to semitendinosus**",
            ],
            { group: "Sidelying" },
            [{ text: "Iliac crest", variant: "name" }, "Superior, near the lumbar spine", "Quadratus lumborum"],
            [{ text: "PSIS", variant: "name" }, "Drop caudally from the PSIS", "Gluteus maximus — fibres running cranial to caudal"],
            [
              { text: "Greater trochanter", variant: "name" },
              "Straight superior from the trochanter, then superior and slightly posterior",
              "Gluteus minimus tendon (deep to glute med), then gluteus medius tendon; glute med runs to the caudal aspect of the iliac crest directly above",
            ],
            [
              { text: "Piriformis", variant: "name" },
              "From the greater trochanter heading toward the PSIS",
              "Piriformis — it does **not** attach at the PSIS; it fans down to about **two-thirds** of the way down the sacrum",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Palpate last, and palpate narrowly.",
          body: "Tenderness refers, and will mislead you. Only after the tissue at fault has been identified is palpation used — and then to determine the *extent* of the lesion, not its location. Palpate within the area of pain and the muscles that limited PROM with a muscular end feel; nowhere else.",
        },
        { kind: "heading", text: "Contract-relax and PIR — the numbers" },
        {
          kind: "table",
          columns: ["Parameter", "Value", "Evidence behind it"],
          rows: [
            [
              { text: "Contraction intensity", variant: "name" },
              { text: "20–75% MVIC", variant: "num" },
              "ACSM range. Direct comparison of 20%, 50% and 100% MVIC produced ROM gains of **8.4°, 12.9° and 11.6°**; modelling puts the peak at **13.3° at 64.3% MVIC** — so moderate beats both light and maximal. Your lab protocol uses **50%**",
            ],
            [
              { text: "Contraction duration", variant: "name" },
              { text: "3–6 seconds", variant: "num" },
              "Trials of 3, 6 and 10 second holds found **no significant difference** between them; all beat baseline. Longer buys nothing",
            ],
            [
              { text: "Stretch duration", variant: "name" },
              { text: "10–30 seconds", variant: "num" },
              "Consistent across guidelines, with little benefit beyond 30 s — **except in older adults**, where 30–60 s may give more",
            ],
            [
              { text: "Total stretching time", variant: "name" },
              { text: "≥ 60 seconds", variant: "num" },
              "ACSM: 2–4 repetitions per muscle, 2–3 days per week",
            ],
            [
              { text: "Why it beats static stretching", variant: "name" },
              "Stiffness reduction",
              "Contract-relax reduces **muscle stiffness 16.0–20.5%** and **tendon stiffness 17.7–22.1%** — changes static stretching alone does not produce",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Your two sources give different stretch times.",
          body: "The hip lab protocol says resist at 50% of max, hold 3–6 seconds, then stretch for **30 seconds**. The research summary and the ACSM position stand say a 3–6 second submaximal contraction at 20–75% MVIC followed by a **10–30 second** passive stretch. The contraction is the same; only the stretch phase differs, and the lab figure sits at the top of the guideline range rather than outside it. The mechanism claim is also softer than it used to be: the effect was traditionally attributed to autogenic inhibition, but contemporary evidence points more to a change in stretch perception and tolerance than to neurophysiological inhibition.",
        },
        { kind: "heading", text: "Load: educate, unload, reload" },
        {
          kind: "table",
          columns: ["Step", "What it means", "Worked example — GTPS"],
          rows: [
            [
              { text: "Educate / Unload", variant: "name" },
              "Modify the activity or movement pattern so the tissue is compressed less often and less long",
              "Sitting: avoid crossing the legs · sleeping: avoid the affected side, pillow between the knees on the other side · standing: avoid hanging on one hip · walking: assistive device in the **contralateral** hand, or trekking poles",
            ],
            [
              { text: "Reload", variant: "name" },
              "Physical stress theory: stress below the maintenance range **decreases** tissue tolerance and increases injury risk; stress above it increases tolerance. The task is to raise tolerance without crossing into injury",
              "Progressive, symptom-guided abductor loading rather than rest — chronic hip pain shows reduced strength particularly in the **abductors and external rotators**",
            ],
            [
              { text: "Prevention", variant: "name" },
              "Maintain the level of tendon fitness the patient's tasks require",
              "Avoid significant jumps in activity — the spike, not the absolute load, is what injures",
            ],
          ],
        },
        { kind: "heading", text: "Progressive loading of the abductors and external rotators" },
        {
          kind: "table",
          columns: ["Phase", "Exercises", "What it is for"],
          rows: [
            [
              { text: "1 · Isometric, low irritability tolerance", variant: "name" },
              "Standing isometric hip abduction (wall press) · supine isometric abduction with pillow or band · isometric bridge holds",
              "Introduces load with no joint movement and no provocative compression — gluteal loading without aggressive motion",
            ],
            [
              { text: "2 · Functional weight bearing", variant: "name" },
              "Sit-to-stand / chair squat · controlled mini or partial squat · forward step-ups · sidelying abduction and flexion with good activation",
              "Symmetrical then single-limb loading, frontal-plane control, movement quality before depth",
            ],
            [
              { text: "3 · Single leg control", variant: "name" },
              "Single leg stance and weight shifts · band-assisted lateral walks / side steps · single leg squat, pain-guided",
              "Frontal-plane control under load and load acceptance — the demands the failed functional task actually made",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Dose and progression:",
          body: "ACSM — resistance exercise **2–3 days/week, 2–4 sets of 8–12 repetitions**, to fatigue but not exhaustion. Choose a starting point that is challenging but achievable **without deviations or compensations**, and progress by soreness rules back toward the functional task. Highest recorded gluteus medius EMG among rehabilitation exercises comes from the side plank, dominant leg up and dominant leg down — useful as an end point, not a starting one.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "What current guidance de-emphasizes for GTPS:",
          body: "treating it as a 'trochanteric bursitis' that primarily needs an anti-inflammatory solution, and relying on corticosteroid injection as the long-term plan — often a short-term benefit with poorer longer-term outcomes than education plus exercise.",
        },
        { kind: "heading", text: "Movement pattern retraining" },
        {
          kind: "table",
          columns: ["Step", "What you do", "The finding it acts on"],
          rows: [
            [
              { text: "1 · Assess the task", variant: "name" },
              "Take the task the patient reported and try to change or optimize the movement or position to unload the hip and reduce pain",
              "A task you can modify in-session is both the key intervention and the education point",
            ],
            [
              { text: "2 · Hypothesize contributors", variant: "name" },
              "Name the candidates: poor movement pattern / motor control, and muscle imbalances of strength, length or stiffness",
              "These are what the rest of the examination then tests — the hypothesis comes before the measurement",
            ],
            [
              { text: "3 · Retrain within the task", variant: "name" },
              "Structured, task-specific retraining during gait, squatting and stair negotiation, aimed at the strategies that raise hip joint stress",
              "For GTPS specifically, reducing excessive hip **adduction** during weight-bearing tasks",
            ],
            [
              { text: "4 · Return to the task", variant: "name" },
              "Progress the exercise back toward the limitation that brought them in, using soreness rules",
              "Re-assessment uses the **same** task every time — the concordant sign, not a proxy",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Re-assessment is not optional.",
          body: "Do not perform more than two or three treatments in a session, or you will not know which one worked. Always re-assess with the same task — return to the concordant sign or the functional motion you started with.",
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
              question: "A hip is limited in flexion and internal rotation with a capsular end feel. Which glide, in which direction, and why that direction?",
              answer:
                "An anterior-to-posterior glide, with the force directed **posterolaterally**. The hip is a convex-on-concave joint, so the femoral head glides opposite to the shaft — flexion and IR require a posterior glide of the head. The posterolateral angle rather than straight posterior follows the orientation of the acetabulum. Patient supine in open pack, therapist standing on the opposite side, hand on the anterior femoral head.",
            },
            {
              question: "During a Thomas test the pelvis moves before the thigh reaches parallel. What have you found, and what have you not found?",
              answer:
                "You have found **relative stiffness** — the hip flexors are stiffer than the abdominals that should be holding the pelvis. You have not found shortness. That requires the second attempt, with the pelvis stabilized toward a posterior tilt. Treatment for the first finding is teaching the patient to stabilize the abdominals while the hip flexors are worked; treatment for the second is contract-relax in the Thomas position.",
            },
            {
              question: "Name the four criteria of the hip OA cluster.",
              answer:
                "Moderate anterior or lateral hip pain with weight-bearing activities; morning stiffness lasting **less than one hour**; hip **IR under 24°**, or hip IR and flexion 15° less than the contralateral hip; and increased pain with passive IR. Long axis distraction easing the symptoms supports it.",
            },
            {
              question: "What is the open packed position of the hip, and name two separate things you use it for.",
              answer:
                "**30° flexion, 30° abduction, slight external rotation** — the position of least joint stress and greatest capsular capacity. You use it to assess and treat joint play, and you use it for static resisted testing, where slackening the inert structures puts the load on the contractile tissue.",
            },
            {
              question: "Single leg stance: the pelvis stays nearly level but the trunk leans over the stance leg. Positive or negative?",
              answer:
                "Positive — a **compensated Trendelenburg**. It is the same abductor insufficiency; the trunk lean moves the centre of mass over the stance hip, shortening the moment arm and reducing the demand. Grade on both the 2 cm drop threshold and where the trunk went.",
            },
            {
              question: "PROM produces an empty end feel. What grade of mobilization?",
              answer:
                "None. An empty end feel means pain stops the movement before any resistance appears, and it belongs to fracture, abscess, bursitis, acute joint inflammation or a psychogenic presentation. Screen and refer. Empty is the one end feel that is a stop signal rather than a dose signal.",
            },
            {
              question: "Prone in 15° of hip abduction, a patient has 55° of ER and 30° of IR. What do you call it, and why the 15°?",
              answer:
                "ER exceeds IR by 25° — more than 20° — which reads as femoral **retroversion**, and fits a toe-out standing posture. The 15° of abduction is there to reduce the influence of the TFL on the rotation measurement; without it, TFL tension biases the comparison you are basing the call on.",
            },
            {
              question: "Which single test appears in all five pain-location patterns, and what makes it useful?",
              answer:
                "Long axis distraction. It is the only one whose positive result is **relief** rather than provocation — separating the joint surfaces unloads them, so easing symptoms points at the joint surface itself. That is what lets it sit under lateral thigh, buttock, groin, trochanteric and anterior pain alike as the hip OA differentiator.",
            },
            {
              question: "Contract-relax: intensity, hold, stretch, and the one number worth remembering about intensity?",
              answer:
                "20–75% MVIC, held 3–6 seconds, followed by a 10–30 second stretch (your lab protocol: 50%, 3–6 seconds, 30 seconds). The number worth remembering is that modelling puts peak ROM gain at **13.3° at 64.3% MVIC** — moderate intensity beats both 20% and 100%, so a maximal contraction is not the aggressive-and-therefore-better option.",
            },
            {
              question: "Joint play grades 5 out of 6. What do you do?",
              answer:
                "Not mobilization. Grades 4–5 are hypermobility: provide stability through exercise or taping, and check ligament integrity. At the hip this pattern, especially with excessive ER and extension PROM and clicking in the history, points at a labral tear — treated with stabilization and balance work.",
            },
            {
              question: "Why does the absence of tenderness over the posterolateral greater trochanter matter more than its presence?",
              answer:
                "Because it is roughly **80% sensitive** for greater trochanteric pain syndrome. A highly sensitive test earns its keep when negative: no tenderness there effectively rules GTPS out. Its presence is common and much less specific — for that, use pain within 30 seconds of single leg standing.",
            },
            {
              question: "A runner has anterior hip pain, a forward-sitting femoral head and flexion limited by the posterior capsule. Name the pattern and its two drivers.",
              answer:
                "Anterior glide with or without femoral internal rotation. The two drivers to retrain are **gluteus maximus inhibition** and **hamstring dominance** — the hamstrings extending the hip in place of glute max drives the head forward in the acetabulum. Treat the posterior capsule restriction alongside the motor pattern.",
            },
          ],
        },
      ],
    },
  ],
  footer:
    "**About this guide.** Compiled from a hip examination and treatment sequence: the MSPM examination-process framework, the hip regional lecture with its pain-location patterns, the posture / functional task / AROM lab, the examination-and-treatment lab, the soft tissue mobilization lab, the joint mobilization lecture, the therapeutic-exercise and motor-skills-retraining labs, a hip gait review, the contract-relax and PIR research summary, the hip differential diagnosis matrix, and the competency topic list.\n**Quoted from those sources:** the irritability definitions in both forms, the end-feel tables, HAGOS and WOMAC figures, the pain-location patterns and their tests, the differential matrix, the hip OA cluster, all gait kinematics, the 2 cm single leg stance threshold, the ≈15° version norm and the prone version thresholds, the two-attempt Thomas procedure, the open packed position, the 0–6 joint play scale, the Maitland grade definitions and mobilization doses, the hip glide directions and set-ups, the contraindication lists, the palpation landmarks, the STM techniques, the contract-relax and PIR numbers with their supporting studies, the EdUReP and physical stress theory framing, the exercise phases, and the ACSM dosing.\n**Supplied from general knowledge and marked where it appears:** the normative hip range-of-motion degrees and goniometer alignments in §08, which the course material does not list, and the descriptions of test procedure for scour, log roll and the Beighton scale, which the sources name but do not describe.\n**Contested points are flagged in line** rather than silently resolved: the two sources' sagittal gait figures, the capsular pattern ordering, the contract-relax stretch duration, and the mechanism attributed to PIR. Verify any number against current literature before using it to weight a clinical decision.",
};
