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
    { value: "30", label: "exam items" },
    { value: "5", label: "movement syndromes" },
    { value: "3", label: "irritability levels" },
    { value: "1", label: "goniometer required" },
  ],
  sections: [
    {
      id: "checklist",
      navLabel: "30 Items",
      title: "The examination sequence",
      note: "check-off saves in this browser",
      blocks: [
        {
          kind: "lede",
          text: "Thirty items, in the order they're performed. Two screens run ahead of everything else — the symptoms that do not belong to a shoulder at all, and the neck, which is this region's most common mimic — then posture and AROM, then PROM and length, then strength, then special tests, then treatment. The last column is the finding itself: the number or observation that turns the test into information.",
        },
        {
          kind: "checklist",
          items: [
            {
              id: "red-flags",
              name: "Red flag screen, before you examine",
              how: "Ask about the symptoms that do not belong to a shoulder: chest pain or pressure, breathlessness, symptoms that arrive with exertion and settle with rest, unexplained weight loss, night pain unrelated to position, fever, and a history of cancer. Note any trauma, a first-time dislocation, and a smoking history.",
              finding: "**A shoulder that hurts with no movement that provokes it is the one to escalate.** Left shoulder or jaw pain on exertion is cardiac until cleared · right shoulder-tip pain with abdominal symptoms is diaphragmatic · constant night pain with weight loss or a smoking history raises an apical lung lesion · a hot, swollen joint with fever is septic. None of these improves with anything else on this page",
            },
            {
              id: "cervical-screen",
              name: "Clear the cervical spine",
              how: "Active cervical range in every plane, with overpressure if it is symptom-free, then Spurling's, then the C4–T1 myotomes, dermatomes and reflexes. Add an upper limb neurodynamic test if the symptoms are described as burning, tingling or numb.",
              finding: "**Reproducing the shoulder symptoms from the neck moves the problem to the neck.** Symptoms below the elbow, any sensory or reflex change, or symptoms that vary with neck position are cervical findings — everything that follows is then a comparison rather than the diagnosis",
            },
            {
              id: "flexion-arom",
              name: "Shoulder flexion AROM, and the four critical events",
              how: "Stand behind the patient or in the quadrant, where the scapula and the thorax are both in view, and watch the arm go up. Call the four events out loud as they happen: humeral head depression, glenohumeral external rotation, scapular upward rotation, and scapular posterior tilt with thoracic extension.",
              finding: "**All four events, and symmetrical with the other side.** A missing event names the fault — no head depression is a cuff problem, no upward rotation is a serratus and lower trapezius problem, no posterior tilt is a pec minor and thoracic problem",
            },
            {
              id: "scapular-assist",
              name: "Scapular assist test",
              how: "Repeat the painful active elevation while you manually add upward rotation, adduction and posterior tilt to the scapula.",
              finding: "**A change in the *quantity*, the *quality*, or the *symptoms* is positive** — and a positive hands you the first exercise, because the correction you just applied is the one to train",
            },
            {
              id: "arom-er-90",
              name: "Active external rotation at 90° of abduction",
              how: "Abduct to 90° with the elbow at 90° and take the arm into external rotation, watching *where the range comes from*: scapular posterior tilt, thoracic extension and rotation, scapular retraction, or humeral head anterior translation.",
              finding:
                "**Normal** is about 90° of external rotation, equal to the other side, with the head staying centred and the scapula tilting posteriorly.\n**Faulty** is the head translating anteriorly — the distal humerus drops back — or the scapula retracting and tilting anteriorly to supply the range.\n**In throwers**, add internal rotation to get the total arc: an arc loss over 5°, or an internal rotation loss of 10–25° against the other side, is GIRD, and it obligates a proximal screen — single-leg stance, hip internal and external rotation, core, gluteus medius",
            },
            {
              // One checkable item covering both manoeuvres, as the source has it — a single
              // checkbox spanning two rows — rather than two items.
              id: "hbh-hbb",
              name: "Hand behind head\n*flexion + ER*",
              how: "Stand behind the patient with your palm at the back of their head. Measure the middle finger against the spinous process it reaches, on both sides, then add overpressure at end range.",
              finding:
                "**Symmetrical side to side.** Positive is clearly less reach, or symptoms with the overpressure — either one obligates a follow-up of flexion and external rotation range",
              also: [
                {
                  name: "Hand behind back\n*IR + extension + adduction*",
                  how: "The hand climbs from the lumbar spine as high up the back as it will reach. For overpressure, one hand takes the scapula and the other the forearm, with your body driving the elbow in.",
                  finding:
                    "**Compare the level reached.** Positive is clearly less reach, or symptoms with the overpressure — follow up with extension and internal rotation range, the back-pocket motion",
                },
              ],
            },
            {
              id: "prom-flexion",
              name: "PROM flexion — total, then pure glenohumeral",
              how: "Supine. Take total flexion with the scapula free, then repeat it with the scapula fixated for the pure glenohumeral figure. Goniometer: axis at the greater tuberosity, stationary arm along the midline of the trunk, moving arm to the lateral epicondyle.",
              finding: "**Pure glenohumeral flexion under 120° is limited.** The end feel then names the tissue: capsular is the inferior capsule, muscular is teres major",
            },
            {
              id: "scapular-ur",
              name: "Scapular upward rotation PROM, and the treatment it becomes",
              how: "Sidelying. The cranial hand takes the coracoid with the thumb and the posterior scapula with the fingers, blocking superior migration and anterior tilt; the caudal hand catches the inferior angle and drives upward rotation.",
              finding: "**About 60° of upward rotation.** The hold that measures it is the hold that mobilizes it — assess and treat without changing position",
            },
            {
              id: "prom-rotation",
              name: "PROM internal and external rotation",
              how: "External rotation with your forearm blocking the anterior shoulder. Internal rotation at 90° of abduction — 45° if they cannot reach it — with the scapula stabilized against anterior tilt, watching for scapular compensation.",
              finding: "**A total arc of 165–180°.** GIRD is an arc loss over 5°, or an internal rotation loss of 10–25° against the other side",
            },
            {
              id: "horizontal-adduction",
              name: "Horizontal adduction, for the posterior capsule",
              how: "Supine at 90/90. Stabilize the scapula so it does not pass the mid-axillary line, take the arm to its end feel, and measure with a goniometer.",
              finding: "**The elbow should at least reach the midline.** Less than that is a tight posterior capsule — the restriction that drives the head anteriorly and superiorly as the arm elevates",
            },
            {
              id: "pec-length",
              name: "Muscle length: pec minor and pec major",
              how: "Pec minor: supine, measure from the posterior acromion to the table. Pec major sternal head: 120° of abduction with full external rotation. Clavicular head: 90° of abduction.",
              finding: "**Pec minor within 2.54 cm (1 inch) of the table.** The sternal head should let the arm touch the table; the clavicular head should let it come even with it",
            },
            {
              id: "static-resisted",
              name: "Static resisted internal rotation, external rotation and abduction",
              how: "Seated, arm at the side, with you stabilizing the distal humerus. Abduction is tested at 15°.",
              finding: "**Positive is reduced resistance from pain, from weakness, or from both** — which is what separates a contractile problem from the passive restriction the PROM measured",
            },
            {
              id: "mmt-supra-infra",
              name: "MMT supraspinatus and infraspinatus",
              how: "Supraspinatus at 90° of elevation in the scapular plane. Infraspinatus at 0° of scaption with 45° of internal rotation, pushing into internal rotation.",
              finding: "Testing supraspinatus in internal rotation produces more EMG activity but is more irritating; external rotation gives less of both. **Choose by irritability, and record which position you used** — the grades are not comparable across the two",
            },
            {
              id: "mmt-subscap",
              name: "Prone MMT subscapularis",
              how: "Prone, hand behind the back and lifted off the spine with the palm facing posteriorly; apply force into the palm, toward the spine.",
              finding: "Watch the activation pattern and the scapular compensation rather than the raw grade. **This one is irritating** — it goes late in the sequence, or not at all in an angry shoulder",
            },
            {
              id: "mmt-traps",
              name: "MMT lower and middle trapezius",
              how: "For both, hold the retraction and watch for excessive anterior translation of the humeral head; the lower trapezius adds posterior tilt to the retraction.",
              finding: "**Lower trapezius is retraction plus upward rotation plus posterior tilt plus thoracic extension** — four jobs at once, which is why it appears in almost every faulty elevation on this page",
            },
            {
              id: "lat-length",
              name: "Muscle length: latissimus dorsi",
              how: "Take end-range total glenohumeral flexion and watch the trunk rather than the arm.",
              finding: "**Positive is a muscular end feel with the rib cage flaring or the lumbar spine extending** — the lat borrowing its range from the spine",
            },
            {
              id: "mmt-serratus",
              name: "MMT serratus anterior",
              how: "Sitting at about 130° of flexion, leading with the thumb, pressing forward to encourage upward rotation and abduction.",
              finding: "Apply 75% of the force into shoulder extension and 25% into downward rotation at the inferior angle. **The test ends when the scapula downwardly rotates**",
            },
            {
              id: "sps-cluster",
              name: "Subacromial pain syndrome cluster — all three",
              how: "Hawkins-Kennedy, painful arc, and painful or weak resisted external rotation. The cluster is the unit of information here, not any one of its parts.",
              finding: "**All three positive → +LR 10.56. All three negative → −LR 0.17.** A single one of them, on its own, moves the probability very little",
            },
            {
              id: "drop-arm",
              name: "Drop arm test — full-thickness supraspinatus tear",
              how: "Passive 90° of abduction with internal rotation; the patient holds it, then lowers the arm slowly.",
              finding: "**Positive is the arm dropping, or losing smooth eccentric control on the way down.** Sp 88, +LR 2.25 — specific rather than sensitive, so a positive is the useful result",
            },
            {
              id: "ir-lag",
              name: "Internal rotation lag sign — full-thickness subscapularis tear",
              how: "Hand behind the back; you lift it away from the spine and the patient holds it there.",
              finding: "**Positive is an inability to keep the hand off the back.** Sn 97, Sp 96 — unusually strong on both counts for a shoulder test",
            },
            {
              id: "er-lag",
              name: "External rotation lag sign — full-thickness infraspinatus tear",
              how: "Elbow at 90°, shoulder abducted to 20°, taken to maximal external rotation; the patient holds it there.",
              finding: "**Positive is the arm falling back into internal rotation.** The posterior supraspinatus contributes at this angle, so a lag here is not purely infraspinatus",
            },
            {
              id: "apprehension",
              name: "Apprehension and relocation — anterior instability",
              how: "Supine at 90/90 resting on your thigh; palpate anteriorly and take the arm into external rotation, then back off, add a posterior glide, and re-enter external rotation.",
              finding: "**Positive is apprehension or fear — not pain — that settles with the posterior glide.** Pain alone at end-range external rotation is a different finding and does not make this test positive",
            },
            {
              id: "biceps-load",
              name: "Biceps Load II — SLAP tear",
              how: "120° of abduction, elbow at 90°, forearm supinated, taken to end-range external rotation; resist elbow flexion from there.",
              finding: "**Positive is deep shoulder pain with the resisted flexion.** Sn 90, Sp 97, +LR 26.38, −LR 0.11 — the strongest pair of ratios on this page",
            },
            {
              id: "palpation",
              name: "Palpation of the rotator cuff tendons",
              how: "Work from the deltopectoral triangle to the bicipital groove at 20° of internal rotation; external rotation then brings the lesser tubercle and subscapularis under your finger, more internal rotation brings the greater tubercle and supraspinatus, and flexion with adduction and internal rotation brings infraspinatus.",
              finding: "**Use active rotation to bring each tendon to your finger** rather than chasing it around the humerus — the landmark moves, your hand stays put",
            },
            {
              id: "posterior-glide",
              name: "Glenohumeral posterior glide — assess, then treat by irritability",
              how: "Open packed at about 50° of abduction with slight horizontal adduction and external rotation; the hand sits lateral to the coracoid and the force runs **posterolaterally**, along the treatment plane rather than straight back.",
              finding: "**For limited internal rotation or horizontal adduction with a capsular end feel.** The direction comes from the restriction, the grade from the irritability",
            },
            {
              id: "inferior-glide",
              name: "Glenohumeral inferior glide — assess, then treat by irritability",
              how: "A wedge or towel blocks the scapula and acromion but not the humeral head; the hand sits lateral to the acromion, the force runs inferiorly with a slight lateral component, and it is driven from your hips rather than your arms.",
              finding: "**For limited flexion or abduction with a capsular end feel.** A hard end feel that does not change across three bouts is a referral question, not a reason to push harder",
            },
            {
              id: "ex-flexion",
              name: "Exercise: flexion range, high versus low irritability",
              how: "High irritability: supported, pain-free active-assisted range, high repetitions, patient-controlled. Low irritability: sustained end-range positions, maximizing total end-range time.",
              finding: "**Reassess after each round of three bouts.** The range you gained is the only argument for continuing with the same dose",
            },
            {
              id: "ex-ir",
              name: "Exercise: internal rotation range, high versus low irritability",
              how: `Supine internal rotation, keeping the humeral head from popping up — the cue is "swivel around an axis." At low irritability, add the horizontal adduction stretch for the posterior capsule.`,
              finding: "**The motion has to be spin, not anterior glide.** A head that translates forward is the fault you came to fix, being rehearsed",
            },
            {
              id: "ex-er",
              name: "Exercise: external rotation range, high versus low irritability",
              how: "Prone external rotation, synchronizing finger extension into wrist extension as the arm swivels laterally, and avoiding latissimus and deltoid compensation.",
              finding: "High irritability: pain-free active-assisted range only. Low irritability: end-range holds",
            },
            {
              id: "ex-posterior-tilt",
              name: "Exercise: scapular posterior tilt and thoracic extension",
              how: "Load the lower trapezius and serratus with the thorax extended, and keep the elbow in front of the mid-axillary line through the functional retraining.",
              finding: "**Scapular upward rotation is what keeps the cuff out of impingement** — and the posterior tilt with thoracic extension is what allows the upward rotation",
            },
          ],
        },
        { kind: "heading", text: "The same items, grouped by patient position" },
        {
          kind: "lede",
          text: "The list above is ordered by category, which is how you learn it. This is how you run it: get everything you need from one position before you move them. A full screen done in category order moves the patient four or five times.",
        },
        {
          kind: "table",
          columns: ["Position", "Everything you do there", "Why it lands here"],
          rows: [
            [
              { text: "Before you touch them", variant: "name" },
              "The red flag screen **1** · clearing the cervical spine **2**",
              "Both are questions about whether this is a shoulder problem at all. They cost two minutes and they are the only items here that can end the examination rather than direct it.",
            ],
            [
              { text: "Standing", variant: "name" },
              "Posture from the front, side and back · flexion AROM with the four critical events **3** · scapular assist test **4** · ER @ 90° **5** · hand behind head and hand behind back **6**",
              "Everything that needs gravity and a freely moving scapula. Stand behind or in the quadrant so you can see the scapula and the thorax at once.",
            ],
            [
              { text: "Quadruped", variant: "name" },
              "Alignment through the chain · scapular internal rotation under load · rocking backward",
              "Loading through the hand exposes scapular faults that hide in standing. One position change, several findings.",
            ],
            [
              { text: "Seated", variant: "name" },
              "Static resisted IR, ER, abduction **12** · MMT supraspinatus, infraspinatus, teres minor **13** · serratus anterior at ~130° **17** · palpation of the RTC tendons **24** · painful arc, Neer's, Hawkins-Kennedy, full and empty can **18** · drop arm **19** · ER lag **21** · Hornblower's · IR lag **20** · Speed's · sulcus sign · AC shear",
              "The whole contractile and special-test block. Almost every provocation test is seated or standing, so batch them rather than sitting the patient up twice.",
            ],
            [
              { text: "Supine", variant: "name" },
              "PROM flexion total and pure GH **7** · abduction · IR and ER **9** · horizontal adduction **10** · pec minor and pec major length **11** · subscapularis length · apprehension and relocation **22** · posterior apprehension · Biceps Load II **23** · GH posterior and inferior glides **25 26** · traction · AC and SC mobilizations · supine STM and PROM",
              "The longest block by far. Every passive measurement and most of the treatment happens here, so set the bolster once and work through it.",
            ],
            [
              { text: "Sidelying", variant: "name" },
              "Scapular upward rotation PROM and mobilization **8** · scapulothoracic mobilization · STM to posterior cuff, latissimus, teres major, upper trap",
              "The only position that gives you the scapula from both edges at once. Pair the assessment and the treatment in the same roll.",
            ],
            [
              { text: "Prone", variant: "name" },
              "MMT subscapularis **14** · MMT lower and middle trapezius **15** · latissimus length **16** · posterior-to-anterior humeral mobilization · prone ER exercise **29**",
              "Last, because it is the hardest position to leave. The scapular MMTs and the prone ER retraining belong together.",
            ],
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
            {
              value: "2 : 1",
              label:
                "Scapulohumeral rhythm — 2° GH for every 1° scapular. Written *2:1* as a ratio of motion, but some sources write the same relationship as *1:2* (scapula to humerus) — check which way the question is phrased.",
            },
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
      id: "screen",
      navLabel: "Screen",
      title: "What has to be cleared first",
      blocks: [
        {
          kind: "lede",
          text: "The shoulder is the joint most often used as a referral site by something that is not a shoulder, and it sits directly below the region that most often mimics it. Two screens run before the examination proper: the symptoms that belong to another system, and the neck.",
        },
        {
          kind: "heading",
          text: "The symptoms that do not belong to a shoulder",
        },
        {
          kind: "table",
          columns: ["What you hear", "What it may be", "What gives it away", "What you do"],
          widths: ["26%", "22%", "30%", "22%"],
          rows: [
            [
              { text: "Left shoulder, arm or jaw pain that arrives with exertion and eases with rest", variant: "name" },
              "Cardiac referral",
              "**No shoulder movement reproduces it.** It tracks with effort, not with position, and may come with breathlessness, nausea or sweating",
              "Same-day medical referral",
            ],
            [
              { text: "Right shoulder-tip pain with abdominal or digestive symptoms", variant: "name" },
              "Diaphragmatic irritation — gallbladder, liver, or subphrenic",
              "Unaffected by shoulder movement; follows meals, or comes with abdominal signs",
              "Medical referral",
            ],
            [
              { text: "Constant deep pain, night pain unrelated to position, weight loss, a smoking history", variant: "name" },
              "Apical lung tumour, or metastatic disease",
              "**Pain that is not modulated by position or movement at all.** May come with ulnar-sided hand symptoms or a drooping eyelid on the same side",
              "Urgent medical referral",
            ],
            [
              { text: "Hot, swollen, exquisitely painful joint with fever", variant: "name" },
              "Septic arthritis",
              "Systemically unwell, and every direction hurts — actively and passively alike",
              "Emergency referral",
            ],
            [
              { text: "Trauma, a squared-off deltoid, the arm held slightly abducted and externally rotated", variant: "name" },
              "Anterior dislocation, unreduced",
              "Visible deformity and a refusal to move the arm at all",
              "Imaging before any test",
            ],
            [
              { text: "Recent trauma, an inability to lift the arm, bruising over the chest wall", variant: "name" },
              "Fracture, or an acute massive cuff tear",
              "The two present alike in the first days, and the difference is not clinical",
              "Radiograph before you decide which",
            ],
            [
              { text: "Numbness, tingling or weakness in a nerve or root distribution", variant: "name" },
              "Cervical radiculopathy, brachial plexus or peripheral nerve",
              "**Symptoms below the elbow**, or any sensory or reflex change",
              "The cervical screen below",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "One line ties most of this table together.",
          body: "A shoulder problem is a movement problem: some position or motion makes it worse and some other one makes it better. Pain that no movement changes — that arrives with exertion, or at night regardless of how the arm is placed, or that is simply constant — is the pattern worth stopping for, whatever else the examination shows. It is also the pattern most easily lost, because a patient with a genuine stiff shoulder can have all of this as well.",
        },
        {
          kind: "heading",
          text: "Clearing the cervical spine",
        },
        {
          kind: "lede",
          text: "The neck refers into the shoulder often enough that a shoulder examination which never tested it is incomplete. It costs about two minutes.",
        },
        {
          kind: "table",
          columns: ["Step", "How it is performed", "What a positive means"],
          widths: ["24%", "38%", "38%"],
          rows: [
            [
              { text: "Active cervical range", variant: "name" },
              "All planes, with overpressure added only if the motion is symptom-free",
              "**Reproduction of the shoulder symptoms from the neck moves the problem to the neck**",
            ],
            [
              { text: "Spurling's test", variant: "name" },
              "Extension with ipsilateral sidebend and rotation, then gentle axial compression",
              "Reproduced radicular symptoms. Specific rather than sensitive — a positive rules in, a negative does not rule out",
            ],
            [
              { text: "Cervical distraction", variant: "name" },
              "Manual distraction through the occiput and mandible",
              "**Relief** of the symptoms supports a cervical source — the one test on this page where getting better is the positive",
            ],
            [
              { text: "Cervical rotation", variant: "name" },
              "Measured rotation toward the involved side",
              "Less than 60° is the fourth item of the cluster below",
            ],
            [
              { text: "Upper limb neurodynamic test 1", variant: "name" },
              "Median-biased sequence, confirmed with a distal sensitizer",
              "Symptom reproduction that **changes when the sensitizer is added** — otherwise it is a stretch, not a neural finding",
            ],
            [
              { text: "Myotomes, dermatomes, reflexes", variant: "name" },
              "C4–T1 resisted testing, light touch, and the biceps, brachioradialis and triceps reflexes",
              "Any weakness in a myotomal pattern, or any sensory or reflex change, is a nerve finding and not a cuff finding",
            ],
          ],
        },
        {
          kind: "footnote",
          text: "Wainner's cluster for cervical radiculopathy is these four together: a positive Spurling's, a positive upper limb neurodynamic test 1, cervical rotation under 60° toward the involved side, and relief with distraction. Three of four gives a +LR around 6; all four around 30. As with the subacromial cluster, the four together are worth far more than any one of them.",
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
          text: "Location narrows the shoulder less sharply than it narrows the knee, because so much of what hurts here refers into the deltoid rather than sitting over the structure at fault. That is itself the useful fact: pain over the lateral deltoid says almost nothing about which tissue produced it, and pain that is genuinely point-tender usually does.",
        },
        {
          kind: "table",
          columns: ["Pain location", "Candidate source", "The test that addresses it", "The finding that confirms it"],
          rows: [
            { group: "Lateral" },
            [
              { text: "Lateral deltoid, diffuse, hard to point to", variant: "name" },
              "Subacromial pain syndrome, or a cuff tendinopathy",
              "The three-test cluster · painful arc",
              "**All three positive → +LR 10.56.** The diffuse deltoid ache is referred, so palpating where it hurts finds nothing",
            ],
            [
              { text: "Lateral deltoid with weakness rather than pain", variant: "name" },
              "Full-thickness cuff tear",
              "Drop arm · the lag signs",
              "A lag or a drop — **weakness that is not explained by pain** is the distinction that matters",
            ],
            { group: "Anterior" },
            [
              { text: "Anterior, in the bicipital groove", variant: "name" },
              "Long head of biceps tendinopathy",
              "Palpation at 20° of internal rotation · Speed's",
              "Point tenderness that moves with the humerus as you rotate it — if it stays put, it is not the tendon",
            ],
            [
              { text: "Deep and anterior, with a catch or a click", variant: "name" },
              "SLAP lesion",
              "Biceps Load II",
              "Deep pain with resisted flexion at end-range external rotation. Sn 90, Sp 97",
            ],
            [
              { text: "Anterior, with apprehension at end-range ER", variant: "name" },
              "Anterior instability",
              "Apprehension and relocation",
              "**Fear, not pain**, that settles with the posterior glide",
            ],
            { group: "Superior" },
            [
              { text: "Point-tender over the AC joint", variant: "name" },
              "Acromioclavicular joint",
              "Cross-body adduction · AC shear · palpation",
              "The one shoulder location a patient can point to with a single finger, and it is usually right",
            ],
            { group: "Posterior" },
            [
              { text: "Posterior, with a tight cross-body reach", variant: "name" },
              "Posterior capsule tightness",
              "Horizontal adduction measurement · internal rotation range",
              "The elbow failing to reach the midline, and an arc loss over 5°",
            ],
            [
              { text: "Posterior and scapular, worse late in the day", variant: "name" },
              "Scapular control and the periscapular muscles",
              "Scapular assist test · MMT lower and middle trapezius, serratus",
              "A change in symptoms when you assist the scapula — which also names the exercise",
            ],
            { group: "Not the shoulder" },
            [
              { text: "Into the trapezius ridge and up toward the neck", variant: "name" },
              "Cervical referral",
              "The cervical screen",
              "Reproduction from the neck. **Shoulder tests can be positive at the same time** — a positive cluster does not clear the neck",
            ],
            [
              { text: "Below the elbow, or with any numbness", variant: "name" },
              "Nerve — root, plexus or peripheral",
              "Neurological screen · upper limb neurodynamic test",
              "Sensory or reflex change. No shoulder diagnosis on this page produces numbness",
            ],
            [
              { text: "Anywhere, but no position changes it", variant: "name" },
              "Not a musculoskeletal problem",
              "The red flag screen",
              "**Pain that no movement modulates.** This is the row that ends the examination",
            ],
          ],
        },
        {
          kind: "figure",
          figureId: "shoulder-pain-map",
          title: "Where the finger lands, and how much it narrows",
          caption:
            "**The shoulder is the region where location helps least, and knowing that is the point.** Subacromial pain, cuff tendinopathy and a cervical referral can all present as a diffuse ache over the lateral deltoid, which is why the cluster and the neck screen carry the weight here rather than palpation. The two places a finger genuinely localizes are the AC joint on top and the bicipital groove in front — and even the groove has to be confirmed by rotating the humerus under the finger.",
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
        { kind: "heading", text: "Quadruped movement assessment" },
        {
          kind: "lede",
          text: "Loading the shoulder through the hand changes what you can see. Scapular faults that hide in standing show up here, which is why the movement syndrome material uses quadruped specifically to look for scapular internal rotation.",
        },
        {
          kind: "table",
          columns: ["What you assess", "Look for"],
          rows: [
            [
              { text: "Static alignment", variant: "name" },
              "Head, neck, thorax, shoulders, scapula, humerus. The scapula should lie flat with the medial border against the thorax, not tented away from it.",
            ],
            [
              { text: "Scapular internal rotation", variant: "name" },
              "Medial border lifting off the ribs under load — the finding that used to be called winging. Palpate the triangle below the scapular spine to confirm.",
            ],
            [
              { text: "Rocking backward", variant: "name" },
              "The scapula should stay controlled as the trunk moves over a fixed hand. Watch for the scapula sliding into elevation, downward rotation or anterior tilt as you rock back.",
            ],
            [
              { text: "Correction", variant: "name" },
              "Cue the scapula flat and reassess symptoms and quality — the same logic as the scapular assist test, in a loaded position.",
            ],
          ],
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
          widths: ["16%", "10%", "30%", "16%", "28%"],
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
          widths: ["14%", "28%", "14%", "22%", "22%"],
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
          widths: ["20%", "14%", "22%", "20%", "24%"],
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
          widths: ["18%", "26%", "26%", "30%"],
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
          // Five columns of prose plus one of bare figures: left to size itself, the stats
          // column wraps to one character per line while the tissue column sprawls.
          widths: ["14%", "22%", "22%", "20%", "22%"],
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
        { kind: "heading", text: "The other naming system: ICF categories" },
        {
          kind: "lede",
          text: "A movement system diagnosis names the fault. The ICF category names the *impairment pattern*, and it is what the lab tags every single test with. Most tests carry more than one — Neer's, for instance, is tagged mobility, coordination and power — so read these as the category a finding *feeds*, not a one-to-one label.",
        },
        {
          kind: "table",
          columns: ["ICF category", "What the presentation looks like", "Findings that feed it"],
          rows: [
            [
              { text: "Shoulder pain with mobility deficits", variant: "name" },
              "Loss in more than one direction, PROM close to AROM, capsular end feels, joint play restricted",
              "PROM flexion, abduction, IR, ER · horizontal adduction · pure GH flexion under 120° with a capsular end feel · every joint mobilization in §10 · Hawkins-Kennedy",
            ],
            [
              { text: "Shoulder pain with movement coordination impairments", variant: "name" },
              "Faulty scapulohumeral rhythm, aberrant motion, symptoms that change when you correct the movement",
              "The four critical events · scapular assist test · quadruped assessment · hand behind head and back · scapular upward rotation PROM versus AROM",
            ],
            [
              { text: "Shoulder pain with muscle power deficits", variant: "name" },
              "Pain or weakness on resisted testing; a lag sign means the tendon cannot hold the position at all",
              "Static resisted IR, ER, abduction · every MMT · full and empty can · drop arm · ER and IR lag signs · Hornblower's",
            ],
            [
              { text: "Shoulder stability and movement coordination impairments", variant: "name" },
              "Apprehension rather than pain, generalized laxity, a history of the shoulder giving way",
              "Anterior apprehension and relocation · posterior apprehension · sulcus sign · Biceps Load II · the anterior glide syndrome picture",
            ],
          ],
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
              subtitle: "End feel: empty, before you reach end range\nHistory: pain at rest or at night, easily provoked, slow to settle",
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
              subtitle: "End feel: pain at the onset of the end feel\nHistory: pain with activity, settles within a reasonable time",
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
              subtitle: "End feel: minimal pain even with overpressure\nHistory: symptoms only at end range or under load, settles quickly",
              points: ["Grade III–IV joint mobilizations", "Sustained-hold PROM", "Maximize total end range time (TERT)"],
            },
          ],
        },
        { kind: "heading", text: "The subjective exam that sets the level" },
        {
          kind: "lede",
          text: "End feel confirms the level; the history usually tells you before you lay a hand on them. Ask these first, then see whether the end feel agrees.",
        },
        {
          kind: "table",
          columns: ["Ask", "What the answer tells you"],
          rows: [
            [
              { text: "What caused it?", variant: "name" },
              "Overuse and a repeated movement pattern point to a movement system diagnosis; a single traumatic event points you toward tissue damage and instability",
            ],
            [
              { text: "Any pain at rest?", variant: "name" },
              "Resting pain, or an ache that never fully leaves, is the clearest marker of high irritability",
            ],
            [
              { text: "Pain at night? Can you sleep on it?", variant: "name" },
              "Night pain raises suspicion of a full-thickness tear when it sits alongside age over 65 and ER weakness — and sleeping posture is itself a treatment target",
            ],
            [
              { text: "Average, worst and best in the last week", variant: "name" },
              "Three numbers instead of one. A wide spread means the shoulder is reactive to what they do; a high floor means high irritability",
            ],
            [
              { text: "What aggravates it, and how long does it take to settle?", variant: "name" },
              "The settling time is the single most useful irritability question. **Minutes is low, hours is moderate, the rest of the day is high.**",
            ],
            [
              { text: "What eases it?", variant: "name" },
              "Positions and modalities that help are your starting dose and your home programme",
            ],
            [
              { text: "What do you need the shoulder to do?", variant: "name" },
              "The sport or task defines the movement you retrain and the position you have to make pain-free",
            ],
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          lead: "When the history and the end feel disagree,",
          body: "treat to the more irritable of the two for the first session and reassess. Under-dosing costs you one visit; over-dosing costs you their trust and can flare them for days.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Standard mobilization dose:",
          body: "3 bouts of 30 seconds to 1 minute with 30 seconds rest. After grade III/IV, ease out with 5–10 seconds of grade I–II. A 30-second end-range stretch may follow each round. Then have the patient use the new range: 3 × 30 active reps in pain-free range. Reassess after every round of 3 bouts.",
        },
        { kind: "heading", text: "From a finding to the first session" },
        {
          kind: "lede",
          text: "The rest of this section is organized by technique. This one is organized by what you found, which is the direction you actually work in.",
        },
        {
          kind: "table",
          columns: ["What you found", "What it means", "First three things", "Reassess with"],
          widths: ["24%", "24%", "30%", "22%"],
          rows: [
            [
              { text: "Painful arc + Hawkins-Kennedy + painful or weak resisted ER", variant: "name" },
              "Subacromial pain syndrome. Usually a space problem before it is a tissue problem.",
              "1 · scapular upward rotation and posterior tilt training — serratus and lower trap\n2 · pec minor length and thoracic extension\n3 · cuff loading below the painful range",
              "The painful arc itself, and the quality of AROM with the scapular assist",
            ],
            [
              { text: "Limited IR and horizontal adduction, capsular end feel", variant: "name" },
              "Posterior capsule — the upstream driver of the whole anterior cascade",
              "1 · GH posterior glide, graded to irritability\n2 · horizontal adduction stretch\n3 · active IR through the range you just gained, 3 × 30",
              "IR ROM and the total rotation arc, immediately after each round of three bouts",
            ],
            [
              { text: "More than ⅓ of the head anterior, stiff posterior structures", variant: "name" },
              "Humeral anterior glide syndrome",
              "1 · supine IR with the correct movement pattern, lengthening the external rotators\n2 · horizontal adduction stretch for the posterior capsule\n3 · subscapularis strengthening",
              "Resting alignment first, then the task that provokes them",
            ],
            [
              { text: "Scapula fails to reach 60° upward rotation, but PROM is full", variant: "name" },
              "Coordination and power, not mobility — **do not mobilize**",
              "1 · serratus anterior and lower trapezius loading\n2 · the scapular assist correction as a movement cue\n3 · thoracic extension so the scapula has somewhere to go",
              "The scapular assist test, and where the inferior angle reaches at end range",
            ],
            [
              { text: "Empty end feel, PROM close to AROM, loss in several directions", variant: "name" },
              "Mobility deficit with high irritability",
              "1 · grade I–II mobilizations only\n2 · soft tissue mobilization in the open-packed position\n3 · patient-controlled AAROM, high reps, pain-free",
              "Pain at rest and the size of the pain-free range — not end range",
            ],
            [
              { text: "Over 65, night pain, weak ER, positive drop arm or lag sign", variant: "name" },
              "Full-thickness tear is on the table — three risk factors lining up matters more than any single test",
              "1 · stop provocative loading\n2 · talk to the referring provider about imaging before you progress\n3 · work the scapula and the proximal chain in the meantime",
              "The lag signs, and whether night pain is changing",
            ],
          ],
        },
        { kind: "heading", text: "Joint mobilizations" },
        {
          kind: "table",
          columns: ["Mobilization", "Set-up", "Force direction", "Use when"],
          widths: ["18%", "32%", "24%", "26%"],
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
          widths: ["18%", "26%", "26%", "30%"],
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
        { kind: "heading", text: "Cases — work the whole chain" },
        {
          kind: "lede",
          text: "Everything above tests one fact at a time. These do not. For each, name the findings you would go after, the irritability, the movement diagnosis, the ICF category, and what you do first.",
        },
        {
          kind: "cases",
          items: [
            {
              scenario:
                "19-year-old volleyball hitter. Anterior shoulder pain in late cocking, hypermobile elsewhere. Standing, more than a third of the humeral head sits forward of the acromion. ER 105°, IR 45° at 90° of abduction. Pain 3/10, settles in an hour.",
              lines: [
                {
                  label: "Arithmetic first:",
                  body: "total arc 150°, well under the 165–180° normal, and IR is down against a high ER — that is GIRD.",
                },
                {
                  label: "Movement diagnosis:",
                  body: "humeral anterior glide syndrome. The picture fits: overhead athlete with general laxity, lax anterior capsule, stiff posterior structures, and the head taking the path of least resistance forward.",
                },
                { label: "Irritability:", body: "moderate — pain with activity that settles in a reasonable time, no rest or night pain." },
                { label: "ICF:", body: "shoulder stability with movement coordination impairments." },
                {
                  label: "First session:",
                  body: "horizontal adduction stretch and posterior glide for the posterior capsule; supine IR with the head blocked from translating — *swivel around an axis*; subscapularis strengthening. Correct resting and sleeping alignment before any of it, and check the proximal chain — single-leg stance, hip rotation, core.",
                },
                { label: "Reassess with:", body: "total arc and resting alignment, then the cocking position itself." },
              ],
            },
            {
              scenario:
                "68-year-old, six weeks of shoulder pain after reaching into the back seat. Wakes at night. Cannot hold the arm at 90° of abduction; it drifts down. Resisted ER is weak more than painful.",
              lines: [
                {
                  label: "The three that matter:",
                  body: "age over 65, night pain, and ER weakness **together** raise the probability of a full-thickness tear more than any single special test does.",
                },
                {
                  label: "Confirm with:",
                  body: "drop arm (Sp 88, +LR 2.25) and the ER lag sign; add Hornblower's if you suspect teres minor and the IR lag sign for subscapularis.",
                },
                { label: "ICF:", body: "shoulder pain with muscle power deficits." },
                {
                  label: "First session:",
                  body: "stop the provocative loading, talk to the referring provider about imaging before progressing, and work the scapula and proximal chain in the meantime.",
                },
                {
                  label: "The trap:",
                  body: "reading the weakness as a strengthening problem and loading into it. A lag sign means the tendon cannot hold the position at all — that is not a rep-range problem.",
                },
              ],
            },
            {
              scenario:
                "45-year-old at a desk. Pain 70–110° of abduction, none above or below. Hawkins-Kennedy positive, resisted ER painful. PROM full and symmetric. Pain 3/10, gone within minutes of stopping.",
              lines: [
                {
                  label: "Cluster:",
                  body: "painful arc + Hawkins-Kennedy + painful resisted ER — all three positive gives **+LR 10.56** for subacromial pain syndrome.",
                },
                {
                  label: "Irritability:",
                  body: "low. Full PROM, quick settling, minimal pain with overpressure — so you can work at end range and use grade III–IV if you need mobilization at all.",
                },
                {
                  label: "Movement diagnosis:",
                  body: "look for decreased scapular upward rotation or increased anterior tilt. Full PROM with a scapula that will not rotate means strength and motor control, not mobility.",
                },
                { label: "ICF:", body: "shoulder pain with movement coordination impairments." },
                {
                  label: "First session:",
                  body: "serratus and lower trapezius loading, pec minor length and thoracic extension, cuff work below the painful range. Use the scapular assist as the movement cue — if it changes the pain, it is also your treatment.",
                },
                { label: "Reassess with:", body: "the painful arc, and where the inferior angle gets to at end range." },
              ],
            },
            {
              scenario:
                "52-year-old, three months of progressive stiffness with no injury. Aches at rest, wakes at night. PROM is barely more than AROM. Loss is worst into ER, then abduction, then IR. End feel is empty.",
              lines: [
                {
                  label: "Pattern:",
                  body: "loss in multiple directions with PROM ≈ AROM is capsular, not muscular. The ER-worst ordering is the classic capsular pattern.",
                },
                { label: "Irritability:", body: "high — empty end feel before end range, pain at rest and at night." },
                { label: "ICF:", body: "shoulder pain with mobility deficits." },
                {
                  label: "First session:",
                  body: "grade I–II mobilizations only, soft tissue work in the open-packed position, pain-free patient-controlled AAROM at high repetitions. Bolster into open pack. **No end-range stretching and no grade III–IV**, however tempting the stiffness looks.",
                },
                { label: "Reassess with:", body: "pain at rest and the size of the pain-free range, not end range." },
                {
                  label: "The trap:",
                  body: "treating stiffness aggressively because the numbers are low. Irritability sets the dose, not the diagnosis — and if the range does not improve within the session, you are dealing with shortness rather than stiffness and the timeline is longer.",
                },
              ],
            },
          ],
        },
        { kind: "heading", text: "Single facts" },
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
    "**About this guide.** Compiled from a shoulder examination and treatment sequence covering functional tasks and biomechanics, movement system syndromes, posture through manual muscle testing, special tests, and palpation through soft tissue mobilization. Normative values, sensitivity/specificity and likelihood ratios are reproduced as stated in those source materials — verify against current literature before using them to weight a clinical decision. Items 27–30, the irritability-graded exercise progressions, are assembled from the irritability framework and treatment principles rather than quoted as a fixed exercise list.\n**Three parts of this page are not from those materials.** The red flag screen, the cervical screen, and the pain map were added afterwards because the source sequence did not carry them: it assumed a shoulder that had already been triaged. They are standard curriculum content — the referral patterns are the conventional ones and Wainner's cluster is as published — and they are the parts to check hardest against your own course, since your program may screen differently.\n**The neck is the omission worth naming.** A shoulder examination that never tested the cervical spine cannot distinguish a cuff problem from a referral, and the two can be present at once — a positive subacromial cluster does not clear the neck."
};
