/** A small pill marking a Founding Funder — fixed dark/gold styling regardless of the app's
 *  light/dark theme (a deliberate one-off "special" look, not themed via the usual
 *  --color-* tokens). Pass `number` for the full "Founding Funder No. {n}" version (Profile);
 *  omit it for the short "Founding Funder" version used everywhere else a name appears
 *  (Nexus feed, comments). */
export function FoundingFunderBadge({ number }: { number?: number | null }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#1a1a1a",
        border: "1px solid #c9853a",
        borderRadius: 999,
        padding: "3px 10px",
        color: "#c9853a",
        fontWeight: 600,
        fontSize: 11,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {number != null ? `Founding Funder No. ${number}` : "Founding Funder"}
    </span>
  );
}
