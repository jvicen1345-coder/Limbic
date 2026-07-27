import type { Article, WellnessArticle, WellnessVideo } from "@/lib/types";

/**
 * Bundled fallback content — used to fill in when a live source (Google News RSS, CMS
 * newsroom feed) is unreachable or returns too few results for a category, and as the
 * authoritative source for CE & Events (the mini calendar needs precise future event dates,
 * which a general news feed doesn't provide) and "Under Review" (an editorial workflow
 * status, not something live news carries). See lib/articles.ts for how live and seed
 * content are merged.
 */
export const SEED_ARTICLES: Article[] = [
  {
    id: "a1",
    type: "research",
    specialty: "ortho",
    breaking: true,
    title: "Blood-flow restriction training shows faster strength gains post-ACL repair",
    source: "Journal of Orthopaedic & Sports PT",
    date: "2026-07-22",
    readMins: 6,
    summary:
      "A new randomized trial finds BFR combined with low-load resistance work restores quad strength weeks earlier than standard protocols alone.",
    tags: ["ACL", "Strength training", "Post-surgical"],
    body: [
      "Researchers followed 84 patients across six clinics for 12 weeks after ACL reconstruction, comparing standard progressive resistance training to the same protocol paired with blood-flow restriction (BFR) cuffs at 40-50% occlusion.",
      "The BFR group reached 80% quadriceps strength symmetry at week 8 on average, compared to week 11 in the control group — with no difference in reported pain or swelling.",
      "Authors note the protocol requires proper cuff calibration and patient screening; they recommend it as an adjunct for patients plateauing on standard loading alone, not a wholesale replacement.",
    ],
  },
  {
    id: "a2",
    type: "guideline",
    specialty: "neuro",
    title: "APTA updates stroke rehab guidelines: earlier task-specific gait training endorsed",
    source: "APTA Clinical Practice Guidelines",
    date: "2026-07-18",
    readMins: 8,
    summary:
      "Revised guidance pushes task-specific, high-repetition gait training into the acute phase for medically stable patients — a shift from prior conservative timelines.",
    tags: ["Stroke", "Gait training", "Acute care"],
    body: [
      "The updated guideline, developed with a multidisciplinary panel, now grades early task-specific gait training as a strong recommendation for medically stable stroke patients, starting as early as 24-48 hours post-event.",
      "Body-weight-supported treadmill training and overground stepping practice are both endorsed, with dosage recommendations of at least 20 minutes of active stepping per session where tolerated.",
      "Clinicians are advised to pair the guideline with standard medical stability screening — the panel stresses this is a floor for readiness, not a substitute for clinical judgment.",
    ],
  },
  {
    id: "a3",
    type: "industry",
    specialty: "ortho",
    breaking: true,
    title:
      "CMS finalizes 2026 fee schedule: PT conversion factor rises to $33.40, but a new efficiency cut offsets it",
    source: "CMS CY2026 Physician Fee Schedule Final Rule",
    date: "2026-07-20",
    readMins: 5,
    summary:
      "For the first time, Medicare splits the conversion factor in two — most outpatient PT practices land on the non-APM rate of $33.40, up from $32.35 in 2025, but a new -2.5% efficiency adjustment on non-time-based codes offsets part of the gain.",
    tags: ["Reimbursement", "CMS", "Policy"],
    body: [
      "The CY2026 Medicare Physician Fee Schedule final rule (CMS-1832-F) introduced, for the first time in the program's history, two separate conversion factors: a higher rate for qualifying Alternative Payment Model participants, and a non-qualifying-APM rate of $33.40 that applies to the large majority of outpatient physical therapy practices — up from $32.35 in 2025.",
      "The headline increase is only part of the story: CMS paired it with a -2.5% efficiency adjustment applied to the intraservice portion of work RVUs for non-time-based codes, meaning some individual CPT codes will see smaller gains, no change, or a net decline even as the conversion factor rises.",
      "The rule also raised the KX modifier threshold to $2,480 and added three new remote therapeutic monitoring CPT codes. The APTA had pushed back on an earlier proposal to apply the efficiency adjustment to additional timed PT codes and says that advocacy shaped the final version.",
    ],
  },
  {
    id: "a4",
    type: "ce",
    specialty: "sports",
    title: "Free webinar: Return-to-sport testing batteries beyond hop tests",
    source: "Sports Physical Therapy Section",
    date: "2026-08-05",
    readMins: 3,
    summary:
      "A live 90-minute session covering force-plate asymmetry thresholds, psychological readiness scales, and how to build a defensible RTS decision matrix.",
    tags: ["Return to sport", "CE credit", "Webinar"],
    body: [
      "This live webinar (1.5 contact hours, most state boards accepted) walks through building a multi-domain return-to-sport battery beyond single-leg hop symmetry.",
      "Topics include force-plate asymmetry cutoffs, the ACL-RSI psychological readiness scale, and constructing a weighted decision matrix clinicians can defend to referring surgeons.",
      "Registration is free; a recording is available for 30 days for anyone who registers, whether or not they attend live.",
    ],
  },
  {
    id: "a5",
    type: "product",
    specialty: "geriatric",
    title: "New wearable balance sensor gets FDA clearance for fall-risk screening",
    source: "MedTech Dive",
    date: "2026-07-15",
    readMins: 4,
    summary:
      "A shoe-clip inertial sensor paired with a mobile app now has clearance for clinical fall-risk scoring, aiming to replace stopwatch-based TUG testing.",
    tags: ["Fall risk", "Wearables", "Assessment tools"],
    body: [
      "The device clips to a standard shoe and streams gait and sway data to a companion app during a Timed Up and Go test, producing an automated fall-risk score.",
      "The manufacturer reports the sensor detects subtle gait asymmetries a stopwatch-based TUG can miss, though independent validation studies are still limited.",
      "List price is under $200 per unit; several geriatric-focused outpatient chains are piloting it this quarter.",
    ],
  },
  {
    id: "a6",
    type: "research",
    specialty: "pediatric",
    title: "Constraint-induced movement therapy dosage: less may be enough",
    source: "Pediatric Physical Therapy",
    date: "2026-07-10",
    readMins: 5,
    summary:
      "A dose-comparison study in children with hemiplegic cerebral palsy finds 3-hour daily CIMT protocols match outcomes from the traditional 6-hour model.",
    tags: ["Cerebral palsy", "CIMT", "Pediatric"],
    body: [
      "Sixty children with hemiplegic cerebral palsy were randomized to either a traditional 6-hour daily constraint-induced movement therapy camp or a 3-hour condensed version over the same two-week span.",
      "Both groups showed statistically equivalent gains on the Assisting Hand Assessment at 6-month follow-up.",
      "Authors suggest the shorter protocol could widen access for families who cannot commit to full-day camps, without sacrificing measured outcomes.",
    ],
  },
  {
    id: "a7",
    type: "guideline",
    specialty: "ortho",
    title: "Low back pain guideline update: imaging thresholds tightened again",
    source: "Journal of Orthopaedic & Sports PT",
    date: "2026-07-08",
    readMins: 7,
    summary:
      "Revised recommendations narrow the red-flag criteria that should prompt imaging referral, aiming to cut unnecessary early MRI use further.",
    tags: ["Low back pain", "Imaging", "Guidelines"],
    body: [
      "The update refines red-flag screening criteria for cauda equina, fracture, malignancy and infection, removing several low-yield items that were prompting unnecessary imaging referrals.",
      "Clinicians are directed toward a structured watch-and-treat window of 4-6 weeks for uncomplicated acute low back pain before considering imaging, absent red flags.",
      "The panel cites continued evidence that early MRI in uncomplicated cases correlates with worse outcomes, not better ones, likely via nocebo and downstream intervention effects.",
    ],
  },
  {
    id: "a8",
    type: "industry",
    specialty: "neuro",
    title: "Telehealth PT visits get permanent parity in three more states",
    source: "State Legislative Tracker",
    date: "2026-07-05",
    readMins: 4,
    summary:
      "Illinois, Ohio and Florida join the list of states requiring commercial payers to reimburse telehealth PT visits at parity with in-person rates.",
    tags: ["Telehealth", "State policy", "Reimbursement"],
    stateSpecific: ["Illinois", "Ohio", "Florida"],
    body: [
      "New parity laws took effect this month in Illinois, Ohio and Florida, requiring commercial insurers to reimburse telehealth physical therapy visits at the same rate as in-person care.",
      "The laws apply to evaluation and follow-up visits alike, though several payers have carved out exceptions for initial evaluations pending further rulemaking.",
      "This brings the total number of states with permanent telehealth PT parity to nineteen.",
    ],
  },
  {
    id: "a9",
    type: "ce",
    specialty: "geriatric",
    title: "APTA Combined Sections Meeting: early-bird registration closes Friday",
    source: "APTA Combined Sections Meeting",
    date: "2026-08-01",
    readMins: 2,
    summary:
      "This year's CSM runs three geriatric-focused tracks including a full day on dementia-friendly exercise prescription.",
    tags: ["CE credit", "Conference", "Dementia care"],
    body: [
      "Early-bird pricing for the Combined Sections Meeting ends this Friday, with three dedicated geriatric tracks including a full-day session on dementia-friendly exercise prescription.",
      "Attendees can earn up to 18 contact hours across the four-day conference, with recorded sessions available afterward for registered attendees.",
    ],
  },
  {
    id: "a10",
    type: "product",
    specialty: "sports",
    title: "Portable force plates drop below $3,000 for the first time",
    source: "MedTech Dive",
    date: "2026-06-28",
    readMins: 3,
    summary:
      "A new entrant undercuts established force-plate brands significantly, putting objective jump and asymmetry testing within reach of smaller clinics.",
    tags: ["Force plates", "Assessment tools", "Equipment"],
    body: [
      "A newly launched dual force-plate system is priced under $3,000 for the pair, roughly half the cost of established competitors, while matching sampling rates used in most published RTS research.",
      "Early adopters report the companion software covers the standard jump battery — CMJ, drop jump, and isometric mid-thigh pull — out of the box.",
      "Independent accuracy validation against lab-grade plates is still pending, though the manufacturer has published its own comparison data.",
    ],
  },
  {
    id: "a11",
    type: "research",
    specialty: "neuro",
    title: "Vestibular rehab shows benefit for long-COVID dizziness, small trial finds",
    source: "Journal of Neurologic PT",
    date: "2026-06-20",
    readMins: 5,
    summary:
      "A pilot study of 32 patients with persistent post-viral dizziness reports meaningful gains on the Dizziness Handicap Inventory after 6 weeks of vestibular rehab.",
    tags: ["Vestibular", "Long COVID", "Dizziness"],
    body: [
      "Thirty-two patients reporting persistent dizziness more than three months after COVID-19 infection completed a 6-week vestibular rehabilitation program combining gaze stabilization and habituation exercises.",
      "Average Dizziness Handicap Inventory scores dropped from 52 to 24, a clinically meaningful reduction, though the study lacked a control arm.",
      "Authors call for a larger controlled trial but say the results support offering vestibular rehab as a first-line option for this population now.",
    ],
  },
  {
    id: "a12",
    type: "guideline",
    specialty: "pediatric",
    title: "Torticollis referral guideline lowers age threshold for PT evaluation",
    source: "Pediatric Physical Therapy",
    date: "2026-06-15",
    readMins: 4,
    summary:
      "Updated consensus guidance recommends PT evaluation for congenital muscular torticollis start at 4 weeks rather than 8, citing better outcomes with earlier intervention.",
    tags: ["Torticollis", "Infant care", "Guidelines"],
    body: [
      "The revised consensus statement recommends pediatric physical therapy evaluation begin at 4 weeks of age for infants with suspected congenital muscular torticollis, down from the prior 8-week threshold.",
      "Supporting data shows infants starting stretching and positioning programs before 6 weeks reach full range of motion in significantly fewer treatment sessions.",
      "The guideline also updates home-program handouts, now available in eleven languages through the sponsoring organization.",
    ],
  },
  {
    id: "a13",
    type: "industry",
    specialty: "sports",
    title: "NCAA expands mandatory concussion protocol to club-level athletics",
    source: "NCAA Sports Science Institute",
    date: "2026-06-10",
    readMins: 4,
    summary:
      "A new policy extends baseline testing and return-to-play sign-off requirements to club sports programs starting this fall, widening the referral pipeline for sports PTs.",
    tags: ["Concussion", "Policy", "Return to play"],
    body: [
      "Starting this fall, NCAA member schools must extend baseline cognitive and balance testing plus a physician-and-therapist sign-off return-to-play process to club-level athletics, not just varsity teams.",
      "Sports medicine staff expect this to meaningfully increase referral volume to physical therapy for vestibular and oculomotor rehab.",
      "Schools have until the start of fall competition to have protocols in place; compliance audits begin in the spring semester.",
    ],
  },
  {
    id: "a14",
    type: "research",
    specialty: "geriatric",
    title: "Dual-task gait training cuts fall rate more than strength training alone",
    source: "Journal of Geriatric PT",
    date: "2026-06-02",
    readMins: 6,
    summary:
      "A 6-month trial in community-dwelling older adults finds combining cognitive dual-tasks with gait training outperforms strength-only programs on fall incidence.",
    tags: ["Falls prevention", "Dual-task training", "Community-dwelling"],
    body: [
      "A 6-month randomized trial of 156 community-dwelling adults over 70 compared a dual-task gait and cognitive training program against a matched-dose strength-only program.",
      "The dual-task group had 34% fewer falls over the study period, despite similar gains in lower-extremity strength between groups.",
      "Researchers suggest the cognitive-motor interference training better transfers to real-world walking, where attention is divided, than strength training alone.",
    ],
  },
];

export const SEED_WELLNESS_ARTICLES: WellnessArticle[] = [
  {
    id: "w1",
    source: "Limbic Health & Wellness",
    date: "2026-07-21",
    readMins: 4,
    title: "Desk-bound? Five stretches to break up a sitting-heavy workday",
    summary:
      "Simple, no-equipment movement snacks that counter the hip flexor tightness and thoracic stiffness of long sitting stretches.",
    tags: ["Ergonomics", "Office health"],
  },
  {
    id: "w2",
    source: "Limbic Health & Wellness",
    date: "2026-07-16",
    readMins: 5,
    title: "How much sleep actually helps muscle recovery? The research so far",
    summary:
      'A look at what sleep-and-recovery studies really show, and why "8 hours" is a starting point, not a hard rule.',
    tags: ["Sleep", "Recovery"],
  },
  {
    id: "w3",
    source: "Limbic Health & Wellness",
    date: "2026-07-09",
    readMins: 3,
    title: "Walking pace vs. step count: which matters more for heart health",
    summary:
      "Recent cohort data suggests intensity may carry as much weight as total daily steps for cardiovascular outcomes.",
    tags: ["Cardio", "Walking"],
  },
  {
    id: "w4",
    source: "Limbic Health & Wellness",
    date: "2026-06-30",
    readMins: 4,
    title: "Hydration myths, retested: do you really need eight glasses a day",
    summary:
      "A plain-language rundown of what current evidence says about daily fluid needs and how they shift with activity level.",
    tags: ["Nutrition", "Hydration"],
  },
];

export const WELLNESS_VIDEOS: WellnessVideo[] = [
  { id: "v1", title: "10-minute morning mobility routine", source: "Limbic Studio", duration: "10:24" },
  { id: "v2", title: "Breathing techniques for stress and pain management", source: "Limbic Studio", duration: "7:48" },
  { id: "v3", title: "Safe strength training basics after 60", source: "Limbic Studio", duration: "12:05" },
];
