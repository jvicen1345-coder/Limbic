import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPECIALTY_SLUG_TO_SPECIALTY, type SpecialtySlug } from "./specialty-content";
import { SPECIALTY_META } from "./meta";
import type { Specialty } from "./types";

/**
 * SPECIALTY_SLUG_TO_SPECIALTY exists purely so the Student Specialty Tracks (SpecialtySlug)
 * and Research/Wellness/Clips (Specialty) taxonomies can't silently drift apart again — that
 * drift previously shipped a "cardiopulmonary" track with no Specialty counterpart, so every
 * cardiopulmonary study classify() saw fell through to "ortho" (see classify.test.ts). The
 * `Record<SpecialtySlug, Specialty>` type already forces every SpecialtySlug to map to
 * *something* at compile time; these tests check the direction TypeScript can't.
 */

describe("SpecialtySlug <-> Specialty crosswalk", () => {
  it("maps every slug to a real, labeled Specialty", () => {
    for (const specialty of Object.values(SPECIALTY_SLUG_TO_SPECIALTY)) {
      assert.ok(SPECIALTY_META[specialty], `${specialty} has no SPECIALTY_META label`);
    }
  });

  it("makes every Specialty reachable from at least one SpecialtySlug", () => {
    const allSpecialties = Object.keys(SPECIALTY_META) as Specialty[];
    const reachable = new Set(Object.values(SPECIALTY_SLUG_TO_SPECIALTY));
    for (const specialty of allSpecialties) {
      assert.ok(reachable.has(specialty), `${specialty} has no SpecialtySlug mapping to it`);
    }
  });

  it("covers all six specialty tracks", () => {
    const slugs = (Object.keys(SPECIALTY_SLUG_TO_SPECIALTY) as SpecialtySlug[]).sort();
    assert.deepEqual(slugs, ["cardiopulmonary", "geriatrics", "musculoskeletal", "neurological", "pediatrics", "sports"].sort());
  });
});
