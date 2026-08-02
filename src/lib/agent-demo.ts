import type { AgentNode, AgentLink } from "@/lib/agent-graph";

/**
 * Limbic Agent's Phase 1 launch content: "Demo only" (see the Pro page's roadmap table).
 * Hand-written, not AI-generated at request time — real PT clinical reasoning, the same
 * accuracy bar as lib/board-content.ts, curated to show off what the live version will do
 * once it's funded and enabled. Every question in demo mode reveals this same web (see
 * AGENT_DEMO_MODE in AgentClient.tsx); nothing here is a live model response.
 */

const centerId = "demo-center";

export const AGENT_DEMO_NODES: AgentNode[] = [
  {
    id: centerId,
    parentId: null,
    ring: 0,
    label: "Anterior Knee Pain, Runner",
    detail: "24-year-old recreational runner, insidious anterior knee pain over the last 3 weeks after increasing weekly mileage.",
    expandable: false,
  },

  // Ring 1
  { id: "demo-r1-subjective", parentId: centerId, ring: 1, label: "Subjective Findings", detail: "History and reported symptom pattern.", expandable: true },
  { id: "demo-r1-objective", parentId: centerId, ring: 1, label: "Objective Tests", detail: "Special tests and functional measures.", expandable: true },
  { id: "demo-r1-differentials", parentId: centerId, ring: 1, label: "Differential Considerations", detail: "Conditions this pattern could represent.", expandable: true },
  { id: "demo-r1-redflags", parentId: centerId, ring: 1, label: "Red Flags & Precautions", detail: "Findings that would change the plan.", expandable: true },

  // Ring 2 — under Subjective Findings
  {
    id: "demo-r2-stairs",
    parentId: "demo-r1-subjective",
    ring: 2,
    label: "Pain with stairs/squatting",
    detail: "Anterior knee pain aggravated by loaded knee flexion — stairs, squatting, prolonged sitting (\"theater sign\") — is a classic pattern for patellofemoral pain, since these positions increase patellofemoral joint reaction force.",
    expandable: false,
  },
  {
    id: "demo-r2-onset",
    parentId: "demo-r1-subjective",
    ring: 2,
    label: "Insidious onset, mileage spike",
    detail: "A gradual onset tied to a training-load increase is a hallmark of an overuse pattern, distinguishing it from a traumatic ligamentous or meniscal injury with a clear mechanism of injury.",
    expandable: false,
  },
  {
    id: "demo-r2-location",
    parentId: "demo-r1-subjective",
    ring: 2,
    label: "Anterior/peripatellar location",
    detail: "Pain localized around or behind the patella, rather than at a focal joint line, points toward a patellofemoral or extensor-mechanism source rather than meniscal or collateral ligament pathology.",
    expandable: false,
  },

  // Ring 2 — under Objective Tests
  {
    id: "demo-r2-tilt",
    parentId: "demo-r1-objective",
    ring: 2,
    label: "Patellar Tilt/Glide Test",
    detail: "Assesses lateral retinacular tightness and patellar tracking — excessive lateral glide or a positive tilt suggests lateral tracking is contributing to the pain.",
    expandable: true,
  },
  {
    id: "demo-r2-stepdown",
    parentId: "demo-r1-objective",
    ring: 2,
    label: "Single-Leg Squat / Step-Down",
    detail: "A loaded, functional test that reveals dynamic knee valgus and hip control deficits — both consistently associated with patellofemoral pain in runners.",
    expandable: true,
  },
  {
    id: "demo-r2-mcmurray",
    parentId: "demo-r1-objective",
    ring: 2,
    label: "McMurray Test",
    detail: "Performed to help rule out a meniscal component when the history doesn't clearly localize to the joint line — a negative result supports an extensor-mechanism source over a meniscal one.",
    expandable: false,
  },

  // Ring 2 — under Differential Considerations
  {
    id: "demo-r2-pfps",
    parentId: "demo-r1-differentials",
    ring: 2,
    label: "Patellofemoral Pain Syndrome",
    detail: "The most common cause of anterior knee pain in runners — driven by patellofemoral joint overload, often from hip/quad strength deficits or a training error like this one.",
    expandable: true,
  },
  {
    id: "demo-r2-tendinopathy",
    parentId: "demo-r1-differentials",
    ring: 2,
    label: "Patellar Tendinopathy",
    detail: "Pain more focally at the inferior pole of the patella, worse with jumping or eccentric loading — distinguished by focal tendon tenderness rather than diffuse peripatellar pain.",
    expandable: false,
  },
  {
    id: "demo-r2-itb",
    parentId: "demo-r1-differentials",
    ring: 2,
    label: "Iliotibial Band Syndrome",
    detail: "Typically lateral rather than anterior knee pain, but worth screening given the training-load spike — distinguished by lateral epicondyle tenderness and a positive Ober's test.",
    expandable: false,
  },

  // Ring 2 — under Red Flags
  {
    id: "demo-r2-effusion",
    parentId: "demo-r1-redflags",
    ring: 2,
    label: "Effusion or Locking",
    detail: "A true joint effusion or mechanical locking/catching suggests an intra-articular source (meniscal tear, loose body) rather than patellofemoral pain, and warrants further workup before a rehab-only plan.",
    expandable: false,
  },
  {
    id: "demo-r2-systemic",
    parentId: "demo-r1-redflags",
    ring: 2,
    label: "Night Pain or Systemic Symptoms",
    detail: "Pain that wakes the patient at night unrelated to activity, or that comes with fever or weight loss, is outside the typical mechanical pattern and warrants screening for a non-musculoskeletal cause.",
    expandable: false,
  },

  // Ring 3 — evidence, under a couple of ring-2 nodes
  {
    id: "demo-r3-hip-strength",
    parentId: "demo-r2-pfps",
    ring: 3,
    label: "Hip Strengthening Evidence",
    detail: "Multiple systematic reviews support combined hip-and-knee strengthening over knee-only protocols for reducing patellofemoral pain and improving function.",
    expandable: false,
  },
  {
    id: "demo-r3-load",
    parentId: "demo-r2-pfps",
    ring: 3,
    label: "Training Load Modification",
    detail: "Addressing the mileage/intensity spike that provoked symptoms is considered essential alongside strengthening, not an optional add-on.",
    expandable: false,
  },
  {
    id: "demo-r3-movement-quality",
    parentId: "demo-r2-stepdown",
    ring: 3,
    label: "Movement Quality Over Pain Alone",
    detail: "Current evidence emphasizes assessing movement quality (hip drop, knee valgus) during these tests, not just pain reproduction — altered mechanics often persist after pain itself resolves.",
    expandable: false,
  },
  {
    id: "demo-r3-tilt-relevance",
    parentId: "demo-r2-tilt",
    ring: 3,
    label: "Guides Manual Therapy, Not Diagnosis Alone",
    detail: "A positive tilt/glide finding helps target manual therapy and taping decisions, but isn't diagnostic in isolation — it's interpreted alongside the full subjective and objective picture.",
    expandable: false,
  },
];

/** One deliberate cross-branch connection to demonstrate the feature: ruling out a
 *  meniscal cause (McMurray, under Objective Tests) is directly relevant to the
 *  intra-articular red flag it would help rule out. */
export const AGENT_DEMO_CROSS_LINKS: AgentLink[] = [
  { source: "demo-r2-mcmurray", target: "demo-r2-effusion", kind: "cross" },
];
