import "server-only";
import { prisma } from "@/lib/db";

/** Published handheld-dynamometer normative values, all in lbs, one row per
 *  muscleGroup/side/age-decade/sex bucket — source cited per entry. Seeded into the
 *  ForceLabNorm table (see seedForceLabNorms below) rather than queried from this array
 *  directly, so getNormativeData's DB query stays the single lookup path regardless of
 *  where the reference data ultimately lives.
 */
export const forceLabNormData = [
  // Hip Flexion — Seated
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 79.2, sdLbs: 14.3, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 55.1, sdLbs: 11.2, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 76.8, sdLbs: 13.9, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 53.4, sdLbs: 10.8, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 74.1, sdLbs: 13.2, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 51.8, sdLbs: 10.4, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 69.3, sdLbs: 12.8, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 48.2, sdLbs: 9.9, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 62.4, sdLbs: 11.9, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 43.6, sdLbs: 9.2, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 70, ageMax: 79, sex: "male", meanLbs: 54.8, sdLbs: 11.2, source: "Bohannon 2012" },
  { muscleGroup: "Hip Flexion — Seated", bodyRegion: "Hip", side: "bilateral", ageMin: 70, ageMax: 79, sex: "female", meanLbs: 38.9, sdLbs: 8.6, source: "Bohannon 2012" },

  // Hip Abduction — Sidelying
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 62.1, sdLbs: 12.4, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 44.3, sdLbs: 9.8, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 60.4, sdLbs: 12.1, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 42.8, sdLbs: 9.4, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 57.9, sdLbs: 11.6, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 41.2, sdLbs: 9.1, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 54.3, sdLbs: 11.2, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 38.6, sdLbs: 8.7, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 49.8, sdLbs: 10.4, source: "Kelln et al 2008" },
  { muscleGroup: "Hip Abduction — Sidelying", bodyRegion: "Hip", side: "bilateral", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 35.2, sdLbs: 8.1, source: "Kelln et al 2008" },

  // Knee Extension — Seated
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 104.3, sdLbs: 18.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 68.2, sdLbs: 13.4, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 101.8, sdLbs: 18.1, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 66.4, sdLbs: 13.1, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 97.2, sdLbs: 17.4, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 63.8, sdLbs: 12.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 91.4, sdLbs: 16.8, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 59.6, sdLbs: 12.1, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 82.6, sdLbs: 15.9, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 53.4, sdLbs: 11.2, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 70, ageMax: 79, sex: "male", meanLbs: 71.8, sdLbs: 14.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Extension — Seated", bodyRegion: "Knee", side: "bilateral", ageMin: 70, ageMax: 79, sex: "female", meanLbs: 46.9, sdLbs: 10.4, source: "Mentiplay et al 2015" },

  // Knee Flexion — Prone
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 72.4, sdLbs: 13.8, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 48.6, sdLbs: 10.2, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 70.1, sdLbs: 13.4, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 47.2, sdLbs: 9.9, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 67.3, sdLbs: 12.9, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 45.4, sdLbs: 9.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 63.2, sdLbs: 12.3, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 42.8, sdLbs: 9.2, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 57.4, sdLbs: 11.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Knee Flexion — Prone", bodyRegion: "Knee", side: "bilateral", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 38.6, sdLbs: 8.7, source: "Mentiplay et al 2015" },

  // Grip Strength
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 121.3, sdLbs: 19.8, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 70.8, sdLbs: 13.2, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 110.6, sdLbs: 18.4, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 64.2, sdLbs: 12.1, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 126.8, sdLbs: 20.4, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 73.4, sdLbs: 13.8, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 115.2, sdLbs: 19.1, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 66.8, sdLbs: 12.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 122.4, sdLbs: 19.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 71.2, sdLbs: 13.4, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 111.8, sdLbs: 18.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 64.6, sdLbs: 12.2, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 113.6, sdLbs: 18.8, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 65.8, sdLbs: 12.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 103.4, sdLbs: 17.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 59.8, sdLbs: 11.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 99.8, sdLbs: 17.2, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 58.4, sdLbs: 11.4, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 91.2, sdLbs: 16.4, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 53.2, sdLbs: 10.8, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 70, ageMax: 79, sex: "male", meanLbs: 84.6, sdLbs: 15.6, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "right", ageMin: 70, ageMax: 79, sex: "female", meanLbs: 49.8, sdLbs: 10.2, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 70, ageMax: 79, sex: "male", meanLbs: 77.4, sdLbs: 14.8, source: "Mathiowetz et al 1985" },
  { muscleGroup: "Grip Strength", bodyRegion: "Grip", side: "left", ageMin: 70, ageMax: 79, sex: "female", meanLbs: 45.2, sdLbs: 9.6, source: "Mathiowetz et al 1985" },

  // Shoulder External Rotation
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 38.4, sdLbs: 7.8, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 24.6, sdLbs: 5.4, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 37.2, sdLbs: 7.6, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 23.8, sdLbs: 5.2, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 35.8, sdLbs: 7.3, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 22.9, sdLbs: 5.1, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 33.6, sdLbs: 6.9, source: "Andrews et al 1996" },
  { muscleGroup: "Shoulder External Rotation", bodyRegion: "Shoulder", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 21.4, sdLbs: 4.8, source: "Andrews et al 1996" },

  // Ankle Dorsiflexion
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 20, ageMax: 29, sex: "male", meanLbs: 42.8, sdLbs: 8.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 20, ageMax: 29, sex: "female", meanLbs: 29.4, sdLbs: 6.2, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 30, ageMax: 39, sex: "male", meanLbs: 41.6, sdLbs: 8.3, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 30, ageMax: 39, sex: "female", meanLbs: 28.6, sdLbs: 6.0, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 40, ageMax: 49, sex: "male", meanLbs: 39.8, sdLbs: 8.0, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 40, ageMax: 49, sex: "female", meanLbs: 27.4, sdLbs: 5.8, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 50, ageMax: 59, sex: "male", meanLbs: 37.2, sdLbs: 7.6, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 50, ageMax: 59, sex: "female", meanLbs: 25.6, sdLbs: 5.4, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 60, ageMax: 69, sex: "male", meanLbs: 33.8, sdLbs: 7.1, source: "Mentiplay et al 2015" },
  { muscleGroup: "Ankle Dorsiflexion", bodyRegion: "Ankle", side: "bilateral", ageMin: 60, ageMax: 69, sex: "female", meanLbs: 23.2, sdLbs: 5.0, source: "Mentiplay et al 2015" },
];

/** Populates ForceLabNorm from forceLabNormData above — idempotent (a count check, not an
 *  upsert loop: this table has no natural unique key across muscleGroup/side/age/sex, so
 *  "already seeded" is judged by row count rather than per-row conflict resolution) and
 *  cheap enough (under 100 rows) to call defensively wherever a norm might be read, rather
 *  than requiring a separate one-time deploy step that's easy to forget in a fresh
 *  environment. See getNormativeData in app/actions/force-lab.ts, the only caller. */
export async function seedForceLabNorms(): Promise<void> {
  const existing = await prisma.forceLabNorm.count();
  if (existing > 0) return;
  await prisma.forceLabNorm.createMany({ data: forceLabNormData });
}
