import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import type { EvidenceLevel } from "@/lib/types";

/** Small pill on feed/card views (2-3 letter abbreviation, full label as a native-title
 *  tooltip). size="lg" spells out the full label at a bigger size; size="xl" is the
 *  article detail page's prominent hero badge (see .tag-xl.tag-evidence-* in globals.css)
 *  — back to the short abbreviation, just bigger and solid-filled instead of tinted, since
 *  the caption rendered under it (see ArticleReadingPane.tsx, reading
 *  EVIDENCE_LEVEL_META[level].description) already spells the level's full name out, and
 *  showing it twice back-to-back would just be noise. See lib/evidence.ts for the level ->
 *  label/color/description mapping this reads from. */
export function EvidenceBadge({ level, size = "sm" }: { level: EvidenceLevel; size?: "sm" | "lg" | "xl" }) {
  const meta = EVIDENCE_LEVEL_META[level];
  const sizeClass = size === "lg" ? " tag-lg" : size === "xl" ? " tag-xl" : "";
  return (
    <span className={`tag ${meta.className}${sizeClass}`} title={meta.label}>
      {size === "lg" ? meta.label : meta.shortLabel}
    </span>
  );
}
