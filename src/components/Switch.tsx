"use client";

/** A generic on/off pill switch — no existing precedent in this app before the Get the App
 *  card's dismiss control (see GetTheAppCard.tsx), which is what it was built for, but kept
 *  generic (no Get-the-App-specific naming/logic) so any later toggle can reuse it instead
 *  of the plain checkbox HomeWidgetToggle.tsx uses. A real <button role="switch"> rather
 *  than a styled checkbox — simpler to make accessible correctly, and avoids fighting the
 *  browser's own checkbox appearance. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  /** Accessible name — this control has no visible text of its own, so callers must supply
   *  one (e.g. "Hide these instructions") rather than relying on nearby prose. */
  label: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={onChange}>
      <span className="switch-thumb" />
    </button>
  );
}
