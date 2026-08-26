/** Clinical reference content for Limbic Atlas (see app/(app)/atlas/page.tsx,
 *  components/atlas/AtlasClient.tsx) — one entry per clickable body-map zone, keyed by the
 *  same zone id the SVG regions in components/atlas/AtlasBodyMap.tsx carry as their `id`.
 *  Free readers get a preview (zone name + first key muscle only, see AtlasClient's
 *  paywall); Student/PRO tiers (see lib/session.ts hasClinicalReferenceAccess) get all of
 *  it — same access rule as the rest of the LimbicPRO clinical toolbox. */

export type ZoneContent = {
  name: string;
  keyMuscles: {
    name: string;
    origin: string;
    insertion: string;
    action: string;
    nerve: string;
    rootLevel: string;
  }[];
  commonConditions: {
    name: string;
    mechanism: string;
    boardPearl: string;
  }[];
  specialTests: {
    name: string;
    assesses: string;
    sensitivity: string;
    specificity: string;
    positive: string;
  }[];
  outcomemeasures: {
    name: string;
    description: string;
    mdcOrCutoff: string;
  }[];
  boardPearls: string[];
  comingSoon?: boolean;
};

export const ATLAS_CONTENT: Record<string, ZoneContent> = {
  // ————————————————————— ANTERIOR —————————————————————

  "cervical-anterior": {
    name: "Cervical Spine — Anterior",
    keyMuscles: [
      {
        name: "Sternocleidomastoid",
        origin: "Sternum and clavicle",
        insertion: "Mastoid process",
        action: "Neck flexion and contralateral rotation",
        nerve: "Accessory CN XI and C2-C3",
        rootLevel: "C2-C3",
      },
      {
        name: "Scalenes",
        origin: "Cervical transverse processes",
        insertion: "First and second rib",
        action: "Neck flexion and accessory inspiration",
        nerve: "Cervical plexus",
        rootLevel: "C3-C8",
      },
      {
        name: "Longus Colli",
        origin: "C1-T3 vertebral bodies",
        insertion: "C1-C4 vertebral bodies",
        action: "Cervical flexion and stabilization",
        nerve: "Cervical plexus",
        rootLevel: "C2-C6",
      },
    ],
    commonConditions: [
      {
        name: "Cervical Radiculopathy",
        mechanism: "Foraminal stenosis or disc herniation compressing nerve root",
        boardPearl: "C6 — thumb numbness, biceps weakness. C7 — middle finger, triceps weakness. C8 — little finger, hand intrinsics.",
      },
      {
        name: "Thoracic Outlet Syndrome",
        mechanism: "Compression of brachial plexus or subclavian vessels between scalenes and first rib",
        boardPearl: "Neurogenic type most common — brachial plexus compression. Positive Adson and ROOS tests.",
      },
      {
        name: "Whiplash Associated Disorder",
        mechanism: "Rapid acceleration-deceleration cervical injury — MVA most common",
        boardPearl: "Deep cervical flexor weakness is hallmark finding — cranio-cervical flexion test assesses this.",
      },
    ],
    specialTests: [
      {
        name: "Spurling Test",
        assesses: "Cervical radiculopathy",
        sensitivity: "30%",
        specificity: "93%",
        positive: "Reproduction of arm symptoms with compression and lateral flexion toward affected side",
      },
      {
        name: "Distraction Test",
        assesses: "Cervical radiculopathy",
        sensitivity: "44%",
        specificity: "90%",
        positive: "Relief of arm symptoms with manual distraction",
      },
      {
        name: "Upper Limb Tension Test A",
        assesses: "Median nerve sensitivity",
        sensitivity: "72%",
        specificity: "33%",
        positive: "Reproduction of symptoms with shoulder abduction, ER, elbow extension, wrist and finger extension",
      },
      {
        name: "Adson Test",
        assesses: "Thoracic outlet syndrome",
        sensitivity: "79%",
        specificity: "76%",
        positive: "Diminished radial pulse with head rotation and inspiration",
      },
    ],
    outcomemeasures: [
      { name: "Neck Disability Index", description: "10 items — pain and function", mdcOrCutoff: "Score 0-50 — MDC 7 points" },
      { name: "PSFS", description: "Patient-specific functional scale — 3 activities", mdcOrCutoff: "MDC 2 points per activity" },
    ],
    boardPearls: [
      "C5 nerve root — shoulder abduction weakness, deltoid numbness",
      "C6 — elbow flexion weakness, thumb and index numbness, diminished biceps reflex",
      "C7 — elbow extension weakness, middle finger numbness, diminished triceps reflex",
      "C8 — finger flexion weakness, little finger numbness",
      "Deep cervical flexors assessed with cranio-cervical flexion test — pressure biofeedback unit at 22-28 mmHg",
    ],
  },

  "sternum-chest": {
    name: "Sternum and Chest",
    keyMuscles: [],
    commonConditions: [],
    specialTests: [],
    outcomemeasures: [],
    boardPearls: [],
    comingSoon: true,
  },

  "shoulder-anterior": {
    name: "Anterior Shoulder",
    keyMuscles: [
      {
        name: "Pectoralis Major",
        origin: "Sternum, clavicle, ribs 1-6",
        insertion: "Bicipital groove",
        action: "Shoulder adduction, flexion, internal rotation",
        nerve: "Medial and lateral pectoral",
        rootLevel: "C5-T1",
      },
      {
        name: "Anterior Deltoid",
        origin: "Lateral clavicle",
        insertion: "Deltoid tuberosity",
        action: "Shoulder flexion and internal rotation",
        nerve: "Axillary",
        rootLevel: "C5-C6",
      },
      {
        name: "Subscapularis",
        origin: "Subscapular fossa",
        insertion: "Lesser tubercle",
        action: "Internal rotation",
        nerve: "Subscapular",
        rootLevel: "C5-C6",
      },
      {
        name: "Biceps Long Head",
        origin: "Supraglenoid tubercle",
        insertion: "Radial tuberosity",
        action: "Elbow flexion and supination",
        nerve: "Musculocutaneous",
        rootLevel: "C5-C6",
      },
    ],
    commonConditions: [
      {
        name: "Shoulder Impingement",
        mechanism: "Subacromial space narrowing from poor scapular kinematics and rotator cuff weakness",
        boardPearl: "Hawkins-Kennedy most sensitive. Neer most commonly used. Impingement tests cannot differentiate tear from bursitis.",
      },
      {
        name: "Biceps Tendinopathy",
        mechanism: "Overuse of biceps long head tendon in overhead athletes and laborers",
        boardPearl: "Speed test and Yergason test assess biceps. Speed test — forward flexion with resistance — positive if pain at bicipital groove.",
      },
      {
        name: "Subscapularis Tear",
        mechanism: "Internal rotation force or anterior dislocation",
        boardPearl: "Positive Lift-Off test and Bear Hug test. Napoleon sign for larger tears.",
      },
    ],
    specialTests: [
      {
        name: "Neer Test",
        assesses: "Subacromial impingement",
        sensitivity: "72%",
        specificity: "60%",
        positive: "Pain with passive forward flexion — examiner stabilizes scapula",
      },
      {
        name: "Hawkins-Kennedy",
        assesses: "Subacromial impingement",
        sensitivity: "79%",
        specificity: "59%",
        positive: "Pain with passive internal rotation at 90 degrees flexion",
      },
      {
        name: "Speed Test",
        assesses: "Biceps tendinopathy and SLAP",
        sensitivity: "32%",
        specificity: "75%",
        positive: "Pain at bicipital groove with resisted forward flexion — elbow extended and supinated",
      },
      {
        name: "Lift-Off Test",
        assesses: "Subscapularis integrity",
        sensitivity: "62%",
        specificity: "100%",
        positive: "Inability to lift dorsum of hand away from lower back",
      },
    ],
    outcomemeasures: [
      { name: "DASH", description: "Disabilities of arm shoulder and hand — 30 items", mdcOrCutoff: "0-100 — lower is better — MDC 10.8" },
      { name: "Penn Shoulder Score", description: "Pain, satisfaction, function", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "Rotator cuff tears most common in supraspinatus",
      "Subscapularis — only internal rotator of rotator cuff",
      "Posterior capsule tightness contributes to impingement — sleeper stretch addresses this",
      "GIRD — glenohumeral internal rotation deficit — common in throwing athletes — loss of IR greater than 18 degrees",
    ],
  },

  "biceps-anterior": {
    name: "Anterior Arm — Biceps",
    keyMuscles: [
      {
        name: "Biceps Brachii",
        origin: "Short head — coracoid process. Long head — supraglenoid tubercle",
        insertion: "Radial tuberosity and bicipital aponeurosis",
        action: "Elbow flexion and forearm supination",
        nerve: "Musculocutaneous",
        rootLevel: "C5-C6",
      },
      {
        name: "Brachialis",
        origin: "Anterior distal humerus",
        insertion: "Coronoid process of ulna",
        action: "Elbow flexion — pure flexor regardless of forearm position",
        nerve: "Musculocutaneous",
        rootLevel: "C5-C6",
      },
      {
        name: "Coracobrachialis",
        origin: "Coracoid process",
        insertion: "Medial humerus",
        action: "Shoulder flexion and adduction",
        nerve: "Musculocutaneous",
        rootLevel: "C6-C7",
      },
    ],
    commonConditions: [
      {
        name: "Biceps Tendon Rupture",
        mechanism: "Sudden eccentric load — lifting heavy objects. Distal rupture more common in men over 40.",
        boardPearl: "Popeye deformity with proximal rupture — muscle belly bunches proximally. Hook test for distal biceps rupture.",
      },
      {
        name: "Musculocutaneous Nerve Injury",
        mechanism: "Brachial plexus injury or penetrating trauma",
        boardPearl: "Loss of elbow flexion and forearm supination. Loss of lateral forearm sensation — lateral cutaneous nerve of forearm.",
      },
    ],
    specialTests: [
      {
        name: "Hook Test",
        assesses: "Distal biceps tendon integrity",
        sensitivity: "100%",
        specificity: "100%",
        positive: "Unable to hook finger under biceps tendon at antecubital fossa with active supination",
      },
      {
        name: "Biceps Squeeze Test",
        assesses: "Distal biceps rupture",
        sensitivity: "96%",
        specificity: "100%",
        positive: "No forearm supination when biceps belly is squeezed",
      },
    ],
    outcomemeasures: [{ name: "DASH", description: "Upper extremity function", mdcOrCutoff: "MDC 10.8" }],
    boardPearls: [
      "Brachialis is the workhorse of elbow flexion — not biceps",
      "Biceps supination strength greatest at 90 degrees elbow flexion",
      "C5-C6 root level — diminished biceps reflex in C6 radiculopathy",
    ],
  },

  "elbow-anterior": {
    name: "Elbow — Anterior",
    keyMuscles: [
      {
        name: "Pronator Teres",
        origin: "Medial epicondyle and coronoid process",
        insertion: "Lateral radius",
        action: "Forearm pronation and elbow flexion",
        nerve: "Median",
        rootLevel: "C6-C7",
      },
      {
        name: "Flexor Carpi Radialis",
        origin: "Medial epicondyle",
        insertion: "Base of second and third metacarpal",
        action: "Wrist flexion and radial deviation",
        nerve: "Median",
        rootLevel: "C6-C7",
      },
      {
        name: "Palmaris Longus",
        origin: "Medial epicondyle",
        insertion: "Palmar aponeurosis",
        action: "Wrist flexion",
        nerve: "Median",
        rootLevel: "C7-T1",
      },
    ],
    commonConditions: [
      {
        name: "Medial Epicondylitis",
        mechanism: "Overuse of wrist flexors and pronators — golfer's elbow",
        boardPearl:
          "Pain at medial epicondyle reproduced with resisted wrist flexion and pronation. Different from lateral epicondylitis which involves wrist extensors.",
      },
      {
        name: "UCL Injury",
        mechanism: "Repetitive valgus stress — overhead throwing athletes",
        boardPearl: "Milking maneuver and moving valgus stress test assess UCL. Tommy John surgery reconstructs UCL with palmaris longus or other graft.",
      },
    ],
    specialTests: [
      {
        name: "Valgus Stress Test",
        assesses: "UCL integrity",
        sensitivity: "65%",
        specificity: "60%",
        positive: "Medial joint line pain or laxity with valgus force at 20-30 degrees flexion",
      },
      {
        name: "Moving Valgus Stress Test",
        assesses: "UCL integrity",
        sensitivity: "100%",
        specificity: "75%",
        positive: "Medial elbow pain between 70 and 120 degrees during moving valgus arc",
      },
      {
        name: "Medial Epicondyle Palpation",
        assesses: "Medial epicondylitis",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Tenderness at medial epicondyle reproduced with resisted wrist flexion",
      },
    ],
    outcomemeasures: [
      { name: "DASH", description: "Upper extremity disability", mdcOrCutoff: "MDC 10.8" },
      { name: "PRTEE", description: "Patient rated tennis elbow evaluation", mdcOrCutoff: "0-100 — lower is better" },
    ],
    boardPearls: [
      "Medial epicondyle is the common flexor origin",
      "Cubital tunnel syndrome — ulnar nerve compression at elbow — ring and little finger numbness",
      "Pronator syndrome — median nerve compression by pronator teres — mimics carpal tunnel",
    ],
  },

  "forearm-anterior": {
    name: "Forearm — Anterior",
    keyMuscles: [
      {
        name: "Flexor Digitorum Superficialis",
        origin: "Medial epicondyle and radius",
        insertion: "Middle phalanx digits 2-5",
        action: "PIP flexion",
        nerve: "Median",
        rootLevel: "C7-T1",
      },
      {
        name: "Flexor Digitorum Profundus",
        origin: "Anterior ulna",
        insertion: "Distal phalanx digits 2-5",
        action: "DIP flexion",
        nerve: "Median digits 2-3, Ulnar digits 4-5",
        rootLevel: "C8-T1",
      },
      {
        name: "Flexor Pollicis Longus",
        origin: "Anterior radius",
        insertion: "Distal phalanx thumb",
        action: "Thumb IP flexion",
        nerve: "Anterior interosseous — branch of median",
        rootLevel: "C8-T1",
      },
      {
        name: "Pronator Quadratus",
        origin: "Distal ulna",
        insertion: "Distal radius",
        action: "Forearm pronation",
        nerve: "Anterior interosseous",
        rootLevel: "C8-T1",
      },
    ],
    commonConditions: [
      {
        name: "Carpal Tunnel Syndrome",
        mechanism: "Median nerve compression at carpal tunnel — increased pressure from repetitive wrist flexion or systemic conditions",
        boardPearl:
          "Phalen test — wrist flexion 60 seconds. Tinel sign — percussion over carpal tunnel. Thumb, index, middle finger numbness. Thenar atrophy in severe cases.",
      },
      {
        name: "Anterior Interosseous Syndrome",
        mechanism: "Compression of anterior interosseous nerve — branch of median",
        boardPearl: "Unable to make OK sign — loss of thumb IP and index DIP flexion. No sensory loss — purely motor branch.",
      },
    ],
    specialTests: [
      {
        name: "Phalen Test",
        assesses: "Carpal tunnel syndrome",
        sensitivity: "68%",
        specificity: "73%",
        positive: "Paresthesia in median nerve distribution within 60 seconds of wrist flexion",
      },
      {
        name: "Tinel Sign at Wrist",
        assesses: "Carpal tunnel syndrome",
        sensitivity: "50%",
        specificity: "77%",
        positive: "Tingling in median nerve distribution with percussion over carpal tunnel",
      },
    ],
    outcomemeasures: [
      { name: "DASH", description: "Upper extremity function", mdcOrCutoff: "MDC 10.8" },
      { name: "Boston Carpal Tunnel Questionnaire", description: "Symptom severity and functional status", mdcOrCutoff: "1-5 scale — lower is better" },
    ],
    boardPearls: [
      "FDS — superficialis — middle phalanx. FDP — profundus — distal phalanx. Deeper goes further.",
      "Median nerve — lateral 3.5 fingers. Ulnar nerve — medial 1.5 fingers.",
      "OK sign tests anterior interosseous nerve — FPL and FDP to index",
    ],
  },

  "wrist-hand": {
    name: "Wrist and Hand",
    keyMuscles: [
      {
        name: "Abductor Pollicis Brevis",
        origin: "Scaphoid and trapezium",
        insertion: "Proximal phalanx thumb",
        action: "Thumb abduction",
        nerve: "Median",
        rootLevel: "C8-T1",
      },
      {
        name: "Opponens Pollicis",
        origin: "Trapezium",
        insertion: "First metacarpal",
        action: "Thumb opposition",
        nerve: "Median",
        rootLevel: "C8-T1",
      },
      {
        name: "Dorsal Interossei",
        origin: "Adjacent metacarpals",
        insertion: "Proximal phalanges",
        action: "Finger abduction — DAB",
        nerve: "Ulnar",
        rootLevel: "C8-T1",
      },
      {
        name: "Palmar Interossei",
        origin: "Metacarpals",
        insertion: "Proximal phalanges",
        action: "Finger adduction — PAD",
        nerve: "Ulnar",
        rootLevel: "C8-T1",
      },
      {
        name: "Lumbricals",
        origin: "FDP tendons",
        insertion: "Extensor expansion",
        action: "MCP flexion and IP extension",
        nerve: "Median 1-2, Ulnar 3-4",
        rootLevel: "C8-T1",
      },
    ],
    commonConditions: [
      {
        name: "De Quervain Tenosynovitis",
        mechanism: "Stenosing tenosynovitis of APL and EPB in first dorsal compartment",
        boardPearl: "Positive Finkelstein test — ulnar deviation with thumb in fist. Common in new mothers and racquet sport athletes.",
      },
      {
        name: "Trigger Finger",
        mechanism: "Stenosing tenosynovitis of flexor tendon sheath — A1 pulley most common",
        boardPearl: "Locking or triggering of finger with flexion. Most common in ring finger and thumb.",
      },
      {
        name: "Dupuytren Contracture",
        mechanism: "Fibrosis of palmar fascia — MCP and PIP flexion contracture",
        boardPearl: "Ring and little finger most common. Associated with diabetes, epilepsy, alcoholism. Needle aponeurotomy or surgical release.",
      },
    ],
    specialTests: [
      {
        name: "Finkelstein Test",
        assesses: "De Quervain tenosynovitis",
        sensitivity: "81%",
        specificity: "50%",
        positive: "Pain over first dorsal compartment with ulnar deviation and thumb in fist",
      },
      {
        name: "Watson Test",
        assesses: "Scapholunate instability",
        sensitivity: "69%",
        specificity: "66%",
        positive: "Clunk or pain with radial to ulnar deviation while pressing on scaphoid tubercle",
      },
    ],
    outcomemeasures: [
      { name: "DASH", description: "Upper extremity disability", mdcOrCutoff: "MDC 10.8" },
      { name: "Michigan Hand Questionnaire", description: "Hand specific function and appearance", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "DAB — Dorsal interossei ABduct. PAD — Palmar interossei ADduct.",
      "Ulnar nerve — intrinsic hand muscles except LOAF — Lumbricals 1-2, Opponens pollicis, Abductor pollicis brevis, Flexor pollicis brevis",
      "Claw hand — ulnar nerve injury — ring and little finger clawing from loss of intrinsics",
    ],
  },

  abdominals: {
    name: "Abdominals and Core",
    keyMuscles: [
      {
        name: "Rectus Abdominis",
        origin: "Pubic crest",
        insertion: "Xiphoid process and ribs 5-7",
        action: "Trunk flexion",
        nerve: "Thoracoabdominal",
        rootLevel: "T5-T12",
      },
      {
        name: "External Oblique",
        origin: "Ribs 5-12",
        insertion: "Iliac crest and linea alba",
        action: "Trunk flexion and contralateral rotation",
        nerve: "Thoracoabdominal",
        rootLevel: "T8-T12",
      },
      {
        name: "Internal Oblique",
        origin: "Iliac crest and thoracolumbar fascia",
        insertion: "Ribs 10-12 and linea alba",
        action: "Trunk flexion and ipsilateral rotation",
        nerve: "Thoracoabdominal",
        rootLevel: "T10-L1",
      },
      {
        name: "Transverse Abdominis",
        origin: "Iliac crest, thoracolumbar fascia, ribs 7-12",
        insertion: "Linea alba and pubic crest",
        action: "Increases intra-abdominal pressure — spinal stabilization",
        nerve: "Thoracoabdominal",
        rootLevel: "T7-L1",
      },
    ],
    commonConditions: [
      {
        name: "Core Instability",
        mechanism: "Delayed activation of transverse abdominis and multifidus — associated with chronic low back pain",
        boardPearl: "TrA activates before limb movement in healthy individuals — delayed in LBP. Assessed with pressure biofeedback — draw-in maneuver.",
      },
      {
        name: "Diastasis Recti",
        mechanism: "Separation of rectus abdominis at linea alba — common post-partum",
        boardPearl: "Inter-recti distance greater than 2.5 cm indicates diastasis. Avoid traditional crunches — use TrA activation and progressive loading.",
      },
    ],
    specialTests: [
      {
        name: "Prone Instability Test",
        assesses: "Lumbar segmental instability",
        sensitivity: "61%",
        specificity: "57%",
        positive: "Pain in prone passive assessment relieved when patient lifts legs from table",
      },
      {
        name: "Abdominal Drawing-In",
        assesses: "TrA activation",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Unable to maintain neutral spine with limb loading — pressure biofeedback drops below 40 mmHg",
      },
    ],
    outcomemeasures: [
      { name: "Oswestry", description: "Low back disability", mdcOrCutoff: "0-100% — MDC 10%" },
      { name: "FABQ", description: "Fear avoidance beliefs", mdcOrCutoff: "Work subscale above 34 — high risk" },
    ],
    boardPearls: [
      "TrA is the deepest abdominal layer — primary spinal stabilizer",
      "Hollowing activates TrA — bracing activates all layers",
      "Posterior pelvic tilt — rectus abdominis dominant. Anterior pelvic tilt — hip flexor dominant",
    ],
  },

  "hip-flexors": {
    name: "Hip Flexors",
    keyMuscles: [
      {
        name: "Iliopsoas",
        origin: "Iliac fossa and T12-L5 vertebrae",
        insertion: "Lesser trochanter",
        action: "Hip flexion",
        nerve: "Femoral and lumbar plexus",
        rootLevel: "L1-L3",
      },
      {
        name: "Rectus Femoris",
        origin: "Anterior inferior iliac spine",
        insertion: "Tibial tuberosity via patellar tendon",
        action: "Hip flexion and knee extension",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
      {
        name: "Sartorius",
        origin: "Anterior superior iliac spine",
        insertion: "Pes anserine — medial tibia",
        action: "Hip flexion, abduction, external rotation and knee flexion",
        nerve: "Femoral",
        rootLevel: "L2-L3",
      },
      {
        name: "Tensor Fascia Latae",
        origin: "ASIS and iliac crest",
        insertion: "IT band",
        action: "Hip flexion, abduction, internal rotation",
        nerve: "Superior gluteal",
        rootLevel: "L4-S1",
      },
    ],
    commonConditions: [
      {
        name: "Hip Flexor Strain",
        mechanism: "Explosive hip flexion — sprinting, kicking. Common in soccer and football.",
        boardPearl: "Iliopsoas most commonly strained. Pain with resisted hip flexion and passive stretch into extension. Thomas test assesses hip flexor flexibility.",
      },
      {
        name: "Snapping Hip — Coxa Saltans",
        mechanism: "Iliopsoas tendon snapping over iliopectineal eminence — internal. IT band over greater trochanter — external.",
        boardPearl: "Internal snapping hip — iliopsoas. External — IT band. Intra-articular — labral tear or loose body.",
      },
      {
        name: "Femoral Nerve Injury",
        mechanism: "Compression or stretch of femoral nerve — retroperitoneal hematoma, hip surgery, prolonged lithotomy position",
        boardPearl: "Loss of knee extension and hip flexion. Loss of patellar reflex. Medial thigh and leg sensory loss — saphenous nerve.",
      },
    ],
    specialTests: [
      {
        name: "Thomas Test",
        assesses: "Hip flexor flexibility — iliopsoas and rectus femoris",
        sensitivity: "89%",
        specificity: "92%",
        positive: "Contralateral hip rises from table or ipsilateral knee extends — indicating hip flexor tightness",
      },
      {
        name: "Ely Test",
        assesses: "Rectus femoris tightness",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Spontaneous hip flexion when knee is passively flexed prone — indicates rectus femoris tightness",
      },
    ],
    outcomemeasures: [
      { name: "LEFS", description: "Lower extremity functional scale", mdcOrCutoff: "0-80 — MDC 9" },
      { name: "HOS", description: "Hip outcome score", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "Iliopsoas — only muscle connecting spine to lower extremity",
      "Thomas test — lumbar must flatten — watch for lumbar compensation",
      "L2-L3 root level — hip flexion weakness in upper lumbar disc pathology",
    ],
  },

  "hip-adductors": {
    name: "Hip Adductors — Medial Thigh",
    keyMuscles: [
      {
        name: "Adductor Longus",
        origin: "Body of pubis, inferior to pubic crest",
        insertion: "Middle third of linea aspera",
        action: "Adducts thigh",
        nerve: "Obturator",
        rootLevel: "L2-L4",
      },
      {
        name: "Adductor Magnus",
        origin: "Adductor part — inferior pubic ramus and ischial ramus. Hamstring part — ischial tuberosity",
        insertion: "Adductor part — gluteal tuberosity and linea aspera. Hamstring part — adductor tubercle of femur",
        action: "Adducts thigh — adductor part also flexes, hamstring part extends thigh",
        nerve: "Adductor part — obturator. Hamstring part — tibial division of sciatic",
        rootLevel: "L2-L4",
      },
      {
        name: "Gracilis",
        origin: "Body and inferior ramus of pubis",
        insertion: "Pes anserine — medial tibia",
        action: "Adducts thigh, flexes and medially rotates leg",
        nerve: "Obturator",
        rootLevel: "L2-L3",
      },
      {
        name: "Pectineus",
        origin: "Superior ramus of pubis",
        insertion: "Pectineal line of femur",
        action: "Adducts and flexes thigh",
        nerve: "Femoral — may also receive an obturator branch",
        rootLevel: "L2-L3",
      },
    ],
    commonConditions: [
      {
        name: "Adductor Strain — Groin Strain",
        mechanism: "Forceful or eccentric hip adduction against resistance — cutting, kicking, skating. Adductor longus most frequently involved.",
        boardPearl:
          "Most common groin injury in athletes — soccer, hockey, and football highest risk. Palpate 2-3cm distal to pubic tubercle. Adductor-strengthening programs (Copenhagen adduction exercise) reduce recurrence.",
      },
      {
        name: "Athletic Pubalgia — Sports Hernia",
        mechanism: "Chronic overload at the rectus abdominis-adductor longus aponeurotic complex on the pubis — repetitive twisting and kicking",
        boardPearl:
          "No palpable hernia on exam — distinguishes from true inguinal hernia. Pain with resisted sit-up and resisted hip adduction. Often coexists with adductor-related groin pain — part of the Doha agreement groin pain classification.",
      },
      {
        name: "Osteitis Pubis",
        mechanism: "Repetitive shear stress at the pubic symphysis from opposing adductor and abdominal pull — common in soccer and distance running",
        boardPearl:
          "Focal tenderness directly over the pubic symphysis. Bone marrow edema on MRI. Managed with load modification and combined adductor and core strengthening.",
      },
    ],
    specialTests: [
      {
        name: "Adductor Squeeze Test",
        assesses: "Adductor strain severity and groin pain reproduction",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain or weakness squeezing examiner's fist or a cuff between the knees at 0, 45, and 90 degrees hip flexion",
      },
      {
        name: "Resisted Hip Adduction",
        assesses: "Adductor strain",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain reproduction with resisted hip adduction in supine",
      },
    ],
    outcomemeasures: [
      { name: "HAGOS", description: "Copenhagen hip and groin outcome score", mdcOrCutoff: "0-100 — higher is better" },
      { name: "LEFS", description: "Lower extremity functional scale", mdcOrCutoff: "0-80 — MDC 9" },
    ],
    boardPearls: [
      "Adductor longus — most commonly strained muscle in the groin",
      "Obturator nerve — L2-L4 — innervates the adductor group except adductor magnus's hamstring portion, which runs off the tibial division of the sciatic nerve",
      "Groin pain in athletes is often multifactorial — adductor-related, pubic-related, inguinal-related, and iliopsoas-related categories per the Doha agreement",
    ],
  },

  quadriceps: {
    name: "Quadriceps",
    keyMuscles: [
      {
        name: "Rectus Femoris",
        origin: "AIIS",
        insertion: "Tibial tuberosity",
        action: "Knee extension and hip flexion",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
      {
        name: "Vastus Medialis",
        origin: "Medial linea aspera",
        insertion: "Medial patella and patellar tendon",
        action: "Knee extension — VMO stabilizes patella medially",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
      {
        name: "Vastus Lateralis",
        origin: "Lateral linea aspera",
        insertion: "Lateral patella and patellar tendon",
        action: "Knee extension",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
      {
        name: "Vastus Intermedius",
        origin: "Anterior femur",
        insertion: "Patellar tendon",
        action: "Knee extension",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
    ],
    commonConditions: [
      {
        name: "Patellofemoral Pain Syndrome",
        mechanism: "Lateral patellar maltracking from VMO weakness and hip abductor deficit — increased dynamic valgus",
        boardPearl: "Hip strengthening more effective than isolated quad training. Positive Clarke sign. Painful arc with squatting and stairs.",
      },
      {
        name: "Patellar Tendinopathy",
        mechanism: "Overuse at patellar tendon insertion — jumping athletes",
        boardPearl: "Pain at inferior patellar pole. VISA-P outcome measure. Eccentric and heavy slow resistance training — gold standard.",
      },
      {
        name: "Quadriceps Tendon Rupture",
        mechanism: "Sudden eccentric load — more common in older adults above 40",
        boardPearl: "Unable to extend knee against gravity. Palpable defect above patella. Surgical repair required.",
      },
    ],
    specialTests: [
      {
        name: "Clarke Sign",
        assesses: "Patellofemoral pain",
        sensitivity: "49%",
        specificity: "75%",
        positive: "Pain with resisted quad contraction while examiner compresses patella",
      },
      {
        name: "Patellar Grind Test",
        assesses: "Patellofemoral articular cartilage",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain or crepitus with superior patellar glide and quad contraction",
      },
    ],
    outcomemeasures: [
      { name: "KOOS", description: "Knee injury and OA outcome score", mdcOrCutoff: "0-100 — higher is better" },
      { name: "VISA-P", description: "Patellar tendinopathy severity", mdcOrCutoff: "0-100 — below 80 indicates clinical tendinopathy" },
    ],
    boardPearls: [
      "VMO activates last in quad contraction — most vulnerable to atrophy",
      "L3-L4 root level — patellar reflex. Diminished reflex suggests L4 radiculopathy.",
      "Quad lag — inability to maintain full extension with SLR — indicates quad weakness post knee surgery",
    ],
  },

  "knee-anterior": {
    name: "Knee — Anterior",
    keyMuscles: [
      {
        name: "Quadriceps via Patellar Tendon",
        origin: "Inferior patella",
        insertion: "Tibial tuberosity",
        action: "Knee extension",
        nerve: "Femoral",
        rootLevel: "L2-L4",
      },
      {
        name: "Popliteus",
        origin: "Lateral femoral condyle",
        insertion: "Posterior tibia",
        action: "Unlocks knee from full extension — medial tibial rotation",
        nerve: "Tibial",
        rootLevel: "L4-S1",
      },
    ],
    commonConditions: [
      {
        name: "ACL Tear",
        mechanism: "Non-contact deceleration or valgus collapse — female athletes 2-8x higher risk",
        boardPearl: "Lachman most sensitive — 85%. Pivot Shift most specific — 98%. Immediate hemarthrosis. Positive anterior drawer.",
      },
      {
        name: "Patellar Dislocation",
        mechanism: "Lateral patellar dislocation from valgus force or direct blow — trochlear dysplasia risk factor",
        boardPearl: "Medial retinaculum tear. VMO atrophy predisposes. J-sign — lateral patellar tracking. Apprehension test positive.",
      },
      {
        name: "Osgood-Schlatter Disease",
        mechanism: "Traction apophysitis at tibial tuberosity — adolescent growth spurt",
        boardPearl: "Pain at tibial tuberosity in adolescent athlete. Worse with jumping and running. Self-limiting — resolves with skeletal maturity.",
      },
    ],
    specialTests: [
      {
        name: "Lachman Test",
        assesses: "ACL integrity",
        sensitivity: "85%",
        specificity: "94%",
        positive: "Anterior tibial translation with soft or absent endpoint at 20-30 degrees flexion",
      },
      {
        name: "Anterior Drawer",
        assesses: "ACL integrity",
        sensitivity: "62%",
        specificity: "88%",
        positive: "Anterior tibial translation at 90 degrees flexion",
      },
      {
        name: "Pivot Shift",
        assesses: "ACL rotational instability",
        sensitivity: "24%",
        specificity: "98%",
        positive: "Clunk with combined axial load, valgus, and internal rotation",
      },
      {
        name: "Patellar Apprehension",
        assesses: "Patellar instability",
        sensitivity: "39%",
        specificity: "92%",
        positive: "Apprehension with lateral patellar glide",
      },
    ],
    outcomemeasures: [
      { name: "IKDC", description: "Knee specific function", mdcOrCutoff: "0-100 — MDC 8.7" },
      { name: "KOOS", description: "Knee injury and OA", mdcOrCutoff: "0-100 — higher is better" },
      { name: "ACL-RSI", description: "Psychological readiness for return to sport", mdcOrCutoff: "0-100 — above 65 recommended for return to sport" },
    ],
    boardPearls: [
      "Lachman at 20-30 degrees — most sensitive for ACL",
      "Posterior drawer — PCL. Valgus stress — MCL. Varus stress — LCL.",
      "Q angle — normal 13-18 degrees. Increased Q angle — higher PFPS and dislocation risk.",
    ],
  },

  "anterior-leg": {
    name: "Anterior Leg and Shin",
    keyMuscles: [
      {
        name: "Tibialis Anterior",
        origin: "Lateral tibia",
        insertion: "Medial cuneiform and first metatarsal",
        action: "Dorsiflexion and inversion",
        nerve: "Deep peroneal",
        rootLevel: "L4-L5",
      },
      {
        name: "Extensor Digitorum Longus",
        origin: "Lateral condyle of tibia and fibula",
        insertion: "Dorsal expansion digits 2-5",
        action: "Toe extension and ankle dorsiflexion",
        nerve: "Deep peroneal",
        rootLevel: "L4-L5",
      },
      {
        name: "Extensor Hallucis Longus",
        origin: "Middle fibula",
        insertion: "Distal phalanx great toe",
        action: "Great toe extension and dorsiflexion",
        nerve: "Deep peroneal",
        rootLevel: "L4-L5",
      },
      {
        name: "Peroneus Tertius",
        origin: "Distal fibula",
        insertion: "Fifth metatarsal",
        action: "Dorsiflexion and eversion",
        nerve: "Deep peroneal",
        rootLevel: "L5-S1",
      },
    ],
    commonConditions: [
      {
        name: "Medial Tibial Stress Syndrome",
        mechanism: "Repetitive loading of tibialis posterior and soleus on periosteum — training error",
        boardPearl:
          "Diffuse posteromedial tibial tenderness — distinguishes from stress fracture which has focal tenderness. Common in new runners and military recruits.",
      },
      {
        name: "Anterior Compartment Syndrome",
        mechanism: "Increased compartment pressure after fracture or overuse — reduces perfusion",
        boardPearl: "5 Ps — Pain, Pressure, Paralysis, Paresthesia, Pallor. Pressure above 30 mmHg — surgical emergency — fasciotomy.",
      },
      {
        name: "Foot Drop",
        mechanism: "Common peroneal nerve injury at fibular head — compression or traction",
        boardPearl: "Loss of dorsiflexion and eversion. High steppage gait. Sensory loss dorsal foot. AFO for functional ambulation.",
      },
    ],
    specialTests: [
      {
        name: "Anterior Drawer — Ankle",
        assesses: "ATFL integrity",
        sensitivity: "73%",
        specificity: "97%",
        positive: "Anterior talar translation with foot in plantarflexion",
      },
      {
        name: "Ottawa Ankle Rules",
        assesses: "Fracture probability",
        sensitivity: "99%",
        specificity: "41%",
        positive: "Bony tenderness at malleolus and inability to bear weight 4 steps",
      },
    ],
    outcomemeasures: [
      { name: "LEFS", description: "Lower extremity function", mdcOrCutoff: "0-80 — MDC 9" },
      { name: "FAAM", description: "Foot and ankle ability measure", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "L4 root level — tibialis anterior — dorsiflexion weakness in L4 radiculopathy",
      "L5 root level — EHL — great toe extension weakness",
      "Common peroneal wraps around fibular head — vulnerable to compression from casting or crossing legs",
    ],
  },

  "ankle-foot-anterior": {
    name: "Ankle and Foot",
    keyMuscles: [
      {
        name: "Tibialis Anterior",
        origin: "Lateral tibia",
        insertion: "Medial cuneiform and first metatarsal",
        action: "Dorsiflexion and inversion",
        nerve: "Deep peroneal",
        rootLevel: "L4-L5",
      },
      {
        name: "Peroneus Longus",
        origin: "Lateral fibula",
        insertion: "Medial cuneiform and first metatarsal plantar",
        action: "Eversion and plantarflexion",
        nerve: "Superficial peroneal",
        rootLevel: "L5-S1",
      },
      {
        name: "Peroneus Brevis",
        origin: "Lateral fibula",
        insertion: "Fifth metatarsal base",
        action: "Eversion",
        nerve: "Superficial peroneal",
        rootLevel: "L5-S1",
      },
      {
        name: "Abductor Hallucis",
        origin: "Calcaneal tuberosity",
        insertion: "Proximal phalanx great toe",
        action: "Great toe abduction",
        nerve: "Medial plantar",
        rootLevel: "S1-S2",
      },
    ],
    commonConditions: [
      {
        name: "Lateral Ankle Sprain",
        mechanism: "Inversion and plantarflexion — ATFL most commonly injured",
        boardPearl: "Grade I stretch, Grade II partial tear, Grade III complete tear. Ottawa rules guide imaging. Proprioceptive training prevents recurrence.",
      },
      {
        name: "Plantar Fasciitis",
        mechanism: "Repetitive tensile loading of plantar fascia at calcaneal insertion — tight calf, high arch, or flat foot",
        boardPearl: "Pain worst with first morning steps. Windlass test positive. Night splint for morning pain. Eccentric calf raises.",
      },
      {
        name: "Achilles Tendinopathy",
        mechanism: "Overuse — insertional or mid-portion. Sudden training load increase.",
        boardPearl: "VISA-A outcome measure. Mid-portion — Alfredson eccentric protocol. Insertional — avoid end-range plantarflexion loading.",
      },
    ],
    specialTests: [
      {
        name: "Thompson Test",
        assesses: "Achilles tendon rupture",
        sensitivity: "96%",
        specificity: "93%",
        positive: "No plantarflexion with calf squeeze in prone",
      },
      {
        name: "Talar Tilt Test",
        assesses: "CFL integrity",
        sensitivity: "58%",
        specificity: "93%",
        positive: "Excessive inversion compared to contralateral",
      },
      {
        name: "Windlass Test",
        assesses: "Plantar fasciitis",
        sensitivity: "32%",
        specificity: "100%",
        positive: "Pain at plantar fascia with passive great toe extension and weight bearing",
      },
    ],
    outcomemeasures: [
      { name: "FAAM", description: "Foot and ankle ability measure", mdcOrCutoff: "0-100 — higher is better" },
      { name: "VISA-A", description: "Achilles tendinopathy severity", mdcOrCutoff: "0-100 — below 80 indicates clinical tendinopathy" },
    ],
    boardPearls: [
      "ATFL — most commonly sprained ankle ligament — plantarflexion and inversion",
      "S1 root level — plantarflexion weakness, absent Achilles reflex",
      "Sinus tarsi syndrome — lateral ankle pain after sprain — treated with subtalar mobilization",
    ],
  },

  // ————————————————————— POSTERIOR —————————————————————

  "cervical-posterior": {
    name: "Cervical Spine — Posterior",
    keyMuscles: [
      {
        name: "Upper Trapezius",
        origin: "Occiput and cervical spinous processes",
        insertion: "Lateral clavicle and acromion",
        action: "Scapular elevation and upward rotation",
        nerve: "Accessory CN XI",
        rootLevel: "CN XI",
      },
      {
        name: "Splenius Capitis",
        origin: "C3-T3 spinous processes",
        insertion: "Mastoid process and occiput",
        action: "Neck extension and ipsilateral rotation",
        nerve: "Posterior rami",
        rootLevel: "C2-C3",
      },
      {
        name: "Suboccipitals",
        origin: "C1-C2 and occiput",
        insertion: "Occiput and C1",
        action: "Head extension and rotation — upper cervical",
        nerve: "Suboccipital C1",
        rootLevel: "C1",
      },
      {
        name: "Semispinalis Capitis",
        origin: "C4-T7 transverse processes",
        insertion: "Occiput",
        action: "Head and neck extension",
        nerve: "Posterior rami",
        rootLevel: "C1-C5",
      },
    ],
    commonConditions: [
      {
        name: "Cervicogenic Headache",
        mechanism: "Referred pain from upper cervical structures — C1-C3 — to head",
        boardPearl: "Unilateral head pain starting posteriorly. Positive flexion rotation test — limited rotation toward painful side. Treated with upper cervical manual therapy.",
      },
      {
        name: "Facet Joint Pain",
        mechanism: "Degenerative changes or acute loading of zygapophyseal joints",
        boardPearl: "Pain with extension and rotation. Reproduction with segmental spring testing. Treated with mobilization and stabilization exercise.",
      },
    ],
    specialTests: [
      {
        name: "Flexion Rotation Test",
        assesses: "C1-C2 dysfunction and cervicogenic headache",
        sensitivity: "91%",
        specificity: "90%",
        positive: "Limited rotation in end-range cervical flexion — less than 32 degrees toward symptomatic side",
      },
      {
        name: "Cervical Segmental Spring Test",
        assesses: "Facet joint mobility and pain",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Reproduction of pain or stiffness with posteroanterior pressure on spinous process",
      },
    ],
    outcomemeasures: [
      { name: "NDI", description: "Neck disability index", mdcOrCutoff: "0-50 — MDC 7" },
      { name: "HIT-6", description: "Headache impact test", mdcOrCutoff: "36-78 — above 56 severe impact" },
    ],
    boardPearls: [
      "Upper cervical instability screening before manipulation — Sharp-Purser, alar ligament stress tests",
      "C1-C2 provides 50% of cervical rotation",
      "Suboccipitals — most commonly implicated in tension headache and cervicogenic headache",
    ],
  },

  "upper-trapezius": {
    name: "Upper Trapezius and Posterior Neck",
    keyMuscles: [
      {
        name: "Upper Trapezius",
        origin: "Occiput and ligamentum nuchae",
        insertion: "Lateral clavicle and acromion",
        action: "Scapular elevation and upward rotation",
        nerve: "Accessory CN XI",
        rootLevel: "CN XI",
      },
      {
        name: "Levator Scapulae",
        origin: "C1-C4 transverse processes",
        insertion: "Superior medial scapular border",
        action: "Scapular elevation and downward rotation",
        nerve: "Dorsal scapular and C3-C4",
        rootLevel: "C3-C5",
      },
    ],
    commonConditions: [
      {
        name: "Upper Trapezius Myofascial Pain",
        mechanism: "Sustained posture, repetitive overhead activity, or stress — trigger points in upper trapezius",
        boardPearl: "Trigger point referral pattern — posterior neck and temporal region. Dry needling and manual therapy effective. Address postural causes.",
      },
      {
        name: "Levator Scapulae Strain",
        mechanism: "Sustained end-range cervical rotation or elevation — prolonged computer use",
        boardPearl: "Pain at superior medial scapular angle — levator attachment. Stretch with contralateral lateral flexion and slight rotation away.",
      },
    ],
    specialTests: [
      {
        name: "Upper Trapezius Length Test",
        assesses: "Upper trapezius flexibility",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Restricted contralateral lateral flexion with scapular depression",
      },
    ],
    outcomemeasures: [{ name: "NDI", description: "Neck disability", mdcOrCutoff: "MDC 7 points" }],
    boardPearls: [
      "Upper trap overactivation compensates for lower trap and serratus weakness",
      "Scapular downward rotation syndrome — levator and upper trap dominant — lower trap and serratus inhibited",
      "CN XI — accessory nerve — innervates trapezius and SCM",
    ],
  },

  "thoracic-spine": {
    name: "Thoracic Spine",
    keyMuscles: [
      {
        name: "Erector Spinae",
        origin: "Sacrum, iliac crest, lumbar spinous processes",
        insertion: "Ribs and vertebral transverse processes",
        action: "Spinal extension and lateral flexion",
        nerve: "Posterior rami",
        rootLevel: "T1-L5",
      },
      {
        name: "Rhomboids",
        origin: "C7-T5 spinous processes",
        insertion: "Medial scapular border",
        action: "Scapular retraction and downward rotation",
        nerve: "Dorsal scapular",
        rootLevel: "C4-C5",
      },
      {
        name: "Serratus Anterior",
        origin: "Ribs 1-8 lateral",
        insertion: "Anterior medial scapular border",
        action: "Scapular protraction and upward rotation",
        nerve: "Long thoracic",
        rootLevel: "C5-C7",
      },
      {
        name: "Lower Trapezius",
        origin: "T5-T12 spinous processes",
        insertion: "Spine of scapula",
        action: "Scapular depression and upward rotation",
        nerve: "Accessory CN XI",
        rootLevel: "CN XI",
      },
    ],
    commonConditions: [
      {
        name: "Thoracic Kyphosis",
        mechanism: "Postural — prolonged flexion. Structural — Scheuermann disease, osteoporotic compression fracture.",
        boardPearl: "Postural kyphosis corrects with extension. Structural does not. Scheuermann — anterior vertebral wedging greater than 5 degrees at 3 consecutive levels.",
      },
      {
        name: "Costovertebral Joint Dysfunction",
        mechanism: "Restricted rib motion at thoracic facet and costovertebral joint — painful breathing and trunk rotation",
        boardPearl: "Sharp pain with deep breath or rotation. Spring testing reproduces pain. Rib manipulation or mobilization effective.",
      },
      {
        name: "Thoracic Outlet Syndrome",
        mechanism: "Compression at scalene triangle, costoclavicular space, or pectoralis minor — brachial plexus or vascular",
        boardPearl: "ROOS test — arms at 90 abduction ER for 3 minutes — reproduction of symptoms positive. Neurogenic most common type.",
      },
    ],
    specialTests: [
      {
        name: "Thoracic Spring Test",
        assesses: "Thoracic segmental mobility and pain",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain or stiffness reproduction with PA pressure on thoracic spinous process",
      },
      {
        name: "Rib Spring Test",
        assesses: "Costovertebral joint dysfunction",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain reproduction with PA pressure on posterior rib angle",
      },
    ],
    outcomemeasures: [
      { name: "NDI", description: "Disability including thoracic", mdcOrCutoff: "MDC 7" },
      { name: "PSFS", description: "Patient specific function", mdcOrCutoff: "MDC 2 per activity" },
    ],
    boardPearls: [
      "Thoracic hypomobility contributes to shoulder impingement — thoracic manipulation improves shoulder ROM",
      "Long thoracic nerve injury — serratus anterior palsy — winging scapula",
      "Scheuermann kyphosis — most common structural kyphosis in adolescents",
    ],
  },

  "rotator-cuff-posterior": {
    name: "Posterior Shoulder and Rotator Cuff",
    keyMuscles: [
      {
        name: "Infraspinatus",
        origin: "Infraspinous fossa",
        insertion: "Greater tubercle middle facet",
        action: "External rotation",
        nerve: "Suprascapular",
        rootLevel: "C5-C6",
      },
      {
        name: "Teres Minor",
        origin: "Lateral scapular border",
        insertion: "Greater tubercle inferior facet",
        action: "External rotation",
        nerve: "Axillary",
        rootLevel: "C5-C6",
      },
      {
        name: "Teres Major",
        origin: "Inferior angle of scapula",
        insertion: "Bicipital groove medial lip",
        action: "Internal rotation and adduction",
        nerve: "Lower subscapular",
        rootLevel: "C5-C6",
      },
      {
        name: "Posterior Deltoid",
        origin: "Spine of scapula",
        insertion: "Deltoid tuberosity",
        action: "Shoulder extension and external rotation",
        nerve: "Axillary",
        rootLevel: "C5-C6",
      },
    ],
    commonConditions: [
      {
        name: "Rotator Cuff Tear — Infraspinatus",
        mechanism: "Degenerative — most common in supraspinatus but infraspinatus tears affect external rotation significantly",
        boardPearl: "External rotation lag sign — inability to maintain ER — sensitivity 56%, specificity 98% for full thickness infraspinatus tear.",
      },
      {
        name: "GIRD",
        mechanism: "Posterior capsule tightness from repetitive throwing — loss of IR",
        boardPearl: "Loss of IR greater than 18 degrees compared to non-dominant. Sleeper stretch and cross-body stretch address posterior capsule.",
      },
    ],
    specialTests: [
      {
        name: "External Rotation Lag Sign",
        assesses: "Infraspinatus and teres minor integrity",
        sensitivity: "56%",
        specificity: "98%",
        positive: "Inability to maintain passive ER position — arm drifts into IR",
      },
      {
        name: "Hornblower Sign",
        assesses: "Teres minor integrity",
        sensitivity: "100%",
        specificity: "93%",
        positive: "Unable to externally rotate with shoulder at 90 degrees abduction — uses trunk rotation instead",
      },
    ],
    outcomemeasures: [
      { name: "DASH", description: "Upper extremity function", mdcOrCutoff: "MDC 10.8" },
      { name: "WORC", description: "Western Ontario rotator cuff index", mdcOrCutoff: "0-2100 — lower is better" },
    ],
    boardPearls: [
      "Supraspinatus — abduction 0-15 degrees initiation. Deltoid — primary abductor above 15 degrees.",
      "Infraspinatus and teres minor — primary external rotators — tested with ER lag sign",
      "Axillary nerve — teres minor and deltoid — C5-C6 — injured in anterior shoulder dislocation",
    ],
  },

  "triceps-posterior": {
    name: "Posterior Arm — Triceps",
    keyMuscles: [
      {
        name: "Triceps Brachii Long Head",
        origin: "Infraglenoid tubercle",
        insertion: "Olecranon",
        action: "Elbow extension and shoulder adduction",
        nerve: "Radial",
        rootLevel: "C7-C8",
      },
      {
        name: "Triceps Brachii Lateral Head",
        origin: "Posterior humerus above spiral groove",
        insertion: "Olecranon",
        action: "Elbow extension",
        nerve: "Radial",
        rootLevel: "C7",
      },
      {
        name: "Triceps Brachii Medial Head",
        origin: "Posterior humerus below spiral groove",
        insertion: "Olecranon",
        action: "Elbow extension",
        nerve: "Radial",
        rootLevel: "C7-C8",
      },
    ],
    commonConditions: [
      {
        name: "Radial Nerve Palsy",
        mechanism: "Compression at spiral groove — Saturday night palsy, humeral fracture",
        boardPearl: "Wrist drop — loss of wrist and finger extension. Triceps may be spared if compression is distal to triceps branch. PIN — posterior interosseous nerve — pure motor branch.",
      },
      {
        name: "Triceps Tendinopathy",
        mechanism: "Overuse at olecranon insertion — throwing athletes and weightlifters",
        boardPearl: "Pain at olecranon with resisted elbow extension. Less common than biceps tendinopathy. Eccentric loading for treatment.",
      },
    ],
    specialTests: [
      {
        name: "Triceps Reflex",
        assesses: "C7 nerve root integrity",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Diminished or absent reflex — suggests C7 radiculopathy",
      },
    ],
    outcomemeasures: [{ name: "DASH", description: "Upper extremity disability", mdcOrCutoff: "MDC 10.8" }],
    boardPearls: [
      "C7 root level — triceps reflex and elbow extension weakness",
      "Radial nerve — spiral groove — Saturday night palsy from prolonged arm compression",
      "PIN — posterior interosseous nerve — no sensory loss — pure motor branch of radial",
    ],
  },

  "elbow-posterior": {
    name: "Elbow — Posterior",
    keyMuscles: [
      {
        name: "Lateral Epicondyle Common Extensor Origin",
        origin: "Lateral epicondyle",
        insertion: "Various dorsal forearm and hand structures",
        action: "Wrist extension and finger extension",
        nerve: "Radial and PIN",
        rootLevel: "C6-C8",
      },
      {
        name: "Anconeus",
        origin: "Lateral epicondyle",
        insertion: "Olecranon",
        action: "Elbow extension and joint stabilization",
        nerve: "Radial",
        rootLevel: "C7-C8",
      },
    ],
    commonConditions: [
      {
        name: "Lateral Epicondylitis",
        mechanism: "Overuse of ECRB at lateral epicondyle — repetitive wrist extension and gripping",
        boardPearl: "Positive Cozen test — resisted wrist extension reproduces pain. Mill test — passive wrist flexion with elbow extended. Most common in non-athletes aged 35-54.",
      },
      {
        name: "Posterior Interosseous Nerve Entrapment",
        mechanism: "PIN compression at arcade of Frohse — radial tunnel",
        boardPearl: "Lateral elbow pain without sensory loss. Distinguishes from lateral epicondylitis by location — more distal and anterior. Resisted supination provocative.",
      },
    ],
    specialTests: [
      {
        name: "Cozen Test",
        assesses: "Lateral epicondylitis",
        sensitivity: "84%",
        specificity: "N/A",
        positive: "Pain at lateral epicondyle with resisted wrist extension",
      },
      {
        name: "Mill Test",
        assesses: "Lateral epicondylitis",
        sensitivity: "53%",
        specificity: "N/A",
        positive: "Pain at lateral epicondyle with passive wrist flexion and elbow extension",
      },
      {
        name: "Maudsley Test",
        assesses: "ECRB involvement",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain at lateral epicondyle with resisted middle finger extension",
      },
    ],
    outcomemeasures: [{ name: "PRTEE", description: "Patient rated tennis elbow evaluation", mdcOrCutoff: "0-100 — lower is better — MDC 11" }],
    boardPearls: [
      "ECRB — extensor carpi radialis brevis — primary muscle involved in lateral epicondylitis",
      "Cozen most sensitive — Mill adds specificity for ECRB",
      "Lateral epicondylitis misnomer — degenerative tendinosis not inflammatory",
    ],
  },

  "forearm-posterior": {
    name: "Forearm — Posterior",
    keyMuscles: [
      {
        name: "Extensor Carpi Radialis Longus",
        origin: "Lateral supracondylar ridge",
        insertion: "Second metacarpal",
        action: "Wrist extension and radial deviation",
        nerve: "Radial",
        rootLevel: "C6-C7",
      },
      {
        name: "Extensor Digitorum",
        origin: "Lateral epicondyle",
        insertion: "Extensor expansion digits 2-5",
        action: "Finger extension",
        nerve: "PIN",
        rootLevel: "C7-C8",
      },
      {
        name: "Extensor Pollicis Longus",
        origin: "Posterior ulna",
        insertion: "Distal phalanx thumb",
        action: "Thumb IP extension",
        nerve: "PIN",
        rootLevel: "C7-C8",
      },
      {
        name: "Supinator",
        origin: "Lateral epicondyle and ulna",
        insertion: "Proximal radius",
        action: "Forearm supination",
        nerve: "PIN",
        rootLevel: "C5-C6",
      },
    ],
    commonConditions: [
      {
        name: "Intersection Syndrome",
        mechanism: "Friction between first and second dorsal compartments — 4-6cm proximal to wrist — rowers and skiers",
        boardPearl: "Crepitus and swelling at dorsoradial forearm — proximal to de Quervain. Distinguishes from de Quervain by location.",
      },
      {
        name: "Wartenberg Syndrome",
        mechanism: "Compression of superficial radial nerve at distal forearm — watch or bracelet compression",
        boardPearl: "Numbness and tingling dorsoradial hand and thumb. No motor loss — purely sensory. Positive Tinel over radial nerve.",
      },
    ],
    specialTests: [
      {
        name: "Finkelstein Test",
        assesses: "De Quervain and first dorsal compartment",
        sensitivity: "81%",
        specificity: "50%",
        positive: "Pain over first dorsal compartment with thumb in fist and ulnar deviation",
      },
    ],
    outcomemeasures: [{ name: "DASH", description: "Upper extremity function", mdcOrCutoff: "MDC 10.8" }],
    boardPearls: [
      "PIN — purely motor — no sensory loss distinguishes from radial nerve palsy at spiral groove",
      "Six dorsal compartments of wrist — ABCDEF mnemonic for contents",
      "Extensor lag — inability to maintain active extension — indicates extensor tendon pathology",
    ],
  },

  "lumbar-spine": {
    name: "Lumbar Spine",
    keyMuscles: [
      {
        name: "Multifidus",
        origin: "Sacrum and lumbar transverse processes",
        insertion: "Spinous processes 2-4 levels above",
        action: "Segmental spinal stabilization and extension",
        nerve: "Posterior rami",
        rootLevel: "L1-S3",
      },
      {
        name: "Erector Spinae",
        origin: "Sacrum and iliac crest",
        insertion: "Ribs and thoracic transverse processes",
        action: "Spinal extension",
        nerve: "Posterior rami",
        rootLevel: "T1-L5",
      },
      {
        name: "Quadratus Lumborum",
        origin: "Iliac crest",
        insertion: "12th rib and L1-L4 transverse processes",
        action: "Lateral trunk flexion and hip hike",
        nerve: "T12-L4",
        rootLevel: "T12-L4",
      },
      {
        name: "Psoas Major",
        origin: "T12-L5 vertebral bodies and discs",
        insertion: "Lesser trochanter",
        action: "Hip flexion",
        nerve: "Lumbar plexus",
        rootLevel: "L1-L3",
      },
    ],
    commonConditions: [
      {
        name: "Lumbar Disc Herniation",
        mechanism: "Flexion with rotation under load — posterolateral herniation most common",
        boardPearl: "Centralization with repeated extension — good prognosis. Positive SLR. Nerve root levels — L4 medial foot, L5 dorsal foot and great toe, S1 lateral foot and plantarflexion.",
      },
      {
        name: "Lumbar Spinal Stenosis",
        mechanism: "Central or foraminal narrowing from degenerative changes — disc, facet, ligamentum flavum",
        boardPearl: "Neurogenic claudication — bilateral leg pain worse with walking and extension, relieved with sitting and flexion. Shopping cart sign — relief with lumbar flexion.",
      },
      {
        name: "Spondylolisthesis",
        mechanism: "Anterior vertebral slip — isthmic from pars defect, degenerative from facet arthritis",
        boardPearl: "Step-off palpation. Extension pain. Tight hamstrings. Grade I less than 25% slip, Grade II 25-50%, Grade III 50-75%, Grade IV above 75%.",
      },
    ],
    specialTests: [
      {
        name: "Straight Leg Raise",
        assesses: "Lumbar disc herniation and nerve root tension",
        sensitivity: "92%",
        specificity: "28%",
        positive: "Reproduction of leg pain between 30-70 degrees of hip flexion",
      },
      {
        name: "Slump Test",
        assesses: "Neural tension — lumbar and lower extremity",
        sensitivity: "84%",
        specificity: "83%",
        positive: "Reproduction of symptoms with slump, knee extension, and dorsiflexion — relieved with cervical extension",
      },
      {
        name: "Well Leg Raise",
        assesses: "Large central disc herniation",
        sensitivity: "29%",
        specificity: "90%",
        positive: "Contralateral leg raise reproduces ipsilateral leg symptoms",
      },
      {
        name: "Prone Instability Test",
        assesses: "Lumbar segmental instability",
        sensitivity: "61%",
        specificity: "57%",
        positive: "Pain in prone passive testing relieved when patient lifts legs",
      },
    ],
    outcomemeasures: [
      { name: "Oswestry", description: "Low back disability", mdcOrCutoff: "0-100% — MDC 10%" },
      { name: "FABQ", description: "Fear avoidance beliefs", mdcOrCutoff: "Work scale above 34 high risk" },
      { name: "STarT Back Tool", description: "Prognostic screening", mdcOrCutoff: "Low, medium, high risk stratification" },
    ],
    boardPearls: [
      "L4 — medial foot, knee extension weakness, diminished patellar reflex",
      "L5 — dorsal foot, great toe extension weakness, no reflex change",
      "S1 — lateral foot, plantarflexion weakness, diminished Achilles reflex",
      "Multifidus atrophies rapidly with LBP — segmental stabilization exercise essential",
    ],
  },

  "gluteus-maximus": {
    name: "Gluteus Maximus",
    keyMuscles: [
      {
        name: "Gluteus Maximus",
        origin: "Posterior ilium, sacrum, coccyx, sacrotuberous ligament",
        insertion: "IT band and gluteal tuberosity",
        action: "Hip extension and external rotation",
        nerve: "Inferior gluteal",
        rootLevel: "L5-S2",
      },
    ],
    commonConditions: [
      {
        name: "Gluteus Maximus Weakness",
        mechanism: "Inhibition from hip flexor tightness, prolonged sitting, or pain — Janda lower crossed syndrome",
        boardPearl: "Hip extension test — hamstring and erector spinae fire before glute max in weak patients. Gluteal amnesia — inability to activate glute max. Treated with glute bridges and hip thrusts.",
      },
      {
        name: "Ischial Bursitis",
        mechanism: "Inflammation of ischial bursa from prolonged sitting on hard surfaces — weaver's bottom",
        boardPearl: "Pain at ischial tuberosity — worse with sitting. Hamstring origin also attaches here — differentiate with resisted knee flexion.",
      },
    ],
    specialTests: [
      {
        name: "Hip Extension Test",
        assesses: "Gluteus maximus activation pattern",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Hamstring or erector spinae fires before gluteus maximus in prone hip extension",
      },
    ],
    outcomemeasures: [{ name: "LEFS", description: "Lower extremity function", mdcOrCutoff: "MDC 9" }],
    boardPearls: [
      "Gluteus maximus — largest and most powerful hip extensor",
      "Lower crossed syndrome — tight hip flexors and erectors, weak glutes and abdominals",
      "S1 root level — hip extension weakness in S1 radiculopathy",
    ],
  },

  "gluteus-medius": {
    name: "Gluteus Medius and Lateral Hip",
    keyMuscles: [
      {
        name: "Gluteus Medius",
        origin: "Posterior ilium between posterior and anterior gluteal lines",
        insertion: "Greater trochanter lateral surface",
        action: "Hip abduction and internal rotation",
        nerve: "Superior gluteal",
        rootLevel: "L4-S1",
      },
      {
        name: "Gluteus Minimus",
        origin: "Outer ilium between anterior and inferior gluteal lines",
        insertion: "Greater trochanter anterior surface",
        action: "Hip abduction and internal rotation",
        nerve: "Superior gluteal",
        rootLevel: "L4-S1",
      },
    ],
    commonConditions: [
      {
        name: "Greater Trochanteric Pain Syndrome",
        mechanism: "Gluteal tendinopathy at greater trochanter insertion — compression and tensile load — previously called trochanteric bursitis",
        boardPearl: "Lateral hip pain with side-lying, stair climbing, and single leg stance. FABER and FADIR may reproduce pain. Load management and hip abductor strengthening.",
      },
      {
        name: "Trendelenburg Sign",
        mechanism: "Gluteus medius weakness — ipsilateral pelvis drops during contralateral single leg stance",
        boardPearl: "Positive Trendelenburg — pelvis drops on unaffected side during single leg stance on affected leg. Compensated Trendelenburg — trunk lateralizes toward stance leg.",
      },
    ],
    specialTests: [
      {
        name: "Trendelenburg Test",
        assesses: "Gluteus medius strength",
        sensitivity: "72%",
        specificity: "76%",
        positive: "Pelvis drops on contralateral side during single leg stance",
      },
      {
        name: "Ober Test",
        assesses: "IT band and TFL tightness",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Inability of abducted leg to adduct to table in side-lying with pelvis stabilized",
      },
    ],
    outcomemeasures: [
      { name: "LEFS", description: "Lower extremity function", mdcOrCutoff: "MDC 9" },
      { name: "HOS", description: "Hip outcome score", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "Superior gluteal nerve — L4-S1 — innervates glute med, glute min, TFL",
      "Trendelenburg gait — gluteus medius weakness — pelvis drops contralateral to stance leg",
      "Greater trochanteric pain syndrome — tendinopathy not bursitis — compression load is primary mechanism",
    ],
  },

  hamstrings: {
    name: "Hamstrings",
    keyMuscles: [
      {
        name: "Biceps Femoris Long Head",
        origin: "Ischial tuberosity",
        insertion: "Fibular head",
        action: "Knee flexion, hip extension, knee external rotation",
        nerve: "Tibial",
        rootLevel: "L5-S2",
      },
      {
        name: "Biceps Femoris Short Head",
        origin: "Lateral linea aspera",
        insertion: "Fibular head",
        action: "Knee flexion and external rotation",
        nerve: "Common peroneal",
        rootLevel: "L5-S2",
      },
      {
        name: "Semimembranosus",
        origin: "Ischial tuberosity",
        insertion: "Posterior medial tibial condyle",
        action: "Knee flexion, hip extension, knee internal rotation",
        nerve: "Tibial",
        rootLevel: "L5-S2",
      },
      {
        name: "Semitendinosus",
        origin: "Ischial tuberosity",
        insertion: "Pes anserine — medial tibia",
        action: "Knee flexion, hip extension, knee internal rotation",
        nerve: "Tibial",
        rootLevel: "L5-S2",
      },
    ],
    commonConditions: [
      {
        name: "Hamstring Strain",
        mechanism: "Eccentric failure during high-speed running — sprinting athletes. Proximal hamstring most common.",
        boardPearl: "Grade I pain without strength loss. Grade II partial tear with strength deficit. Grade III complete rupture. Nordic hamstring curl for prevention — reduces injury rate 50%.",
      },
      {
        name: "Proximal Hamstring Tendinopathy",
        mechanism: "Compressive and tensile load at ischial tuberosity — runners and cyclists",
        boardPearl: "Deep buttock pain with sitting and running. Worse with hip flexion load. Avoid compressive positions — no prolonged sitting or forward lean. Progressive tendon loading.",
      },
    ],
    specialTests: [
      {
        name: "Hamstring Length Test — AKA Test",
        assesses: "Hamstring flexibility",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Inability to reach 70 degrees passive knee extension with hip at 90 degrees — indicates hamstring tightness",
      },
      {
        name: "Puranen-Orava Test",
        assesses: "Proximal hamstring tendinopathy",
        sensitivity: "76%",
        specificity: "81%",
        positive: "Pain at proximal hamstring with standing hip flexion and knee extension",
      },
    ],
    outcomemeasures: [{ name: "LEFS", description: "Lower extremity function", mdcOrCutoff: "MDC 9" }],
    boardPearls: [
      "Biceps femoris — lateral hamstring — inserts fibular head — common peroneal nerve at knee",
      "Pes anserine — sartorius, gracilis, semitendinosus — medial knee — pes anserine bursitis common in OA",
      "Nordic hamstring curl — best evidence for hamstring injury prevention in athletes",
    ],
  },

  "knee-posterior": {
    name: "Posterior Knee",
    keyMuscles: [
      {
        name: "Popliteus",
        origin: "Lateral femoral condyle",
        insertion: "Posterior tibia",
        action: "Unlocks knee and medial tibial rotation",
        nerve: "Tibial",
        rootLevel: "L4-S1",
      },
      {
        name: "Gastrocnemius",
        origin: "Medial and lateral femoral condyles",
        insertion: "Calcaneus via Achilles tendon",
        action: "Knee flexion and plantarflexion",
        nerve: "Tibial",
        rootLevel: "S1-S2",
      },
    ],
    commonConditions: [
      {
        name: "PCL Injury",
        mechanism: "Posterior tibial force with knee flexed — dashboard injury in MVA",
        boardPearl: "Posterior drawer most sensitive — gravity sign — tibia sags posteriorly in 90 degree flexion. Less common than ACL.",
      },
      {
        name: "Baker Cyst",
        mechanism: "Fluid accumulation in popliteal bursa — communicates with joint — secondary to intra-articular pathology",
        boardPearl: "Palpable posterior knee mass. Associated with meniscal tear and OA. Treat underlying cause — cyst resolves with joint treatment.",
      },
      {
        name: "Posterolateral Corner Injury",
        mechanism: "Varus and external rotation force — often with PCL injury",
        boardPearl: "Dial test — increased external rotation at 30 degrees — PLC. Increased at 30 and 90 degrees — PLC and PCL combined.",
      },
    ],
    specialTests: [
      {
        name: "Posterior Drawer",
        assesses: "PCL integrity",
        sensitivity: "90%",
        specificity: "99%",
        positive: "Posterior tibial translation at 90 degrees flexion",
      },
      {
        name: "Dial Test",
        assesses: "Posterolateral corner integrity",
        sensitivity: "75%",
        specificity: "85%",
        positive: "Increased external tibial rotation compared to contralateral — positive at 30 degrees only — PLC. Positive at 30 and 90 — PCL combined.",
      },
      {
        name: "Varus Stress Test",
        assesses: "LCL integrity",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Lateral joint line opening with varus force at 0 and 30 degrees flexion",
      },
    ],
    outcomemeasures: [
      { name: "IKDC", description: "Knee function", mdcOrCutoff: "MDC 8.7" },
      { name: "KOOS", description: "Knee OA and injury", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "PCL — stronger than ACL — dashboard mechanism",
      "Gravity sign — posterior tibial sag with 90 degree hip and knee flexion — PCL insufficiency",
      "Posterolateral corner — popliteus, popliteofibular ligament, LCL — external rotation stability",
    ],
  },

  "calf-gastrocnemius": {
    name: "Calf and Gastrocnemius",
    keyMuscles: [
      {
        name: "Gastrocnemius",
        origin: "Posterior femoral condyles",
        insertion: "Calcaneus via Achilles",
        action: "Plantarflexion and knee flexion",
        nerve: "Tibial",
        rootLevel: "S1-S2",
      },
      {
        name: "Soleus",
        origin: "Posterior fibula and tibia — soleal line",
        insertion: "Calcaneus via Achilles",
        action: "Plantarflexion — primary postural muscle — works at all knee angles",
        nerve: "Tibial",
        rootLevel: "S1-S2",
      },
      {
        name: "Plantaris",
        origin: "Lateral supracondylar line",
        insertion: "Calcaneus medial to Achilles",
        action: "Weak plantarflexion",
        nerve: "Tibial",
        rootLevel: "S1-S2",
      },
      {
        name: "Flexor Digitorum Longus",
        origin: "Posterior tibia",
        insertion: "Distal phalanges digits 2-5",
        action: "Toe flexion and plantarflexion",
        nerve: "Tibial",
        rootLevel: "L5-S2",
      },
    ],
    commonConditions: [
      {
        name: "Gastrocnemius Strain",
        mechanism: "Sudden push-off or eccentric load — tennis leg — medial head most common",
        boardPearl: "Sudden medial posterior calf pain with push-off. Palpable defect in medial gastrocnemius. Distinguish from Achilles rupture with Thompson test — positive in Achilles rupture.",
      },
      {
        name: "DVT — Deep Vein Thrombosis",
        mechanism: "Venous stasis, hypercoagulability, endothelial injury — Virchow triad. High risk post-surgical and immobile patients.",
        boardPearl: "Wells criteria for DVT probability. Homan sign — unreliable. Calf pain, swelling, warmth, erythema. Do not aggressively massage suspected DVT.",
      },
      {
        name: "Achilles Tendinopathy",
        mechanism: "Overuse — insertional at calcaneus or mid-portion 2-6cm above insertion. Sudden training load increase.",
        boardPearl: "VISA-A outcome measure. Alfredson eccentric protocol for mid-portion. Heavy slow resistance training — alternative to eccentric alone.",
      },
    ],
    specialTests: [
      {
        name: "Thompson Test",
        assesses: "Achilles tendon rupture",
        sensitivity: "96%",
        specificity: "93%",
        positive: "No plantarflexion with calf squeeze in prone",
      },
      {
        name: "Wells Criteria DVT",
        assesses: "DVT probability",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Score 2 or above — high probability — requires imaging",
      },
      {
        name: "Silfverskiold Test",
        assesses: "Gastrocnemius vs combined gastroc-soleus tightness",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Limited dorsiflexion with knee extended that improves with knee flexed — isolated gastrocnemius tightness",
      },
    ],
    outcomemeasures: [
      { name: "VISA-A", description: "Achilles tendinopathy", mdcOrCutoff: "0-100 — below 80 clinical tendinopathy" },
      { name: "FAAM", description: "Foot and ankle function", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "S1 root level — plantarflexion weakness and absent Achilles reflex",
      "Soleus works at all knee angles — gastrocnemius loses mechanical advantage with knee flexion",
      "Alfredson protocol — 3 sets of 15 heavy eccentric heel drops twice daily — evidence for mid-portion Achilles",
    ],
  },

  "achilles-posterior-ankle": {
    name: "Achilles and Posterior Ankle",
    keyMuscles: [
      {
        name: "Achilles Tendon",
        origin: "Confluence of gastrocnemius and soleus",
        insertion: "Posterior calcaneus",
        action: "Transmits plantarflexion force",
        nerve: "N/A — tendon structure",
        rootLevel: "S1-S2 via gastrosoleus",
      },
      {
        name: "Peroneus Longus",
        origin: "Lateral fibula",
        insertion: "Medial cuneiform and first metatarsal plantar",
        action: "Eversion and plantarflexion",
        nerve: "Superficial peroneal",
        rootLevel: "L5-S1",
      },
      {
        name: "Peroneus Brevis",
        origin: "Lateral fibula distal two thirds",
        insertion: "Fifth metatarsal styloid",
        action: "Eversion",
        nerve: "Superficial peroneal",
        rootLevel: "L5-S1",
      },
      {
        name: "Flexor Hallucis Longus",
        origin: "Posterior fibula",
        insertion: "Distal phalanx great toe",
        action: "Great toe flexion and plantarflexion",
        nerve: "Tibial",
        rootLevel: "L5-S2",
      },
    ],
    commonConditions: [
      {
        name: "Achilles Tendon Rupture",
        mechanism: "Sudden eccentric load — push-off in recreational athletes — middle-aged men most common",
        boardPearl: "Positive Thompson test — no plantarflexion with calf squeeze. Palpable gap. Surgical vs conservative — functional outcomes similar with early weight bearing conservative protocol.",
      },
      {
        name: "Posterior Ankle Impingement",
        mechanism: "Compression of posterior ankle structures with plantarflexion — os trigonum, FHL tenosynovitis",
        boardPearl: "Pain with end-range plantarflexion — ballet dancers and downhill runners. Positive posterior impingement sign — passive plantarflexion reproduces pain.",
      },
      {
        name: "Peroneal Tendon Subluxation",
        mechanism: "Forced dorsiflexion with eversion — superior peroneal retinaculum tears — allowing peroneal tendons to sublux over fibula",
        boardPearl: "Snapping over lateral malleolus. Often missed acutely — mistaken for ankle sprain. Resisted eversion reproduces subluxation.",
      },
    ],
    specialTests: [
      {
        name: "Thompson Test",
        assesses: "Achilles tendon rupture",
        sensitivity: "96%",
        specificity: "93%",
        positive: "Absence of plantarflexion with gastrosoleus squeeze in prone",
      },
      {
        name: "Posterior Impingement Test",
        assesses: "Posterior ankle impingement",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Pain with passive end-range plantarflexion",
      },
      {
        name: "Peroneal Subluxation Test",
        assesses: "Superior peroneal retinaculum integrity",
        sensitivity: "N/A",
        specificity: "N/A",
        positive: "Visible or palpable peroneal tendon subluxation with resisted eversion and dorsiflexion",
      },
    ],
    outcomemeasures: [
      { name: "VISA-A", description: "Achilles tendinopathy", mdcOrCutoff: "0-100" },
      { name: "FAAM", description: "Foot and ankle ability", mdcOrCutoff: "0-100 — higher is better" },
    ],
    boardPearls: [
      "Achilles rupture — Thompson positive, palpable gap, unable to do single leg heel raise",
      "Water's edge — Achilles tendon avascular zone 2-6cm above insertion — most common mid-portion rupture site",
      "FHL — hallux saltans — snapping great toe — FHL tendon catching in fibro-osseous tunnel",
    ],
  },
};
