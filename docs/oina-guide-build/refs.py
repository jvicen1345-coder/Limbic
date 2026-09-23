# -*- coding: utf-8 -*-
"""Every source the OINA guide cites: key -> exact StatPearls chapter title.

resolve.py looks each title up in PubMed and writes refs.json (authors, year, PMID, NBK
accession). build.py reads only refs.json, so a build never touches the network.

Groups are the reference-list headings, in page order.

The template's citation linker resolves "Surname Year" to the first reference entry carrying
that name and year, from any author position. A chapter whose author list and year repeat
another's (or sit wholly inside an earlier one's) can therefore never be linked to on its own,
and was dropped for a broader chapter covering the same muscle: Pronator Teres, Hand Opponens
Pollicis, Orbicularis Oris, Teres Minor, Gastrocnemius, Extensor Hallucis Longus, Buccinator,
Thigh Quadriceps, Hand Hypothenar Eminence and Calf Flexor Hallucis Longus. build.py checks every remaining name.
"""

GROUPS = [
    ("Manual muscle testing and grading", [
        ("grading", "Muscle Strength Grading"),
    ]),
    ("Shoulder girdle and arm", [
        ("trapezius", "Anatomy, Back, Trapezius"),
        ("levscap", "Anatomy, Head and Neck, Levator Scapulae Muscles"),
        ("rhomboid", "Anatomy, Back, Rhomboid Muscles"),
        ("serratus", "Anatomy, Thorax, Serratus Anterior Muscles"),
        ("pectoral", "Anatomy, Shoulder and Upper Limb, Pectoral Muscles"),
        ("thoraxm", "Anatomy, Thorax, Muscles"),
        ("deltoid", "Anatomy, Shoulder and Upper Limb, Deltoid Muscle"),
        ("cuff", "Anatomy, Rotator Cuff"),
        ("supra", "Anatomy, Shoulder and Upper Limb, Arm Supraspinatus Muscle"),
        ("infra", "Anatomy, Shoulder and Upper Limb, Infraspinatus Muscle"),
        ("subscap", "Anatomy, Shoulder and Upper Limb, Subscapularis Muscle"),
        ("tmajor", "Anatomy, Shoulder and Upper Limb, Teres Major Muscle"),
        ("lat", "Anatomy, Back, Latissimus Dorsi"),
        ("pecmajor", "Anatomy, Thorax, Pectoralis Major Major"),
        ("armm", "Anatomy, Shoulder and Upper Limb, Arm Muscles"),
        ("biceps", "Anatomy, Shoulder and Upper Limb, Biceps Muscle"),
        ("brachialis", "Anatomy, Shoulder and Upper Limb, Brachialis Muscle"),
        ("triceps", "Anatomy, Shoulder and Upper Limb, Triceps Muscle"),
    ]),
    ("Forearm and hand", [
        ("forearm", "Anatomy, Shoulder and Upper Limb, Forearm Muscles"),
        ("brachiorad", "Anatomy, Shoulder and Upper Limb, Forearm Brachioradialis Muscle"),
        ("fcu", "Anatomy, Shoulder and Upper Limb, Forearm Flexor Carpi Ulnaris Muscle"),
        ("fds", "Anatomy, Shoulder and Upper Limb, Hand Flexor Digitorum Superficialis Muscle"),
        ("fdp", "Anatomy, Shoulder and Upper Limb, Hand Flexor Digitorum Profundus Muscle"),
        ("fpl", "Anatomy, Shoulder and Upper Limb, Hand Flexor Pollicis Longus Muscle"),
        ("wristext", "Anatomy, Shoulder and Upper Limb, Wrist Extensor Muscles"),
        ("ecrb", "Anatomy, Shoulder and Upper Limb, Forearm Extensor Carpi Radialis Brevis Muscle"),
        ("ecu", "Anatomy, Shoulder and Upper Limb, Forearm Extensor Carpi Ulnaris Muscle"),
        ("epl", "Anatomy, Shoulder and Upper Limb, Hand Extensor Pollicis Longus Muscle"),
        ("snuffbox", "Anatomy, Shoulder and Upper Limb: Hand Anatomical Snuff Box"),
        ("handm", "Anatomy, Shoulder and Upper Limb, Hand Muscles"),
        ("intrinsic", "Anatomy, Shoulder and Upper Limb, Hand Intrinsic Muscles"),
        ("thenar", "Anatomy, Shoulder and Upper Limb, Hand Thenar Eminence"),
        ("addpol", "Anatomy, Shoulder and Upper Limb, Hand Adductor Pollicis"),
        ("lumbrical", "Anatomy, Shoulder and Upper Limb, Hand Lumbrical Muscles"),
        ("interossei", "Anatomy, Shoulder and Upper Limb, Hand Interossei Muscles"),
    ]),
    ("Hip and thigh", [
        ("iliopsoas", "Anatomy, Bony Pelvis and Lower Limb: Iliopsoas Muscle"),
        ("psoas", "Anatomy, Bony Pelvis and Lower Limb: Psoas Major"),
        ("gmax", "Anatomy, Bony Pelvis and Lower Limb, Gluteus Maximus Muscle"),
        ("gmed", "Anatomy, Bony Pelvis and Lower Limb, Gluteus Medius Muscle"),
        ("gmin", "Anatomy, Bony Pelvis and Lower Limb, Gluteus Minimus Muscle"),
        ("tfl", "Anatomy, Bony Pelvis and Lower Limb: Tensor Fasciae Latae Muscle"),
        ("piriformis", "Anatomy, Bony Pelvis and Lower Limb: Piriformis Muscle"),
        ("gemelli", "Anatomy, Bony Pelvis and Lower Limb, Gemelli Muscles"),
        ("obturator", "Anatomy, Abdomen and Pelvis, Obturator Muscles"),
        ("sartorius", "Anatomy, Bony Pelvis and Lower Limb: Thigh Sartorius Muscle"),
        ("thigh", "Anatomy, Bony Pelvis and Lower Limb: Thigh Muscles"),
        ("antthigh", "Anatomy, Bony Pelvis and Lower Limb: Anterior Thigh Muscles"),
        ("rf", "Anatomy, Abdomen and Pelvis, Rectus Femoris Muscle"),
        ("vl", "Anatomy, Bony Pelvis and Lower Limb: Vastus Lateralis Muscle"),
        ("medthigh", "Anatomy, Bony Pelvis and Lower Limb: Medial Thigh Muscles"),
        ("addmag", "Anatomy, Bony Pelvis and Lower Limb: Thigh Adductor Magnus Muscle"),
        ("gracilis", "Anatomy, Bony Pelvis and Lower Limb: Thigh Gracilis Muscle"),
        ("postthigh", "Anatomy, Bony Pelvis and Lower Limb: Posterior Thigh Muscles"),
        ("hamstring", "Anatomy, Bony Pelvis and Lower Limb, Hamstring Muscle"),
        ("semiten", "Anatomy, Bony Pelvis and Lower Limb: Thigh Semitendinosus Muscle"),
    ]),
    ("Leg and foot", [
        ("antcomp", "Anatomy, Bony Pelvis and Lower Limb: Leg Anterior Compartment"),
        ("ta", "Anatomy, Bony Pelvis and Lower Limb: Tibialis Anterior Muscles"),
        ("latcomp", "Anatomy, Bony Pelvis and Lower Limb: Leg Lateral Compartment"),
        ("fl", "Anatomy, Bony Pelvis and Lower Limb: Calf Peroneus Longus Muscle"),
        ("fb", "Anatomy, Bony Pelvis and Lower Limb, Foot Peroneus Brevis Muscle"),
        ("postcomp", "Anatomy, Bony Pelvis and Lower Limb: Leg Posterior Compartment"),
        ("calf", "Anatomy, Bony Pelvis and Lower Limb: Calf"),
        ("popliteus", "Anatomy, Bony Pelvis and Lower Limb: Popliteus Muscle"),
        ("tp", "Anatomy, Bony Pelvis and Lower Limb: Tibialis Posterior Muscle"),
        ("footm", "Anatomy, Bony Pelvis and Lower Limb, Foot Muscles"),
    ]),
    ("Trunk, back, breathing and pelvic floor", [
        ("abwall", "Anatomy, Anterolateral Abdominal Wall Muscles"),
        ("ql", "Anatomy, Abdomen and Pelvis, Quadratus Lumborum"),
        ("back", "Anatomy, Back, Muscles"),
        ("diaphragm", "Anatomy, Thorax: Diaphragm"),
        ("intercostal", "Anatomy, Thorax, Intercostal Nerves"),
        ("pelvicfloor", "Anatomy, Abdomen and Pelvis: Pelvic Floor"),
        ("levani", "Anatomy, Abdomen and Pelvis: Levator Ani Muscle"),
        ("analtri", "Anatomy, Abdomen and Pelvis: Anal Triangle"),
        ("deepperineal", "Anatomy, Abdomen and Pelvis: Deep Perineal Space"),
    ]),
    ("Neck", [
        ("scm", "Anatomy, Head and Neck: Sternocleidomastoid Muscle"),
        ("scalene", "Anatomy, Head and Neck, Scalenus Muscle"),
        ("postcerv", "Anatomy, Head and Neck, Posterior Cervical Region"),
        ("prevert", "Anatomy, Head and Neck, Prevertebral Muscles"),
        ("subocc", "Anatomy, Head and Neck, Suboccipital Muscles"),
        ("platysma", "Anatomy, Head and Neck, Platysma"),
        ("digastric", "Anatomy, Head and Neck, Digastric Muscle"),
        ("suprahyoid", "Anatomy, Head and Neck: Suprahyoid Muscle"),
        ("sternohyoid", "Anatomy, Head and Neck, Sternohyoid Muscle"),
    ]),
    ("Head", [
        ("masseter", "Anatomy, Head and Neck, Masseter Muscle"),
        ("temporal", "Anatomy, Head and Neck, Temporal Region"),
        ("medpt", "Anatomy, Head and Neck, Medial Pterygoid Muscle"),
        ("latpt", "Anatomy, Head and Neck, Lateral Pterygoid Muscle"),
        ("facial", "Anatomy, Head and Neck: Facial Muscles"),
        ("oculi", "Anatomy, Head and Neck: Orbicularis Oculi Muscle"),
        ("eom", "Anatomy, Head and Neck, Eye Extraocular Muscles"),
        ("lps", "Anatomy, Head and Neck: Levator Palpebrae Superioris Muscle"),
        ("tongue", "Anatomy, Head and Neck, Tongue"),
        ("genioglossus", "Anatomy, Head and Neck: Genioglossus Muscle"),
        ("tvp", "Anatomy, Head and Neck, Tensor Veli Palatini Muscle"),
        ("pharynx", "Anatomy, Head and Neck: Pharyngeal Muscles"),
        ("larynx", "Anatomy, Head and Neck: Larynx Muscles"),
        ("middleear", "Anatomy, Head and Neck: Middle Ear"),
    ]),
    ("Spinal cord injury standard", [
        ("isncsci", None),   # carried by hand below: a journal article, not a StatPearls chapter
    ]),
]

# The one non-StatPearls source. Same entry the neurologic guide cites and traced in
# docs/neuro-guide-build/sources.md: the 0-5 motor grades and the ten key muscles.
ISNCSCI = dict(
    authors=["Rupp R", "Biering-Sørensen F", "Burns SP", "Graves DE", "Guest J", "Jones L",
             "Read MS", "Rodriguez GM", "Schuld C", "Tansey-Md KE", "Walden K", "Kirshblum S"],
    title="International Standards for Neurological Classification of Spinal Cord Injury: Revised 2019",
    url="https://pmc.ncbi.nlm.nih.gov/articles/PMC8152171/",
    jo="Top Spinal Cord Inj Rehabil 2021;27(2):1-22",
    year="2021",
    note="Free full text. The 0-5 motor grades used for every manual muscle test here, and the ten key muscle functions per side (C5-T1, L2-S1), tested supine. Its scope is spinal cord injury: it defines the key muscles, not a test for every muscle.",
)
