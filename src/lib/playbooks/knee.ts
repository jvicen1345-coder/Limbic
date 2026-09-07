/**
 * The knee examination playbook — the fourth Limbic Playbook (see lib/playbook-content.ts
 * for the block types, docs/playbook-authoring.md for the brief, and
 * components/playbook/PlaybookFigures.tsx for the drawings the `figure` blocks name).
 *
 * Ordered the way the examination is performed: history and the effusion that dates it,
 * alignment, the functional task, range and end feel, effusion grading, then the ligament,
 * meniscal and patellofemoral batteries, then strength, then treatment.
 *
 * Unlike the shoulder and hip playbooks, this one is not compiled from supplied course
 * material — there was none for the knee. Everything here is standard musculoskeletal
 * curriculum content, and the `footer` says so rather than implying a source it does not
 * have. Test statistics in particular vary widely between studies; the ones quoted are
 * commonly cited values and are flagged where they are contested.
 */

import type { Playbook } from "@/lib/playbook-content";

export const KNEE_PLAYBOOK: Playbook = {
  slug: "knee",
  name: "Knee Examination",
  title: "Knee Examination Playbook",
  eyebrow: "Musculoskeletal practice · examination & treatment",
  summary:
    "A full knee screen in the order you'd perform it: what the effusion tells you before you touch anything, the number that separates normal from a finding, and the structure each test actually loads. Bring a goniometer and a tape measure.",
  stamp: [
    { value: "33", label: "exam items" },
    { value: "4", label: "pain locations" },
    { value: "3", label: "ligament batteries" },
    { value: "0–3+", label: "effusion grades" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "33 Items",
      title: "The examination sequence",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Thirty-three items in the order they're performed — standing, then walking, then supine, then prone. Two things run ahead of everything else at the knee: whether this needs an X-ray at all, and how fast the joint swelled. The last column is the finding itself.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "ottawa",
              name: "Ottawa knee rules, before you examine",
              how: "Five criteria after acute trauma: age 55 or over · isolated patellar tenderness · tenderness at the fibular head · inability to flex to 90° · inability to bear weight for four steps both immediately and in the clinic.",
              finding: "**Any one criterion → radiograph.** Nearly 100% sensitive for clinically significant fracture, which is what makes a negative result worth acting on",
            },
            {
              id: "effusion-timing",
              name: "How fast did it swell?",
              how: "Ask for the interval between the injury and visible swelling, not whether it swelled.",
              finding: "**Within 2 hours = haemarthrosis** — ACL rupture, osteochondral fracture, or patellar dislocation, in roughly that order of frequency. **Over 24 hours** is a reactive effusion and fits meniscus or synovitis",
            },
            {
              id: "moi",
              name: "Mechanism, in the patient's own words",
              how: "Contact or non-contact, foot planted or not, direction of the force, and what they heard or felt.",
              finding: "Non-contact deceleration or pivot with a **pop** and immediate swelling → ACL. Valgus blow → MCL ± ACL ± medial meniscus. Dashboard or fall on a flexed knee → PCL. Twisting on a loaded flexed knee with delayed swelling → meniscus",
            },
            {
              id: "locking",
              name: "Locking, catching, or giving way — and which",
              how: "Separate true mechanical locking (a block to extension you cannot pass) from pseudo-locking (pain or guarding) and from giving way.",
              finding: "**True locking with a springy block = displaced meniscal fragment or loose body.** Giving way on a pivot = instability; giving way on stairs = quadriceps inhibition or patellofemoral pain",
            },
            {
              id: "red-flags",
              name: "Red flag screen",
              how: "Fever, hot swollen joint, unexplained weight loss, night pain unrelated to position, calf pain and swelling, inability to weight bear.",
              finding: "Hot, exquisitely painful joint with fever → **septic arthritis until proven otherwise**. Calf pain with swelling → DVT screen before any exercise",
            },
            {
              id: "outcome-tool",
              name: "Standardized self-report tool",
              how: "KOOS for a broad knee population, IKDC or Lysholm after ligament injury, and the anterior knee pain scale for patellofemoral presentations.",
              finding: "A baseline number you re-measure against, and the disability half of the irritability judgement",
            },
            {
              id: "standing-alignment",
              name: "Standing alignment, front view",
              how: "Feet hip-width, patellae forward. Look at the tibiofemoral angle, patellar height and orientation, and foot posture.",
              finding: "Normal tibiofemoral alignment is **5–7° of valgus**. More is genu valgum, less or reversed is varum. **Squinting patellae** suggest femoral anteversion; **grasshopper eyes** suggest a laterally tilted, high-riding patella",
            },
            {
              id: "q-angle",
              name: "Q angle",
              how: "Supine, quadriceps relaxed, knee extended. One line ASIS to mid-patella, a second mid-patella to tibial tubercle; measure the angle between them.",
              finding: "**≈13–14° in men, ≈17–18° in women**; over 20° is usually called abnormal. Treat it as one input among several — its association with patellofemoral pain is weak and contested",
            },
            {
              id: "genu-recurvatum",
              name: "Genu recurvatum and hyperextension",
              how: "Side view standing, then supine with a hand under the heel.",
              finding: "**0–5° of hyperextension is normal; beyond 10°** is recurvatum and shifts load posteriorly, often with a generalized laxity picture — check the Beighton score",
            },
            {
              id: "gait",
              name: "Gait",
              how: "Watch the sagittal plane for the loading-response flexion wave and the frontal plane for medial collapse.",
              finding: "**15–20° of knee flexion at loading response**, near-full extension at terminal stance, **60–70° in swing**. A stiff-knee gait with no loading wave is quadriceps avoidance and is the commonest post-injury pattern",
            },
            {
              id: "squat",
              name: "Double leg squat, then single leg",
              how: "Watch depth, symmetry, and the frontal-plane path of the knee over the foot.",
              finding: "**Dynamic valgus — knee medial to the second toe** — with contralateral pelvic drop is a hip abductor and external rotator finding, not a knee one",
            },
            {
              id: "step-down",
              name: "Step-down test",
              how: "Stand on the involved leg on a 20 cm step and lower the other heel to the floor under control.",
              finding: "Loss of frontal-plane control, trunk lean, or reproduction of anterior knee pain. This is the task patellofemoral pain fails first, and the one you re-measure against",
            },
            {
              id: "observation-supine",
              name: "Supine observation",
              how: "Compare quadriceps bulk, the suprapatellar pouch, and the position of both patellae at rest.",
              finding: "**Vastus medialis oblique wasting is visible within days** of an effusion — arthrogenic muscle inhibition, not disuse. Measure thigh girth 10 cm above the patella, both sides",
            },
            {
              id: "effusion-sweep",
              name: "Effusion — sweep (stroke) test",
              how: "Sweep upward from the medial joint line to empty the medial gutter, then stroke down the lateral side and watch the medial hollow.",
              finding: "**Zero** no wave · **Trace** a small wave on the medial side · **1+** a larger bulge · **2+** the effusion returns without a downward stroke · **3+** so much fluid it cannot be moved out of the medial side",
            },
            {
              id: "ballottement",
              name: "Effusion — patellar ballottement",
              how: "Compress the suprapatellar pouch with one hand and push the patella posteriorly with the other.",
              finding: "A palpable tap of the patella on the femur = a **large** effusion. Ballottement is insensitive to small effusions, which is why the sweep test comes first",
            },
            {
              id: "arom",
              name: "AROM flexion and extension",
              how: "Supine and prone. Note whether active extension reaches the passive end point.",
              finding: "**An extension lag — passive extension exceeds active — is a quadriceps problem. Equal loss in both is a joint problem.** The difference decides the whole treatment direction",
            },
            {
              id: "prom-flexion",
              name: "PROM flexion + end feel",
              how: "Supine, heel to buttock. Axis at the lateral epicondyle, stationary arm to the greater trochanter, moving arm to the lateral malleolus.",
              finding: "**0–135°** with a **soft tissue approximation** end feel. A springy block is a displaced meniscus; a firm capsular end feel with proportionally greater flexion loss is the capsular pattern",
            },
            {
              id: "prom-extension",
              name: "PROM extension + end feel and heel height",
              how: "Prone with the thighs supported and both feet off the end of the table; compare heel heights.",
              finding: "**Normal end feel is firm.** A heel-height difference of **1 cm ≈ 1° of extension loss** — the most sensitive way to catch a small flexion contracture",
            },
            {
              id: "screw-home",
              name: "Screw-home mechanism",
              how: "Watch the tibial tubercle through the last 30° of extension.",
              finding: "**≈10° of tibial external rotation** in terminal extension locks the joint. Loss of it is an early finding after meniscal or capsular injury and blocks full passive extension",
            },
            {
              id: "patellar-glide",
              name: "Patellar glide, medial and lateral",
              how: "Knee at 20–30° over a bolster, quadriceps relaxed. Divide the patella into four longitudinal quadrants and translate it each way.",
              finding: "**Normal is 1–2 quadrants each way.** Under 1 quadrant medially = a tight lateral retinaculum. Over 3 quadrants laterally = hypermobility, and often a positive apprehension sign",
            },
            {
              id: "patellar-tilt",
              name: "Patellar tilt",
              how: "Lift the lateral border of the patella off the lateral femoral condyle.",
              finding: "**The lateral border should lift to at least the horizontal.** Failing to reach neutral is a tight lateral retinaculum and iliotibial band",
            },
            {
              id: "apprehension",
              name: "Patellar apprehension",
              how: "Knee at 20–30°, translate the patella laterally and watch the face, not the knee.",
              finding: "**Apprehension, not pain,** is the positive — it points to previous lateral dislocation and an incompetent medial patellofemoral ligament",
            },
            {
              id: "lachman",
              name: "Lachman test",
              how: "Knee at 20–30°, femur stabilized, translate the tibia anteriorly. Grade the excursion and, more importantly, the end feel.",
              finding: "**A soft or absent end point is the positive** — not the millimetres. The single best ACL test: roughly **85% sensitive and 94% specific**",
            },
            {
              id: "anterior-drawer",
              name: "Anterior drawer",
              how: "Knee at 90°, foot stabilized, hamstrings relaxed; translate the tibia forward.",
              finding: "Much less useful acutely — hamstring guarding and haemarthrosis both defeat it. **Sensitivity around 90% in a chronic ACL knee and far lower in an acute one**",
            },
            {
              id: "pivot-shift",
              name: "Pivot shift",
              how: "From extension apply valgus and internal rotation while flexing; feel for the reduction clunk at 20–40°.",
              finding: "**Very specific (≈98%) and poorly sensitive (≈24%) awake** — a positive rules the ACL in, a negative rules nothing out. Guarding suppresses it, so a negative in an acute knee means little",
            },
            {
              id: "posterior-sag",
              name: "Posterior sag and posterior drawer",
              how: "Both hips and knees at 90°, view from the side for a step-off loss; then a posterior drawer at 90°.",
              finding: "**Check the sag before the drawer.** A tibia already sitting back turns a PCL injury into a false-positive anterior drawer — the commonest way an ACL tear is diagnosed in a PCL knee",
            },
            {
              id: "valgus-stress",
              name: "Valgus stress at 0° and 30°",
              how: "Apply a valgus force with the knee fully extended, then at 30° of flexion.",
              finding: "**Laxity at 30° only = isolated MCL. Laxity at 0° as well = MCL plus posteromedial capsule and probably cruciate.** Grade I 0–5 mm, II 5–10 mm, III over 10 mm",
            },
            {
              id: "varus-stress",
              name: "Varus stress at 0° and 30°",
              how: "The same two positions, varus force.",
              finding: "Laxity at 30° = LCL. **Laxity at 0° implicates the posterolateral corner** — screen with the dial test and treat it as a surgical referral, not a rehabilitation problem",
            },
            {
              id: "joint-line",
              name: "Joint line tenderness",
              how: "Knee flexed to 90°, palpate the medial and lateral joint lines from the anterior border of the collateral ligaments backward.",
              finding: "**Sensitive (~83%) but not specific** — good for raising a meniscus, poor for confirming one. Its value is in the composite, not alone",
            },
            {
              id: "mcmurray",
              name: "McMurray test",
              how: "From full flexion, externally rotate the tibia and extend for the medial meniscus, internally rotate and extend for the lateral.",
              finding: "**A palpable or audible thud is the positive; pain alone is not.** Specific when a true clunk is felt (~97%), and insensitive (~50–60%)",
            },
            {
              id: "thessaly",
              name: "Thessaly test",
              how: "Standing on the involved leg at 20° of flexion, holding your hands, the patient rotates the body internally and externally three times.",
              finding: "Joint line discomfort or a sense of locking or catching. **The original accuracy figures have not been reproduced** in later work — use it as one input, not the decider",
            },
            {
              id: "quad-strength",
              name: "Quadriceps strength and lag",
              how: "Seated isometric at 60°, then a straight leg raise watching for extension lag.",
              finding: "**A straight leg raise with a lag means the extensor mechanism cannot hold what the joint can reach.** Compare limb symmetry — under 90% of the other side is a return-to-sport ceiling",
            },
            {
              id: "hip-screen",
              name: "Proximal screen before you treat the knee",
              how: "Hip abductor and external rotator strength, single leg stance, and hip rotation range.",
              finding: "Dynamic valgus at the knee is frequently a hip finding. **A knee that collapses under load with normal knee tests is a hip problem presenting distally**",
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
          text: "Alignment, range, gait, and the thresholds that make a test positive. Everything here should be producible without looking it up.",
        },
        {
          kind: "numbers",
          cells: [
            { value: "5–7°", label: "Normal tibiofemoral valgus in standing" },
            { value: "13–14° / 17–18°", label: "Q angle in men / in women; over 20° usually called abnormal" },
            { value: "0–135°", label: "Knee flexion range" },
            { value: "0–5°", label: "Hyperextension that is still normal; beyond 10° is recurvatum" },
            { value: "≈10°", label: "Tibial external rotation in the screw-home mechanism" },
            { value: "1 cm ≈ 1°", label: "Prone heel-height difference to extension loss" },
            { value: "1–2", label: "Patellar glide quadrants, each direction" },
            { value: "15–20°", label: "Knee flexion at loading response in gait" },
            { value: "60–70°", label: "Peak knee flexion in swing" },
            { value: "< 2 hr", label: "Swelling this fast is a haemarthrosis until proven otherwise" },
            { value: "> 24 hr", label: "Slow effusion — reactive, fits meniscus or synovitis" },
            { value: "0 – 3+", label: "Effusion sweep test grades" },
            { value: "20–30°", label: "Knee flexion for the Lachman test" },
            { value: "5 / 10 mm", label: "Collateral laxity: grade I under 5, II 5–10, III over 10" },
            { value: "0° and 30°", label: "The two positions every collateral stress test is done in" },
            { value: "≥ 90%", label: "Quadriceps limb symmetry commonly used as a return-to-sport floor" },
          ],
        },
        {
          kind: "footnote",
          text: "Normative ranges follow standard goniometry references; the Q angle and the return-to-sport symmetry threshold are both widely quoted and genuinely contested — see the callouts where they are used.",
        },
      ],
    },
    {
      id: "subjective",
      navLabel: "Subjective",
      title: "The history does most of the work at the knee",
      blocks: [
        {
          kind: "lede",
          text: "More than at most joints, the knee's diagnosis is often made before you touch it. Two questions carry most of the information: what the mechanism was, and how fast it swelled.",
        },
        {
          kind: "table",
          columns: ["Mechanism", "What it loads", "First suspects", "The confirming test"],
          rows: [
            [
              { text: "Non-contact deceleration, pivot or landing", variant: "name" },
              "Anterior tibial translation with internal rotation as the foot stays planted",
              "**ACL** — often with a pop the patient heard, and swelling within hours",
              "Lachman first; pivot shift if they can relax",
            ],
            [
              { text: "Valgus blow to the lateral knee", variant: "name" },
              "Medial gapping — MCL, then the posteromedial capsule, then the cruciate",
              "**MCL**, and with enough force the medial meniscus and ACL with it",
              "Valgus stress at 30°, then repeat at 0°",
            ],
            [
              { text: "Dashboard injury, or a fall onto a flexed knee", variant: "name" },
              "Posterior tibial translation with the tibia driven back on the femur",
              "**PCL**",
              "Posterior sag viewed from the side, before any drawer",
            ],
            [
              { text: "Twisting on a loaded, flexed knee", variant: "name" },
              "Shear across the meniscus between femur and tibia",
              "**Meniscus** — swelling the next morning rather than the same hour",
              "Joint line tenderness plus McMurray plus history, as a composite",
            ],
            [
              { text: "Direct blow to the patella, or a lateral dislocation that reduced itself",
                variant: "name" },
              "Patellofemoral joint and the medial patellofemoral ligament",
              "**Patellar dislocation** — a haemarthrosis with a normal Lachman",
              "Apprehension sign and medial retinacular tenderness",
            ],
            [
              { text: "No injury at all — insidious anterior pain on stairs and sitting", variant: "name" },
              "Patellofemoral load over time rather than a single event",
              "**Patellofemoral pain** — the commonest presentation in the clinic",
              "Step-down test, then the proximal screen",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Time the swelling, don't just note it.",
          body: "An effusion that appears within two hours is blood in the joint, and blood means a torn ACL, an osteochondral fracture or a patellar dislocation in the large majority of cases. One that appears the next morning is reactive synovial fluid and fits a meniscal tear or synovitis. The same question — *how long before it swelled?* — separates two entirely different examinations.",
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
          text: "Four zones. Each carries its own short list and the test that separates them. As at the hip, the pattern narrows the examination before it starts.",
        },
        {
          kind: "table",
          columns: ["Pain location", "Candidate source", "The test that addresses it", "The finding that confirms it"],
          rows: [
            { group: "Anterior" },
            [
              { text: "Anterior, diffuse, around or under the patella", variant: "name" },
              "Patellofemoral pain",
              "Step-down · squat · prolonged sitting history",
              "Reproduction on the step-down with **no effusion and full range** — a diagnosis of pattern, not of a single test",
            ],
            [
              { text: "Inferior pole of the patella", variant: "name" },
              "Patellar tendinopathy",
              "Single leg decline squat · palpation of the inferior pole",
              "Localized tenderness at the pole that **increases with load** rather than easing with warm-up",
            ],
            [
              { text: "Tibial tubercle, adolescent", variant: "name" },
              "Osgood-Schlatter",
              "Palpation · resisted extension",
              "Tenderness and prominence at the tubercle in a **skeletally immature** patient",
            ],
            [
              { text: "Anterior with a haemarthrosis", variant: "name" },
              "Patellar dislocation that self-reduced",
              "Apprehension sign · medial retinacular palpation",
              "Apprehension on lateral translation with tenderness along the medial retinaculum",
            ],
            { group: "Medial" },
            [
              { text: "Medial joint line", variant: "name" },
              "Medial meniscus",
              "Joint line tenderness · McMurray · Thessaly",
              "A **composite** — joint line tenderness plus a positive McMurray thud plus a fitting history",
            ],
            [
              { text: "Medial, above the joint line", variant: "name" },
              "MCL",
              "Valgus stress at 30°, then 0°",
              "Gapping at 30° with a firm end point = grade I–II; gapping at 0° means more than the MCL",
            ],
            [
              { text: "Medial, distal to the joint line", variant: "name" },
              "Pes anserine bursitis or tendinopathy",
              "Palpation 4–5 cm distal to the medial joint line · resisted flexion",
              "Tenderness **below** the joint line, not on it — the distinction from meniscus is anatomical",
            ],
            { group: "Lateral" },
            [
              { text: "Lateral joint line", variant: "name" },
              "Lateral meniscus",
              "Joint line tenderness · McMurray with internal rotation",
              "As medial, as a composite",
            ],
            [
              { text: "Lateral femoral epicondyle", variant: "name" },
              "Iliotibial band syndrome",
              "Noble compression · Ober · running history",
              "Pain at **~30° of flexion** as the band crosses the epicondyle, in a runner or cyclist",
            ],
            [
              { text: "Lateral with varus laxity", variant: "name" },
              "LCL and posterolateral corner",
              "Varus stress at 30° and 0° · dial test",
              "Laxity at 0° — **refer**; the posterolateral corner is a surgical problem",
            ],
            { group: "Posterior" },
            [
              { text: "Posterior, fullness behind the knee", variant: "name" },
              "Baker's cyst",
              "Palpation in the popliteal fossa with the knee extended",
              "A fluctuant swelling that is firmest in extension, usually secondary to an intra-articular problem",
            ],
            [
              { text: "Posterior with a positive sag", variant: "name" },
              "PCL",
              "Posterior sag · posterior drawer · quadriceps active test",
              "Loss of the tibial step-off before any drawer force is applied",
            ],
            [
              { text: "Posterior calf pain and swelling", variant: "name" },
              "Deep vein thrombosis",
              "Risk factor screen and referral — not a knee test",
              "**Stop the examination.** Unilateral calf swelling, warmth and tenderness with risk factors is a same-day referral",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "knee-pain-map",
          title: "Four zones, and what each one opens",
          caption:
            "**Where the finger lands narrows the list before you touch the knee.** Anterior pain is a load problem far more often than a structural one; medial and lateral pain divide again by whether the tenderness sits on the joint line or off it; and posterior pain carries the one finding on this page that ends the examination rather than continuing it.",
        },
      ],
    },
    {
      id: "alignment",
      navLabel: "Alignment",
      title: "Alignment → the measurement it obligates",
      blocks: [
        {
          kind: "lede",
          text: "The knee is the joint in the middle. Almost every alignment finding here is a question about the hip above it or the foot below it, and naming the fault commits you to testing the segment that produced it.",
        },
        {
          kind: "table",
          columns: ["Finding", "What you see", "Where it comes from", "Then you must measure"],
          rows: [
            [
              { text: "Genu valgum", variant: "name" },
              "Tibiofemoral angle beyond **5–7°** of valgus; knees closer than ankles",
              "Femoral anteversion, hip abductor and external rotator weakness, or a pronated foot",
              "Hip abduction and external rotation strength · single leg stance · foot posture in standing",
            ],
            [
              { text: "Genu varum", variant: "name" },
              "Valgus lost or reversed; ankles closer than knees",
              "Structural, or the medial compartment collapsing in osteoarthritis",
              "Medial joint line tenderness · gait for a varus thrust at loading response",
            ],
            [
              { text: "Genu recurvatum", variant: "name" },
              "Hyperextension **beyond 10°**",
              "Generalized laxity, or a compensation for weak plantarflexors or quadriceps",
              "Beighton score · quadriceps strength · posterior capsule integrity",
            ],
            [
              { text: "Squinting patellae", variant: "name" },
              "Patellae facing inward with the feet forward",
              "Femoral anteversion — a hip finding read at the knee",
              "Prone femoral version test in 15° of abduction · hip IR and ER range",
            ],
            [
              { text: "Patella alta", variant: "name" },
              "High-riding patella, sitting above the trochlear groove at rest",
              "A long patellar tendon; the patella enters the groove late in flexion",
              "Patellar glide and apprehension — alta and instability travel together",
            ],
            [
              { text: "Lateral patellar tilt", variant: "name" },
              "Lateral border sitting lower than the medial, and refusing to lift to horizontal",
              "A tight lateral retinaculum and iliotibial band",
              "Patellar tilt test · Ober test · lateral glide quadrants",
            ],
            [
              { text: "Increased Q angle", variant: "name" },
              "Over **20°** by the ASIS–patella–tubercle construction",
              "Wide pelvis, femoral anteversion, tibial external torsion, or a pronated foot",
              "Femoral version · tibial torsion · foot posture — and see the caution below",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "q-angle",
          title: "The Q angle is built from two lines, and each end can move it",
          caption:
            "**The angle is a consequence, not a cause.** One line runs from the ASIS to the centre of the patella and the second from the patella to the tibial tubercle; anything that widens the pelvis, rotates the femur inward or the tibia outward opens the angle without the knee itself changing. Which is why the measurement obligates a version test and a foot assessment rather than a knee treatment.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "The Q angle is measured far more often than it earns.",
          body: "Its normal values are quoted differently across sources, it changes with the position of the patella and the tibia, and its association with patellofemoral pain is weak in the literature. Measure it and record it, but do not let it outrank the dynamic finding — a knee that collapses into valgus on a step-down tells you more than a static angle does.",
        },
      ],
    },
    {
      id: "rom",
      navLabel: "Range",
      title: "Range, end feel, and the lag that changes everything",
      blocks: [
        {
          kind: "lede",
          text: "One question separates two different problems and two different treatments: does the knee not extend, or does the quadriceps not extend it? Compare active against passive before you measure anything else.",
        },
        {
          kind: "table",
          columns: ["Motion", "Normal", "Position & goniometer", "Normal end feel", "First suspects when it's short"],
          rows: [
            [
              { text: "Flexion", variant: "name" },
              { text: "0–135°", variant: "num" },
              "Supine, heel toward the buttock. Axis lateral epicondyle · stationary arm to the greater trochanter · moving arm to the lateral malleolus",
              "Soft tissue approximation",
              "Effusion first — a large effusion mechanically blocks flexion. Then quadriceps and anterior capsule",
            ],
            [
              { text: "Extension", variant: "name" },
              { text: "0°", variant: "num" },
              "Supine with the heel supported, or prone with the thigh on the table and the leg free",
              "Firm",
              "Posterior capsule, hamstring, a displaced meniscus (springy), or an effusion holding the knee at its position of least pressure",
            ],
            [
              { text: "Hyperextension", variant: "name" },
              { text: "0–5°", variant: "num" },
              "Prone heel-height comparison against the other side",
              "Firm",
              "Compare sides — losing normal hyperextension is a loss even though the number still reads zero",
            ],
            [
              { text: "Tibial rotation", variant: "name" },
              "IR ≈ 10° · ER ≈ 10° at 90° of flexion",
              "Seated, knee at 90°, rotate the foot",
              "Firm",
              "Capsular restriction; also the motion that the screw-home mechanism uses at the other end of the range",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Extension lag versus flexion contracture:",
          body: "if passive extension is full and active extension is not, the joint can get there and the extensor mechanism cannot — that is a **lag**, and it is a strength and inhibition problem. If both are equally short, the joint itself is restricted — that is a **contracture**, and it is a mobility problem. Treating a lag with stretching, or a contracture with strengthening, wastes a course of care.",
        },
        {
          kind: "figure",
          figureId: "screw-home",
          title: "The last thirty degrees are a rotation, not just an extension",
          caption:
            "**The tibia externally rotates about ten degrees as the knee locks out.** The medial femoral condyle is longer, so the tibia keeps travelling on that side after the lateral side has run out — the joint screws into its closed-packed position and stands without quadriceps work. Losing that rotation blocks the last few degrees of extension, which is why a knee that will not quite straighten is often a rotation problem rather than a hamstring one.",
        },
        { kind: "heading", text: "The capsular pattern, and what it is not" },
        {
          kind: "table",
          columns: ["Pattern", "What you find", "Reads as"],
          rows: [
            [
              { text: "Capsular", variant: "name" },
              "**Flexion limited far more than extension**, firm end feel in both, proportional across sides",
              "Arthritis, or a joint that has been immobilized",
            ],
            [
              { text: "Springy block", variant: "name" },
              "Extension stops short with a rebound at the end",
              "**Displaced meniscal fragment or a loose body** — a mechanical block, not a stiff capsule",
            ],
            [
              { text: "Empty", variant: "name" },
              "Pain stops the movement with no resistance felt",
              "Fracture, infection, acute inflammation. Screen and refer",
            ],
            [
              { text: "Boggy", variant: "name" },
              "A soft, fluid end feel with a positive sweep test",
              "Effusion. Treat the effusion first — everything you measure through it is measuring the fluid",
            ],
          ],
        },
      ],
    },
    {
      id: "effusion",
      navLabel: "Effusion",
      title: "Grade the effusion before you trust anything else",
      blocks: [
        {
          kind: "lede",
          text: "An effusion inhibits the quadriceps, blocks flexion, holds the knee in slight flexion, and changes every strength number you take. It is graded early because it invalidates the rest of the examination if it is not.",
        },
        {
          kind: "table",
          columns: ["Grade", "What the sweep test shows", "What it means for the rest of the exam"],
          rows: [
            [{ text: "Zero", variant: "name" }, "No wave produced on the medial side", "Nothing to correct for"],
            [
              { text: "Trace", variant: "name" },
              "A small wave appears on the medial side after the downward stroke",
              "Enough to inhibit the quadriceps; expect a strength deficit that is not weakness",
            ],
            [
              { text: "1+", variant: "name" },
              "A larger bulge appears with the stroke",
              "Range will be limited at both ends; re-measure after it settles",
            ],
            [
              { text: "2+", variant: "name" },
              "The effusion returns to the medial side **without** a downward stroke",
              "Substantial. Flexion is mechanically blocked, not stiff",
            ],
            [
              { text: "3+", variant: "name" },
              "So much fluid that it cannot be swept out of the medial compartment",
              "Consider aspiration and imaging; a tense haemarthrosis is a same-week referral",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "effusion-sweep",
          title: "The sweep test moves fluid you cannot see",
          caption:
            "**Empty the medial gutter first, then push fluid back into it and watch.** The upward sweep clears the medial side; the downward stroke on the lateral side drives fluid across; the grade is how readily the wave comes back. It detects effusions far smaller than ballottement, which needs enough fluid to float the patella off the femur before it says anything at all.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Why the effusion outranks the strength test:",
          body: "joint distension reflexively inhibits the quadriceps — arthrogenic muscle inhibition — and visible vastus medialis wasting follows within days. A quadriceps that tests weak over an effusion is not necessarily a weak quadriceps, and a strengthening programme aimed at it will underperform until the effusion is managed.",
        },
      ],
    },
    {
      id: "ligament",
      navLabel: "Ligament",
      title: "Ligament testing — what each test loads, and at what angle",
      blocks: [
        {
          kind: "lede",
          text: "Every test here is the same idea: remove one restraint's competition by choosing a joint angle, then load it. The angle is the test. Reading a laxity grade without the angle it was taken at is reading half the finding.",
        },
        {
          kind: "statkey",
          entries: [
            {
              abbr: "Sn",
              term: "Sensitivity.",
              body: "How often the test is positive in people who do have the injury. A sensitive test that comes back negative helps rule it out.",
            },
            {
              abbr: "Sp",
              term: "Specificity.",
              body: "How often it is negative in people who do not. A specific test that comes back positive helps rule it in.",
            },
            {
              abbr: "+LR",
              term: "Positive likelihood ratio.",
              body: "How far a positive shifts your suspicion. Over 10 is a large shift, 5–10 moderate, 2–5 small, around 1 changes nothing.",
            },
            {
              abbr: "−LR",
              term: "Negative likelihood ratio.",
              body: "How far a negative argues against it. Under 0.1 is a large shift, 0.1–0.2 moderate, 0.2–0.5 small.",
            },
          ],
          note: "Knee test statistics vary widely between studies — by examiner experience, by how acute the knee is, and by whether the comparison is arthroscopy or MRI. Treat every figure below as an order of magnitude, and weigh a cluster over any single result.",
        },
        {
          kind: "table",
          columns: ["Test", "Angle", "What it loads", "Positive", "Stats"],
          widths: ["16%", "11%", "28%", "27%", "18%"],
          rows: [
            { group: "Anterior cruciate" },
            [
              { text: "Lachman", variant: "name" },
              { text: "20–30°", variant: "num" },
              {
                text: "**Anteromedial bundle of the ACL** at the angle where the hamstrings and the meniscal wedge interfere least",
                variant: "tissue",
              },
              "A **soft or absent end point**. The excursion matters less than the quality of the stop",
              { text: "Sn ≈ 85 · Sp ≈ 94", variant: "num" },
            ],
            [
              { text: "Anterior drawer", variant: "name" },
              { text: "90°", variant: "num" },
              { text: "**ACL**, but with the hamstrings in a strong position to defend and a haemarthrosis blocking flexion", variant: "tissue" },
              "Increased anterior translation against the other side",
              { text: "Sn ≈ 90 chronic, far lower acute", variant: "num" },
            ],
            [
              { text: "Pivot shift", variant: "name" },
              "extension → 40°",
              { text: "**Rotatory instability** — the lateral tibial plateau subluxing anteriorly and reducing as the IT band changes line", variant: "tissue" },
              "A palpable clunk of reduction at 20–40°",
              { text: "Sp ≈ 98 · Sn ≈ 24 awake", variant: "num" },
            ],
            { group: "Posterior cruciate" },
            [
              { text: "Posterior sag", variant: "name" },
              { text: "90°", variant: "num" },
              { text: "**PCL** under gravity alone — no examiner force at all", variant: "tissue" },
              "Loss of the normal 1 cm tibial step-off in front of the femoral condyles",
              { text: "Do this first", variant: "num" },
            ],
            [
              { text: "Posterior drawer", variant: "name" },
              { text: "90°", variant: "num" },
              { text: "**PCL**", variant: "tissue" },
              "Increased posterior translation from a corrected starting position",
              { text: "Sn ≈ 90 · Sp ≈ 99", variant: "num" },
            ],
            [
              { text: "Quadriceps active test", variant: "name" },
              { text: "90°", variant: "num" },
              { text: "**PCL** — the quadriceps pulls a posteriorly sagging tibia forward", variant: "tissue" },
              "The tibia visibly reduces anteriorly on a gentle quadriceps contraction",
              { text: "Sp high", variant: "num" },
            ],
            { group: "Collaterals and the corners" },
            [
              { text: "Valgus stress", variant: "name" },
              { text: "30°", variant: "num" },
              { text: "**Superficial MCL** in isolation — 30° of flexion unlocks the joint and takes the posterior capsule out of the test", variant: "tissue" },
              "Medial gapping. Grade I 0–5 mm, II 5–10 mm, III over 10 mm",
              { text: "Sn ≈ 86 for MCL", variant: "num" },
            ],
            [
              { text: "Valgus stress", variant: "name" },
              { text: "0°", variant: "num" },
              { text: "**MCL plus the posteromedial capsule and the cruciates** — full extension recruits every medial restraint", variant: "tissue" },
              "Gapping in full extension is a **more serious injury**, not a bigger MCL sprain",
              { text: "Escalates the finding", variant: "num" },
            ],
            [
              { text: "Varus stress", variant: "name" },
              { text: "30° then 0°", variant: "num" },
              { text: "**LCL** at 30°; at 0° the posterolateral corner and cruciates as well", variant: "tissue" },
              "Lateral gapping; at 0° treat as a posterolateral corner injury",
              { text: "Refer if positive at 0°", variant: "num" },
            ],
            [
              { text: "Dial test", variant: "name" },
              { text: "30° and 90°", variant: "num" },
              { text: "**Posterolateral corner** at 30°; PCL involvement as well if it increases at 90°", variant: "tissue" },
              "More than 10–15° of side-to-side external rotation asymmetry",
              { text: "Surgical referral", variant: "num" },
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "ligament-angle",
          title: "The angle is what makes the test specific",
          caption:
            "**The same anterior force tests different things at different angles.** At 20–30° the hamstrings are slack and the meniscal wedge is not blocking translation, so a Lachman loads the ACL cleanly; at 90° the hamstrings can defend the joint and an acutely swollen knee will not even reach the position. Collaterals invert the logic: 30° isolates the ligament, while 0° recruits the capsule and cruciates so that gapping there means a bigger injury rather than a bigger sprain.",
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Check the sag before any drawer.",
          body: "A tibia already sitting posteriorly from a PCL injury starts the anterior drawer from a false position, and pulling it back to neutral feels exactly like anterior laxity. That is the commonest route to diagnosing an ACL tear in a knee whose ACL is intact. Look from the side at 90° first, every time.",
        },
      ],
    },
    {
      id: "meniscus",
      navLabel: "Meniscus",
      title: "Meniscus — no single test, and why",
      blocks: [
        {
          kind: "lede",
          text: "Every meniscal test in common use is either sensitive and unspecific or specific and insensitive. The diagnosis is a composite: mechanism, delayed effusion, joint line tenderness, and a positive provocation, weighed together.",
        },
        {
          kind: "table",
          columns: ["Test", "How", "Positive", "What fakes a result", "Stats"],
          rows: [
            [
              { text: "Joint line tenderness", variant: "name" },
              "Knee at 90°, palpate along each joint line from the anterior border of the collateral backward",
              "Tenderness localized to the line itself",
              "Tenderness **below** the line is pes anserine; **above** it is the collateral. The joint line is a narrow target",
              { text: "Sn ≈ 83 · Sp ≈ 76", variant: "num" },
            ],
            [
              { text: "McMurray", variant: "name" },
              "From full flexion, tibia externally rotated and extended for the medial meniscus; internally rotated for the lateral",
              "A palpable or audible **thud** — pain alone is not the test",
              "Accepting pain as positive. That is what turns a specific test into a useless one",
              { text: "Sn ≈ 50–60 · Sp ≈ 97 for a true clunk", variant: "num" },
            ],
            [
              { text: "Thessaly", variant: "name" },
              "Standing on the involved leg at 20° of flexion, rotating the body internally and externally three times",
              "Joint line discomfort, or a sense of locking or catching",
              "Poor balance and quadriceps inhibition both produce a wobble that is not a meniscal sign",
              { text: "Original figures not reproduced", variant: "num" },
            ],
            [
              { text: "Apley grind", variant: "name" },
              "Prone, knee at 90°, compress through the heel and rotate; then distract and rotate",
              "Pain on **compression** that eases on distraction",
              "A stiff or irritable joint hurts on both, which is a joint-surface finding rather than a meniscal one",
              { text: "Low sensitivity", variant: "num" },
            ],
            [
              { text: "Bounce home", variant: "name" },
              "Support the heel and let the knee drop into extension",
              "A **springy block** short of full extension",
              "A hamstring that will not let go — settle the knee and repeat",
              { text: "Suggests a displaced fragment", variant: "num" },
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "meniscus-zones",
          title: "Where the tear is decides whether it can heal",
          caption:
            "**Only the outer third has a blood supply.** The peripheral red-red zone is vascular and can heal or be repaired; the middle red-white zone is marginal; the inner white-white third is avascular and will not heal, which is why tears there are trimmed rather than repaired. The same tear pattern carries a different prognosis and a different rehabilitation timeline depending only on how far from the rim it sits.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "A degenerate meniscal tear is not the same clinical problem as a traumatic one.",
          body: "In a middle-aged or older knee with no clear injury, a tear found on imaging is common in people with no symptoms at all, and the evidence supports exercise ahead of arthroscopy for degenerative tears without true mechanical locking. True locking — a springy block you cannot pass — is the finding that changes that conversation.",
        },
      ],
    },
    {
      id: "patellofemoral",
      navLabel: "Patellofemoral",
      title: "The patellofemoral joint, and the hip above it",
      blocks: [
        {
          kind: "lede",
          text: "The commonest knee presentation in the clinic, and the one least likely to be settled by a special test. Patellofemoral pain is diagnosed from a pattern — anterior pain on stairs, squatting and prolonged sitting, with no effusion and full range — and then treated proximally at least as often as locally.",
        },
        {
          kind: "table",
          columns: ["Test", "How", "Normal", "The finding"],
          rows: [
            [
              { text: "Patellar glide", variant: "name" },
              "Knee at 20–30° over a bolster, quadriceps relaxed; divide the patella into four longitudinal quadrants and translate it each way",
              "**1–2 quadrants** medially and laterally",
              "Under 1 quadrant medially = tight lateral retinaculum. Over 3 laterally = hypermobility",
            ],
            [
              { text: "Patellar tilt", variant: "name" },
              "Lift the lateral border of the patella away from the lateral femoral condyle",
              "The lateral border reaches **at least the horizontal**",
              "Failure to reach neutral is a tight lateral retinaculum and iliotibial band",
            ],
            [
              { text: "Apprehension", variant: "name" },
              "At 20–30°, translate the patella laterally and watch the patient's face",
              "No reaction",
              "**Apprehension, not pain** — a history of lateral dislocation and an incompetent MPFL",
            ],
            [
              { text: "J sign", variant: "name" },
              "Watch the patella through active extension from 90° to 0° in sitting",
              "A straight path into the groove",
              "An abrupt lateral deviation as the patella exits the trochlea near full extension — maltracking, often with alta",
            ],
            [
              { text: "Step-down", variant: "name" },
              "Single leg, controlled lowering of the opposite heel from a 20 cm step",
              "Level pelvis, knee tracking over the second toe",
              "**Dynamic valgus with contralateral pelvic drop** and reproduction of their pain — the test to re-measure against",
            ],
            [
              { text: "Proximal screen", variant: "name" },
              "Hip abduction and external rotation strength, single leg stance, hip rotation range",
              "Symmetric",
              "Weakness here explains a valgus collapse the knee itself cannot",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "The patellar grind test is not on this list on purpose.",
          body: "Compressing the patella against the femur and asking whether it hurts is positive in a large share of people without knee pain, and it does not distinguish patellofemoral pain from anything else. If you use it, use it to reproduce their concordant symptom rather than as evidence of a diagnosis.",
        },
      ],
    },
    {
      id: "treatment",
      navLabel: "Treatment",
      title: "From a finding to the first session",
      blocks: [
        {
          kind: "lede",
          text: "The rest of the page is organized by structure. This is organized by what you found, which is the direction you actually work in.",
        },
        {
          kind: "table",
          columns: ["What you found", "What it means", "First three things", "Reassess with"],
          rows: [
            [
              { text: "Effusion with an extension lag", variant: "name" },
              "Arthrogenic inhibition — the quadriceps is switched off, not weak",
              "1 · settle the effusion: relative rest, compression, elevation\n2 · quadriceps setting and straight leg raise into the lag\n3 · restore terminal extension range before adding load",
              "The sweep grade and the size of the lag, session to session",
            ],
            [
              { text: "Extension loss with a springy block", variant: "name" },
              "A mechanical block — displaced meniscal fragment or a loose body",
              "1 · do not force it\n2 · protect and refer for imaging\n3 · maintain quadriceps and hip strength meanwhile",
              "Whether the block persists; a knee that unlocks changes the plan entirely",
            ],
            [
              { text: "Extension loss with a firm capsular end feel", variant: "name" },
              "A contracture, not a lag — the joint itself is restricted",
              "1 · low-load prolonged extension positioning\n2 · tibiofemoral **anterior** glide, graded to irritability\n3 · patellar superior glide for extension mobility",
              "Prone heel height, immediately after each round of mobilization",
            ],
            [
              { text: "Flexion loss with a firm end feel and no effusion", variant: "name" },
              "Posterior capsule and the patellofemoral joint",
              "1 · tibiofemoral **posterior** glide\n2 · patellar inferior glide, which flexion needs most\n3 · quadriceps length work in prone",
              "Heel-to-buttock distance and flexion goniometry",
            ],
            [
              { text: "Anterior pain, full range, no effusion, valgus on step-down", variant: "name" },
              "Patellofemoral pain with a proximal driver",
              "1 · hip abductor and external rotator loading\n2 · movement retraining on the step-down itself\n3 · load management — reduce the provoking volume rather than stopping",
              "The step-down: frontal-plane control and pain, on the same step height",
            ],
            [
              { text: "Medial gapping at 30° only, firm end point", variant: "name" },
              "Isolated MCL, grade I–II — a ligament that heals",
              "1 · protect from valgus load, hinged brace if grade II\n2 · early range within a pain-free arc\n3 · progressive loading; MCL injuries do well non-operatively",
              "Valgus stress at 30°, and pain-free range",
            ],
            [
              { text: "Soft Lachman end point with a haemarthrosis", variant: "name" },
              "ACL rupture until imaging says otherwise",
              "1 · settle the effusion and restore full **extension** first\n2 · quadriceps activation without anterior shear\n3 · refer; the surgical decision is not a physical therapy one",
              "Extension range and the effusion, then quadriceps symmetry",
            ],
          ],
        },
        { kind: "heading", text: "Mobilization directions at the knee" },
        {
          kind: "lede",
          text: "The knee inverts the rule the hip and shoulder follow. Tibia on femur is the **concave** partner moving, so roll and glide go the *same* way — which is why the glide direction here matches the motion you are trying to gain rather than opposing it.",
        },
        {
          kind: "table",
          columns: ["Technique", "Direction", "Use when", "Why that direction"],
          rows: [
            [
              { text: "Tibiofemoral anterior glide", variant: "name" },
              "Anterior on the tibia, prone or supine with the femur stabilized",
              "Limited **extension** with a capsular end feel",
              "Concave rule: the tibial plateau glides the same way the shaft travels, and extension carries it forward",
            ],
            [
              { text: "Tibiofemoral posterior glide", variant: "name" },
              "Posterior on the tibia, knee flexed over a bolster",
              "Limited **flexion** with a capsular end feel",
              "The same rule the other way — flexion carries the plateau backward",
            ],
            [
              { text: "Long axis distraction", variant: "name" },
              "Along the tibial shaft, knee in the open packed position",
              "Global pain relief and irritable joints; the general first technique",
              "Perpendicular to the treatment plane, so it separates rather than translates",
            ],
            [
              { text: "Patellar superior glide", variant: "name" },
              "Cephalad on the patella, knee extended",
              "Limited **extension** and a quadriceps that cannot finish the range",
              "The patella must travel superiorly for terminal extension; a patella that will not glide up blocks it",
            ],
            [
              { text: "Patellar inferior glide", variant: "name" },
              "Caudad on the patella",
              "Limited **flexion**",
              "The patella descends into the trochlea as the knee bends",
            ],
            [
              { text: "Patellar medial glide", variant: "name" },
              "Medial, with the knee at 20–30°",
              "A tight lateral retinaculum with under one quadrant of medial glide",
              "It is the retinaculum being lengthened, not the joint being repositioned",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "concave-knee-glide",
          title: "The knee is the opposite case to the hip",
          caption:
            "**The tibial plateau is concave and it is the bone that moves, so roll and glide travel together.** Extend the knee and the plateau glides anteriorly; flex it and the plateau glides posteriorly — the same direction as the shaft, not the opposite. This is why the mobilization direction at the knee is the direction you want, while at the hip and shoulder it is the direction you do not.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Dose is the same as everywhere else:",
          body: "grade matched to irritability — I–II for pain in 10–30 second bouts, III–IV for length in 60 second bouts, oscillating 2–3 per second. Three bouts with 30 seconds rest, ease out of a grade III or IV with 5–10 seconds of grade I–II, then 3 × 30 active repetitions into the range you just gained, and reassess.",
        },
      ],
    },
    {
      id: "drill",
      navLabel: "Drill",
      title: "Rapid drill",
      note: "answer before you open",
      blocks: [
        { kind: "heading", text: "Cases — work the whole chain" },
        {
          kind: "lede",
          text: "For each, name the findings you would go after, what the swelling timing tells you, the structure, and what you do first.",
        },
        {
          kind: "cases",
          items: [
            {
              scenario:
                "22-year-old footballer. Planted and cut, felt a pop, could not continue. The knee was visibly swollen within the hour. Today, two days later: full extension is blocked by about 8°, the sweep test returns fluid without a stroke, and the Lachman end point feels soft. Pivot shift is negative.",
              lines: [
                { label: "Swelling first:", body: "under two hours means haemarthrosis — ACL rupture, osteochondral fracture or patellar dislocation. The mechanism and the Lachman point at the first." },
                { label: "The negative pivot shift:", body: "means very little here. It is highly specific and poorly sensitive **awake**, and guarding in an acute knee suppresses it. A negative does not subtract from a soft Lachman." },
                { label: "Effusion grade:", body: "2+ — the fluid returns without a downward stroke. Every strength number taken today is measuring inhibition, not weakness." },
                { label: "First session:", body: "settle the effusion, and restore **extension** before anything else — a knee that loses terminal extension early is the one that struggles later. Quadriceps setting without anterior shear. Refer for imaging; the surgical decision is not yours." },
                { label: "The trap:", body: "chasing flexion range through a tense effusion. The block is fluid, not stiffness, and forcing it buys nothing." },
              ],
            },
            {
              scenario:
                "48-year-old, no injury. Six weeks of medial knee pain that came on after a weekend of gardening. No swelling at any point. Full range, firm end feels. Medial joint line is tender, McMurray produces pain but no thud, MRI from their GP reports a degenerative medial meniscal tear.",
              lines: [
                { label: "The imaging is not the diagnosis:", body: "degenerative meniscal tears are common findings in knees with no symptoms at all. The report describes the knee, not necessarily the problem." },
                { label: "The McMurray:", body: "pain without a thud is not a positive McMurray. The thud is what makes the test specific; accepting pain converts a specific test into a meaningless one." },
                { label: "What is missing:", body: "no true mechanical locking, no effusion at any stage, and an insidious onset in a middle-aged knee. That pattern is degenerative, and the evidence favours exercise over arthroscopy for it." },
                { label: "First session:", body: "progressive loading of the quadriceps and hip, load management around the provoking activity, and an explanation that the scan finding and the pain are not the same thing." },
                { label: "What would change it:", body: "a springy block short of full extension. True locking is the finding that reopens the surgical conversation." },
              ],
            },
            {
              scenario:
                "16-year-old runner. Anterior knee pain for three months, worse on stairs down and after sitting through class. No swelling, full range, no joint line tenderness. On a single-leg step-down the knee travels well medial to the second toe and the opposite side of the pelvis drops.",
              lines: [
                { label: "Diagnosis:", body: "patellofemoral pain — a pattern diagnosis: anterior pain with stairs, squatting and prolonged sitting, no effusion, full range, no mechanical symptoms." },
                { label: "Where the fault is:", body: "not at the knee. Dynamic valgus with contralateral pelvic drop is a hip abductor and external rotator finding presenting distally." },
                { label: "Test next:", body: "hip abduction and external rotation strength, single leg stance, patellar glide and tilt for a tight lateral retinaculum." },
                { label: "First session:", body: "hip abductor and external rotator loading, movement retraining on the step-down itself, and load management — reduce the provoking running volume rather than stopping altogether." },
                { label: "Reassess with:", body: "the step-down, at the same step height: frontal-plane control and pain. Not the Q angle." },
              ],
            },
          ],
        },
        { kind: "heading", text: "Single facts" },
        {
          kind: "drill",
          items: [
            {
              question: "The knee swelled within an hour of the injury. What does that narrow it to?",
              answer:
                "A haemarthrosis — blood in the joint. In the large majority of cases that means an ACL rupture, an osteochondral fracture, or a patellar dislocation that has reduced itself. An effusion that appears the next morning is reactive fluid and fits a meniscal tear or synovitis instead.",
            },
            {
              question: "Passive extension is full, active extension is 10° short. What is that, and what is it not?",
              answer:
                "An extension lag: the joint can reach the position and the extensor mechanism cannot hold it. That is a strength and inhibition problem, usually arthrogenic inhibition from an effusion. It is not a contracture — a contracture loses passive and active range equally, and is treated with mobility rather than strength.",
            },
            {
              question: "Why is the Lachman done at 20–30° rather than at 90°?",
              answer:
                "At 20–30° the hamstrings are slack and cannot defend the joint, and the meniscal wedge is not blocking anterior translation, so the ACL is loaded cleanly. At 90° the hamstrings are in a strong position to resist, and an acutely swollen knee often will not reach the position at all — which is why the anterior drawer performs so much worse acutely.",
            },
            {
              question: "Valgus stress gaps at 30° and also at 0°. Is that a worse MCL sprain?",
              answer:
                "No — it is a different injury. Thirty degrees unlocks the joint and isolates the superficial MCL; full extension recruits the posteromedial capsule and the cruciates as well. Gapping at 0° means the injury has gone beyond the MCL, not that the MCL is more torn.",
            },
            {
              question: "What do you look at before you perform any drawer test, and why?",
              answer:
                "The tibial step-off from the side, with both knees at 90°. A tibia already sagging posteriorly from a PCL injury starts the anterior drawer from a false position, and pulling it back to neutral feels exactly like anterior laxity. That is the commonest way an intact ACL gets diagnosed as torn.",
            },
            {
              question: "A pivot shift is negative in an acutely injured knee. How much does that tell you?",
              answer:
                "Very little. It is highly specific — around 98% — and poorly sensitive awake, roughly 24%, because it needs the patient to relax completely. In an acute, guarded, swollen knee a negative result is close to uninformative. A positive one, though, is close to diagnostic.",
            },
            {
              question: "What makes a McMurray positive?",
              answer:
                "A palpable or audible thud as the fragment is caught and released. Pain alone does not count. With a true clunk the test is highly specific, around 97%, and it is insensitive either way — roughly half of meniscal tears will not produce one.",
            },
            {
              question: "Why does it matter which third of the meniscus the tear is in?",
              answer:
                "Blood supply. The peripheral red-red third is vascular and can heal or be repaired; the middle red-white zone is marginal; the inner white-white third is avascular and will not heal, so tears there are trimmed rather than repaired. The same tear shape carries a different prognosis depending only on how far from the rim it sits.",
            },
            {
              question: "Grade the sweep test result where the fluid comes back to the medial side on its own.",
              answer:
                "2+. Zero is no wave, trace is a small wave after the downward stroke, 1+ is a larger bulge, 2+ is the effusion returning without any stroke at all, and 3+ is so much fluid that it cannot be swept out of the medial compartment.",
            },
            {
              question: "Which way does the tibia glide to gain knee extension, and why is that the opposite of the hip?",
              answer:
                "Anteriorly — the same direction the shaft travels. The tibia is the concave partner moving on the convex femur, so roll and glide go together. At the hip and shoulder the convex partner moves on a fixed concave socket, so the glide opposes the bone.",
            },
            {
              question: "Which five findings send an acutely injured knee for a radiograph?",
              answer:
                "The Ottawa knee rules: age 55 or over, isolated patellar tenderness, tenderness at the fibular head, inability to flex to 90°, or inability to bear weight for four steps both at the time and in the clinic. Any one is enough, and the rule is close to 100% sensitive for clinically significant fracture.",
            },
            {
              question: "A knee collapses into valgus on a step-down but every knee test is normal. Where do you treat?",
              answer:
                "The hip. Dynamic valgus with contralateral pelvic drop is a hip abductor and external rotator finding presenting at the knee, and the step-down is both the test and the retraining task. Reassess with the same step height rather than with a static measurement like the Q angle.",
            },
          ],
        },
      ],
    },
  ],
  footer:
    "**About this guide.** Unlike the shoulder and hip playbooks, this one is not compiled from supplied course material — there was none for the knee. Everything here is standard musculoskeletal curriculum and textbook content: normative ranges and goniometer alignments follow standard goniometry references, the Ottawa knee rules and the effusion sweep grades are as commonly published, and the ligament, meniscal and patellofemoral examinations are the conventional ones.\n**Treat the test statistics as orders of magnitude.** Published sensitivity and specificity for knee tests vary widely with examiner experience, how acute the knee is, and whether the comparison is arthroscopy or MRI. The figures quoted are commonly cited values, not settled ones.\n**Two numbers are flagged in line as contested rather than silently picked:** the Q angle, whose normal values differ between sources and whose association with patellofemoral pain is weak, and the Thessaly test, whose original accuracy figures have not been reproduced in later work.\n**Check it against your own course material before you rely on it** — where your program's numbers differ from these, your program's are the ones you will be examined on.",
};
