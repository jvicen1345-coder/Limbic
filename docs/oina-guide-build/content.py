# -*- coding: utf-8 -*-
"""The OINA guide's content outside the muscle tables: the checklist, the numbers, the grading
section, the drill and the two figures. build.py renders all of it into the template.

The muscle tables live in ul.py, ll.py, axial.py and head.py; the relationship tables in
relations.py; the sources in refs.py.
"""
from common import C, X, S

R = S("Rupp 2021")

# ---------------------------------------------------------------- checklist
# (name, how, finding, import-keywords)
CHECK = [
 ("PHASE", "Before any manual muscle test"),
 ("Active range first",
  "Watch the movement actively through its range before you resist it, and measure the range you get.",
  "<b>A muscle can only be graded through the range the joint has.</b> Record a grade through a limited range as such (for example, '4 through 0–90°') — grading a stiff joint as weak is the commonest error in the whole examination. " + C(),
  "active|range|limited|grade"),
 ("Know the 0–5 scale",
  "Learn the six grades by what the muscle has to do, not by adjectives: contraction, range without gravity, range against gravity, then resistance.",
  "<b>0 no contraction; 1 palpable or visible contraction; 2 full range with gravity eliminated; 3 full range against gravity; 4 full range against moderate resistance; 5 full range against full resistance</b> " + R + ". Plus and minus modifiers (3+, 4−) are added by convention and are applied inconsistently between texts. " + C(),
  "grade|gravity|resistance|contraction"),
 ("Against gravity decides the path",
  "Test in the against-gravity position first. If the patient cannot complete the range, reposition gravity-minimized; if they can, add resistance.",
  "<b>Grade 3 is the branch point</b>: below it you test without gravity, above it you test against your hand. Positioning every patient gravity-minimized first wastes the visit. " + C(),
  "gravity|position|minimized|branch"),
 ("Stabilize proximally",
  "Fix the segment the muscle arises from with your other hand or the table, so the tested segment moves and nothing else does.",
  "<b>Without stabilization the strongest muscle nearby does the test</b> — the pelvis tilts in a hip test, the scapula moves in a shoulder test. The finding is movement of the stabilized segment. " + C(),
  "stabilize|proximal|segment|substitution"),
 ("Break test",
  "Patient holds the end position; you build pressure gradually over about two seconds and try to move the segment out of it.",
  "<b>A held position that yields is a 4; one that does not is a 5.</b> A make test (patient pushes against your fixed hand) is the alternative; the two give different forces and should not be mixed in one record. " + C(),
  "break|hold|pressure|make"),
 ("Resistance where it counts",
  "Resist at the distal end of the segment the muscle moves, perpendicular to it, never across a second joint.",
  "<b>A long lever makes your hand stronger than the patient</b>; resistance across two joints tests two muscle groups. Record where you resisted if you deviate from the standard point. " + C(),
  "distal|resist|lever|joint"),
 ("Watch for substitution",
  "Name, before you test, the muscle most likely to fake the movement — the last column of every table — and watch for it.",
  "<b>The substitution changes the direction of the movement, not just its quality</b>: shoulder abduction that drifts into flexion, hip flexion that rolls out. See the 'What fakes it' column. " + C(),
  "substitution|compensation|direction|fakes"),
 ("Compare sides and record pain",
  "Test the uninvolved side first, then the involved side, and note pain with each contraction.",
  "<b>Weak and painful is not weak</b> — pain inhibits force and a painful muscle cannot be graded as if it were a nerve problem. Record 'strong and painful', 'weak and painless' and so on. " + C(),
  "painful|weak|compare|record"),
 ("Know the ceiling",
  "When the difference between grade 4 and 5 matters — return to sport, serial measurement — use a hand-held dynamometer instead.",
  "<b>Grades 4 and 5 cover most of a muscle's force range</b>, and a hand cannot separate them reliably; a strong patient beats an examiner at the hip, knee and ankle. " + C(),
  "dynamometer|ceiling|strong|measure"),
 ("PHASE", "Upper quarter — know each group cold"),
 ("Scapular stabilizers",
  "Trapezius in three parts, serratus anterior, rhomboids, levator scapulae, pectoralis minor.",
  "<b>Upward rotation is a three-muscle force couple</b> (upper and lower trapezius, serratus anterior). Serratus loss wings medially; trapezius loss wings laterally.",
  "trapezius|serratus|winging|scapula"),
 ("Deltoid and the rotator cuff",
  "Three parts of deltoid; supraspinatus, infraspinatus, teres minor, subscapularis.",
  "<b>Deltoid moves the arm; the cuff holds the head down while it does.</b> Axillary nerve: deltoid and teres minor. Suprascapular: supraspinatus and infraspinatus.",
  "deltoid|rotator|axillary|suprascapular"),
 ("The three adductor–medial rotators",
  "Latissimus dorsi, teres major, pectoralis major — the intertubercular groove.",
  "<b>Lady between two majors</b>: latissimus in the floor, pectoralis major on the lateral lip, teres major on the medial lip.",
  "latissimus|pectoralis|groove|adductor"),
 ("Elbow flexors and extensors",
  "Biceps, brachialis, brachioradialis; triceps and anconeus.",
  "<b>Forearm position picks the flexor</b>: supinated biceps, neutral brachioradialis, any position brachialis. Elbow flexors are C5, extensors C7 " + R + ".",
  "biceps|brachialis|brachioradialis|triceps"),
 ("Forearm rotators",
  "Supinator and biceps; pronator teres and pronator quadratus.",
  "<b>Biceps is the strongest supinator at 90° of elbow flexion</b>; pronator quadratus pronates in any elbow position.",
  "supinator|pronator|forearm|rotation"),
 ("Wrist flexors and extensors",
  "FCR, palmaris longus, FCU from the medial epicondyle; ECRL, ECRB, ECU from the lateral side.",
  "<b>Keep the fingers relaxed</b> or the finger muscles move the wrist. Wrist extensors are the C6 key muscle " + R + ".",
  "wrist|epicondyle|extensor|flexor"),
 ("Long finger and thumb muscles",
  "FDS, FDP, FPL; extensor digitorum, indicis, digiti minimi; APL, EPB, EPL.",
  "<b>FDS flexes the PIP, FDP the DIP.</b> FDP to the middle finger is the C8 key muscle " + R + ". Tenodesis fakes every one of these tests.",
  "superficialis|profundus|pollicis|tenodesis"),
 ("Hand intrinsics",
  "Thenar, hypothenar, adductor pollicis, lumbricals, dorsal and palmar interossei.",
  "<b>LOAF are median; everything else is ulnar.</b> PAD and DAB about the middle finger. Little finger abduction is the T1 key muscle " + R + ".",
  "thenar|interossei|lumbricals|ulnar"),
 ("PHASE", "Lower quarter — know each group cold"),
 ("Hip flexors",
  "Iliopsoas, with rectus femoris, sartorius, TFL and pectineus assisting.",
  "<b>Hip flexors are the L2 key muscle</b> " + R + ". Thigh rolling out is sartorius; rolling in is TFL.",
  "iliopsoas|flexion|sartorius|femoral"),
 ("Gluteals and TFL",
  "Gluteus maximus, medius, minimus; tensor fasciae latae.",
  "<b>Knee flexed takes the hamstrings out of the gluteus maximus test.</b> Superior gluteal nerve loss gives the Trendelenburg sign; inferior gluteal loss, trouble rising and climbing.",
  "gluteus|trendelenburg|gluteal|abduction"),
 ("Deep six lateral rotators",
  "Piriformis, superior gemellus, obturator internus, inferior gemellus, quadratus femoris, obturator externus.",
  "<b>Tested only as a group</b>, in sitting. Obturator externus is the one on the obturator nerve.",
  "piriformis|gemellus|obturator|rotator"),
 ("Quadriceps and hamstrings",
  "Four quadriceps heads; semitendinosus, semimembranosus, biceps femoris long and short heads.",
  "<b>Knee extensors are the L3 key muscle</b> " + R + ". Short head of biceps is the one hamstring on the common fibular division.",
  "quadriceps|hamstrings|femoris|biceps"),
 ("Adductors and the pes anserinus",
  "Adductor longus, brevis, magnus, pectineus, gracilis; sartorius, gracilis and semitendinosus at the pes.",
  "<b>Pes anserinus: three muscles, three compartments, three nerves</b> (femoral, obturator, tibial). Adductor magnus has two nerves.",
  "adductor|gracilis|anserinus|obturator"),
 ("Anterior and lateral leg",
  "Tibialis anterior, EHL, EDL, fibularis tertius; fibularis longus and brevis.",
  "<b>Dorsiflexors are L4, long toe extensors L5</b> " + R + ". Foot drop with eversion spared is deep fibular; with eversion weak, common fibular.",
  "tibialis|fibularis|dorsiflexion|eversion"),
 ("Posterior leg",
  "Gastrocnemius, soleus, plantaris, popliteus, tibialis posterior, FDL, FHL.",
  "<b>Plantarflexors are S1</b> " + R + ", and are tested standing because a hand cannot break them.",
  "gastrocnemius|soleus|plantarflexion|posterior"),
 ("Foot intrinsics",
  "Two dorsal muscles (EDB, EHB); four plantar layers on the medial and lateral plantar nerves.",
  "<b>Most are observed, not graded.</b> EDB wasting is an early deep fibular or L5 sign.",
  "plantar|intrinsic|brevis|layers"),
 ("PHASE", "Trunk, neck and head"),
 ("Abdominals",
  "Rectus abdominis, external and internal obliques, transversus abdominis, pyramidalis.",
  "<b>Grade by arm position, not by your hand.</b> Rotation to one side uses the opposite external and the same-side internal oblique.",
  "abdominis|oblique|transversus|curl"),
 ("Back and quadratus lumborum",
  "Erector spinae (I Love Spaghetti), transversospinalis, quadratus lumborum.",
  "<b>Stabilize the legs</b> or gluteus maximus lifts the trunk. Quadratus lumborum hikes the pelvis against traction.",
  "erector|multifidus|quadratus|extension"),
 ("Neck flexors and extensors",
  "SCM, scalenes, longus colli and capitis, splenius, semispinalis, suboccipitals.",
  "<b>A strong head lift says nothing about the deep flexors</b> — the craniocervical flexion test does. SCM turns the face to the opposite side.",
  "sternocleidomastoid|longus|craniocervical|splenius"),
 ("Breathing and pelvic floor",
  "Diaphragm, intercostals, accessory muscles; levator ani, coccygeus, sphincters.",
  "<b>Diaphragm is C3–C5.</b> Voluntary anal contraction is part of the spinal cord injury examination " + R + ".",
  "diaphragm|phrenic|pelvic|levator"),
 ("Mastication and the face",
  "Masseter, temporalis, pterygoids (CN V3); muscles of facial expression (CN VII).",
  "<b>Jaw deviates toward the weak lateral pterygoid.</b> A forehead that moves means an upper motor neuron facial palsy; a still forehead means lower.",
  "masseter|pterygoid|facial|forehead"),
 ("Eye, tongue, palate and larynx",
  "Extraocular muscles (III, IV, VI), tongue (XII), palate and pharynx (IX, X), larynx (X).",
  "<b>LR6 SO4, the rest 3.</b> Tongue deviates toward the weak side; the uvula away from it.",
  "extraocular|tongue|uvula|larynx"),
 ("PHASE", "Putting it together"),
 ("Myotome screen",
  "Test the ten ISNCSCI key muscle functions per side, supine, as a screen before regional testing.",
  "<b>C5 elbow flexors, C6 wrist extensors, C7 elbow extensors, C8 middle finger DIP flexion, T1 little finger abduction; L2 hip flexors, L3 knee extensors, L4 ankle dorsiflexors, L5 long toe extensors, S1 ankle plantar flexors</b> " + R + ".",
  "myotome|key muscle|isncsci|level"),
 ("Root versus peripheral nerve",
  "When a group is weak, check the muscles that share its root but not its nerve, and its nerve but not its root.",
  "<b>A root lesion crosses nerve boundaries; a nerve lesion crosses root boundaries.</b> Foot drop with weak inversion (tibialis posterior, L5 via the tibial nerve) is L5; with inversion intact it is the fibular nerve. See the Nerves table.",
  "root|peripheral|pattern|localize"),
 ("Force couples and synergists",
  "For every weak muscle, name its partner in the couple and its usual substitute.",
  "<b>The failure of a force couple has a shape</b> — winging, superior humeral migration, Trendelenburg — which the Together table lists.",
  "force couple|synergist|partner|pattern"),
]

# ---------------------------------------------------------------- numbers
NUMBERS = [
 ("0–5", "the motor grades — no contraction, flicker, range without gravity, range against gravity, moderate resistance, full resistance " + R),
 ("grade 3", "full range against gravity: the line between a muscle that moves a limb and one that can resist " + R),
 ("10", "key muscle functions per side in the spinal cord injury examination, C5–T1 and L2–S1, tested supine " + R),
 ("C5", "elbow flexors " + R),
 ("C6", "wrist extensors " + R),
 ("C7", "elbow extensors " + R),
 ("C8", "finger flexors — distal phalanx of the middle finger " + R),
 ("T1", "small finger abductors " + R),
 ("L2", "hip flexors " + R),
 ("L3", "knee extensors " + R),
 ("L4", "ankle dorsiflexors " + R),
 ("L5", "long toe extensors " + R),
 ("S1", "ankle plantar flexors " + R),
 ("4", "rotator cuff tendons — three on the greater tubercle, one (subscapularis) on the lesser " + C()),
 ("6", "deep lateral rotators of the hip, tested only as a group " + C()),
 ("3", "muscles of the pes anserinus, from three compartments on three nerves " + C()),
]

# ---------------------------------------------------------------- grading section
METHOD = dict(
    id="grading", nav="Grading",
    title="How a manual muscle test is graded",
    lede="""The international spinal cord injury standard defines six motor grades by what the
      muscle has to do, and every test in this guide is graded on them. The finer steps between
      them (3+, 4−) are added by convention and used differently in different texts, so record
      what the patient did alongside the number.""",
    rows=[
     ("0", "No contraction.", "<b>Total paralysis</b> — nothing visible or palpable over the muscle or its tendon " + R + "."),
     ("1", "Contraction without movement.", "<b>A palpable or visible contraction</b> — feel the tendon or belly while the patient tries " + R + "."),
     ("2", "Full range, gravity eliminated.", "<b>Active movement through the full range with gravity eliminated</b> — the gravity-minimized position in each muscle row " + R + ". A 2− moves through part of the range. " + C()),
     ("3", "Full range against gravity.", "<b>Active movement through the full range against gravity</b>, with no added resistance " + R + ". A 3− gets more than half the range against gravity. " + C()),
     ("4", "Full range against moderate resistance.", "<b>Holds against moderate resistance in the muscle-specific position</b> " + R + ", then yields to a break test. " + C()),
     ("5", "Full range against full resistance.", "<b>Normal: full resistance expected from an otherwise unimpaired person</b> " + R + ". Judged against the other side and the patient's build, age and sex — it is a comparison, not an absolute force."),
     ("NT", "Not testable.", "<b>Record NT</b> when pain, immobilization or a contracture prevents testing, rather than guessing a grade " + R + "."),
     ("Make vs break", "Two ways to apply resistance.", "<b>Break test</b>: patient holds, examiner pushes until it gives. <b>Make test</b>: patient pushes against a fixed hand. They produce different forces; use one method consistently. " + C()),
     ("Gravity-minimized", "Moving in the horizontal plane.", "<b>The limb moves parallel to the floor</b>, supported on a table or in sidelying, so gravity neither helps nor resists. Each muscle row gives the position. " + C()),
     ("Screening versus grading", "Two different jobs.", "<b>A strength screen asks 'normal or not' at the ten key muscles; grading asks 'how weak'</b> of the muscles the screen implicated. The review of grading systems is " + S("Naqvi 2025") + "."),
    ],
)

# ---------------------------------------------------------------- drill
DRILL = [
 ("Which three muscles form the scapular upward rotation force couple, and what does each pull?",
  "<b>Upper trapezius</b> (acromion up and in), <b>lower trapezius</b> (root of the spine down and in), <b>serratus anterior</b> (inferior angle forward and out). Together they rotate the glenoid upward.",
  "trapezius|serratus|rotation|couple"),
 ("A patient's scapula lifts off the ribs at its medial border when they push against a wall. Which nerve?",
  "<b>Long thoracic (C5–C7)</b> — serratus anterior. Lateral winging with a drooped shoulder would be the spinal accessory nerve.",
  "long thoracic|serratus|winging|medial"),
 ("Name the rotator cuff muscles in the order of their insertion on the greater tubercle, and the odd one out.",
  "<b>Supraspinatus, infraspinatus, teres minor</b> (superior, middle, inferior facets); <b>subscapularis</b> inserts on the lesser tubercle.",
  "supraspinatus|infraspinatus|tubercle|subscapularis"),
 ("Which elbow flexor are you biasing with the forearm in mid-position, and which nerve supplies it?",
  "<b>Brachioradialis — radial nerve.</b> Biceps and brachialis are on the musculocutaneous nerve.",
  "brachioradialis|radial|neutral|flexor"),
 ("How do you stop FDP from contributing to an FDS test?",
  "<b>Hold every other finger in full extension</b> — FDP's tendons share a common belly and cannot flex one finger alone — and watch that the DIP stays floppy.",
  "superficialis|profundus|extension|finger"),
 ("What is Froment's sign, and which muscle is it substituting for?",
  "<b>Thumb IP flexion when pinching paper</b> — flexor pollicis longus (median) substituting for a weak adductor pollicis (ulnar).",
  "froment|adductor|pollicis|ulnar"),
 ("Which hand intrinsics are on the median nerve?",
  "<b>LOAF</b>: lumbricals 1–2, opponens pollicis, abductor pollicis brevis, flexor pollicis brevis (superficial head). Everything else is ulnar.",
  "median|lumbricals|opponens|thenar"),
 ("Why is gluteus maximus tested with the knee flexed?",
  "<b>Knee flexion shortens the hamstrings</b> so they are too slack to extend the hip — the test then loads gluteus maximus.",
  "gluteus|hamstrings|knee|extension"),
 ("A patient's pelvis drops on the left when they stand on the right leg. Which muscle and nerve?",
  "<b>Right gluteus medius (and minimus) — right superior gluteal nerve (L4–S1).</b> The stance side's abductors hold the opposite side of the pelvis up.",
  "trendelenburg|gluteus medius|superior gluteal|stance"),
 ("Name the pes anserinus muscles and their three nerves.",
  "<b>Sartorius (femoral), gracilis (obturator), semitendinosus (tibial).</b>",
  "sartorius|gracilis|semitendinosus|anserinus"),
 ("Which hamstring is not supplied by the tibial division of the sciatic nerve?",
  "<b>The short head of biceps femoris</b> — common fibular division.",
  "biceps femoris|short head|fibular|hamstring"),
 ("Foot drop with normal inversion: root or nerve?",
  "<b>Fibular nerve.</b> Tibialis posterior (tibial nerve, L4–L5) still inverts. An L5 root lesion weakens inversion too, because it reaches both nerves.",
  "foot drop|inversion|fibular|root"),
 ("Why are the plantarflexors tested with single-leg heel raises rather than by hand?",
  "<b>An examiner's arm cannot break even a weakened plantarflexor</b>, so manual resistance grades nearly everyone 5. Body weight is a load the muscle can fail against.",
  "plantarflexors|heel raise|gastrocnemius|resistance"),
 ("What is Beevor's sign?",
  "<b>The umbilicus moves upward during a curl-up</b> because the lower abdominals are weak and the upper ones are not — a lesion around T10.",
  "beevor|umbilicus|abdominals|curl"),
 ("Which neck muscle turns the face to the opposite side, and what nerve supplies it?",
  "<b>Sternocleidomastoid — spinal accessory nerve (CN XI).</b> Splenius capitis turns it to the same side.",
  "sternocleidomastoid|accessory|rotation|opposite"),
 ("Which way does the jaw deviate with a right trigeminal motor lesion?",
  "<b>To the right</b> — the intact left lateral pterygoid pushes the left condyle forward unopposed.",
  "jaw|pterygoid|trigeminal|deviate"),
 ("A patient with facial weakness can wrinkle the forehead on both sides. Upper or lower motor neuron?",
  "<b>Upper</b> — the forehead has cortical input from both hemispheres, so a central lesion spares it. A Bell's palsy takes the forehead too.",
  "forehead|facial|upper motor neuron|bell"),
 ("Which extraocular muscle is tested by looking in and down, and which nerve supplies it?",
  "<b>Superior oblique — trochlear nerve (CN IV).</b>",
  "superior oblique|trochlear|adduction|depress"),
 ("On saying 'ah', the uvula deviates to the left. Which side is weak?",
  "<b>The right</b> — the intact left side pulls the uvula toward itself (CN X).",
  "uvula|vagus|palate|deviate"),
 ("Name the ten ISNCSCI key muscle functions and their levels.",
  "<b>C5 elbow flexors, C6 wrist extensors, C7 elbow extensors, C8 middle finger flexors, T1 little finger abductors, L2 hip flexors, L3 knee extensors, L4 ankle dorsiflexors, L5 long toe extensors, S1 ankle plantar flexors</b> " + R + ".",
  "key muscle|myotome|isncsci|level"),
]

# ---------------------------------------------------------------- figures
FIG_SCAPULA = '''    <figure>
      <p class="figtitle">Three muscles, three directions, one rotation</p>
      <svg viewBox="0 0 620 330" role="img" aria-label="Upper trapezius pulls the acromion up and toward the spine, lower trapezius pulls the root of the scapular spine down and toward the spine, and serratus anterior pulls the inferior angle forward and outward; the three pulls add up to one upward rotation of the scapula that turns the glenoid toward the ceiling.">
        <defs>
          <marker id="arwS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"></path>
          </marker>
          <marker id="arwH" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--hi)"></path>
          </marker>
        </defs>
        <!-- the spine, as the reference -->
        <line x1="100" y1="30" x2="100" y2="310" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".55"></line>
        <text class="mono" x="100" y="324" text-anchor="middle">SPINE</text>
        <!-- right scapula, posterior view -->
        <path d="M 250 90 L 400 110 L 420 128 L 300 270 Z" fill="currentColor" fill-opacity=".06" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
        <!-- spine of the scapula to the acromion -->
        <line x1="255" y1="128" x2="430" y2="104" stroke="currentColor" stroke-width="3" stroke-linecap="round"></line>
        <!-- upper trapezius: acromion, up and in -->
        <line x1="425" y1="100" x2="360" y2="44" stroke="var(--accent)" stroke-width="2.4" marker-end="url(#arwS)"></line>
        <text x="372" y="30">Upper trap</text>
        <!-- lower trapezius: root of the spine, down and in -->
        <line x1="255" y1="132" x2="190" y2="200" stroke="var(--accent)" stroke-width="2.4" marker-end="url(#arwS)"></line>
        <text x="150" y="230">Lower trap</text>
        <!-- serratus anterior: inferior angle, forward and out -->
        <line x1="302" y1="268" x2="382" y2="296" stroke="var(--accent)" stroke-width="2.4" marker-end="url(#arwS)"></line>
        <text x="392" y="304">Serratus</text>
        <!-- the resulting rotation, at the glenoid -->
        <path d="M 470 200 A 70 70 0 0 0 470 110" fill="none" stroke="var(--hi)" stroke-width="2" marker-end="url(#arwH)"></path>
        <text x="498" y="160" fill="var(--hi)">Glenoid up</text>
      </svg>
      <div class="figgrid c3">
        <div><span class="lbl">Upper trapezius</span><span class="t1">Pulls the acromion up and toward the spine.</span></div>
        <div><span class="lbl">Lower trapezius</span><span class="t1">Pulls the root of the scapular spine down and toward the spine.</span></div>
        <div><span class="lbl">Serratus anterior</span><span class="t1">Pulls the inferior angle forward and out around the chest wall.</span></div>
      </div>
      <figcaption><b>No single muscle rotates the scapula upward; three pulling in different directions do.</b> The top of the scapula goes up and in, the root of the spine goes down and in, the bottom goes out — so the only thing the scapula can do is turn, carrying the glenoid toward the ceiling as the arm rises. That is why losing any one of them caps elevation, and why each failure wings the scapula differently. Drawn for this guide as a schematic, not to scale.</figcaption>
    </figure>
'''

FIG_INTEROSSEI = '''    <figure>
      <p class="figtitle">Dorsal abduct, palmar adduct — about the middle finger</p>
      <svg viewBox="0 0 620 260" role="img" aria-label="The dorsal interossei move the index, middle and ring fingers away from a line through the middle finger; the palmar interossei move the index, ring and little fingers toward it. The middle finger moves either way by a dorsal interosseous on each side and has no palmar interosseous.">
        <defs>
          <marker id="arwI" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)"></path>
          </marker>
          <marker id="arwJ" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--hi)"></path>
          </marker>
        </defs>
        <!-- panel 1: dorsal interossei, abduction -->
        <text x="150" y="24" text-anchor="middle">Dorsal: DAB</text>
        <rect x="42" y="60" width="24" height="120" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="92" y="44" width="24" height="136" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="142" y="52" width="24" height="128" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="192" y="76" width="24" height="104" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <line x1="104" y1="36" x2="104" y2="200" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".6"></line>
        <line x1="44" y1="110" x2="24" y2="110" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#arwI)"></line>
        <line x1="94" y1="110" x2="74" y2="110" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#arwI)"></line>
        <line x1="114" y1="110" x2="134" y2="110" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#arwI)"></line>
        <line x1="164" y1="110" x2="184" y2="110" stroke="var(--accent)" stroke-width="2.2" marker-end="url(#arwI)"></line>
        <text class="mono" x="54" y="224" text-anchor="middle">INDEX</text>
        <text class="mono" x="204" y="224" text-anchor="middle">LITTLE</text>
        <!-- panel 2: palmar interossei, adduction -->
        <text x="470" y="24" text-anchor="middle">Palmar: PAD</text>
        <rect x="362" y="60" width="24" height="120" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="412" y="44" width="24" height="136" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="462" y="52" width="24" height="128" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <rect x="512" y="76" width="24" height="104" rx="12" fill="none" stroke="currentColor" stroke-width="1.6"></rect>
        <line x1="424" y1="36" x2="424" y2="200" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".6"></line>
        <line x1="390" y1="110" x2="408" y2="110" stroke="var(--hi)" stroke-width="2.2" marker-end="url(#arwJ)"></line>
        <line x1="460" y1="110" x2="442" y2="110" stroke="var(--hi)" stroke-width="2.2" marker-end="url(#arwJ)"></line>
        <line x1="510" y1="110" x2="492" y2="110" stroke="var(--hi)" stroke-width="2.2" marker-end="url(#arwJ)"></line>
        <text class="mono" x="424" y="224" text-anchor="middle">AXIS</text>
      </svg>
      <div class="figgrid c3">
        <div><span class="lbl">Dorsal interossei (4)</span><span class="t1">Abduct away from the middle-finger axis: index outward, middle both ways, ring outward.</span></div>
        <div><span class="lbl">Palmar interossei (3)</span><span class="t1">Adduct toward the axis: index, ring and little.</span></div>
        <div><span class="lbl">The axis</span><span class="t1">The middle finger. It has two dorsal and no palmar interossei; the thumb and little finger have their own abductors.</span></div>
      </div>
      <figcaption><b>Which way an interosseous moves a finger depends on which side of the middle finger it attaches.</b> Dorsal interossei pull away from the middle-finger axis and palmar interossei pull toward it — so the middle finger, sitting on the axis, needs a dorsal interosseous on each side to move either way. All seven are on the deep branch of the ulnar nerve. Drawn for this guide as a schematic.</figcaption>
    </figure>
'''
