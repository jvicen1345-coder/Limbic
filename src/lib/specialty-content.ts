/**
 * Limbic Student Specialty Tracks — content for the six specialty hubs under
 * /student/specialties, and the five sport sub-pages under /student/specialties/sports/*.
 * NPTE system names and exam weights mirror components/BoardsTabs.tsx's own NPTE_SYSTEMS
 * so the two never disagree — don't edit those without checking that file too.
 */

import { questionsForSpecialty, type BoardQuestion } from "@/lib/board-content";

export type SpecialtySlug = "musculoskeletal" | "neurological" | "cardiopulmonary" | "pediatrics" | "geriatrics" | "sports";

export interface SpecialtyCondition {
  name: string;
  /** Acute / Chronic / Post-surgical, etc — a short category tag shown on the condition card. */
  category: string;
  /** Each string renders as its own paragraph inside the condition card's matching accordion.
   *  Left undefined where no source content exists yet — the accordion falls back to
   *  "Content coming soon" rather than inventing clinical detail. */
  clinicalPresentation?: string[];
  evaluation?: string[];
  intervention?: string[];
  outcomeMeasures?: string[];
}

export interface ClinicalPearl {
  title: string;
  body: string;
}

export interface SpecialTestRow {
  test: string;
  assesses: string;
}

export interface OutcomeMeasureRow {
  measure: string;
  assesses: string;
  population: string;
}

export interface NpteConnection {
  system: string;
  weight: string;
  note?: string;
}

export interface Specialty {
  slug: SpecialtySlug;
  name: string;
  /** var(--color-accent) for Musculoskeletal (brand blue), a literal hex for the other five. */
  color: string;
  description: string;
  whatPTsDo: string;
  whereTheyWork: string;
  patientPopulation: string;
  rotationTip: string;
  highYieldFocusAreas: string;
  clinicalPearls: ClinicalPearl[];
  specialTests: SpecialTestRow[];
  outcomeMeasuresTable: OutcomeMeasureRow[];
  /** Free-text reference notes rendered as paragraphs in the Clinical Tools tab's
   *  Documentation Pearls card. */
  documentationPearls: string[];
  boardQuestionTypes: string;
  conditions: SpecialtyCondition[];
  npte: NpteConnection;
}

export const SPECIALTIES: Specialty[] = [
  {
    slug: "musculoskeletal",
    name: "Musculoskeletal",
    color: "var(--color-accent)",
    description:
      "Musculoskeletal physical therapy addresses conditions affecting muscles, bones, joints, tendons, ligaments, and nerves of the peripheral system. It is the largest practice area in PT and forms the foundation of orthopedic and sports rehabilitation.",
    whatPTsDo:
      "Musculoskeletal PTs evaluate and treat orthopedic and post-surgical conditions using manual therapy, joint mobilization, exercise prescription, and outcome measure tracking to restore function and reduce pain.",
    whereTheyWork: "Outpatient orthopedic clinics, hospital-based outpatient departments, sports medicine clinics, and post-surgical rehabilitation settings.",
    patientPopulation:
      "Patients recovering from orthopedic surgery, acute injuries, and chronic joint or soft tissue conditions — spanning adolescent athletes through older adults with degenerative joint disease.",
    rotationTip: "Know your special tests cold. Examiners and CIs will ask you to perform and interpret them in real time.",
    highYieldFocusAreas: "ACL rehab progression, rotator cuff special tests, lumbar nerve root levels, joint mobilization grades, and post-surgical precautions.",
    clinicalPearls: [
      { title: "Anterior Cruciate Ligament Tear", body: "Lachman is the most sensitive test for ACL integrity. Pivot Shift is most specific." },
      { title: "Rotator Cuff Tear", body: "Subscapularis tears present with positive Lift-Off and Bear Hug tests." },
      { title: "Lumbar Disc Herniation", body: "Centralization with repeated extension predicts good conservative outcomes — McKenzie approach." },
      { title: "Shoulder Impingement", body: "Hawkins-Kennedy is most sensitive for impingement. Impingement tests alone cannot differentiate rotator cuff tear from bursitis." },
      { title: "Knee Osteoarthritis", body: "Exercise is first-line treatment for knee OA — stronger evidence than cortisone injections for long-term outcomes." },
    ],
    specialTests: [
      { test: "Lachman Test", assesses: "ACL integrity — sensitivity 85%, specificity 94%" },
      { test: "Anterior Drawer", assesses: "ACL integrity — sensitivity 62%, specificity 88%" },
      { test: "Pivot Shift", assesses: "ACL rotational instability — sensitivity 24%, specificity 98%" },
      { test: "Empty Can (Jobe's) Test", assesses: "Supraspinatus / rotator cuff tear — sensitivity 69%, specificity 66%" },
      { test: "Drop Arm Test", assesses: "Rotator cuff tear — sensitivity 35%, specificity 88%" },
      { test: "External Rotation Lag Sign", assesses: "Infraspinatus tear — sensitivity 56%, specificity 98%" },
      { test: "Straight Leg Raise", assesses: "Lumbar disc herniation / nerve root tension — sensitivity 92%, specificity 28%" },
      { test: "Slump Test", assesses: "Neural tension / lumbar disc herniation — sensitivity 84%, specificity 83%" },
      { test: "Well Leg Raise", assesses: "Lumbar disc herniation — specificity 90%" },
      { test: "Neer Test", assesses: "Subacromial impingement — sensitivity 72%, specificity 60%" },
      { test: "Hawkins-Kennedy Test", assesses: "Subacromial impingement — sensitivity 79%, specificity 59%" },
      { test: "Thessaly Test", assesses: "Meniscal pathology — sensitivity 66%, specificity 79%" },
      { test: "McMurray Test", assesses: "Meniscal pathology — sensitivity 53%, specificity 77%" },
    ],
    outcomeMeasuresTable: [
      { measure: "LEFS", assesses: "Lower extremity functional status (20 items, 0–80, MDC 9)", population: "Lower extremity orthopedic conditions" },
      { measure: "DASH", assesses: "Upper extremity disability (30 items, 0–100, lower is better)", population: "Upper extremity orthopedic conditions" },
      { measure: "IKDC", assesses: "Knee-specific function and symptoms (0–100, higher is better)", population: "Knee ligament and joint conditions" },
      { measure: "Oswestry Disability Index", assesses: "Low back pain-related disability (0–100%, higher is worse)", population: "Lumbar spine conditions" },
      { measure: "KOOS", assesses: "Knee injury and osteoarthritis outcome (0–100, higher is better)", population: "Knee osteoarthritis and post-surgical knee" },
    ],
    documentationPearls: [
      "Manual therapy grades — Maitland: Grade I, small amplitude at the beginning of range. Grade II, large amplitude not reaching end of range. Grade III, large amplitude to end of range. Grade IV, small amplitude at end of range. Grade V, thrust at end of range.",
      "Rehab phases — Acute (0–2 weeks): pain control, ROM, edema management. Subacute (2–6 weeks): progressive strengthening, neuromuscular control. Functional (6–12 weeks): task-specific training, return to activity.",
      "Total hip arthroplasty precautions — posterior approach: no flexion past 90°, no internal rotation, no adduction past midline. Anterior approach: no external rotation, no extension past neutral.",
    ],
    boardQuestionTypes:
      "Know weight bearing precautions cold — NWB, TTWB, PWB, WBAT, FWB — and which surgical procedures require which restrictions. Expect scenario-based questions on special test interpretation and post-surgical precautions.",
    conditions: [
      {
        name: "Anterior Cruciate Ligament Tear",
        category: "Acute",
        clinicalPresentation: [
          "Mechanism: Non-contact deceleration or cutting, valgus collapse, common in female athletes.",
          "Clinical presentation: Audible pop, immediate swelling, instability with pivoting.",
        ],
        evaluation: ["Special tests: Lachman Test (sensitivity 85%, specificity 94%), Anterior Drawer (sensitivity 62%, specificity 88%), Pivot Shift (sensitivity 24%, specificity 98%)."],
        intervention: ["Rehab phases: Acute — reduce swelling and restore ROM. Subacute — quad and hamstring strengthening. Return to sport — neuromuscular control, hop testing."],
        outcomeMeasures: ["Outcome measures: IKDC, LEFS, ACL-RSI.", "Board pearl: Lachman is the most sensitive test for ACL integrity. Pivot Shift is most specific."],
      },
      {
        name: "Rotator Cuff Tear",
        category: "Chronic",
        clinicalPresentation: [
          "Mechanism: Degenerative — age-related in older adults. Traumatic — fall on outstretched arm in younger patients.",
          "Clinical presentation: Lateral shoulder pain, weakness with elevation, night pain.",
        ],
        evaluation: ["Special tests: Empty Can (sensitivity 69%, specificity 66%), Drop Arm (sensitivity 35%, specificity 88%), External Rotation Lag Sign (sensitivity 56%, specificity 98%)."],
        intervention: ["Rehab focus: Rotator cuff strengthening — especially infraspinatus and teres minor. Scapular stabilization. Posterior capsule stretching."],
        outcomeMeasures: ["Outcome measures: DASH, Penn Shoulder Score, WORC.", "Board pearl: Subscapularis tears present with positive Lift-Off and Bear Hug tests."],
      },
      {
        name: "Lumbar Disc Herniation",
        category: "Acute",
        clinicalPresentation: [
          "Mechanism: Flexion with rotation under load. Disc nucleus pulposus migrates posterolaterally.",
          "Clinical presentation: Low back pain with radiculopathy — dermatomal pattern. Worse with sitting and flexion. Positive SLR.",
        ],
        evaluation: [
          "Special tests: Straight Leg Raise (sensitivity 92%, specificity 28%), Slump Test (sensitivity 84%, specificity 83%), Well Leg Raise (specificity 90%).",
          "Nerve root levels: L4 — medial foot, knee extension weakness. L5 — dorsal foot, great toe extension weakness. S1 — lateral foot, plantarflexion weakness, absent Achilles reflex.",
        ],
        outcomeMeasures: ["Outcome measures: Oswestry, NPRS, FABQ.", "Board pearl: Centralization with repeated extension predicts good conservative outcomes — McKenzie approach."],
      },
      {
        name: "Shoulder Impingement",
        category: "Chronic",
        clinicalPresentation: [
          "Mechanism: Subacromial space narrowing — poor scapular kinematics, rotator cuff weakness, forward head posture.",
          "Clinical presentation: Painful arc 60–120 degrees, anterior lateral shoulder pain, worse with overhead activity.",
        ],
        evaluation: ["Special tests: Neer (sensitivity 72%, specificity 60%), Hawkins-Kennedy (sensitivity 79%, specificity 59%), Empty Can."],
        intervention: ["Rehab focus: Posterior capsule stretching, lower trapezius and serratus anterior activation, rotator cuff strengthening."],
        outcomeMeasures: ["Board pearl: Hawkins-Kennedy is most sensitive for impingement. Impingement tests alone cannot differentiate rotator cuff tear from bursitis."],
      },
      {
        name: "Knee Osteoarthritis",
        category: "Chronic",
        clinicalPresentation: [
          "Mechanism: Articular cartilage degeneration — age, obesity, prior injury, malalignment.",
          "Clinical presentation: Morning stiffness less than 30 minutes, crepitus, joint line tenderness, bony enlargement.",
        ],
        evaluation: ["Special tests: Thessaly Test (sensitivity 66%, specificity 79%), McMurray (sensitivity 53%, specificity 77%) for concurrent meniscal pathology."],
        intervention: ["Rehab focus: Quad strengthening, aerobic conditioning, neuromuscular training, patient education on weight management."],
        outcomeMeasures: [
          "Outcome measures: KOOS, LEFS, WOMAC.",
          "Board pearl: Exercise is first-line treatment for knee OA — stronger evidence than cortisone injections for long-term outcomes.",
        ],
      },
    ],
    npte: { system: "Musculoskeletal", weight: "~24%" },
  },
  {
    slug: "neurological",
    name: "Neurological",
    color: "#7c3aed",
    description:
      "Neurological PT addresses conditions affecting the central and peripheral nervous system. It requires understanding of neuroplasticity, motor learning principles, and task-specific training to maximize functional recovery.",
    whatPTsDo:
      "Neurological PTs apply neuroplasticity and motor learning principles — task-specific training, gait rehabilitation, and spasticity management — to help patients recover function after CNS or PNS injury.",
    whereTheyWork: "Inpatient rehabilitation facilities, acute care hospitals, outpatient neuro clinics, and skilled nursing facilities.",
    patientPopulation:
      "Patients recovering from stroke, traumatic brain injury, or spinal cord injury, and those living with progressive neurological conditions like Parkinson disease and multiple sclerosis.",
    rotationTip: "Observe your patient moving before you touch them. The quality of movement tells you more than most tests.",
    highYieldFocusAreas: "Brunnstrom stages, Rancho Los Amigos levels, ASIA classification, cranial nerve function, gait deviations, and tone assessment.",
    clinicalPearls: [
      { title: "Stroke (CVA)", body: "Neuroplasticity is use-dependent. High repetition, task-specific, and meaningful practice drives cortical reorganization." },
      { title: "Traumatic Brain Injury", body: "Rancho Los Amigos Level IV patients are agitated and confused — modify environment, minimize stimulation, ensure safety." },
      {
        title: "Spinal Cord Injury",
        body: "Autonomic dysreflexia — BP spike above T6 injury — sit patient up, find and remove noxious stimulus immediately. Medical emergency.",
      },
      { title: "Parkinson Disease", body: "LSVT BIG — 16 sessions over 4 weeks, high intensity, high amplitude — evidence-based for Parkinson motor symptoms." },
      { title: "Multiple Sclerosis", body: "Fatigue management is central to MS rehab. Energy conservation and activity pacing are primary interventions." },
    ],
    specialTests: [
      { test: "Modified Ashworth Scale — 0", assesses: "No increase in muscle tone" },
      { test: "Modified Ashworth Scale — 1", assesses: "Slight increase, catch and release" },
      { test: "Modified Ashworth Scale — 1+", assesses: "Catch, then minimal resistance through remaining range" },
      { test: "Modified Ashworth Scale — 2", assesses: "Marked increase through most of the range" },
      { test: "Modified Ashworth Scale — 3", assesses: "Considerable increase, passive movement difficult" },
      { test: "Modified Ashworth Scale — 4", assesses: "Rigid in flexion or extension" },
      { test: "Trendelenburg Gait", assesses: "Weak gluteus medius, ipsilateral drop" },
      { test: "Steppage Gait", assesses: "Foot drop, weak dorsiflexors" },
      { test: "Scissor Gait", assesses: "Spastic hip adductors" },
      { test: "Antalgic Gait", assesses: "Shortened stance phase on the painful side" },
      { test: "Parkinsonian Gait", assesses: "Shuffling, festination, reduced arm swing" },
    ],
    outcomeMeasuresTable: [
      { measure: "Fugl-Meyer Assessment", assesses: "Motor recovery post-stroke", population: "Stroke" },
      { measure: "Berg Balance Scale", assesses: "Static and dynamic balance, fall risk", population: "Stroke, TBI, SCI, Parkinson disease, MS" },
      { measure: "FIM (Functional Independence Measure)", assesses: "Functional independence in ADLs and mobility", population: "Inpatient rehabilitation, stroke, TBI, SCI" },
      { measure: "10-Meter Walk Test", assesses: "Gait speed", population: "Stroke and general neurologic populations" },
      { measure: "6-Minute Walk Test", assesses: "Walking endurance and aerobic capacity", population: "Stroke and general neurologic populations" },
      { measure: "SCIM (Spinal Cord Independence Measure)", assesses: "Functional independence after spinal cord injury", population: "Spinal cord injury" },
      { measure: "EDSS (Expanded Disability Status Scale)", assesses: "Disability level and disease progression", population: "Multiple sclerosis" },
    ],
    documentationPearls: [
      "Transfer assistance levels — Dependent, Maximal assist (75%+), Moderate assist (50–74%), Minimal assist (25–49%), Contact guard, Supervision, Independent.",
      "Dermatome quick reference — C6: thumb. C7: middle finger. C8: little finger. L4: medial leg. L5: dorsal foot. S1: lateral foot.",
      "Gait deviations — Trendelenburg: weak glute med, ipsilateral drop. Steppage: foot drop, weak dorsiflexors. Scissor: spastic hip adductors. Antalgic: shortened stance on the painful side. Parkinsonian: shuffling, festination, reduced arm swing.",
    ],
    boardQuestionTypes: "Know your levels — spinal cord levels, cranial nerve numbers, Brunnstrom stages, Rancho levels. These are directly tested.",
    conditions: [
      {
        name: "Stroke (CVA)",
        category: "Acute",
        clinicalPresentation: [
          "Types: Ischemic (87%) — thrombotic or embolic. Hemorrhagic (13%) — intracerebral or subarachnoid.",
          "Clinical presentation: Contralateral hemiplegia or hemiparesis, aphasia, neglect, hemianopia, dysphagia.",
        ],
        evaluation: [
          "Brunnstrom stages: Stage 1 — flaccidity. Stage 2 — spasticity emerging. Stage 3 — spasticity peak, synergies. Stage 4 — some selective movement. Stage 5 — increased selective movement. Stage 6 — near normal.",
        ],
        intervention: ["Key interventions: Constraint-induced movement therapy, task-specific training, body weight supported treadmill training, electrical stimulation for shoulder subluxation."],
        outcomeMeasures: [
          "Outcome measures: Fugl-Meyer, Berg Balance Scale, FIM, 10-Meter Walk Test, 6-Minute Walk Test.",
          "Board pearl: Neuroplasticity is use-dependent. High repetition, task-specific, and meaningful practice drives cortical reorganization.",
        ],
      },
      {
        name: "Traumatic Brain Injury",
        category: "Acute",
        clinicalPresentation: [
          "Classification: Mild (GCS 13–15), Moderate (GCS 9–12), Severe (GCS 3–8).",
          "Clinical presentation: Cognitive deficits, behavioral changes, motor impairment, vestibular dysfunction, fatigue.",
        ],
        evaluation: [
          "Rancho Los Amigos levels: I — No response. II — Generalized response. III — Localized response. IV — Confused agitated. V — Confused inappropriate. VI — Confused appropriate. VII — Automatic appropriate. VIII — Purposeful appropriate.",
        ],
        intervention: ["Key interventions: Cognitive rest in acute phase, progressive vestibular rehab, dual-task training, balance training."],
        outcomeMeasures: ["Board pearl: Rancho Los Amigos Level IV patients are agitated and confused — modify environment, minimize stimulation, ensure safety."],
      },
      {
        name: "Spinal Cord Injury",
        category: "Acute",
        clinicalPresentation: [
          "Classification — ASIA: A — complete, no motor or sensory below level. B — sensory incomplete. C — motor incomplete, majority below grade 3. D — motor incomplete, majority grade 3 or better. E — normal.",
          "Syndromes: Central cord — greater UE than LE weakness. Brown-Sequard — ipsilateral motor loss, contralateral pain and temperature loss. Anterior cord — motor and pain loss, proprioception preserved. Cauda equina — LMN signs, bowel and bladder dysfunction.",
        ],
        evaluation: [
          "Key levels: C4 — diaphragm, may need ventilator. C5 — elbow flexion, deltoid. C6 — wrist extension. C7 — elbow extension. T1 — intrinsic hand muscles. L2 — hip flexion. L3 — knee extension. L4 — ankle dorsiflexion. L5 — great toe extension. S1 — ankle plantarflexion.",
        ],
        outcomeMeasures: [
          "Outcome measures: ASIA classification, SCIM, Berg Balance Scale.",
          "Board pearl: Autonomic dysreflexia — BP spike above T6 injury — sit patient up, find and remove noxious stimulus immediately. Medical emergency.",
        ],
      },
      {
        name: "Parkinson Disease",
        category: "Chronic",
        clinicalPresentation: [
          "Cardinal signs: Resting tremor, rigidity, bradykinesia, postural instability.",
          "Hoehn and Yahr Scale: Stage 1 — unilateral. Stage 2 — bilateral, no balance impairment. Stage 3 — bilateral, mild balance impairment. Stage 4 — severe disability, can walk. Stage 5 — wheelchair or bedridden.",
        ],
        intervention: [
          "Key interventions: LSVT BIG — high amplitude movements. Treadmill training. Rhythmic auditory stimulation for gait. Dual-task training.",
          "Freezing of gait strategies: Visual cues — laser line or floor stripes. Auditory cues — metronome. Attentional strategies — consciously think about stepping.",
        ],
        outcomeMeasures: ["Board pearl: LSVT BIG — 16 sessions over 4 weeks, high intensity, high amplitude — evidence-based for Parkinson motor symptoms."],
      },
      {
        name: "Multiple Sclerosis",
        category: "Chronic",
        clinicalPresentation: [
          "Types: Relapsing-remitting (85%), Primary progressive, Secondary progressive.",
          "Clinical presentation: Fatigue — most common and disabling symptom. Spasticity, weakness, ataxia, optic neuritis, cognitive changes, bladder dysfunction.",
          "Uhthoff phenomenon: Temporary worsening of symptoms with heat — avoid hot environments, use cooling strategies.",
        ],
        intervention: ["Key interventions: Energy conservation, aerobic exercise at moderate intensity, resistance training, vestibular rehab for ataxia."],
        outcomeMeasures: [
          "Outcome measures: EDSS, Multiple Sclerosis Impact Scale, Berg Balance Scale.",
          "Board pearl: Fatigue management is central to MS rehab. Energy conservation and activity pacing are primary interventions.",
        ],
      },
    ],
    npte: { system: "Neuromuscular and Nervous System", weight: "~20%" },
  },
  {
    slug: "cardiopulmonary",
    name: "Cardiopulmonary",
    color: "#dc2626",
    description:
      "Cardiopulmonary PT addresses patients with cardiac and pulmonary conditions across acute, subacute, and outpatient settings. It requires comfort with monitoring vitals, interpreting lab values, and modifying exercise intensity based on physiologic response.",
    whatPTsDo:
      "Cardiopulmonary PTs monitor vital signs, prescribe and progress aerobic exercise, and mobilize patients in the ICU and in cardiac and pulmonary rehab settings, adjusting intensity to physiologic response.",
    whereTheyWork: "ICUs, acute care hospitals, cardiac and pulmonary rehabilitation programs, and outpatient wellness settings.",
    patientPopulation:
      "Patients recovering from myocardial infarction, cardiac surgery, or exacerbations of chronic heart failure and COPD, as well as critically ill patients requiring early ICU mobility.",
    rotationTip: "Always check vitals before, during, and after treatment. Know your stopping criteria before you start.",
    highYieldFocusAreas: "NYHA classification, cardiac rehab phases, stopping criteria for exercise, ventilator basics, oxygen titration, and metabolic equivalents.",
    clinicalPearls: [
      {
        title: "Chronic Obstructive Pulmonary Disease",
        body: "Pursed lip breathing creates back pressure to keep airways open during exhalation — slows respiratory rate and improves gas exchange.",
      },
      { title: "Heart Failure", body: "MET levels — 1 MET is resting. Showering is 2-3 METs. Walking 3 mph is 3.5 METs. Use MET equivalents to grade activity progression." },
      { title: "Myocardial Infarction — Post-Cardiac Rehab", body: "Rate pressure product — HR x systolic BP — estimates myocardial oxygen demand. Used to gauge cardiac workload." },
      {
        title: "ICU Physical Therapy",
        body: "Early mobility in the ICU reduces ventilator days, ICU length of stay, and hospital-acquired weakness. Safety criteria must be met first.",
      },
    ],
    specialTests: [
      { test: "Heart Rate (resting)", assesses: "Normal range 60–100 bpm" },
      { test: "Respiratory Rate", assesses: "Normal range 12–20 breaths/min" },
      { test: "SpO2", assesses: "Above 95% normal; above 88% acceptable during exercise for COPD" },
      { test: "Blood Pressure (systolic)", assesses: "90–140 mmHg normal range for exercise" },
      { test: "Blood Pressure (diastolic)", assesses: "Below 90 mmHg" },
      { test: "Auscultation — Crackles", assesses: "Fluid or atelectasis" },
      { test: "Auscultation — Wheezes", assesses: "Airway obstruction" },
      { test: "Auscultation — Rhonchi", assesses: "Secretions in large airways" },
      { test: "Auscultation — Pleural Rub", assesses: "Pleuritis" },
    ],
    outcomeMeasuresTable: [
      {
        measure: "Borg RPE Scale (6–20)",
        assesses: "Perceived exertion — 11 light, 13 somewhat hard, 15 hard, 17 very hard; target 12–14 for moderate intensity",
        population: "General exercise prescription",
      },
      { measure: "Borg Dyspnea Scale (0–10)", assesses: "Perceived breathlessness; target 3–5 for cardiopulmonary exercise", population: "Cardiopulmonary rehabilitation" },
      {
        measure: "6-Minute Walk Test",
        assesses: "Walking endurance; male age 60–69 predicted 572m, female age 60–69 predicted 538m; MDC approximately 54m",
        population: "Cardiopulmonary conditions",
      },
    ],
    documentationPearls: [
      "MET reference — 1 MET is resting energy expenditure. Showering is 2–3 METs. Walking at 3 mph is approximately 3.5 METs. Use MET equivalents to grade and document activity progression.",
      "General stopping criteria for exercise — new or worsening chest pain, SpO2 dropping below the patient's individualized threshold, significant arrhythmia, or a drop in systolic BP with increased workload. Document vitals before, during, and after every session.",
    ],
    boardQuestionTypes: "Know your stopping criteria for exercise in cardiac and pulmonary patients. These are commonly tested as clinical scenarios.",
    conditions: [
      {
        name: "Chronic Obstructive Pulmonary Disease",
        category: "Chronic",
        clinicalPresentation: [
          "Pathophysiology: Chronic airflow limitation — emphysema destroys alveolar walls, chronic bronchitis causes airway inflammation and mucus production.",
          "GOLD Classification: Stage I mild — FEV1 ≥80% predicted. Stage II moderate — 50–79%. Stage III severe — 30–49%. Stage IV very severe — less than 30%.",
          "Clinical presentation: Dyspnea, chronic cough, sputum production, barrel chest, pursed lip breathing, use of accessory muscles.",
        ],
        intervention: [
          "Key interventions: Pursed lip breathing, diaphragmatic breathing, energy conservation, pulmonary rehab, aerobic exercise, secretion clearance.",
          "Exercise prescription: Moderate intensity — Borg scale 3–5 out of 10. Monitor O2 sat — stop if below 88%. RPE-based progression.",
        ],
        outcomeMeasures: ["Board pearl: Pursed lip breathing creates back pressure to keep airways open during exhalation — slows respiratory rate and improves gas exchange."],
      },
      {
        name: "Heart Failure",
        category: "Chronic",
        clinicalPresentation: [
          "Classification: HFrEF — reduced ejection fraction below 40%. HFpEF — preserved ejection fraction above 50%.",
          "NYHA Functional Classification: Class I — no symptoms with ordinary activity. Class II — slight limitation. Class III — marked limitation, comfortable at rest. Class IV — symptoms at rest.",
          "Clinical presentation: Dyspnea on exertion, orthopnea, paroxysmal nocturnal dyspnea, bilateral pitting edema, fatigue, S3 heart sound.",
        ],
        evaluation: ["Stopping criteria: Resting HR above 100, systolic BP above 180 or below 90, O2 sat below 90%, new chest pain, significant arrhythmia."],
        intervention: ["Key interventions: Low-to-moderate aerobic exercise, monitoring fluid status, energy conservation, progressive ambulation in acute setting."],
        outcomeMeasures: ["Board pearl: MET levels — 1 MET is resting. Showering is 2-3 METs. Walking 3 mph is 3.5 METs. Use MET equivalents to grade activity progression."],
      },
      {
        name: "Myocardial Infarction — Post-Cardiac Rehab",
        category: "Acute",
        clinicalPresentation: [
          "Phases: Phase I — inpatient, early mobilization. Phase II — outpatient supervised exercise 3–5x per week for 12 weeks. Phase III — community-based maintenance.",
          "Phase I progression: Day 1 — dangle, commode. Day 2 — stand, ambulate in room. Day 3 — ambulate in hall. Discharge — climb one flight of stairs if applicable.",
        ],
        evaluation: ["Stopping criteria: Chest pain, ST depression greater than 1mm, drop in systolic BP greater than 10mmHg with increased workload, significant arrhythmia, severe dyspnea."],
        intervention: ["Target HR: Resting HR plus 20–30 bpm or 40–60% HRR in early phases."],
        outcomeMeasures: ["Board pearl: Rate pressure product — HR x systolic BP — estimates myocardial oxygen demand. Used to gauge cardiac workload."],
      },
      {
        name: "ICU Physical Therapy",
        category: "Acute",
        clinicalPresentation: ["PICS — Post Intensive Care Syndrome: Physical weakness, cognitive impairment, psychological distress — PT addresses all three domains."],
        evaluation: ["Criteria to mobilize: HR 60–130, systolic BP 90–180, O2 sat above 88% on FiO2 less than 0.6, RR below 30, RASS score -2 to +2."],
        intervention: [
          "Early mobility levels: Level 1 — passive ROM in bed. Level 2 — active assisted ROM, bed mobility. Level 3 — sitting edge of bed. Level 4 — transfer to chair. Level 5 — standing. Level 6 — ambulation.",
          "Ventilator basics: Tidal volume, respiratory rate, FiO2, PEEP — know how to read the display and what values indicate instability.",
        ],
        outcomeMeasures: ["Board pearl: Early mobility in the ICU reduces ventilator days, ICU length of stay, and hospital-acquired weakness. Safety criteria must be met first."],
      },
    ],
    npte: { system: "Cardiopulmonary", weight: "~16%" },
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    color: "#16a34a",
    description:
      "Pediatric PT addresses developmental, neurological, orthopedic, and cardiopulmonary conditions in patients from birth through adolescence. It requires understanding of normal development to identify and treat deviations.",
    whatPTsDo:
      "Pediatric PTs assess development against expected milestones and use play-based, family-centered treatment to build motor skills and functional participation in home, school, and community settings.",
    whereTheyWork: "Early intervention programs, school systems, outpatient pediatric clinics, and children's hospitals.",
    patientPopulation: "Infants, children, and adolescents with developmental delays, cerebral palsy, congenital conditions, or acquired injuries affecting movement and participation.",
    rotationTip: "Get on the floor. Treat at the child's level — literally. Play is the work of childhood and it is your treatment medium.",
    highYieldFocusAreas: "Developmental milestones, primitive reflex integration, GMFCS levels, IDEA Part B vs Part C, and torticollis presentation.",
    clinicalPearls: [
      { title: "Cerebral Palsy", body: "GMFCS level does not change with age — it is a classification of functional level, not a prognosis for improvement." },
      { title: "Developmental Delay", body: "Early intervention under IDEA Part C — birth to 3. School-based services under IDEA Part B — age 3 to 21. Know the difference for boards." },
      { title: "Torticollis", body: "Head tilt toward affected SCM, chin rotated away — remember TILT toward, TURN away." },
      { title: "Developmental Coordination Disorder", body: "DCD is a diagnosis of exclusion. Rule out vision problems, hearing loss, neurological conditions, and intellectual disability first." },
    ],
    specialTests: [
      { test: "ATNR (Asymmetric Tonic Neck Reflex)", assesses: "Fencing posture — integrates by 6 months" },
      { test: "STNR (Symmetric Tonic Neck Reflex)", assesses: "Quadruped posturing — integrates 9–11 months" },
      { test: "Moro Reflex", assesses: "Startle / embrace response — integrates 4–6 months" },
      { test: "Palmar Grasp Reflex", assesses: "Grasp to palm pressure — integrates 5–6 months" },
      { test: "Plantar Grasp Reflex", assesses: "Toe curl to sole pressure — integrates 9–12 months" },
      { test: "Babinski Reflex", assesses: "Toe fanning to plantar stroke — normal until 12–24 months" },
    ],
    outcomeMeasuresTable: [
      {
        measure: "APGAR Score",
        assesses: "Appearance, Pulse, Grimace, Activity, Respiration — 0–2 each; 7–10 normal, 4–6 moderate concern, 0–3 immediate intervention needed",
        population: "Newborns, at 1 and 5 minutes after birth",
      },
      { measure: "GMFM-66", assesses: "Gross motor function change over time", population: "Cerebral palsy" },
      { measure: "PEDI", assesses: "Functional capabilities and performance in self-care, mobility, and social function", population: "Children with disabilities, ages 6 months–7.5 years" },
      { measure: "WeeFIM", assesses: "Functional independence in self-care, mobility, and cognition", population: "Children ages 6 months–18 years" },
    ],
    documentationPearls: [
      "Developmental milestones span gross motor, fine motor, language, and social domains from birth through age 5 — track against age-expected ranges, not isolated skills.",
      "School-based PT is a related service under IDEA, focused on educationally relevant goals — mobility in school, PE participation, and access to curriculum — rather than medically based goals.",
    ],
    boardQuestionTypes: "Primitive reflexes must integrate on schedule. Persistence beyond expected age indicates CNS dysfunction — a high yield board concept.",
    conditions: [
      {
        name: "Cerebral Palsy",
        category: "Chronic",
        clinicalPresentation: [
          "Definition: Non-progressive disorder of movement and posture due to injury to the developing brain.",
          "Types: Spastic (most common) — UMN signs, increased tone. Dyskinetic — involuntary movements, athetosis, chorea. Ataxic — cerebellar involvement, poor balance and coordination.",
        ],
        evaluation: [
          "Classification — GMFCS: Level I — walks without limitations. Level II — walks with limitations. Level III — walks with assistive device. Level IV — self-mobility with limitations, may use powered mobility. Level V — transported in manual wheelchair.",
        ],
        intervention: ["Key interventions: Selective dorsal rhizotomy post-op rehab, constraint-induced movement therapy for hemiplegia, hippotherapy, aquatic therapy, serial casting for contracture."],
        outcomeMeasures: [
          "Outcome measures: GMFM-66, PEDI, WeeFIM.",
          "Board pearl: GMFCS level does not change with age — it is a classification of functional level, not a prognosis for improvement.",
        ],
      },
      {
        name: "Developmental Delay",
        category: "Chronic",
        clinicalPresentation: [
          "Gross motor milestones: 2 months — head control prone. 4 months — rolls prone to supine. 6 months — sits with support. 9 months — pulls to stand. 12 months — walks independently. 18 months — runs. 24 months — goes up stairs. 36 months — pedals tricycle.",
        ],
        evaluation: ["Red flags: Not sitting by 9 months, not walking by 18 months, loss of previously acquired milestones at any age."],
        intervention: ["Key interventions: Task-specific practice, sensory integration, family education and home program, early intervention services (birth to 3)."],
        outcomeMeasures: ["Board pearl: Early intervention under IDEA Part C — birth to 3. School-based services under IDEA Part B — age 3 to 21. Know the difference for boards."],
      },
      {
        name: "Torticollis",
        category: "Chronic",
        clinicalPresentation: [
          "Types: Congenital muscular torticollis — SCM tightness or fibrosis. Positional — postural, no structural involvement.",
          "Clinical presentation: Head tilted toward affected side, face rotated away from affected side, SCM tightness or mass, plagiocephaly.",
        ],
        intervention: ["Key interventions: Passive stretching, active strengthening of contralateral neck muscles, repositioning education, tummy time."],
        outcomeMeasures: [
          "Outcome: Most resolve with conservative PT if treated before 1 year of age.",
          "Board pearl: Head tilt toward affected SCM, chin rotated away — remember TILT toward, TURN away.",
        ],
      },
      {
        name: "Developmental Coordination Disorder",
        category: "Chronic",
        clinicalPresentation: [
          "Clinical presentation: Difficulty learning motor tasks, poor handwriting, clumsiness, impacts ADLs and school performance — not explained by intellectual disability or neurological condition.",
        ],
        intervention: ["Key interventions: Task-oriented approach — practice specific skills. CO-OP — Cognitive Orientation to daily Occupational Performance. Aquatic therapy."],
        outcomeMeasures: ["Board pearl: DCD is a diagnosis of exclusion. Rule out vision problems, hearing loss, neurological conditions, and intellectual disability first."],
      },
    ],
    npte: {
      system: "Other Body Systems",
      weight: "~20%",
      note: "Pediatric content isn't its own NPTE system, it's tested as a population across every system above.",
    },
  },
  {
    slug: "geriatrics",
    name: "Geriatrics",
    color: "#c9853a",
    description:
      "Geriatric PT addresses the complex, multisystem changes of aging including falls, balance disorders, cognitive decline, polypharmacy effects, and mobility limitation. It requires a whole-person approach that considers environment, cognition, and social context alongside physical function.",
    whatPTsDo:
      "Geriatric PTs assess fall risk, balance, and functional mobility, then design multifactorial interventions that account for cognition, medications, and the home environment alongside physical impairments.",
    whereTheyWork: "Skilled nursing facilities, home health, outpatient geriatric clinics, and assisted living or continuing care communities.",
    patientPopulation: "Older adults managing falls and balance disorders, osteoporosis, cognitive decline, and the cumulative effects of multiple chronic conditions.",
    rotationTip: "Slow down. Listen more. Geriatric patients often present with multiple problems — resist the urge to treat everything at once.",
    highYieldFocusAreas: "Fall risk assessment tools and cutoff scores, osteoporosis T-scores, orthostatic hypotension definition, Berg Balance Scale scoring, and aging physiology changes.",
    clinicalPearls: [
      { title: "Falls and Fall Risk", body: "Single best predictor of future falls is history of prior falls. Always ask." },
      { title: "Osteoporosis", body: "Hip fracture in elderly has 20-30% one-year mortality. Fall prevention is life-saving intervention." },
      {
        title: "Dementia and Cognitive Decline",
        body: "Patients with dementia can still learn motor tasks through procedural memory even when declarative memory is impaired. Use repetitive practice.",
      },
      { title: "Orthostatic Hypotension", body: "Always check BP supine and standing in geriatric patients before ambulation — especially after prolonged bed rest." },
    ],
    specialTests: [
      { test: "Berg Balance Scale", assesses: "Static/dynamic balance and fall risk — 14 items, 0–56, below 45 indicates fall risk, MDC 4 points" },
      { test: "Timed Up and Go", assesses: "Functional mobility and fall risk — below 12s normal, above 12s fall risk, above 20s high fall risk" },
      { test: "30 Second Sit to Stand", assesses: "Lower extremity strength and fall risk, scored against age/sex norms" },
    ],
    outcomeMeasuresTable: [
      { measure: "30s Sit to Stand — Age 60–64", assesses: "Normative repetitions", population: "Women: 12 reps · Men: 14 reps" },
      { measure: "30s Sit to Stand — Age 65–69", assesses: "Normative repetitions", population: "Women: 11 reps · Men: 12 reps" },
      { measure: "30s Sit to Stand — Age 70–74", assesses: "Normative repetitions", population: "Women: 10 reps · Men: 12 reps" },
      { measure: "30s Sit to Stand — Age 75–79", assesses: "Normative repetitions", population: "Women: 10 reps · Men: 11 reps" },
    ],
    documentationPearls: [
      "Polypharmacy reference — 4+ medications significantly increases fall risk. High-risk classes: benzodiazepines, anticholinergics, antihypertensives, opioids, antidepressants.",
      "Aging physiology — VO2 max decreases 10% per decade after 30. Muscle mass decreases 1–2% per year after 50. Bone density decreases after menopause. Reaction time slows. Proprioception decreases.",
      "The Connexion Method connection — developed by Dr. Delia Vicencio, PT, DPT, provides a standardized system for home safety assessment, fall prevention, and aging-in-place planning. The eight-step protocol and Connexion Safety Score integrate AFIT findings, home environment assessment, and medical history into a comprehensive fall risk profile. See the Connexion Method card on the Overview tab to learn more.",
    ],
    boardQuestionTypes: "Know your cutoff scores — Berg below 45, TUG above 12 seconds, 30 Second Sit to Stand norms by age and sex. These appear in clinical scenario questions.",
    conditions: [
      {
        name: "Falls and Fall Risk",
        category: "Chronic",
        clinicalPresentation: [
          "Risk factors: Intrinsic — muscle weakness, balance impairment, cognitive decline, vision changes, polypharmacy (especially 4+ medications), orthostatic hypotension. Extrinsic — throw rugs, poor lighting, cluttered pathways, inappropriate footwear.",
        ],
        evaluation: ["Assessment tools: Berg Balance Scale (below 45 — fall risk), Timed Up and Go (above 12 seconds — fall risk), 30 Second Sit to Stand, 4-Stage Balance Test, Dynamic Gait Index."],
        intervention: ["Multifactorial intervention: Exercise — strength and balance. Medication review. Vision correction. Home hazard modification. Education."],
        outcomeMeasures: ["Board pearl: Single best predictor of future falls is history of prior falls. Always ask."],
      },
      {
        name: "Osteoporosis",
        category: "Chronic",
        clinicalPresentation: [
          "Diagnosis: DEXA scan. T-score -1.0 to -2.5 — osteopenia. T-score below -2.5 — osteoporosis.",
          "Fracture risk: Hip, vertebral compression, distal radius — most common osteoporotic fractures.",
        ],
        intervention: [
          "Exercise prescription: Weight-bearing aerobic exercise, progressive resistance training, balance training. Avoid spinal flexion with osteoporotic vertebral fractures.",
          "Precautions: No high-impact loading, avoid trunk flexion exercises, fall prevention is primary goal.",
        ],
        outcomeMeasures: ["Board pearl: Hip fracture in elderly has 20-30% one-year mortality. Fall prevention is life-saving intervention."],
      },
      {
        name: "Dementia and Cognitive Decline",
        category: "Chronic",
        clinicalPresentation: ["Stages: Mild — forgets recent events, word finding difficulty. Moderate — needs assistance with ADLs, behavioral changes. Severe — fully dependent, loses language."],
        intervention: [
          "PT considerations: Simplify instructions — one step at a time. Use demonstration over verbal instruction. Establish routine. Involve caregiver in all sessions. Monitor for wandering risk.",
          "Exercise benefit: Aerobic exercise slows cognitive decline — 150 minutes per week moderate intensity.",
        ],
        outcomeMeasures: [
          "Board pearl: Patients with dementia can still learn motor tasks through procedural memory even when declarative memory is impaired. Use repetitive practice.",
        ],
      },
      {
        name: "Orthostatic Hypotension",
        category: "Acute",
        clinicalPresentation: [
          "Definition: Drop in systolic BP of 20mmHg or diastolic 10mmHg within 3 minutes of standing.",
          "Clinical presentation: Dizziness or lightheadedness on standing, syncope, falls.",
        ],
        evaluation: ["Causes: Dehydration, medications (antihypertensives, diuretics, alpha blockers), prolonged bed rest, autonomic dysfunction."],
        intervention: ["Management: Dangle at edge of bed before standing, compression stockings, adequate hydration, slow position changes, medication review with physician."],
        outcomeMeasures: ["Board pearl: Always check BP supine and standing in geriatric patients before ambulation — especially after prolonged bed rest."],
      },
    ],
    npte: {
      system: "Musculoskeletal",
      weight: "~24%",
      note: "Geriatric content isn't its own NPTE system, it's tested as a population across every system above.",
    },
  },
  {
    slug: "sports",
    name: "Sports",
    color: "#ea580c",
    description:
      "Sports PT addresses acute and chronic musculoskeletal injuries in athletic populations across all levels of competition. It emphasizes return-to-sport criteria, performance optimization, and injury prevention alongside rehabilitation.",
    whatPTsDo:
      "Sports PTs manage acute and overuse athletic injuries with an emphasis on criteria-based return-to-sport testing, performance optimization, and injury prevention rather than fixed timelines.",
    whereTheyWork: "Outpatient sports medicine clinics, collegiate and professional athletic training rooms, and sideline or event coverage.",
    patientPopulation: "Athletes across all levels of competition recovering from acute injury or managing overuse conditions, with a focus on returning safely to sport-specific demands.",
    rotationTip: "Athletes want to know when they can return. Have an honest, criteria-based answer — not a timeline.",
    highYieldFocusAreas: "Ottawa rules, return to sport criteria, concussion protocol, ACL rehab progression, and shoulder instability tests.",
    clinicalPearls: [
      { title: "Concussion", body: "Rest beyond 24-48 hours is no longer recommended. Early controlled aerobic activity below symptom threshold improves recovery." },
      {
        title: "Patellofemoral Pain Syndrome",
        body: "Hip strengthening is more effective than isolated quad strengthening for PFPS — address proximal cause of distal problem.",
      },
      { title: "Ankle Sprain", body: "Chronic ankle instability develops in 40% of lateral ankle sprains — proprioceptive training is essential to prevent recurrence." },
      { title: "Shoulder Instability", body: "First-time dislocators under 25 have 75-90% recurrence rate — early surgical referral discussion is appropriate." },
    ],
    specialTests: [
      { test: "Single Hop for Distance", assesses: "Lower extremity limb symmetry — LSI = involved ÷ uninvolved × 100" },
      { test: "Triple Hop for Distance", assesses: "Lower extremity limb symmetry and power" },
      { test: "Triple Crossover Hop", assesses: "Lower extremity limb symmetry with rotational control" },
      { test: "6-Meter Timed Hop", assesses: "Lower extremity limb symmetry and speed" },
      { test: "Apprehension-Relocation Test", assesses: "Anterior shoulder instability — sensitivity 72%/81%, specificity 96%/91%" },
    ],
    outcomeMeasuresTable: [
      { measure: "Limb Symmetry Index (hop testing)", assesses: "Above 90% indicates acceptable symmetry for return to sport", population: "Lower extremity post-injury/post-surgical athletes" },
      { measure: "ACL-RSI", assesses: "Psychological readiness to return to sport; above 65 indicates readiness", population: "Post-ACL reconstruction athletes" },
      { measure: "Functional Movement Screen", assesses: "7 movement patterns scored 0–3; total below 14 associated with increased injury risk", population: "General athletic population" },
    ],
    documentationPearls: [
      "Sport-specific demands — Football: high contact, sprint, change of direction. Baseball: throwing mechanics, rotational power, overhead demand. Soccer: endurance, cutting, heading. Basketball: jumping, lateral movement, high volume. Hockey: skating mechanics, lateral power, upper body strength.",
    ],
    boardQuestionTypes: "Return to sport questions are increasingly common. Know your criteria — time alone is never sufficient. Function and symmetry drive the decision.",
    conditions: [
      {
        name: "Concussion",
        category: "Acute",
        clinicalPresentation: [
          "Definition: Functional brain injury — no structural damage on standard imaging. Results from biomechanical forces to the head or body.",
          "Clinical presentation: Headache, cognitive fog, dizziness, light and noise sensitivity, visual disturbance, emotional changes, sleep disruption.",
        ],
        intervention: [
          "Return to sport protocol — stepwise: Step 1 — symptom-limited activity. Step 2 — light aerobic exercise. Step 3 — sport-specific exercise. Step 4 — non-contact drills. Step 5 — full contact practice. Step 6 — return to competition. Minimum 24 hours per step, symptom-free.",
          "PT role: Vestibular rehab for dizziness and gaze instability, cervical treatment for cervicogenic headache, graded aerobic exercise protocol, exertion testing.",
        ],
        outcomeMeasures: ["Board pearl: Rest beyond 24-48 hours is no longer recommended. Early controlled aerobic activity below symptom threshold improves recovery."],
      },
      {
        name: "Patellofemoral Pain Syndrome",
        category: "Chronic",
        clinicalPresentation: [
          "Mechanism: Overuse, malalignment, training error, hip weakness leading to increased dynamic valgus.",
          "Clinical presentation: Anterior knee pain, worse with stairs, prolonged sitting, squatting, running. Positive Clarke sign, pain with patellar compression.",
        ],
        intervention: [
          "Key interventions: Hip abductor and external rotator strengthening, VMO activation, patellar taping, foot orthoses if pronation present, running gait retraining.",
          "Return to sport criteria: Pain-free with sport-specific activities, symmetrical strength, patient confidence.",
        ],
        outcomeMeasures: ["Board pearl: Hip strengthening is more effective than isolated quad strengthening for PFPS — address proximal cause of distal problem."],
      },
      {
        name: "Ankle Sprain",
        category: "Acute",
        clinicalPresentation: [
          "Classification: Grade I — ligament stretch, mild swelling, full WB. Grade II — partial tear, moderate swelling, antalgic gait. Grade III — complete tear, significant swelling, instability.",
        ],
        evaluation: [
          "Ottawa Ankle Rules — X-ray indicated if: Pain near malleolus AND inability to bear weight 4 steps immediately after injury AND at time of assessment, OR bony tenderness at posterior edge or tip of either malleolus.",
        ],
        intervention: [
          "Key interventions: RICE acutely, early protected weight bearing, peroneal strengthening, proprioception training, sport-specific agility.",
          "Return to sport criteria: Full ROM, symmetrical strength, single leg hop testing symmetry above 90%, sport-specific drills pain-free.",
        ],
        outcomeMeasures: ["Board pearl: Chronic ankle instability develops in 40% of lateral ankle sprains — proprioceptive training is essential to prevent recurrence."],
      },
      {
        name: "Shoulder Instability",
        category: "Acute",
        clinicalPresentation: ["Types: Traumatic — Bankart lesion, anterior dislocation. Atraumatic — multidirectional instability, hyperlaxity."],
        evaluation: [
          "Apprehension-Relocation Test: Apprehension in abduction and ER (sensitivity 72%, specificity 96%). Relief with posterior pressure — relocation (sensitivity 81%, specificity 91%).",
        ],
        intervention: [
          "Key interventions: Rotator cuff strengthening — dynamic stabilizers. Scapular stabilization. Proprioception. Posterior capsule stretching for GIRD.",
          "Return to sport: Full ROM, symmetrical rotator cuff strength, sport-specific loading, athlete confidence.",
        ],
        outcomeMeasures: ["Board pearl: First-time dislocators under 25 have 75-90% recurrence rate — early surgical referral discussion is appropriate."],
      },
    ],
    npte: {
      system: "Musculoskeletal",
      weight: "~24%",
      note: "Sports content isn't its own NPTE system, it's tested mostly within Musculoskeletal, with some Cardiopulmonary and Neuromuscular overlap.",
    },
  },
];

export function getSpecialty(slug: string): (Specialty & { specialtyQuestions: BoardQuestion[] }) | undefined {
  const specialty = SPECIALTIES.find((s) => s.slug === slug);
  if (!specialty) return undefined;
  return { ...specialty, specialtyQuestions: questionsForSpecialty(slug) };
}

export interface Sport {
  slug: string;
  name: string;
  injuries: string[];
  focus: string;
  conditions: SpecialtyCondition[];
  /** Overrides the parent Sports specialty's Patient Population overview text on this sport's own page. */
  patientPopulation: string;
  /** Overrides the parent Sports specialty's Clinical Pearls on this sport's own page. */
  clinicalPearls: ClinicalPearl[];
}

export const SPORTS: Sport[] = [
  {
    slug: "football",
    name: "Football",
    injuries: [
      "ACL and MCL tears",
      "Shoulder instability and AC joint sprains",
      "Concussion",
      "Hamstring strains",
      "Hip flexor strains",
      "Turf toe",
      "Cervical spine — stingers and burners",
    ],
    focus: "Contact injury management, return to play protocols.",
    conditions: [
      { name: "Concussion", category: "Acute" },
      { name: "ACL Tear", category: "Acute" },
      { name: "Shoulder Instability", category: "Chronic" },
      { name: "Cervical Spine Injury", category: "Acute" },
    ],
    patientPopulation:
      "Football players most commonly present with ACL and MCL tears, shoulder instability and AC joint sprains, concussion, hamstring strains, hip flexor strains, turf toe, and cervical spine stingers and burners.",
    clinicalPearls: [
      {
        title: "Stinger — Burner",
        body: "Brachial plexus traction or compression injury. Unilateral burning pain, weakness, numbness radiating down the arm. Resolves in minutes to hours. Bilateral symptoms or persistent symptoms — do not return to play, rule out cervical spine injury.",
      },
      {
        title: "Turf Toe",
        body: "First MTP hyperextension sprain. Grade I — stretch. Grade II — partial tear. Grade III — complete tear with instability. Rigid orthosis for return to play.",
      },
      {
        title: "Return to Play — Concussion",
        body: "Must be symptom-free at rest AND with exertion. Complete stepwise protocol. Cleared by licensed healthcare provider.",
      },
    ],
  },
  {
    slug: "baseball",
    name: "Baseball",
    injuries: ["UCL tear — Tommy John", "Rotator cuff pathology", "SLAP tear", "Hip flexor and oblique strains", "Ulnar neuritis"],
    focus: "Throwing mechanics, overhead athlete rehabilitation.",
    conditions: [
      { name: "UCL Tear", category: "Acute" },
      { name: "Rotator Cuff Injury", category: "Chronic" },
      { name: "Medial Epicondylitis", category: "Chronic" },
      { name: "SLAP Tear", category: "Chronic" },
    ],
    patientPopulation: "Baseball players most commonly present with UCL tears (Tommy John), rotator cuff pathology, SLAP tears, hip flexor and oblique strains, and ulnar neuritis.",
    clinicalPearls: [
      {
        title: "Throwing Phases",
        body: "Wind-up, stride, arm cocking, arm acceleration, arm deceleration, follow-through. Deceleration has the highest eccentric demand on the posterior rotator cuff.",
      },
      {
        title: "GIRD (Glenohumeral Internal Rotation Deficit)",
        body: "Loss of internal rotation greater than 18 degrees compared to the non-dominant side. Addressed with sleeper stretch and cross-body stretch.",
      },
      { title: "Pitch Count Guidelines", body: "Know age-appropriate pitch count limits for youth athletes — foundation of overuse prevention." },
    ],
  },
  {
    slug: "soccer",
    name: "Soccer",
    injuries: ["ACL tear — especially female athletes", "Ankle sprain", "Hamstring strain", "Groin and adductor strain", "Concussion", "Stress fractures"],
    focus: "Lower extremity biomechanics, heading-related concussion.",
    conditions: [
      { name: "ACL Tear", category: "Acute" },
      { name: "Ankle Sprain", category: "Acute" },
      { name: "Hamstring Strain", category: "Acute" },
      { name: "Concussion", category: "Acute" },
    ],
    patientPopulation:
      "Soccer players most commonly present with ACL tears (especially female athletes), ankle sprains, hamstring strains, groin and adductor strains, concussion, and stress fractures.",
    clinicalPearls: [
      {
        title: "Female ACL Risk",
        body: "2-8x higher than male athletes. Contributing factors — hormonal, anatomical (wider Q angle, narrower notch), neuromuscular (quad dominance, valgus collapse).",
      },
      {
        title: "FIFA 11+ Program",
        body: "Evidence-based warm-up program reducing ACL injury rate by 50% in female soccer players. Running, strength, plyometrics, balance.",
      },
      { title: "Heading and Concussion", body: "Repetitive sub-concussive impacts from heading — developing area of research. Youth soccer has age-based heading restrictions." },
    ],
  },
  {
    slug: "basketball",
    name: "Basketball",
    injuries: ["Ankle sprain", "Patellar tendinopathy — jumper's knee", "ACL tear", "Finger fractures and dislocations", "Stress fractures", "Plantar fasciitis"],
    focus: "Jump landing mechanics, quick direction change rehabilitation.",
    conditions: [
      { name: "Ankle Sprain", category: "Acute" },
      { name: "Patellar Tendinopathy", category: "Chronic" },
      { name: "Achilles Injury", category: "Chronic" },
      { name: "Finger Injury", category: "Acute" },
    ],
    patientPopulation:
      "Basketball players most commonly present with ankle sprains, patellar tendinopathy (jumper's knee), ACL tears, finger fractures and dislocations, stress fractures, and plantar fasciitis.",
    clinicalPearls: [
      {
        title: "Patellar Tendinopathy",
        body: "Overuse injury at the patellar tendon insertion. Pain with jumping, landing, stairs. Eccentric and heavy slow resistance training are the gold standard intervention. VISA-P (Victorian Institute of Sport Assessment) is the outcome measure.",
      },
      {
        title: "Jump Landing Mechanics",
        body: "High risk — knee valgus, trunk lateral lean, narrow base of support. Prevention programs — PEP, FIFA 11+, neuromuscular training targeting hip and knee control.",
      },
    ],
  },
  {
    slug: "hockey",
    name: "Hockey",
    injuries: ["Groin and adductor strain — most common", "Hip labral tear", "AC joint sprain", "Concussion", "Knee MCL sprain", "Wrist and hand injuries"],
    focus: "Skating mechanics, contact injury management, hip rehabilitation.",
    conditions: [
      { name: "Hip Flexor Strain", category: "Acute" },
      { name: "Groin Injury", category: "Acute" },
      { name: "Shoulder Separation", category: "Acute" },
      { name: "Knee Ligament Injury", category: "Acute" },
    ],
    patientPopulation:
      "Hockey players most commonly present with groin and adductor strains (the most common injury), hip labral tears, AC joint sprains, concussion, knee MCL sprains, and wrist and hand injuries.",
    clinicalPearls: [
      {
        title: "Adductor Strain",
        body: "Skating requires repeated powerful hip adduction. Weakness relative to abductors is the primary risk factor. An adductor-to-abductor strength ratio below 80% significantly increases risk.",
      },
      {
        title: "Skating Mechanics",
        body: "Lateral push-off demands hip abduction strength, external rotation, and single leg stability. Rehabilitation must restore skating-specific movement patterns.",
      },
      { title: "Concussion in Hockey", body: "High rate due to contact, board impacts, and falls on ice. Full stepwise return to skating required before return to contact." },
    ],
  },
];

export function getSport(slug: string): Sport | undefined {
  return SPORTS.find((s) => s.slug === slug);
}
