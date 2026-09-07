/**
 * The ankle and foot examination playbook — the fifth Limbic Playbook (see
 * lib/playbook-content.ts for the block types, docs/playbook-authoring.md for the brief,
 * and components/playbook/PlaybookFigures.tsx for the drawings the `figure` blocks name).
 *
 * Ordered the way the examination is performed: the fracture rules that decide whether
 * there is an examination to do at all, then standing and gait, then the non-weight-bearing
 * screen, range, the ligament and syndesmosis batteries, the tendons, the heel, and
 * treatment.
 *
 * Two things shape this region and the order reflects both. The first is that a sprained
 * ankle and a fractured one present the same way, so the decision rules come before the
 * special tests rather than after them. The second is that most of what goes wrong here is
 * a load problem in a tendon rather than a torn structure, which is why the tendon section
 * is longer than the ligament section.
 *
 * Like the knee playbook, this one is not compiled from supplied course material — there
 * was none for the ankle. Everything here is standard musculoskeletal curriculum content,
 * and the `footer` says so rather than implying a source it does not have.
 */

import type { Playbook } from "@/lib/playbook-content";

export const ANKLE_PLAYBOOK: Playbook = {
  slug: "ankle",
  name: "Ankle & Foot Examination",
  title: "Ankle & Foot Examination Playbook",
  eyebrow: "Musculoskeletal practice · examination & treatment",
  summary:
    "A full ankle and foot screen in the order you'd perform it: the rule that decides whether to image before you test anything, the position that makes each ligament test specific, and the difference between a tendon that is overloaded and one that has torn. Bring a goniometer and a tape measure.",
  stamp: [
    { value: "32", label: "exam items" },
    { value: "2", label: "decision rules" },
    { value: "5", label: "pain zones" },
    { value: "10 cm", label: "lunge norm" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "32 Items",
      title: "The examination sequence",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Thirty-two items in the order they're performed — the decision rules first, then standing and walking, then the table. The ankle is the region where the screening question genuinely comes first: an acute sprain and a malleolar fracture look alike from the doorway, and the rule that separates them is quicker than any special test. The last column is the finding itself.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "ottawa-ankle",
              name: "Ottawa ankle rules, before you examine",
              how: "In acute trauma, palpate the **posterior edge and tip** of both malleoli over their distal 6 cm, then ask the patient to take four steps.",
              finding: "**Bone tenderness in either malleolar zone, or inability to bear weight for four steps both at the time and now → ankle radiograph.** Around 98–100% sensitive for clinically significant fracture; specificity is low by design",
              also: [
                {
                  name: "and the Ottawa foot rules",
                  how: "In the midfoot zone, palpate the **base of the fifth metatarsal** and the **navicular**, then the same four-step question.",
                  finding: "Tenderness at either landmark, or inability to bear weight → **foot** radiograph. The two rules are separate: a normal ankle film does not clear the midfoot",
                },
              ],
            },
            {
              id: "fibula-length",
              name: "Palpate the whole fibula, to the knee",
              how: "Run a thumb up the shaft to the fibular head before you accept a lateral ankle injury as a sprain.",
              finding: "**Proximal fibular tenderness after an ankle injury is a Maisonneuve fracture until imaged** — an unstable pattern the ankle films will not show",
            },
            {
              id: "vascular",
              name: "Neurovascular screen",
              how: "Dorsalis pedis and posterior tibial pulses, capillary refill, light touch across the five nerve territories, and pain on passive stretch.",
              finding: "Pain **out of proportion** to the injury with pain on passive toe extension is a compartment syndrome question and a same-day one. Absent pulses or a cold foot ends the examination",
            },
            {
              id: "swelling-pattern",
              name: "Where the swelling and bruising sit",
              how: "Look before you touch. Note whether the ecchymosis is lateral, medial, or plantar across the midfoot.",
              finding: "**Plantar midfoot ecchymosis is a Lisfranc injury until proven otherwise** — often missed, and it changes the management entirely",
            },
            {
              id: "posture-standing",
              name: "Foot posture in standing",
              how: "From behind, then in front: rearfoot angle, medial arch height, and whether the forefoot abducts.",
              finding: "A resting posture is context, not a diagnosis — it earns a test, not a treatment",
            },
            {
              id: "too-many-toes",
              name: "Too-many-toes sign",
              how: "From directly behind, count the toes visible lateral to the heel on each side.",
              finding: "**More toes visible on one side** = forefoot abduction with hindfoot valgus, the standing picture of posterior tibialis dysfunction",
            },
            {
              id: "heel-raise-double",
              name: "Double then single heel raise",
              how: "Both feet first; then one, watching the heel from behind.",
              finding: "**The heel should invert as it rises.** No inversion, or no rise at all, is posterior tibialis until shown otherwise",
            },
            {
              id: "heel-raise-count",
              name: "Single-leg heel raise, to fatigue",
              how: "Full height, controlled tempo, count to failure with fingertip balance support only.",
              finding: "Commonly quoted norms run to about **25 repetitions under 40**, but the side-to-side difference is the usable number",
            },
            {
              id: "lunge",
              name: "Weight-bearing lunge test",
              how: "Foot square to the wall, knee driven forward to touch it without the heel lifting. Measure toe-to-wall in centimetres, or tibial angle with an inclinometer.",
              finding: "**About 9–10 cm, or 35–40°.** A side-to-side difference over **1.5 cm** is the finding; this is the dorsiflexion measure that matters, not the supine one",
            },
            {
              id: "gait",
              name: "Gait",
              how: "Barefoot, several passes, watching from behind and from the side.",
              finding: "Look for an **early heel rise** (a dorsiflexion restriction), an abducted foot progression, and whether push-off happens over the first ray or the lateral border",
            },
            {
              id: "balance",
              name: "Single-leg balance and anterior reach",
              how: "Eyes open, 30 seconds; then an anterior reach with the stance heel down.",
              finding: "An anterior reach asymmetry over about **4 cm** has been associated with injury risk and is worth retesting at discharge",
            },
            {
              id: "palp-lateral",
              name: "Palpation, lateral ligaments",
              how: "ATFL from the anterior tip of the fibula to the talar neck; CFL running distally and posteriorly to the calcaneus; PTFL last.",
              finding: "The ATFL is tender in the large majority of inversion sprains. **CFL tenderness means the injury went past the first ligament**",
            },
            {
              id: "palp-medial",
              name: "Palpation, medial",
              how: "Deltoid ligament, then the posterior tibialis tendon along its course behind the malleolus to the navicular.",
              finding: "Isolated deltoid injury is uncommon — medial tenderness after trauma raises the question of a fracture or a syndesmotic injury",
            },
            {
              id: "palp-bone",
              name: "Palpation, the bony landmarks that get missed",
              how: "Base of the fifth metatarsal, navicular tuberosity, the Lisfranc interval between the first and second metatarsal bases, the anterior process of the calcaneus, and the dome of the talus.",
              finding: "These are the sites where a fracture hides behind a diagnosis of sprain",
            },
            {
              id: "figure-eight",
              name: "Figure-of-eight swelling measure",
              how: "A tape run in a set figure-of-eight around the malleoli and midfoot, same landmarks each time.",
              finding: "A repeatable number to track. More useful than a volumetric estimate and far more useful than an impression",
            },
            {
              id: "prom-df",
              name: "Dorsiflexion, knee straight then bent",
              how: "Subtalar joint held neutral, knee extended, then flexed to 90° (the Silfverskiöld comparison).",
              finding: "**0–20°. If dorsiflexion improves with the knee bent, the restriction is gastrocnemius; if it doesn't, it is soleus or the joint itself**",
            },
            {
              id: "prom-pf",
              name: "Plantarflexion",
              how: "Passive, with the end feel noted.",
              finding: "**0–50°.** A hard, painful posterior end feel in a dancer or footballer raises posterior impingement or an os trigonum",
            },
            {
              id: "subtalar",
              name: "Subtalar inversion and eversion",
              how: "Grip the calcaneus and move the rearfoot alone, with the talus held.",
              finding: "**Inversion roughly 20–30°, eversion 5–15°.** Eversion is the smaller range and the one lost first after immobilization",
            },
            {
              id: "midfoot",
              name: "Midfoot mobility",
              how: "Stabilize the rearfoot and move the forefoot into supination and pronation, then test each ray.",
              finding: "Compare sides. A rigid midfoot changes where load goes at push-off and belongs in the treatment plan",
            },
            {
              id: "first-mtp",
              name: "First MTP extension and the windlass",
              how: "Passive great toe extension, non-weight-bearing, then repeated with the foot loaded.",
              finding: "**0–70°, and about 65° is needed at toe-off.** The arch should rise as the toe extends — that is the windlass working",
            },
            {
              id: "anterior-drawer",
              name: "Anterior drawer",
              how: "Knee flexed, ankle in about **10–20° of plantarflexion**, calcaneus drawn forward with the tibia stabilized.",
              finding: "**ATFL.** Increased translation or a dimple over the sinus tarsi. The plantarflexed position is what makes it specific — done in dorsiflexion the test tests nothing",
            },
            {
              id: "talar-tilt",
              name: "Talar tilt",
              how: "Ankle in **neutral to slight dorsiflexion**, rearfoot inverted.",
              finding: "**CFL.** Dorsiflexion is what brings the CFL vertical and into the line of test — the mirror image of the drawer",
            },
            {
              id: "squeeze",
              name: "Squeeze test",
              how: "Compress the tibia and fibula together at **mid-calf**, well away from the injury.",
              finding: "**Pain referred distally to the syndesmosis is positive.** Pain where your hands are is not a positive test",
            },
            {
              id: "ext-rotation",
              name: "External rotation stress test",
              how: "Knee at 90°, ankle neutral, foot rotated externally against a stabilized tibia.",
              finding: "Pain at the anterolateral syndesmosis. **A positive syndesmotic screen changes the prognosis from days to weeks** and is the most consequential thing on this list to miss",
            },
            {
              id: "thompson",
              name: "Thompson test",
              how: "Prone, feet over the end of the plinth, squeeze the calf.",
              finding: "**No plantarflexion = Achilles rupture.** Around 96% sensitive and 93% specific — and people still walk in on a ruptured tendon, because the long flexors can",
              also: [
                {
                  name: "with the Matles test",
                  how: "Still prone, flex both knees to 90° and look at where the feet rest.",
                  finding: "The ruptured side falls into **neutral or dorsiflexion** instead of resting plantarflexed. Two signs beat one, and a palpable gap makes three",
                },
              ],
            },
            {
              id: "achilles-load",
              name: "Achilles under load",
              how: "Palpate for the tender segment, then load it: heel raises, then hops if they are appropriate.",
              finding: "**Mid-portion tendinopathy sits 2–6 cm above the insertion**; insertional pain sits at the bone and dislikes the stretched position, which changes the exercise prescription",
            },
            {
              id: "resisted-eversion",
              name: "Resisted eversion",
              how: "Resist eversion from a slightly inverted position, then dorsiflex and evert against resistance while watching behind the malleolus.",
              finding: "Pain = peroneal tendinopathy. **A tendon that visibly jumps forward over the malleolus is a subluxation**, not a sprain",
            },
            {
              id: "resisted-inversion",
              name: "Resisted inversion in plantarflexion",
              how: "Resist inversion with the foot plantarflexed to isolate posterior tibialis from tibialis anterior.",
              finding: "Pain or weakness with the too-many-toes sign and a failed heel raise is the posterior tibialis triad",
            },
            {
              id: "tarsal-tunnel",
              name: "Tarsal tunnel screen",
              how: "Tinel behind the medial malleolus, then hold the ankle in dorsiflexion and eversion with the toes extended for 5–10 seconds.",
              finding: "Reproduced burning or paraesthesia in the sole. **Numbness is a nerve finding, not a fascia finding** — it separates this from plantar heel pain",
            },
            {
              id: "calcaneal-squeeze",
              name: "Calcaneal squeeze",
              how: "Compress the calcaneus medially and laterally, away from the plantar fascia insertion.",
              finding: "Pain here, with night pain or a load history that spiked, raises a **calcaneal stress fracture** — and rest pain is the flag, since fasciopathy eases with movement",
            },
            {
              id: "forefoot-squeeze",
              name: "Metatarsal squeeze and Mulder's click",
              how: "Compress the forefoot across the metatarsal heads, then add thumb pressure in the web space.",
              finding: "Diffuse pain suggests a **metatarsal stress fracture**; a click with radiating toe symptoms suggests a **Morton's neuroma** in the third web space",
            },
            {
              id: "proximal-screen",
              name: "Proximal screen before you treat",
              how: "Lumbar quadrant, hip range, and knee alignment on a single-leg task.",
              finding: "Burning in the sole with no local sign belongs to the lumbar spine, and a foot that pronates under a collapsing hip is not a foot problem",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "Four findings end this examination rather than continuing it.",
          body: "Pain out of proportion with pain on passive stretch (compartment syndrome) · an absent pulse or a cold, dusky foot · plantar midfoot ecchymosis with an inability to bear weight (Lisfranc) · and a unilateral hot, swollen, painful calf with risk factors (deep vein thrombosis). Each is a same-day referral, and none of them improves with a treatment you could give today.",
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
          text: "Range, the loaded dorsiflexion measure, the rule thresholds, and the values that turn an observation into a finding. Everything here should be producible without looking it up.",
        },
        {
          kind: "numbers",
          cells: [
            { value: "0–20°", label: "Talocrural dorsiflexion, non-weight-bearing" },
            { value: "0–50°", label: "Plantarflexion" },
            { value: "9–10 cm", label: "Weight-bearing lunge test, toe to wall" },
            { value: "35–40°", label: "The same test read as a tibial angle" },
            { value: "1.5 cm", label: "Side-to-side lunge difference that counts as a finding" },
            { value: "10°", label: "Dorsiflexion needed in terminal stance" },
            { value: "65°", label: "First MTP extension needed at toe-off" },
            { value: "0–70°", label: "First MTP extension range" },
            { value: "20–30°", label: "Subtalar inversion" },
            { value: "5–15°", label: "Subtalar eversion — the smaller range, lost first" },
            { value: "6 cm", label: "Ottawa palpation zone, distal posterior malleolus" },
            { value: "4 steps", label: "The weight-bearing criterion, both then and now" },
            { value: "98–100%", label: "Ottawa rule sensitivity for significant fracture" },
            { value: "2–6 cm", label: "Where mid-portion Achilles tendinopathy sits" },
            { value: "≈25", label: "Single-leg heel raises commonly quoted as normal under 40" },
            { value: "10 mm", label: "Navicular drop above which it is called excessive" },
          ],
        },
        {
          kind: "footnote",
          text: "Ranges follow standard goniometry references. The lunge test norm, the heel raise count and the navicular drop threshold are all population averages with wide spread — the side-to-side comparison is the measurement that survives that spread, which is why every one of them is written to be taken on both legs.",
        },
      ],
    },
    {
      id: "rules",
      navLabel: "Rules",
      title: "The rules that run ahead of the examination",
      blocks: [
        {
          kind: "lede",
          text: "The ankle is the region with a genuinely good decision rule, and the reason it exists is that a sprain and a fracture present the same way. The rules are sensitive and deliberately not specific: they are built to make a negative result safe, not to make a positive one meaningful.",
        },
        {
          kind: "table",
          columns: ["Rule", "What you palpate or ask", "Positive means", "What it is for"],
          widths: ["18%", "34%", "26%", "22%"],
          rows: [
            [
              { text: "Ottawa ankle rule", variant: "name" },
              "Bone tenderness at the posterior edge or tip of the **lateral** malleolus over its distal 6 cm, or the same on the **medial** malleolus; or inability to bear weight four steps both immediately and in the clinic",
              "Ankle radiograph",
              "Ruling fracture **out**",
            ],
            [
              { text: "Ottawa foot rule", variant: "name" },
              "Bone tenderness at the **base of the fifth metatarsal** or the **navicular**; or the same weight-bearing criterion",
              "Foot radiograph",
              "A separate decision from the ankle rule",
            ],
            [
              { text: "Palpate the whole fibula", variant: "name" },
              "Proximal fibular tenderness in someone with an ankle injury",
              "Maisonneuve fracture until imaged",
              "The fracture the ankle film misses",
            ],
            [
              { text: "Lisfranc screen", variant: "name" },
              "Plantar midfoot ecchymosis · midfoot pain on weight-bearing · tenderness at the first-to-second metatarsal base interval",
              "Weight-bearing imaging, urgently",
              "The injury most often called a sprain",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "ottawa-zones",
          title: "The two zones, and the four points that decide",
          caption:
            "**The rule is a map before it is a checklist.** The malleolar zone and the midfoot zone are separate decisions with separate films, and within each there are only two bony points plus the weight-bearing question. Palpating the soft tissue over a ligament does not count — the rule is about *bone* tenderness, which is the single most common way it gets applied wrongly.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "A sensitive rule is a rule you trust when it is negative.",
          body: "Ottawa specificity runs low — a substantial share of positives will have a normal film, and that is the design working as intended, not the rule failing. It exists to reduce unnecessary radiographs while making a missed fracture very unlikely, so the question it answers is *can I safely not image this?* rather than *is this broken?*",
        },
      ],
    },
    {
      id: "subjective",
      navLabel: "Subjective",
      title: "The history, and what each answer commits you to",
      blocks: [
        {
          kind: "lede",
          text: "Two questions carry most of the weight here: what the foot was doing at the moment of injury, and — if there was no moment — what changed about the load in the weeks before it started.",
        },
        {
          kind: "table",
          columns: ["What you ask", "The answer that matters", "What it points at", "What it obligates"],
          widths: ["22%", "30%", "24%", "24%"],
          rows: [
            { group: "If there was an injury" },
            [
              { text: "Which way did it go?", variant: "name" },
              "Inversion with the foot plantarflexed",
              "Lateral ligament complex, ATFL first",
              "Anterior drawer, then talar tilt",
            ],
            [
              { text: "Which way did it go?", variant: "name" },
              "**External rotation** or dorsiflexion with the foot planted",
              "Syndesmosis — a high ankle sprain",
              "Squeeze and external rotation tests, and a longer prognosis",
            ],
            [
              { text: "Which way did it go?", variant: "name" },
              "Eversion, or a fall onto a plantarflexed foot with midfoot pain",
              "Deltoid, fracture, or Lisfranc",
              "The decision rules before anything else",
            ],
            [
              { text: "Could you walk after?", variant: "name" },
              "No, and still can't take four steps",
              "One half of both Ottawa rules",
              "Imaging, regardless of how the ankle looks",
            ],
            [
              { text: "Did you feel a pop?", variant: "name" },
              "A pop or a kick to the back of the heel, then unable to push off",
              "Achilles rupture",
              "Thompson, Matles, and palpation for a gap",
            ],
            [
              { text: "Is this the first time?", variant: "name" },
              "Repeated sprains, or the ankle 'gives way'",
              "Chronic ankle instability — mechanical, functional, or both",
              "Balance testing, and a rehabilitation plan rather than a brace alone",
            ],
            { group: "If there was no injury" },
            [
              { text: "What changed?", variant: "name" },
              "A jump in distance, pace, hills, or footwear in the preceding weeks",
              "Tendon or bone overload",
              "Load history before tissue diagnosis",
            ],
            [
              { text: "When is it worst?", variant: "name" },
              "**The first steps in the morning**, easing as you move",
              "Plantar fasciopathy — the single most useful line in the history",
              "Windlass test and medial tubercle palpation",
            ],
            [
              { text: "When is it worst?", variant: "name" },
              "Pain **at rest and at night**, and worse as activity continues",
              "Bone stress, not tendon",
              "Calcaneal or metatarsal squeeze, and a load history",
            ],
            [
              { text: "Does it warm up?", variant: "name" },
              "Stiff and sore at the start, better once warm, sore again after",
              "Achilles tendinopathy",
              "Locating the tender segment, then loading it",
            ],
            [
              { text: "Any numbness?", variant: "name" },
              "Burning, tingling or numbness in the sole",
              "**Nerve** — tarsal tunnel, or the lumbar spine",
              "Tinel, dorsiflexion-eversion, and a lumbar screen",
            ],
            [
              { text: "Any systemic symptoms?", variant: "name" },
              "Hot, swollen, red joint with fever; or morning stiffness lasting over an hour in several joints",
              "Septic or inflammatory arthritis",
              "Referral, not rehabilitation",
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
          text: "Five zones. The foot is small enough that location is unusually informative here — a centimetre separates the plantar fascia from the calcaneus, and the joint line from the tendon that crosses it.",
        },
        {
          kind: "table",
          columns: ["Pain location", "Candidate source", "The test that addresses it", "The finding that confirms it"],
          rows: [
            { group: "Lateral" },
            [
              { text: "Anterolateral, below the fibular tip", variant: "name" },
              "ATFL sprain",
              "Anterior drawer in slight plantarflexion",
              "Increased translation with a soft end point, and a **sulcus dimple** over the sinus tarsi",
            ],
            [
              { text: "Lateral, below and behind the malleolus", variant: "name" },
              "CFL — a sprain that went past the first ligament",
              "Talar tilt in neutral to slight dorsiflexion",
              "Increased inversion tilt against the other side",
            ],
            [
              { text: "Behind the lateral malleolus, with a snap", variant: "name" },
              "Peroneal tendinopathy or subluxation",
              "Resisted eversion · dorsiflexion-eversion while watching the tendon",
              "Pain on resisted eversion, or a tendon that **visibly jumps** the malleolus",
            ],
            [
              { text: "Base of the fifth metatarsal", variant: "name" },
              "Avulsion or Jones fracture",
              "Palpation — this is an Ottawa foot rule point",
              "Point bone tenderness. **Where** on the bone decides the prognosis",
            ],
            { group: "Medial" },
            [
              { text: "Behind the medial malleolus, along the tendon", variant: "name" },
              "Posterior tibialis tendinopathy or dysfunction",
              "Single-leg heel raise · too-many-toes · resisted inversion in plantarflexion",
              "**No heel inversion on the rise**, or an inability to rise at all",
            ],
            [
              { text: "Medial, burning into the sole", variant: "name" },
              "Tarsal tunnel syndrome",
              "Tinel · dorsiflexion-eversion held 5–10 seconds",
              "Reproduced paraesthesia — a **nerve** distribution, not a tender spot",
            ],
            [
              { text: "Medial ligament after trauma", variant: "name" },
              "Deltoid injury, and what comes with it",
              "The decision rules first",
              "Isolated deltoid injury is uncommon — treat medial tenderness as a question about fracture and syndesmosis",
            ],
            { group: "Anterior and the syndesmosis" },
            [
              { text: "Above the joint line, between tibia and fibula", variant: "name" },
              "Syndesmotic (high ankle) sprain",
              "Squeeze at mid-calf · external rotation stress",
              "**Pain referred distally** on squeeze, or pain reproduced on external rotation",
            ],
            [
              { text: "Anterior joint line, at end-range dorsiflexion", variant: "name" },
              "Anterior ankle impingement",
              "Lunge test with the pain located",
              "A **hard, blocked** end feel with anterior pinching rather than a calf stretch",
            ],
            [
              { text: "Anterior, over the tendons, with a shoe history", variant: "name" },
              "Tibialis anterior or extensor tendinopathy",
              "Resisted dorsiflexion · lacing history",
              "Pain on resisted dorsiflexion, often under a tight lace line",
            ],
            { group: "Posterior and the heel" },
            [
              { text: "2–6 cm above the insertion", variant: "name" },
              "Mid-portion Achilles tendinopathy",
              "Palpation of the segment · heel raises · hopping",
              "A tender, sometimes thickened segment that **hurts more with load**, not less",
            ],
            [
              { text: "At the insertion into the calcaneus", variant: "name" },
              "Insertional Achilles tendinopathy",
              "The same, plus how it behaves in stretch",
              "Worse in the **stretched** position — which is why the exercise stops at neutral",
            ],
            [
              { text: "Sudden, with a felt pop", variant: "name" },
              "Achilles rupture",
              "Thompson · Matles · palpate for a gap",
              "No plantarflexion on calf squeeze. **A person who can walk may still have ruptured it**",
            ],
            [
              { text: "Plantar heel, worst on the first steps", variant: "name" },
              "Plantar fasciopathy",
              "Windlass test · medial calcaneal tubercle palpation",
              "First-step pain plus point tenderness. The windlass is specific but not sensitive",
            ],
            [
              { text: "Plantar heel, worse at rest and at night", variant: "name" },
              "Calcaneal stress fracture",
              "Calcaneal squeeze, away from the fascia",
              "Pain on medial-lateral compression with a load spike in the history",
            ],
            { group: "Forefoot" },
            [
              { text: "Diffuse across the metatarsals", variant: "name" },
              "Metatarsal stress fracture",
              "Metatarsal squeeze · point palpation of the shaft",
              "Focal bone tenderness after a training change, often with night pain",
            ],
            [
              { text: "Third web space, radiating into the toes", variant: "name" },
              "Morton's neuroma",
              "Mulder's click",
              "A palpable click with reproduced radiating symptoms",
            ],
            [
              { text: "First MTP joint, limited extension", variant: "name" },
              "Hallux rigidus or limitus",
              "First MTP extension range · windlass",
              "Under 65° blocks toe-off and pushes load laterally",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "ankle-pain-map",
          title: "Five zones, and what each one opens",
          caption:
            "**Location does more work here than at any other joint on this list.** The plantar fascia and the calcaneus are a centimetre apart and separated by which position hurts; the ATFL and the CFL are separated by a few degrees of ankle position on the test; and the syndesmosis sits above the joint line, which is why it is missed by an examination that starts at the malleoli.",
        },
      ],
    },
    {
      id: "alignment",
      navLabel: "Alignment",
      title: "Posture and gait → the test it obligates",
      blocks: [
        {
          kind: "lede",
          text: "A foot posture is not a diagnosis. It earns a test, and only the test earns a treatment. The useful question is never *is this foot flat* but *does this foot do its job under load*.",
        },
        {
          kind: "table",
          columns: ["What you see", "What it may mean", "The test that decides", "What changes if it is positive"],
          widths: ["24%", "24%", "26%", "26%"],
          rows: [
            [
              { text: "Low medial arch in standing", variant: "name" },
              "A pronated posture — common, and often asymptomatic",
              "Navicular drop; heel raise to see if the arch **can** rise",
              "A foot that restores its arch on a heel raise is mobile, not failing — train it rather than brace it",
            ],
            [
              { text: "Heel valgus with forefoot abduction", variant: "name" },
              "Posterior tibialis dysfunction",
              "Too-many-toes · single-leg heel raise",
              "A rigid, non-correcting deformity is a referral, not a strengthening programme",
            ],
            [
              { text: "High, rigid arch", variant: "name" },
              "A supinated, poorly shock-absorbing foot",
              "Subtalar eversion range · lateral column loading in gait",
              "Lateral ankle sprains and fifth metatarsal loading — cushioning and lateral stability",
            ],
            [
              { text: "Early heel rise in gait", variant: "name" },
              "A dorsiflexion restriction being compensated",
              "Weight-bearing lunge, knee straight then bent",
              "**The Silfverskiöld answer decides the treatment**: gastrocnemius, soleus, or joint",
            ],
            [
              { text: "Foot turned out through stance", variant: "name" },
              "An abducted progression angle — a way around a restriction",
              "Lunge test · hip rotation range",
              "Look above and below before you call it a foot habit",
            ],
            [
              { text: "Push-off over the lateral border", variant: "name" },
              "The first ray is not accepting load",
              "First MTP extension · windlass · first ray mobility",
              "Under 65° of extension, toe-off has to go somewhere else",
            ],
            [
              { text: "Knee falling in over the foot", variant: "name" },
              "The pronation is being driven from the hip",
              "Single-leg squat with the pelvis watched",
              "Treat the hip. The foot is the place it shows, not the place it starts",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "arch-windlass",
          title: "The windlass — the arch has a mechanism, not just a shape",
          caption:
            "**Extending the great toe winds the plantar fascia around the first metatarsal head and pulls the arch up.** That is what makes the foot rigid at push-off, and it explains three things at once: why a stiff first MTP forces load laterally, why the plantar fascia is loaded most at the moment the heel leaves the ground, and why the arch height you see standing still says so little about what the foot does when it matters.",
        },
      ],
    },
    {
      id: "rom",
      navLabel: "Range",
      title: "Range, end feel, and the one measurement that has to be loaded",
      blocks: [
        {
          kind: "lede",
          text: "Dorsiflexion is the range that matters here, and it is the one range on this page that is measured standing rather than on the plinth. Ten degrees is needed in terminal stance, and a foot that cannot produce it will find the motion somewhere else.",
        },
        {
          kind: "table",
          columns: ["Motion", "Normal", "How it is taken", "What a restriction means"],
          widths: ["22%", "14%", "34%", "30%"],
          rows: [
            [
              { text: "Dorsiflexion, non-weight-bearing", variant: "name" },
              { text: "0–20°", variant: "num" },
              "Subtalar neutral, fibula as the reference, knee extended then flexed",
              "The **difference between the two knee positions** is the finding, not the absolute value",
            ],
            [
              { text: "Dorsiflexion, weight-bearing", variant: "name" },
              { text: "9–10 cm", variant: "num" },
              "Toe-to-wall lunge, heel down, knee tracking over the second toe",
              "The measure that predicts function. **Over 1.5 cm of asymmetry is the finding**",
            ],
            [
              { text: "Plantarflexion", variant: "name" },
              { text: "0–50°", variant: "num" },
              "Passive, end feel noted",
              "A hard posterior block suggests os trigonum or posterior impingement",
            ],
            [
              { text: "Subtalar inversion", variant: "name" },
              { text: "20–30°", variant: "num" },
              "Calcaneus gripped, talus held",
              "Loss here is usually stiffness after immobilization",
            ],
            [
              { text: "Subtalar eversion", variant: "name" },
              { text: "5–15°", variant: "num" },
              "As above",
              "The smallest range and the first lost — and the one shock absorption needs",
            ],
            [
              { text: "First MTP extension", variant: "name" },
              { text: "0–70°", variant: "num" },
              "Passive, unloaded, then repeated loaded",
              "**Under about 65° blocks toe-off**; a loaded value much worse than the unloaded one is a functional hallux limitus",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "The Silfverskiöld comparison is the whole point of measuring dorsiflexion twice.",
          body: "Gastrocnemius crosses the knee; soleus does not. If dorsiflexion improves when the knee bends, the restriction is gastrocnemius and it responds to a knee-straight stretch and calf loading. If it does not change, you are looking at soleus or at the joint itself — and a joint restriction with a hard, anterior, blocked end feel is a talocrural mobilization question, not a stretching one.",
        },
        {
          kind: "figure",
          figureId: "lunge-test",
          title: "The lunge test — why this one is measured standing",
          caption:
            "**Dorsiflexion measured on a plinth and dorsiflexion measured under body weight are not the same number.** The lunge loads the joint the way walking does, uses the wall as a fixed reference so it repeats between sessions, and gives you a centimetre value anyone can reproduce. Take it on both sides every time: the norm has a wide spread, the asymmetry does not.",
        },
        {
          kind: "figure",
          figureId: "convex-ankle-glide",
          title: "The talus is convex — which decides the mobilization direction",
          caption:
            "**The talus is the moving convex surface in a concave mortise, so roll and glide oppose each other.** The body rolls anteriorly into dorsiflexion, so the joint surface must glide **posteriorly** — a posterior talar glide is the mobilization for a stiff dorsiflexion, and an anterior glide is the one for plantarflexion. The knee is the counter-example on the neighbouring page: there the moving surface is concave and the two travel together.",
        },
      ],
    },
    {
      id: "ligament",
      navLabel: "Ligament",
      title: "The ligament and syndesmosis batteries",
      blocks: [
        {
          kind: "lede",
          text: "Two tests cover the lateral complex and two cover the syndesmosis, and in both pairs the ankle's position is what makes the test mean anything. The syndesmotic pair is the one worth being slow about — it is the finding that changes the prognosis most and the one most often missed at the first visit.",
        },
        {
          kind: "table",
          columns: ["Test", "Position", "What it loads", "What a positive looks like", "Stats"],
          widths: ["18%", "16%", "24%", "28%", "14%"],
          rows: [
            { group: "Lateral complex" },
            [
              { text: "Anterior drawer", variant: "name" },
              { text: "10–20° PF", variant: "num" },
              "**ATFL** — the ligament that is vertical, and therefore loaded, in plantarflexion",
              "Increased anterior translation with a soft end point; a dimple over the sinus tarsi",
              { text: "Sn ≈ 80 after 5 days", variant: "num" },
            ],
            [
              { text: "Talar tilt", variant: "name" },
              { text: "Neutral → DF", variant: "num" },
              "**CFL** — vertical in dorsiflexion, which is the mirror of the drawer",
              "Increased inversion tilt compared with the other ankle",
              { text: "Sn moderate", variant: "num" },
            ],
            [
              { text: "Both, delayed", variant: "name" },
              { text: "4–5 days", variant: "num" },
              "The same structures, but without guarding and swelling",
              "**Accuracy improves markedly after the acute phase** — a negative test on day one means very little",
              { text: "The timing matters", variant: "num" },
            ],
            { group: "Syndesmosis" },
            [
              { text: "Squeeze test", variant: "name" },
              { text: "Mid-calf", variant: "num" },
              "The interosseous membrane and the distal tibiofibular joint",
              "**Pain referred distally** to the syndesmosis. Pain under your hands is a calf finding",
              { text: "Sp high, Sn low", variant: "num" },
            ],
            [
              { text: "External rotation stress", variant: "name" },
              { text: "Knee 90°, ankle neutral", variant: "num" },
              "The same, loaded in the direction that injures it",
              "Pain at the anterolateral syndesmosis, not in the lateral ligaments",
              { text: "The more useful of the two", variant: "num" },
            ],
            [
              { text: "What it changes", variant: "name" },
              { text: "Weeks, not days", variant: "num" },
              "Nothing — this row is the prognosis",
              "**A syndesmotic sprain takes roughly twice as long or more to return** than a lateral sprain of the same apparent severity, and may need imaging for stability",
              { text: "Why it matters", variant: "num" },
            ],
            { group: "Medial" },
            [
              { text: "Eversion / deltoid stress", variant: "name" },
              { text: "Neutral", variant: "num" },
              "Deltoid ligament",
              "Medial gapping — but isolated deltoid injury is uncommon, so a positive raises fracture and syndesmosis first",
              { text: "Interpret with care", variant: "num" },
            ],
          ],
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
              abbr: "Delay",
              term: "The acute exception.",
              body: "At this joint the published figures assume the swelling and guarding have settled. Ligament testing within the first days is far less accurate than the numbers suggest, which is why a delayed re-examination is part of the plan rather than a fallback.",
            },
          ],
          note: "Figures for ankle ligament tests vary widely between studies and depend heavily on when after the injury the test is done. Treat them as orders of magnitude.",
        },
        {
          kind: "figure",
          figureId: "atfl-position",
          title: "Why each ligament test has its own ankle position",
          caption:
            "**The ATFL runs forward from the fibula and the CFL runs downward, so the position that puts one in line with the test takes the other out of it.** Plantarflexion brings the ATFL vertical, which is why the drawer is done there; dorsiflexion does the same for the CFL, which is why the tilt is not. Testing both at the same ankle position is the most common way to get two negatives from an unstable ankle.",
        },
      ],
    },
    {
      id: "tendon",
      navLabel: "Tendons",
      title: "The tendons, and the difference between overloaded and torn",
      blocks: [
        {
          kind: "lede",
          text: "Most of what walks into a clinic with ankle pain and no injury is a tendon that was asked to do more than it had been prepared for. The examination has two jobs: find which tendon, and rule out the one presentation that is a rupture rather than a tendinopathy.",
        },
        {
          kind: "table",
          columns: ["Tendon", "The history", "The test", "What confirms it", "What it changes"],
          widths: ["18%", "22%", "22%", "24%", "14%"],
          rows: [
            [
              { text: "Achilles, mid-portion", variant: "name" },
              "Stiff in the morning, warms up, sore after",
              "Palpate 2–6 cm above the insertion, then load: heel raises, then hops",
              "A tender, sometimes thickened segment that hurts **more** as load increases",
              "Progressive loading",
            ],
            [
              { text: "Achilles, insertional", variant: "name" },
              "The same, but the pain is at the bone",
              "Palpation at the insertion; note how it behaves in the stretched position",
              "Worse in **dorsiflexion under load** — the compressed position",
              "**Load stops at neutral**",
            ],
            [
              { text: "Achilles, ruptured", variant: "name" },
              "A pop, a felt kick, then no push-off",
              "Thompson · Matles · palpate for a gap",
              "No plantarflexion on calf squeeze. Sn ≈ 96, Sp ≈ 93",
              "Surgical opinion, today",
            ],
            [
              { text: "Posterior tibialis", variant: "name" },
              "Medial ache, arch flattening, worse standing",
              "Single-leg heel raise · too-many-toes · resisted inversion in plantarflexion",
              "**The heel fails to invert as it rises**, or cannot rise at all",
              "Stage decides everything",
            ],
            [
              { text: "Peroneals", variant: "name" },
              "Lateral pain, often after repeated sprains, sometimes a snap",
              "Resisted eversion · dorsiflexion-eversion while watching the tendon",
              "Pain on resisted eversion; a tendon that visibly subluxes is a different problem",
              "Instability work, or referral",
            ],
            [
              { text: "Tibialis anterior", variant: "name" },
              "Anterior pain, downhill running or tight laces",
              "Resisted dorsiflexion",
              "Pain on resisted dorsiflexion, often under the lace line",
              "Load and footwear",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "A patient who can walk can still have a ruptured Achilles.",
          body: "The long toe flexors and tibialis posterior will plantarflex the foot well enough to walk on a flat floor, so weight-bearing does not rule it out — and single-sign examination is how ruptures get missed at the first visit. Use three: the Thompson squeeze, the Matles prone knee flexion, and palpation for a gap. Any one of them positive is enough to send.",
        },
        {
          kind: "figure",
          figureId: "achilles-zones",
          title: "Mid-portion and insertional are two different prescriptions",
          caption:
            "**The same tendon, and the same diagnosis word, but the exercise is not the same.** Mid-portion pain sits 2–6 cm above the bone and tolerates full-range loading. Insertional pain sits at the calcaneus, where dorsiflexion compresses the tendon against the bone — so the loading is kept to neutral and the stretch that seems obviously helpful is the thing making it worse.",
        },
        {
          kind: "table",
          columns: ["Posterior tibialis stage", "What you find", "What the foot does", "What it means"],
          widths: ["18%", "30%", "26%", "26%"],
          rows: [
            [
              { text: "Stage I", variant: "name" },
              "Medial pain and swelling along the tendon; heel raise possible but painful",
              "Alignment still normal",
              "The stage where loading works",
            ],
            [
              { text: "Stage II", variant: "name" },
              "Single-leg heel raise weak or absent; too-many-toes present",
              "Flexible flatfoot — the deformity **corrects** passively",
              "Orthoses and loading, with a real prognosis",
            ],
            [
              { text: "Stage III", variant: "name" },
              "Heel raise not possible",
              "**Rigid** hindfoot — the deformity does not correct",
              "Surgical opinion",
            ],
            [
              { text: "Stage IV", variant: "name" },
              "As above, plus deltoid failure",
              "The talus tilts in the mortise",
              "Ankle joint involvement — referral",
            ],
          ],
        },
        {
          kind: "footnote",
          text: "The correction test between stage II and stage III is the one that changes what you can offer: hold the calcaneus and see whether the hindfoot comes back to neutral. A flexible deformity is a rehabilitation problem; a rigid one is not.",
        },
      ],
    },
    {
      id: "heel",
      navLabel: "Heel",
      title: "Plantar heel pain, sorted",
      blocks: [
        {
          kind: "lede",
          text: "Plantar heel pain is common enough that it gets diagnosed from the words alone, and three of its differentials behave very differently under load. The sorting question is simple: does it hurt most on the first steps, most under sustained load, or does it burn?",
        },
        {
          kind: "table",
          columns: ["Presentation", "Most likely", "What separates it", "The test"],
          widths: ["24%", "22%", "30%", "24%"],
          rows: [
            [
              { text: "Worst on the first steps in the morning, eases as you move", variant: "name" },
              "Plantar fasciopathy",
              "**It eases with movement** and returns after rest — the pattern is as diagnostic as the palpation",
              "Windlass test · medial calcaneal tubercle palpation",
            ],
            [
              { text: "Worse the longer you are on it, and sore at rest and at night", variant: "name" },
              "Calcaneal stress fracture",
              "Rest pain is the flag. Fasciopathy is better with movement; bone stress is worse",
              "Calcaneal squeeze, away from the fascia insertion",
            ],
            [
              { text: "Burning, tingling, or numbness in the sole", variant: "name" },
              "Tarsal tunnel, or a lumbar source",
              "**Numbness is never a fascia finding** — a sensory symptom moves the problem to a nerve",
              "Tinel · dorsiflexion-eversion held 5–10 s · lumbar screen",
            ],
            [
              { text: "Diffuse, deep, in an older or heavier patient", variant: "name" },
              "Heel fat pad atrophy or contusion",
              "Tender in the **centre** of the heel rather than at the medial tubercle, and worse barefoot on hard floors",
              "Central palpation, and what footwear changes",
            ],
            [
              { text: "Posterior heel in an active adolescent", variant: "name" },
              "Calcaneal apophysitis (Sever's)",
              "Skeletally immature, pain at the growth plate rather than the plantar surface",
              "Medial-lateral calcaneal compression, and a growth and load history",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "The windlass test is worth doing and worth interpreting carefully.",
          body: "Extending the great toe with the foot loaded tensions the plantar fascia and reproduces the pain when it is positive. It is a specific test — a positive is informative — but it is not sensitive, so a negative windlass does not clear the fascia. Combine it with the first-step history and point tenderness at the medial calcaneal tubercle, and treat the three together rather than any one alone.",
        },
      ],
    },
    {
      id: "treatment",
      navLabel: "Treatment",
      title: "The finding → what it points to",
      blocks: [
        {
          kind: "lede",
          text: "Each row starts from something you found, not from a diagnosis label. The dose comes from irritability, the same way it does at every other joint; the direction comes from the surface that moves.",
        },
        {
          kind: "table",
          columns: ["What you found", "What it points to", "How it is dosed", "How you know it worked"],
          widths: ["24%", "28%", "24%", "24%"],
          rows: [
            { group: "Restriction" },
            [
              { text: "Lunge limited, hard anterior end feel", variant: "name" },
              "**Posterior talar glide** — the talus is convex, so the glide opposes the roll",
              "Grade III–IV at end range, sustained or oscillatory, then loaded immediately",
              "Re-measure the lunge in centimetres before and after, same session",
            ],
            [
              { text: "Lunge limited, improves with the knee bent", variant: "name" },
              "Gastrocnemius length and calf loading",
              "Knee-straight stretch plus progressive heel raises through range",
              "The knee-straight and knee-bent measures converge",
            ],
            [
              { text: "Lunge limited, no change with the knee bent", variant: "name" },
              "Soleus, or the joint itself — the end feel decides which",
              "Knee-bent loading, or mobilization if the end feel is hard and blocked",
              "The same re-measure, and where the pain is felt at end range",
            ],
            [
              { text: "Subtalar eversion restricted", variant: "name" },
              "Subtalar mobilization and rearfoot control work",
              "Grade III at the restriction, then a loaded task",
              "Eversion range, and whether the arch can lower under load",
            ],
            [
              { text: "First MTP extension under 65°", variant: "name" },
              "First MTP mobilization and windlass loading",
              "Distraction with dorsal glide, then loaded toe extension",
              "Where push-off happens in gait, not just the degrees",
            ],
            { group: "Instability" },
            [
              { text: "Positive drawer, repeated sprains", variant: "name" },
              "Balance and peroneal work — the evidence here is for **rehabilitation**, not for bracing alone",
              "Progressive single-leg balance, perturbation, then sport-specific landing",
              "Single-leg balance time and anterior reach symmetry",
            ],
            [
              { text: "Positive syndesmotic tests", variant: "name" },
              "Protection first, a longer timeline, and imaging if it is unstable",
              "Restricted external rotation and dorsiflexion loading early on",
              "The external rotation test, and pain-free push-off",
            ],
            { group: "Tendon" },
            [
              { text: "Mid-portion Achilles pain on loading", variant: "name" },
              "Progressive tendon loading through full range",
              "Isometrics if highly irritable, then heavy slow resistance as it settles",
              "Pain during and the morning after — the 24-hour response is the guide",
            ],
            [
              { text: "Insertional Achilles pain", variant: "name" },
              "The same loading, but **kept out of dorsiflexion**",
              "Range stops at neutral; no stretching into compression",
              "As above, plus what the stretched position does",
            ],
            [
              { text: "Failed single-leg heel raise, correctable hindfoot", variant: "name" },
              "Posterior tibialis loading plus a medially posted orthosis",
              "Heel raises in the corrected position, progressing to single leg",
              "Heel inversion on the rise, and repetitions to fatigue",
            ],
            { group: "Load" },
            [
              { text: "First-step pain, positive windlass", variant: "name" },
              "Plantar fascia loading and a footwear conversation",
              "High-load resistance with the toes extended, plus load management",
              "First-step pain over weeks, not within a session",
            ],
            [
              { text: "Bone tenderness with a load spike and night pain", variant: "name" },
              "**Relative rest and imaging, not loading**",
              "This row is the exception on the page — the tissue needs less, not more",
              "It does not get tested back into pain to find out",
            ],
            [
              { text: "Foot pronating under a collapsing knee", variant: "name" },
              "The hip — abductors and external rotators",
              "Loaded single-leg work, with the foot as the place you observe",
              "The single-leg squat, retested with the same setup",
            ],
          ],
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
                "Grade I–II joint mobilizations, short bouts, in the open packed position",
                "Isometric loading only — calf isometrics, toe flexion holds",
                "Protect and offload: taping, footwear, and a temporary change to the aggravating task",
                "Pain-free range work; the end range can wait",
                "Reassess with the lunge and with the 24-hour response, not with how it felt during",
              ],
            },
            {
              tone: "m",
              title: "Moderate irritability",
              badge: "Gr II–III",
              subtitle: "Symptoms arrive at the end feel",
              points: [
                "Grade II–III mobilization into the restriction, then load it in the same session",
                "Heavy slow resistance for the tendon, within a tolerable pain range",
                "Balance and perturbation work for the unstable ankle",
                "Progress by range first, then by load, and change one at a time",
                "Reassess in centimetres and repetitions so the change is a number",
              ],
            },
            {
              tone: "l",
              title: "Low irritability",
              badge: "Gr III–IV",
              subtitle: "You reach the end feel before the symptoms",
              points: [
                "Grade III–IV at end range for a genuine capsular restriction",
                "Full-range and speed work: hopping, landing, direction change",
                "Return-to-sport criteria rather than a calendar: heel raise count, hop symmetry, reach symmetry",
                "Reload the specific task that failed, at the speed it failed",
                "Discharge on symmetry, not on the absence of pain at rest",
              ],
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Ankle position is the dosing decision people forget.",
          body: "The talocrural open packed position is roughly 10° of plantarflexion, midway between inversion and eversion — that is where a high-irritability ankle is mobilized and where an early range programme lives. Close packed is full dorsiflexion, which is why an acutely irritable ankle hates the lunge and why the lunge is nonetheless the measure you come back to once it settles.",
        },
      ],
    },
    {
      id: "drill",
      navLabel: "Drill",
      title: "Answer before you open",
      note: "answers are hidden until you open them",
      blocks: [
        {
          kind: "lede",
          text: "Three cases first — read the scenario, decide the whole answer, then open it. Then the single facts.",
        },
        {
          kind: "cases",
          items: [
            {
              scenario:
                "A 24-year-old rolled their ankle inward playing five-a-side two days ago. They limped off but walked in today. Swelling and bruising are lateral, they are tender over the anterior tip of the fibula, and the anterior drawer feels a little loose but they are guarding. They can take four steps, slowly.",
              lines: [
                {
                  label: "The rules first.",
                  body: "Palpate the posterior edge and tip of both malleoli over the distal 6 cm, the base of the fifth metatarsal and the navicular. They can bear weight for four steps, so if there is no bone tenderness at those points the Ottawa rules do not require imaging. Then run a thumb up the whole fibula to the head.",
                },
                {
                  label: "The diagnosis.",
                  body: "A lateral ligament sprain, ATFL first. Tenderness confined to the anterior tip with no CFL tenderness suggests it did not go past the first ligament.",
                },
                {
                  label: "What you do not conclude today.",
                  body: "Nothing about the degree of laxity. Ligament testing at 48 hours is unreliable with swelling and guarding — re-examine at four or five days, and say so rather than recording a grade you cannot support.",
                },
                {
                  label: "The test not to skip.",
                  body: "The syndesmotic pair. Squeeze at mid-calf and external rotation stress: if either is positive the prognosis roughly doubles, and that changes what you tell them today.",
                },
                {
                  label: "First treatment.",
                  body: "Protected weight-bearing as tolerated, early range in the open packed position, and start balance work as soon as it is tolerated — the recurrence rate is what you are treating, and rehabilitation beats a brace alone for that.",
                },
              ],
            },
            {
              scenario:
                "A 46-year-old runner has had pain at the back of the heel for three months. It is stiff and sore for the first ten minutes of a run, better in the middle, and sore that evening and the next morning. They increased from 20 to 35 km a week in April. The tender point is right at the bone, and it hurts most when they drop the heel off a step.",
              lines: [
                {
                  label: "The tissue.",
                  body: "Achilles tendinopathy — the warm-up-and-worsen-after pattern and the load history are the diagnosis; the imaging would not change it.",
                },
                {
                  label: "The distinction that matters.",
                  body: "This is insertional, not mid-portion: the tenderness is at the calcaneus rather than 2–6 cm above it, and it is worst in the dorsiflexed position where the tendon is compressed against the bone.",
                },
                {
                  label: "What changes because of that.",
                  body: "The loading stops at neutral. Heel drops off a step and calf stretching push the tendon into exactly the compressed position that provokes it, so the obvious exercise is the wrong one here.",
                },
                {
                  label: "The dose.",
                  body: "Isometric calf holds if it is irritable, progressing to heavy slow resistance within the neutral-to-plantarflexed range, judged on the 24-hour response rather than pain during.",
                },
                {
                  label: "The load conversation.",
                  body: "A 75% jump in weekly volume is the cause. The programme fails without a graded return, whatever the exercise selection.",
                },
              ],
            },
            {
              scenario:
                "A 58-year-old has had medial ankle ache for six months and says their arch has dropped. Standing behind them you see more toes on that side. They cannot perform a single-leg heel raise on the painful side, and on the good side the heel inverts normally as it rises. When you hold the calcaneus, the hindfoot corrects passively to neutral.",
              lines: [
                {
                  label: "The diagnosis.",
                  body: "Posterior tibialis tendon dysfunction. The too-many-toes sign, the failed heel raise and the medial pain along the tendon course are the triad.",
                },
                {
                  label: "The staging.",
                  body: "The deformity corrects passively, so this is stage II rather than stage III — the single most important thing you established in this examination.",
                },
                {
                  label: "Why that matters.",
                  body: "A flexible deformity is a rehabilitation problem with a real prognosis. A rigid one is a surgical opinion, and no amount of loading will restore the alignment.",
                },
                {
                  label: "Treatment.",
                  body: "Posterior tibialis loading in the corrected position — heel raises with the hindfoot supported, progressing to single leg — plus a medially posted orthosis to hold the correction while the tendon is loaded.",
                },
                {
                  label: "Reassessment.",
                  body: "Whether the heel inverts on the rise, and repetitions to fatigue against the other side. Not the arch height in standing, which changes last if it changes at all.",
                },
              ],
            },
          ],
        },
        {
          kind: "heading",
          text: "Single facts",
        },
        {
          kind: "drill",
          items: [
            {
              question: "State both Ottawa rules, and say what each one gets you.",
              answer:
                "Ankle rule: bone tenderness at the posterior edge or tip of either malleolus over its distal 6 cm, or inability to bear weight for four steps both at the time and in the clinic → ankle radiograph. Foot rule: bone tenderness at the base of the fifth metatarsal or the navicular, or the same weight-bearing criterion → foot radiograph. They are separate decisions and a normal ankle film does not clear the midfoot. Sensitivity is around 98–100%, specificity is deliberately low.",
            },
            {
              question: "Why is the anterior drawer done in plantarflexion and the talar tilt in dorsiflexion?",
              answer:
                "Because the two ligaments run in different directions. The ATFL runs forward from the fibula to the talar neck and becomes vertical — and therefore loaded — in plantarflexion. The CFL runs downward and backward to the calcaneus and becomes vertical in dorsiflexion. Testing both at the same ankle position takes one of them out of the line of test, which is how an unstable ankle produces two negatives.",
            },
            {
              question: "A squeeze test at mid-calf hurts where your hands are. Is that positive?",
              answer:
                "No. The test is positive only if compressing the tibia and fibula together at mid-calf refers pain distally to the syndesmosis. Pain under your hands is a calf finding — a muscle strain or a contusion — and calling it positive turns a lateral sprain into a high ankle sprain on the notes.",
            },
            {
              question: "Dorsiflexion is limited. It improves when you bend the knee. What does that tell you and what does it change?",
              answer:
                "The restriction is gastrocnemius, because gastrocnemius crosses the knee and soleus does not. It changes the treatment to knee-straight stretching and calf loading. If bending the knee had made no difference, the restriction would be soleus or the joint itself, and a hard blocked anterior end feel would point to a posterior talar glide rather than a stretch.",
            },
            {
              question: "Which way do you glide the talus to gain dorsiflexion, and why?",
              answer:
                "Posteriorly. The talus is the convex moving surface in the concave mortise, so roll and glide oppose each other: the bone rolls anteriorly into dorsiflexion while the joint surface must glide posteriorly. This is the opposite of the knee, where the moving tibial plateau is concave and the glide travels with the shaft.",
            },
            {
              question: "A patient walked into the clinic. Does that rule out an Achilles rupture?",
              answer:
                "No. The long toe flexors and tibialis posterior can plantarflex the foot well enough to walk on a flat floor. Use three signs — the Thompson calf squeeze, the Matles prone knee flexion test, and palpation for a gap — and send on any one of them.",
            },
            {
              question: "What separates mid-portion from insertional Achilles tendinopathy, and why does it matter?",
              answer:
                "Location: mid-portion sits 2–6 cm above the insertion, insertional sits at the calcaneus. It matters because dorsiflexion compresses the insertional tendon against the bone, so the loading is kept to neutral and heel drops off a step are avoided — the exercise that helps one makes the other worse.",
            },
            {
              question: "Someone has plantar heel pain that is worse at rest and at night. What are you thinking?",
              answer:
                "Bone, not fascia. Plantar fasciopathy is worst on the first steps and eases with movement; pain that is present at rest and worse at night, especially with a recent load spike, raises a calcaneal stress fracture. Squeeze the calcaneus medially and laterally away from the fascia insertion, and consider imaging rather than loading.",
            },
            {
              question: "What does numbness in the sole tell you?",
              answer:
                "That the problem is not the plantar fascia. A sensory symptom is a nerve finding — tarsal tunnel locally, or a lumbar source proximally. Test with a Tinel behind the medial malleolus and a dorsiflexion-eversion hold, and screen the lumbar spine before treating the foot.",
            },
            {
              question: "Why is the weight-bearing lunge test preferred to measuring dorsiflexion on the plinth?",
              answer:
                "Because it loads the joint the way walking does, uses the wall as a fixed reference so it repeats between sessions, and gives a centimetre value anyone can reproduce. About 9–10 cm, or 35–40°, is the usual norm, but the norm has wide spread — a side-to-side difference over about 1.5 cm is the finding.",
            },
            {
              question: "The single-leg heel raise fails and there are too many toes visible. What is the next thing you test?",
              answer:
                "Whether the hindfoot corrects. Hold the calcaneus and see if it comes back to neutral. A flexible deformity is stage II posterior tibialis dysfunction and a rehabilitation problem; a rigid one is stage III and a surgical opinion. That single test decides what you can offer.",
            },
            {
              question: "Which four findings end an ankle examination rather than continuing it?",
              answer:
                "Pain out of proportion with pain on passive stretch (compartment syndrome); an absent pulse or a cold, dusky foot; plantar midfoot ecchymosis with an inability to bear weight (Lisfranc); and a unilateral hot, swollen, tender calf with risk factors (deep vein thrombosis). Each is a same-day referral.",
            },
          ],
        },
      ],
    },
  ],
  footer:
    "**About this guide.** Like the knee playbook, this one is not compiled from supplied course material — there was none for the ankle. Everything here is standard musculoskeletal curriculum and textbook content: the Ottawa ankle and foot rules are as originally published, normative ranges follow standard goniometry references, and the ligament, syndesmotic, tendon and heel examinations are the conventional ones.\n**Treat the test statistics as orders of magnitude.** Published accuracy for ankle ligament tests depends heavily on how long after the injury the test is done — figures from a settled ankle do not apply on day one, which is why delayed re-examination is written into the plan rather than offered as a fallback.\n**Two things are stated as ranges because the sources genuinely differ:** the weight-bearing lunge norm and the single-leg heel raise count both have wide population spread, and in both cases the side-to-side comparison is the measurement that survives it.\n**Check it against your own course material before you rely on it** — where your program's numbers differ from these, your program's are the ones you will be examined on.",
};
