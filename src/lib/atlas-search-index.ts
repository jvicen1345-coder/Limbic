/**
 * Static, build-time search index for Limbic Atlas (see components/atlas/AtlasClient.tsx's
 * search bar and app/(app)/atlas/page.tsx). Derived programmatically from ATLAS_CONTENT
 * (lib/atlas-content.ts) rather than hand-transcribed, so the index can never drift out of
 * sync with the real region/muscle/condition/test/pearl content — every entry's `regionId`
 * is one of the real zone ids used by the interactive body map (see
 * lib/atlas-regions.ts/components/atlas/AtlasBodyMap.tsx), never an invented id.
 *
 * Outcome measures are intentionally not indexed here — search covers regions, muscles,
 * conditions, special tests, nerves/root levels, and board pearls only.
 */

import { ATLAS_CONTENT } from "@/lib/atlas-content";

export type AtlasSearchEntryType = "region" | "muscle" | "condition" | "test" | "nerve" | "board_pearl";

export interface AtlasSearchEntry {
  type: AtlasSearchEntryType;
  label: string;
  regionId: string;
  regionName: string;
  sectionAnchor: string;
}

/** Splits a nerve-root-level field (e.g. "C3-C8", "C2-C3", "L4-S1") into its individual
 *  level tokens (e.g. "C3-C8" -> C3..C8). A field can list more than one range/level
 *  separated by a comma or " and " (e.g. compound roots) — each segment is parsed
 *  independently. Segments that aren't a recognizable level token (e.g. a plain nerve name
 *  that happens to share the field with a level) are skipped here; the raw field is indexed
 *  separately as a whole "named nerve" entry regardless. */
function parseRootLevelTokens(raw: string): string[] {
  const tokens: string[] = [];
  const segments = raw.split(/,| and /i).map((s) => s.trim()).filter(Boolean);
  for (const segment of segments) {
    const range = segment.match(/^([CTLS])(\d{1,2})\s*-\s*([CTLS])?(\d{1,2})$/i);
    if (range) {
      const [, letter1, num1, letter2, num2] = range;
      const startLetter = letter1.toUpperCase();
      const endLetter = (letter2 || letter1).toUpperCase();
      if (startLetter === endLetter) {
        const start = parseInt(num1, 10);
        const end = parseInt(num2, 10);
        for (let n = start; n <= end; n++) tokens.push(`${startLetter}${n}`);
      } else {
        tokens.push(`${startLetter}${num1}`);
        tokens.push(`${endLetter}${num2}`);
      }
      continue;
    }
    const single = segment.match(/^([CTLS])(\d{1,2})$/i);
    if (single) tokens.push(segment.toUpperCase());
  }
  return tokens;
}

function buildIndex(): AtlasSearchEntry[] {
  const entries: AtlasSearchEntry[] = [];

  for (const [regionId, zone] of Object.entries(ATLAS_CONTENT)) {
    entries.push({ type: "region", label: zone.name, regionId, regionName: zone.name, sectionAnchor: "muscles" });

    const nerveLabels = new Set<string>();

    for (const muscle of zone.keyMuscles) {
      entries.push({ type: "muscle", label: muscle.name, regionId, regionName: zone.name, sectionAnchor: "muscles" });
      if (muscle.nerve) nerveLabels.add(muscle.nerve);
      if (muscle.rootLevel) for (const token of parseRootLevelTokens(muscle.rootLevel)) nerveLabels.add(token);
    }

    for (const nerveLabel of nerveLabels) {
      entries.push({ type: "nerve", label: nerveLabel, regionId, regionName: zone.name, sectionAnchor: "muscles" });
    }

    for (const condition of zone.commonConditions) {
      entries.push({ type: "condition", label: condition.name, regionId, regionName: zone.name, sectionAnchor: "conditions" });
    }

    for (const test of zone.specialTests) {
      entries.push({ type: "test", label: test.name, regionId, regionName: zone.name, sectionAnchor: "special-tests" });
    }

    for (const pearl of zone.boardPearls) {
      entries.push({ type: "board_pearl", label: pearl, regionId, regionName: zone.name, sectionAnchor: "board-pearls" });
    }
  }

  return entries;
}

export const ATLAS_SEARCH_INDEX: AtlasSearchEntry[] = buildIndex();
