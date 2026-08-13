/**
 * Limbic Boards content bank — NPTE-style board-prep questions and terms, curated by
 * hand from standard PT curriculum/textbook material (MMT grading, special orthopedic
 * tests, upper vs lower motor neuron signs, wound staging, etc.) — the same kind of
 * well-established facts a board-prep textbook would cover, not invented or contested
 * claims. Same "deterministic pick for the day" pattern as lib/wordle-words.ts, so every
 * student sees the same question/term on a given date and it's stable as the bank grows.
 */

export interface BoardQuestion {
  id: string;
  domain: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export const BOARD_QUESTIONS: BoardQuestion[] = [
  {
    id: "q1",
    domain: "Musculoskeletal",
    question: "A patient has 5/5 strength through range against maximal resistance. What MMT grade is this?",
    choices: ["3", "4", "4+", "5"],
    correctIndex: 3,
    explanation: "A grade of 5 (Normal) requires full ROM against gravity with maximal resistance and no break in the muscle's ability to hold the position.",
  },
  {
    id: "q2",
    domain: "Musculoskeletal",
    question: "Which special test is most associated with detecting a torn ACL?",
    choices: ["Lachman test", "McMurray test", "Thessaly test", "Valgus stress test"],
    correctIndex: 0,
    explanation: "The Lachman test (20-30° of knee flexion, anterior tibial translation) is the most sensitive clinical test for ACL integrity.",
  },
  {
    id: "q3",
    domain: "Neuromuscular",
    question: "Hyperreflexia, clonus, and a positive Babinski sign are classic signs of a lesion where?",
    choices: [
      "Peripheral nerve",
      "Neuromuscular junction",
      "Upper motor neuron",
      "Lower motor neuron",
    ],
    correctIndex: 2,
    explanation: "Upper motor neuron lesions present with hyperreflexia, spasticity, clonus, and pathological reflexes like Babinski, the opposite of the flaccidity/hyporeflexia seen with lower motor neuron lesions.",
  },
  {
    id: "q4",
    domain: "Neuromuscular",
    question: "A patient with a right-sided stroke is most likely to present with which deficit?",
    choices: [
      "Left-sided hemiparesis",
      "Right-sided hemiparesis",
      "Bilateral lower extremity weakness only",
      "Expressive aphasia",
    ],
    correctIndex: 0,
    explanation: "Motor pathways cross (decussate), so a right-hemisphere lesion produces left-sided motor deficits. Expressive (Broca's) aphasia is classically left-hemisphere.",
  },
  {
    id: "q5",
    domain: "Cardiopulmonary",
    question: "What is the normal resting respiratory rate range for a healthy adult?",
    choices: ["4-8 breaths/min", "12-20 breaths/min", "24-32 breaths/min", "36-44 breaths/min"],
    correctIndex: 1,
    explanation: "Normal adult resting respiratory rate is 12-20 breaths per minute; outside that range is considered bradypnea or tachypnea.",
  },
  {
    id: "q6",
    domain: "Cardiopulmonary",
    question: "A patient's SpO2 reads 88% on room air. What is the appropriate PT response?",
    choices: [
      "Continue the session as planned",
      "Stop and notify the medical team; this is below safe parameters",
      "Have the patient hold their breath and recheck",
      "Document and reassess only at the end of the session",
    ],
    correctIndex: 1,
    explanation: "SpO2 below ~90% is generally an unsafe parameter to continue exertional therapy; the session should stop and the finding should be escalated to the medical team.",
  },
  {
    id: "q7",
    domain: "Integumentary",
    question: "A pressure injury with full-thickness skin loss and visible subcutaneous fat, but no exposed bone, tendon, or muscle, is staged as:",
    choices: ["Stage 1", "Stage 2", "Stage 3", "Stage 4"],
    correctIndex: 2,
    explanation: "Stage 3 pressure injuries show full-thickness skin loss with visible fat; Stage 4 additionally exposes bone, tendon, or muscle.",
  },
  {
    id: "q8",
    domain: "Nonsystem / Safety",
    question: "For a patient using a standard front-wheeled walker, the handgrips should be set at approximately what height?",
    choices: [
      "Shoulder height",
      "Elbow flexed to 90°",
      "Ulnar styloid / wrist crease, with ~20-30° of elbow flexion",
      "Hip height",
    ],
    correctIndex: 2,
    explanation: "Assistive device height is typically set so the top aligns with the ulnar styloid/wrist crease, giving roughly 20-30° of elbow flexion when gripping.",
  },
  {
    id: "q9",
    domain: "Musculoskeletal",
    question: "Which gait deviation is classically associated with weak hip abductors on the stance limb?",
    choices: ["Trendelenburg gait", "Steppage gait", "Antalgic gait", "Scissoring gait"],
    correctIndex: 0,
    explanation: "A Trendelenburg gait, contralateral pelvic drop during stance, results from weak hip abductors (gluteus medius/minimus) on the stance side.",
  },
  {
    id: "q10",
    domain: "Neuromuscular",
    question: "Which cranial nerve is responsible for facial expression muscles?",
    choices: ["CN V (Trigeminal)", "CN VII (Facial)", "CN IX (Glossopharyngeal)", "CN XII (Hypoglossal)"],
    correctIndex: 1,
    explanation: "CN VII (Facial) innervates the muscles of facial expression; CN V handles facial sensation and mastication.",
  },
  {
    id: "q11",
    domain: "Cardiopulmonary",
    question: "Using the Borg RPE 6-20 scale, what range is generally targeted for moderate-intensity aerobic exercise?",
    choices: ["6-8", "9-11", "12-14", "18-20"],
    correctIndex: 2,
    explanation: "A Borg RPE of roughly 12-14 ('somewhat hard') is the commonly targeted range for moderate-intensity aerobic exercise.",
  },
  {
    id: "q12",
    domain: "Musculoskeletal",
    question: "A positive Neer and Hawkins-Kennedy test together are most suggestive of:",
    choices: [
      "Subacromial impingement",
      "Adhesive capsulitis",
      "AC joint sprain",
      "Long head of biceps tendinopathy alone",
    ],
    correctIndex: 0,
    explanation: "Neer and Hawkins-Kennedy are both impingement provocation tests; a positive cluster raises suspicion for subacromial impingement syndrome.",
  },
  {
    id: "q13",
    domain: "Nonsystem / Safety",
    question: "A patient on standard fall precautions with a resting heart rate of 130 bpm and new-onset confusion should be:",
    choices: [
      "Treated as scheduled, monitoring vitals every 10 minutes",
      "Held from therapy and the finding reported to nursing/medical staff",
      "Ambulated slowly to assess tolerance",
      "Given a rest break, then treatment resumed as tolerated",
    ],
    correctIndex: 1,
    explanation: "New-onset tachycardia with confusion is an acute change in status outside safe parameters; therapy should be held and the change escalated, not worked through.",
  },
  {
    id: "q14",
    domain: "Neuromuscular",
    question: "The modified Ashworth Scale is used to assess:",
    choices: ["Balance", "Spasticity", "Coordination", "Sensation"],
    correctIndex: 1,
    explanation: "The Modified Ashworth Scale grades resistance to passive stretch (0 to 4) as a measure of spasticity.",
  },
  {
    id: "q15",
    domain: "Musculoskeletal",
    question: "Which ligament is most commonly injured with a valgus force to a slightly flexed knee?",
    choices: ["ACL", "PCL", "MCL", "LCL"],
    correctIndex: 2,
    explanation: "A valgus (inward) force at the knee most commonly stresses and injures the MCL on the medial side.",
  },
];

export interface BoardTerm {
  id: string;
  term: string;
  definition: string;
  memoryAid?: string;
}

export const BOARD_TERMS: BoardTerm[] = [
  {
    id: "t1",
    term: "Dermatome",
    definition: "An area of skin innervated by sensory fibers from a single spinal nerve root.",
    memoryAid: "Think \"derma\" = skin, mapped root by root down the body.",
  },
  {
    id: "t2",
    term: "Myotome",
    definition: "A group of muscles innervated primarily by a single spinal nerve root, tested via resisted muscle contraction.",
  },
  {
    id: "t3",
    term: "Proprioception",
    definition: "The sense of one's own body position and movement in space, mediated by receptors in muscles, tendons, and joints.",
  },
  {
    id: "t4",
    term: "Nystagmus",
    definition: "Involuntary, rhythmic oscillation of the eyes, often assessed in vestibular and neurologic exams.",
  },
  {
    id: "t5",
    term: "Spondylolisthesis",
    definition: "Anterior (or posterior) slippage of one vertebral body relative to the one below it, often at L5-S1.",
  },
  {
    id: "t6",
    term: "Contracture",
    definition: "A fixed shortening of muscle, tendon, or connective tissue that limits joint range of motion.",
  },
  {
    id: "t7",
    term: "Clonus",
    definition: "Rhythmic, involuntary muscle contractions triggered by a sudden stretch, a sign of upper motor neuron involvement.",
  },
  {
    id: "t8",
    term: "Bradykinesia",
    definition: "Abnormal slowness of voluntary movement, a cardinal sign of Parkinson's disease.",
  },
  {
    id: "t9",
    term: "Orthostatic hypotension",
    definition: "A drop in blood pressure (typically ≥20 mmHg systolic or ≥10 mmHg diastolic) upon standing, causing dizziness or syncope risk.",
  },
  {
    id: "t10",
    term: "Fasciculation",
    definition: "Visible, spontaneous, brief muscle twitching under the skin, associated with lower motor neuron pathology.",
  },
  {
    id: "t11",
    term: "Dysdiadochokinesia",
    definition: "Impaired ability to perform rapid alternating movements, a classic sign of cerebellar dysfunction.",
  },
  {
    id: "t12",
    term: "Crepitus",
    definition: "A grating, crackling, or popping sensation/sound in a joint during movement, often from cartilage wear.",
  },
  {
    id: "t13",
    term: "Paresthesia",
    definition: "An abnormal sensation (tingling, prickling, or \"pins and needles\") often from nerve compression or irritation.",
  },
  {
    id: "t14",
    term: "Diaphoresis",
    definition: "Excessive, often sudden sweating, an important vital-sign-adjacent red flag during exertion.",
  },
  {
    id: "t15",
    term: "Osteophyte",
    definition: "A bony outgrowth (bone spur) that forms along joint margins, commonly seen with osteoarthritis.",
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic question of the day — same question for every student, rotating once
 *  per calendar day. Salted differently from termForDate() so the two don't always land
 *  on the same index together. */
export function questionForDate(dateKey: string): BoardQuestion {
  const index = hashString(`q:${dateKey}`) % BOARD_QUESTIONS.length;
  return BOARD_QUESTIONS[index];
}

/** Deterministic term of the day — see questionForDate() above. */
export function termForDate(dateKey: string): BoardTerm {
  const index = hashString(`t:${dateKey}`) % BOARD_TERMS.length;
  return BOARD_TERMS[index];
}

/** YYYY-MM-DD for "today" — the unit both the question and term rotate on. */
export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The NPTE's own per-question pace (~1.4 min, see /boards/npte-breakdown) times 3 —
 *  Daily Sharpening's default "beat the clock" target before a reader has any personal
 *  time on file (see User.boardsSharpeningTargetSeconds, DailySharpeningSession.tsx). */
export const NPTE_THREE_QUESTION_BENCHMARK_SECONDS = 252; // 4:12

