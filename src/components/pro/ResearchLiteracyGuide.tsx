import { RESEARCH_LITERACY_SECTIONS } from "@/lib/research-literacy-content";

/** A plain expandable reference guide, not a lookup table like GuidelinesLibrary/special
 *  tests — this is explanatory content meant to be read topic by topic, so `<details>/
 *  <summary>` (same accessible, no-JS-required accordion already used for a calculator's
 *  "What does this mean?" — see HrvCalculatorCard.tsx) fits better than a filterable card
 *  grid. */
export function ResearchLiteracyGuide() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {RESEARCH_LITERACY_SECTIONS.map((section) => (
        <div key={section.id}>
          <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{section.title}</h2>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px", maxWidth: 640 }}>{section.intro}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {section.topics.map((topic) => (
              <details key={topic.title} className="card elev-sm research-literacy-topic">
                <summary className="research-literacy-topic-summary">{topic.title}</summary>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {topic.body.map((paragraph, i) => (
                    <p key={i} style={{ fontSize: 13.5, color: "var(--color-neutral-700)", margin: 0, lineHeight: 1.6 }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
