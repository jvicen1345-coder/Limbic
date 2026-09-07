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
  eyebrow: "Musculoskeletal practice · examination, treatment & provenance",
  summary:
    "A full shoulder screen in the order you'd perform it, built for the competency exam and for what comes after it. Every value says where it came from: what your program teaches, what the literature measured, and — where those two part company — both, so you can write the answer you are marked on without believing something that isn't so.",
  stamp: [
    { value: "32", label: "exam items" },
    { value: "81", label: "sourced values" },
    { value: "15", label: "convention or contested" },
    { value: "3", label: "values retired" },
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
          text: "Thirty-two capabilities, grouped by the question each phase of the examination answers. Every item is written as something you can do rather than something you can name, because that is the only version you can check honestly. The last column is the finding — the number or observation that turns a maneuver into information — with the source it comes from, since several of the values taught as settled are not.",
        },
        {
          kind: "provkey",
          entries: [
            {
              body: "**How to read a value.** Anything **unmarked** is a finding traced to a published source you can read for free. The citation sits next to it so you can check it yourself rather than take our word for it.",
            },
            {
              prov: "c",
              body: "**nobody has tested it.** A rule of thumb taught everywhere, used everywhere, and never measured against evidence. Keep using it and expect it on the exam — just do not defend it as a finding. The note beside each one says whether it traces to a named clinician or to no one at all.",
            },
            {
              prov: "x",
              body: "**it has been tested, and the studies disagree.** Evidence exists on both sides, so the range is the honest answer and any single number is a choice someone made. Quote the range, not the figure.",
            },
            {
              body: "Where the taught answer and the measured one differ, write the taught answer in the exam and know why it is shaky.",
            },
          ],
        },
        {
          kind: "checklist",
          items: [
            {
              id: "cervical-screen",
              group: "Should I be examining this shoulder at all?",
              name: "Cervical and thoracic screen",
              how: "Cervical AROM in all planes with overpressure, Spurling's, and an upper limb neurodynamic test. Ask whether the shoulder symptom changes.",
              finding:
                "Reproduction of the shoulder complaint from the neck sends you proximal before you examine the shoulder further. A clear screen does not exclude cervical contribution, it just lowers it.",
            },
            {
              id: "red-flags",
              name: "Red flag screen",
              how: "Trauma history, night pain and its pattern, constitutional symptoms, visible mass or deformity, unexplained atrophy, and prior cancer.",
              finding:
                "Trauma with a blocked passive rotation suggests fracture or unreduced dislocation. Night pain unrelated to position, with constitutional symptoms, needs referral rather than a movement diagnosis.",
            },
            {
              id: "classify-history",
              name: "Classify the presentation from the history",
              how: "Sort the complaint into instability, stiffness, pain with elevation, or weakness before touching the patient.",
              finding:
                "This choice determines which cluster you run later. Running every test you know is the alternative, and it degrades your post-test probability rather than improving it.",
            },

            {
              id: "standing-posture",
              group: "What is the resting state?",
              name: "Standing posture",
              how: "Observe from front, side and back. Note thoracic curvature, head position, and whether the resting position changes when the patient is cued to stand tall.",
              finding:
                "Record what you see, but hold it loosely: the link between static posture and shoulder pain is far weaker than it is usually taught. A posture that changes with a cue is more informative than the posture itself.",
            },
            {
              id: "scapular-resting",
              name: "Scapular resting position",
              how: "Medial border orientation, distance from the spine, and the vertebral level of the inferior angle.",
              finding:
                "Medial border roughly parallel to the spine, 2–3 inches from it [[src|Sahrmann]], inferior angle at T7 [[prov:c]] [[src|no traceable source]]. The inferior angle sits closest to **T8**, range T4–T11 [[src|Cooperstein 2015]], and bone-pin measurement gives 41° internal rotation, 13.5° anterior tilt, 5° upward rotation at rest [[src|Ludewig 2009]]. The distance figure has no normative study behind it.",
            },
            {
              id: "head-alignment",
              name: "Humeral head resting alignment",
              how: "Supine or standing, judge how much of the head sits anterior to the acromion.",
              finding:
                "[[prov:c]] More than a third anterior is the conventional threshold for calling it anteriorly positioned. Treat it as a clinical convention rather than a measured norm — it has no published accuracy data.",
            },

            {
              id: "arom-all-planes",
              group: "What can they do on their own?",
              name: "Active range of motion, all planes",
              how: "Flexion, abduction, extension, and rotation at 0° and at 90°. Watch where the range comes from, not only how much there is.",
              finding:
                "Flexion 180°, abduction 180°, extension 60°, IR 70°, ER 90° [[src|AAOS 1965]]. A community cohort of 2,404 people averaged flexion 158–162°, abduction 148–152° and ER 55–61°, and lost roughly 40° of flexion and abduction across the adult age range [[src|Gill 2020]]. The textbook figures are a ceiling, not an expectation. Compare sides, and age-match, before comparing to a table.",
            },
            {
              id: "scapulohumeral-rhythm",
              name: "Scapulohumeral rhythm",
              how: "Watch elevation from behind through the full arc and name where the scapular contribution changes.",
              finding:
                "**2:1** — two degrees of glenohumeral motion for every one of scapular [[src|Inman 1944]]. That holds only as an average across the whole arc. It is nearer **4:1** through the first 25–30° and closer to **5:4** after [[src|Poppen & Walker 1976, quoted inconsistently by later sources]], and it varies by plane — 2.1:1 in abduction, 2.4:1 in flexion, 2.2:1 in the scapular plane [[src|Ludewig 2009]].",
            },
            {
              id: "painful-arc",
              name: "Painful arc",
              how: "Abduct actively through the full range and mark where pain starts and stops.",
              finding:
                "[[prov:x]] Classically 60–120° [[src|Cyriax]]. Accuracy varies widely between studies: sensitivity 0.33 to 0.76 and specificity 0.61 to 0.81 [[src|Calis 2000; Park 2005]]. Useful inside a cluster, weak alone.",
            },
            {
              id: "hbh-hbb",
              name: "Functional composites",
              how: "Hand behind head, then hand behind back climbing from the lumbar spine. Measure against a spinal landmark on both sides, then add overpressure at end range.",
              finding:
                "Hand behind head is flexion, abduction and ER. Hand behind back is IR, extension and adduction. Positive is a clear side-to-side difference in reach, or symptoms reproduced by the overpressure.",
            },

            {
              id: "prom-vs-arom",
              group: "What can I do to them?",
              name: "Passive range, compared to active",
              how: "Repeat each restricted motion passively and record the difference.",
              finding:
                "Passive exceeding active points to weakness or pain inhibition rather than a mechanical block. The size of that gap is one of the criteria that sets irritability [[src|McClure & Michener 2015]].",
            },
            {
              id: "end-feel",
              name: "End feel",
              how: "Take each passive motion to its limit and classify what stops it.",
              finding:
                "Firm and leathery suggests capsule, springy suggests muscle, hard suggests bone, and empty means pain stopped you before tissue did. An empty end feel changes the plan more than any measurement.",
            },
            {
              id: "capsular-pattern",
              name: "Capsular pattern",
              how: "Compare the proportional loss across ER, abduction and IR.",
              finding:
                "[[prov:c]] The glenohumeral capsular pattern is ER limited most, then abduction, then IR [[src|Cyriax]]. Worth recognizing, but the evidence that capsular patterns reliably identify capsular pathology is weak — treat a matching pattern as a hint, not a diagnosis.",
            },
            {
              id: "accessory-motion",
              name: "Accessory motion at all four joints",
              how: "Glide the glenohumeral joint in the resting position, then assess acromioclavicular, sternoclavicular and scapulothoracic mobility.",
              finding:
                "Open-packed at about 55° abduction with 30° horizontal adduction. [[prov:c]] [[src|no traceable source]] That exact pairing has no primary source. Measured, the resting position depends on what you are testing — about 50° for physiological movement but 24° for accessory glides [[src|Lin 2007]]. The defensible range is 30–60°.",
            },

            {
              id: "pec-minor-length",
              group: "What is short?",
              name: "Pectoralis minor length",
              how: "Supine, arms at the sides, no downward pressure. Measure acromion to table. Or measure the muscle directly, from the caudal edge of the 4th rib at the sternum to the inferomedial coracoid, and divide by height.",
              finding:
                "Acromion-to-table over 2.6 cm means a short pectoralis minor [[src|the cutoff tested by Lewis & Valentine 2007]]. The measure is reliable, ICC 0.90–0.93, but that cutoff had specificity **0%** and a likelihood ratio of **1** — every subject tested positive, symptomatic or not [[src|Lewis & Valentine 2007]]. Use the index instead: PMI = (length ÷ height) × 100 [[src|Borstad 2008]], intrarater ICC 0.95–0.97 [[src|Rosa 2016]]. The two papers land the rib end differently — Borstad a finger-width lateral to the sternum, Rosa at the sternum — so pick one and stay with it. No validated cutoff for *short* exists, so compare sides.",
            },
            {
              id: "lat-posterior-length",
              name: "Latissimus and posterior shoulder length",
              how: "Latissimus: supine with the pelvis strapped, raise the arm and stop at the first substitution. Posterior shoulder: supine at 90° elevation, stabilize the scapula, take into horizontal adduction.",
              finding:
                "Horizontal adduction is the more trustworthy of the two — ICC 0.88, minimal detectable change 10.2° [[src|Hall 2020]], so a difference under about ten degrees is measurement noise. The latissimus test has inter-rater ICC of 0.33 [[src|Dawood 2018]]; use it for your own repeated measures, not to hand off to a colleague.",
            },

            {
              id: "cuff-mmt",
              group: "What is weak?",
              name: "Rotator cuff manual muscle testing",
              how: "Supraspinatus in the full can position, 90° scaption with 45° external rotation. Infraspinatus with resisted ER at 0° elevation and the humerus pre-positioned in 45° of internal rotation — that pre-position is part of the test. Subscapularis with the Gerber push-off.",
              finding:
                "These positions maximize cuff EMG while limiting synergists [[src|Kelly 1996]]. Two cautions: neither empty nor full can is actually supraspinatus-specific — both activate eight or nine other muscles equally [[src|Boettcher 2009]] — and no resisted-rotation test separates teres minor from infraspinatus [[src|Jenp 1996]]. For teres minor specifically use Hornblower's: arm elevated to 90° in the scapular plane, elbow at 90°, resist active ER. Inability to externally rotate against resistance was 100% sensitive and 93% specific for irreparable teres minor degeneration [[src|Walch 1998]] — in 54 surgical patients against advanced fatty degeneration, so those figures belong to that population, not to routine shoulder pain.",
            },
            {
              id: "scapular-mmt",
              name: "Scapular muscle testing",
              how: "Prone for the trapezius pair and the position that isolates serratus anterior. Stabilize below the scapula so the trunk cannot supply the motion.",
              finding:
                "Prone positions isolate lower from middle trapezius [[src|Kendall]]. They do not — the modified Kendall trapezius tests are not region-specific: the lower trapezius test produced the greatest activation of all three trapezius regions [[src|Henderson 2021]]. Grade what you feel, but do not claim you isolated a region.",
            },
            {
              id: "mmt-grading",
              name: "Grade on the 0–5 scale",
              how: "0 none, 1 trace, 2 full range with gravity eliminated, 3 full range against gravity, 4 holds against some resistance, 5 holds against full resistance.",
              finding:
                "The 0–5 scale as defined, plus and minus grades included [[src|StatPearls]]; it descends from Lovett and Wright, 1912–16, and the MRC memorandum of 1943. Rasch analysis found the categories unequal, with 78.6% of muscle groups showing disordered thresholds — grades 1 to 3 too narrow, grade 4 far too broad [[src|Vanhoutte 2012]]. The MRC proposed 4−, 4 and 4+ but never defined the boundaries, and adding a 4+ grade made examiners agree *less* — agreement fell from 64% to 48% [[src|O'Neill 2017]]. Use them if your program requires them, but do not mistake the extra symbol for extra precision.",
            },
            {
              id: "weakness-vs-inhibition",
              name: "Distinguish weakness from inhibition",
              how: "Retest the weak motion after reducing the provocation — a different position, less range, or with the scapula supported.",
              finding:
                "Strength that returns when the provocation is removed was inhibited, not weak, and it needs a different treatment than loading.",
            },

            {
              id: "bony-palpation",
              group: "Where is it?",
              name: "Bony landmark palpation",
              how: "Run one repeatable sequence rather than hunting. Rotate the humerus under your fingers instead of moving your hand around the bone.",
              finding:
                "You should be able to find every landmark without looking, and name what attaches to it. Tenderness means little until it agrees with something else you found.",
            },
            {
              id: "soft-tissue-palpation",
              name: "Soft tissue palpation",
              how: "Palpate each cuff tendon in the position that brings it out from under the acromion, then the biceps tendon and the AC joint line.",
              finding:
                "Connect every tender structure back to the test that implicated it. Isolated tenderness with no corroborating test is a finding you should be willing to discard.",
            },

            {
              id: "special-tests-by-category",
              group: "What is it?",
              name: "Perform the special tests by category",
              how: "Subacromial, instability, labral, acromioclavicular and biceps. Know the set-up and the positive for each.",
              finding: "Performing them is the low bar. Knowing which ones are worth performing is the competency.",
            },
            {
              id: "interpret-lr",
              name: "Interpret likelihood ratios",
              how: "Read a test result as a shift in probability rather than a yes or no.",
              finding:
                "+LR above 10 or −LR below 0.1 is a large shift; 5–10 moderate; 2–5 small but sometimes important; 1–2 rarely matters. The bands are usually credited to [[src|Jaeschke 1994]], though they are also attributed to Sackett and reproduced widely without citation — a convention either way, not a law.",
            },
            {
              id: "build-cluster",
              name: "Build a cluster from your hypothesis",
              how: "Choose three tests that together answer the question the history raised, and run those.",
              finding:
                "Hawkins-Kennedy, painful arc and resisted ER all positive gives +LR 10.56 for impingement; painful arc, drop arm and resisted ER all positive gives +LR 15.57 for a full-thickness tear [[src|Park 2005]]. No single shoulder test can be recommended as diagnostic on its own, and clusters improve accuracy only modestly [[src|Hegedus 2012]].",
            },

            {
              id: "movement-diagnosis",
              group: "What do I call it?",
              name: "State a movement diagnosis",
              how: "Name the direction of susceptibility and the impairments producing it, rather than only the structure that hurts.",
              finding: "A structural label tells you what is irritated. A movement diagnosis tells you what to change.",
            },
            {
              id: "recognize-syndromes",
              name: "Recognize the common syndromes",
              how: "Match the pattern of findings to the recognized shoulder movement syndromes and name the impairments driving each.",
              finding:
                "The syndrome is a shorthand for a cluster of impairments. If you cannot list the impairments, you have not made the diagnosis.",
            },
            {
              id: "relative-stiffness",
              name: "Identify relative stiffness",
              how: "Ask which segment moves first, and which one should have.",
              finding:
                "Motion goes where it is easiest. The painful tissue is often the flexible one compensating for a stiff neighbor, which is why treating the painful site alone tends to fail.",
            },

            {
              id: "dose-from-irritability",
              group: "What do I do about it?",
              name: "Set the dose from irritability",
              how: "Grade irritability before choosing intervention intensity.",
              finding:
                "High: pain ≥7/10, consistent night pain, AROM less than PROM, pain before end range — minimize stress. Moderate: pain 4–6/10, intermittent night pain, AROM close to PROM, pain at end range. Low: pain ≤3/10, no night pain, AROM equals PROM, pain only with overpressure — moderate to high stress [[src|McClure & Michener, STAR 2015]].",
            },
            {
              id: "match-intervention",
              name: "Match intervention to impairment",
              how: "For each intervention chosen, state which finding it addresses.",
              finding: "If you cannot name the impairment an intervention targets, it is in the plan for the wrong reason.",
            },
            {
              id: "mobilize-with-rationale",
              name: "Mobilize with a stated rationale",
              how: "Choose joint or soft tissue technique, direction, grade and dosage — and say why each.",
              finding:
                "Direction follows the restricted glide. Grade follows irritability. Dosage follows the response you get on reassessment.",
            },
            {
              id: "reassessment-marker",
              name: "Define the reassessment marker",
              how: "Before treating, name the one finding you will recheck, and what result would change your mind.",
              finding: "A marker chosen after the fact is a justification. A marker chosen in advance is a test.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Give the taught answer on the exam.",
          body: "Where a value carries both, the first is what your program examines on and the second is what the literature shows. They diverge more often than a curriculum lets on: the inferior angle sits nearer T8 than T7, the 2.6 cm pectoralis minor cutoff has zero specificity, the can tests are not supraspinatus-specific, the trapezius tests are not region-specific, 2:1 rhythm is an average that describes no particular part of the range, and the plus and minus strength grades reduce agreement rather than refining it. Write the conventional answer, and know which ground you are standing on.",
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
              { text: "Standing", variant: "name" },
              "Posture from the front, side and back · flexion AROM with the four critical events **1** · scapular assist test **2** · ER @ 90° **3** · hand behind head and hand behind back **4**",
              "Everything that needs gravity and a freely moving scapula. Stand behind or in the quadrant so you can see the scapula and the thorax at once.",
            ],
            [
              { text: "Quadruped", variant: "name" },
              "Alignment through the chain · scapular internal rotation under load · rocking backward",
              "Loading through the hand exposes scapular faults that hide in standing. One position change, several findings.",
            ],
            [
              { text: "Seated", variant: "name" },
              "Static resisted IR, ER, abduction **10** · MMT supraspinatus, infraspinatus, teres minor **11** · serratus anterior at ~130° **15** · palpation of the RTC tendons **22** · painful arc, Neer's, Hawkins-Kennedy, full and empty can **16** · drop arm **17** · ER lag **19** · Hornblower's · IR lag **18** · Speed's · sulcus sign · AC shear",
              "The whole contractile and special-test block. Almost every provocation test is seated or standing, so batch them rather than sitting the patient up twice.",
            ],
            [
              { text: "Supine", variant: "name" },
              "PROM flexion total and pure GH **5** · abduction · IR and ER **7** · horizontal adduction **8** · pec minor and pec major length **9** · subscapularis length · apprehension and relocation **20** · posterior apprehension · Biceps Load II **21** · GH posterior and inferior glides **23 24** · traction · AC and SC mobilizations · supine STM and PROM",
              "The longest block by far. Every passive measurement and most of the treatment happens here, so set the bolster once and work through it.",
            ],
            [
              { text: "Sidelying", variant: "name" },
              "Scapular upward rotation PROM and mobilization **6** · scapulothoracic mobilization · STM to posterior cuff, latissimus, teres major, upper trap",
              "The only position that gives you the scapula from both edges at once. Pair the assessment and the treatment in the same roll.",
            ],
            [
              { text: "Prone", variant: "name" },
              "MMT subscapularis **12** · MMT lower and middle trapezius **13** · latissimus length **14** · posterior-to-anterior humeral mobilization · prone ER exercise **27**",
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
                "Scapulohumeral rhythm [[src|Inman 1944]]. True only as an average over the whole arc. It is roughly **4:1** through the first 25–30° and nearer **5:4** after that, and it changes by plane — 2.1:1 in abduction, 2.4:1 in flexion, 2.2:1 in the scapular plane [[src|Ludewig 2009]]. The early-range figures trace to Poppen & Walker 1976, quoted inconsistently by later sources — treat them as approximate.",
            },
            {
              value: "+39°",
              label:
                "Scapular upward rotation gained through elevation — an increase of 39°, from 11° early in the range to 50°. Resting upward rotation is only 5.4°. Not the 60° usually taught. [[src|Ludewig 2009, bone pin]]",
            },
            {
              value: "+21°",
              label:
                "Scapular posterior tilt through full elevation, from 13° anterior to 8° posterior. Most of it arrives after 90°. [[src|Ludewig 2009; McClure 2001]]",
            },
            {
              value: "41° / 13.5° / 5°",
              label: "Scapular resting position: internal rotation, anterior tilt, upward rotation [[src|Ludewig 2009]]",
            },
            {
              value: "6° · 16° · 31°",
              label:
                "Sternoclavicular contribution through elevation — elevation, retraction, posterior axial rotation. The clavicle rotates far more than it elevates. [[src|Ludewig 2009]]",
            },
            {
              value: "11° · 19° · 8°",
              label: "Acromioclavicular contribution — upward rotation, posterior tilt, internal rotation [[src|Ludewig 2009]]",
            },
            {
              value: "+10–51°",
              label:
                "The *increase* in glenohumeral external rotation through elevation, not an absolute angle. How much depends on the plane you elevate in. [[src|Ludewig 2009]]",
            },
            {
              value: "T8",
              label:
                "T7 [[prov:c]] [[src|no traceable source]] The inferior angle sits closest to **T8**, range T4–T11, with 85% at or within one level of it. [[src|Cooperstein 2015 meta-analysis]]",
            },
            {
              value: "158° / 150° / 58°",
              label:
                "What a community population of 2,404 people actually reaches in flexion, abduction and ER. The textbook 180/180/90 is a ceiling, not an expectation. These are means pooled across all ages — the same study found flexion and abduction fall by roughly 40° across the adult age range, so age-match before you call a range restricted. [[src|Gill 2020]]",
            },
            {
              value: "160–210°",
              label:
                "Total rotational arc at 90° abduction. Side-to-side difference should stay within **5°** — pitchers outside that had 2.5 times the *odds* of shoulder injury. GIRD, a **20°** internal rotation loss, was *not* itself significant in that study; total rotation was the variable that mattered. [[src|Wilk 2011]]",
            },
            {
              value: "50° vs 24°",
              label:
                "Glenohumeral resting position — about 50° abduction for physiological movement but only 24° for accessory glides. Which one you want depends on what you are testing. [[src|Lin 2007]]",
            },
            {
              value: "0–10°",
              label:
                "[[prov:x]] Superior inclination of the glenoid. Measured values vary with imaging method and reference axis, so treat any single figure with suspicion. [[src|Kircher 2017; Chalmers 2019]]",
            },
            {
              value: "60–120°",
              label:
                "Where a painful arc lives in abduction [[src|Cyriax]]. Sensitivity ranges 0.33 to 0.76 and specificity 0.61 to 0.81 across studies — useful in a cluster, weak alone. [[src|Calis 2000; Park 2005]]",
            },
            {
              value: "2–4%",
              label: "Of shoulder dislocations are posterior, and they are widely acknowledged to be under-diagnosed [[src|StatPearls]]",
            },
            {
              value: "> ⅓",
              label:
                "[[prov:c]] Of the humeral head anterior to the acromion is called anterior position [[src|Sahrmann]]. No study supports the threshold, and palpation of humeral head position has inter-rater ICC of only 0.48–0.68. [[src|Konieczka 2017]]",
            },
            {
              value: "≤ ½ in",
              label: "[[prov:c]] Inferior angle protrusion past the posterolateral thorax in full elevation [[src|Sahrmann]]",
            },
            {
              value: "~3 in & 30°",
              label:
                "[[prov:c]] Scapula from the midline, and its angle anterior to the frontal plane [[src|Sahrmann]]. Bone-pin measurement puts resting internal rotation nearer 41°. [[src|Ludewig 2009]]",
            },
            {
              value: "120° + 60°",
              label:
                "[[prov:c]] The familiar arithmetic for 180° of elevation. It is the 2:1 ratio multiplied out, not something anyone measured, and the scapular half overstates the 39° that was.",
            },
            {
              value: "first 30°",
              label:
                "[[prov:c]] The setting phase — elevation here is mostly humeral, with a small and inconsistent scapular contribution [[src|Inman 1944]]",
            },
          ],
        },
        {
          kind: "footnote",
          text: "**Three values have been removed from this section.** \"Scapular internal rotation over 15–20° is excessive\" has no published threshold and sits below the healthy resting mean of roughly 30–41°, so it would call every normal shoulder abnormal. \"More than 1 inch of lateral scapular translation indicates a short teres major\" could not be traced to any source, published or textbook. And the 2.54 cm pectoralis minor cutoff has a measured specificity of zero. None of them belong in a reference.",
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
          note: "Both ratios come from the same two numbers: +LR is Sn ÷ (1 − Sp), and −LR is (1 − Sn) ÷ Sp. The last column answers the question you actually have at the bedside, with the figures underneath it. Most single tests barely move the needle, which is the whole argument for clusters.",
        },
        {
          kind: "callout",
          tone: "note",
          lead: "Subacromial pain syndrome.",
          body: "Any 3 of 5 positives suggests SPS: painful arc, Neer's, Hawkins-Kennedy, pain/weakness with resisted ER, empty can. The *most predictive* cluster is Hawkins-Kennedy + painful arc + painful/weak resisted ER — all three positive gives +LR 10.56, all three negative gives −LR 0.17. Run all three before you commit to the diagnosis. A second cluster answers a different question: painful arc + drop arm + resisted ER, all three positive, gives +LR 15.57 for a *full-thickness tear* [[src|Park 2005]]. Hold both against the broader finding that no single shoulder test can be recommended as diagnostic on its own, and that clusters improve accuracy only modestly [[src|Hegedus 2012]].",
        },
        {
          kind: "table",
          columns: ["Test", "What it compresses or contracts", "Set-up", "Positive", "Does it change your mind?"],
          // Five columns of prose plus one of bare figures: left to size itself, the stats
          // column wraps to one character per line while the tissue column sprawls.
          widths: ["15%", "25%", "26%", "21%", "13%"],
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
              {
                text: "**Small shift, and contested**\n[[src|Sn 33-76 · Sp 61-81 · +LR 1.7-3.9]]",
                variant: "num",
              },
            ],
            [
              { text: "Neer's", variant: "name" },
              {
                text: "**Supraspinatus tendon + bursa** driven under the *anterolateral* acromion; long head of biceps often shares the space",
                variant: "tissue",
              },
              "Passive full flexion held in IR; add OP with one hand on the scapula and the other in the axilla",
              "Reproduction of symptoms",
              {
                text: "**Barely moves the needle**\n[[src|Sn 78 · Sp 58 · +LR 1.86]]",
                variant: "num",
              },
            ],
            [
              { text: "Hawkins-Kennedy", variant: "name" },
              {
                text: "**Supraspinatus tendon** pressed against the *coracoacromial ligament* and the coracoid — the medial corner of the same roof",
                variant: "tissue",
              },
              "Flexion to 90° + horizontal adduction, stabilize the top of the shoulder, internally rotate",
              "Limited range or shoulder pain",
              {
                text: "**Barely moves the needle**\n[[src|Sn 74 · Sp 57 · +LR 1.70]]",
                variant: "num",
              },
            ],
            [
              { text: "Full can / empty can", variant: "name" },
              {
                text: "**Supraspinatus** as a contractile unit — empty can adds IR, which also tucks the tuberosity under the acromion",
                variant: "tissue",
              },
              "90° scaption thumbs up, resist; then thumbs down, retest",
              "Weaker or more painful in the empty can position",
              {
                text: "**Barely moves the needle**\n[[src|empty Sn 69 · Sp 62 · full Sn 70 · Sp 81]]",
                variant: "num",
              },
            ],
            [
              { text: "Resisted ER", variant: "name" },
              { text: "**Infraspinatus + teres minor**, contractile", variant: "tissue" },
              "Seated, arm at side, you stabilize the distal humerus; resist into IR",
              "Pain or give-way weakness",
              {
                text: "**Small shift; best of the cluster**\n[[src|Sn 42 · Sp 90 · +LR 4.20]]",
                variant: "num",
              },
            ],
            [
              { text: "Resisted IR", variant: "name" },
              { text: "**Subscapularis**, contractile", variant: "tissue" },
              "Same position; resist outward into ER",
              "Pain or weakness",
              {
                text: "**Rules in, cannot rule out**\n[[src|lift-off Sn 33 · Sp 94 · bear hug Sn 55 · Sp 94]]",
                variant: "num",
              },
            ],
            [
              { text: "Resisted abduction", variant: "name" },
              { text: "**Supraspinatus**, contractile, at the angle where the tendon is least shortened", variant: "tissue" },
              "Abduct 15°, stabilize the top of the shoulder, apply an adduction force",
              "Pain or weakness",
              {
                text: "**Small shift**\n[[src|Sn 44 · Sp 90 · +LR 4.20]]",
                variant: "num",
              },
            ],
            { group: "Full-thickness tear — which tendon is gone" },
            [
              { text: "Drop arm", variant: "name" },
              { text: "**Supraspinatus** under eccentric load, with infraspinatus assisting the lower", variant: "tissue" },
              "Passive 90° abduction + IR, patient holds, then lowers slowly",
              "Arm drops, or loses smooth eccentric control",
              {
                text: "**Rules in, cannot rule out**\n[[src|Sn 21 · Sp 92 · +LR 2.62]]",
                variant: "num",
              },
            ],
            [
              { text: "ER lag sign", variant: "name" },
              { text: "**Infraspinatus** (posterior supraspinatus contributes at this angle)", variant: "tissue" },
              "Elbow 90°, shoulder abducted 20°, maximal ER, patient holds",
              "Arm falls back into internal rotation",
              {
                text: "**Large shift when positive**\n[[src|Sn 56 · Sp 98]]",
                variant: "num",
              },
            ],
            [
              { text: "Hornblower's sign", variant: "name" },
              { text: "**Teres minor**, with infraspinatus — the ER pair that fails last", variant: "tissue" },
              "90° scaption, elbow 90°, ER against resistance",
              "Cannot externally rotate; may abduct to compensate",
              {
                text: "**Large shift, narrow population**\n[[src|Sn 100 · Sp 93, but n=54 surgical patients with severe disease]]",
                variant: "num",
              },
            ],
            [
              { text: "IR lag sign", variant: "name" },
              { text: "**Subscapularis** — the only cuff muscle that can hold the hand off the back", variant: "tissue" },
              "Hand behind back, examiner lifts it off, patient holds",
              "Cannot keep the hand off the back; pain",
              {
                text: "**No verified source**\n[[src|not checked against a primary study]]",
                variant: "num",
              },
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
              {
                text: "**Not worth doing alone**\n[[src|Sn 20-69 · Sp 55-88 · every +LR under 2.3]]",
                variant: "num",
              },
            ],
            [
              { text: "Biceps Load II", variant: "name" },
              { text: "**Superior labrum at the biceps anchor** — the long head pulls directly on the lesion", variant: "tissue" },
              "120° abduction, elbow 90°, forearm supinated, end-range ER; resist elbow flexion",
              "Deep shoulder pain with the resisted flexion",
              {
                text: "**Contested — do not trust the headline**\n[[src|originator Sn 90 · Sp 97; replication Sn 28-30]]",
                variant: "num",
              },
            ],
            [
              { text: "Sulcus sign", variant: "name" },
              {
                text: "**Superior capsule and rotator interval** resisting inferior translation; a resting sulcus also suggests a torn superior labrum",
                variant: "tissue",
              },
              "Seated, grasp the elbow, inferior traction; measure acromion to humeral head in cm; repeat supine at 20° abduction",
              "Visible sulcus / inferior laxity",
              {
                text: "**Rules in, cannot rule out**\n[[src|Sn 28 · Sp 97]]",
                variant: "num",
              },
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
              {
                text: "**Large shift when positive**\n[[src|apprehension DOR 53.6 · surprise Sn 64 · Sp 99]]",
                variant: "num",
              },
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
              {
                text: "**No verified source**\n[[src|not checked against a primary study]]",
                variant: "num",
              },
            ],
            { group: "Acromioclavicular joint" },
            [
              { text: "AC shear", variant: "name" },
              { text: "**AC joint capsule and intra-articular disc**", variant: "tissue" },
              "Cupped hands over the clavicle and the spine of the scapula, squeeze",
              "Local pain at the joint line, not referred",
              {
                text: "**Contested — studies disagree on direction**\n[[src|cross-body Sn 77 · Sp 79, but pooled +LR 0.86]]",
                variant: "num",
              },
            ],
          ],
        },
        { kind: "heading", text: "Where the studies disagree" },
        {
          kind: "lede",
          text: "These are the tests whose published accuracy moves so much between studies that quoting one number would be misleading. The pattern in the last three is worth naming: the study that introduced the test reports excellent accuracy, and independent replication does not reproduce it.",
        },
        {
          kind: "table",
          columns: ["Test", "What different studies found", "What to make of it"],
          rows: [
            [
              { text: "Painful arc", variant: "name" },
              "Sensitivity 0.33 in one study and 0.76 in another, against similar reference standards",
              "Sensitivity that swings by half means a negative result carries no reliable weight. Keep it as a cluster component.",
            ],
            [
              { text: "Cross-body adduction", variant: "name" },
              "+LR 3.67 in the original AC study; a later systematic review pooled it at 0.86",
              "The two disagree about *direction*, not just size — one says a positive argues for AC pathology, the other says slightly against.",
            ],
            [
              { text: "O'Brien active compression", variant: "name" },
              "Sensitivity from 0.39 to 1.00 and specificity from 0.10 to 0.98 across studies; pooled diagnostic odds ratio 1.19",
              "A pooled odds ratio of about 1 means no diagnostic value for SLAP lesions. The wide textbook ranges should not be reproduced without this.",
            ],
            [
              { text: "Crank test", variant: "name" },
              "Originating study +LR 13.6; independent replications 1.06 to 1.48; sensitivity from 0.09 to 0.91",
              "Classic originator-replication gap. Use the replication figures.",
            ],
            [
              { text: "Biceps Load II", variant: "name" },
              "Originating study sensitivity 0.90; independent studies 0.28–0.30",
              "One of the largest originator-replication gaps in the shoulder literature.",
            ],
            [
              { text: "Anterior slide", variant: "name" },
              "Sensitivity from 0.10 to 1.00; pooled +LR 0.67",
              "A pooled +LR below 1 means a positive test argues slightly *against* the diagnosis. Not usable as published.",
            ],
          ],
        },
        {
          kind: "footnote",
          text: "The labral tests are the weakest group in the section, and the systematic reviews say so directly: no single test is sensitive or specific enough to determine the presence of a SLAP lesion, and the impressive figures all come from low-quality studies by the authors who introduced the test. [[src|Dessaur & Magarey 2008; Gismervik 2017]]",
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
    "**About this guide.** The examination sequence, the organizing structure and all diagrams are original. Clinical values are drawn from the published sources named inline, principally: AAOS *Joint Motion* (1965) and Gill et al. (2020) for range of motion; Inman et al. (1944), Poppen & Walker (1976) and Ludewig et al. (2009) for shoulder complex kinematics; Cooperstein et al. (2015) for scapular landmark levels; Kircher et al. (2017) and Chalmers et al. (2019) for glenoid inclination; Konieczka et al. (2017) for humeral head palpation reliability; Sahrmann for the movement-system criteria marked as convention; Lin et al. (2007) for the glenohumeral resting position; Lewis & Valentine (2007), Borstad (2008), Rosa et al. (2016), Hall et al. (2020) and Dawood et al. (2018) for muscle length testing; Kelly et al. (1996), Boettcher et al. (2009) and Henderson et al. (2021) for manual muscle testing; Vanhoutte et al. (2012) and O'Neill et al. (2017) for the grading scale; Jenp et al. (1996) and Walch et al. (1998) for rotator cuff differentiation; Park et al. (2005), Hegedus et al. (2008, 2012), Alqunaee et al. (2012), Dessaur & Magarey (2008), Lo et al. (2004) and Chronopoulos et al. (2004) for diagnostic accuracy; Jaeschke et al. (1994) for likelihood ratio bands; Wilk et al. (2011) for rotational deficit thresholds; and McClure & Michener (2015) for the irritability framework. Where a value in common circulation could not be traced to a primary source, it is marked as convention rather than presented as data. Reviewed against the literature in September 2026 — clinical evidence moves, so re-check anything load-bearing before relying on it after roughly a year. This is an educational aid, not clinical guidance: it is written for students learning an examination sequence, it does not replace supervised instruction or current practice guidelines, and no part of it should be used to make a treatment decision on its own.",

};
