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
  /** Which /student/specialties hub(s) this question is relevant to (see
   *  lib/specialty-content.ts SpecialtySlug) — a question can belong to more than one, e.g.
   *  an ACL question is both Musculoskeletal and Sports. Undefined/empty for a question
   *  that isn't specialty-specific (general safety, integumentary staging, etc.) — it still
   *  appears in the main Daily Sharpening rotation, just not on any specialty page. */
  specialtySlugs?: string[];
  /** Which of the 5 NPTE_DOMAINS this question counts toward, when `domain` above isn't one
   *  of them. `domain` is a teaching label and includes practice areas the NPTE doesn't
   *  score separately ("Pediatrics", "Sports", "Geriatrics"); the exam only has the 5. Set
   *  per-question rather than mapped from `domain` wholesale because the right NPTE domain
   *  varies within a practice area — a Sports concussion question is Neuromuscular while a
   *  Sports ACL-strength one is Musculoskeletal. Undefined when `domain` is already one of
   *  the 5, which is the common case; read it through npteDomainOf() rather than directly. */
  npteDomain?: NpteDomain;
}

export const BOARD_QUESTIONS: BoardQuestion[] = [
  {
    id: "q1",
    domain: "Musculoskeletal",
    question: "A patient has 5/5 strength through range against maximal resistance. What MMT grade is this?",
    choices: ["3", "4", "4+", "5"],
    correctIndex: 3,
    explanation: "A grade of 5 (Normal) requires full ROM against gravity with maximal resistance and no break in the muscle's ability to hold the position.",
    specialtySlugs: ["musculoskeletal"],
  },
  {
    id: "q2",
    domain: "Musculoskeletal",
    question: "Which special test is most associated with detecting a torn ACL?",
    choices: ["Lachman test", "McMurray test", "Thessaly test", "Valgus stress test"],
    correctIndex: 0,
    explanation: "The Lachman test (20-30° of knee flexion, anterior tibial translation) is the most sensitive clinical test for ACL integrity.",
    specialtySlugs: ["musculoskeletal", "sports"],
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
    specialtySlugs: ["neurological"],
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
    specialtySlugs: ["neurological"],
  },
  {
    id: "q5",
    domain: "Cardiopulmonary",
    question: "What is the normal resting respiratory rate range for a healthy adult?",
    choices: ["4-8 breaths/min", "12-20 breaths/min", "24-32 breaths/min", "36-44 breaths/min"],
    correctIndex: 1,
    explanation: "Normal adult resting respiratory rate is 12-20 breaths per minute; outside that range is considered bradypnea or tachypnea.",
    specialtySlugs: ["cardiopulmonary"],
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
    specialtySlugs: ["cardiopulmonary"],
  },
  {
    id: "q7",
    domain: "Integumentary",
    question: "A pressure injury with full-thickness skin loss and visible subcutaneous fat, but no exposed bone, tendon, or muscle, is staged as:",
    choices: ["Stage 1", "Stage 2", "Stage 3", "Stage 4"],
    correctIndex: 2,
    explanation: "Stage 3 pressure injuries show full-thickness skin loss with visible fat; Stage 4 additionally exposes bone, tendon, or muscle.",
    specialtySlugs: ["geriatrics"],
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
    specialtySlugs: ["geriatrics"],
  },
  {
    id: "q9",
    domain: "Musculoskeletal",
    question: "Which gait deviation is classically associated with weak hip abductors on the stance limb?",
    choices: ["Trendelenburg gait", "Steppage gait", "Antalgic gait", "Scissoring gait"],
    correctIndex: 0,
    explanation: "A Trendelenburg gait, contralateral pelvic drop during stance, results from weak hip abductors (gluteus medius/minimus) on the stance side.",
    specialtySlugs: ["musculoskeletal"],
  },
  {
    id: "q10",
    domain: "Neuromuscular",
    question: "Which cranial nerve is responsible for facial expression muscles?",
    choices: ["CN V (Trigeminal)", "CN VII (Facial)", "CN IX (Glossopharyngeal)", "CN XII (Hypoglossal)"],
    correctIndex: 1,
    explanation: "CN VII (Facial) innervates the muscles of facial expression; CN V handles facial sensation and mastication.",
    specialtySlugs: ["neurological"],
  },
  {
    id: "q11",
    domain: "Cardiopulmonary",
    question: "Using the Borg RPE 6-20 scale, what range is generally targeted for moderate-intensity aerobic exercise?",
    choices: ["6-8", "9-11", "12-14", "18-20"],
    correctIndex: 2,
    explanation: "A Borg RPE of roughly 12-14 ('somewhat hard') is the commonly targeted range for moderate-intensity aerobic exercise.",
    specialtySlugs: ["cardiopulmonary"],
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
    specialtySlugs: ["musculoskeletal"],
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
    specialtySlugs: ["neurological"],
  },
  {
    id: "q15",
    domain: "Musculoskeletal",
    question: "Which ligament is most commonly injured with a valgus force to a slightly flexed knee?",
    choices: ["ACL", "PCL", "MCL", "LCL"],
    correctIndex: 2,
    explanation: "A valgus (inward) force at the knee most commonly stresses and injures the MCL on the medial side.",
    specialtySlugs: ["musculoskeletal", "sports"],
  },
  {
    id: "q16",
    domain: "Pediatrics",
    question: "By approximately what age should a typically developing infant sit independently without support?",
    choices: ["4 months", "6 months", "9 months", "12 months"],
    correctIndex: 1,
    explanation: "Independent, unsupported sitting is a gross motor milestone typically achieved around 6 months of age.",
    specialtySlugs: ["pediatrics"],
    npteDomain: "Neuromuscular",
  },
  {
    id: "q17",
    domain: "Pediatrics",
    question: "The Gross Motor Function Classification System (GMFCS) is most commonly used to classify functional mobility in children with which diagnosis?",
    choices: ["Down syndrome", "Cerebral palsy", "Duchenne muscular dystrophy", "Spina bifida"],
    correctIndex: 1,
    explanation: "The GMFCS was developed specifically for cerebral palsy and classifies self-initiated movement across five levels based on functional mobility.",
    specialtySlugs: ["pediatrics"],
    npteDomain: "Neuromuscular",
  },
  {
    id: "q18",
    domain: "Pediatrics",
    question: "Persistence of the Asymmetric Tonic Neck Reflex (ATNR) beyond approximately 6 months of age is considered:",
    choices: [
      "A normal variant with no clinical significance",
      "A possible sign of CNS pathology",
      "A sign of hearing impairment",
      "Unrelated to motor development",
    ],
    correctIndex: 1,
    explanation: "Primitive reflexes like the ATNR should integrate in the first several months of life; persistence beyond roughly 4-6 months is a red flag for CNS involvement.",
    specialtySlugs: ["pediatrics"],
    npteDomain: "Neuromuscular",
  },
  {
    id: "q19",
    domain: "Geriatrics",
    question: "A Timed Up and Go (TUG) time greater than approximately 12-13.5 seconds in a community-dwelling older adult is associated with:",
    choices: ["Normal fall risk", "Increased fall risk", "Improved balance confidence", "No clinical significance"],
    correctIndex: 1,
    explanation: "A TUG time above roughly 12-13.5 seconds is a widely used cutoff associated with increased fall risk in community-dwelling older adults.",
    specialtySlugs: ["geriatrics"],
    npteDomain: "Nonsystem / Safety",
  },
  {
    id: "q20",
    domain: "Geriatrics",
    question: "Which type of exercise provides the greatest benefit for maintaining bone mineral density in postmenopausal women?",
    choices: ["Weight-bearing/resistance exercise", "Static stretching", "Aquatic exercise", "Passive range of motion"],
    correctIndex: 0,
    explanation: "Weight-bearing and resistance exercise provide the mechanical loading stimulus most associated with maintaining or improving bone mineral density.",
    specialtySlugs: ["geriatrics"],
    npteDomain: "Musculoskeletal",
  },
  {
    id: "q21",
    domain: "Sports",
    question: "Current concussion return-to-sport guidelines recommend each stage of the graduated return-to-play protocol last a minimum of:",
    choices: ["1 hour", "24 hours", "1 week", "No minimum, based on symptoms alone"],
    correctIndex: 1,
    explanation: "Graduated return-to-play protocols (e.g. the Berlin Consensus statement) recommend at least 24 hours between stages, with the athlete remaining symptom-free before progressing.",
    specialtySlugs: ["sports"],
    npteDomain: "Neuromuscular",
  },
  {
    id: "q22",
    domain: "Sports",
    question: "Following ACL reconstruction, return-to-sport testing typically requires quadriceps strength to reach what percentage of the contralateral limb before clearance?",
    choices: ["50%", "70%", "90%", "100%+"],
    correctIndex: 2,
    explanation: "A limb symmetry index of at least 90% on quadriceps strength testing is a commonly used return-to-sport criterion after ACL reconstruction.",
    specialtySlugs: ["sports"],
    npteDomain: "Musculoskeletal",
  },
  {
    id: "q23",
    domain: "Integumentary",
    question: "A wound bed that is black and adherent, whether dry or leathery, is best described as containing:",
    choices: ["Granulation tissue", "Slough", "Eschar", "Epithelial tissue"],
    correctIndex: 2,
    explanation: "Eschar is black or brown, dry or leathery, adherent necrotic tissue — it typically must be identified (and often debrided) before a pressure injury underneath it can be accurately staged.",
    specialtySlugs: ["geriatrics"],
  },
  {
    id: "q24",
    domain: "Integumentary",
    question: "Which scale is most commonly used to predict a patient's risk of developing a pressure injury?",
    choices: ["Braden Scale", "Berg Balance Scale", "Modified Ashworth Scale", "Tinetti Scale"],
    correctIndex: 0,
    explanation: "The Braden Scale scores sensory perception, moisture, activity, mobility, nutrition, and friction/shear; a lower total score indicates higher pressure injury risk.",
    specialtySlugs: ["geriatrics"],
  },
  {
    id: "q25",
    domain: "Integumentary",
    question: "Compression therapy for lower extremity edema is contraindicated in a patient with:",
    choices: ["Venous insufficiency", "Lymphedema", "Significant arterial insufficiency", "Post-surgical swelling"],
    correctIndex: 2,
    explanation: "Compression is standard treatment for venous insufficiency and lymphedema, but is contraindicated with significant arterial insufficiency (e.g. a low ankle-brachial index), since it can further compromise arterial blood flow.",
    specialtySlugs: ["geriatrics"],
  },
  {
    id: "q26",
    domain: "Nonsystem / Safety",
    question: "Which type of isolation precaution requires a fitted N95 respirator in addition to standard precautions?",
    choices: ["Contact precautions", "Droplet precautions", "Airborne precautions", "Standard precautions alone"],
    correctIndex: 2,
    explanation: "Airborne precautions (e.g. tuberculosis, measles, varicella) require an N95 or higher respirator, since these pathogens travel in small particles that stay suspended in air; droplet precautions only require a standard surgical mask.",
  },
  {
    id: "q27",
    domain: "Nonsystem / Safety",
    question: "According to the WHO's \"Five Moments for Hand Hygiene,\" hand hygiene should occur:",
    choices: [
      "Only before touching a patient",
      "Before touching a patient and after touching a patient or their surroundings",
      "Only after visibly soiled contact",
      "Once per treatment session, regardless of number of contacts",
    ],
    correctIndex: 1,
    explanation: "The WHO's Five Moments call for hand hygiene before patient contact, before an aseptic task, after body fluid exposure risk, after patient contact, and after touching patient surroundings — not just once per session.",
  },
  {
    id: "q28",
    domain: "Nonsystem / Safety",
    question: "A gait belt is primarily used to:",
    choices: [
      "Improve postural alignment during gait training",
      "Provide the clinician a secure hold for fall prevention during transfers and ambulation",
      "Reduce lower extremity edema",
      "Substitute for an assistive device",
    ],
    correctIndex: 1,
    explanation: "A gait belt gives the clinician a secure point of control around the patient's trunk or hips to assist and catch the patient during transfers or ambulation — it's a safety tool, not a treatment device.",
  },
];

/** Every question tagged for `slug` (see BoardQuestion.specialtySlugs) — powers the "Board-
 *  Level Questions for This Specialty" preview on each /student/specialties page (see
 *  components/specialty/SpecialtyPageTemplate.tsx). A fixed, non-rotating set (unlike
 *  questionForDate below) since this is a specialty page's sample of the kind of questions
 *  covered, not part of the daily-streak Sharpening flow. */
export function questionsForSpecialty(slug: string): BoardQuestion[] {
  return BOARD_QUESTIONS.filter((q) => q.specialtySlugs?.includes(slug));
}

/** The 5 NPTE domains AtriumProgressChart's per-domain accuracy breakdown tracks (see
 *  app/(app)/student/page.tsx's DOMAIN_COLORS) — kept here, not just inline in that page, so
 *  the domain-practice pages below (see questionsForDomain, domainSlug) share the exact same
 *  canonical domain identity rather than each guessing at spelling/casing independently. */
export const NPTE_DOMAINS = ["Musculoskeletal", "Neuromuscular", "Cardiopulmonary", "Integumentary", "Nonsystem / Safety"] as const;

export type NpteDomain = (typeof NPTE_DOMAINS)[number];

/** Roughly how much of the real NPTE each domain is worth, per the FSBPT content outline —
 *  the same figures the Boards NPTE Breakdown tab publishes (see components/BoardsTabs.tsx
 *  NPTE_SYSTEMS). "Integumentary" carries the outline's whole "Other Body Systems" band
 *  (integumentary, metabolic/endocrine, GI/GU, multi-system), which is what our
 *  integumentary-tagged questions actually sample from; the two taxonomies differ only in
 *  that one name. Used to weight the daily pick below so a student's practice mix drifts
 *  toward the exam's own mix instead of the bank's — the bank is not evenly written across
 *  domains, so a uniform pick over-samples whichever domain happens to have most entries. */
export const NPTE_DOMAIN_WEIGHTS: Record<NpteDomain, number> = {
  Musculoskeletal: 24,
  Neuromuscular: 20,
  Cardiopulmonary: 16,
  Integumentary: 20,
  "Nonsystem / Safety": 20,
};

/** Which of the 5 scored NPTE domains a question counts toward — its explicit npteDomain
 *  when `domain` is a teaching label outside the 5 (see BoardQuestion.npteDomain), else
 *  `domain` itself. Falls back to "Nonsystem / Safety" for a domain that is neither, which
 *  is where the outline puts anything not tied to a body system anyway, so a future
 *  question added with a new label still lands somewhere real instead of vanishing from
 *  the weighting and the accuracy breakdown. */
export function npteDomainOf(question: BoardQuestion): NpteDomain {
  if (question.npteDomain) return question.npteDomain;
  const direct = NPTE_DOMAINS.find((d) => d === question.domain);
  return direct ?? "Nonsystem / Safety";
}

/** URL-safe slug for a domain name (e.g. "Nonsystem / Safety" -> "nonsystem-safety") — see
 *  app/(app)/student/domains/[slug]/page.tsx, linked to from AtriumProgressChart's domain
 *  rows. */
export function domainSlug(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Reverses domainSlug() against the fixed NPTE_DOMAINS list — null for anything that
 *  isn't one of the 5 real domains, so the domain-practice page can 404 rather than render
 *  an empty page for a typo'd or made-up slug. */
export function domainFromSlug(slug: string): (typeof NPTE_DOMAINS)[number] | null {
  return NPTE_DOMAINS.find((d) => domainSlug(d) === slug) ?? null;
}

/** Every question the NPTE would score under `domain` — same "fixed, non-rotating preview
 *  set" reasoning as questionsForSpecialty above, just filtered on the domain instead of
 *  specialtySlugs. Powers the "practice this domain" page a reader reaches from
 *  AtriumProgressChart or the Boards NPTE Breakdown tab. Matches on npteDomainOf() rather
 *  than the raw `domain` label, so the questions written under a practice-area label
 *  ("Pediatrics", "Sports", "Geriatrics") show up on the domain page that actually tests
 *  them instead of being reachable from no practice page at all. */
export function questionsForDomain(domain: string): BoardQuestion[] {
  return BOARD_QUESTIONS.filter((q) => npteDomainOf(q) === domain);
}

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

/** Look one piece of daily content back up by the id persisted on a DailyCompletion row
 *  (see that model's contentId). Undefined for an id that has since been removed from the
 *  bank, which every caller treats as "nothing to show for that row" rather than throwing. */
export function questionById(id: string): BoardQuestion | undefined {
  return BOARD_QUESTIONS.find((q) => q.id === id);
}

export function termById(id: string): BoardTerm | undefined {
  return BOARD_TERMS.find((t) => t.id === id);
}

/** Deterministic weighted draw: walks `weights` in order against a hash of `seed`, so the
 *  same seed always lands on the same entry and entries are hit in proportion to weight.
 *  Returns 0 for an empty/zero-weight list, which callers guard against before calling. */
function weightedIndex(weights: number[], seed: string): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  // hashString is a 32-bit unsigned value; scaling it into [0, total) this way keeps the
  // draw deterministic without floating-point modulo bias worth caring about at these sizes.
  let roll = hashString(seed) % total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

/** Today's question for one specific reader. Two things this does that questionForDate()
 *  above doesn't:
 *
 *  1. Weights the draw by NPTE domain (see NPTE_DOMAIN_WEIGHTS) instead of drawing
 *     uniformly over the bank, so the practice mix tracks the exam's mix rather than
 *     whichever domain happens to have the most questions written for it.
 *  2. Skips `recentIds` — what this reader has already answered lately — so a 28-question
 *     bank stops handing the same student the same question twice in a fortnight while
 *     leaving others unseen for months, which is what a plain hash-modulo does.
 *
 *  Still fully deterministic given (dateKey, userId, recentIds): the reader who reloads
 *  /boards without answering gets the same question back, since recentIds can't change
 *  until they answer something. Once they do answer, the served id is persisted on the
 *  DailyCompletion row and read back from there instead of recomputed (see
 *  boardQuestionForCompletion), so today's question is stable even as recentIds moves on.
 *
 *  Falls back to ignoring recentIds when it would exclude everything — a reader who has
 *  seen the whole bank still gets a question, just the least-recently-seen part of it. */
export function pickDailyQuestion(dateKey: string, userId: string, recentIds: readonly string[] = []): BoardQuestion {
  const recent = new Set(recentIds);
  const eligible = BOARD_QUESTIONS.filter((q) => !recent.has(q.id));
  const pool = eligible.length > 0 ? eligible : BOARD_QUESTIONS;
  const seed = `q:${dateKey}:${userId}`;

  // Only domains that still have an eligible question get weight, so an exhausted domain
  // doesn't silently swallow its share of the draw and bias the result toward one entry.
  const domains = NPTE_DOMAINS.filter((d) => pool.some((q) => npteDomainOf(q) === d));
  if (domains.length === 0) return pool[hashString(seed) % pool.length];
  const domain = domains[weightedIndex(domains.map((d) => NPTE_DOMAIN_WEIGHTS[d]), seed)];

  const inDomain = pool.filter((q) => npteDomainOf(q) === domain);
  return inDomain[hashString(`${seed}:${domain}`) % inDomain.length];
}

/** Today's term for one specific reader — same "don't repeat what they just saw" reasoning
 *  as pickDailyQuestion above, minus the domain weighting, since terms carry no domain. */
export function pickDailyTerm(dateKey: string, userId: string, recentIds: readonly string[] = []): BoardTerm {
  const recent = new Set(recentIds);
  const eligible = BOARD_TERMS.filter((t) => !recent.has(t.id));
  const pool = eligible.length > 0 ? eligible : BOARD_TERMS;
  return pool[hashString(`t:${dateKey}:${userId}`) % pool.length];
}

/** How many days back pickDailyQuestion/pickDailyTerm's `recentIds` window reaches. Sized
 *  against the bank rather than picked arbitrarily: it has to stay comfortably under the
 *  smaller of the two banks (BOARD_TERMS, 15) or every term would be excluded every day
 *  and the fallback above would run constantly, throwing away the whole point. */
export const RECENT_CONTENT_WINDOW_DAYS = 10;

/** YYYY-MM-DD for "today" — the unit both the question and term rotate on. */
export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The NPTE's own per-question pace (~1.4 min, see /boards/npte-breakdown) times 3 —
 *  Daily Sharpening's default "beat the clock" target before a reader has any personal
 *  time on file (see User.boardsSharpeningTargetSeconds, DailySharpeningSession.tsx). */
export const NPTE_THREE_QUESTION_BENCHMARK_SECONDS = 252; // 4:12

