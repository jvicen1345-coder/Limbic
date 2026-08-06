/** Case of the Day's static case bank (see app/(app)/games/case/page.tsx,
 *  components/CaseOfDayGame.tsx) — general educational quiz content only. Every case is a
 *  composite/illustrative scenario written for teaching pattern recognition, not a real
 *  patient record, and every explanation is framed as general information rather than a
 *  diagnosis or treatment directive. Interleaved by specialty (ortho/neuro/sports/
 *  geriatric/pediatric/wellness, repeating) so the 30-day rotation doesn't spend five
 *  consecutive days on one specialty. */

export interface DailyCase {
  id: string;
  specialty: string;
  patientAge: number;
  patientSex: string;
  chiefComplaint: string;
  history: string[];
  keyFindings: string[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedTopic: string;
}

export const CASES: DailyCase[] = [
  {
    id: "ortho-1",
    specialty: "Orthopedic",
    patientAge: 34,
    patientSex: "Male",
    chiefComplaint: "Lateral elbow pain after increased tennis play",
    history: [
      "Amateur tennis player, increased play frequency over the last month",
      "Pain worsens with gripping and wrist extension",
      "No traumatic injury",
      "Over-the-counter NSAIDs provide partial relief",
    ],
    keyFindings: [
      "Tenderness over the lateral epicondyle",
      "Pain with resisted wrist extension",
      "Full elbow range of motion",
      "No swelling or instability",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Lateral epicondylitis (tennis elbow)", "Medial epicondylitis (golfer's elbow)", "Radial tunnel syndrome", "Cubital tunnel syndrome"],
    correctIndex: 0,
    explanation:
      "Lateral epicondylitis is an overuse tendinopathy of the wrist extensor origin, classically provoked by resisted wrist extension and gripping. It's common with repetitive backhand strokes in tennis players. General management typically centers on activity modification and progressive loading rather than rest alone.",
    relatedTopic: "lateral epicondylitis tennis elbow",
  },
  {
    id: "neuro-1",
    specialty: "Neurological",
    patientAge: 68,
    patientSex: "Female",
    chiefComplaint: "Sudden right-sided weakness and slurred speech, onset one hour ago",
    history: [
      "Symptoms began suddenly while having breakfast",
      "Family called EMS immediately",
      "History of hypertension and atrial fibrillation",
      "No history of trauma",
    ],
    keyFindings: ["Right facial droop", "Right arm drift with eyes closed", "Slurred speech", "Blood pressure 168/94"],
    question: "What is the most appropriate immediate next step?",
    options: [
      "Activate emergency stroke protocol / call for emergency transport",
      "Schedule outpatient neurology follow-up",
      "Begin a home exercise program for the weakness",
      "Reassure the family and monitor at home overnight",
    ],
    correctIndex: 0,
    explanation:
      "Sudden facial droop, arm weakness, and speech difficulty are classic stroke warning signs, and time-sensitive treatments depend on rapid recognition and transport. This is a medical emergency requiring immediate activation of emergency services, not outpatient follow-up.",
    relatedTopic: "stroke warning signs FAST",
  },
  {
    id: "sports-1",
    specialty: "Sports",
    patientAge: 19,
    patientSex: "Female",
    chiefComplaint: "Acute knee pain and swelling after landing from a jump during volleyball",
    history: [
      "Heard a \"pop\" at the time of injury",
      "Rapid swelling within a few hours",
      "Feels like the knee may \"give way\"",
      "No direct contact from another player",
    ],
    keyFindings: ["Large knee effusion", "Positive Lachman test", "Positive anterior drawer test", "Limited range of motion due to swelling"],
    question: "What is the most likely diagnosis?",
    options: ["Anterior cruciate ligament (ACL) tear", "Meniscus tear alone", "Patellar dislocation", "MCL sprain"],
    correctIndex: 0,
    explanation:
      "A noncontact \"pop,\" rapid effusion, instability, and positive Lachman/anterior drawer tests together are classic for an ACL tear — the Lachman test is generally considered the most sensitive clinical test for ACL integrity. Rehabilitation, with or without surgical reconstruction, is typically guided by activity goals and instability.",
    relatedTopic: "ACL tear knee injury",
  },
  {
    id: "geriatric-1",
    specialty: "Geriatric",
    patientAge: 78,
    patientSex: "Female",
    chiefComplaint: "Two falls in the past month, most recently while getting up from a chair",
    history: [
      "Lives alone, otherwise independent",
      "No loss of consciousness with either fall",
      "Takes medication for blood pressure",
      "Reports feeling \"unsteady\" when standing up quickly",
    ],
    keyFindings: [
      "Orthostatic blood pressure drop noted on standing",
      "Timed Up and Go test slower than typical for age",
      "Mild decreased lower extremity strength",
      "Vision correction is up to date",
    ],
    question: "What is the most appropriate general next step?",
    options: [
      "A falls risk assessment addressing orthostatic changes, strength, and balance",
      "No action needed since falls are a normal part of aging",
      "Immediate wheelchair prescription",
      "Referral for hearing aids",
    ],
    correctIndex: 0,
    explanation:
      "Recurrent falls in an older adult warrant a multifactorial falls risk assessment, since contributing factors here include possible orthostatic hypotension, reduced strength, and slower functional mobility. Falls are common but not inevitable — addressing modifiable contributors through balance and strength work is a standard general approach.",
    relatedTopic: "falls risk assessment older adults",
  },
  {
    id: "pediatric-1",
    specialty: "Pediatric",
    patientAge: 6,
    patientSex: "Male",
    chiefComplaint: "In-toeing gait noticed by parents",
    history: [
      "Parents noticed feet turning inward while walking and running",
      "No pain reported by the child",
      "Normal developmental milestones",
      "No family history of hip problems",
    ],
    keyFindings: ["Increased internal hip rotation on exam", "Foot progression angle turned inward", "No limp", "Normal alignment of the knees"],
    question: "In a child this age with painless in-toeing and increased internal hip rotation, what is the most likely cause?",
    options: [
      "Femoral anteversion (a common, usually self-resolving rotational variation)",
      "Slipped capital femoral epiphysis",
      "Septic hip",
      "Legg-Calve-Perthes disease",
    ],
    correctIndex: 0,
    explanation:
      "Painless in-toeing with increased internal and decreased external hip rotation in a young child is commonly due to femoral anteversion, a rotational variation that often improves on its own through childhood. The painful conditions listed usually present with pain or a limp, which isn't described here.",
    relatedTopic: "femoral anteversion in-toeing children",
  },
  {
    id: "wellness-1",
    specialty: "General Wellness",
    patientAge: 41,
    patientSex: "Female",
    chiefComplaint: "New office worker asking about preventing low back pain from prolonged sitting",
    history: [
      "Recently started a desk job, sits most of the day",
      "No current back pain but wants to prevent it",
      "Previously more physically active in a standing job",
      "Reports some stiffness by end of day",
    ],
    keyFindings: ["No red flag symptoms", "Normal general movement screen", "Reports minimal breaks from sitting", "Desk setup not yet evaluated"],
    question: "What is the most appropriate general wellness recommendation?",
    options: [
      "Regular movement breaks throughout the day plus attention to ergonomic setup",
      "Complete bed rest to prevent strain",
      "Avoid all future physical activity",
      "Sitting position doesn't affect back health at all",
    ],
    correctIndex: 0,
    explanation:
      "General wellness guidance for prolonged sitting typically emphasizes breaking up static postures with regular movement, along with basic ergonomic considerations like chair height and monitor position. This is general information, not a treatment plan.",
    relatedTopic: "ergonomics prolonged sitting back health",
  },
  {
    id: "ortho-2",
    specialty: "Orthopedic",
    patientAge: 52,
    patientSex: "Female",
    chiefComplaint: "Gradual onset right shoulder pain and stiffness over 3 months",
    history: [
      "Difficulty reaching overhead and behind her back",
      "No specific injury",
      "History of type 2 diabetes",
      "Pain worse at night, disturbing sleep",
    ],
    keyFindings: [
      "Significant loss of both active and passive shoulder range of motion in all planes",
      "No focal weakness",
      "Mild diffuse tenderness",
      "X-rays reportedly unremarkable",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Adhesive capsulitis (frozen shoulder)", "Rotator cuff tear", "Glenohumeral osteoarthritis", "Subacromial bursitis"],
    correctIndex: 0,
    explanation:
      "Adhesive capsulitis presents with progressive, global loss of both active and passive range of motion, often with night pain, and is more common in people with diabetes. Unlike a rotator cuff tear, weakness isn't usually a primary feature, and passive motion is restricted along with active motion.",
    relatedTopic: "adhesive capsulitis frozen shoulder",
  },
  {
    id: "neuro-2",
    specialty: "Neurological",
    patientAge: 45,
    patientSex: "Female",
    chiefComplaint: "Episodes of vertigo triggered by rolling over in bed",
    history: [
      "Brief spinning sensation lasting under a minute",
      "Triggered by lying down, rolling over, or looking up",
      "No hearing loss or tinnitus",
      "No headache",
    ],
    keyFindings: [
      "Positive Dix-Hallpike test with rotatory nystagmus",
      "Normal hearing screen",
      "No focal neurological deficits",
      "Symptoms reproducible and fatigable with repeated testing",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Benign paroxysmal positional vertigo (BPPV)", "Vestibular neuritis", "Meniere's disease", "Migraine-associated vertigo"],
    correctIndex: 0,
    explanation:
      "Brief, position-triggered vertigo with a positive Dix-Hallpike test and rotatory nystagmus that fatigues with repeated testing is characteristic of BPPV, caused by displaced otoconia in the semicircular canals. Unlike Meniere's disease, BPPV doesn't typically involve hearing loss or tinnitus.",
    relatedTopic: "BPPV benign paroxysmal positional vertigo",
  },
  {
    id: "sports-2",
    specialty: "Sports",
    patientAge: 16,
    patientSex: "Male",
    chiefComplaint: "Gradual pain below the kneecap during basketball season",
    history: [
      "Active adolescent basketball player, growth spurt this year",
      "Pain worse with jumping and running, improves with rest",
      "No swelling reported by the patient",
      "No traumatic injury",
    ],
    keyFindings: [
      "Tenderness and mild prominence over the tibial tuberosity",
      "Pain reproduced with resisted knee extension",
      "Full range of motion",
      "No effusion",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Osgood-Schlatter disease", "Patellar fracture", "ACL tear", "Septic knee joint"],
    correctIndex: 0,
    explanation:
      "Tenderness and prominence at the tibial tuberosity in a growing adolescent athlete, worsened by jumping, is classic for Osgood-Schlatter disease, a traction apophysitis at the patellar tendon insertion. It's typically self-limiting and managed with activity modification around growth spurts.",
    relatedTopic: "Osgood-Schlatter disease",
  },
  {
    id: "geriatric-2",
    specialty: "Geriatric",
    patientAge: 82,
    patientSex: "Male",
    chiefComplaint: "Gradual decline in walking distance and increasing reliance on a cane over 6 months",
    history: [
      "Lives with spouse, previously walked daily without assistance",
      "Reports general fatigue and \"slowing down\"",
      "History of osteoarthritis in both knees",
      "No recent illness or hospitalization",
    ],
    keyFindings: ["Reduced grip strength", "Slow gait speed", "Unintentional weight loss over the past year", "Reduced overall activity level"],
    question: "These findings are most consistent with which general geriatric syndrome?",
    options: ["Frailty", "Acute delirium", "Normal pressure hydrocephalus", "Peripheral neuropathy"],
    correctIndex: 0,
    explanation:
      "Slowed gait speed, reduced grip strength, unintentional weight loss, and declining activity together are core features commonly used to describe frailty in older adults. It's generally addressed with individualized strengthening, nutrition support, and activity programs.",
    relatedTopic: "frailty older adults",
  },
  {
    id: "pediatric-2",
    specialty: "Pediatric",
    patientAge: 13,
    patientSex: "Male",
    chiefComplaint: "Hip and groin pain with a limp for the past week",
    history: [
      "Gradual onset of pain and limp, no specific injury recalled",
      "Pain sometimes felt in the knee rather than the hip",
      "Difficulty with sports at school recently",
      "No fever",
    ],
    keyFindings: [
      "Limited internal rotation of the hip",
      "Obligate external rotation with hip flexion",
      "Antalgic gait",
      "Higher body weight for age noted",
    ],
    question: "In an adolescent with these findings, what condition must be urgently considered?",
    options: ["Slipped capital femoral epiphysis (SCFE)", "Simple muscle strain", "Growing pains", "Plantar fasciitis"],
    correctIndex: 0,
    explanation:
      "Hip or referred knee pain with a limp, limited internal rotation, and obligate external rotation on hip flexion in an adolescent — especially with higher body weight — raises concern for slipped capital femoral epiphysis, which needs urgent orthopedic evaluation to prevent further slippage.",
    relatedTopic: "slipped capital femoral epiphysis SCFE",
  },
  {
    id: "wellness-2",
    specialty: "General Wellness",
    patientAge: 55,
    patientSex: "Male",
    chiefComplaint: "Asking about general exercise recommendations after borderline high blood pressure",
    history: [
      "Previously sedentary lifestyle",
      "Cleared by his physician for general exercise",
      "No chest pain, dizziness, or other concerning symptoms",
      "Interested in starting to walk regularly",
    ],
    keyFindings: [
      "No current symptoms during activity",
      "Resting blood pressure elevated but stable",
      "No other reported red flags",
      "Motivated to begin a walking program",
    ],
    question: "Which general approach is most appropriate to suggest?",
    options: [
      "A gradual, progressive walking program with regular monitoring",
      "An intense daily high-intensity interval program starting immediately",
      "Avoiding all physical activity until blood pressure is normal",
      "Only stretching, with no cardiovascular activity at all",
    ],
    correctIndex: 0,
    explanation:
      "For someone previously sedentary with borderline high blood pressure who has been medically cleared, general wellness guidance typically favors starting with gradual, moderate activity and progressing over time, rather than jumping into high-intensity training.",
    relatedTopic: "exercise recommendations blood pressure",
  },
  {
    id: "ortho-3",
    specialty: "Orthopedic",
    patientAge: 27,
    patientSex: "Male",
    chiefComplaint: "Acute ankle pain after landing awkwardly during a basketball game",
    history: [
      "Rolled ankle inward (inversion) while landing from a jump",
      "Immediate pain and swelling",
      "Able to bear some weight but limping",
      "No previous ankle injuries",
    ],
    keyFindings: [
      "Swelling and bruising over the lateral ankle",
      "Tenderness over the anterior talofibular ligament",
      "Positive anterior drawer test",
      "Able to take four steps despite pain",
    ],
    question: "Based on the Ottawa Ankle Rules, is an X-ray indicated?",
    options: [
      "No — he can bear weight for four steps and tenderness is over the ligament, not bone",
      "Yes — any ankle swelling requires an X-ray",
      "Yes — all sports injuries require an X-ray",
      "No — X-rays are never needed for ankle sprains",
    ],
    correctIndex: 0,
    explanation:
      "The Ottawa Ankle Rules suggest X-ray is indicated only with bony tenderness at specific landmarks or inability to bear weight for four steps. Here, weight-bearing is possible and tenderness is over the ligament, making a low-risk lateral ankle sprain more likely — these rules are meant to reduce unnecessary imaging, not replace clinical judgment.",
    relatedTopic: "ankle sprain Ottawa ankle rules",
  },
  {
    id: "neuro-3",
    specialty: "Neurological",
    patientAge: 58,
    patientSex: "Male",
    chiefComplaint: "Resting tremor and slowness of movement over the past year",
    history: [
      "Family noticed reduced arm swing while walking",
      "Handwriting has become smaller",
      "Some difficulty with balance",
      "No history of stroke",
    ],
    keyFindings: ["Resting tremor in the right hand, improves with movement", "Bradykinesia", "Cogwheel rigidity at the wrist", "Shuffling gait pattern"],
    question: "What is the most likely diagnosis?",
    options: ["Parkinson's disease", "Essential tremor", "Multiple sclerosis", "Peripheral neuropathy"],
    correctIndex: 0,
    explanation:
      "Resting tremor, bradykinesia, cogwheel rigidity, and a shuffling gait are hallmark features of parkinsonism, most commonly Parkinson's disease. Essential tremor, by contrast, is typically an action/postural tremor that improves at rest — the opposite pattern seen here.",
    relatedTopic: "Parkinson's disease movement",
  },
  {
    id: "sports-3",
    specialty: "Sports",
    patientAge: 22,
    patientSex: "Male",
    chiefComplaint: "Sudden sharp calf pain during a sprint, described as feeling \"kicked\"",
    history: [
      "Playing recreational soccer",
      "Sudden sharp pain with immediate inability to continue running",
      "No prior calf injuries",
      "Some swelling and bruising developed within hours",
    ],
    keyFindings: [
      "Palpable defect/gap in the mid-calf",
      "Positive Thompson test (no plantarflexion with calf squeeze)",
      "Unable to perform a single-leg heel raise",
      "Visible bruising",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Achilles tendon rupture", "Gastrocnemius strain (grade I)", "Deep vein thrombosis", "Ankle sprain"],
    correctIndex: 0,
    explanation:
      "A sudden \"kicked in the calf\" sensation, a palpable gap, a positive Thompson test, and inability to heel raise are classic signs of an Achilles tendon rupture. A grade I strain would typically not produce a palpable defect or absent plantarflexion on the Thompson test.",
    relatedTopic: "Achilles tendon rupture",
  },
  {
    id: "geriatric-3",
    specialty: "Geriatric",
    patientAge: 75,
    patientSex: "Female",
    chiefComplaint: "Increasing confusion over the past two days, new since a recent UTI diagnosis",
    history: [
      "Normally lives independently and is cognitively intact",
      "Family noticed sudden confusion and disorientation starting yesterday",
      "Currently being treated for a urinary tract infection",
      "No prior history of dementia",
    ],
    keyFindings: [
      "Fluctuating attention and alertness through the day",
      "Disoriented to date and location",
      "No focal neurological deficits reported",
      "Baseline cognition was normal per family",
    ],
    question: "This sudden, fluctuating confusion is most consistent with which process?",
    options: ["Delirium, likely related to the current infection", "Early-stage Alzheimer's disease", "A normal reaction to aging", "Chronic traumatic encephalopathy"],
    correctIndex: 0,
    explanation:
      "Sudden onset confusion with fluctuating attention, especially with an acute illness like a UTI, is characteristic of delirium rather than a primary dementia process, which typically develops gradually over months to years. Delirium is generally considered a medical urgency requiring evaluation of the underlying cause.",
    relatedTopic: "delirium older adults",
  },
  {
    id: "pediatric-3",
    specialty: "Pediatric",
    patientAge: 8,
    patientSex: "Female",
    chiefComplaint: "Parents concerned about frequent toe-walking",
    history: [
      "Has walked on toes since starting to walk, more noticeable when barefoot",
      "Can walk flat-footed when reminded, at least some of the time",
      "Normal developmental milestones otherwise",
      "No family history of neuromuscular conditions",
    ],
    keyFindings: [
      "Mildly tight heel cords (limited ankle dorsiflexion with knee extended)",
      "Normal strength throughout",
      "Normal reflexes",
      "Able to walk heel-to-toe when asked",
    ],
    question: "In an otherwise typically developing child who can voluntarily walk flat-footed, this pattern is generally described as which of the following?",
    options: ["Idiopathic toe walking", "Cerebral palsy", "Muscular dystrophy", "Autism spectrum disorder (as the sole explanation)"],
    correctIndex: 0,
    explanation:
      "When toe-walking occurs in a child with normal strength, reflexes, and development, and the child can voluntarily walk flat-footed, it's often described as idiopathic toe walking. This general pattern typically differs from toe-walking associated with neuromuscular conditions, which usually comes with other developmental or tone findings.",
    relatedTopic: "idiopathic toe walking children",
  },
  {
    id: "wellness-3",
    specialty: "General Wellness",
    patientAge: 30,
    patientSex: "Female",
    chiefComplaint: "Asking general questions about improving sleep quality to support her training routine",
    history: [
      "Training for a half marathon, sleeping about 5-6 hours per night",
      "Reports feeling fatigued during workouts recently",
      "Uses phone in bed before sleeping",
      "No diagnosed sleep disorder",
    ],
    keyFindings: [
      "No reported symptoms of sleep apnea",
      "Caffeine intake later in the day noted",
      "Inconsistent bedtime schedule",
      "Otherwise healthy young adult",
    ],
    question: "Which general sleep hygiene recommendation is most appropriate?",
    options: [
      "Consistent sleep schedule and reduced screen time before bed",
      "Sleep is not important for athletic performance",
      "Caffeine timing doesn't affect sleep quality",
      "Training harder will automatically fix sleep issues",
    ],
    correctIndex: 0,
    explanation:
      "General sleep hygiene guidance commonly includes keeping a consistent sleep-wake schedule and limiting screen exposure before bed, both of which can support sleep quality. Adequate sleep is generally recognized as supporting recovery and performance in athletes.",
    relatedTopic: "sleep hygiene athletic recovery",
  },
  {
    id: "ortho-4",
    specialty: "Orthopedic",
    patientAge: 45,
    patientSex: "Male",
    chiefComplaint: "Low back pain radiating down the left leg for 2 weeks",
    history: [
      "Pain started after lifting a heavy box",
      "Sharp, shooting pain to the outer foot",
      "Numbness and tingling along the outside of the foot",
      "No bowel or bladder changes",
    ],
    keyFindings: [
      "Positive straight leg raise on the left",
      "Diminished Achilles (ankle) reflex on the left",
      "Mild weakness with plantarflexion",
      "Numbness along the outer/lateral foot",
    ],
    question: "Which nerve root is most likely involved?",
    options: ["S1", "L4", "L2", "L5"],
    correctIndex: 0,
    explanation:
      "A diminished ankle (Achilles) reflex, plantarflexion weakness, and lateral foot numbness are classic for an S1 radiculopathy, often from a lower lumbar disc herniation. A positive straight leg raise supports lumbosacral nerve root irritation. Most acute radiculopathies improve with conservative management over several weeks.",
    relatedTopic: "lumbar radiculopathy S1 nerve root",
  },
  {
    id: "neuro-4",
    specialty: "Neurological",
    patientAge: 24,
    patientSex: "Male",
    chiefComplaint: "Numbness and tingling in both legs, progressing upward over 3 days",
    history: [
      "Had a diarrheal illness about 2 weeks ago",
      "Progressive weakness now affecting both legs",
      "Some difficulty climbing stairs",
      "No bowel or bladder symptoms yet",
    ],
    keyFindings: [
      "Symmetric weakness in bilateral lower extremities",
      "Diminished deep tendon reflexes throughout",
      "Mild distal sensory changes",
      "No fever",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Guillain-Barré syndrome", "Multiple sclerosis", "Lumbar spinal stenosis", "Peripheral vascular disease"],
    correctIndex: 0,
    explanation:
      "Ascending, symmetric weakness with diminished reflexes following a recent infection is a classic presentation of Guillain-Barré syndrome, an autoimmune process affecting peripheral nerves. Because it can progress to affect breathing muscles, this presentation warrants urgent medical evaluation rather than routine outpatient care.",
    relatedTopic: "Guillain-Barre syndrome",
  },
  {
    id: "sports-4",
    specialty: "Sports",
    patientAge: 29,
    patientSex: "Female",
    chiefComplaint: "Shoulder pain with overhead activity, training for a swim competition",
    history: [
      "Competitive swimmer, recently increased training volume",
      "Pain with freestyle and butterfly strokes",
      "Some night pain when lying on the affected side",
      "No traumatic injury",
    ],
    keyFindings: [
      "Positive Neer and Hawkins-Kennedy impingement tests",
      "Pain with resisted external rotation",
      "Mild weakness with resisted abduction",
      "No gross instability noted",
    ],
    question: "What is the most likely diagnosis?",
    options: ["Rotator cuff-related shoulder pain (subacromial impingement)", "Adhesive capsulitis", "Glenohumeral dislocation", "Cervical radiculopathy"],
    correctIndex: 0,
    explanation:
      "Positive impingement signs along with pain and mild weakness on resisted rotator cuff testing in an overhead athlete are typical of rotator cuff-related shoulder pain, common with high training volumes in swimmers. Management generally emphasizes scapular and rotator cuff strengthening alongside training load modification.",
    relatedTopic: "swimmer's shoulder rotator cuff impingement",
  },
  {
    id: "geriatric-4",
    specialty: "Geriatric",
    patientAge: 69,
    patientSex: "Male",
    chiefComplaint: "Worsening low back pain and difficulty walking distances, better leaning on a shopping cart",
    history: [
      "Pain and leg heaviness with walking, relieved by sitting or bending forward",
      "Symptoms present for about a year, slowly worsening",
      "No bowel or bladder changes",
      "Able to bike further than he can walk",
    ],
    keyFindings: [
      "Pain reproduced with lumbar extension, relieved with flexion",
      "Normal pulses in both feet",
      "Mild bilateral lower extremity weakness after walking a distance",
      "Normal reflexes at rest",
    ],
    question: "This pattern of symptoms is most consistent with which condition?",
    options: ["Lumbar spinal stenosis (neurogenic claudication)", "Peripheral arterial disease (vascular claudication)", "Acute disc herniation", "Hip osteoarthritis alone"],
    correctIndex: 0,
    explanation:
      "Symptoms that worsen with walking and lumbar extension but improve with forward flexion (like leaning on a cart) or sitting are classic for neurogenic claudication from lumbar spinal stenosis. This differs from vascular claudication, which is typically position-independent and related to pulses rather than posture.",
    relatedTopic: "lumbar spinal stenosis neurogenic claudication",
  },
  {
    id: "pediatric-4",
    specialty: "Pediatric",
    patientAge: 10,
    patientSex: "Male",
    chiefComplaint: "Knee pain during and after soccer practice, both knees",
    history: [
      "Active in soccer several times a week",
      "Pain located just below the kneecap",
      "No swelling noticed by parents",
      "Currently in a growth spurt per recent pediatrician visit",
    ],
    keyFindings: [
      "Tenderness at the tibial tuberosity bilaterally",
      "Pain with resisted knee extension and with jumping",
      "Normal knee stability testing",
      "No effusion",
    ],
    question: "This bilateral pattern in a growing, active child is most consistent with which condition?",
    options: ["Osgood-Schlatter disease", "Bilateral ACL tear", "Septic arthritis", "Osteosarcoma"],
    correctIndex: 0,
    explanation:
      "Bilateral tibial tuberosity tenderness with activity-related pain in a growing, sports-active child is a classic presentation of Osgood-Schlatter disease, related to traction at the patellar tendon attachment during growth spurts. It's generally self-limiting, managed with activity modification and load management.",
    relatedTopic: "Osgood-Schlatter disease children",
  },
  {
    id: "wellness-4",
    specialty: "General Wellness",
    patientAge: 48,
    patientSex: "Male",
    chiefComplaint: "Asking about general stress management strategies during a demanding period at work",
    history: [
      "Reports high work stress over the past several months",
      "Notices increased muscle tension, especially in the neck and shoulders",
      "No diagnosed anxiety or depression",
      "Interested in general, practical strategies",
    ],
    keyFindings: [
      "No reported red flag symptoms",
      "Reports minimal current physical activity",
      "Interested specifically in non-pharmacological approaches",
      "Otherwise generally healthy",
    ],
    question: "Which general wellness strategy is most broadly supported for stress management?",
    options: [
      "Regular physical activity combined with relaxation techniques like breathing exercises",
      "Ignoring stress until it resolves on its own",
      "Increasing caffeine intake to power through",
      "Avoiding all social interaction during stressful periods",
    ],
    correctIndex: 0,
    explanation:
      "General wellness guidance commonly points to regular physical activity and relaxation-based techniques, such as diaphragmatic breathing, as broadly supported, accessible strategies for managing everyday stress and associated muscle tension. Ongoing significant stress or mood symptoms are generally worth discussing with a qualified professional.",
    relatedTopic: "stress management relaxation techniques",
  },
  {
    id: "ortho-5",
    specialty: "Orthopedic",
    patientAge: 62,
    patientSex: "Male",
    chiefComplaint: "Gradually worsening bilateral knee pain, worse with stairs and after prolonged sitting",
    history: [
      "Pain present for over a year, slowly progressive",
      "Morning stiffness lasting less than 30 minutes",
      "Some swelling after long walks",
      "BMI in the obese range",
    ],
    keyFindings: ["Crepitus with knee range of motion", "Bony enlargement around the joint line", "No warmth or redness", "Mild quadriceps weakness"],
    question: "What is the most likely diagnosis?",
    options: ["Knee osteoarthritis", "Rheumatoid arthritis", "Septic arthritis", "Patellar tendinopathy"],
    correctIndex: 0,
    explanation:
      "Gradual onset, crepitus, bony enlargement, and brief morning stiffness (under 30 minutes) are typical of osteoarthritis, especially with risk factors like age and higher body weight. Rheumatoid arthritis usually causes longer morning stiffness with more inflammatory, symmetric small-joint involvement.",
    relatedTopic: "knee osteoarthritis",
  },
  {
    id: "neuro-5",
    specialty: "Neurological",
    patientAge: 71,
    patientSex: "Male",
    chiefComplaint: "Increasing forgetfulness and difficulty with familiar tasks over the past 2 years",
    history: [
      "Family reports repeating questions and misplacing items",
      "Getting lost in familiar neighborhoods recently",
      "No history of stroke",
      "Gradual, slow progression",
    ],
    keyFindings: [
      "Impaired short-term memory on brief cognitive screening",
      "Normal strength and sensation",
      "No focal neurological deficits",
      "Independent with basic self-care but needs help managing finances",
    ],
    question: "What is the most likely underlying process?",
    options: [
      "A neurodegenerative dementia process (e.g., Alzheimer's-type)",
      "An acute stroke",
      "A vitamin B12 deficiency causing acute confusion",
      "Normal age-related forgetfulness",
    ],
    correctIndex: 0,
    explanation:
      "A gradual, progressive decline in memory and instrumental daily activities over years, without focal neurological signs, is typical of a neurodegenerative dementia process. This differs from normal aging, which doesn't usually impair independent function, and from an acute confusional state, which comes on suddenly.",
    relatedTopic: "dementia cognitive decline",
  },
  {
    id: "sports-5",
    specialty: "Sports",
    patientAge: 33,
    patientSex: "Male",
    chiefComplaint: "Recurrent ankle sprains, most recent one three days ago on an uneven trail",
    history: [
      "Fourth ankle sprain in the past two years, same ankle",
      "Each episode involves rolling the ankle inward",
      "Feels the ankle is generally \"unstable\"",
      "Completed rehab briefly after prior sprains but didn't finish",
    ],
    keyFindings: [
      "Positive anterior drawer and talar tilt tests",
      "Mild residual swelling",
      "Decreased single-leg balance time compared to the uninjured side",
      "Normal strength once swelling settled",
    ],
    question: "What is the most likely underlying contributing factor?",
    options: ["Chronic ankle instability from incomplete rehabilitation", "A new acute fracture", "Unrelated hip pathology", "Normal age-related decline"],
    correctIndex: 0,
    explanation:
      "Recurrent sprains of the same ankle with positive laxity tests and reduced balance/proprioception are consistent with chronic ankle instability, often related to incomplete rehabilitation after prior sprains. Balance and proprioceptive training are commonly emphasized in general rehabilitation approaches for this pattern.",
    relatedTopic: "chronic ankle instability",
  },
  {
    id: "geriatric-5",
    specialty: "Geriatric",
    patientAge: 85,
    patientSex: "Female",
    chiefComplaint: "Chronic joint pain and difficulty with grip, worse in the morning",
    history: [
      "Long-standing hand pain, now affecting jar-opening and buttoning clothes",
      "Morning stiffness lasting about 45-60 minutes",
      "Multiple joints affected symmetrically in both hands",
      "Family history of similar joint issues",
    ],
    keyFindings: [
      "Symmetric swelling in the MCP and PIP joints of both hands",
      "Warmth over affected joints",
      "Reduced grip strength bilaterally",
      "No fever",
    ],
    question: "This presentation is most consistent with which general category of joint condition?",
    options: ["An inflammatory arthritis pattern (e.g., rheumatoid arthritis)", "Isolated osteoarthritis", "A recent traumatic injury", "Gout confined to the hands"],
    correctIndex: 0,
    explanation:
      "Symmetric small-joint swelling and warmth with prolonged morning stiffness (over 45 minutes) suggest an inflammatory arthritis pattern rather than typical osteoarthritis, which usually causes shorter morning stiffness and more asymmetric, larger-joint involvement.",
    relatedTopic: "rheumatoid arthritis hand",
  },
  {
    id: "pediatric-5",
    specialty: "Pediatric",
    patientAge: 4,
    patientSex: "Female",
    chiefComplaint: "Sudden refusal to use the left arm after being swung by the hands during play",
    history: [
      "An adult was swinging her by the hands/wrists during play",
      "She cried immediately and has refused to use the arm since",
      "Holding the arm slightly bent and close to the body",
      "No visible swelling or deformity",
    ],
    keyFindings: [
      "Arm held in slight flexion and pronation, close to the body",
      "No swelling, bruising, or deformity",
      "Pain minimal with gentle exam if the arm isn't moved",
      "Full use of the hand when not asked to move the elbow",
    ],
    question: "This classic mechanism and presentation is most consistent with which condition?",
    options: ["Radial head subluxation (\"nursemaid's elbow\")", "Elbow fracture with deformity", "Shoulder dislocation", "Septic elbow joint"],
    correctIndex: 0,
    explanation:
      "A young child who won't use an arm after being pulled or swung by the hand/wrist, holding the arm slightly flexed without swelling or deformity, is a classic presentation of radial head subluxation, commonly called nursemaid's elbow — a common, generally benign pediatric injury.",
    relatedTopic: "nursemaid's elbow radial head subluxation",
  },
  {
    id: "wellness-5",
    specialty: "General Wellness",
    patientAge: 26,
    patientSex: "Female",
    chiefComplaint: "Asking for general guidance on returning to exercise after a mild cold",
    history: [
      "Had cold symptoms (runny nose, mild cough) for the past 4 days",
      "Symptoms now improving, no fever",
      "Normally exercises 4-5 times per week",
      "Wants to know when it's reasonable to resume training",
    ],
    keyFindings: [
      "No fever currently or in recent days",
      "Symptoms limited to \"above the neck\" (runny nose, mild sore throat)",
      "No chest symptoms or significant fatigue",
      "Otherwise healthy young adult",
    ],
    question: "Using general \"neck check\" guidance, what would be a reasonable suggestion?",
    options: [
      "Light to moderate activity is often reasonable with symptoms above the neck and no fever, starting gradually",
      "She must wait a full month before any activity",
      "Intense training should resume immediately at full intensity",
      "Exercise is never appropriate during any illness",
    ],
    correctIndex: 0,
    explanation:
      "A commonly cited general guideline suggests light-to-moderate activity may be reasonable when symptoms are confined \"above the neck\" without fever, while symptoms \"below the neck\" or fever generally warrant more caution and rest. Starting back gradually is typically recommended regardless.",
    relatedTopic: "exercise return after illness",
  },
];

const DAY_MS = 86400000;
// A fixed, arbitrary epoch before this app existed — just needs to be stable across
// deploys so the same calendar day always maps to the same index.
const EPOCH_MS = new Date(2024, 0, 1).getTime();

/** Sequential day index (not hashed) — the spec wants cases to "rotate by day index...
 *  resets after 30 days," i.e. cycle through the bank in order, unlike Wordle/Crossword's
 *  hash-based word/puzzle-of-the-day. Takes the same "YYYY-MM-DD" dateKey used for the
 *  DailyCompletion row (see lib/wordle-words.ts's todayDateKey) rather than a Date, so the
 *  case shown for "today" and the case recorded as completed for "today" can never drift
 *  apart from computing "today" two different ways. */
export function dayIndexForDateKey(dateKey: string): number {
  const ms = new Date(dateKey + "T00:00:00Z").getTime();
  return Math.floor((ms - EPOCH_MS) / DAY_MS);
}

export function caseForDayIndex(dayIndex: number): DailyCase {
  const idx = ((dayIndex % CASES.length) + CASES.length) % CASES.length;
  return CASES[idx];
}
