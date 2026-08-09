/** Shared between /wellness/metrics and /wellness/nutrition — same wording on both per
 *  spec, always visible (not dismissible), subtle but never hidden. */
export function WellnessDisclaimer() {
  return (
    <div className="vitals-disclaimer">
      Limbic Vitals provides general wellness information only — not medical advice. Always consult your healthcare provider before
      starting any new exercise or nutrition program.
    </div>
  );
}
