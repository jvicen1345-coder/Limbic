"use client";

import { useState } from "react";
import { ExternalLinkIcon } from "@/components/icons";

interface Guideline {
  condition: string;
  org: string;
  year: number;
  region: string;
  url: string;
  recommendations: string[];
  /** Most entries are true clinical practice guidelines; a few real, credible documents
   *  PTs actually use are a different document type — a sports-medicine consensus
   *  statement (concussion, groin pain terminology) or a screening framework (IFOMPT's
   *  pre-manipulation vascular screen) rather than a graded treatment CPG. Labeled
   *  distinctly on the card (see GuidelineCard) rather than folded into "CPG" so the
   *  distinction isn't misrepresented. Defaults to "CPG" when omitted. */
  docType?: "CPG" | "Consensus Statement" | "Framework";
}

const REGIONS = [
  "All",
  "Spine",
  "Shoulder",
  "Elbow & Hand",
  "Hip",
  "Knee",
  "Ankle",
  "Neurological",
  "Cardiopulmonary",
  "Oncology",
  "Acute Care",
  "Rheumatology",
  "Pediatrics",
  "Geriatrics",
] as const;

// Real, verifiable clinical practice guidelines with their actual DOIs. A few conditions
// from the original list didn't correspond to a real, verifiable citation as originally
// dated/titled, so they were corrected against the actual published guideline:
//  - Shoulder: the real ICF-linked JOSPT guideline is the 2013 Adhesive Capsulitis CPG,
//    not a 2022 document (2022 JOSPT vol 52 is a differently-titled Rotator Cuff Disorders
//    CPG from a different guideline series — the real rotator cuff CPG, added below, is the
//    2025 "Rotator Cuff Tendinopathy Diagnosis, Nonsurgical Medical Care, and Rehabilitation").
//  - Stroke: the real JNPT CPG is the 2020 Locomotor Function guideline, not 2022.
//  - Fall prevention: the current APTA Geriatrics CPG is the 2025 update; no 2021 version exists.
//  - COPD: no 2019 APTA-authored CPG exists; the real, current pulmonary rehab CPG is
//    ATS-authored (2023), which APTA's CPG+ library formally lists.
//  - Bell's Palsy: no PT-specific (APTA) clinical practice guideline exists for this
//    condition, so it was replaced with the real APTA Neurologic PT vestibular hypofunction
//    CPG, a genuine guideline covering the same Neurological region.
//
// Expanded to every other real, verifiable ICF-linked/APTA-academy CPG found (Aug 2026) —
// each checked against its actual JOSPT/Physical Therapy/Pediatric Physical Therapy DOI
// before being added, same discipline as above. Three entries above were also superseded by
// real, more recent revisions and updated in place: Hip Osteoarthritis (2017 -> 2025),
// Achilles Tendinopathy (2018 -> 2024), and Plantar Fasciitis (2014 -> 2023). A candidate
// Pelvic Girdle Pain (antepartum) CPG was investigated but left out — its exact year/DOI
// couldn't be independently confirmed (paywalled), so it's omitted rather than guessed.
//
// Further expanded beyond APTA/JOSPT to other credible sources PTs actually reference
// (Aug 2026): AAOS (surgeon-authored, but the standard reference for its topics), NICE (UK,
// widely cited even in US practice), and non-treatment-CPG documents PTs still rely on —
// sports-medicine consensus statements and IFOMPT's vascular-screening framework, each
// labeled by its real docType (see the Guideline interface above) rather than folded into
// "CPG". Investigated-but-not-found gaps, so they're deliberately absent rather than
// fabricated: femoroacetabular impingement and cervical radiculopathy don't have standalone
// CPGs (both are addressed within the Nonarthritic Hip Joint Pain and Neck Pain CPGs above),
// patellar tendinopathy and a groin-pain treatment guideline have no formal APTA/JOSPT CPG,
// and the Academy of Aquatic Physical Therapy publishes methodology guidance but no
// condition-specific CPG under its own name.
const GUIDELINES: Guideline[] = [
  {
    condition: "Low Back Pain",
    org: "APTA",
    year: 2021,
    region: "Spine",
    url: "https://www.jospt.org/doi/10.2519/jospt.2021.0304",
    recommendations: [
      "Classify patients into impairment-based categories (mobility deficits, movement coordination impairments, radiating pain, etc.) to guide treatment selection.",
      "Use manual therapy combined with exercise for acute, subacute, and chronic low back pain with mobility deficits.",
      "Prescribe trunk coordination, strengthening, and endurance exercises for chronic low back pain with movement coordination impairments.",
      "Emphasize patient education on an active approach, favorable natural history, and a biopsychosocial framework, especially for chronic presentations.",
      "For radiating pain, consider directional-preference exercise and neural mobilization as appropriate to the presentation.",
    ],
  },
  {
    condition: "Neck Pain",
    org: "APTA",
    year: 2017,
    region: "Spine",
    url: "https://www.jospt.org/doi/10.2519/jospt.2017.0302",
    recommendations: [
      "Categorize patients by impairment pattern (mobility deficits, movement coordination impairments/whiplash, headache, radiating pain) to direct intervention choice.",
      "Combine cervical and thoracic manipulation/mobilization with exercise for neck pain with mobility deficits.",
      "Use coordination, strengthening, and endurance exercise for neck pain with movement coordination impairments, including whiplash-associated disorder.",
      "Combine cervical mobilization/manipulation with exercise and low-load endurance exercise for cervicogenic headache.",
      "Educate patients on the generally favorable prognosis of neck pain and encourage remaining active; use mechanical traction as an adjunct for radiating pain when indicated.",
    ],
  },
  {
    condition: "Hip Pain and Mobility Deficits: Hip Osteoarthritis",
    org: "APTA",
    year: 2025,
    region: "Hip",
    url: "https://www.jospt.org/doi/10.2519/jospt.2025.0301",
    recommendations: [
      "Use patient-reported outcome measures alongside physical impairment measures to classify severity and track progress.",
      "Combine manual therapy with flexibility, strengthening, and endurance exercise to reduce pain and improve function and gait.",
      "Prescribe flexibility, strengthening, and endurance exercise, including aquatic-based exercise when appropriate.",
      "Provide education on activity modification, weight management where applicable, and self-management strategies.",
      "Consider a gait aid for patients with substantial mobility loss to improve safety and function.",
    ],
  },
  {
    condition: "Knee Pain and Mobility Deficits",
    org: "APTA",
    year: 2018,
    region: "Knee",
    url: "https://www.jospt.org/doi/10.2519/jospt.2018.0301",
    recommendations: [
      "Use validated outcome measures to classify severity and monitor treatment response.",
      "Prescribe strengthening exercise, particularly quadriceps-focused, combined with flexibility and functional training.",
      "Combine manual therapy with a structured exercise program for short-term pain relief and functional gains.",
      "Use neuromuscular re-education and functional training to address movement-pattern deficits contributing to joint loading.",
      "Educate patients on activity modification, weight management where applicable, and staying physically active.",
    ],
  },
  {
    condition: "Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy",
    org: "APTA",
    year: 2024,
    region: "Ankle",
    url: "https://www.jospt.org/doi/10.2519/jospt.2024.0302",
    recommendations: [
      "Classify presentation as midportion versus insertional Achilles tendinopathy, since management differs, particularly around dorsiflexion range for insertional cases.",
      "Use tendon loading exercise, with load as high as tolerated, as first-line treatment — at least 3 sessions a week — to improve function and reduce pain.",
      "Consider orthotic devices or heel lifts as an adjunct to reduce tendon load in select patients, particularly early in care or with insertional involvement.",
      "Use manual therapy adjunctively rather than as a stand-alone intervention; evidence for it alone is limited.",
      "Provide education and counseling — either a pain-science or pathoanatomic focus — alongside tendon-loading exercise, given the typically prolonged recovery timeline.",
    ],
  },
  {
    condition: "Shoulder Pain and Mobility Deficits: Adhesive Capsulitis",
    org: "APTA",
    year: 2013,
    region: "Shoulder",
    url: "https://www.jospt.org/doi/10.2519/jospt.2013.0302",
    recommendations: [
      "Recognize the natural stages of adhesive capsulitis (freezing, frozen, thawing) to set expectations and guide intervention intensity.",
      "Combine corticosteroid injection with stretching and mobility exercise for short-term (up to 4 months) pain relief and functional gains.",
      "Prescribe patient education and stretching within pain-free range, progressing intensity as tolerated by stage.",
      "Use joint mobilization to address capsular restriction, particularly in the frozen and thawing stages.",
      "Track function over the episode of care with validated measures such as the SPADI or DASH.",
    ],
  },
  {
    condition: "Patellofemoral Pain",
    org: "APTA",
    year: 2019,
    region: "Knee",
    url: "https://www.jospt.org/doi/10.2519/jospt.2019.0302",
    recommendations: [
      "Combine hip and knee strengthening, addressing both proximal and local strength deficits, as a first-line intervention.",
      "Use foot orthoses, particularly in patients with excessive foot pronation, for short-term pain relief alongside exercise.",
      "Consider patellar taping for short-term additional pain relief when added to an exercise program.",
      "Favor combined interventions, such as exercise plus patellar mobilization, taping, and stretching, over exercise alone for short- and mid-term outcomes.",
      "Guide treatment by movement and functional assessment rather than isolated biomechanical or imaging findings alone.",
    ],
  },
  {
    condition: "Locomotor Function After Stroke, SCI, or Brain Injury",
    org: "APTA",
    year: 2020,
    region: "Neurological",
    url: "https://doi.org/10.1097/NPT.0000000000000303",
    recommendations: [
      "Prescribe moderate-to-high intensity, task-specific walking practice to improve walking speed and distance in chronic stroke, incomplete spinal cord injury, and brain injury.",
      "Favor walking-based interventions over non-walking lower-extremity exercise alone when the goal is improving walking function.",
      "Consider body-weight-supported treadmill training or robotic-assisted gait training as options, though overground task-specific practice is emphasized.",
      "Recognize that higher volumes and intensities of walking practice are associated with greater gains than low-intensity approaches.",
      "Individualize the intervention to the patient's baseline walking ability and specific goal, whether that is speed, distance, or community ambulation.",
    ],
  },
  {
    condition: "Vestibular Rehabilitation for Peripheral Vestibular Hypofunction",
    org: "APTA",
    year: 2022,
    region: "Neurological",
    url: "https://doi.org/10.1097/NPT.0000000000000382",
    recommendations: [
      "Offer vestibular rehabilitation to adults with unilateral or bilateral peripheral vestibular hypofunction; evidence strongly supports reduced symptoms and improved gaze/postural stability and function.",
      "Include gaze stabilization exercise, such as adaptation and substitution exercises, as a core component.",
      "Include static and dynamic balance and postural-stability training tailored to the patient's specific impairments.",
      "Add habituation exercise for patients whose symptoms are provoked by specific movements or positions.",
      "Initiate vestibular rehabilitation as soon as tolerated after onset, since earlier initiation is generally associated with better outcomes.",
    ],
  },
  {
    condition: "Fall Risk in Community-Dwelling Older Adults",
    org: "APTA",
    year: 2025,
    region: "Geriatrics",
    url: "https://doi.org/10.1519/JPT.0000000000000454",
    recommendations: [
      "Screen all community-dwelling older adults for fall risk using validated tools such as gait speed, the Timed Up and Go, and fall history.",
      "Provide multicomponent exercise emphasizing balance training as the primary component; balance-focused exercise has the strongest evidence for reducing falls.",
      "Add progressive strength training alongside balance training, particularly for patients with lower-extremity weakness.",
      "Address environmental and multifactorial risk factors, such as vision, medications, and home hazards, through referral and care coordination when identified.",
      "Use a clinical decision algorithm to guide the process from screening through intervention and reassessment.",
    ],
  },
  {
    condition: "Pulmonary Rehabilitation for Chronic Respiratory Disease",
    org: "ATS",
    year: 2023,
    region: "Cardiopulmonary",
    url: "https://doi.org/10.1164/rccm.202306-1066ST",
    recommendations: [
      "Strongly recommend pulmonary rehabilitation for patients with COPD following an exacerbation, including initiation within a short window after hospitalization, to reduce readmission and improve quality of life.",
      "Recommend pulmonary rehabilitation for stable COPD to improve exercise capacity, dyspnea, and health-related quality of life.",
      "Extend pulmonary rehabilitation to other chronic respiratory diseases beyond COPD, including interstitial lung disease, given demonstrated benefit.",
      "Build the program around exercise training, both aerobic and resistance, as the core component.",
      "Consider maintenance or telerehabilitation strategies to sustain benefits after the initial program ends.",
    ],
  },
  {
    condition: "Heel Pain: Plantar Fasciitis",
    org: "APTA",
    year: 2023,
    region: "Ankle",
    url: "https://www.jospt.org/doi/10.2519/jospt.2023.0303",
    recommendations: [
      "Combine manual therapy, joint and soft tissue mobilization, with a stretching program, particularly for short-term pain relief.",
      "Prescribe plantar fascia-specific and gastrocnemius/soleus stretching as first-line self-management.",
      "Use foot orthoses, prefabricated or custom, for short- to mid-term pain and function improvement.",
      "Consider night splints for patients with symptoms lasting longer than 6 months.",
      "Use taping for short-term (up to 3 weeks) pain relief while other interventions take effect.",
    ],
  },
  {
    condition: "Knee Stability and Movement Coordination Impairments: Knee Ligament Sprain (ACL)",
    org: "APTA",
    year: 2017,
    region: "Knee",
    url: "https://www.jospt.org/doi/10.2519/jospt.2017.0303",
    recommendations: [
      "Assess knee laxity/stability, lower-limb movement coordination, thigh muscle strength, effusion, and range of motion as impairment measures across the episode of care.",
      "Use reproducible physical performance measures, such as single-limb hop tests, to assess activity limitations and readiness to progress.",
      "Prescribe neuromuscular and progressive strength training regardless of whether management is operative or nonoperative.",
      "Base return-to-sport progression on criteria (strength and hop-test symmetry, movement quality) rather than time since injury or surgery alone.",
      "Screen for and address psychological readiness, not just physical impairments, before clearing return to cutting/pivoting sport.",
    ],
  },
  {
    condition: "Exercise-Based Knee and Anterior Cruciate Ligament Injury Prevention",
    org: "APTA",
    year: 2023,
    region: "Knee",
    url: "https://www.jospt.org/doi/10.2519/jospt.2023.0301",
    recommendations: [
      "Implement multicomponent neuromuscular training programs — combining strength, plyometric, balance, and agility elements — over single-component programs to reduce ACL injury risk.",
      "Prioritize these programs for adolescent and young adult athletes in cutting/pivoting sports, where risk (and evidence of benefit) is highest.",
      "Run programs at least twice weekly, continued through the competitive season rather than as a preseason-only block, since benefit fades once training stops.",
      "Emphasize proper landing mechanics and dynamic knee valgus control as a central training target.",
      "Favor coach- or clinician-led implementation with real-time feedback over unsupervised home programs to improve adherence and effect.",
    ],
  },
  {
    condition: "Ankle Stability and Movement Coordination Impairments: Lateral Ankle Ligament Sprains",
    org: "APTA",
    year: 2021,
    region: "Ankle",
    url: "https://www.jospt.org/doi/10.2519/jospt.2021.0302",
    recommendations: [
      "Distinguish a first-time acute lateral ankle sprain from chronic ankle instability, since management and prognosis differ between the two.",
      "Favor early functional mobilization and protected weight-bearing (bracing/taping) over prolonged immobilization for acute sprains.",
      "Prescribe balance and proprioceptive training to reduce both short-term reinjury risk and progression to chronic instability.",
      "Use manual therapy adjunctively to address residual talocrural or subtalar mobility deficits.",
      "Base return to sport or activity on criteria — functional hop and balance testing — rather than time since injury alone.",
    ],
  },
  {
    condition: "Hip Pain and Movement Dysfunction Associated With Nonarthritic Hip Joint Pain",
    org: "APTA",
    year: 2023,
    region: "Hip",
    url: "https://www.jospt.org/doi/10.2519/jospt.2023.0302",
    recommendations: [
      "Consider osseous abnormalities (e.g., FAI morphology), ligamentous laxity, connective tissue disorders, and activity demands as risk factors when evaluating nonarthritic hip pain.",
      "Use a multimodal program: strengthening of hip-specific muscles (iliopsoas, gluteus medius/maximus, rotators), trunk musculature, and general lower-extremity strength.",
      "Add manual therapy, postural and movement correction, stretching, and balance training alongside strengthening rather than as stand-alone care.",
      "Modify aggravating activities and loading while the strengthening program is established, rather than resting completely.",
      "Track outcomes with validated hip-specific patient-reported measures across the episode of care.",
    ],
  },
  {
    condition: "Rotator Cuff Tendinopathy: Diagnosis, Nonsurgical Medical Care, and Rehabilitation",
    org: "JOSPT",
    year: 2025,
    region: "Shoulder",
    url: "https://www.jospt.org/doi/10.2519/jospt.2025.13182",
    recommendations: [
      "Reserve diagnostic imaging for patients who fail to respond to an initial course of conservative care, rather than as a routine first step.",
      "Center nonsurgical care on individualized, progressive exercise rather than passive modalities.",
      "Address psychosocial factors (pain beliefs, fear-avoidance, expectations) alongside the physical impairments, since they influence outcomes.",
      "Apply the same diagnosis to rotator cuff tendinopathy with or without calcifications and to partial-thickness tears — surgical referral is not the default for these presentations.",
      "Use a structured, criteria-based return-to-sport or return-to-activity progression for elite and recreational athletes rather than a fixed timeline.",
    ],
  },
  {
    condition: "Lateral Elbow Pain and Muscle Function Impairments",
    org: "APTA",
    year: 2022,
    region: "Elbow & Hand",
    url: "https://www.jospt.org/doi/10.2519/jospt.2022.0302",
    recommendations: [
      "Use the Patient-Rated Tennis Elbow Evaluation (PRTEE) to track pain/irritability and function over the episode of care.",
      "Prescribe progressive loading exercise (isometric, isotonic, or eccentric) as the primary intervention rather than rest alone.",
      "Consider a counterforce brace as a short-term adjunct for symptom relief during daily activities.",
      "Use elbow and wrist manual therapy adjunctively to support the exercise program, not as a stand-alone treatment.",
      "Set expectations for a protracted course with high recurrence risk, and favor corticosteroid injection sparingly given its lack of durable benefit relative to exercise.",
    ],
  },
  {
    condition: "Hand Pain and Sensory Deficits: Carpal Tunnel Syndrome",
    org: "APTA",
    year: 2026,
    region: "Elbow & Hand",
    url: "https://www.jospt.org/doi/10.2519/jospt.2026.0301",
    recommendations: [
      "Use nocturnal wrist splinting in a neutral position as a first-line conservative intervention.",
      "Add median nerve and tendon gliding exercises as an adjunct to splinting.",
      "Use manual therapy, including carpal bone mobilization, adjunctively to address mobility deficits.",
      "Address ergonomic and activity contributors (repetitive/sustained wrist flexion or extension, vibration exposure) alongside direct intervention.",
      "Refer for electrodiagnostic testing when the diagnosis is unclear or symptoms are progressive, to guide conservative-versus-surgical decision-making.",
    ],
  },
  {
    condition: "Physical Therapy Management of Older Adults With Hip Fracture",
    org: "APTA",
    year: 2021,
    region: "Geriatrics",
    url: "https://www.jospt.org/doi/10.2519/jospt.2021.0301",
    recommendations: [
      "Begin mobilization as early as medically appropriate after surgical fixation to reduce complications and support function.",
      "Progress weight-bearing and gait training according to the specific surgical fixation used, in coordination with the surgical team.",
      "Screen and document fall-risk factors and pressure-ulcer risk as a standard part of the episode of care.",
      "Coordinate care within a multidisciplinary, delirium-aware framework, since cognitive status affects rehab participation and safety.",
      "Address discharge planning and home safety (equipment, environmental hazards) before transition out of formal PT care.",
    ],
  },
  {
    condition: "Physical Therapist Management of Total Knee Arthroplasty",
    org: "APTA",
    year: 2026,
    region: "Knee",
    url: "https://academic.oup.com/ptj/article/106/7/pzag058",
    recommendations: [
      "Provide preoperative physical therapy education and, when feasible, prehabilitation to set expectations and support postoperative recovery.",
      "Prioritize early postoperative mobilization, gait training, and edema management as core components of care.",
      "Consider neuromuscular electrical stimulation as an adjunct for quadriceps strength recovery in select patients.",
      "Use validated outcome measures (e.g., functional performance tests, patient-reported measures) to track recovery and guide discharge timing.",
      "Progress strengthening and functional training according to individual recovery milestones rather than a fixed visit count.",
    ],
  },
  {
    condition: "Physical Therapist Management of Parkinson Disease",
    org: "APTA",
    year: 2022,
    region: "Neurological",
    url: "https://academic.oup.com/ptj/article/102/4/pzab302",
    recommendations: [
      "Prescribe aerobic exercise and progressive resistance training — evidence supports benefit sustained over 6 months to 2 years, even for early- to mid-stage disease.",
      "Include balance training and gait training targeting freezing, festination, and postural instability specifically.",
      "Use external cueing (visual, auditory, or rhythmic) to address freezing of gait and improve movement initiation.",
      "Favor task-specific and community-based exercise programs to support long-term adherence beyond the formal episode of care.",
      "Apply a behavior-change approach and integrated/coordinated care, since this scope is limited to idiopathic, typical Parkinson disease rather than atypical parkinsonism.",
    ],
  },
  {
    condition: "Physical Therapy Management of Congenital Muscular Torticollis",
    org: "APTA",
    year: 2018,
    region: "Pediatrics",
    url: "https://doi.org/10.1097/PEP.0000000000000544",
    recommendations: [
      "Use passive stretching of the involved sternocleidomastoid, combined with active movement strategies (positioning, handling, tummy time) to encourage symmetric active rotation.",
      "Center the program on caregiver education and a consistent home program, since most of the intervention dose happens outside clinic visits.",
      "Grade severity and monitor progress with standardized measures (e.g., cervical rotation range of motion, the CMT Severity Scale) rather than visual assessment alone.",
      "Distinguish discontinuation of direct PT services, a later reassessment, and formal discharge as separate decision points in the episode of care.",
      "Refer for further medical/surgical evaluation when passive rotation deficit or asymmetry fails to resolve with an adequate trial of conservative care.",
    ],
  },
  {
    condition: "Management of Osteoarthritis of the Knee (Non-Arthroplasty), 3rd Edition",
    org: "AAOS",
    year: 2021,
    region: "Knee",
    url: "https://www.aaos.org/globalassets/quality-and-practice-resources/osteoarthritis-of-the-knee/oak3cpg.pdf",
    recommendations: [
      "Recommend exercise — aerobic, strengthening, neuromuscular, or aquatic — as first-line management regardless of OA severity.",
      "Support weight loss alongside exercise for patients who are overweight or obese, to reduce joint load and symptoms.",
      "Avoid recommending glucosamine and/or chondroitin, given a lack of clinically important benefit.",
      "Consider NSAIDs for short-term symptom relief, weighing cardiovascular and gastrointestinal risk.",
      "Reserve arthroscopic debridement/lavage for a clear mechanical block; do not use it for OA symptoms alone.",
    ],
  },
  {
    condition: "Management of Distal Radius Fractures",
    org: "AAOS",
    year: 2020,
    region: "Elbow & Hand",
    url: "https://www.aaos.org/globalassets/quality-and-practice-resources/distal-radius/drfcpg.pdf",
    recommendations: [
      "Base treatment choice (cast immobilization vs. surgical fixation) on fracture displacement and stability, not age alone.",
      "Begin early active motion of uninvolved joints (fingers, elbow, shoulder) during the immobilization period to limit stiffness.",
      "Progress wrist range of motion and strengthening once fracture stability allows, guided by the treating surgeon's timeline.",
      "Address grip and fine motor function specifically, since these commonly lag behind wrist range of motion.",
      "Monitor for complications — median nerve symptoms, complex regional pain syndrome — throughout rehabilitation.",
    ],
  },
  {
    condition: "Management of Rotator Cuff Injuries",
    org: "AAOS",
    year: 2025,
    region: "Shoulder",
    url: "https://www.aaos.org/rccpg2025",
    recommendations: [
      "Trial a structured physical therapy program before proceeding to surgery for most atraumatic rotator cuff tears.",
      "Use progressive strengthening of the rotator cuff and scapular stabilizers rather than immobilization for nonoperative management.",
      "Reserve surgical referral for full-thickness tears with persistent function-limiting symptoms after an adequate nonoperative trial, or acute traumatic tears in active patients.",
      "Address posterior capsule tightness and scapular mechanics, not just the cuff itself, given their contribution to impingement-type symptoms.",
      "Individualize postoperative rehabilitation timelines to the specific repair performed, in coordination with the surgeon.",
    ],
  },
  {
    condition: "Management of Anterior Cruciate Ligament Injuries, 2nd Edition",
    org: "AAOS",
    year: 2022,
    region: "Knee",
    url: "https://www.aaos.org/quality/quality-programs/anterior-cruciate-ligament-injuries/",
    recommendations: [
      "Offer preoperative (\"prehab\") physical therapy to reduce swelling and restore motion and quadriceps activation before reconstruction.",
      "Use criteria-based, not purely time-based, progression through postoperative rehabilitation phases.",
      "Incorporate neuromuscular training addressing landing mechanics and dynamic knee control before return to cutting/pivoting sport.",
      "Require objective strength and hop-test symmetry benchmarks, alongside psychological readiness, before clearing return to sport.",
      "Consider structured nonoperative rehabilitation for select patients, particularly those with lower activity demands.",
    ],
  },
  {
    condition: "Low Back Pain and Sciatica in Over 16s: Assessment and Management (NG59)",
    org: "NICE",
    year: 2026,
    region: "Spine",
    url: "https://www.nice.org.uk/guidance/ng59",
    recommendations: [
      "Offer self-management advice and encourage continuation of normal activity as first-line care for low back pain and sciatica.",
      "Consider a group exercise program, tailored to the person's needs and preferences, as first-line treatment.",
      "Avoid routine imaging in a non-specialist setting unless the result is likely to change management.",
      "Use manual therapy only as part of a treatment package that includes exercise, with or without psychological therapy — not as a stand-alone treatment.",
      "Reserve spinal injections and surgery for specific indications, such as radiculopathy not responding to conservative care, rather than first-line treatment.",
    ],
  },
  {
    condition: "Osteoarthritis in Over 16s: Diagnosis and Management (NG226)",
    org: "NICE",
    year: 2022,
    region: "Knee",
    url: "https://www.nice.org.uk/guidance/ng226",
    recommendations: [
      "Offer therapeutic exercise — local muscle strengthening and general aerobic fitness — as a core treatment regardless of pain severity, disability, or comorbidity.",
      "Support weight management as part of the overall plan for people who are overweight, alongside exercise.",
      "Avoid glucosamine, chondroitin, or acupuncture, given a lack of clinically meaningful benefit.",
      "Consider topical or oral NSAIDs for pain relief alongside, not instead of, exercise.",
      "Refer for consideration of joint replacement when non-surgical management is no longer effective and symptoms substantially affect quality of life.",
    ],
  },
  {
    condition: "Rheumatoid Arthritis in Adults: Management (NG100)",
    org: "NICE",
    year: 2020,
    region: "Rheumatology",
    url: "https://www.nice.org.uk/guidance/ng100",
    recommendations: [
      "Offer a physical activity program alongside pharmacological disease management, rather than treating exercise as optional.",
      "Refer for physiotherapy for advice on exercise and splinting to manage specific joint problems.",
      "Coordinate care within a multidisciplinary team, since disease-modifying drug management drives much of the overall treatment plan.",
      "Refer to occupational therapy when hand or upper-limb function is affected, to address functional and occupational impact.",
      "Reassess and adjust the rehabilitation plan as flares and remission periods change functional status.",
    ],
  },
  {
    condition: "Interventions for Breast Cancer–Related Lymphedema",
    org: "APTA",
    year: 2020,
    region: "Oncology",
    url: "https://academic.oup.com/ptj/article/100/7/1163/5862539",
    recommendations: [
      "Use complete decongestive therapy — manual lymphatic drainage, compression bandaging, exercise, and skin care — as the core intervention.",
      "Fit and progress compression garments as maintenance therapy following the intensive decongestive phase.",
      "Prescribe progressive resistance exercise; current evidence supports it over the older advice to restrict exercise for fear of exacerbating lymphedema.",
      "Screen for lymphedema early in survivorship, since early intervention outperforms treating established disease.",
      "Educate patients on skin care and infection precautions to reduce cellulitis risk in the affected limb.",
    ],
  },
  {
    condition: "Role of Physical Therapists in the Management of Individuals at Risk for or Diagnosed With Venous Thromboembolism",
    org: "APTA",
    year: 2022,
    region: "Cardiopulmonary",
    url: "https://doi.org/10.1093/ptj/pzac057",
    recommendations: [
      "Screen for VTE risk factors — immobility, recent surgery, malignancy, prior VTE — before initiating mobilization in at-risk patients.",
      "Avoid withholding mobilization solely based on a VTE diagnosis once appropriate anticoagulation has been initiated.",
      "Coordinate closely with the medical team regarding anticoagulation status before progressing activity level.",
      "Monitor for signs of pulmonary embolism — sudden dyspnea, chest pain, hypoxia — during mobilization in at-risk patients.",
      "Use a consistent clinical risk-assessment tool rather than relying on clinical judgment alone.",
    ],
  },
  {
    condition: "A Core Set of Outcome Measures to Assess Physical Function for Hospitalized Adults",
    org: "APTA",
    year: 2025,
    region: "Acute Care",
    url: "https://academic.oup.com/ptj/article/105/6/pzaf076/8140951",
    recommendations: [
      "Use a standardized core set of outcome measures for hospitalized adults rather than ad hoc, facility-specific tools.",
      "Select measures that are feasible within the time constraints of acute-care practice without sacrificing measurement quality.",
      "Track physical function longitudinally across the hospital stay to support discharge-planning decisions.",
      "Use the same core measures across settings where possible to support continuity of care into post-acute rehabilitation.",
      "Pair functional outcome measures with clinical judgment, not as a replacement for it, when determining discharge readiness.",
    ],
  },
  {
    condition: "Hamstring Strain Injury in Athletes",
    org: "APTA",
    year: 2022,
    region: "Hip",
    url: "https://www.jospt.org/doi/10.2519/jospt.2022.0301",
    recommendations: [
      "Classify injury type and severity using history, examination, and imaging when available, since prognosis and timeline differ by pattern.",
      "Use progressive agility and trunk-stabilization exercise alongside eccentric strengthening rather than rest-based management alone.",
      "Base return-to-sport decisions on functional and strength criteria — isokinetic or field-based hop/sprint testing — not fixed timelines.",
      "Address hip extensor strength deficits specifically, since persistent weakness is linked to reinjury risk.",
      "Progressively introduce sport-specific high-speed running before full return to competition, given reinjury is common in the first weeks back.",
    ],
  },
  {
    condition: "Distal Radius Fracture Rehabilitation",
    org: "APTA",
    year: 2024,
    region: "Elbow & Hand",
    url: "https://www.jospt.org/doi/10.2519/jospt.2024.0301",
    recommendations: [
      "Begin early active motion of the digits, elbow, and shoulder during the immobilization period to prevent stiffness.",
      "Progress wrist mobility and strengthening once cleared by the treating surgeon, guided by fixation type.",
      "Address grip strength and fine motor tasks specifically, since these often recover more slowly than wrist range of motion.",
      "Use edema-management strategies — elevation, compression, active motion — throughout early rehabilitation.",
      "Screen for median nerve symptoms and complex regional pain syndrome across the episode of care.",
    ],
  },
  {
    condition: "International Framework for Examination of the Cervical Region for Potential Vascular Pathologies",
    org: "IFOMPT",
    year: 2022,
    region: "Spine",
    url: "https://www.jospt.org/doi/10.2519/jospt.2022.11147",
    docType: "Framework",
    recommendations: [
      "Screen for cervical arterial dysfunction risk factors and red flags before cervical manipulation or sustained end-range positioning.",
      "Use a structured framework rather than a single special test, since no individual pre-manipulative test reliably rules out vascular pathology.",
      "Weigh patient history — recent trauma, connective tissue disorders, cardiovascular risk factors — more heavily than physical tests alone.",
      "Defer or modify manual therapy and refer for medical evaluation when red flags for vascular pathology are present.",
      "Reassess risk at each visit rather than only at initial evaluation, since risk factors can change over an episode of care.",
    ],
  },
  {
    condition: "Consensus Statement on Concussion in Sport (Amsterdam, 6th International Conference)",
    org: "Concussion in Sport Group",
    year: 2023,
    region: "Neurological",
    url: "https://doi.org/10.1136/bjsports-2023-106898",
    docType: "Consensus Statement",
    recommendations: [
      "Use the SCAT6 (Sport Concussion Assessment Tool) for same-day sideline assessment rather than a symptom checklist alone.",
      "Apply a graduated, stepwise return-to-sport progression, individualized to symptom response rather than a fixed number of days.",
      "Avoid strict prolonged rest beyond an initial short period (24-48 hours); early, symptom-limited activity is now favored over extended rest.",
      "Screen for and address mental health and persisting-symptom risk factors, since a subset of patients has a protracted recovery.",
      "Coordinate return-to-learn and return-to-sport decisions with the broader care team — physician, athletic trainer, school — rather than in isolation.",
    ],
  },
  {
    condition: "Doha Agreement Meeting on Terminology and Definitions in Groin Pain in Athletes",
    org: "International Expert Panel",
    year: 2015,
    region: "Hip",
    url: "https://doi.org/10.1136/bjsports-2015-094869",
    docType: "Consensus Statement",
    recommendations: [
      "Use the standardized Doha classification — adductor-, iliopsoas-, inguinal-, pubic-, or hip-related groin pain — to communicate diagnosis clearly.",
      "Recognize that multiple concurrent categories are common; avoid forcing a single diagnosis.",
      "Use this shared terminology to compare and interpret research and clinical findings consistently across clinicians.",
      "Pair the classification with a thorough clinical exam, since the framework standardizes terminology rather than replacing exam findings.",
      "Consider that hip joint pathology, such as femoroacetabular impingement, can coexist with and mimic other groin pain sources, warranting a broad differential.",
    ],
  },
];

function GuidelineCard({ g }: { g: Guideline }) {
  const docType = g.docType ?? "CPG";
  return (
    <div className="card elev-sm">
      {/* flexWrap lets the tag drop onto its own line instead of overflowing: some of these
          labels are long ("Concussion in Sport Group Consensus Statement"), and with a
          no-shrink tag on one line the card ran past the right edge of a phone — where nothing
          scrolls sideways, so the label was cut off — while squeezing the title beside it down
          to roughly one word per line. Wide screens are unchanged: the tag still sits right. */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div className="pro-calc-title" style={{ minWidth: 0 }}>{g.condition}</div>
        <span className={`tag ${docType === "CPG" ? "tag-evidence-cpg" : "tag-evidence-review"}`} style={{ flexShrink: 0 }}>
          {g.org} {docType}
        </span>
      </div>
      <p className="pro-calc-meta" style={{ margin: "2px 0 8px" }}>
        {g.org} &middot; {g.year}
      </p>
      <ul style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 10px", paddingLeft: 18 }}>
        {g.recommendations.map((r) => (
          <li key={r} style={{ marginBottom: 4 }}>
            {r}
          </li>
        ))}
      </ul>
      <a
        href={g.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        View Full Guideline
        <ExternalLinkIcon size={13} />
      </a>
    </div>
  );
}

export function GuidelinesLibrary() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const filtered = region === "All" ? GUIDELINES : GUIDELINES.filter((g) => g.region === region);

  return (
    <>
      <div className="pro-filter-bar">
        {REGIONS.map((r) => (
          <button key={r} type="button" className={`pro-filter-chip${region === r ? " active" : ""}`} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="pro-grid-2">
        {filtered.map((g) => (
          <GuidelineCard g={g} key={g.condition} />
        ))}
      </div>
    </>
  );
}
