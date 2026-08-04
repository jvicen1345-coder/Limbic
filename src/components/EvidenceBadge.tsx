import { EVIDENCE_LEVEL_META } from "@/lib/evidence";
import type { EvidenceLevel } from "@/lib/types";

/** Small pill on feed/card views (2-3 letter abbreviation, full label as a native-title
 *  tooltip); pass size="lg" for the article detail page's larger, full-label badge — see
 *  lib/evidence.ts for the level -> label/color/description mapping this reads from. */
export function EvidenceBadge({ level, size = "sm" }: { level: EvidenceLevel; size?: "sm" | "lg" }) {
  const meta = EVIDENCE_LEVEL_META[level];
  return (
    <span className={`tag ${meta.className}${size === "lg" ? " tag-lg" : ""}`} title={meta.label}>
      {size === "lg" ? meta.label : meta.shortLabel}
    </span>
  );
}
