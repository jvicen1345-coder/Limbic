/**
 * Region tags for /pro/special-tests (components/pro/SpecialTestsLibrary.tsx), powering its
 * `?region=` filter (see Limbic Atlas's "Explore Further" Special Tests card). Kept as a
 * separate static mapping rather than a `bodyRegion` field on each TESTS entry, since two
 * entries there legitimately share the exact same test name in different regions (e.g.
 * "Valgus Stress Test" appears once under Elbow/Wrist for the UCL and again under Knee for
 * the MCL, and "FABER"/"FADIR" are each listed once under Lumbar and again under Hip) — a
 * name-only key would collide, so entries here are keyed by `${test.name}|${test.region}`.
 *
 * Values are real Limbic Atlas zone ids (see lib/atlas-regions.ts), expanded from the broad
 * regions in lib/atlas-connections.ts, never invented ids. A test with no clear single-zone
 * match (the qualitative neurological signs — Babinski, Hoffman, Clonus, Romberg,
 * finger-to-nose — which aren't tied to one body region) is simply absent here; the
 * region-filtered view just won't surface it, same as any other untagged test.
 */

import { BROAD_REGION_ZONES, type BroadRegion } from "@/lib/atlas-connections";

function zonesFor(...broadRegions: BroadRegion[]): string[] {
  return broadRegions.flatMap((b) => BROAD_REGION_ZONES[b]);
}

export const SPECIAL_TEST_REGION_MAP: Record<string, string[]> = {
  // Cervical
  "Spurling Test|Cervical": zonesFor("head-neck"),
  "Distraction Test|Cervical": zonesFor("head-neck"),
  "Upper Limb Tension Test|Cervical": zonesFor("head-neck", "arm-elbow"),
  "Vertebral Artery Test|Cervical": zonesFor("head-neck"),
  "Sharp-Purser Test|Cervical": zonesFor("head-neck"),

  // Shoulder
  "Hawkins-Kennedy Test|Shoulder": zonesFor("shoulder-chest"),
  "Neer Sign|Shoulder": zonesFor("shoulder-chest"),
  "Empty Can Test|Shoulder": zonesFor("shoulder-chest"),
  "Drop Arm Test|Shoulder": zonesFor("shoulder-chest"),
  "Speed Test|Shoulder": zonesFor("shoulder-chest"),
  "O'Brien Test|Shoulder": zonesFor("shoulder-chest"),
  "Apprehension Test|Shoulder": zonesFor("shoulder-chest"),
  "Load and Shift Test|Shoulder": zonesFor("shoulder-chest"),
  "Sulcus Sign|Shoulder": zonesFor("shoulder-chest"),

  // Elbow/Wrist
  "Cozen Test|Elbow/Wrist": zonesFor("arm-elbow"),
  "Mill Test|Elbow/Wrist": zonesFor("arm-elbow"),
  "Valgus Stress Test|Elbow/Wrist": zonesFor("arm-elbow"),
  "Phalen Test|Elbow/Wrist": zonesFor("forearm-wrist"),
  "Tinel Sign at wrist|Elbow/Wrist": zonesFor("forearm-wrist"),
  "Finkelstein Test|Elbow/Wrist": zonesFor("forearm-wrist"),

  // Lumbar
  "Straight Leg Raise|Lumbar": zonesFor("lower-leg-ankle", "hip-thigh"),
  "Slump Test|Lumbar": zonesFor("lower-leg-ankle", "hip-thigh"),
  "FABER Test|Lumbar": zonesFor("hip-thigh"),
  "FADIR Test|Lumbar": zonesFor("hip-thigh"),
  "Spring Test|Lumbar": zonesFor("core-abdomen"),
  "Prone Instability Test|Lumbar": zonesFor("core-abdomen"),

  // Hip
  "FABER|Hip": zonesFor("hip-thigh"),
  "FADIR|Hip": zonesFor("hip-thigh"),
  "Trendelenburg Test|Hip": zonesFor("hip-thigh"),
  "Thomas Test|Hip": zonesFor("hip-thigh"),
  "Ober Test|Hip": zonesFor("hip-thigh"),

  // Knee
  "Lachman Test|Knee": zonesFor("knee"),
  "Anterior Drawer|Knee": zonesFor("knee"),
  "Valgus Stress Test|Knee": zonesFor("knee"),
  "Varus Stress Test|Knee": zonesFor("knee"),
  "McMurray Test|Knee": zonesFor("knee"),
  "Thessaly Test|Knee": zonesFor("knee"),
  "Patellar Grind Test|Knee": zonesFor("knee"),
  "Posterior Drawer|Knee": zonesFor("knee"),

  // Ankle/Foot
  "Anterior Drawer, Ankle|Ankle/Foot": zonesFor("lower-leg-ankle"),
  "Talar Tilt Test|Ankle/Foot": zonesFor("lower-leg-ankle"),
  "Thompson Test|Ankle/Foot": zonesFor("lower-leg-ankle"),
  "Ottawa Ankle Rules|Ankle/Foot": zonesFor("lower-leg-ankle"),
  "Squeeze Test|Ankle/Foot": zonesFor("lower-leg-ankle"),
};

export function bodyRegionsForTest(name: string, region: string): string[] {
  return SPECIAL_TEST_REGION_MAP[`${name}|${region}`] ?? [];
}
