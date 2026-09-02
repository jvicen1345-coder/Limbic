/** The consumer-side medical disclaimer, always visible (not dismissible), subtle but never
 *  hidden. Rendered across the Health & Wellness section — the hub, activity, nutrition,
 *  exercises, and the article index and detail pages.
 *
 *  It no longer names a single feature. It used to open "Limbic Vitals provides…", which was
 *  wrong twice over: Vitals was renamed Limbic Metrics, so it named a product a reader could
 *  no longer find, and it scoped the disclaimer to one feature while being rendered on pages
 *  that have nothing to do with it. A disclaimer that describes the wrong thing is weaker
 *  than one that describes the section it actually sits in. */
export function WellnessDisclaimer() {
  return (
    <div className="vitals-disclaimer">
      Limbic Health &amp; Wellness provides general wellness information only, not medical advice. Always consult your
      healthcare provider before starting any new exercise or nutrition program.
    </div>
  );
}
