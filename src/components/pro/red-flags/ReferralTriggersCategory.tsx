import { ChevronRightIcon } from "@/components/icons";

const SECTIONS: { heading: string; items: string[] }[] = [
  {
    heading: "When to refer to physician",
    items: [
      "Symptoms fail to improve or worsen after 4-6 weeks of conservative care",
      "New or worsening red flags identified during an episode of care",
      "Suspected condition outside the scope of physical therapy practice",
    ],
  },
  {
    heading: "When to refer to emergency department",
    items: [
      "Cauda equina red flags, see Clinical Decision Rules",
      "Signs of acute cardiovascular or neurological emergency",
      "Suspected fracture with significant trauma or deformity",
    ],
  },
  {
    heading: "When to refer to specialist",
    items: [
      "Findings consistent with a specific specialty's scope, orthopedic surgery, neurology, rheumatology",
      "Diagnostic uncertainty after a full examination",
      "Condition not responding to a full course of appropriate physical therapy",
    ],
  },
  {
    heading: "Documentation language for referral",
    items: [
      "State the specific finding(s) prompting referral, not just \"red flags present\"",
      "Note the urgency, routine, urgent, or emergent",
      "Document the referral was communicated to the patient and, when applicable, to the referring provider",
    ],
  },
];

/** Reference-only accordion, not interactive, unlike the other five red-flag categories
 *  (see RedFlagCategory.tsx) — this one is guidance text, not a checklist to score. */
export function ReferralTriggersCategory() {
  return (
    <details className="card elev-sm">
      <summary className="pro-accordion-summary">
        <div>Referral Triggers</div>
        <ChevronRightIcon size={16} className="pro-accordion-chevron" />
      </summary>
      <div className="pro-accordion-content">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{section.heading}</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {section.items.map((item) => (
                <li key={item} style={{ fontSize: 13, color: "var(--color-text)" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
