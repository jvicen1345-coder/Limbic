/** Left-panel region navigation groups for Limbic Atlas (see components/atlas/AtlasClient.tsx)
 *  — one group per anatomical cluster, each listing the zone ids (matching
 *  lib/atlas-content.ts's ATLAS_CONTENT keys and components/atlas/AtlasBodyMap.tsx's zone
 *  data) that belong to it. Two lists because the group breakdown differs front vs back
 *  (e.g. anterior splits "Arm and Elbow" from "Forearm and Wrist"; posterior folds triceps,
 *  posterior elbow, and posterior forearm into one "Posterior Arm" group instead). */

export interface AtlasRegionGroup {
  label: string;
  zones: string[];
}

export const ANTERIOR_GROUPS: AtlasRegionGroup[] = [
  { label: "Head and Neck", zones: ["cervical-anterior"] },
  { label: "Shoulder and Chest", zones: ["shoulder-anterior", "sternum-chest"] },
  { label: "Arm and Elbow", zones: ["biceps-anterior", "elbow-anterior"] },
  { label: "Forearm and Wrist", zones: ["forearm-anterior", "wrist-hand"] },
  { label: "Core and Abdomen", zones: ["abdominals"] },
  { label: "Hip and Thigh", zones: ["hip-flexors", "quadriceps"] },
  { label: "Knee", zones: ["knee-anterior"] },
  { label: "Lower Leg and Ankle", zones: ["anterior-leg", "ankle-foot-anterior"] },
];

export const POSTERIOR_GROUPS: AtlasRegionGroup[] = [
  { label: "Cervical and Upper Trap", zones: ["cervical-posterior", "upper-trapezius"] },
  { label: "Thoracic Spine", zones: ["thoracic-spine"] },
  { label: "Posterior Shoulder", zones: ["rotator-cuff-posterior"] },
  { label: "Posterior Arm", zones: ["triceps-posterior", "elbow-posterior", "forearm-posterior"] },
  { label: "Lumbar Spine", zones: ["lumbar-spine"] },
  { label: "Gluteal Region", zones: ["gluteus-maximus", "gluteus-medius"] },
  { label: "Hamstrings", zones: ["hamstrings"] },
  { label: "Posterior Knee", zones: ["knee-posterior"] },
  { label: "Calf and Achilles", zones: ["calf-gastrocnemius", "achilles-posterior-ankle"] },
];
