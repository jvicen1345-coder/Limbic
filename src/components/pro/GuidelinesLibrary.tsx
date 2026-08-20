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
}

const REGIONS = ["All", "Spine", "Shoulder", "Hip", "Knee", "Ankle", "Neurological", "Cardiopulmonary", "Pediatrics", "Geriatrics"] as const;

// Real, verifiable clinical practice guidelines with their actual DOIs. A few conditions
// from the original list didn't correspond to a real, verifiable citation as originally
// dated/titled, so they were corrected against the actual published guideline:
//  - Shoulder: the real ICF-linked JOSPT guideline is the 2013 Adhesive Capsulitis CPG,
//    not a 2022 document (2022 JOSPT vol 52 is a differently-titled Rotator Cuff Disorders
//    CPG from a different guideline series).
//  - Stroke: the real JNPT CPG is the 2020 Locomotor Function guideline, not 2022.
//  - Fall prevention: the current APTA Geriatrics CPG is the 2025 update; no 2021 version exists.
//  - COPD: no 2019 APTA-authored CPG exists; the real, current pulmonary rehab CPG is
//    ATS-authored (2023), which APTA's CPG+ library formally lists.
//  - Bell's Palsy: no PT-specific (APTA) clinical practice guideline exists for this
//    condition, so it was replaced with the real APTA Neurologic PT vestibular hypofunction
//    CPG, a genuine guideline covering the same Neurological region.
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
    condition: "Hip Pain and Mobility Deficits",
    org: "APTA",
    year: 2017,
    region: "Hip",
    url: "https://www.jospt.org/doi/10.2519/jospt.2017.0301",
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
    condition: "Achilles Pain and Mobility Deficits",
    org: "APTA",
    year: 2018,
    region: "Ankle",
    url: "https://www.jospt.org/doi/10.2519/jospt.2018.0302",
    recommendations: [
      "Classify presentation as midportion versus insertional Achilles tendinopathy, since management differs, particularly around dorsiflexion range for insertional cases.",
      "Use progressive loading exercise, including eccentric or heavy slow-resistance protocols, as the primary intervention.",
      "Consider orthotic devices or heel lifts as an adjunct to reduce tendon load in select patients, particularly early in care or with insertional involvement.",
      "Use manual therapy adjunctively rather than as a stand-alone intervention; evidence for it alone is limited.",
      "Educate patients on the typically prolonged recovery timeline for tendinopathy and the importance of adherence to progressive loading.",
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
    condition: "Plantar Fasciitis",
    org: "APTA",
    year: 2014,
    region: "Ankle",
    url: "https://www.jospt.org/doi/10.2519/jospt.2014.0303",
    recommendations: [
      "Combine manual therapy, joint and soft tissue mobilization, with a stretching program, particularly for short-term pain relief.",
      "Prescribe plantar fascia-specific and gastrocnemius/soleus stretching as first-line self-management.",
      "Use foot orthoses, prefabricated or custom, for short- to mid-term pain and function improvement.",
      "Consider night splints for patients with symptoms lasting longer than 6 months.",
      "Use taping for short-term (up to 3 weeks) pain relief while other interventions take effect.",
    ],
  },
];

function GuidelineCard({ g }: { g: Guideline }) {
  return (
    <div className="card elev-sm">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div className="pro-calc-title">{g.condition}</div>
        <span className="tag tag-evidence-cpg">{g.org} CPG</span>
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
