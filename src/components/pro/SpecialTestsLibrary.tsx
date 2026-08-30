"use client";

import { useState } from "react";
import { ChevronRightIcon, FilmIcon, XIcon, ExternalLinkIcon } from "@/components/icons";
import { getSpecialTestVideoAction } from "@/app/actions/special-tests";
import type { SpecialTestVideo } from "@/lib/special-test-videos";
import { bodyRegionsForTest } from "@/lib/atlas-special-test-regions";
import { ATLAS_CONTENT } from "@/lib/atlas-content";
import { matchesSearch, searchTerms } from "@/lib/reference-search";

interface SpecialTest {
  name: string;
  region: string;
  assesses: string;
  howTo: string;
  positiveFinding: string;
  sensitivity: string;
  specificity: string;
  clinicalNote: string;
}

const REGIONS = ["All", "Cervical", "Shoulder", "Elbow/Wrist", "Lumbar", "Hip", "Knee", "Ankle/Foot", "Neurological"] as const;

// Sensitivity/specificity values are drawn from the commonly-cited orthopedic special test
// literature (Cook & Hegedus, systematic reviews per test) where a test has actually been
// studied against a reference standard (MRI/arthroscopy/imaging). Where a test is a
// qualitative neurological sign (Babinski, Hoffman, clonus, Romberg, finger-to-nose) or
// simply hasn't been validated against a diagnostic reference standard in the literature,
// that's stated plainly rather than inventing a number — same "don't fabricate clinical
// statistics" standard the rest of this app holds to.
const TESTS: SpecialTest[] = [
  {
    name: "Spurling Test",
    region: "Cervical",
    assesses: "Cervical radiculopathy/nerve root compression",
    howTo:
      "Patient extends, laterally flexes, and rotates the head toward the symptomatic side while the examiner applies gentle downward axial compression through the top of the head.",
    positiveFinding: "Reproduction of radicular pain or paresthesia into the ipsilateral upper extremity.",
    sensitivity: "~50% (30-60% across studies)",
    specificity: "~85-95%",
    clinicalNote:
      "Low sensitivity but high specificity, better at helping confirm than rule out cervical radiculopathy. Part of Wainner's 4-test cluster alongside distraction, ULTT, and cervical rotation <60°.",
  },
  {
    name: "Distraction Test",
    region: "Cervical",
    assesses: "Cervical radiculopathy relief with distraction",
    howTo: "Examiner cups the chin and occiput and applies gentle upward axial distraction with the patient seated.",
    positiveFinding: "Reduction or relief of radicular arm symptoms during distraction.",
    sensitivity: "~44%",
    specificity: "~90%",
    clinicalNote: "Best used as part of Wainner's cluster with Spurling, ULTT, and cervical rotation, 3 of 4 positive substantially raises post-test probability of radiculopathy.",
  },
  {
    name: "Upper Limb Tension Test",
    region: "Cervical",
    assesses: "Cervical/upper extremity neural tension",
    howTo:
      "Patient supine; examiner sequentially adds shoulder depression/abduction, forearm supination, and wrist/finger extension, then elbow extension, adding contralateral cervical lateral flexion to sensitize.",
    positiveFinding: "Reproduction of familiar symptoms, >10° side-to-side elbow extension asymmetry, or symptom change with contralateral neck side-bending.",
    sensitivity: "~72-97%",
    specificity: "~33-45%",
    clinicalNote: "High sensitivity makes a negative ULTT useful for helping rule out cervical radiculopathy. Part of Wainner's cluster.",
  },
  {
    name: "Vertebral Artery Test",
    region: "Cervical",
    assesses: "Vertebrobasilar insufficiency",
    howTo: "Passive cervical extension combined with rotation, sustained ~10-30 seconds per side, monitoring for symptoms throughout.",
    positiveFinding: "Dizziness, nystagmus, diplopia, dysarthria, drop attacks, or other signs of vertebrobasilar ischemia during or after the position.",
    sensitivity: "Poor, not well established",
    specificity: "Poor, not well established",
    clinicalNote:
      "The literature widely questions this test's diagnostic accuracy. A thorough cervical arterial dysfunction screen (history plus cranial nerve exam) matters more than the test itself, treat any positive response as a reason to stop and refer.",
  },
  {
    name: "Sharp-Purser Test",
    region: "Cervical",
    assesses: "Atlantoaxial instability",
    howTo: "Patient seated with the neck slightly flexed; examiner stabilizes the C2 spinous process with one hand while applying a posterior glide to the forehead with the other.",
    positiveFinding: "A palpable or visible posterior shift/\"clunk\" of the head relative to the axis, with symptom reduction, indicating excessive anterior C1-on-C2 translation.",
    sensitivity: "~69%",
    specificity: "~96%",
    clinicalNote: "A positive test signals possible upper cervical instability (e.g., rheumatoid arthritis, Down syndrome), avoid aggressive manual techniques and refer for imaging if positive.",
  },

  {
    name: "Hawkins-Kennedy Test",
    region: "Shoulder",
    assesses: "Subacromial impingement",
    howTo: "Shoulder passively flexed to 90° with the elbow flexed 90°, then the examiner internally rotates the humerus.",
    positiveFinding: "Pain in the anterior/lateral shoulder.",
    sensitivity: "~79%",
    specificity: "~59%",
    clinicalNote: "Most sensitive of the classic impingement tests. Combine with Neer and Empty Can, no single test reliably differentiates impingement from rotator cuff tear.",
  },
  {
    name: "Neer Sign",
    region: "Shoulder",
    assesses: "Subacromial impingement",
    howTo: "Examiner stabilizes the scapula and passively raises the arm into full forward flexion with the humerus internally rotated.",
    positiveFinding: "Pain, typically at 70-120° of elevation.",
    sensitivity: "~72%",
    specificity: "~60%",
    clinicalNote: "Similar diagnostic accuracy to Hawkins-Kennedy. Positive Neer plus positive Hawkins-Kennedy plus a painful arc raises suspicion for impingement.",
  },
  {
    name: "Empty Can Test",
    region: "Shoulder",
    assesses: "Supraspinatus pathology",
    howTo: "Arm elevated to 90° in the scapular plane and internally rotated (thumb pointing down), examiner applies downward resistance.",
    positiveFinding: "Pain and/or weakness compared to the uninvolved side.",
    sensitivity: "~69%",
    specificity: "~66%",
    clinicalNote: "The Full Can Test (externally rotated) has comparable sensitivity with less pain provocation, may be preferred in more irritable presentations.",
  },
  {
    name: "Drop Arm Test",
    region: "Shoulder",
    assesses: "Rotator cuff tear",
    howTo: "Examiner passively abducts the arm to 90°; patient is asked to slowly lower the arm to the side.",
    positiveFinding: "Inability to control the descent, the arm drops suddenly, or significant pain, most specific for a full-thickness supraspinatus tear.",
    sensitivity: "~35%",
    specificity: "~88%",
    clinicalNote: "Low sensitivity means a negative test doesn't rule out a cuff tear, but a positive result is fairly specific for a large or full-thickness tear.",
  },
  {
    name: "Speed Test",
    region: "Shoulder",
    assesses: "Biceps tendon pathology",
    howTo: "Shoulder flexed to ~90°, elbow extended, forearm supinated; examiner resists further shoulder flexion.",
    positiveFinding: "Pain localized to the bicipital groove.",
    sensitivity: "~32-90% (widely variable)",
    specificity: "~55-75%",
    clinicalNote: "Poor diagnostic accuracy in isolation. Often positive with concurrent labral pathology, interpret alongside other shoulder tests rather than standalone.",
  },
  {
    name: "O'Brien Test",
    region: "Shoulder",
    assesses: "Labral tear/SLAP lesion",
    howTo:
      "Arm at 90° flexion, 10-15° adduction, internally rotated (thumb down); examiner applies downward resistance, then repeats with the arm externally rotated (palm up).",
    positiveFinding: "Pain or clicking in the thumb-down position that improves or resolves palm-up. Pain localized to the AC joint instead suggests AC pathology.",
    sensitivity: "~67-100%",
    specificity: "~19-68%",
    clinicalNote: "High sensitivity but poor specificity. Useful as a screen for labral pathology but frequently positive with AC joint pathology too, correlate with AC tenderness/imaging.",
  },
  {
    name: "Apprehension Test",
    region: "Shoulder",
    assesses: "Anterior shoulder instability",
    howTo: "Patient supine, shoulder abducted to 90° and progressively externally rotated by the examiner.",
    positiveFinding: "Patient expresses apprehension or a feeling the shoulder is about to dislocate, distinct from pain alone.",
    sensitivity: "~53-72%",
    specificity: "~85-96%",
    clinicalNote: "Apprehension, not just pain, is the key positive finding. Combine with the relocation test for improved accuracy for anterior instability.",
  },
  {
    name: "Load and Shift Test",
    region: "Shoulder",
    assesses: "Glenohumeral translation/instability",
    howTo:
      "Patient seated or supine; examiner grasps the proximal humerus and applies an anterior and posterior directed force while stabilizing the scapula, grading translation.",
    positiveFinding: "Excessive anterior or posterior humeral head translation compared to the contralateral side, graded I-III.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Primarily used to grade the direction/degree of instability rather than as a binary diagnostic test. Compare bilaterally, baseline laxity varies widely between individuals.",
  },
  {
    name: "Sulcus Sign",
    region: "Shoulder",
    assesses: "Inferior shoulder instability",
    howTo: "Patient's arm relaxed at the side; examiner applies a downward (inferior) traction force at the elbow or wrist.",
    positiveFinding: "A visible sulcus/dimple below the acromion, graded by the gap in centimeters (Grade I <1cm, II 1-2cm, III >2cm).",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Used primarily to identify multidirectional instability. A sulcus that persists with the arm in external rotation suggests rotator interval laxity, a hallmark of MDI.",
  },

  {
    name: "Cozen Test",
    region: "Elbow/Wrist",
    assesses: "Lateral epicondylalgia",
    howTo: "Elbow in slight flexion, forearm pronated, wrist in radial deviation and extension; examiner resists wrist extension while palpating the lateral epicondyle.",
    positiveFinding: "Pain at the lateral epicondyle.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Widely used clinically. Combine with Mill's test and resisted middle finger extension, no single test is diagnostic alone for lateral epicondylalgia.",
  },
  {
    name: "Mill Test",
    region: "Elbow/Wrist",
    assesses: "Lateral epicondylalgia",
    howTo: "Elbow extended, forearm pronated, wrist flexed; examiner passively extends the elbow further while maintaining wrist flexion and pronation.",
    positiveFinding: "Pain at the lateral epicondyle with the stretch.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "A passive stretch-based counterpart to Cozen's resisted test, use both together for a fuller clinical picture.",
  },
  {
    name: "Valgus Stress Test",
    region: "Elbow/Wrist",
    assesses: "Elbow UCL integrity",
    howTo: "Elbow flexed to ~20-30° to unlock the olecranon; examiner applies a valgus (medial-opening) force while stabilizing the humerus.",
    positiveFinding: "Excessive medial joint line gapping and/or reproduction of medial elbow pain compared to the uninvolved side.",
    sensitivity: "~66%",
    specificity: "Not well established",
    clinicalNote:
      "Commonly used in overhead throwing athletes to screen for UCL insufficiency. The moving valgus stress test adds dynamic elbow flexion/extension to better reproduce late-cocking/acceleration symptoms.",
  },
  {
    name: "Phalen Test",
    region: "Elbow/Wrist",
    assesses: "Carpal tunnel syndrome",
    howTo: "Patient holds both wrists in maximal flexion, backs of the hands together, for up to 60 seconds.",
    positiveFinding: "Reproduction of numbness/tingling in the median nerve distribution (thumb, index, middle, and radial half of ring finger).",
    sensitivity: "~68%",
    specificity: "~73%",
    clinicalNote: "Comparable accuracy to Tinel's sign. Combining a positive Phalen, positive Tinel, and hand symptom diagram meaningfully raises diagnostic confidence.",
  },
  {
    name: "Tinel Sign at wrist",
    region: "Elbow/Wrist",
    assesses: "Median nerve irritability",
    howTo: "Examiner lightly taps over the median nerve at the volar wrist crease (carpal tunnel).",
    positiveFinding: "Tingling/paresthesia radiating into the median nerve distribution of the hand.",
    sensitivity: "~50%",
    specificity: "~77%",
    clinicalNote: "Only moderate accuracy alone, most useful combined with Phalen's test and a positive hand symptom diagram.",
  },
  {
    name: "Finkelstein Test",
    region: "Elbow/Wrist",
    assesses: "De Quervain tenosynovitis",
    howTo: "Patient makes a fist with the thumb tucked inside the fingers; examiner passively deviates the wrist toward the ulnar side.",
    positiveFinding: "Sharp pain over the radial styloid/first dorsal compartment.",
    sensitivity: "~81-100%",
    specificity: "~50-80%",
    clinicalNote: "A modified version (active thumb extension against resistance, the Eichhoff maneuver) may reduce the false positives seen with the classic passive version.",
  },

  {
    name: "Straight Leg Raise",
    region: "Lumbar",
    assesses: "Lumbar nerve root tension/disc pathology",
    howTo: "Patient supine; examiner passively raises the symptomatic leg with the knee extended.",
    positiveFinding: "Reproduction of radicular leg pain (not just back or hamstring tightness) between roughly 30-70° of hip flexion.",
    sensitivity: "~91-92%",
    specificity: "~26-28%",
    clinicalNote: "Excellent for helping rule out lumbar disc herniation/nerve root involvement when negative, given its high sensitivity, but a positive result alone doesn't confirm the diagnosis.",
  },
  {
    name: "Slump Test",
    region: "Lumbar",
    assesses: "Neural tension, lumbar/sciatic",
    howTo: "Patient seated, slumps the thoracolumbar spine, flexes the cervical spine, then the examiner sequentially adds knee extension and ankle dorsiflexion.",
    positiveFinding: "Reproduction of familiar radicular symptoms that change with cervical extension (releasing the slump), suggesting a neural rather than purely musculoskeletal source.",
    sensitivity: "~84%",
    specificity: "~83%",
    clinicalNote: "Structural differentiation, symptom change with cervical position, is what confirms a neural source rather than a hamstring or joint limitation.",
  },
  {
    name: "FABER Test",
    region: "Lumbar",
    assesses: "Hip, SI joint, or lumbar pathology",
    howTo:
      "Patient supine, test leg positioned into Flexion, ABduction, and External Rotation, ankle resting on the opposite knee; examiner applies gentle downward overpressure at the knee and stabilizes the opposite ASIS.",
    positiveFinding: "Reproduction of groin pain (suggests hip pathology) or posterior/SI region pain (suggests SI joint involvement).",
    sensitivity: "~57-89% for SI joint pain",
    specificity: "~18-100% for SI joint pain",
    clinicalNote: "Location of reproduced pain matters more than a simple positive/negative. Best interpreted as part of a cluster of SI provocation tests, not alone.",
  },
  {
    name: "FADIR Test",
    region: "Lumbar",
    assesses: "Hip impingement/intra-articular pathology",
    howTo: "Hip passively flexed to 90°, then adducted and internally rotated.",
    positiveFinding: "Reproduction of anterior groin/hip pain, suggests femoroacetabular impingement or intra-articular hip pathology.",
    sensitivity: "~94-99%",
    specificity: "~5-27%",
    clinicalNote: "Excellent for ruling out intra-articular hip pathology when negative, but a positive result is common and nonspecific, needs imaging and clinical correlation to confirm FAI.",
  },
  {
    name: "Spring Test",
    region: "Lumbar",
    assesses: "Segmental hypomobility",
    howTo: "Patient prone; examiner applies graded posterior-to-anterior (PA) pressure through the spinous process at each lumbar segment.",
    positiveFinding: "Reproduction of pain or notably reduced/increased segmental movement compared to adjacent levels.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Manual segmental mobility testing has documented inter-rater reliability limitations. Best used to help direct manual therapy technique/level selection alongside symptom response, not as a standalone diagnostic test.",
  },
  {
    name: "Prone Instability Test",
    region: "Lumbar",
    assesses: "Lumbar segmental instability",
    howTo:
      "Patient prone with legs off the table, feet on the floor; examiner applies PA pressure to the symptomatic segment first with feet on the floor, then again with the patient lifting the legs off the floor (actively stabilizing the trunk).",
    positiveFinding: "Pain present with feet on the floor that resolves or significantly decreases when the trunk is actively stabilized (legs lifted).",
    sensitivity: "~72%",
    specificity: "~58%",
    clinicalNote: "One component of Hicks' clinical prediction rule for patients likely to benefit from lumbar stabilization exercise, most useful as part of that cluster.",
  },

  {
    name: "FABER",
    region: "Hip",
    assesses: "Hip, SI joint, or lumbar pathology",
    howTo:
      "Patient supine, test leg positioned into Flexion, ABduction, and External Rotation, ankle resting on the opposite knee; examiner applies gentle downward overpressure at the knee and stabilizes the opposite ASIS.",
    positiveFinding: "Reproduction of groin pain (suggests hip pathology) or posterior/SI region pain (suggests SI joint involvement).",
    sensitivity: "~57-89% for SI joint pain",
    specificity: "~18-100% for SI joint pain",
    clinicalNote: "Location of reproduced pain matters more than a simple positive/negative. Best interpreted as part of a cluster of SI provocation tests, not alone.",
  },
  {
    name: "FADIR",
    region: "Hip",
    assesses: "Hip impingement/intra-articular pathology",
    howTo: "Hip passively flexed to 90°, then adducted and internally rotated.",
    positiveFinding: "Reproduction of anterior groin/hip pain, suggests femoroacetabular impingement or intra-articular hip pathology.",
    sensitivity: "~94-99%",
    specificity: "~5-27%",
    clinicalNote: "Excellent for ruling out intra-articular hip pathology when negative, but a positive result is common and nonspecific, needs imaging and clinical correlation to confirm FAI.",
  },
  {
    name: "Trendelenburg Test",
    region: "Hip",
    assesses: "Hip abductor weakness",
    howTo: "Patient stands on one leg; examiner observes the contralateral pelvis from behind.",
    positiveFinding: "The contralateral (unsupported side) pelvis drops, indicating weakness of the stance-leg hip abductors (gluteus medius/minimus).",
    sensitivity: "~73%",
    specificity: "~77%",
    clinicalNote: "A \"compensated\" Trendelenburg, trunk leaning over the stance leg to offload the abductors, is a related but distinct finding worth documenting separately.",
  },
  {
    name: "Thomas Test",
    region: "Hip",
    assesses: "Hip flexor tightness",
    howTo: "Patient supine at the edge of the table; one knee pulled to the chest to flatten the lumbar spine while the test leg hangs off the table.",
    positiveFinding:
      "The test leg fails to lie flat/level with the table (hip remains flexed) or the knee doesn't reach ~90° flexion, indicating tightness of the iliopsoas, rectus femoris, or TFL/IT band depending on the compensation pattern.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Watch the compensation pattern closely, hip flexion alone suggests iliopsoas tightness, knee extension suggests rectus femoris, hip abduction suggests TFL/IT band tightness.",
  },
  {
    name: "Ober Test",
    region: "Hip",
    assesses: "IT band/TFL tightness",
    howTo:
      "Patient side-lying with the test leg up; examiner abducts and extends the hip with the knee flexed to 90° (or extended for the modified version), then allows the leg to passively adduct toward the table.",
    positiveFinding: "The leg remains abducted/fails to drop to the table (or below horizontal), indicating IT band or TFL tightness.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Stabilize the pelvis firmly, pelvic rotation is a common source of false-negative results.",
  },

  {
    name: "Lachman Test",
    region: "Knee",
    assesses: "ACL integrity",
    howTo: "Knee flexed to ~20-30°; examiner stabilizes the femur with one hand and applies an anterior-directed force to the proximal tibia with the other.",
    positiveFinding: "Increased anterior tibial translation compared to the uninvolved side, without a firm/crisp end-feel (a \"soft\" or \"mushy\" end point).",
    sensitivity: "~85%",
    specificity: "~94%",
    clinicalNote: "The single most accurate clinical test for ACL integrity, and the most sensitive of the anterior instability tests.",
  },
  {
    name: "Anterior Drawer",
    region: "Knee",
    assesses: "ACL integrity",
    howTo: "Knee flexed to 90°, foot stabilized; examiner applies an anterior-directed pull to the proximal tibia.",
    positiveFinding: "Excessive anterior tibial translation compared to the uninvolved side.",
    sensitivity: "~62%",
    specificity: "~88%",
    clinicalNote:
      "Less sensitive than Lachman, since 90° of flexion tightens secondary restraints (hamstrings, posterior capsule) that can mask anterior laxity, prefer Lachman when acute swelling/guarding allows.",
  },
  {
    name: "Valgus Stress Test",
    region: "Knee",
    assesses: "MCL integrity",
    howTo: "Knee tested near full extension and again at ~20-30° flexion; examiner applies a valgus (medial-opening) force at the ankle while stabilizing the femur.",
    positiveFinding: "Excessive medial joint line gapping and/or pain, particularly at 20-30° flexion (isolating the MCL from the posterior capsule/cruciates).",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Laxity present in both full extension AND 20-30° flexion suggests a more significant injury involving secondary stabilizers, not an isolated MCL sprain.",
  },
  {
    name: "Varus Stress Test",
    region: "Knee",
    assesses: "LCL integrity",
    howTo: "Knee tested near full extension and again at ~20-30° flexion; examiner applies a varus (lateral-opening) force at the ankle while stabilizing the femur.",
    positiveFinding: "Excessive lateral joint line gapping and/or pain, particularly at 20-30° flexion.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "LCL injuries are less common than MCL injuries and often occur alongside posterolateral corner or cruciate injury, evaluate the whole posterolateral corner if positive.",
  },
  {
    name: "McMurray Test",
    region: "Knee",
    assesses: "Meniscal tear",
    howTo: "Knee fully flexed; examiner applies varus/internal rotation (lateral meniscus) or valgus/external rotation (medial meniscus) while slowly extending the knee.",
    positiveFinding: "A palpable or audible click/pop with reproduction of pain along the joint line.",
    sensitivity: "~53%",
    specificity: "~77%",
    clinicalNote: "Higher specificity than sensitivity, a positive test is meaningful but a negative test doesn't rule out a meniscal tear, combine with joint line tenderness and Thessaly.",
  },
  {
    name: "Thessaly Test",
    region: "Knee",
    assesses: "Meniscal tear",
    howTo:
      "Patient stands on the test leg with the knee slightly flexed (~5° and ~20°), holding the examiner's hands for balance, then rotates the body/knee internally and externally three times at each angle.",
    positiveFinding: "Joint line pain, locking, or catching.",
    sensitivity: "~66%",
    specificity: "~79%",
    clinicalNote: "A weight-bearing, dynamic alternative to McMurray, may better reproduce the loading conditions that provoke meniscal symptoms during gait.",
  },
  {
    name: "Patellar Grind Test",
    region: "Knee",
    assesses: "Patellofemoral pathology",
    howTo: "Examiner applies gentle posterior/inferior pressure on the superior pole of the patella while the patient actively contracts the quadriceps.",
    positiveFinding: "Pain and/or crepitus under the patella during the contraction.",
    sensitivity: "Poor, not well supported",
    specificity: "Poor, not well supported",
    clinicalNote: "Frequently positive in asymptomatic knees too. Use as one supportive finding within a broader patellofemoral evaluation (alignment, strength, movement quality), not a standalone diagnostic test.",
  },
  {
    name: "Posterior Drawer",
    region: "Knee",
    assesses: "PCL integrity",
    howTo: "Knee flexed to 90°, foot stabilized; examiner applies a posterior-directed push to the proximal tibia.",
    positiveFinding: "Excessive posterior tibial translation compared to the uninvolved side. Watch for a posterior tibial \"sag\" at baseline before starting, a false-positive trap.",
    sensitivity: "~90%",
    specificity: "~99%",
    clinicalNote: "The most accurate of the common knee ligament tests. Always check for posterior sag first, a sagging tibia can make the starting position look abnormal and skew the result.",
  },

  {
    name: "Anterior Drawer, Ankle",
    region: "Ankle/Foot",
    assesses: "ATFL integrity",
    howTo: "Ankle in slight plantarflexion; examiner stabilizes the distal tibia with one hand and applies an anterior-directed pull to the calcaneus/hindfoot with the other.",
    positiveFinding: "Excessive anterior talar translation compared to the uninvolved side, and/or a palpable \"clunk.\"",
    sensitivity: "~58-96%",
    specificity: "~50-84%",
    clinicalNote: "Accuracy improves notably when performed several days after injury rather than acutely, since acute swelling/guarding can mask laxity.",
  },
  {
    name: "Talar Tilt Test",
    region: "Ankle/Foot",
    assesses: "CFL integrity",
    howTo: "Ankle in neutral; examiner stabilizes the distal tibia and applies an inversion force to the calcaneus/hindfoot.",
    positiveFinding: "Excessive talar inversion/tilt compared to the uninvolved side.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Often assessed alongside the anterior drawer test as part of a full lateral ankle ligament exam.",
  },
  {
    name: "Thompson Test",
    region: "Ankle/Foot",
    assesses: "Achilles tendon rupture",
    howTo: "Patient prone with the foot hanging off the table; examiner squeezes the calf muscle belly.",
    positiveFinding: "Absent plantarflexion of the foot in response to the squeeze, indicates a complete Achilles tendon rupture.",
    sensitivity: "~96%",
    specificity: "~93%",
    clinicalNote: "Highly accurate and quick to perform. A strongly positive finding in a patient with a suspected acute rupture warrants urgent orthopedic referral.",
  },
  {
    name: "Ottawa Ankle Rules",
    region: "Ankle/Foot",
    assesses: "Ankle/foot fracture screening",
    howTo:
      "Clinical decision rule: X-ray indicated if there is pain in the malleolar zone AND bony tenderness at the posterior edge/tip of either malleolus, OR inability to bear weight for 4 steps both immediately after injury and at the time of examination (a parallel rule applies to the midfoot zone).",
    positiveFinding: "Meeting any of the above criteria.",
    sensitivity: "~97-100%",
    specificity: "~30-50%",
    clinicalNote: "Designed to rule out fracture and reduce unnecessary imaging. Intentionally low specificity, a negative result reliably excludes a clinically significant fracture.",
  },
  {
    name: "Squeeze Test",
    region: "Ankle/Foot",
    assesses: "Syndesmosis injury",
    howTo: "Examiner squeezes the tibia and fibula together at mid-calf, well above the site of injury.",
    positiveFinding: "Pain distally at the syndesmosis (distal tibiofibular joint).",
    sensitivity: "~30%",
    specificity: "~85-94%",
    clinicalNote: "Low sensitivity means a negative test doesn't rule out a high ankle sprain, combine with the external rotation stress test and a careful mechanism-of-injury history.",
  },

  {
    name: "Babinski Sign",
    region: "Neurological",
    assesses: "Upper motor neuron lesion",
    howTo: "Examiner strokes the lateral plantar surface of the foot from the heel toward the ball, curving medially across the metatarsal heads.",
    positiveFinding: "Extension (dorsiflexion) of the great toe with fanning of the other toes, rather than the normal flexion (curling) response.",
    sensitivity: "Not applicable, qualitative sign",
    specificity: "Not applicable, qualitative sign",
    clinicalNote: "Normal up to about 12-24 months of age due to incomplete corticospinal myelination. A positive Babinski beyond that age indicates upper motor neuron pathology and warrants further workup.",
  },
  {
    name: "Hoffman Sign",
    region: "Neurological",
    assesses: "Upper motor neuron lesion",
    howTo: "Examiner flicks/flexes the distal phalanx of the middle finger and releases it quickly.",
    positiveFinding: "Reflexive flexion and adduction of the thumb and/or index finger.",
    sensitivity: "Not applicable, qualitative sign",
    specificity: "Not applicable, qualitative sign",
    clinicalNote: "The upper extremity analog to Babinski's sign. Useful as one piece of evidence for cervical myelopathy or another UMN lesion, interpret alongside gait, reflexes, and the full neuro exam.",
  },
  {
    name: "Clonus Test",
    region: "Neurological",
    assesses: "Upper motor neuron lesion",
    howTo: "Examiner briskly dorsiflexes the ankle and holds sustained pressure.",
    positiveFinding: "Rhythmic, involuntary beating/oscillation of the foot between dorsiflexion and plantarflexion, often documented as number of beats or \"sustained.\"",
    sensitivity: "Not applicable, qualitative sign",
    specificity: "Not applicable, qualitative sign",
    clinicalNote: "Sustained clonus (versus a few unsustained beats, a normal variant) is the more clinically significant finding for upper motor neuron involvement.",
  },
  {
    name: "Romberg Test",
    region: "Neurological",
    assesses: "Proprioceptive/vestibular balance deficit",
    howTo: "Patient stands with feet together, arms at sides, eyes open, then eyes closed, for up to 30 seconds each.",
    positiveFinding:
      "A significant increase in postural sway or loss of balance with eyes closed compared to eyes open, indicating heavy reliance on vision to compensate for a proprioceptive or vestibular deficit.",
    sensitivity: "Not well established",
    specificity: "Not well established",
    clinicalNote: "Localizes the problem to the proprioceptive or vestibular system, not the cerebellum, since cerebellar ataxia is typically present even with eyes open. Stand close and be ready to guard.",
  },
  {
    name: "Finger to Nose",
    region: "Neurological",
    assesses: "Cerebellar coordination",
    howTo: "Patient alternately touches their own nose and the examiner's outstretched finger as quickly and accurately as possible; the examiner's finger can be moved to assess accuracy at different distances/directions.",
    positiveFinding: "Dysmetria (overshoot or undershoot), intention tremor that worsens as the finger approaches the target, or noticeable incoordination.",
    sensitivity: "Not applicable, qualitative sign",
    specificity: "Not applicable, qualitative sign",
    clinicalNote: "Compare both sides, unilateral dysmetria points toward an ipsilateral cerebellar lesion, since cerebellar pathways are uncrossed.",
  },
];

type VideoLoadState = "idle" | "loading" | "loaded" | "not-found";

/** Video Demonstration section of a test card — deliberately not prefetched for all 50
 *  tests on page load, only searched on request (see getSpecialTestVideoAction), so a
 *  reader skimming the library doesn't burn through YouTube's free search quota for tests
 *  they never open. A real search result, not a hardcoded video id — see
 *  lib/special-test-videos.ts for why. */
function VideoDemonstration({ test }: { test: SpecialTest }) {
  const [state, setState] = useState<VideoLoadState>("idle");
  const [video, setVideo] = useState<SpecialTestVideo | null>(null);

  const handleLoad = async () => {
    setState("loading");
    const result = await getSpecialTestVideoAction(test.name, test.region);
    // Whether YOUTUBE_API_KEY isn't configured or a search simply found nothing embeddable,
    // both land here as the same plain "not available" message — neither is something a
    // reader can act on differently (see findSpecialTestVideo for the server-side log that
    // distinguishes the two for a dev).
    if (!result) {
      setState("not-found");
      return;
    }
    setVideo(result);
    setState("loaded");
  };

  if (state === "idle") {
    return (
      <button type="button" className="btn btn-secondary" style={{ marginTop: 6 }} onClick={handleLoad}>
        <FilmIcon size={14} />
        Show video demonstration
      </button>
    );
  }

  if (state === "loading") {
    return <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 6 }}>Searching for a demonstration video…</p>;
  }

  if (state === "not-found") {
    return (
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: 6 }}>
        No demonstration video available for {test.name} right now.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <a
        href={`https://www.youtube.com/watch?v=${video!.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "transparent",
          border: "1px solid var(--color-divider)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text)",
          fontSize: 13,
          textDecoration: "none",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        Watch demonstration on YouTube
        <ExternalLinkIcon size={13} />
      </a>
      <p style={{ fontSize: 11, color: "var(--color-neutral-700)", margin: "6px 0 0" }}>
        {video!.title} — {video!.channelTitle}
      </p>
    </div>
  );
}

function TestCard({ test, open }: { test: SpecialTest; open?: boolean }) {
  return (
    <details className="card elev-sm" open={open}>
      <summary className="pro-accordion-summary">
        <div>
          <div>{test.name}</div>
          <div className="pro-accordion-summary-sub">
            <span className="tag tag-accent" style={{ marginRight: 6 }}>
              {test.region}
            </span>
            {test.assesses}
          </div>
        </div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        <div style={{ fontSize: 12.5, display: "flex", flexDirection: "column", gap: 4 }}>
          <div>
            <strong>How to perform:</strong> {test.howTo}
          </div>
          <div>
            <strong>Positive finding:</strong> {test.positiveFinding}
          </div>
          <div>
            <strong>Sensitivity:</strong> {test.sensitivity}
          </div>
          <div>
            <strong>Specificity:</strong> {test.specificity}
          </div>
          <div>
            <strong>Clinical note:</strong> {test.clinicalNote}
          </div>
        </div>
        <VideoDemonstration test={test} />
      </div>
    </details>
  );
}

function testMatches(terms: string[], test: SpecialTest): boolean {
  return matchesSearch(terms, test.name, test.region, test.assesses, test.howTo, test.positiveFinding, test.clinicalNote);
}

/** Match count for this tab's label in the Clinical Reference search — see
 *  countLabValueMatches in LabValuesReference.tsx for the shape and why. Counted across the
 *  whole library, ignoring this component's own region chips/Atlas filter. */
export function countSpecialTestMatches(query: string): number {
  const terms = searchTerms(query);
  return TESTS.filter((t) => testMatches(terms, t)).length;
}

export function SpecialTestsLibrary({ initialRegionId = null, query = "" }: { initialRegionId?: string | null; query?: string }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [atlasRegionId, setAtlasRegionId] = useState<string | null>(initialRegionId);

  const terms = searchTerms(query);
  const searched = TESTS.filter((t) => testMatches(terms, t));
  const chipFiltered = region === "All" ? searched : searched.filter((t) => t.region === region);
  const atlasRegionName = atlasRegionId ? ATLAS_CONTENT[atlasRegionId]?.name ?? atlasRegionId : null;
  const regionTagged = atlasRegionId ? chipFiltered.filter((t) => bodyRegionsForTest(t.name, t.region).includes(atlasRegionId)) : chipFiltered;
  const noTaggedMatches = atlasRegionId !== null && regionTagged.length === 0;
  const filtered = noTaggedMatches ? chipFiltered : regionTagged;

  return (
    <>
      {atlasRegionId && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span className="tag tag-accent" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Filtered by: {atlasRegionName}
            <button
              type="button"
              onClick={() => setAtlasRegionId(null)}
              aria-label="Clear region filter"
              style={{ display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit" }}
            >
              <XIcon size={12} />
            </button>
          </span>
        </div>
      )}
      {noTaggedMatches && (
        <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: "0 0 10px" }}>
          No tests tagged for this region yet — showing all special tests.
        </p>
      )}
      <div className="pro-filter-bar">
        {REGIONS.map((r) => (
          <button key={r} type="button" className={`pro-filter-chip${region === r ? " active" : ""}`} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
      </div>
      <div className="pro-accordion">
        {filtered.map((test, i) => (
          // A search narrow enough to leave a handful of tests standing opens them, so the
          // reader lands on the technique instead of a list they still have to click.
          <TestCard test={test} open={terms.length > 0 && filtered.length <= 3} key={`${test.region}-${test.name}-${i}`} />
        ))}
      </div>
      {filtered.length === 0 && <p className="clinref-empty">No special tests match this search.</p>}
    </>
  );
}
