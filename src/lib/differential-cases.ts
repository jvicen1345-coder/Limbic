/**
 * Differential's static case bank (see app/games/differential/page.tsx,
 * app/actions/differential.ts) — one clinical vignette per case, revealed as 5
 * progressively more specific clues. Category/difficulty drive the page's colored pill
 * (see .specialty-accent-* in globals.css) and stats breakdowns.
 */

export type DifferentialCategory =
  | "Musculoskeletal"
  | "Neurological"
  | "Cardiopulmonary"
  | "Pediatrics"
  | "Geriatrics"
  | "Sports"
  | "Wellness";

export type DifferentialDifficulty = "beginner" | "intermediate" | "advanced";

export interface DifferentialCaseEntry {
  id: number;
  condition: string;
  category: DifferentialCategory;
  difficulty: DifferentialDifficulty;
  clues: string[];
}

export const differentialCases: DifferentialCaseEntry[] = [
  {
    id: 1,
    condition: "ACL Tear",
    category: "Sports",
    difficulty: "intermediate",
    clues: [
      "Female athlete, non-contact deceleration mechanism",
      "Audible pop reported at time of injury",
      "Immediate hemarthrosis and significant swelling",
      "Positive Lachman test with soft endpoint",
      "MRI confirms complete ligament disruption",
    ],
  },
  {
    id: 2,
    condition: "Rotator Cuff Tear",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "55-year-old male with gradual onset lateral shoulder pain",
      "Night pain that wakes him from sleep",
      "Weakness with shoulder elevation and external rotation",
      "Positive Empty Can and Drop Arm tests",
      "MRI shows full thickness supraspinatus tear",
    ],
  },
  {
    id: 3,
    condition: "Lumbar Disc Herniation",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "35-year-old lifted heavy box at work yesterday",
      "Low back pain radiating down the posterior left leg",
      "Symptoms worse with sitting and forward flexion",
      "Positive straight leg raise at 45 degrees",
      "L5 dermatomal pattern with great toe extension weakness",
    ],
  },
  {
    id: 4,
    condition: "Stroke",
    category: "Neurological",
    difficulty: "beginner",
    clues: [
      "72-year-old female with sudden onset symptoms",
      "Right-sided facial droop and arm weakness",
      "Slurred speech and confusion",
      "Symptoms began 2 hours ago",
      "CT shows left middle cerebral artery ischemia",
    ],
  },
  {
    id: 5,
    condition: "COPD",
    category: "Cardiopulmonary",
    difficulty: "beginner",
    clues: [
      "65-year-old male with 40 pack-year smoking history",
      "Progressive dyspnea on exertion over several years",
      "Barrel chest and use of accessory muscles at rest",
      "FEV1 to FVC ratio below 0.70 on spirometry",
      "GOLD Stage III with FEV1 35% of predicted",
    ],
  },
  {
    id: 6,
    condition: "Patellofemoral Pain Syndrome",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "19-year-old female runner with anterior knee pain",
      "Pain increases with stairs, squatting, and prolonged sitting",
      "No swelling or instability reported",
      "Positive Clarke sign with patellar compression",
      "Hip abductor weakness identified on examination",
    ],
  },
  {
    id: 7,
    condition: "Parkinson Disease",
    category: "Neurological",
    difficulty: "intermediate",
    clues: [
      "68-year-old male with symptoms progressing over 3 years",
      "Resting tremor in the right hand",
      "Masked facies and reduced arm swing with walking",
      "Shuffling gait with festination and freezing episodes",
      "Hoehn and Yahr Stage 3 — bilateral with balance impairment",
    ],
  },
  {
    id: 8,
    condition: "Ankle Sprain",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "17-year-old basketball player rolled ankle during game",
      "Immediate lateral ankle pain and swelling",
      "Able to bear weight with antalgic gait",
      "Tenderness over anterior talofibular ligament",
      "Ottawa rules negative — X-ray not indicated",
    ],
  },
  {
    id: 9,
    condition: "Cerebral Palsy",
    category: "Pediatrics",
    difficulty: "intermediate",
    clues: [
      "3-year-old with delayed motor milestones",
      "Increased tone in bilateral lower extremities",
      "Scissor gait pattern observed during ambulation",
      "Brain MRI shows periventricular leukomalacia",
      "GMFCS Level II — walks with limitations",
    ],
  },
  {
    id: 10,
    condition: "Heart Failure",
    category: "Cardiopulmonary",
    difficulty: "intermediate",
    clues: [
      "72-year-old female with progressive shortness of breath",
      "Orthopnea — sleeps with 3 pillows",
      "Bilateral pitting edema to the knees",
      "S3 heart sound on auscultation",
      "Ejection fraction 35% on echocardiogram — NYHA Class III",
    ],
  },
  {
    id: 11,
    condition: "Multiple Sclerosis",
    category: "Neurological",
    difficulty: "intermediate",
    clues: [
      "29-year-old female with episodic neurological symptoms",
      "Unilateral vision loss that resolved over 2 weeks",
      "Fatigue described as overwhelming and constant",
      "Symptoms worsen significantly in hot environments",
      "MRI shows demyelinating plaques in white matter",
    ],
  },
  {
    id: 12,
    condition: "Osteoporosis",
    category: "Geriatrics",
    difficulty: "beginner",
    clues: [
      "68-year-old postmenopausal female",
      "Vertebral compression fracture after minimal trauma",
      "Height loss of 2 inches over 5 years",
      "Kyphotic posture with thoracic flexion deformity",
      "DEXA scan T-score of negative 2.8",
    ],
  },
  {
    id: 13,
    condition: "Carpal Tunnel Syndrome",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "42-year-old office worker with hand numbness",
      "Symptoms worse at night and with prolonged typing",
      "Numbness in thumb, index, and middle fingers",
      "Positive Phalen test at 30 seconds",
      "Nerve conduction study confirms median nerve compression",
    ],
  },
  {
    id: 14,
    condition: "Traumatic Brain Injury",
    category: "Neurological",
    difficulty: "intermediate",
    clues: [
      "22-year-old male after motor vehicle accident",
      "Loss of consciousness for 20 minutes at scene",
      "GCS of 11 on arrival to emergency department",
      "CT shows frontal lobe contusion",
      "Rancho Los Amigos Level V — confused and inappropriate",
    ],
  },
  {
    id: 15,
    condition: "Concussion",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "16-year-old football player after helmet-to-helmet contact",
      "Headache, dizziness, and sensitivity to light",
      "No loss of consciousness",
      "Cognitive fog and difficulty concentrating in class",
      "SCAT5 score significantly below baseline",
    ],
  },
  {
    id: 16,
    condition: "Spinal Cord Injury — C6 Complete",
    category: "Neurological",
    difficulty: "advanced",
    clues: [
      "24-year-old male after diving accident",
      "Complete motor and sensory loss below clavicle",
      "Active wrist extension present bilaterally",
      "No active elbow extension or hand function",
      "ASIA A classification — C6 motor level",
    ],
  },
  {
    id: 17,
    condition: "Plantar Fasciitis",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "45-year-old runner with heel pain",
      "Pain worst with first steps in the morning",
      "Tenderness at medial calcaneal tubercle",
      "Pain decreases after walking but returns with prolonged standing",
      "Positive windlass test",
    ],
  },
  {
    id: 18,
    condition: "Shoulder Instability",
    category: "Sports",
    difficulty: "intermediate",
    clues: [
      "20-year-old baseball pitcher with shoulder pain",
      "History of anterior dislocation 6 months ago",
      "Apprehension with shoulder abduction and external rotation",
      "Positive relocation test — relief with posterior pressure",
      "MRI shows Bankart lesion",
    ],
  },
  {
    id: 19,
    condition: "Knee Osteoarthritis",
    category: "Geriatrics",
    difficulty: "beginner",
    clues: [
      "62-year-old female with bilateral knee pain for 5 years",
      "Morning stiffness lasting less than 30 minutes",
      "Crepitus with knee movement",
      "Joint line tenderness and bony enlargement",
      "X-ray shows medial joint space narrowing and osteophytes",
    ],
  },
  {
    id: 20,
    condition: "Torticollis",
    category: "Pediatrics",
    difficulty: "intermediate",
    clues: [
      "6-week-old infant referred by pediatrician",
      "Head consistently tilted to the right",
      "Face rotated away to the left",
      "Palpable mass in right sternocleidomastoid",
      "Plagiocephaly noted on right occiput",
    ],
  },
  {
    id: 21,
    condition: "Duchenne Muscular Dystrophy",
    category: "Pediatrics",
    difficulty: "advanced",
    clues: [
      "5-year-old male with progressive proximal weakness",
      "Difficulty climbing stairs and rising from floor",
      "Positive Gowers sign",
      "Calf pseudohypertrophy bilaterally",
      "Serum creatine kinase markedly elevated",
    ],
  },
  {
    id: 22,
    condition: "Frozen Shoulder",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "52-year-old female with gradual onset shoulder stiffness",
      "Pain present for 8 months followed by progressive loss of motion",
      "Equal loss of active and passive ROM in all planes",
      "Significant loss of external rotation — only 10 degrees",
      "Diabetic patient — no trauma history",
    ],
  },
  {
    id: 23,
    condition: "Lateral Epicondylitis",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "38-year-old tennis player with lateral elbow pain",
      "Pain with gripping and lifting objects",
      "Tenderness at lateral epicondyle",
      "Pain reproduced with resisted wrist extension",
      "Positive Cozen test",
    ],
  },
  {
    id: 24,
    condition: "Orthostatic Hypotension",
    category: "Geriatrics",
    difficulty: "intermediate",
    clues: [
      "78-year-old male on antihypertensive medications",
      "Lightheadedness and near-syncope when standing",
      "Recently hospitalized for 5 days with pneumonia",
      "Supine BP 140 over 85",
      "Standing BP drops to 110 over 70 within 2 minutes",
    ],
  },
  {
    id: 25,
    condition: "Patellar Tendinopathy",
    category: "Sports",
    difficulty: "intermediate",
    clues: [
      "22-year-old basketball player with anterior knee pain",
      "Pain at inferior pole of patella with jumping and landing",
      "No swelling or locking",
      "Pain worsens with increased training load",
      "VISA-P score of 42 out of 100",
    ],
  },
  {
    id: 26,
    condition: "Cauda Equina Syndrome",
    category: "Musculoskeletal",
    difficulty: "advanced",
    clues: [
      "44-year-old male with sudden worsening low back pain",
      "Bilateral lower extremity weakness and numbness",
      "Saddle anesthesia in perineal region",
      "Urinary retention — unable to void",
      "MRI shows massive L4-L5 disc herniation with canal compromise",
    ],
  },
  {
    id: 27,
    condition: "Guillain-Barre Syndrome",
    category: "Neurological",
    difficulty: "advanced",
    clues: [
      "32-year-old female 3 weeks after upper respiratory infection",
      "Ascending bilateral lower extremity weakness",
      "Areflexia throughout lower extremities",
      "Weakness now involving respiratory muscles",
      "CSF shows albuminocytologic dissociation",
    ],
  },
  {
    id: 28,
    condition: "Developmental Coordination Disorder",
    category: "Pediatrics",
    difficulty: "advanced",
    clues: [
      "8-year-old male referred by school for motor difficulties",
      "Significantly below age level for handwriting and ball skills",
      "No intellectual disability or neurological diagnosis",
      "Coordination deficits impact ADLs and school participation",
      "Movement ABC-2 score below 5th percentile",
    ],
  },
  {
    id: 29,
    condition: "Pulmonary Embolism",
    category: "Cardiopulmonary",
    difficulty: "advanced",
    clues: [
      "58-year-old female 4 days after total knee replacement",
      "Sudden onset dyspnea and chest pain",
      "Heart rate 118, respiratory rate 26, SpO2 88%",
      "Right calf pain and swelling noted",
      "Wells criteria score of 7 — high probability DVT",
    ],
  },
  {
    id: 30,
    condition: "Fibromyalgia",
    category: "Wellness",
    difficulty: "intermediate",
    clues: [
      "38-year-old female with widespread pain for over 3 months",
      "Fatigue, sleep disturbance, and cognitive fog",
      "Pain present in all four body quadrants",
      "No inflammatory markers on bloodwork",
      "Widespread Pain Index score of 14 with Symptom Severity Scale of 10",
    ],
  },
  {
    id: 31,
    condition: "De Quervain Tenosynovitis",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "34-year-old new mother with radial wrist pain",
      "Pain with lifting infant and pinching activities",
      "Tenderness over first dorsal compartment",
      "Positive Finkelstein test",
      "Thickening of APL and EPB tendons on ultrasound",
    ],
  },
  {
    id: 32,
    condition: "Thoracic Outlet Syndrome",
    category: "Musculoskeletal",
    difficulty: "advanced",
    clues: [
      "26-year-old swimmer with arm pain and numbness",
      "Symptoms with overhead arm positions",
      "Heaviness and fatigue in the arm with activity",
      "Positive Adson test and ROOS stress test",
      "Neurogenic type — involving brachial plexus compression",
    ],
  },
  {
    id: 33,
    condition: "Hip Labral Tear",
    category: "Sports",
    difficulty: "advanced",
    clues: [
      "28-year-old female dancer with deep groin pain",
      "Clicking and catching sensation in hip",
      "Pain with prolonged sitting and hip flexion",
      "Positive FADIR test — flexion adduction internal rotation",
      "MRI arthrogram confirms anterosuperior labral tear",
    ],
  },
  {
    id: 34,
    condition: "Spinal Stenosis",
    category: "Geriatrics",
    difficulty: "intermediate",
    clues: [
      "70-year-old male with bilateral leg pain",
      "Symptoms worse with walking and standing",
      "Relief with sitting and forward trunk flexion",
      "Neurogenic claudication — legs feel heavy with walking",
      "MRI shows significant central canal stenosis at L3-L4",
    ],
  },
  {
    id: 35,
    condition: "Achilles Tendinopathy",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "35-year-old runner who increased mileage last month",
      "Posterior heel and lower leg pain with running",
      "Morning stiffness that improves with activity",
      "Tenderness 2 to 6 cm above calcaneal insertion",
      "VISA-A score of 48 out of 100",
    ],
  },
  {
    id: 36,
    condition: "Myocardial Infarction",
    category: "Cardiopulmonary",
    difficulty: "beginner",
    clues: [
      "61-year-old male with sudden chest pressure",
      "Pain radiating to left arm and jaw",
      "Diaphoresis and nausea",
      "EKG shows ST elevation in leads V1 through V4",
      "Troponin levels significantly elevated",
    ],
  },
  {
    id: 37,
    condition: "Erb's Palsy",
    category: "Pediatrics",
    difficulty: "advanced",
    clues: [
      "Newborn after difficult delivery with shoulder dystocia",
      "Right arm held in waiter's tip position",
      "Loss of shoulder abduction and external rotation",
      "Elbow extension present but no flexion",
      "C5 and C6 nerve root involvement confirmed",
    ],
  },
  {
    id: 38,
    condition: "Piriformis Syndrome",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "42-year-old cyclist with deep buttock pain",
      "Pain radiating down posterior thigh but not below knee",
      "Tenderness deep in gluteal region",
      "Positive FAIR test — flexion adduction internal rotation of hip",
      "Normal lumbar MRI — negative straight leg raise",
    ],
  },
  {
    id: 39,
    condition: "Subacromial Bursitis",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "48-year-old painter with shoulder pain",
      "Painful arc between 60 and 120 degrees of elevation",
      "Pain with overhead reaching activities",
      "Positive Neer and Hawkins-Kennedy tests",
      "Ultrasound shows fluid in subacromial bursa",
    ],
  },
  {
    id: 40,
    condition: "Anterior Compartment Syndrome",
    category: "Sports",
    difficulty: "advanced",
    clues: [
      "19-year-old soccer player after tibial fracture",
      "Increasing leg pain despite fracture management",
      "Pain out of proportion to injury",
      "Tense swelling of anterior compartment",
      "Compartment pressure above 30 mmHg — surgical emergency",
    ],
  },
  {
    id: 41,
    condition: "Sciatica",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "50-year-old male with low back and leg pain",
      "Sharp shooting pain from buttock to foot",
      "Dermatomal numbness in S1 distribution",
      "Positive slump test",
      "Symptoms worse with coughing and sneezing",
    ],
  },
  {
    id: 42,
    condition: "Vestibular Neuritis",
    category: "Neurological",
    difficulty: "advanced",
    clues: [
      "45-year-old female with sudden onset severe vertigo",
      "Continuous dizziness lasting several days",
      "No hearing loss or tinnitus",
      "Positive head impulse test to the left",
      "Normal MRI — no central pathology",
    ],
  },
  {
    id: 43,
    condition: "Iliotibial Band Syndrome",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "28-year-old runner training for first marathon",
      "Lateral knee pain that appears at mile 4 of every run",
      "No pain with walking or at rest",
      "Tenderness at lateral femoral epicondyle",
      "Positive Ober test — tight iliotibial band",
    ],
  },
  {
    id: 44,
    condition: "Amyotrophic Lateral Sclerosis",
    category: "Neurological",
    difficulty: "advanced",
    clues: [
      "55-year-old male with progressive weakness over 18 months",
      "Fasciculations visible in bilateral upper extremities",
      "Mixed UMN and LMN signs present simultaneously",
      "Bulbar symptoms — dysarthria and dysphagia emerging",
      "EMG confirms widespread denervation in multiple regions",
    ],
  },
  {
    id: 45,
    condition: "Benign Paroxysmal Positional Vertigo",
    category: "Neurological",
    difficulty: "intermediate",
    clues: [
      "62-year-old female with brief episodes of dizziness",
      "Symptoms triggered by rolling over in bed",
      "Vertigo lasts less than 60 seconds then resolves",
      "Positive Dix-Hallpike test with upbeat torsional nystagmus",
      "Posterior canal BPPV confirmed",
    ],
  },
  {
    id: 46,
    condition: "Stress Fracture",
    category: "Sports",
    difficulty: "intermediate",
    clues: [
      "20-year-old female cross country runner",
      "Gradual onset shin pain over 6 weeks",
      "Pain with activity — relief with rest",
      "Point tenderness over mid tibial shaft",
      "MRI shows periosteal edema consistent with stress reaction",
    ],
  },
  {
    id: 47,
    condition: "Adhesive Capsulitis",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "58-year-old diabetic female with shoulder stiffness",
      "Gradual onset pain and progressive loss of motion",
      "Unable to reach behind back or wash opposite shoulder",
      "Passive ER limited to 15 degrees",
      "Capsular pattern — ER most limited, then ABD, then IR",
    ],
  },
  {
    id: 48,
    condition: "Osgood-Schlatter Disease",
    category: "Pediatrics",
    difficulty: "beginner",
    clues: [
      "13-year-old male basketball player with knee pain",
      "Pain and swelling at tibial tuberosity",
      "Symptoms worse with running and jumping",
      "During rapid growth phase",
      "X-ray shows fragmentation of tibial apophysis",
    ],
  },
  {
    id: 49,
    condition: "Polymyalgia Rheumatica",
    category: "Geriatrics",
    difficulty: "advanced",
    clues: [
      "70-year-old female with bilateral shoulder and hip girdle aching",
      "Symptoms worse in the morning lasting over an hour",
      "Difficulty raising arms above head and rising from chair",
      "ESR elevated above 50 mm per hour",
      "Dramatic response to low-dose corticosteroids within 48 hours",
    ],
  },
  {
    id: 50,
    condition: "Spondylolisthesis",
    category: "Musculoskeletal",
    difficulty: "advanced",
    clues: [
      "16-year-old gymnast with low back pain",
      "Pain worse with extension and relieved with flexion",
      "Palpable step-off at lumbar spine",
      "Tight hamstrings bilaterally",
      "X-ray shows Grade II anterior slip of L5 on S1",
    ],
  },
  {
    id: 51,
    condition: "Hypertension",
    category: "Wellness",
    difficulty: "beginner",
    clues: [
      "52-year-old male at annual physical",
      "Resting blood pressure 158 over 96 on three separate readings",
      "No symptoms — discovered incidentally",
      "BMI of 31 — sedentary lifestyle",
      "Stage 2 hypertension — lifestyle modification recommended first",
    ],
  },
  {
    id: 52,
    condition: "Type 2 Diabetes",
    category: "Wellness",
    difficulty: "beginner",
    clues: [
      "48-year-old female with increased thirst and fatigue",
      "Frequent urination and blurred vision",
      "Fasting blood glucose 145 mg per dL",
      "HbA1c of 8.2%",
      "BMI 33 — weight loss and exercise recommended as first intervention",
    ],
  },
  {
    id: 53,
    condition: "Rotator Cuff Tendinopathy",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "40-year-old swimmer with anterior shoulder pain",
      "Aching pain with overhead activities",
      "No weakness or instability",
      "Painful arc with elevation",
      "Ultrasound shows tendon thickening without tear",
    ],
  },
  {
    id: 54,
    condition: "Wrist Fracture — Distal Radius",
    category: "Musculoskeletal",
    difficulty: "beginner",
    clues: [
      "72-year-old female fell onto outstretched hand",
      "Wrist pain and swelling immediately after fall",
      "Dinner fork deformity visible",
      "Point tenderness over distal radius",
      "X-ray confirms Colles fracture with dorsal displacement",
    ],
  },
  {
    id: 55,
    condition: "Medial Tibial Stress Syndrome",
    category: "Sports",
    difficulty: "beginner",
    clues: [
      "22-year-old new military recruit",
      "Bilateral shin pain with increased running training",
      "Diffuse tenderness along posteromedial tibial border",
      "Pain with activity — present at start and end of run",
      "No focal tenderness — X-ray normal",
    ],
  },
  {
    id: 56,
    condition: "Cervical Radiculopathy",
    category: "Musculoskeletal",
    difficulty: "intermediate",
    clues: [
      "45-year-old male with neck and right arm pain",
      "Numbness in the thumb and index finger",
      "Weakness with elbow flexion and wrist extension",
      "Positive Spurling test reproduces arm symptoms",
      "MRI shows C6-C7 foraminal stenosis",
    ],
  },
  {
    id: 57,
    condition: "Meniscal Tear",
    category: "Sports",
    difficulty: "intermediate",
    clues: [
      "30-year-old male twisted knee during soccer",
      "Joint line pain and swelling over 24 hours",
      "Locking and catching sensation with knee movement",
      "Positive McMurray and Thessaly tests",
      "MRI confirms medial meniscal tear — bucket handle pattern",
    ],
  },
  {
    id: 58,
    condition: "Postural Orthostatic Tachycardia Syndrome",
    category: "Cardiopulmonary",
    difficulty: "advanced",
    clues: [
      "22-year-old female with dizziness and fatigue on standing",
      "Heart rate increases more than 30 bpm within 10 minutes of standing",
      "No significant blood pressure drop",
      "Symptoms include brain fog, palpitations, and exercise intolerance",
      "Tilt table test confirms POTS diagnosis",
    ],
  },
  {
    id: 59,
    condition: "Plantar Fasciitis",
    category: "Wellness",
    difficulty: "beginner",
    clues: [
      "50-year-old teacher who stands all day",
      "Sharp heel pain with first steps each morning",
      "Pain improves after 10 minutes of walking",
      "Tenderness at medial calcaneal tubercle",
      "Tight calf muscles and limited ankle dorsiflexion",
    ],
  },
  {
    id: 60,
    condition: "Gout",
    category: "Wellness",
    difficulty: "intermediate",
    clues: [
      "58-year-old male with sudden onset great toe pain",
      "Woke from sleep with severe joint pain",
      "Toe is red, swollen, and extremely tender to touch",
      "Recent increase in alcohol consumption",
      "Serum uric acid elevated — 9.2 mg per dL",
    ],
  },
];

const DAY_MS = 86400000;
// A fixed, arbitrary epoch — just needs to be stable across deploys so the same calendar
// day always maps to the same day index (same reasoning as lib/trivia-static.ts's
// dayIndexForDateKey/EPOCH_MS) — an ever-growing day index modulo the bank size rather
// than a literal Jan-1-of-this-year day-of-year, so the rotation doesn't visibly reset or
// repeat at a year boundary.
const EPOCH_MS = new Date(2024, 0, 1).getTime();

function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

/** Today's case — a fixed cyclic index over differentialCases, stable for every reader on
 *  a given calendar day and stable as the bank grows. */
export function getTodaysCase(): DifferentialCaseEntry {
  const dateKey = getDateKey();
  const dayIndex = dayIndexForDateKey(dateKey);
  const total = differentialCases.length;
  const index = ((dayIndex % total) + total) % total;
  return differentialCases[index];
}

/** YYYY-MM-DD for "today" — the unit the daily case rotates on. */
export function getDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
