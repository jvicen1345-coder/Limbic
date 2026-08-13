/**
 * Limbic Student Specialty Tracks — static scaffolding for the six specialty hubs under
 * /student/specialties. Every string here is placeholder/launch content (see the TODO
 * comments in the page/template components that render it) except the condition names,
 * NPTE system names, and NPTE exam weights, which are real (the weights mirror
 * components/BoardsTabs.tsx's own NPTE_SYSTEMS so the two never disagree).
 */

export type SpecialtySlug = "musculoskeletal" | "neurological" | "cardiopulmonary" | "pediatrics" | "geriatrics" | "sports";

export interface SpecialtyCondition {
  name: string;
  /** Acute / Chronic / Post-surgical, etc — a short category tag shown on the condition card. */
  category: string;
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
  conditions: SpecialtyCondition[];
  npte: NpteConnection;
}

export const SPECIALTIES: Specialty[] = [
  {
    slug: "musculoskeletal",
    name: "Musculoskeletal",
    color: "var(--color-accent)",
    description: "Orthopedic conditions, manual therapy, joint pathology, post-surgical rehab, and outcome measures.",
    conditions: [
      { name: "Rotator Cuff Pathology", category: "Chronic" },
      { name: "ACL Reconstruction", category: "Post-surgical" },
      { name: "Total Knee Arthroplasty", category: "Post-surgical" },
      { name: "Lumbar Disc Herniation", category: "Acute" },
      { name: "Lateral Epicondylalgia", category: "Chronic" },
      { name: "Shoulder Impingement Syndrome", category: "Chronic" },
    ],
    npte: { system: "Musculoskeletal", weight: "~24%" },
  },
  {
    slug: "neurological",
    name: "Neurological",
    color: "#7c3aed",
    description: "Stroke, TBI, SCI, Parkinson's, MS, gait analysis, and neuro-rehabilitation interventions.",
    conditions: [
      { name: "Ischemic Stroke", category: "Acute" },
      { name: "Traumatic Brain Injury", category: "Acute" },
      { name: "Spinal Cord Injury", category: "Acute" },
      { name: "Parkinson's Disease", category: "Chronic" },
      { name: "Multiple Sclerosis", category: "Chronic" },
      { name: "Guillain-Barré Syndrome", category: "Acute" },
    ],
    npte: { system: "Neuromuscular and Nervous System", weight: "~20%" },
  },
  {
    slug: "cardiopulmonary",
    name: "Cardiopulmonary",
    color: "#dc2626",
    description: "Cardiac and pulmonary conditions, lab values, vitals interpretation, ICU PT, and aerobic prescription.",
    conditions: [
      { name: "Congestive Heart Failure", category: "Chronic" },
      { name: "Chronic Obstructive Pulmonary Disease", category: "Chronic" },
      { name: "Post-Cardiac Surgery Rehab", category: "Post-surgical" },
      { name: "Pulmonary Embolism", category: "Acute" },
      { name: "Pneumonia", category: "Acute" },
      { name: "Cardiac Rehabilitation", category: "Chronic" },
    ],
    npte: { system: "Cardiopulmonary", weight: "~16%" },
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    color: "#16a34a",
    description: "Developmental milestones, pediatric conditions, school-based PT, and family education.",
    conditions: [
      { name: "Cerebral Palsy", category: "Chronic" },
      { name: "Down Syndrome", category: "Chronic" },
      { name: "Developmental Delay", category: "Chronic" },
      { name: "Torticollis", category: "Chronic" },
      { name: "Juvenile Idiopathic Arthritis", category: "Chronic" },
      { name: "Autism Spectrum Disorder", category: "Chronic" },
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
    description: "Falls, balance disorders, aging physiology, dementia, and aging-in-place safety.",
    conditions: [
      { name: "Falls and Balance Disorders", category: "Chronic" },
      { name: "Hip Fracture and Arthroplasty", category: "Post-surgical" },
      { name: "Dementia and Cognitive Decline", category: "Chronic" },
      { name: "Frailty and Deconditioning", category: "Chronic" },
      { name: "Osteoporosis", category: "Chronic" },
      { name: "Parkinson's Disease in Older Adults", category: "Chronic" },
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
    description: "Common sports injuries, return to sport protocols, and sport-specific rehabilitation across six sports.",
    conditions: [
      { name: "ACL Tear and Reconstruction", category: "Post-surgical" },
      { name: "Rotator Cuff Tear", category: "Acute" },
      { name: "Ankle Sprain, Lateral", category: "Acute" },
      { name: "Concussion and Return to Play", category: "Acute" },
      { name: "Stress Fractures", category: "Chronic" },
      { name: "Patellar Tendinopathy", category: "Chronic" },
    ],
    npte: {
      system: "Musculoskeletal",
      weight: "~24%",
      note: "Sports content isn't its own NPTE system, it's tested mostly within Musculoskeletal, with some Cardiopulmonary and Neuromuscular overlap.",
    },
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
      { name: "Concussion", category: "Acute" },
      { name: "ACL Tear", category: "Acute" },
      { name: "Shoulder Instability", category: "Chronic" },
      { name: "Cervical Spine Injury", category: "Acute" },
    ],
  },
  {
    slug: "baseball",
    name: "Baseball",
    injuries: ["UCL tear", "rotator cuff", "medial epicondylitis", "SLAP tear"],
    focus: "Throwing mechanics, overhead athlete rehabilitation.",
    conditions: [
      { name: "UCL Tear", category: "Acute" },
      { name: "Rotator Cuff Injury", category: "Chronic" },
      { name: "Medial Epicondylitis", category: "Chronic" },
      { name: "SLAP Tear", category: "Chronic" },
    ],
  },
  {
    slug: "soccer",
    name: "Soccer",
    injuries: ["ACL tear", "ankle sprain", "hamstring strain", "concussion"],
    focus: "Lower extremity biomechanics, heading-related concussion.",
    conditions: [
      { name: "ACL Tear", category: "Acute" },
      { name: "Ankle Sprain", category: "Acute" },
      { name: "Hamstring Strain", category: "Acute" },
      { name: "Concussion", category: "Acute" },
    ],
  },
  {
    slug: "basketball",
    name: "Basketball",
    injuries: ["Ankle sprain", "patellar tendinopathy", "achilles", "finger injuries"],
    focus: "Jump landing mechanics, quick direction change rehabilitation.",
    conditions: [
      { name: "Ankle Sprain", category: "Acute" },
      { name: "Patellar Tendinopathy", category: "Chronic" },
      { name: "Achilles Injury", category: "Chronic" },
      { name: "Finger Injury", category: "Acute" },
    ],
  },
  {
    slug: "hockey",
    name: "Hockey",
    injuries: ["Hip flexor strain", "groin injury", "shoulder separation", "knee ligament"],
    focus: "Skating mechanics, contact injury management, hip rehabilitation.",
    conditions: [
      { name: "Hip Flexor Strain", category: "Acute" },
      { name: "Groin Injury", category: "Acute" },
      { name: "Shoulder Separation", category: "Acute" },
      { name: "Knee Ligament Injury", category: "Acute" },
    ],
  },
];

export function getSport(slug: string): Sport | undefined {
  return SPORTS.find((s) => s.slug === slug);
}
