import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { MovementLabBrowser } from "@/components/movement-lab/MovementLabBrowser";
import { MOVEMENT_LAB_TOTAL, MOVEMENT_PROTOCOLS } from "@/lib/movement-lab";

export const metadata: Metadata = {
  title: "Limbic Movement Lab",
  description:
    "A searchable bank of therapeutic exercises and phased rehabilitation protocols — setup, technique, dosage, patient cueing and precautions for every entry.",
};

/**
 * The Movement Lab's own destination, alongside Limbic Atlas (/atlas) and Limbic Agent
 * (/agent) rather than nested under /pro/* — it is a named surface, not one more entry in
 * the clinical toolbox.
 *
 * Free to any signed-in user, the same as the other clinical reference tools (Special Tests,
 * Guidelines, Lab Values — see lib/session.ts's note on hasClinicalReferenceAccess and what
 * it no longer gates). It's reference content, not a practice tool; the HEP Builder it feeds
 * keeps its own hasLicenseAccess gate, which is where the clinician-only line actually sits.
 */
export default async function MovementLabPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Movement Lab</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 6px", maxWidth: 680 }}>
        {MOVEMENT_LAB_TOTAL} therapeutic exercises and {MOVEMENT_PROTOCOLS.length} phased protocols. Every entry carries
        its setup, technique, typical dosage, patient-facing cue, common errors, regression and progression, and its
        precautions. Send anything here straight to the HEP Builder.
      </p>
      <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "0 0 18px", maxWidth: 680 }}>
        Dosages are typical starting ranges, not prescriptions — this patient&rsquo;s presentation and the treating
        surgeon&rsquo;s or clinician&rsquo;s own protocol override everything here.
      </p>

      <MovementLabBrowser />
    </div>
  );
}
