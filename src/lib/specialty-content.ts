/**
 * Limbic Student Specialty Tracks — content for the six specialty hubs under
 * /student/specialties. Condition names, NPTE system names, and NPTE exam weights are real
 * (the weights mirror components/BoardsTabs.tsx's own NPTE_SYSTEMS so the two never disagree).
 * Overview/pearls/special-tests/outcome-measures/documentation/condition-detail content is
 * filled in specialty by specialty — SpecialtyPageTemplate falls back to "coming soon"
 * placeholders for any specialty or condition where these fields are still undefined.
 * Special test sensitivity/specificity figures are approximate, commonly-cited teaching
 * values that vary across studies — flag for clinician review before treating as exact.
 */

export type SpecialtySlug = "musculoskeletal" | "neurological" | "cardiopulmonary" | "pediatrics" | "geriatrics" | "sports";

export interface SpecialtyCondition {
  name: string;
  /** Acute / Chronic / Post-surgical, etc — a short category tag shown on the condition card. */
  category: string;
  /** Accordion content on the Key Conditions tab. Undefined sections render "Content coming soon". */
  presentation?: string;
  evaluation?: string;
  intervention?: string;
  outcomeMeasures?: string;
}

export interface NpteConnection {
  system: string;
  weight: string;
  note?: string;
}

export interface SpecialtyOverview {
  whatTheyDo: string;
  whereTheyWork: string;
  patientPopulation: string;
  highYieldFocusAreas: string[];
}

export interface ClinicalPearl {
  title: string;
  body: string;
}

export interface SpecialTest {
  test: string;
  assesses: string;
  /** Approximate, commonly-cited teaching values — vary by study. Omit if not well established. */
  sensitivity?: string;
  specificity?: string;
}

export interface OutcomeMeasureRef {
  measure: string;
  assesses: string;
  population: string;
}

export interface Specialty {
  slug: SpecialtySlug;
  name: string;
  /** var(--color-accent) for Musculoskeletal (brand blue), a literal hex for the other five. */
  color: string;
  description: string;
  conditions: SpecialtyCondition[];
  npte: NpteConnection;
  overview?: SpecialtyOverview;
  pearls?: ClinicalPearl[];
  specialTests?: SpecialTest[];
  outcomeMeasures?: OutcomeMeasureRef[];
  documentationPearls?: string[];
  questionTypes?: string;
}

export const SPECIALTIES: Specialty[] = [
  {
    slug: "musculoskeletal",
    name: "Musculoskeletal",
    color: "var(--color-accent)",
    description: "Orthopedic conditions, manual therapy, joint pathology, post-surgical rehab, and outcome measures.",
    conditions: [
      {
        name: "Rotator Cuff Pathology",
        category: "Chronic",
        presentation:
          "Insidious lateral/anterior shoulder pain, worse with overhead activity and at night; weakness with resisted abduction or external rotation; painful arc roughly between 60° and 120° of abduction.",
        evaluation:
          "A cluster of Hawkins-Kennedy, Neer, a painful arc, and infraspinatus/empty-can weakness raises suspicion for impingement or a cuff tear; a positive drop-arm sign suggests a full-thickness tear. MRI or ultrasound confirms tear size and location.",
        intervention:
          "Early-phase pain modulation and rotator cuff/scapular stabilizer strengthening (isometric progressing to isotonic), posture and scapular kinematic correction, then progressive loading toward functional overhead tasks. Surgical repair is reserved for full-thickness tears with functional limitation or failed conservative care.",
        outcomeMeasures: "DASH, ASES (American Shoulder and Elbow Surgeons score), Penn Shoulder Score.",
      },
      {
        name: "ACL Reconstruction",
        category: "Post-surgical",
        presentation:
          "Status-post graft reconstruction (autograft or allograft); early phase marked by effusion, quadriceps activation deficits (arthrogenic muscle inhibition), and limited terminal knee extension.",
        evaluation:
          "Track ROM (full knee extension is an early priority milestone), quad strength via MMT or dynamometry, effusion (sweep test or girth measurement), and gait quality. Lachman and pivot-shift are pre-operative diagnostic tests, not used to stress the healing graft post-op.",
        intervention:
          "Phase-based rehab: early focus on regaining extension ROM and quad activation (NMES or blood flow restriction training as adjuncts), progressing through closed-chain strengthening, neuromuscular control, and sport-specific plyometric training. Return-to-sport criteria typically include a quad limb symmetry index of at least 90% plus passing hop testing.",
        outcomeMeasures: "KOOS, IKDC (International Knee Documentation Committee), single-leg hop test battery, quad strength LSI.",
      },
      {
        name: "Total Knee Arthroplasty",
        category: "Post-surgical",
        presentation:
          "Status-post TKA; early post-op pain, swelling, and quad inhibition limit ROM and weight-bearing tolerance. Goal is restoring functional ROM and independent, safe gait.",
        evaluation:
          "Monitor ROM (targeting near-full extension and roughly 90°+ flexion within the first couple weeks), effusion, wound status, and functional mobility — bed mobility, transfers, and gait with the appropriate assistive device.",
        intervention:
          "Early mobilization and weight-bearing as tolerated per surgeon protocol (often starting the day of or after surgery), ROM and quad activation exercises, edema management, gait training, and progression to functional strengthening. Screen for infection or DVT signs at every visit.",
        outcomeMeasures: "Knee Society Score, WOMAC, KOOS, Timed Up and Go.",
      },
      {
        name: "Lumbar Disc Herniation",
        category: "Acute",
        presentation:
          "Low back pain often radiating below the knee in a dermatomal pattern, sometimes with paresthesia, myotomal weakness, or reflex changes depending on the level involved; symptoms often worsen with flexion or prolonged sitting.",
        evaluation:
          "Straight leg raise and slump test assess neural tension; a myotome/dermatome/reflex screen localizes the level; McKenzie repeated-movement testing identifies a directional preference and checks for centralization. Red flags — cauda equina signs, progressive neuro deficit — warrant urgent referral.",
        intervention:
          "Directional-preference exercise (often extension-biased) when centralization is present, neural mobilization, core and lumbopelvic stabilization, graded return to activity, and pain-science education. Surgery is reserved for progressive neurological deficit or failed conservative management.",
        outcomeMeasures: "Oswestry Disability Index, Roland-Morris Disability Questionnaire, Numeric Pain Rating Scale.",
      },
      {
        name: "Lateral Epicondylalgia",
        category: "Chronic",
        presentation:
          "Lateral elbow pain aggravated by gripping or wrist extension; point tenderness over the lateral epicondyle and common extensor origin; pain reproduced with resisted wrist extension and passive wrist flexion with the elbow extended.",
        evaluation:
          "Cozen's test and Mill's test reproduce lateral elbow pain; grip dynamometry often shows a measurable strength deficit compared to the uninvolved side.",
        intervention:
          "Progressive tendon loading — isometric progressing to heavy slow resistance or eccentric wrist extensor training — activity and ergonomic modification, counterforce bracing as an adjunct, and manual therapy for adjacent joint mobility. Corticosteroid injection can give short-term relief but has been associated with worse long-term outcomes.",
        outcomeMeasures: "Patient-Rated Tennis Elbow Evaluation (PRTEE), grip strength, DASH.",
      },
      {
        name: "Shoulder Impingement Syndrome",
        category: "Chronic",
        presentation:
          "Anterolateral shoulder pain with overhead reaching, often with a painful arc; frequently coexists with rotator cuff tendinopathy or subacromial bursitis.",
        evaluation:
          "Neer and Hawkins-Kennedy tests, a painful arc sign, and scapular assistance/retraction tests — symptom relief with manual correction suggests a scapular dyskinesis contribution.",
        intervention:
          "Rotator cuff and scapular stabilizer strengthening, posture and scapular kinematic retraining, activity modification to reduce repetitive overhead loading, and manual therapy for thoracic and glenohumeral mobility, progressing to sport- or occupation-specific overhead loading.",
        outcomeMeasures: "DASH, ASES, Shoulder Pain and Disability Index (SPADI).",
      },
    ],
    npte: { system: "Musculoskeletal", weight: "~24%" },
    overview: {
      whatTheyDo:
        "Outpatient orthopedic PTs evaluate movement- and load-related impairments — restricted range of motion, strength deficits, pain with loading — and build progressive rehab programs combining manual therapy, therapeutic exercise, and patient education to restore function after injury or surgery.",
      whereTheyWork:
        "Outpatient orthopedic clinics, sports medicine practices, hospital-based outpatient departments, occupational and work-conditioning programs, and inpatient orthopedic/surgical units for early post-op mobilization.",
      patientPopulation:
        "Spans adolescents to older adults: post-surgical patients (total joint arthroplasty, ACL reconstruction, rotator cuff repair), acute injuries (sprains, strains, fractures), and chronic overuse or degenerative conditions (tendinopathy, osteoarthritis, chronic low back pain).",
      highYieldFocusAreas: [
        "Capsular patterns and normal end-feels for the shoulder, hip, knee, and spine",
        "Post-surgical protocols and precautions — weight-bearing status, ROM restrictions, tissue-healing timelines",
        "Special tests and their diagnostic accuracy for shoulder, knee, hip, and spine pathology",
        "Joint mobilization grades (Maitland I–V, Kaltenborn) and indications for each",
        "Tissue-healing phases (inflammatory, proliferative, remodeling) and matching exercise progression to them",
        "Differentiating mechanical from non-mechanical, red-flag presentations",
      ],
    },
    pearls: [
      {
        title: "Centralization predicts a good outcome",
        body: "In lumbar disc-related pain, symptoms that centralize — move from the leg toward the spine — with repeated end-range movements (McKenzie method) are a strong positive prognostic sign and guide which direction to load.",
      },
      {
        title: "Quad strength, not just time, clears return to sport",
        body: "After ACL reconstruction, most protocols require a quadriceps limb symmetry index of at least 90% plus hop testing and psychological readiness before return to sport — calendar time alone is not a sufficient criterion.",
      },
      {
        title: "The shoulder's capsular pattern",
        body: "The glenohumeral joint's capsular pattern limits external rotation the most, then abduction, then internal rotation — useful for distinguishing a capsular restriction (e.g., adhesive capsulitis) from a non-capsular one.",
      },
      {
        title: "Cluster tests beat single special tests",
        body: "No single special test for rotator cuff pathology or meniscal tears is reliably diagnostic alone; clustering tests — e.g., Hawkins-Kennedy plus a painful arc plus infraspinatus weakness for impingement — improves diagnostic accuracy.",
      },
      {
        title: "Early motion protects a post-op joint",
        body: "For TKA, early initiation of ROM and weight-bearing per surgeon protocol reduces the risk of arthrofibrosis and is generally prioritized over aggressive early strengthening.",
      },
    ],
    specialTests: [
      { test: "Lachman Test", assesses: "ACL integrity", sensitivity: "~85%", specificity: "~94%" },
      { test: "Hawkins-Kennedy Test", assesses: "Subacromial impingement", sensitivity: "~79%", specificity: "~59%" },
      { test: "McMurray Test", assesses: "Meniscal tear", sensitivity: "~70%", specificity: "~71%" },
      { test: "Thomas Test", assesses: "Hip flexor (iliopsoas/rectus femoris) tightness" },
      { test: "Slump Test", assesses: "Neural tension / lumbar radiculopathy", sensitivity: "~84%", specificity: "~83%" },
    ],
    outcomeMeasures: [
      { measure: "Lower Extremity Functional Scale (LEFS)", assesses: "Functional limitation from lower-extremity conditions", population: "General adult LE population" },
      { measure: "DASH", assesses: "Upper-extremity function and disability", population: "Adult UE conditions" },
      { measure: "Oswestry Disability Index (ODI)", assesses: "Low back pain-related disability", population: "Adult lumbar spine population" },
      { measure: "Knee Injury and Osteoarthritis Outcome Score (KOOS)", assesses: "Knee-specific symptoms and function", population: "Post-ACL reconstruction and knee OA" },
      { measure: "Patient-Specific Functional Scale (PSFS)", assesses: "Individualized functional limitation, patient-defined", population: "General MSK population" },
    ],
    documentationPearls: [
      "Pair objective ROM/strength measures with a patient-reported outcome score at eval and reassessment to justify medical necessity.",
      "State weight-bearing status and any post-surgical precautions explicitly in every note for post-op patients.",
      "Tie each intervention to a stated functional goal ('improved hip flexor strength to reduce compensation during gait') rather than documenting exercises in isolation.",
    ],
    questionTypes:
      "Expect scenario-based items that describe a patient's post-surgical day/week, special test findings, or a specific ROM/strength deficit, then ask you to select the most appropriate special test, intervention, or precaution.",
  },
  {
    slug: "neurological",
    name: "Neurological",
    color: "#7c3aed",
    description: "Stroke, TBI, SCI, Parkinson's, MS, gait analysis, and neuro-rehabilitation interventions.",
    conditions: [
      {
        name: "Ischemic Stroke",
        category: "Acute",
        presentation:
          "Sudden-onset focal neurological deficit — often unilateral weakness, sensory loss, aphasia, or a visual field cut — corresponding to the affected vascular territory (e.g., MCA stroke commonly causing contralateral face and arm weakness greater than leg weakness).",
        evaluation:
          "The NIH Stroke Scale quantifies severity; motor recovery is tracked through the Brunnstrom stages of recovery; standardized balance, gait, and functional measures (Berg Balance Scale, FIM) guide the plan of care and discharge planning.",
        intervention:
          "Early mobilization, task-specific and repetitive practice of functional movements, constraint-induced movement therapy for appropriate upper-extremity candidates, gait training, and compensatory strategy training for persistent deficits, coordinated closely with speech and occupational therapy.",
        outcomeMeasures: "NIH Stroke Scale, Berg Balance Scale, Fugl-Meyer Assessment, Functional Independence Measure.",
      },
      {
        name: "Traumatic Brain Injury",
        category: "Acute",
        presentation:
          "Variable presentation depending on injury severity and location — ranges from mild concussion (headache, dizziness, cognitive fog) to severe TBI with impaired arousal, motor deficits, and cognitive-behavioral changes.",
        evaluation:
          "The Glasgow Coma Scale grades severity acutely; the Rancho Los Amigos Scale tracks cognitive-behavioral recovery over time; balance, vestibular, and dual-task testing screen for deficits that impair safe return to activity.",
        intervention:
          "Rehab is matched to the Rancho level — from basic arousal and orientation stimulation at low levels to high-level balance, cognitive-motor dual-tasking, and community re-integration training at higher levels — with graded return-to-activity protocols for concussion.",
        outcomeMeasures: "Glasgow Coma Scale, Rancho Los Amigos Level of Cognitive Functioning Scale, Disability Rating Scale.",
      },
      {
        name: "Spinal Cord Injury",
        category: "Acute",
        presentation:
          "Loss of motor and/or sensory function below the level of injury; presentation and prognosis depend heavily on whether the injury is complete or incomplete and on its neurological level.",
        evaluation:
          "The ASIA Impairment Scale (A–E) classifies completeness and level via a standardized motor/sensory exam. Screen continuously for autonomic dysreflexia in injuries at or above T6.",
        intervention:
          "Early mobilization and respiratory management, strengthening of remaining innervated musculature, wheelchair skills and pressure-relief training, transfer and bed mobility training, and — for incomplete injuries — locomotor/gait training. Patient education on skin integrity and autonomic dysreflexia is essential throughout.",
        outcomeMeasures: "ASIA Impairment Scale, Spinal Cord Independence Measure (SCIM), Walking Index for Spinal Cord Injury (WISCI).",
      },
      {
        name: "Parkinson's Disease",
        category: "Chronic",
        presentation:
          "Progressive bradykinesia, resting tremor, rigidity, and postural instability; gait is often shuffling with reduced arm swing, and freezing of gait can occur, especially at transitions like doorways and turns.",
        evaluation:
          "The UPDRS (Unified Parkinson's Disease Rating Scale) and its Motor Examination section, along with the Pull Test for postural instability, quantify severity; gait and freezing are assessed with observation and validated freezing-of-gait questionnaires.",
        intervention:
          "Big-amplitude movement training (e.g., LSVT BIG), external cueing — visual, auditory, or rhythmic — to reduce freezing, balance and fall-prevention training, and aerobic exercise, which has disease-modifying evidence in the literature.",
        outcomeMeasures: "UPDRS, Berg Balance Scale, Timed Up and Go, Freezing of Gait Questionnaire.",
      },
      {
        name: "Multiple Sclerosis",
        category: "Chronic",
        presentation:
          "Variable, relapsing-remitting or progressive symptoms depending on lesion location — commonly fatigue, spasticity, sensory disturbance, weakness, and balance or coordination deficits; symptoms can worsen with heat (Uhthoff's phenomenon).",
        evaluation:
          "The Expanded Disability Status Scale (EDSS) quantifies overall disability; fatigue, balance, and walking speed are tracked with condition-specific and general measures since presentation varies so widely between patients.",
        intervention:
          "Energy conservation strategies and fatigue management, aerobic and resistance exercise within a patient's tolerance, balance and gait training, and cooling strategies for heat-sensitive symptom flares, with intensity adjusted around relapse/remission status.",
        outcomeMeasures: "Expanded Disability Status Scale (EDSS), Multiple Sclerosis Walking Scale-12 (MSWS-12), Berg Balance Scale, Modified Fatigue Impact Scale.",
      },
      {
        name: "Guillain-Barré Syndrome",
        category: "Acute",
        presentation:
          "Rapidly progressive, typically symmetric ascending weakness (distal to proximal), often following a recent infection; can involve respiratory muscles in severe cases, making respiratory status monitoring critical.",
        evaluation:
          "Serial strength and respiratory function (e.g., forced vital capacity) monitoring during the acute progressive phase catches respiratory compromise early; functional and fatigue measures guide the plateau- and recovery-phase plan of care.",
        intervention:
          "During the acute phase, therapy is conservative — positioning, gentle ROM, and respiratory monitoring — to avoid overwork weakness. As recovery begins, progressive strengthening and functional mobility training resume gradually, guided by fatigue response rather than a fixed timeline.",
        outcomeMeasures: "Medical Research Council (MRC) Sum Score, Functional Independence Measure, forced vital capacity.",
      },
    ],
    npte: { system: "Neuromuscular and Nervous System", weight: "~20%" },
    overview: {
      whatTheyDo:
        "Neuro PTs evaluate motor control, sensation, balance, and functional mobility after damage to the brain, spinal cord, or peripheral nerves, then rebuild function through task-specific practice, neuroplasticity-driven motor learning, and compensatory strategy training.",
      whereTheyWork:
        "Inpatient rehabilitation facilities, acute care and ICU, skilled nursing facilities, outpatient neuro clinics, and home health for patients who are homebound.",
      patientPopulation:
        "Stroke and TBI survivors across the lifespan, individuals with spinal cord injury, and adults living with progressive neurological disease (Parkinson's, MS) or acute peripheral nerve conditions like Guillain-Barré.",
      highYieldFocusAreas: [
        "Motor recovery stages and synergy patterns after stroke (e.g., Brunnstrom stages)",
        "ASIA Impairment Scale classification for spinal cord injury",
        "Standardized balance and gait measures (Berg Balance Scale, Dynamic Gait Index, Tinetti)",
        "Tone management — spasticity vs. rigidity vs. flaccidity, and matching interventions to each",
        "Task-specific, high-repetition motor learning principles (massed vs. distributed practice, feedback types)",
        "Recognizing autonomic dysreflexia and other neuro medical emergencies",
      ],
    },
    pearls: [
      {
        title: "Autonomic dysreflexia is a medical emergency",
        body: "In SCI at or above T6, a sudden noxious stimulus below the level of injury — a full bladder is a common trigger — can cause dangerously high blood pressure with bradycardia. Stop treatment, sit the patient upright, and find and remove the trigger immediately.",
      },
      {
        title: "Spasticity and weakness aren't opposites",
        body: "A limb can be both spastic (velocity-dependent increased tone) and profoundly weak at the same time — treating tone alone without addressing the underlying weakness or motor control deficit won't restore function.",
      },
      {
        title: "The ASIA exam sets the SCI prognosis conversation",
        body: "Classifying a spinal cord injury as complete or incomplete, and its neurological level, via the ASIA Impairment Scale is one of the earliest, highest-yield pieces of information for planning rehab goals.",
      },
      {
        title: "Freezing of gait isn't fixed by cueing alone",
        body: "In Parkinson's disease, external cues — visual lines on the floor, rhythmic auditory cueing — can reduce freezing episodes, but big-amplitude movement training (e.g., LSVT BIG) addresses the underlying bradykinesia driving it.",
      },
      {
        title: "Guillain-Barré recovery is often ascending weakness in reverse",
        body: "Guillain-Barré typically presents as an ascending, symmetric weakness; recovery commonly follows a similar but reversed pattern, and overwork weakness can occur if therapy is pushed too hard during the acute or early recovery phase.",
      },
    ],
    specialTests: [
      { test: "Babinski Sign", assesses: "Upper motor neuron lesion (corticospinal tract involvement)" },
      { test: "Romberg Test", assesses: "Proprioceptive contribution to standing balance" },
      { test: "Hoffmann's Sign", assesses: "Cervical myelopathy / upper motor neuron involvement in the UE" },
      { test: "Pull Test", assesses: "Postural instability in Parkinson's disease (part of the UPDRS)" },
      { test: "Trunk Control Test", assesses: "Trunk control and motor recovery after stroke; correlates with functional prognosis" },
    ],
    outcomeMeasures: [
      { measure: "Berg Balance Scale", assesses: "Static and dynamic balance", population: "General neuro and older adult population" },
      { measure: "NIH Stroke Scale (NIHSS)", assesses: "Stroke severity", population: "Acute stroke" },
      { measure: "Functional Independence Measure (FIM)", assesses: "Functional independence in ADLs and mobility", population: "Inpatient rehabilitation population" },
      { measure: "Modified Ashworth Scale", assesses: "Spasticity grading", population: "Upper motor neuron conditions (stroke, SCI, MS, CP)" },
      { measure: "Dynamic Gait Index (DGI)", assesses: "Gait-related balance and fall risk", population: "Neuro and older adult populations" },
    ],
    documentationPearls: [
      "Report tone with the Modified Ashworth Scale grade, not just 'increased tone,' so progress is measurable across visits.",
      "Document assistance level using standardized terms (contact guard, minimum/moderate/maximum assist) — vague language undercuts skilled-care justification.",
      "For SCI or stroke patients, note any autonomic or safety events (BP spikes, near-falls) even if therapy continued, since these drive precaution updates.",
    ],
    questionTypes:
      "Expect scenario items describing a specific neuro deficit — a patient who can't initiate gait, or has a positive Babinski — and asking you to identify the likely lesion location, appropriate intervention, or safety precaution.",
  },
  {
    slug: "cardiopulmonary",
    name: "Cardiopulmonary",
    color: "#dc2626",
    description: "Cardiac and pulmonary conditions, lab values, vitals interpretation, ICU PT, and aerobic prescription.",
    conditions: [
      {
        name: "Congestive Heart Failure",
        category: "Chronic",
        presentation:
          "Dyspnea on exertion, fatigue, lower-extremity edema, and orthopnea or paroxysmal nocturnal dyspnea; exercise tolerance is often significantly reduced relative to age-matched peers.",
        evaluation:
          "NYHA classification grades functional severity; daily weight trends and lung/heart auscultation screen for decompensation; the 6-Minute Walk Test and Duke Activity Status Index estimate functional capacity.",
        intervention:
          "Progressive, symptom-limited aerobic exercise — guided by Borg RPE and vital sign response rather than a fixed target heart rate, especially in patients on beta-blockers — energy conservation education, and daily weight/symptom monitoring education to catch early decompensation.",
        outcomeMeasures: "NYHA Classification, 6-Minute Walk Test, Duke Activity Status Index.",
      },
      {
        name: "Chronic Obstructive Pulmonary Disease",
        category: "Chronic",
        presentation:
          "Progressive dyspnea, chronic cough, and reduced exercise tolerance; patients often adopt pursed-lip breathing and a tripod posture. Exacerbations present with acutely worsened dyspnea and sputum changes.",
        evaluation:
          "The mMRC Dyspnea Scale grades breathlessness; spirometry (FEV1/FVC, from the medical workup) confirms and stages obstruction; SpO2 and dyspnea response to exertion are monitored closely during activity.",
        intervention:
          "Pulmonary rehabilitation combining aerobic and resistance training progressed to tolerance, breathing retraining (pursed-lip and diaphragmatic breathing), energy conservation strategies, and airway clearance techniques when secretions are an issue.",
        outcomeMeasures: "mMRC Dyspnea Scale, 6-Minute Walk Test, St. George's Respiratory Questionnaire.",
      },
      {
        name: "Post-Cardiac Surgery Rehab",
        category: "Post-surgical",
        presentation:
          "Status-post cardiac surgery (e.g., CABG, valve repair) via median sternotomy; early post-op deconditioning, incisional pain, and sternal precautions limit upper-extremity loading and bed mobility strategies.",
        evaluation:
          "Monitor vital sign response to early mobilization, incision and sternal stability, and functional mobility — bed mobility, transfers, gait — against the surgeon's sternal precaution guidelines.",
        intervention:
          "Early, progressive mobilization respecting sternal precautions (typically avoiding pushing, pulling, lifting beyond a surgeon-specified limit, and unilateral UE loading for several weeks), log-roll bed mobility technique, gradual increase in walking distance and intensity, and enrollment in phase II outpatient cardiac rehab after discharge.",
        outcomeMeasures: "6-Minute Walk Test, Borg RPE Scale, vital sign response to activity.",
      },
      {
        name: "Pulmonary Embolism",
        category: "Acute",
        presentation:
          "Sudden-onset dyspnea, pleuritic chest pain, tachycardia, and sometimes hemoptysis; can present subtly, especially in patients with existing cardiopulmonary disease.",
        evaluation:
          "Confirmed medically via imaging (CT pulmonary angiogram) before PT involvement; PT's role is close vital sign and symptom monitoring during any mobilization once medically cleared, watching for new dyspnea, chest pain, or desaturation.",
        intervention:
          "Mobilization is typically deferred until anticoagulation has been initiated and the patient is medically stable. When cleared, activity is progressed cautiously with continuous monitoring, and any acute symptom change prompts an immediate stop and medical notification.",
        outcomeMeasures: "SpO2 and vital sign response to activity, 6-Minute Walk Test once stable.",
      },
      {
        name: "Pneumonia",
        category: "Acute",
        presentation:
          "Fever, productive cough, dyspnea, and reduced exercise tolerance; auscultation often reveals crackles or diminished breath sounds over the affected lobe.",
        evaluation:
          "Auscultation localizes the affected area; SpO2 at rest and with exertion, along with work of breathing, guide activity intensity and oxygen titration.",
        intervention:
          "Early mobilization to prevent deconditioning and promote secretion clearance, airway clearance techniques (huff coughing, positioning) when secretions are retained, and a gradual increase in activity tolerance guided by SpO2 and dyspnea response.",
        outcomeMeasures: "SpO2 with activity, Borg Dyspnea Scale, functional mobility level.",
      },
      {
        name: "Cardiac Rehabilitation",
        category: "Chronic",
        presentation:
          "Patients enrolled after a cardiac event — MI, revascularization, heart failure exacerbation — working to rebuild aerobic capacity and reduce future cardiac risk; baseline fitness and risk factors vary widely.",
        evaluation:
          "Phase-appropriate functional capacity testing (e.g., 6-Minute Walk Test or a symptom-limited graded exercise test) and risk stratification guide the starting intensity and monitoring level required.",
        intervention:
          "Structured, progressive aerobic and resistance exercise following FITT principles, risk factor modification education (diet, smoking cessation, medication adherence), and monitored progression through cardiac rehab phases — from inpatient Phase I through outpatient Phase II/III.",
        outcomeMeasures: "6-Minute Walk Test, METs achieved on graded exercise testing, Duke Activity Status Index.",
      },
    ],
    npte: { system: "Cardiopulmonary", weight: "~16%" },
    overview: {
      whatTheyDo:
        "Cardiopulmonary PTs interpret vitals and lab values to gauge a patient's tolerance for activity, then progress aerobic capacity and functional mobility safely in patients with cardiac or pulmonary compromise — often while managing lines, tubing, and oxygen equipment.",
      whereTheyWork:
        "Acute care and ICU, inpatient cardiac/pulmonary rehab units, outpatient cardiac and pulmonary rehab programs, and skilled nursing facilities.",
      patientPopulation:
        "Patients recovering from cardiac events or surgery, those with chronic heart failure or COPD, and acutely ill medical patients — pneumonia, PE — who need safe, monitored mobilization.",
      highYieldFocusAreas: [
        "Vital sign parameters and abnormal responses that require stopping activity",
        "Rate of perceived exertion (Borg scale) and its use in exercise prescription",
        "Sternal precautions after cardiac surgery",
        "Oxygen saturation targets and supplemental O2 titration during activity",
        "Recognizing signs of decompensation — new or worsening dyspnea, JVD, edema, adventitious lung sounds",
        "Aerobic exercise prescription principles (FITT) for cardiac and pulmonary populations",
      ],
    },
    pearls: [
      {
        title: "Know your vital sign stop signs",
        body: "Common indications to terminate an activity session include a drop in systolic BP of 20 mmHg or more with exertion, SpO2 dropping below roughly 88–90%, new chest pain, or a significant arrhythmia — know these thresholds cold for boards.",
      },
      {
        title: "Sternal precautions aren't just about the arms",
        body: "After median sternotomy, patients typically avoid pushing, pulling, or lifting beyond a surgeon-specified limit and unilateral upper-extremity loading for several weeks — this affects bed mobility and gait-aid selection (e.g., avoiding a standard walker that requires pushing through the sternum), not just resistance exercise.",
      },
      {
        title: "Borg RPE guides intensity when heart rate can't",
        body: "In patients on beta-blockers (blunted HR response) or with arrhythmias, the Borg Rating of Perceived Exertion scale is often a more reliable intensity guide than a target heart rate zone.",
      },
      {
        title: "COPD patients breathe better leaning forward",
        body: "Pursed-lip breathing and a forward-leaning tripod position reduce dyspnea in COPD by improving diaphragmatic mechanics and reducing dynamic hyperinflation.",
      },
      {
        title: "A PE can look like nothing until it's everything",
        body: "Pulmonary embolism can present with subtle or absent symptoms; sudden-onset dyspnea, pleuritic chest pain, or tachycardia in a patient with DVT risk factors warrants stopping activity and urgent medical notification, not working through it.",
      },
    ],
    specialTests: [
      { test: "6-Minute Walk Test (6MWT)", assesses: "Functional exercise capacity and desaturation with exertion" },
      { test: "Auscultation for Adventitious Sounds", assesses: "Crackles/rhonchi (fluid, secretions) vs. wheezes (airway obstruction)" },
      { test: "Jugular Venous Distension (JVD)", assesses: "Right-sided heart failure / fluid overload" },
      { test: "Percussion", assesses: "Dullness (consolidation/effusion) vs. hyperresonance (hyperinflation, pneumothorax)" },
      { test: "Homans' Sign", assesses: "Historically used to screen for DVT — now considered unreliable and not recommended as a stand-alone screen" },
    ],
    outcomeMeasures: [
      { measure: "6-Minute Walk Test", assesses: "Functional exercise capacity", population: "Cardiac and pulmonary rehab populations" },
      { measure: "Borg RPE Scale (6–20)", assesses: "Perceived exertion during activity", population: "General cardiopulmonary population" },
      { measure: "Modified Medical Research Council (mMRC) Dyspnea Scale", assesses: "Dyspnea severity", population: "COPD population" },
      { measure: "New York Heart Association (NYHA) Classification", assesses: "Heart failure functional severity", population: "CHF population" },
      { measure: "Duke Activity Status Index (DASI)", assesses: "Estimated functional capacity in METs", population: "Cardiac population" },
    ],
    documentationPearls: [
      "Record pre-, during-, and post-activity vitals (HR, BP, SpO2, RPE) for every session — this is the objective evidence that justifies the skilled intervention.",
      "Note the O2 delivery device and flow rate, and any titration during activity, explicitly.",
      "Flag any vital sign response that met a stop criterion, even if the session continued after a brief rest, since it drives the next visit's precautions.",
    ],
    questionTypes:
      "Expect scenario items giving a set of vital signs or a lab/ABG value mid-activity and asking whether to continue, modify, or stop — know the specific stop-criteria thresholds.",
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    color: "#16a34a",
    description: "Developmental milestones, pediatric conditions, school-based PT, and family education.",
    conditions: [
      {
        name: "Cerebral Palsy",
        category: "Chronic",
        presentation:
          "Non-progressive disorder of movement and posture from an early brain injury; presentation varies widely — from mild coordination difficulty to severe spastic quadriplegia — and is classified by distribution (e.g., hemiplegia, diplegia, quadriplegia) and tone pattern (spastic, dyskinetic, ataxic).",
        evaluation:
          "The Gross Motor Function Classification System (GMFCS, Levels I–V) classifies self-initiated mobility and predicts long-term trajectory; the Gross Motor Function Measure (GMFM) tracks functional change over time.",
        intervention:
          "Task-specific practice of functional goals (transitions, ambulation, hand use), stretching and positioning to manage tone and prevent contracture, adaptive equipment and orthotics as needed, and family/caregiver training. Goals are set relative to the child's GMFCS level rather than a 'typical' milestone timeline.",
        outcomeMeasures: "GMFCS, Gross Motor Function Measure (GMFM), Pediatric Evaluation of Disability Inventory (PEDI-CAT).",
      },
      {
        name: "Down Syndrome",
        category: "Chronic",
        presentation:
          "Generalized hypotonia and ligamentous laxity lead to delayed gross motor milestones and a characteristic movement pattern (e.g., wide-based gait, W-sitting); congenital heart defects and other comorbidities may also affect activity tolerance.",
        evaluation:
          "Track milestone attainment against Down-syndrome-specific developmental norms, which run later than typical norms, and screen for signs of atlantoaxial instability before recommending activities with cervical spine risk.",
        intervention:
          "Strengthening and postural control activities addressing hypotonia, gait training to reduce compensatory patterns, and family education on safe positioning and activity given ligamentous laxity and any cardiac precautions.",
        outcomeMeasures: "Alberta Infant Motor Scale (AIMS), Gross Motor Function Measure, Peabody Developmental Motor Scales.",
      },
      {
        name: "Developmental Delay",
        category: "Chronic",
        presentation:
          "Motor skill acquisition significantly behind typical developmental norms in one or more areas — gross motor, fine motor — often without a specific diagnosed underlying condition.",
        evaluation:
          "Standardized developmental assessments (AIMS for infants, Peabody Developmental Motor Scales for a broader age range) quantify the degree of delay relative to age-based norms and guide eligibility for early intervention services.",
        intervention:
          "Play-based, family-centered intervention embedded into daily routines to promote the next developmental skill in the typical sequence, caregiver coaching, and environmental enrichment to increase practice opportunities.",
        outcomeMeasures: "Alberta Infant Motor Scale (AIMS), Peabody Developmental Motor Scales (PDMS-2), Bayley Scales of Infant Development.",
      },
      {
        name: "Torticollis",
        category: "Chronic",
        presentation:
          "Congenital muscular torticollis presents as head tilt toward and chin rotation away from the involved sternocleidomastoid, often with a palpable muscle mass or asymmetric cervical rotation ROM noted in the first weeks of life; may be associated with plagiocephaly.",
        evaluation:
          "Measure passive cervical rotation and lateral flexion ROM bilaterally to quantify asymmetry; screen head shape for plagiocephaly and monitor for red flags — atypical presentation, poor response to treatment — that warrant referral.",
        intervention:
          "Passive stretching of the involved SCM, active repositioning and environmental setup to encourage looking and reaching toward the non-preferred side, and caregiver education on tummy time and carrying positions. Most cases resolve well with early, consistent conservative treatment.",
        outcomeMeasures: "Cervical rotation/lateral flexion ROM (degrees), Congenital Muscular Torticollis Severity Classification.",
      },
      {
        name: "Juvenile Idiopathic Arthritis",
        category: "Chronic",
        presentation:
          "Joint pain, swelling, and stiffness — often worse in the morning — affecting one or multiple joints; can lead to joint contracture, leg-length discrepancy, or growth disturbance if poorly controlled.",
        evaluation:
          "Joint-by-joint assessment of swelling, ROM, and pain; functional status is tracked with the Childhood Health Assessment Questionnaire (CHAQ) alongside the rheumatology team's disease activity measures.",
        intervention:
          "Gentle ROM and strengthening within pain limits, joint protection strategies and activity modification during flares, aquatic therapy as a low-impact option, and close coordination with the medical team since exercise tolerance tracks with disease activity.",
        outcomeMeasures: "Childhood Health Assessment Questionnaire (CHAQ), joint-specific ROM, Juvenile Arthritis Disease Activity Score (from the medical team).",
      },
      {
        name: "Autism Spectrum Disorder",
        category: "Chronic",
        presentation:
          "Variable motor presentation — many children show decreased motor coordination, postural control deficits, or gait differences (e.g., toe-walking) alongside the core social-communication and sensory-processing features of ASD.",
        evaluation:
          "Motor assessment (e.g., the Bruininks-Oseretsky Test of Motor Proficiency) identifies coordination and balance deficits; sensory preferences and triggers are assessed collaboratively with occupational therapy to inform session structure.",
        intervention:
          "Motor skill practice embedded in structured, predictable, and often play- or interest-based activities; sensory-aware session design (lighting, noise, tactile input), visual supports and schedules, and close collaboration with OT, speech, and behavioral teams.",
        outcomeMeasures: "Bruininks-Oseretsky Test of Motor Proficiency, Gross Motor Function Measure (if a concurrent motor diagnosis is present), functional participation goals.",
      },
    ],
    npte: {
      system: "Other Body Systems",
      weight: "~20%",
      note: "Pediatric content isn't its own NPTE system, it's tested as a population across every system above.",
    },
    overview: {
      whatTheyDo:
        "Pediatric PTs evaluate movement against developmental milestones and support families in helping children build the motor skills needed for play, school, and daily life, blending direct hands-on treatment with caregiver coaching and environmental adaptation.",
      whereTheyWork:
        "Early intervention (birth to age 3) home and community visits, school-based PT driven by a child's IEP, outpatient pediatric clinics, and inpatient pediatric hospitals or NICUs.",
      patientPopulation:
        "Infants through adolescents with developmental, neuromuscular, musculoskeletal, or genetic conditions affecting movement, from premature NICU graduates to school-age children with chronic conditions.",
      highYieldFocusAreas: [
        "Typical developmental milestone sequence and red flags for delay at each age",
        "Gross Motor Function Classification System (GMFCS) for cerebral palsy",
        "Family-centered care and the IEP/IFSP service delivery models (Part B vs. Part C)",
        "Congenital muscular torticollis positioning/stretching protocol and red flags for referral",
        "Joint protection and activity modification for pediatric inflammatory arthritis",
        "Sensory processing considerations when treating children with autism spectrum disorder",
      ],
    },
    pearls: [
      {
        title: "Milestones are ranges, not deadlines",
        body: "Independent sitting (roughly 6 months) and independent walking (roughly 12–15 months) are typical ranges, not hard cutoffs — but persistent asymmetry, like never rolling to one side, is a red flag regardless of age.",
      },
      {
        title: "GMFCS predicts trajectory, not just current function",
        body: "The Gross Motor Function Classification System (Levels I–V) for cerebral palsy is a strong predictor of long-term mobility trajectory and helps set realistic, family-centered goals early.",
      },
      {
        title: "Torticollis has a referral clock",
        body: "Congenital muscular torticollis responds very well to early stretching and positioning; limited progress after several weeks of appropriate conservative treatment — or a palpable mass, or an atypical presentation — should prompt referral to rule out other causes.",
      },
      {
        title: "Down syndrome brings ligamentous laxity, not just delay",
        body: "Children with Down syndrome have generalized ligamentous laxity and hypotonia that shape both their motor delay pattern and orthopedic risks (e.g., atlantoaxial instability) — screen for this before recommending activities with cervical spine risk.",
      },
      {
        title: "Family coaching is the intervention in early intervention",
        body: "In birth-to-three settings, teaching caregivers to embed practice into daily routines (diapering, feeding, play) is often more effective than isolated therapist-led repetitions, since caregivers have far more contact time with the child.",
      },
    ],
    specialTests: [
      { test: "Alberta Infant Motor Scale (AIMS)", assesses: "Gross motor development in infants 0–18 months" },
      { test: "Gross Motor Function Measure (GMFM)", assesses: "Gross motor function change over time in cerebral palsy" },
      { test: "Ortolani-Barlow Maneuvers", assesses: "Developmental dysplasia of the hip (DDH) in infants" },
      { test: "Cervical Rotation ROM Measurement", assesses: "Torticollis severity and left-right asymmetry" },
      { test: "Beighton Score", assesses: "Generalized joint hypermobility / ligamentous laxity" },
    ],
    outcomeMeasures: [
      { measure: "Gross Motor Function Measure (GMFM-66/88)", assesses: "Gross motor function", population: "Cerebral palsy population" },
      { measure: "Alberta Infant Motor Scale (AIMS)", assesses: "Motor development", population: "Infants 0–18 months" },
      { measure: "Pediatric Evaluation of Disability Inventory (PEDI-CAT)", assesses: "Functional skills and independence", population: "General pediatric population" },
      { measure: "Peabody Developmental Motor Scales (PDMS-2)", assesses: "Gross and fine motor development", population: "Infants and young children" },
      { measure: "Childhood Health Assessment Questionnaire (CHAQ)", assesses: "Functional status and disability", population: "Juvenile idiopathic arthritis population" },
    ],
    documentationPearls: [
      "Document progress toward IEP/IFSP goals in the specific, measurable, functional language the education/early-intervention team uses, not just clinical terms.",
      "Note caregiver understanding and carryover of the home exercise program explicitly — it's central evidence of skilled, family-centered care.",
      "Track developmental milestones against corrected age, not chronological age, for former preterm infants until roughly 24 months.",
    ],
    questionTypes:
      "Expect scenario items describing a child's age and current motor skills, then asking whether that presentation falls within typical limits, what red flag it represents, or which classification system or outcome measure best tracks it.",
  },
  {
    slug: "geriatrics",
    name: "Geriatrics",
    color: "#c9853a",
    description: "Falls, balance disorders, aging physiology, dementia, and aging-in-place safety.",
    conditions: [
      {
        name: "Falls and Balance Disorders",
        category: "Chronic",
        presentation:
          "History of one or more falls, or reported fear of falling, often with observable gait deviations, reduced single-leg stance time, or slowed transitional movements like sit-to-stand and turning.",
        evaluation:
          "A multifactorial fall risk assessment combining the Timed Up and Go, Berg Balance Scale, gait speed, orthostatic vitals, a vision screen, and a medication review; a positive screen on any single measure warrants a fuller balance workup rather than dismissal.",
        intervention:
          "Progressive balance training (static and dynamic, including reactive/perturbation-based practice), lower-extremity strengthening, gait training, and environmental/home safety modification recommendations, often coordinated with a home health or community fall-prevention program.",
        outcomeMeasures: "Berg Balance Scale, Timed Up and Go, Activities-specific Balance Confidence (ABC) Scale.",
      },
      {
        name: "Hip Fracture and Arthroplasty",
        category: "Post-surgical",
        presentation:
          "Status-post hip fracture repair or arthroplasty; pain, reduced weight-bearing tolerance, and fear of falling commonly limit early mobility, with a high risk of functional decline if mobilization is delayed.",
        evaluation:
          "Confirm weight-bearing status and surgical approach — posterolateral vs. anterior, which changes the relevant hip precautions — then assess transfer ability, gait with an appropriate assistive device, and pain.",
        intervention:
          "Early, progressive mobilization following weight-bearing status and approach-specific hip precautions, gait training with the appropriate assistive device, strengthening, and fall-risk-focused discharge planning, since a prior hip fracture is itself a strong risk factor for a future fall.",
        outcomeMeasures: "Timed Up and Go, gait speed, functional mobility level (e.g., FIM or a facility-specific mobility scale).",
      },
      {
        name: "Dementia and Cognitive Decline",
        category: "Chronic",
        presentation:
          "Progressive impairment in memory, executive function, and/or orientation that increasingly affects safe participation in daily activities and exercise; motor presentation ranges from largely preserved in early stages to significant gait and balance impairment in later stages.",
        evaluation:
          "Brief cognitive screening (e.g., Mini-Mental State Exam or clock-drawing test, often already documented by the medical team) informs how instruction should be delivered; functional mobility and fall risk are assessed as with any older adult, with extra attention to safety awareness and judgment.",
        intervention:
          "Simplified, single-step instructions, demonstration and tactile cueing rather than relying on verbal-only teaching, structured and consistent routines, and caregiver training, since carryover depends heavily on caregiver cueing and supervision.",
        outcomeMeasures: "Timed Up and Go, Berg Balance Scale, functional mobility/ADL level.",
      },
      {
        name: "Frailty and Deconditioning",
        category: "Chronic",
        presentation:
          "Reduced strength, endurance, and activity tolerance, often following a hospitalization, illness, or period of bed rest; may meet formal frailty criteria (e.g., unintentional weight loss, exhaustion, weakness, slow gait speed, low activity).",
        evaluation:
          "Gait speed and grip strength are quick, validated proxies for frailty status; the Short Physical Performance Battery (SPPB) combines balance, gait speed, and chair-stand performance into a single functional score.",
        intervention:
          "Progressive resistance and aerobic exercise dosed carefully to the patient's tolerance — starting low and progressing steadily rather than aggressively — nutrition-aware goal setting in coordination with the care team, and functional task practice to rebuild activity tolerance.",
        outcomeMeasures: "Short Physical Performance Battery (SPPB), gait speed, 30-Second Chair Stand Test.",
      },
      {
        name: "Osteoporosis",
        category: "Chronic",
        presentation:
          "Often asymptomatic until a fragility fracture occurs — commonly vertebral, hip, or wrist; may present with kyphotic posture and height loss from vertebral compression fractures.",
        evaluation:
          "Confirmed medically via bone mineral density (DEXA) T-score; PT evaluation focuses on posture, fall risk, and identifying any movements — e.g., high-velocity spinal flexion — that increase fracture risk given reduced bone density.",
        intervention:
          "Weight-bearing and resistance exercise to support bone density, posture and extension-biased exercise, fall-risk reduction, and education on avoiding high-risk movements (e.g., combined spinal flexion with loading, as in some ab exercises) that increase vertebral fracture risk.",
        outcomeMeasures: "Posture/kyphosis measurement, Berg Balance Scale, fall risk screening.",
      },
      {
        name: "Parkinson's Disease in Older Adults",
        category: "Chronic",
        presentation:
          "The same core Parkinsonian features as the general Parkinson's population — bradykinesia, rigidity, tremor, postural instability — compounded by age-related sarcopenia, other comorbidities, and often a higher baseline fall risk.",
        evaluation:
          "UPDRS motor exam and Pull Test quantify Parkinson's-specific severity; because fall risk is compounded by age, a full geriatric fall risk assessment (TUG, Berg, orthostatic vitals, medication review) is layered on top of Parkinson's-specific measures.",
        intervention:
          "Big-amplitude movement training and external cueing as in general Parkinson's care, combined with geriatric-focused fall prevention, strength training to offset age-related sarcopenia, and closer monitoring for orthostatic hypotension, which is common with Parkinson's medications.",
        outcomeMeasures: "UPDRS, Berg Balance Scale, Timed Up and Go.",
      },
    ],
    npte: {
      system: "Musculoskeletal",
      weight: "~24%",
      note: "Geriatric content isn't its own NPTE system, it's tested as a population across every system above.",
    },
    overview: {
      whatTheyDo:
        "Geriatric PTs address the combined effects of aging, multiple comorbidities, and polypharmacy on mobility, focusing heavily on fall prevention, balance, and preserving independence in daily activities.",
      whereTheyWork:
        "Skilled nursing facilities, home health, outpatient geriatric clinics, assisted living and senior communities, and inpatient acute care for hospitalized older adults.",
      patientPopulation:
        "Community-dwelling and institutionalized older adults, often managing multiple chronic conditions simultaneously — cardiovascular disease, diabetes, osteoarthritis, cognitive decline — alongside age-related physiologic decline.",
      highYieldFocusAreas: [
        "Multifactorial fall risk assessment and evidence-based fall prevention interventions",
        "Age-related physiologic changes (sarcopenia, decreased bone density, slowed reaction time) and how they change exam findings",
        "Standardized balance/mobility screens and their fall-risk cutoff scores (TUG, 30-second chair stand)",
        "Post-hip-fracture weight-bearing precautions and surgical-approach-specific hip precautions",
        "Polypharmacy's contribution to falls and dizziness",
        "Distinguishing normal aging from pathological cognitive decline when planning a POC",
      ],
    },
    pearls: [
      {
        title: "A TUG over 12 seconds flags fall risk",
        body: "The Timed Up and Go test taking more than about 12 seconds is a widely used cutoff associated with increased fall risk in community-dwelling older adults, though it should be interpreted alongside other findings, not in isolation.",
      },
      {
        title: "Falls are rarely one cause",
        body: "Falls in older adults are typically multifactorial — vision changes, polypharmacy, orthostatic hypotension, environmental hazards, and strength/balance deficits often combine, so a thorough fall risk assessment screens broadly, not just gait and balance.",
      },
      {
        title: "Hip precautions depend on the surgical approach",
        body: "Posterolateral THA precautions (avoid excessive hip flexion, adduction, internal rotation) differ from anterior-approach precautions (avoid excessive extension and external rotation) — know which approach the patient had before counseling on precautions.",
      },
      {
        title: "Sarcopenia accelerates without loading",
        body: "Age-related muscle loss (sarcopenia) accelerates with inactivity and illness-related bed rest, making early, appropriately-dosed resistance exercise a priority even in frail or hospitalized older adults, not just a maintenance activity.",
      },
      {
        title: "Cognitive status changes how you teach, not just what you treat",
        body: "For patients with dementia, verbal instruction alone is often insufficient — tactile cueing, demonstration, and simplified single-step directions improve carryover more than a standard verbal home exercise program.",
      },
    ],
    specialTests: [
      { test: "Timed Up and Go (TUG)", assesses: "Functional mobility and fall risk", sensitivity: "~87%", specificity: "~87%" },
      { test: "30-Second Chair Stand Test", assesses: "Lower-extremity strength and fall risk" },
      { test: "Functional Reach Test", assesses: "Dynamic standing balance / fall risk" },
      { test: "5-Times Sit-to-Stand Test", assesses: "Lower-extremity power and fall risk" },
      { test: "Mini-Mental State Exam (MMSE)", assesses: "Cognitive screening relevant to safety awareness and exercise carryover" },
    ],
    outcomeMeasures: [
      { measure: "Berg Balance Scale", assesses: "Static and dynamic balance", population: "General older adult population" },
      { measure: "Timed Up and Go", assesses: "Functional mobility and fall risk", population: "General older adult population" },
      { measure: "Tinetti Performance-Oriented Mobility Assessment (POMA)", assesses: "Gait and balance-related fall risk", population: "General older adult population" },
      { measure: "Short Physical Performance Battery (SPPB)", assesses: "Lower-extremity function", population: "Community-dwelling older adults" },
      { measure: "Activities-specific Balance Confidence (ABC) Scale", assesses: "Fear of falling / balance confidence", population: "General older adult population" },
    ],
    documentationPearls: [
      "Document fall history (number, circumstances, injuries) at every eval — it's one of the strongest predictors of future falls and directly shapes the plan of care.",
      "Note environmental and equipment recommendations (grab bars, raised toilet seat, removed rugs) explicitly, since these are often the actionable takeaway for the caregiver.",
      "Record medication changes reported by the patient alongside any new dizziness or balance complaint — this connection is easy to miss otherwise.",
    ],
    questionTypes:
      "Expect scenario items with a specific TUG, Berg, or chair-stand score, or a described fall circumstance, asking you to interpret fall risk level or select the most appropriate next intervention.",
  },
  {
    slug: "sports",
    name: "Sports",
    color: "#ea580c",
    description: "Common sports injuries, return to sport protocols, and sport-specific rehabilitation across six sports.",
    conditions: [
      {
        name: "ACL Tear and Reconstruction",
        category: "Post-surgical",
        presentation:
          "Often a non-contact pivoting or landing mechanism with an audible or felt pop, rapid effusion, and a sense of instability; post-reconstruction, early presentation mirrors general post-surgical ACL rehab with quad inhibition and effusion.",
        evaluation:
          "Pre-operatively, Lachman and pivot-shift testing plus MRI confirm the tear; post-operatively, track ROM, quad activation, effusion, and — closer to return to sport — a single-leg hop test battery and quad strength limb symmetry index.",
        intervention:
          "Phase-based rehab from early ROM/quad activation through strength, neuromuscular control, and sport-specific plyometric and cutting/pivoting drills; return-to-sport clearance combines objective testing (LSI ≥90%, hop testing) with psychological readiness.",
        outcomeMeasures: "IKDC, KOOS, single-leg hop test battery, ACL-RSI Scale.",
      },
      {
        name: "Rotator Cuff Tear",
        category: "Acute",
        presentation:
          "Often from an acute traumatic mechanism in sport — a fall on an outstretched arm or a forceful eccentric load — with sudden shoulder pain and weakness, distinct from the more insidious onset seen in chronic degenerative tears.",
        evaluation:
          "A drop-arm sign and resisted external rotation/abduction weakness suggest a tear; imaging (MRI or ultrasound) confirms size and full- vs. partial-thickness involvement, which drives the conservative-vs-surgical decision in an athlete.",
        intervention:
          "For partial tears or non-operative management, progressive rotator cuff and scapular strengthening as in general cuff rehab; for surgical repair, a protected early phase followed by the same strength-and-return-to-throwing/overhead-sport progression, paced against the specific demands of the athlete's sport.",
        outcomeMeasures: "ASES, DASH, sport-specific return-to-throwing progression benchmarks.",
      },
      {
        name: "Ankle Sprain, Lateral",
        category: "Acute",
        presentation:
          "Inversion mechanism causing lateral ankle pain, swelling, and bruising over the anterior talofibular and/or calcaneofibular ligaments; weight-bearing tolerance varies with severity.",
        evaluation:
          "The Ottawa Ankle Rules screen for the need for an x-ray to rule out fracture; the anterior drawer and talar tilt tests assess ligamentous laxity once fracture is ruled out.",
        intervention:
          "Early protected weight-bearing and edema management, progressive balance/proprioceptive training — a key piece for preventing re-injury — strengthening, and sport-specific agility and cutting drills before return to play; bracing or taping is often used during the return-to-sport phase.",
        outcomeMeasures: "Ottawa Ankle Rules (screening), Foot and Ankle Ability Measure (FAAM), single-leg balance testing.",
      },
      {
        name: "Concussion and Return to Play",
        category: "Acute",
        presentation:
          "Follows a direct or indirect head impact; symptoms can include headache, dizziness, confusion, balance problems, and cognitive fog, and may not be immediately obvious on the field.",
        evaluation:
          "Sideline assessment with a validated tool (e.g., SCAT5), immediate removal from play for any suspected concussion, and baseline-vs-post-injury comparison when baseline testing is available; balance and vestibular-ocular screening are part of a thorough workup.",
        intervention:
          "An initial brief period of relative rest followed by a graded, symptom-guided return-to-learn and return-to-play progression — light aerobic activity, then sport-specific exercise, non-contact training, full contact practice, and return to play — advancing only when each stage is tolerated without symptom exacerbation.",
        outcomeMeasures: "SCAT5/Child SCAT5, symptom checklist score, vestibular-ocular motor screening (VOMS).",
      },
      {
        name: "Stress Fractures",
        category: "Chronic",
        presentation:
          "Gradual-onset, activity-related bony pain that initially resolves with rest and worsens with continued loading; common sites include the tibia, metatarsals, and femoral neck, often following a rapid increase in training load.",
        evaluation:
          "Point tenderness over the bone and a positive fulcrum or hop test in some locations raise suspicion; imaging (MRI is more sensitive than x-ray, especially early) confirms the diagnosis and grades severity, which drives weight-bearing/activity restriction.",
        intervention:
          "Activity modification or a period of relative rest/reduced weight-bearing based on fracture grade and location, addressing contributing factors (training load progression, biomechanics, bone health/nutrition), and a gradual, criteria-based return to running/sport-specific loading.",
        outcomeMeasures: "Pain with graded loading/hop testing, imaging-confirmed healing, gradual return-to-run progression tolerance.",
      },
      {
        name: "Patellar Tendinopathy",
        category: "Chronic",
        presentation:
          "Insidious anterior knee pain localized to the inferior pole of the patella, classically worse with jumping, landing, or deceleration sports ('jumper's knee'), often with pain that warms up during activity then worsens afterward.",
        evaluation:
          "Point tenderness at the patellar tendon's origin, pain with resisted knee extension or a single-leg decline squat, and a load-related pain pattern distinguish it from other anterior knee pain sources.",
        intervention:
          "Progressive tendon loading — isometric loading for early pain relief, progressing to heavy slow resistance and eventually energy-storage/plyometric loading — activity modification during high-irritability phases, and a gradual return to jumping/landing sport demands guided by pain monitoring rather than requiring pain-free before progressing.",
        outcomeMeasures: "Victorian Institute of Sport Assessment-Patella (VISA-P), single-leg decline squat pain rating, jump-landing load tolerance.",
      },
    ],
    npte: {
      system: "Musculoskeletal",
      weight: "~24%",
      note: "Sports content isn't its own NPTE system, it's tested mostly within Musculoskeletal, with some Cardiopulmonary and Neuromuscular overlap.",
    },
    overview: {
      whatTheyDo:
        "Sports PTs manage acute athletic injuries and guide safe, evidence-based return-to-sport progressions, working closely with athletic trainers, physicians, and coaches to balance healing timelines against competitive demands.",
      whereTheyWork:
        "Sports medicine clinics, team and sideline coverage from the high school through professional level, university athletic departments, and outpatient orthopedic clinics with a sports focus.",
      patientPopulation:
        "Youth through professional athletes across all sports, with the highest volume typically involving lower-extremity ligament injuries, overuse tendinopathies, and concussion.",
      highYieldFocusAreas: [
        "Return-to-sport criteria beyond time alone — strength symmetry, hop testing, sport-specific movement quality",
        "Concussion recognition and graded return-to-play/return-to-learn protocols",
        "Common mechanism-of-injury patterns by sport and their associated red flags",
        "Load management and overuse injury prevention (training load spikes, growth-plate considerations in youth)",
        "On-field/sideline emergency action planning basics",
        "Psychological readiness to return to sport, not just physical criteria",
      ],
    },
    pearls: [
      {
        title: "Time is not a return-to-sport criterion",
        body: "'6 months post-ACL reconstruction' is a floor, not a finish line — objective criteria (quad LSI ≥90%, passing hop testing, sport-specific movement quality) matter more than the calendar.",
      },
      {
        title: "When in doubt, sit them out",
        body: "For suspected concussion, the standard sideline approach is immediate removal from play — same-day return to play is not appropriate for a suspected concussion, regardless of how quickly symptoms seem to resolve.",
      },
      {
        title: "Growth plates change the injury picture in youth athletes",
        body: "In skeletally immature athletes, the physis (growth plate) is often the weakest link in the kinetic chain — an injury that would be a sprain in an adult can be a Salter-Harris fracture in a child, so mechanism and point tenderness over a growth plate warrant a lower threshold for imaging referral.",
      },
      {
        title: "Training load spikes predict overuse injury",
        body: "A rapid increase in training volume or intensity is one of the more consistent predictors of overuse injuries like stress fractures and tendinopathy — gradual progression is itself an injury-prevention intervention.",
      },
      {
        title: "Psychological readiness is a real return-to-sport gate",
        body: "Fear of re-injury, measured by tools like the ACL-Return to Sport after Injury (ACL-RSI) scale, predicts actual return-to-sport success independent of strength and hop-test performance — readiness isn't only physical.",
      },
    ],
    specialTests: [
      { test: "Ottawa Ankle Rules", assesses: "Need for x-ray after acute ankle injury (fracture screen)", sensitivity: "~97–100%" },
      { test: "Lachman Test", assesses: "ACL integrity", sensitivity: "~85%", specificity: "~94%" },
      { test: "SCAT5", assesses: "Sideline concussion assessment" },
      { test: "Single-Leg Hop Test", assesses: "Lower-extremity symmetry and return-to-sport readiness" },
      { test: "Talar Tilt Test", assesses: "Calcaneofibular ligament integrity" },
    ],
    outcomeMeasures: [
      { measure: "IKDC", assesses: "Knee-specific function", population: "Post-ACL/knee ligament injury" },
      { measure: "Single-Leg Hop Test Battery (LSI)", assesses: "Lower-extremity symmetry / RTS readiness", population: "Post-ACL and post-lower-extremity injury" },
      { measure: "SCAT5 / Child SCAT5", assesses: "Concussion symptom, cognitive, and balance assessment", population: "Athletes with suspected concussion" },
      { measure: "ACL-Return to Sport after Injury (ACL-RSI) Scale", assesses: "Psychological readiness to return to sport", population: "Post-ACL reconstruction" },
      { measure: "Y-Balance Test", assesses: "Dynamic balance / injury risk screening", population: "General athletic population" },
    ],
    documentationPearls: [
      "Document objective return-to-sport criteria (LSI%, hop test results) at every re-assessment, not just 'progressing well.'",
      "For suspected concussion, record the exact mechanism, initial symptoms, and time of removal from play — this becomes the reference point for the entire return-to-play protocol.",
      "Note communication with the athletic trainer, physician, or coach explicitly when return-to-sport decisions are made collaboratively.",
    ],
    questionTypes:
      "Expect scenario items describing an athlete's injury mechanism and current test results, then asking whether they meet return-to-sport criteria or what red flag — a suspected fracture, a concussion — requires immediate removal from play.",
  },
];

export function getSpecialty(slug: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.slug === slug);
}

export interface Sport {
  slug: string;
  name: string;
  injuries: string[];
  focus: string;
  conditions: SpecialtyCondition[];
}

export const SPORTS: Sport[] = [
  {
    slug: "football",
    name: "Football",
    injuries: ["Concussion", "ACL tear", "shoulder instability", "cervical spine"],
    focus: "Contact injury management, return to play protocols.",
    conditions: [
      {
        name: "Concussion",
        category: "Acute",
        presentation:
          "Head impact from a tackle, blocking, or helmet-to-helmet contact; symptoms may include headache, disorientation, or balance problems, or, in more obvious cases, loss of consciousness.",
        evaluation:
          "Immediate sideline removal and SCAT5-based assessment; given football's high contact volume, a low threshold for suspecting concussion and comparing to baseline testing (when available) is standard.",
        intervention:
          "Graded return-to-play progression following relative rest, with return-to-learn addressed in parallel; return to contact practice and games only after passing each non-contact stage symptom-free.",
        outcomeMeasures: "SCAT5, symptom checklist, VOMS.",
      },
      {
        name: "ACL Tear",
        category: "Acute",
        presentation:
          "Frequently a non-contact cutting/deceleration mechanism or a direct valgus blow to the knee during a tackle, with immediate swelling and instability.",
        evaluation:
          "Lachman and pivot-shift testing plus MRI confirm the tear; given football's high-demand cutting and contact requirements, return-to-sport testing is typically more rigorous than for lower-demand sports.",
        intervention:
          "Standard phase-based ACL reconstruction rehab progressing to football-specific cutting, contact-readiness, and tackling mechanics before clearance.",
        outcomeMeasures: "IKDC, single-leg hop test battery, quad strength LSI.",
      },
      {
        name: "Shoulder Instability",
        category: "Chronic",
        presentation:
          "Recurrent sense of the shoulder 'giving way' or subluxing, often after an initial traumatic dislocation from a tackle or fall, with apprehension in the abducted-externally-rotated position.",
        evaluation:
          "The apprehension and relocation tests assess anterior instability; recurrence history and imaging findings (labral involvement) guide the conservative-vs-surgical decision.",
        intervention:
          "Rotator cuff and scapular stabilizer strengthening to compensate for capsuloligamentous laxity, activity modification during high-irritability phases, and a graded return to blocking/tackling positions that load the shoulder in provocative positions.",
        outcomeMeasures: "Western Ontario Shoulder Instability Index (WOSI), ASES, apprehension test response.",
      },
      {
        name: "Cervical Spine Injury",
        category: "Acute",
        presentation:
          "Ranges from a transient 'stinger' — burning pain or paresthesia down one arm after a hit — to more serious cervical spine trauma; any bilateral symptoms, midline neck pain, or neurological deficit is a red flag requiring immediate spine precautions.",
        evaluation:
          "On-field screening for midline tenderness, neurological deficit, and mechanism severity determines whether spinal precautions and emergency transport are needed versus a more routine stinger work-up; unilateral, transient symptoms that fully resolve are managed differently than any bilateral or persistent finding.",
        intervention:
          "For a resolved stinger, cervical and upper-trap strengthening and neck-position awareness during tackling technique; any red-flag presentation is managed per the team's emergency action plan, not on-field PT intervention.",
        outcomeMeasures: "Neurological screen (strength, sensation, reflexes), cervical ROM, symptom resolution timeline.",
      },
    ],
  },
  {
    slug: "baseball",
    name: "Baseball",
    injuries: ["UCL tear", "rotator cuff", "medial epicondylitis", "SLAP tear"],
    focus: "Throwing mechanics, overhead athlete rehabilitation.",
    conditions: [
      {
        name: "UCL Tear",
        category: "Acute",
        presentation:
          "Medial elbow pain during the late cocking/acceleration phase of throwing, sometimes with an acute pop and immediate loss of throwing velocity or control; may present more gradually as medial elbow pain that worsens with throwing volume.",
        evaluation:
          "The moving valgus stress test and valgus stress test assess UCL integrity; MRI confirms tear grade and guides the conservative-vs-Tommy-John-surgery decision.",
        intervention:
          "For partial tears managed conservatively, a structured interval throwing program with close monitoring of medial elbow symptoms; post-surgical (UCL reconstruction) rehab follows a lengthy, phase-based protocol before a graded return to throwing.",
        outcomeMeasures: "Kerlan-Jobe Orthopaedic Clinic (KJOC) Shoulder and Elbow Score, interval throwing program tolerance, pain with valgus loading.",
      },
      {
        name: "Rotator Cuff Injury",
        category: "Chronic",
        presentation:
          "Overhead/throwing athletes often present with posterior shoulder pain and a gradual decline in throwing velocity or control, frequently alongside glenohumeral internal rotation deficit (GIRD).",
        evaluation:
          "Assess GIRD (side-to-side internal rotation ROM difference), cuff strength (especially external rotation and lower trapezius), and scapular kinematics, since throwing-related cuff injury is rarely an isolated cuff problem.",
        intervention:
          "Posterior capsule stretching to address GIRD, rotator cuff and scapular strengthening, a kinetic-chain (hip/trunk) assessment since throwing mechanics deficits elsewhere often overload the shoulder, and a closely monitored interval throwing program for return to pitching/throwing.",
        outcomeMeasures: "KJOC Score, GIRD measurement, interval throwing program tolerance.",
      },
      {
        name: "Medial Epicondylitis",
        category: "Chronic",
        presentation:
          "Medial elbow pain at the common flexor-pronator origin, aggravated by throwing — especially the acceleration phase — and resisted wrist flexion/forearm pronation.",
        evaluation:
          "Pain reproduced with resisted wrist flexion and pronation, and point tenderness at the medial epicondyle; distinguish from UCL injury, which is more specifically reproduced with valgus stress rather than resisted wrist flexion.",
        intervention:
          "Progressive tendon loading of the flexor-pronator mass, throwing mechanics assessment since faulty mechanics often drive overload, and a gradual interval throwing program guided by symptom response.",
        outcomeMeasures: "Patient-Rated Tennis Elbow Evaluation (PRTEE, adapted region), grip strength, throwing tolerance.",
      },
      {
        name: "SLAP Tear",
        category: "Chronic",
        presentation:
          "Deep, often poorly localized shoulder pain in overhead throwers, sometimes with mechanical symptoms — clicking, catching — and a decline in throwing performance.",
        evaluation:
          "O'Brien's (active compression) test and other labral provocation tests raise suspicion; MRI arthrogram is typically needed for definitive diagnosis given the limited accuracy of clinical special tests alone for labral pathology.",
        intervention:
          "Conservative management emphasizes scapular and rotator cuff strengthening and correcting throwing mechanics/kinetic chain deficits; surgical repair, when indicated, is followed by a protected early phase and a lengthy, closely monitored return-to-throwing progression.",
        outcomeMeasures: "KJOC Score, interval throwing program tolerance, pain with overhead/throwing provocation.",
      },
    ],
  },
  {
    slug: "soccer",
    name: "Soccer",
    injuries: ["ACL tear", "ankle sprain", "hamstring strain", "concussion"],
    focus: "Lower extremity biomechanics, heading-related concussion.",
    conditions: [
      {
        name: "ACL Tear",
        category: "Acute",
        presentation:
          "Classic non-contact mechanism during cutting, pivoting, or landing from a jump, with immediate swelling and a sense of the knee giving way — soccer has one of the highest ACL injury rates among field sports, especially in female athletes.",
        evaluation:
          "Lachman and pivot-shift testing plus MRI confirm the tear; given the high cutting/pivoting demand of soccer, return-to-sport testing typically includes sport-specific agility and cutting assessments beyond straight-line hop testing.",
        intervention:
          "Standard phase-based ACL reconstruction rehab with an emphasis on neuromuscular control and landing mechanics, progressing to soccer-specific cutting, sprinting, and heading-related balance demands before clearance.",
        outcomeMeasures: "IKDC, single-leg hop test battery, quad strength LSI, cutting/agility performance.",
      },
      {
        name: "Ankle Sprain",
        category: "Acute",
        presentation: "Typically an inversion mechanism during a tackle, cut, or landing on another player's foot, with lateral ankle pain and swelling.",
        evaluation:
          "Ottawa Ankle Rules screen for fracture; anterior drawer and talar tilt assess ligamentous involvement once fracture is excluded.",
        intervention:
          "Progressive weight-bearing and balance/proprioceptive training, given soccer's high demand for single-leg stability and cutting, strengthening, and sport-specific agility work before return; bracing/taping is common during the return-to-play phase given soccer's high ankle-sprain recurrence rate.",
        outcomeMeasures: "Foot and Ankle Ability Measure (FAAM), single-leg balance testing, agility performance.",
      },
      {
        name: "Hamstring Strain",
        category: "Acute",
        presentation:
          "Sudden posterior thigh pain during high-speed running or sprinting, sometimes with an audible pop; soccer's frequent sprinting and rapid deceleration make hamstring strains one of its most common injuries, with a notably high re-injury rate if rehab is rushed.",
        evaluation:
          "Palpation localizes the injury site and length along the muscle-tendon unit; pain with resisted knee flexion and a straight-leg raise assess severity and guide grading.",
        intervention:
          "Progressive loading from isometric through eccentric strengthening — eccentric hamstring work has strong evidence for reducing re-injury risk — a graded return to sprinting, and addressing any contributing factors (e.g., limited hip extension, poor lumbopelvic control) before full return to play.",
        outcomeMeasures: "Pain-free hip flexion ROM with knee extended, isokinetic or handheld dynamometry strength testing, graded sprint progression tolerance.",
      },
      {
        name: "Concussion",
        category: "Acute",
        presentation:
          "Head impact from a collision, fall, or — notably in soccer — heading the ball or head-to-head contact during an aerial challenge; symptoms mirror general sport concussion presentation.",
        evaluation:
          "Immediate removal from play and SCAT5-based sideline assessment, same as any sport concussion; soccer's heading exposure is a specific area of ongoing return-to-play and youth policy discussion.",
        intervention:
          "Standard graded return-to-learn and return-to-play progression, symptom-guided at each stage, with a cautious approach to reintroducing heading specifically.",
        outcomeMeasures: "SCAT5, symptom checklist, VOMS.",
      },
    ],
  },
  {
    slug: "basketball",
    name: "Basketball",
    injuries: ["Ankle sprain", "patellar tendinopathy", "achilles", "finger injuries"],
    focus: "Jump landing mechanics, quick direction change rehabilitation.",
    conditions: [
      {
        name: "Ankle Sprain",
        category: "Acute",
        presentation:
          "Commonly occurs landing on another player's foot after a jump shot or rebound, causing an inversion mechanism with lateral ankle pain and swelling — one of the most common injuries in basketball.",
        evaluation: "Ottawa Ankle Rules screen for fracture; anterior drawer and talar tilt assess ligament involvement.",
        intervention:
          "Progressive weight-bearing, balance/proprioceptive training — jump-landing sports have a high re-sprain rate without this — strengthening, and sport-specific jump-landing and cutting drills before return; ankle bracing/taping is commonly used during return to play.",
        outcomeMeasures: "Foot and Ankle Ability Measure (FAAM), single-leg balance and landing assessment.",
      },
      {
        name: "Patellar Tendinopathy",
        category: "Chronic",
        presentation:
          "Insidious anterior knee pain at the inferior patellar pole from repetitive jumping and landing ('jumper's knee'), a classic overuse injury in basketball given its high jump volume.",
        evaluation:
          "Point tenderness at the patellar tendon, pain with a single-leg decline squat, and a load-related pain pattern — pain that warms up then returns afterward — support the diagnosis.",
        intervention:
          "Progressive tendon loading from isometric through heavy slow resistance to energy-storage loading, jump-landing mechanics assessment and correction, and load management around games/practice volume during the recovery phase.",
        outcomeMeasures: "Victorian Institute of Sport Assessment-Patella (VISA-P), single-leg decline squat pain rating.",
      },
      {
        name: "Achilles Injury",
        category: "Chronic",
        presentation:
          "Posterior heel/ankle pain that can range from mid-portion tendinopathy — gradual onset, worse with jumping and pushoff — to acute rupture, a sudden, sharp pain often described as being 'kicked' in the calf, with a palpable defect.",
        evaluation:
          "For tendinopathy, palpation localizes thickening/tenderness along the tendon; for suspected rupture, the Thompson test — squeezing the calf and watching for ankle plantarflexion — screens for a full tear and warrants urgent referral if positive.",
        intervention:
          "Tendinopathy is managed with progressive eccentric/heavy slow resistance loading and load management; a confirmed rupture requires surgical or immobilization-based medical management followed by a lengthy, protected, phase-based rehab before any return to jumping sport.",
        outcomeMeasures: "Victorian Institute of Sport Assessment-Achilles (VISA-A), calf raise endurance/strength testing, single-leg hop testing before return to play.",
      },
      {
        name: "Finger Injury",
        category: "Acute",
        presentation:
          "Jammed, sprained, or dislocated fingers from contact with the ball or another player are extremely common in basketball; presentation ranges from mild swelling/pain with full motion to obvious deformity with a dislocation or fracture.",
        evaluation:
          "Assess active/passive ROM, joint stability with stress testing, and deformity; any suspected fracture or unreduced dislocation requires imaging and physician referral before PT proceeds.",
        intervention:
          "Buddy taping and protected ROM for stable sprains, progressive grip and ROM exercises, and a graded return to ball-handling and contact once pain-free functional ROM and grip strength are restored.",
        outcomeMeasures: "Finger ROM (goniometry), grip strength, functional ball-handling tolerance.",
      },
    ],
  },
  {
    slug: "hockey",
    name: "Hockey",
    injuries: ["Hip flexor strain", "groin injury", "shoulder separation", "knee ligament"],
    focus: "Skating mechanics, contact injury management, hip rehabilitation.",
    conditions: [
      {
        name: "Hip Flexor Strain",
        category: "Acute",
        presentation:
          "Anterior hip pain from the forceful hip flexion of skating strides, especially during rapid acceleration; pain with resisted hip flexion and passive hip extension stretch.",
        evaluation: "Palpation localizes the strain along the iliopsoas or rectus femoris; pain and strength deficit with resisted hip flexion grade severity.",
        intervention:
          "Progressive loading from isometric through eccentric hip flexor strengthening, addressing any hip/core stability deficits that contribute to strain risk, and a graded return to skating stride mechanics and acceleration drills.",
        outcomeMeasures: "Hip flexor strength (handheld dynamometry), pain with resisted hip flexion, skating-specific return-to-sport progression tolerance.",
      },
      {
        name: "Groin Injury",
        category: "Acute",
        presentation:
          "Adductor-region pain from the wide, powerful skating stride and rapid direction changes characteristic of hockey; one of hockey's most common injuries, ranging from a mild strain to a more significant adductor tear.",
        evaluation:
          "Palpation localizes the strain; pain and strength deficit with resisted hip adduction — often tested with the squeeze test at varying hip flexion angles — grade severity and help localize involvement.",
        intervention:
          "Progressive adductor loading (the Copenhagen adduction exercise has strong evidence for both treatment and prevention), addressing hip/core stability, and a graded return to skating and cutting; pre-season adductor strengthening is a well-supported prevention strategy in hockey specifically.",
        outcomeMeasures: "Adductor squeeze test strength/pain, hip adduction strength testing, skating-specific return-to-sport progression tolerance.",
      },
      {
        name: "Shoulder Separation",
        category: "Acute",
        presentation:
          "Acromioclavicular (AC) joint injury from a direct fall onto the shoulder or a check into the boards, causing localized pain over the AC joint and, in higher grades, a visible step-off deformity.",
        evaluation:
          "Palpation localizes AC joint tenderness; the cross-body adduction (horizontal adduction) test reproduces AC joint pain, and grading via exam and imaging determines conservative-vs-surgical management.",
        intervention:
          "For lower-grade separations managed conservatively, progressive ROM and rotator cuff/scapular strengthening avoiding AC joint provocation early on, followed by a graded return to contact and checking; higher-grade injuries may require surgical stabilization and a longer, more protected rehab course.",
        outcomeMeasures: "ASES, DASH, pain with cross-body adduction and contact-readiness testing.",
      },
      {
        name: "Knee Ligament Injury",
        category: "Acute",
        presentation:
          "Contact (a check or collision) or non-contact cutting/pivoting mechanisms on skates can injure the ACL, MCL, or both; presentation includes pain, swelling, and instability, with the specific ligament(s) involved shaping severity and management.",
        evaluation:
          "Valgus stress testing at 0° and 30° assesses MCL involvement; Lachman and pivot-shift assess ACL integrity; MRI confirms the extent of involvement, especially with suspected multi-ligament injury.",
        intervention:
          "MCL injuries are frequently managed conservatively with bracing and progressive loading; ACL involvement typically follows standard post-reconstruction rehab; both progress toward hockey-specific skating, cutting, and contact-readiness before return to play, with combined injuries requiring a more conservative, extended timeline.",
        outcomeMeasures: "IKDC, valgus stability on stress testing, single-leg hop test battery before return to play.",
      },
    ],
  },
];

export function getSport(slug: string): Sport | undefined {
  return SPORTS.find((s) => s.slug === slug);
}
